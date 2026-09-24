window.APP_CONFIG = {
    // API URL will be set based on environment
    // For local development: http://localhost:5000
    // For production (Render.com): https://iron-shears-api.onrender.com
    apiUrl: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://iron-shears-api.onrender.com',
    brand: {
        name: "The Iron Shears",
        tag: "Est. 2014",
        address: "1422 Market Street, Suite 200, San Francisco, CA 94103",
        phone: "(415) 555-0142",
        email: "book@theironshears.com",
        hours: {
            "Mon-Fri": "9am - 8pm",
            "Sat": "9am - 6pm",
            "Sun": "11am - 4pm"
        }
    }
};