import { Link } from 'react-router-dom';
import MenuModal from './menuModal';


function Header() {
    return (
        <>
        <MenuModal />
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
         <header className="mobile-header">
      <h1>END HOUSING<br />ALIENATION<br />NOW!</h1>
      <h2>a cross-Canada<br /> architecture <br />superstudio</h2>
      <h4>September 2025-<br />May 2026</h4>
    </header>
        </>
    )
}

export default Header;