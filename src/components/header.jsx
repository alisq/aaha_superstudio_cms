import { Link } from 'react-router-dom';


function Header() {
    return (
        <header>
            <div className="header-left">
                <h1><Link to="/">END HOUSING<br />ALIENATION<br />NOW!</Link></h1></div>
            <div className="header-right">
            <h2 className="site-subtitle">
                <div className="date-title">September 2025-<br />
                May 2026</div>
            a cross-Canada<br />architecture<br />superstudio</h2>            
            </div>
            
            
        </header>
    )
}

export default Header;