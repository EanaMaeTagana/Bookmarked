import { Link } from "react-router-dom";

// 👇 IMPORTANT: We accept { user } as a prop here
function Navbar({ user }) {
  
  // ⚠️ CHANGE THIS TO 3000 IF YOUR SERVER IS ON PORT 3000
  const API_BASE_URL = 'http://localhost:3000';

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px' }}>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/search">Search</Link>
      <Link to="/shelves">Shelves</Link>
      <Link to="/dashboard">Dashboard</Link>

      {/* 🔒 ADMIN LINK: Only visible if user exists AND is admin */}
      {user && user.role === 'admin' && (
        <Link to="/admin" style={{ color: 'red', fontWeight: 'bold' }}>
          Admin Panel
        </Link>
      )}

      {/* 🔑 AUTH BUTTON: Toggles based on login status */}
      {!user ? (
        // IF NOT LOGGED IN -> Show Login Button
        <button 
          onClick={() => window.location.href = `${API_BASE_URL}/auth/google`}
          style={buttonStyle}
        >
          Login with Google
        </button>
      ) : (
        // IF LOGGED IN -> Show Logout Button
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

// Button styles defined outside to keep code clean
const buttonStyle = {
  backgroundColor: '#4285F4',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginLeft: 'auto' // Pushes button to the right
};

export default Navbar;