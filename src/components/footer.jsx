
import { Link } from "react-router-dom";

function Footer() {
    const scrollToTop = () => {
        // Defer until after navigation renders the new route
        setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }), 0);
    };

    return (
        <footer id="site-footer">
          <div className="footer-left">
           <div className="half-column">
            <h2>End Housing Alienation Now!</h2>
            We are <a href="https://aaha.ca/" target="_blank" rel="noreferrer noopener">Architects Against Housing Alienation</a>  and we believe the current housing system in Canada must be abolished!
        </div>
            <ul className="footer-menu">
          <li>
            <Link to="/about" onClick={scrollToTop}>
              about the superstudio
            </Link>
          </li>

          <li>
            <Link to="/" onClick={scrollToTop}>
              student work
            </Link>
          </li>
        </ul>
          </div>
          
          <div className="footer-right">
            <h2><a href="mailto:info@aaha.ca">info@aaha.ca</a></h2>
            <div className="social-links">
            <a
              className="social-link"
              href="https://www.instagram.com/aaha.ca/"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
            >
              <i className="fa-brands fa-instagram" aria-hidden="true"></i>
            </a>
            <a
              className="social-link"
              href="https://www.tiktok.com/@aaha.ca"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="TikTok"
            >
              <i className="fa-brands fa-tiktok" aria-hidden="true"></i>
            </a>
            </div>

            <div className="half-column">
              <p>End Housing Alienation Now is generously supported by:</p>
              <a href="https://study-architecture.ca/" target="_blank" rel="noreferrer noopener"><img src="files/logos/CCUSA_CCEUA_Logo.png" alt="Canadian Council of University Schools of Architecture" /></a>
            </div>
          </div>
        </footer>
    );
}

export default Footer;