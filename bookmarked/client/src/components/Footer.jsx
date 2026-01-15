import { Link, useLocation } from "react-router-dom"; // 1. Added useLocation
import FooterImage from "../assets/images/footer-asset.png";
import "../style/Footer.css";

function Footer() {
    const location = useLocation(); // 2. Get current URL path

    // 3. If on create-profile, return null (renders nothing)
    if (location.pathname === '/create-profile') {
        return null;
    }

    return (
    <footer className="footer">
        <img src={FooterImage} alt="Design" />
        <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/search">Search</Link>
            <Link to="/shelves">Shelves</Link>
            <Link to="/dashboard">Dashboard</Link>
        </div>
        <img src={FooterImage} alt="Design" />
        <h3>BOOKMARKED</h3>
        <p>© 2025 Bookmarked. All rights reserved.</p>
        <p>Made by Eana Mae Tagana</p>
    </footer>
    );
}

export default Footer;