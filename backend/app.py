from datetime import datetime, timedelta
from urllib.parse import quote
from io import StringIO

from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BRAND = {
    "name": "The Iron Shears",
    "address": "1422 Market Street, Suite 200, San Francisco, CA 94103",
    "phone": "(415) 555-0142",
    "email": "book@theironshears.com",
    "hours": {
        "Mon-Fri": "9am - 8pm",
        "Sat": "9am - 6pm",
        "Sun": "11am - 4pm",
    },
    "website": "https://theironshears.com",
}

SERVICES = [
    {"id": "haircut", "name": "Classic Haircut", "duration": 45, "price": 45, "category": "Haircuts"},
    {"id": "fade", "name": "Skin Fade", "duration": 50, "price": 55, "category": "Haircuts"},
    {"id": "beard", "name": "Beard Trim & Shape", "duration": 25, "price": 30, "category": "Grooming"},
    {"id": "hot-towel", "name": "Hot Towel Shave", "duration": 40, "price": 45, "category": "Grooming"},
    {"id": "package", "name": "The Full Gentleman", "duration": 75, "price": 95, "category": "Packages"},
    {"id": "kids", "name": "Kids Cut", "duration": 30, "price": 25, "category": "Haircuts"},
]

BARBERS = [
    {"id": "marcus", "name": "Marcus Bell", "bio": "Master barber with 18 years of experience. Specialises in classic taper fades and traditional hot-towel shaves.", "image": "barber-marcus.jpg"},
    {"id": "diego", "name": "Diego Santos", "bio": "Specialist in modern fades, texture work and contemporary styling. Certified colorist with an eye for detail.", "image": "barber-diego.jpg"},
    {"id": "any", "name": "Any Available Barber", "bio": "Our next available professional will give you the same meticulous attention to detail.", "image": "barber-any.jpg"},
]

# In-memory store of booked slots per barber per day.
# Structure: {barber_id: {date_str: [start_hour, ...]}}
BOOKINGS = {}


def _parse_dt(date_str, time_str):
    return datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")


def _format_ical(dt):
    return dt.strftime("%Y%m%dT%H%M%S")


def _add_minutes(dt, minutes):
    return dt + timedelta(minutes=minutes)


def _google_calendar_url(start, end, title, details, location):
    dates = f"{_format_ical(start)}/{_format_ical(end)}"
    params = {
        "action": "TEMPLATE",
        "text": title,
        "dates": dates,
        "details": details,
        "location": location,
    }
    query = "&".join(f"{k}={quote(str(v))}" for k, v in params.items())
    return f"https://www.google.com/calendar/render?{query}"


def _generate_ics(start, end, title, details, location):
    """Generate a proper .ics (iCalendar) file content for Apple Calendar and download."""
    uid = f"iron-shears-{start.strftime('%Y%m%d%H%M%S')}@theironshears.com"
    dtstamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//The Iron Shears//Booking//EN",
        "CALSCALE:GREGORIAN",
        f"METHOD:PUBLISH",
        f"BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{dtstamp}",
        f"DTSTART:{_format_ical(start)}",
        f"DTEND:{_format_ical(end)}",
        f"SUMMARY:{title}",
        f"DESCRIPTION:{details}",
        f"LOCATION:{location}",
        f"END:VEVENT",
        "END:VCALENDAR",
    ]
    return "\n".join(lines)


@app.route("/api/health", methods=["GET"])
def api_health():
    return jsonify({"status": "ok", "service": BRAND["name"]})


@app.route("/api/brand", methods=["GET"])
def api_brand():
    return jsonify(BRAND)


@app.route("/api/services", methods=["GET"])
def api_services():
    return jsonify(SERVICES)


@app.route("/api/barbers", methods=["GET"])
def api_barbers():
    return jsonify(BARBERS)


