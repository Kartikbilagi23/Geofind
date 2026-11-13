
import "./Footer.css";

const puneSearches = [
  { label: "Restaurants in Pune", category: "RESTAURANT" },
  { label: "Cafes in Pune", category: "CAFE" },
  { label: "Hospitals in Pune", category: "HOSPITAL" },
  { label: "Hotels in Pune", category: "HOTEL" },
  { label: "ATMs in Pune", category: "ATM" },
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">

        <div className="footer-brand">
          <a href="/" className="footer-logo">
            <span className="footer-logo-icon">G</span>
            GeoFind<span className="logo-dot">.</span>
          </a>
          <p>
            Discover places around you.
            Find the right place, wherever you go.
          </p>
        </div>

        <div className="footer-column">
          <h3>Popular in Pune</h3>

          {puneSearches.map((item) => (
            <a
              key={item.category}
              href={`/search?city=Pune&category=${item.category}`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="footer-column">
          <h3>Explore</h3>
          <a href="/search?city=Pune&category=RESTAURANT">
            Food & Dining
          </a>
          <a href="/search?city=Pune&category=CAFE">
            Cafes & Coffee
          </a>
          <a href="/search?city=Pune&category=HOSPITAL">
            Healthcare
          </a>
          <a href="/search?city=Pune&category=HOTEL">
            Hotels & Stays
          </a>
        </div>

        <div className="footer-column">
          <h3>GeoFind</h3>
          <a href="/about">About Us</a>
          <a href="/about#how-it-works">How It Works</a>
          <a
            href="https://github.com/Kartikbilagi23/Geofind"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a href="/contact">Contact</a>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} GeoFind. All rights reserved.
        </p>
        <p>
          Built for explorers <span>♥</span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
