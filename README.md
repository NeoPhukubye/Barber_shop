# The Iron Shears - Barber Shop Website

A complete, professional barber shop website with online booking, calendar integration, and responsive design.

## Overview

The Iron Shears is a fictional classic barber shop based in San Francisco. This project delivers a fully functional website with:
- Online appointment booking system
- Google Calendar and Apple Calendar integration
- Responsive design (desktop, tablet, mobile)
- Professional branding and imagery
- Complete Terms & Conditions
- Interactive popup modal for first-visit discounts

## Features

### Pages
- **Home** - Hero section, services preview, testimonials, CTA
- **Services** - Full service catalog with pricing (haircuts, fades, grooming, packages, kids)
- **About** - Shop story, barber profiles, statistics
- **Contact** - Contact form, map, business information
- **Booking** - Multi-step booking wizard
- **Terms & Conditions** - Complete legal page

### Booking System
- 4-step booking wizard (Service → Date/Time → Details → Confirmation)
- Real-time availability checking
- Double-booking prevention
- Calendar integration (Google Calendar + Apple Calendar/iCal)
- .ics file download for offline calendar use
- Customer information persistence (localStorage)

### Technical Features
- Mobile navigation with hamburger menu
- Sticky header with scroll shadow
- First-visit discount popup modal
- Promotional banner
- Social media links
- Opening hours display
- Complete footer with navigation and legal links

## Tech Stack

### Backend
- **Python Flask** - REST API
- **Flask-CORS** - Cross-origin support
- **Gunicorn** - Production WSGI server
- **Render.com** - Backend hosting

### Frontend
- **HTML5/CSS3** - Semantic markup and styling
- **JavaScript (Vanilla)** - Interactive features
- **Google Fonts** - Playfair Display (headings) + Inter (body)
- **GitHub Pages** - Frontend hosting
- **GitHub Actions** - Automated deployment

## Project Structure

```
Barber_shop/
├── backend/
│   ├── app.py              # Flask application with booking API
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── index.html          # Home page
│   ├── services.html       # Services page
│   ├── about.html          # About page
│   ├── contact.html        # Contact page
│   ├── booking.html        # Booking page
│   ├── terms.html          # Terms & Conditions
│   ├── css/                # Stylesheets
│   │   ├── base.css
│   │   ├── header-footer.css
│   │   ├── hero.css
│   │   ├── services.css
│   │   ├── about.css
│   │   ├── booking-contact.css
│   │   └── index.css
│   ├── js/                 # JavaScript
│   │   ├── config.js       # Configuration
│   │   └── main.js         # Main application logic
│   ├── images/             # Brand imagery
│   │   ├── logo.svg
│   │   ├── hero-bg.jpg
│   │   ├── barber-marcus.jpg
│   │   ├── barber-diego.jpg
│   │   ├── barber-any.jpg
│   │   └── about-interior.jpg
│   └── CNAME                # Custom domain (optional)
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml  # GitHub Actions deployment
├── render.yaml             # Render.com deployment config
├── gen.py                  # Utility script
└── test.txt                # Test file
```

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/health` - Health check
- `GET /api/brand` - Brand information
- `GET /api/services` - List of services
- `GET /api/barbers` - List of barbers
- `GET /api/availability` - Check available time slots
- `POST /api/book` - Create a new booking
- `POST /api/ics/download` - Download .ics calendar file

## Deployment

### Backend (Render.com)
1. Sign up at https://render.com
2. Click "New" → "Blueprint"
3. Enter repository: `NeoPhukubye/Barber_shop`
4. Render will automatically deploy using `render.yaml`

### Frontend (GitHub Pages)
The GitHub Actions workflow automatically deploys to GitHub Pages on each push to main. No manual setup required.

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
# Server runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
# Open index.html in a browser
# Or serve with any static file server
python -m http.server 8000
```

## Configuration

Update `frontend/js/config.js` with the correct API URL:

```javascript
window.APP_CONFIG = {
    apiUrl: "https://iron-shears-api.onrender.com",  // Your Render URL
    brand: {
        name: "The Iron Shears",
        // ... other brand details
    }
};
```

## Testing

To test the complete booking flow:
1. Navigate to the Booking page
2. Select a service (e.g., Classic Haircut)
3. Choose a preferred barber or "Any Available"
4. Select a date and available time slot
5. Enter your name, email, and phone
6. Confirm booking
7. Add appointment to Google Calendar or download .ics file

## Brand Identity

- **Shop Name**: The Iron Shears
- **Tagline**: Where Precision Meets Tradition
- **Established**: 2014
- **Location**: 1422 Market Street, Suite 200, San Francisco, CA 94103
- **Phone**: (415) 555-0142
- **Email**: book@theironshears.com

## Author

Neo Phukubye
nephujhb025@student.wethinkcode.co.za

## License

© 2026 The Iron Shears. All rights reserved.