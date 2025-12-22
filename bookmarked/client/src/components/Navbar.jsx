import { Link } from "react-router-dom";

function Navbar({ user }) {

  const API_BASE_URL = 'http://localhost:3000';

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px' }}>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/search">Search</Link>
      <Link to="/shelves">Shelves</Link>
      <Link to="/dashboard">Dashboard</Link>

      {user && user.role === 'admin' && (
        <Link to="/admin" style={{ color: 'red', fontWeight: 'bold' }}>
          Admin Panel
        </Link>
      )}

      {!user ? (
        <button 
          onClick={() => window.location.href = `${API_BASE_URL}/auth/google`}
          style={buttonStyle}
        >
          Login with Google
        </button>
      ) : (
        <button 
          onClick={() => window.location.href = `${API_BASE_URL}/auth/logout`}
          style={{ ...buttonStyle, backgroundColor: '#555' }} // Grey for logout
        >
          Logout
        </button>
      )}
    </nav>
  );
}

const buttonStyle = {
  backgroundColor: '#4285F4',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginLeft: 'auto' 
};

export default Navbar;