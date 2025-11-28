import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/search">Search</Link>
      <Link to="/shelves">Shelves</Link>
      <Link to="/dashboard">Dashboard</Link>
      {/* Admin is hidden */}
    </nav>
  );
}

export default Navbar;

