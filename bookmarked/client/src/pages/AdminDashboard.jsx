import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/AdminDashboard.css'; 
import HorizontalLine from "../components/HorizontalLine.jsx";

const AdminDashboard = () => {

  const [stats, setStats] = useState({ totalUsers: 0, totalBooks: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const statsRes = await axios.get('http://localhost:3000/api/admin/stats', { withCredentials: true });
      setStats(statsRes.data);

      const usersRes = await axios.get('http://localhost:3000/api/admin/users', { withCredentials: true });
      setUsers(usersRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Access Denied: Admins Only");
      navigate('/dashboard'); 
    }
  };

  const handleDeleteUser = async (id) => {
    if(!confirm("Are you sure? This deletes the user and ALL their data permanently.")) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/admin/users/${id}`, { withCredentials: true });
      
      setUsers(users.filter(u => u._id !== id));
      
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));

      alert("User deleted successfully.");
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  if (loading) return <div className="loading">Loading Admin Panel...</div>;

  return (

    <div>
      
          <HorizontalLine/>

      <div className="admin-container">

        <header className="admin-header">
          <h1>Admin Panel</h1>
        </header>

        <button className="exit-admin-button" onClick={() => navigate('/dashboard')}>Exit to Dashboard</button>

        <div className="stats-row">
          
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>

          <div className="stat-card">
            <h3>Total Books Saved</h3>
            <p>{stats.totalBooks}</p>
          </div>
        </div>

        <div className="user-table-section">
          <h2>Registered Users</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="user-info">
                      {u.displayName}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u.role !== 'admin' && (
                      <button 
                        className="delete-user-button" 
                        onClick={() => handleDeleteUser(u._id)}
                      >
                        DELETE
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


      </div>
      

      <HorizontalLine/>

    </div>
  );
};

export default AdminDashboard;