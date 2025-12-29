import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; // Assuming you have global styles, or create a specific CSS file

const CreateProfile = () => {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/auth/create-profile', 
        { nickname: nickname }, 
        { withCredentials: true } // ⚠️ IMPORTANT: Sends the session cookie
      );

      if (response.data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Profile creation failed:", err);
      setError("Could not create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-profile-container" style={styles.container}>
      <div className="card" style={styles.card}>
        <h1 style={styles.heading}>Welcome to Bookmarked</h1>
        <p style={styles.subtext}>Please choose a nickname to start your collection.</p>
        
        {error && <p style={{color: 'red', fontSize: '14px'}}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nickname</label>
            <input 
              type="text" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. TheBookWorm"
              style={styles.input}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Creating..." : "Start Cataloging"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Simple inline styles to match your minimal aesthetic
const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
    fontFamily: 'serif',
  },
  subtext: {
    color: '#666',
    marginBottom: '30px',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'black',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px',
  }
};

export default CreateProfile;