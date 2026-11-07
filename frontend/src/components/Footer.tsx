
import "./Footer.css";

const puneSearches = [
  { label: "Restaurants in Pune", category: "RESTUARANTS" },
  { label: "Cafes in Pune", category: "cafes" },
  { label: "Hospitals in Pune", category: "hospitals" },
  { label: "Hotels in Pune", category: "hotels" },
  { label: "ATMs in Pune", category: "atms" },
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
          <a href="/search?city=Pune&category=restaurants">
            Food & Dining
          </a>
          <a href="/search?city=Pune&category=cafes">
            Cafes & Coffee
          </a>
          <a href="/search?city=Pune&category=hospitals">
            Healthcare
          </a>
          <a href="/search?city=Pune&category=hotels">
            Hotels & Stays
          </a>
        </div>

        <div className="footer-column">
          <h3>GeoFind</h3>
          <a href="/about">About Us</a>
          <a href="/about#how-it-works">How It Works</a>
          <a
            href="https://github.com/"
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
