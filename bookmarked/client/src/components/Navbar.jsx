import { Link } from "react-router-dom";
import LoginImage from "../assets/images/login-icon.png";
import LogoutImage from "../assets/images/logout-icon.png";
import "../style/Navbar.css";

function Navbar({ user }) {

  const API_BASE_URL = 'http://localhost:3000';

  return (
    <nav>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/shelves">Shelves</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>

      <div className="nav-links">
        {!user ? (
        <img 
          className="icon-image"
          src={LoginImage} 
          alt="Login"
          onClick={() => window.location.href = `${API_BASE_URL}/auth/google`}
        />
      ) : (
        <img 
          className="icon-image"
          src={LogoutImage} 
          alt="Logout"
          onClick={() => window.location.href = `${API_BASE_URL}/auth/logout`}
        />
      )}
      </div>

    </nav>
  );
}

export default Navbar;