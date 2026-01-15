import { useEffect, useState } from 'react'; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from './pages/AdminDashboard';
import EntryImage from './assets/images/entry-image.png'
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Shelves from "./pages/Shelves";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/Footer";
import BookDetails from "./pages/BookDetails";
import CreateProfile from "./pages/CreateProfile"; 

function App() {
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", onConfirm: null });

  const [hasEntered, setHasEntered] = useState(sessionStorage.getItem('entered') === 'true');
  const [isExiting, setIsExiting] = useState(false);

  const handleEntry = () => {
    setIsExiting(true);
    sessionStorage.setItem('entered', 'true');
    setTimeout(() => {
      setHasEntered(true);
    }, 800); 
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/auth/user", {
          method: "GET",
          credentials: "include", 
        });

        if (response.status === 200) {
          const data = await response.json();
          setUser(data); 
        }
      } catch (err) {
        console.log("Browsing anonymously.");
      }
    };
    getUser();
  }, []);

  const triggerAlert = (message, onConfirm = null) => {
    setAlert({ show: true, message, onConfirm });
  };

  const closeAlert = () => {
    setAlert({ show: false, message: "", onConfirm: null });
  };

  return (
    <Router>
      {!hasEntered && (
        <div 
          className={`entry-screen ${isExiting ? 'exit-fade' : ''}`} 
          onClick={handleEntry}
        >
          <div className="entry-modal">
            <img className="entry-image" src={EntryImage} alt="Entry Image" />
            <p className="entry-text">Click anywhere to enter the archives</p>
          </div>
        </div>
      )}

      <Navbar user={user} />
        
      <Routes>
        <Route path="/admin" element={<AdminDashboard triggerAlert={triggerAlert}/>} />
        <Route path="/" element={<Home triggerAlert={triggerAlert}/>} />
        <Route path="/search" element={<Search triggerAlert={triggerAlert}/>} />
        <Route path="/book/:olid" element={<BookDetails triggerAlert={triggerAlert} />} />
        <Route path="/shelves" element={<Shelves triggerAlert={triggerAlert} />} />
        <Route path="/dashboard" element={<Dashboard triggerAlert={triggerAlert} />} />
        <Route path="/create-profile" element={<CreateProfile triggerAlert={triggerAlert}/>} />
      </Routes>

      {alert.show && (
        <div className="alert-overlay">
          <div className="alert-box">
            <p>{alert.message}</p>
            <div className="modal-footer">
              {alert.onConfirm ? (
                <>
                  <button className="cancel-button" onClick={closeAlert}>Cancel</button>
                  <button className="button" onClick={() => { alert.onConfirm(); closeAlert(); }}>Confirm</button>
                </>
              ) : (
                <button className="button" onClick={closeAlert}>OK</button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer /> 
    </Router>
  );
}

export default App;