import { Link } from "react-router-dom";
import FooterImage from "../assets/images/footer-asset.png";
import "../style/Footer.css";

function Footer() {
    return (
    <footer className="footer">
        <img src={FooterImage} alt="Design" />
        <div className="footer-links">
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/shelves">Shelves</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/about">About</Link>
        </div>
        <img src={FooterImage} alt="Design" />
        <h3>BOOKMARKED</h3>
        <p>© 2025 Bookmarked. All rights reserved.</p>
        <p>Made by Eana Mae Tagana</p>
    </footer>
    );
}

export default Footer;
