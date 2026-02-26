import { useState } from "react";
import { Link } from "react-router-dom";

function MenuModal() {

  const [open, setOpen] = useState(false);

  const toggleMenu = () => {
    setOpen(prev => !prev);
  };

  return (
    <>
      <button
        className={`burger ${open ? "is-open" : ""}`}
        aria-expanded={open}
        onClick={toggleMenu}
      >
        <span className="burger__line"></span>
        <span className="burger__line"></span>
        <span className="burger__line"></span>
      </button>

      <nav className={`overlay ${open ? "show" : ""}`}>
        <ul className="menu">
          <li>
            <Link to="/about" onClick={toggleMenu}>
              about the superstudio
            </Link>
          </li>

          <li>
            <Link to="/" onClick={toggleMenu}>
              student work
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default MenuModal;