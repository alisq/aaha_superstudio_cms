
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer>
            <ul className="menu">
          <li>
            <Link to="/about">
              about the superstudio
            </Link>
          </li>

          <li>
            <Link to="/">
              student work
            </Link>
          </li>
        </ul>
        </footer>
    )
}

export default Footer;