import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../style/CreateProfile.css";
import '../App.css'; 

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
        { withCredentials: true } 
      );

      if (response.data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Profile creation failed:", err);
      setError("Could not create profile. The server might be busy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-container">
      <div className="create-card">
        <h1 className="create-heading">Welcome to Bookmarked</h1>
        
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="create-form">
          <div className="create-inputs">
            <label className="create-label">Please choose a name:</label>
            <input 
              className="create-input"
              type="text" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Jane Doe"
              required
            />
          </div>

          <button 
            className="button"
            type="submit" 
            disabled={loading}
          >
            {loading ? "Creating Profile..." : "Start Cataloging"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;