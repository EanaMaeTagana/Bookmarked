import { useEffect, useState } from 'react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/admin/stats', { credentials: 'include' })
      .then(res => {
        if (res.status === 403) throw new Error("⛔️ Access Denied: You are not an Admin!");
        if (res.status === 401) throw new Error("Please Login First");
        return res.json();
      })
      .then(data => setStats(data))
      .catch(err => setError(err.message));
  }, []);

  if (error) return (
    <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>
      <h1>{error}</h1>
      <a href="/">Go Home</a>
    </div>
  );

  if (!stats) return <h1>Loading Admin Panel...</h1>;

  return (
    <div style={{ padding: '40px' }}>
      <h1>⚙️ Admin Dashboard</h1>
      <p>Welcome to the control center.</p>

      <div style={{ 
        border: '1px solid #ddd', 
        padding: '20px', 
        borderRadius: '10px', 
        backgroundColor: '#f9f9f9',
        marginTop: '20px'
      }}>
        <h2>📊 System Status</h2>
        <p><strong>Server Message:</strong> {stats.message}</p>
        <p><strong>Current Admin:</strong> {stats.user.displayName}</p>
        <p><strong>Admin Email:</strong> {stats.user.email}</p>
        
        {/* "Manage Users" or "Add Book" */}
        <button style={{ marginTop: '10px', padding: '10px', cursor: 'pointer' }}>
          Manage Users (Coming Soon)
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;