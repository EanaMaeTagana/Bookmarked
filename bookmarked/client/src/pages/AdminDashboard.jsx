import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/AdminDashboard.css'; 
import HorizontalLine from "../components/HorizontalLine.jsx";

const AdminDashboard = ({ triggerAlert }) => {

  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const statsRes = await axios.get('http://localhost:3000/api/admin/stats', { withCredentials: true });

      setTotalUsers(statsRes.data.totalUsers);

      const usersRes = await axios.get('http://localhost:3000/api/admin/users', { withCredentials: true });
      setUsers(usersRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      triggerAlert("Restricted Area: This section of the library is for authorized staff only.");
      navigate('/dashboard'); 
    }
  };

  const handleDeleteUser = (id) => {
    triggerAlert("Are you sure you want to revoke this library card? This action is permanent.", async () => {
      try {
        await axios.delete(`http://localhost:3000/api/admin/users/${id}`, { withCredentials: true });
        
        setUsers(users.filter(u => u._id !== id));
        setTotalUsers(prev => prev - 1);

        triggerAlert("User successfully removed.");
      } catch (err) {
        triggerAlert("The archives resisted. We couldn't delete this user—please try again.");
      }
    });
  };

  if (loading) return (
    <div className="isolated-container">
       <div className="admin-loading">Consulting the Grand Archivist...</div>
    </div>
  );

  return (
    <div className="isolated-container">
      
      <HorizontalLine />

      <div className="admin-container">
        <header className="admin-header">
          <h1>Bookmarked: Staff Archives</h1>
        </header>

        <div className="admin-actions-bar">
           <button className="button exit-admin-button" onClick={() => navigate('/dashboard')}>
             Return to Dashboard
           </button>
        </div>

        <div className="stats-row single-stat">
          <div className="stat-card">
            <h3>Total Registered Readers</h3>
            <p>{totalUsers}</p>
          </div>
        </div>

        <div className="user-table-section">
          <h2>Registry of Members</h2>
          <div className="table-responsive-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Management</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td><div className="user-info">{u.displayName}</div></td>
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
                          Revoke Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <HorizontalLine />
    </div>
  );
};

export default AdminDashboard;