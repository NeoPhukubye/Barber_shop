"""Generate HTML pages for The Iron Shears barber shop."""
import os

FRONTEND = "/home/neophukubye/Barber_shop/frontend"

H = '''  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/header-footer.css">
  <link rel="stylesheet" href="css/hero.css">
  <link rel="stylesheet" href="css/services.css">
  <link rel="stylesheet" href="css/about.css">
  <link rel="stylesheet" href="css/booking-contact.css">
  <link rel="stylesheet" href="css/index.css">
  <link rel="icon" href="images/logo.svg" type="image/svg+xml">
'''

NAV = '''      <nav>
        <ul class="nav-links">
          <li><a href="index.html">Home</a></li>
          <li><a href="services.html">Services</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="booking.html">Booking</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </nav>'''

FT = '''  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="brand">
            <img src="images/logo.svg" alt="The Iron Shears" class="brand-logo">
            <div><div class="brand-name">The Iron Shears</div><div class="brand-tag">Est. 2014</div></div>
          </a>
          <p>Where precision meets tradition. A classic barber shop offering timeless cuts and modern style in the heart of the city.</p>
          <div class="footer-socials"><a href="#" aria-label="Instagram">IG</a><a href="#" aria-label="Facebook">FB</a><a href="#" aria-label="TikTok">TK</a></div>
        </div>
        <div><h4>Navigation</h4><ul><li><a href="index.html">Home</a></li><li><a href="services.html">Services</a></li><li><a href="about.html">About</a></li><li><a href="booking.html">Booking</a></li><li><a href="contact.html">Contact</a></li></ul></div>
        <div><h4>Services</h4><ul><li><a href="services.html#haircuts">Haircuts</a></li><li><a href="services.html#grooming">Beard & Grooming</a></li><li><a href="services.html#packages">Packages</a></li><li><a href="services.html#kids">Kids Cuts</a></li></ul></div>
        <div><h4>Contact</h4><div class="contact-details"><div class="item"><div class="icon">P</div><div><h4>Address</h4><p>1422 Market Street, Suite 200, San Francisco, CA 94103</p></div></div><div class="item"><div class="icon">T</div><div><h4>Phone</h4><p><a href="tel:4155550142">(415) 555-0142</a></p></div></div><div class="item"><div class="icon">E</div><div><h4>Email</h4><p><a href="mailto:book@theironshears.com">book@theironshears.com</a></p></div></div></div></div></div>
      </div>
      <div class="footer-bottom"><span>&copy; 2026 The Iron Shears. All rights reserved.</span><span><a href="terms.html">Terms &amp; Conditions</a> · <a href="privacy.html">Privacy Policy</a> · <a href="booking.html">Book Now</a></span></div>
    </div>
  </footer>
'''

def nav(active):
    out = NAV
    for pid, href, lbl in [("home","index.html","Home"),("services","services.html","Services"),("about","about.html","About"),("booking","booking.html","Booking"),("contact","contact.html","Contact")]:
        cls = ' class="active"' if active == pid else ''
        out = out.replace(f'href="{href}">{lbl}', f'href="{href}"{cls}>{lbl}')
    return out

def pg(title, body, active=""):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="The Iron Shears - classic barber shop in San Francisco.">
{H}
</head>
<body>
  <div class="promo-banner"><span>First visit? Get <strong>20% off</strong> your first service. Use code <strong>WELCOME20</strong> at booking.</span></div>
  <header class="header" id="header">
    <div class="container nav">
      <a href="index.html" class="brand"><img src="images/logo.svg" alt="The Iron Shears logo" class="brand-logo"><div><div class="brand-name">The Iron Shears</div><div class="brand-tag">Est. 2014</div></div></a>
      {nav(active)}
      <div class="nav-cta"><a href="booking.html" class="book-btn">Book Now</a><button class="menu-toggle" id="menuToggle" aria-label="Toggle menu"><span></span><span></span><span></span></button></div>
    </div>
    <div class="mobile-menu" id="mobileMenu"><a href="index.html">Home</a><a href="services.html">Services</a><a href="about.html">About</a><a href="booking.html">Booking</a><a href="contact.html">Contact</a><a href="booking.html" class="book-btn">Book Now</a></div>
  </header>
{body}
{FT}
  <script src="js/main.js"></script>
</body>
</html>'''

print("generator ready")