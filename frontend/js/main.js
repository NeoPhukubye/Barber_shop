(function () {
    "use strict";

    var config = window.APP_CONFIG;
    var api = config.apiUrl;

    /* ------------------------------------------------------------------ */
    /*  Mobile menu toggle                                                */
    /* ------------------------------------------------------------------ */
    function initMobileMenu() {
        var toggle = document.getElementById("menuToggle");
        var menu = document.getElementById("mobileMenu");
        if (!toggle || !menu) return;
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
            toggle.classList.toggle("active");
        });
        var links = menu.querySelectorAll("a");
        links.forEach(function (l) {
            l.addEventListener("click", function () {
                menu.classList.remove("open");
                toggle.classList.remove("active");
            });
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Header scroll shadow                                              */
    /* ------------------------------------------------------------------ */
    function initHeaderScroll() {
        var header = document.getElementById("header");
        if (!header) return;
        function onScroll() {
            if (window.scrollY > 30) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }
        window.addEventListener("scroll", onScroll);
        onScroll();
    }

    /* ------------------------------------------------------------------ */
    /*  Popup / modal                                                     */
    /* ------------------------------------------------------------------ */
    function initPopup() {
        var overlay = document.getElementById("popupOverlay");
        if (!overlay) return;

        var shouldShow = !localStorage.getItem("popupDismissed");
        var promoBanner = document.querySelector(".promo-banner");
        if (promoBanner && promoBanner.style.display !== "none") {
            shouldShow = true;
        }

        function show() {
            overlay.classList.add("show");
            document.body.style.overflow = "hidden";
            var btn = overlay.querySelector(".popup-cta");
            if (btn) {
                btn.addEventListener("click", function () {
                    location.href = "booking.html";
                });
            }
        }

        function hide() {
            overlay.classList.remove("show");
            document.body.style.overflow = "";
            localStorage.setItem("popupDismissed", "1");
        }

        // Show popup shortly after page load
        setTimeout(function () {
            if (localStorage.getItem("popupDismissed")) return;
            show();
        }, 800);

        var closeBtn = overlay.querySelector(".popup-close");
        if (closeBtn) {
            closeBtn.addEventListener("click", hide);
        }

        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) hide();
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Booking form                                                      */
    /* ------------------------------------------------------------------ */
    function apiFetch(path) {
        return fetch(api + path, { headers: { Accept: "application/json" } })
            .then(function (r) { return r.json(); });
    }

    function apiPost(path, body) {
        return fetch(api + path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(body)
        }).then(function (r) { return r.json(); });
    }

    function formatPrice(n) {
        return "$" + n;
    }

    /* ------------------------------------------------------------------ */
    /*  Booking wizard                                                    */
    /* ------------------------------------------------------------------ */
    function initBooking() {
        var el = document.getElementById("bookingRoot");
        if (!el) return;

        el.innerHTML = "";

        var template = document.getElementById("bookingTemplate");
        if (!template) {
            console.error("booking template not found");
            return;
        }
        var html = template.innerHTML;

        /*
         * The booking form has 4 steps:
         *  1. Service choice
         *  2. Date & time
         *  3. Customer details
         *  4. Confirmation + calendar
         */
        var state = {
            service: null,
            barber: "any",
            date: null,
            time: null,
            name: "",
            email: "",
            phone: ""
        };

        var services = [];
        var barbers = [];

        /* --- render helpers --- */

        function createEl(tag, cls, text) {
            var e = document.createElement(tag);
            if (cls) e.className = cls;
            if (text) e.textContent = text;
            return e;
        }

        function renderStep1() {
            var wrap = createEl("div", "step");
            var title = createEl("h3", null, "Choose a Service");
            var subtitle = createEl("p", "step-subtitle", "Select the service you'd like to book and your preferred barber.");
            wrap.appendChild(title);
            wrap.appendChild(subtitle);

            var grid = createEl("div", "service-options");
            services.forEach(function (svc) {
                var card = createEl("div", "service-option-card");
                card.dataset.id = svc.id;
                if (state.service && state.service.id === svc.id) card.classList.add("selected");
                card.innerHTML =
                    '<div class="svc-name">' + svc.name + '</div>' +
                    '<div class="svc-desc">' + svc.category + '</div>' +
                    '<div class="svc-price">' + formatPrice(svc.price) + '</div>' +
                    '<div class="svc-duration">' + svc.duration + ' min</div>';
                card.addEventListener("click", function () {
                    state.service = svc;
                    var cards = wrap.querySelectorAll(".service-option-card");
                    cards.forEach(function (c) { c.classList.remove("selected"); });
                    card.classList.add("selected");
                });
                grid.appendChild(card);
            });
            wrap.appendChild(grid);

            var barberRow = createEl("div", "barber-select-row");
            barberRow.innerHTML =
                '<label for="barberSelect">Preferred Barber</label>' +
                '<select id="barberSelect">';
            barbers.forEach(function (b) {
                var opt = document.createElement("option");
                opt.value = b.id;
                opt.textContent = b.name;
                if (state.barber === b.id) opt.selected = true;
                barberRow.querySelector("select").appendChild(opt);
            });
            barberRow.querySelector("select").addEventListener("change", function (e) {
                state.barber = e.target.value;
            });
            wrap.appendChild(barberRow);

            var next = createEl("button", "btn nav-next", "Next: Choose Date & Time");
            next.disabled = true;
            next.type = "button";
            var checkNext = function () {
                if (state.service) { next.disabled = false; } else { next.disabled = true; }
            };
            grid.addEventListener("click", checkNext);
            next.addEventListener("click", function () {
                if (!state.service) return;
                renderStep2();
            });
            wrap.appendChild(next);

            return wrap;
        }

        var slotsEl = null;
        var dateInputEl = null;
        var timeMsgEl = null;

        function renderStep2() {
            var wrap = createEl("div", "step");
            var title = createEl("h3", null, "Select Date & Time");
            var subtitle = createEl("p", "step-subtitle", state.service.category + " • " + state.service.name + " • " + formatPrice(state.service.price) + " (" + state.service.duration + " min)");
            wrap.appendChild(title);
            wrap.appendChild(subtitle);

            var dateWrap = createEl("div", "date-row");
            dateWrap.innerHTML = '<label for="datePicker">Date</label><input type="date" id="datePicker">';
            dateInputEl = dateWrap.querySelector("#datePicker");
            var today = new Date();
            var maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
            dateInputEl.min = today.toISOString().split("T")[0];
            dateInputEl.max = maxDate.toISOString().split("T")[0];
            dateInputEl.value = dateInputEl.min;
            dateInputEl.addEventListener("change", function () {
                state.date = dateInputEl.value;
                state.time = null;
                loadSlots();
            });
            wrap.appendChild(dateWrap);

            timeMsgEl = createEl("p", "time-msg", "Select a date to see available time slots.");
            timeMsgEl.style.display = "none";
            timeMsgEl.textContent = "";
            wrap.appendChild(timeMsgEl);
            slotsEl = createEl("div", "slots-grid");
            wrap.appendChild(slotsEl);

            var navRow = createEl("div", "form-actions");
            var back = createEl("button", "btn btn-ghost", "Back");
            back.type = "button";
            back.addEventListener("click", renderStep1);
            var next = createEl("button", "btn nav-next", "Next: Your Details");
            next.disabled = true;
            next.type = "button";
            next.addEventListener("click", function () {
                if (!state.time) return;
                renderStep3();
            });
            navRow.appendChild(back);
            navRow.appendChild(next);
            wrap.appendChild(navRow);

            // trigger initial slot load
            setTimeout(function () {
                state.date = dateInputEl.value;
                loadSlots();
            }, 50);

            return wrap;
        }

        function loadSlots() {
            if (!state.date) return;
            timeMsgEl.style.display = "block";
            timeMsgEl.textContent = "Loading available slots...";
            slotsEl.innerHTML = "";
            apiFetch("/api/availability?date=" + state.date + "&barber=" + state.barber + "&service=" + (state.service ? state.service.id : "haircut"))
                .then(function (data) {
                    if (data.error) {
                        timeMsgEl.textContent = "No slots available for this date.";
                        return;
                    }
                    if (!data.slots || data.slots.length === 0) {
                        timeMsgEl.textContent = "No available slots for this date. Try another day.";
                        return;
                    }
                    timeMsgEl.style.display = "none";
                    data.slots.forEach(function (slot) {
                        var btn = createEl("button", "slot", slot);
                        btn.type = "button";
                        btn.dataset.time = slot;
                        if (state.time === slot) btn.classList.add("active");
                        btn.addEventListener("click", function () {
                            var actives = slotsEl.querySelectorAll(".slot");
                            actives.forEach(function (s) { s.classList.remove("active"); });
                            btn.classList.add("active");
                            state.time = slot;
                            updateNext2();
                        });
                        slotsEl.appendChild(btn);
                    });
                })
                .catch(function () {
                    timeMsgEl.textContent = "Could not load slots. Please try again.";
                });
        }

        function updateNext2() {
            var next = slotsEl.parentNode.querySelector(".nav-next");
            if (next) {
                next.disabled = !state.time;
            }
        }

        function renderStep3() {
            var wrap = createEl("div", "step");
            var title = createEl("h3", null, "Your Details");
            var subtitle = createEl("p", "step-subtitle", "Enter your contact information to secure the booking.");
            wrap.appendChild(title);
            wrap.appendChild(subtitle);

            var form = createEl("form", "customer-form");
            form.id = "customerForm";

            function mkInput(type, id, label, placeholder, required) {
                var g = createEl("div", "form-group");
                g.innerHTML =
                    '<label for="' + id + '">' + label + (required ? ' <span class="required">*</span>' + '</label>' +
                    '<input type="' + type + '" id="' + id + '" name="' + id + '" placeholder="' + placeholder + '"' + (required ? "required" : "") + '>';
                return g;
            }

            form.appendChild(mkInput("text", "custName", "Full Name", "John Smith", true));
            form.appendChild(mkInput("email", "custEmail", "Email Address", "john@example.com", true));
            form.appendChild(mkInput("tel", "custPhone", "Phone Number", "(415) 555-0000", false));

            // prefill from localStorage if available
            var prev = localStorage.getItem("bookingForm");
            if (prev) {
                try {
                    var pf = JSON.parse(prev);
                    if (pf.name) form.querySelector("#custName").value = pf.name;
                    if (pf.email) form.querySelector("#custEmail").value = pf.email;
                    if (pf.phone) form.querySelector("#custPhone").value = pf.phone;
                } catch (e) {}
            }

            wrap.appendChild(form);

            var summary = createEl("div", "booking-summary-small");
            summary.innerHTML =
                '<h4>Booking Summary</h4>' +
                '<div class="summary-line"><span>Service</span><span>' + state.service.name + '</span></div>' +
                '<div class="summary-line"><span>Barber</span><span>' + (state.barber === "any" ? "Any Available" : barbers.find(function (b) { return b.id === state.barber; }).name) + '</span></div>' +
                '<div class="summary-line"><span>Date</span><span>' + state.date + '</span></div>' +
                '<div class="summary-line"><span>Time</span><span>' + state.time + '</span></div>' +
                '<div class="summary-line summary-total"><span>Total</span><span>' + formatPrice(state.service.price) + '</span></div>';
            wrap.appendChild(summary);

            var navRow = createEl("div", "form-actions");
            var back = createEl("button", "btn btn-ghost", "Back");
            back.type = "button";
            back.addEventListener("click", renderStep2);
            var submit = createEl("button", "btn", "Confirm & Book");
            submit.type = "submit";
            navRow.appendChild(back);
            navRow.appendChild(submit);
            wrap.appendChild(navRow);

            form.addEventListener("submit", function (e) {
                e.preventDefault();
                var name = form.querySelector("#custName").value.trim();
                var email = form.querySelector("#custEmail").value.trim();
                var phone = form.querySelector("#custPhone").value.trim();
                if (!name || !email) {
                    var existing = document.querySelector(".form-error");
                    if (existing) existing.remove();
                    var err = createEl("div", "form-error", "Please fill in all required fields.");
                    form.appendChild(err);
                    return;
                }
                // save to localStorage
                localStorage.setItem("bookingForm", JSON.stringify({ name: name, email: email, phone: phone }));
                state.name = name;
                state.email = email;
                state.phone = phone;
                renderStep4();
            });

            return wrap;
        }

        function renderStep4() {
            var wrap = createEl("div", "step");
            var title = createEl("h3", "step-success", "Booking Confirmed!");
            var check = createEl("div", "check", "");
            check.innerHTML = "✓";
            var msg = createEl("p", null, "Your appointment has been booked. We've sent the details to your email.");
            var summary = createEl("div", "booking-summary-full");
            var barberName = state.barber === "any" ? "Any Available Barber" : barbers.find(function (b) { return b.id === state.barber; }).name;
            summary.innerHTML =
                '<h4>Appointment Details</h4>' +
                '<div class="summary-line"><span>Service</span><span>' + state.service.name + '</span></div>' +
                '<div class="summary-line"><span>Barber</span><span>' + barberName + '</span></div>' +
                '<div class="summary-line"><span>Date</span><span>' + state.date + '</span></div>' +
                '<div class="summary-line"><span>Time</span><span>' + state.time + '</span></div>' +
                '<div class="summary-line"><span>Duration</span><span>' + state.service.duration + ' min</span></div>' +
                '<div class="summary-line"><span>Price</span><span>' + formatPrice(state.service.price) + '</span></div>' +
                '<div class="summary-line"><span>Customer</span><span>' + state.name + '</span></div>' +
                '<div class="summary-line"><span>Contact</span><span>' + state.email + (state.phone ? ' / ' + state.phone : '') + '</span></div>';

            wrap.appendChild(title);
            wrap.appendChild(check);
            wrap.appendChild(msg);
            wrap.appendChild(summary);

            var calWrap = createEl("div", "calendar-section");
            calWrap.innerHTML = '<h4>Add to Calendar</h4>';
            var calLinks = createEl("div", "calendar-links");
            calLinks.innerHTML = '<a href="#" class="cal-link google-cal" id="googleCalLink">Google Calendar</a><a href="#" class="cal-link apple-cal" id="appleCalLink">Apple / Download .ics</a>';
            calWrap.appendChild(calLinks);

            var done = createEl("button", "btn", "Book Another Appointment");
            done.type = "button";
            done.style.marginTop = "24px";
            done.addEventListener("click", function () { state = { service: null, barber: "any", date: null, time: null, name: "", email: "", phone: "" }; el.innerHTML = ""; el.appendChild(renderStep1()); });

            wrap.appendChild(calWrap);
            wrap.appendChild(done);

            // Submit booking to API and get calendar links
            apiPost("/api/book", {
                service: state.service.id,
                barber: state.barber,
                date: state.date,
                time: state.time,
                name: state.name,
                email: state.email,
                phone: state.phone
            }).then(function (data) {
                if (data.success) {
                    var gLink = calLinks.querySelector("#googleCalLink");
                    var aLink = calLinks.querySelector("#appleCalLink");
                    if (gLink) gLink.href = data.calendar.google;
                    if (aLink) {
                        aLink.href = "#";
                        aLink.addEventListener("click", function (e) {
                            e.preventDefault();
                            downloadICS(data.calendar.ics, "iron-shears-appointment.ics");
                        });
                    }
                } else {
                    calLinks.innerHTML = "<p style='color:#c88'>Could not generate calendar links: " + (data.error || "unknown error") + "</p>";
                }
            }).catch(function (err) {
                // Fallback: still allow calendar creation from local state
                var start = parseDateTime(state.date, state.time);
                var end = new Date(start.getTime() + state.service.duration * 60000);
                var title = config.brand.name + " - " + state.service.name;
                var details = "Customer: " + state.name + "\nDate: " + state.date + "\nTime: " + state.time;
                var gUrl = buildGoogleCalUrl(start, end, title, details, config.brand.address);
                calLinks.querySelector("#googleCalLink").href = gUrl;
                calLinks.querySelector("#appleCalLink").addEventListener("click", function (e) {
                    e.preventDefault();
                    downloadICS(buildICS(start, end, title, details, config.brand.address), "iron-shears-appointment.ics");
                });
            });

            return wrap;
        }

        /* --- utility --- */
        function parseDateTime(dateStr, timeStr) {
            var parts = timeStr.split(":");
            var d = new Date(dateStr);
            d.setHours(parseInt(parts[0], 10), parseInt(parts[1] || "0", 10), 0, 0);
            return d;
        }

        function pad(n) { return n < 10 ? "0" + n : n; }

        function formatICSDate(d) {
            // Local time to UTC for iCalendar
            var utc = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
            return utc.getUTCFullYear().toString().padStart(4, "0") +
                pad(utc.getUTCMonth() + 1) +
                pad(utc.getUTCDate()) +
                "T" +
                pad(utc.getUTCHours()) +
                pad(utc.getUTCMinutes()) +
                pad(utc.getUTCSeconds()) +
                "Z";
        }

        function buildICS(start, end, title, details, location) {
            var uid = "iron-shears-" + Date.now() + "@theironshears.com";
            var dtstamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
            var lines = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//The Iron Shears//Booking//EN",
                "CALSCALE:GREGORIAN",
                "METHOD:PUBLISH",
                "BEGIN:VEVENT",
                "UID:" + uid,
                "DTSTAMP:" + dtstamp,
                "DTSTART:" + formatICSDate(start),
                "DTEND:" + formatICSDate(end),
                "SUMMARY:" + title,
                "DESCRIPTION:" + details.replace(/\n/g, "\\n"),
                "LOCATION:" + location,
                "END:VEVENT",
                "END:VCALENDAR"
            ];
            return lines.join("\n");
        }

        function downloadICS(content, filename) {
            var blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function buildGoogleCalUrl(start, end, title, details, location) {
            var dates = formatICSDate(start).replace("Z", "") + "/" + formatICSDate(end).replace("Z", "");
            var params = [
                "action=TEMPLATE",
                "text=" + encodeURIComponent(title),
                "dates=" + encodeURIComponent(dates),
                "details=" + encodeURIComponent(details),
                "location=" + encodeURIComponent(location)
            ];
            return "https://www.google.com/calendar/render?" + params.join("&");
        }

        /* --- bootstrap --- */
        function renderStep1Wrapper() {
            el.innerHTML = "";
            el.appendChild(renderStep1());
        }

        Promise.all([
            apiFetch("/api/services"),
            apiFetch("/api/barbers"),
            apiFetch("/api/brand")
        ]).then(function (results) {
            services = results[0];
            barbers = results[1];
            if (results[2] && results[2].name) {
                document.title = "Book Appointment - " + results[2].name;
            }
            renderStep1Wrapper();
        }).catch(function (err) {
            el.innerHTML = '<div class="step"><h3>Connection Error</h3><p>Unable to load booking data. Please check your connection and try again.</p></div>';
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Init                                                              */
    /* ------------------------------------------------------------------ */
    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initHeaderScroll();
        initPopup();
        initBooking();
    });

})();