@app.route("/api/availability", methods=["GET"])
def api_availability():
    date_str = request.args.get("date")
    barber_id = request.args.get("barber", "any")
    service_id = request.args.get("service", "haircut")
    if not date_str:
        return jsonify({"error": "date required"}), 400
    service = next((s for s in SERVICES if s["id"] == service_id), None)
    if not service:
        service = SERVICES[0]
    booked = set(BOOKINGS.get(barber_id, {}).get(date_str, []))
    slots = []
    for hour in range(9, 20):
        if hour in booked:
            continue
        minute = hour % 3
        if minute != 0:
            continue
        slots.append(f"{hour:02d}:00")
    return jsonify({
        "date": date_str,
        "barber": barber_id,
        "service_id": service_id,
        "service_name": service["name"],
        "duration": service["duration"],
        "slots": slots,
    })


@app.route("/api/book", methods=["POST"])
def api_book():
    data = request.get_json(force=True, silent=True) or {}
    service_id = data.get("service")
    barber_id = data.get("barber", "any")
    date_str = data.get("date")
    time_str = data.get("time")
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone", "")

    service = next((s for s in SERVICES if s["id"] == service_id), None)
    if not service:
        return jsonify({"error": "invalid service"}), 400
    if not date_str or not time_str:
        return jsonify({"error": "date and time required"}), 400
    if not name or not email:
        return jsonify({"error": "name and email required"}), 400

    try:
        start = _parse_dt(date_str, time_str)
    except ValueError:
        return jsonify({"error": "invalid date or time"}), 400

    end = _add_minutes(start, service["duration"])
    duration = service["duration"]

    # Check for double booking.
    day = start.strftime("%Y-%m-%d")
    hour = start.hour
    booked_hours = BOOKINGS.get(barber_id, {}).get(day, [])
    if hour in booked_hours:
        return jsonify({"error": "time slot no longer available"}), 409

    # Record booking.
    BOOKINGS.setdefault(barber_id, {}).setdefault(day, []).append(hour)

    details = (
        f"{BRAND['name']} - {service['name']}\n"
        f"Customer: {name}\n"
        f"Email: {email}\n"
        f"Phone: {phone or 'N/A'}\n"
        f"Barber: {next((b['name'] for b in BARBERS if b['id'] == barber_id), barber_id)}\n"
        f"Date: {start.strftime('%B %d, %Y')}\n"
        f"Time: {start.strftime('%I:%M %p')} - {end.strftime('%I:%M %p')}\n"
        f"Duration: {duration} minutes\n"
        f"Price: ${service['price']}\n"
        f"Address: {BRAND['address']}"
    )

    title = f"{BRAND['name']} - {service['name']}"
    ics_content = _generate_ics(start, end, title, details, BRAND["address"])

    return jsonify({
        "success": True,
        "booking": {
            "service": service["name"],
            "price": service["price"],
            "duration": duration,
            "barber": barber_id,
            "date": date_str,
            "time": time_str,
            "start": _format_ical(start),
            "end": _format_ical(end),
            "customer": name,
            "email": email,
            "phone": phone,
            "location": BRAND["address"],
        },
        "calendar": {
            "google": _google_calendar_url(start, end, title, details, BRAND["address"]),
            "ics": ics_content,
        },
    })


@app.route("/api/ics/download", methods=["POST"])
def api_ics_download():
    """Generate an .ics file for a booking and return it as a downloadable attachment."""
    data = request.get_json(force=True, silent=True) or {}
    service = next((s for s in SERVICES if s["id"] == data.get("service")), None)
    if not service:
        return jsonify({"error": "invalid service"}), 400
    start = _parse_dt(data["date"], data["time"])
    end = _add_minutes(start, service["duration"])
    details = f"{BRAND['name']} - {service['name']}\nCustomer: {data.get('name')}\nEmail: {data.get('email')}"
    title = f"{BRAND['name']} - {service['name']}"
    ics = _generate_ics(start, end, title, details, BRAND["address"])
    buf = StringIO(ics)
    buf.seek(0)
    return send_file(
        buf,
        mimetype="text/calendar",
        as_attachment=True,
        download_name="iron-shears-appointment.ics",
    )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
