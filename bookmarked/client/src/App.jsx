import { useEffect, useState } from 'react'; // 👈 Added imports
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from './pages/AdminDashboard';
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Search from "./pages/Search";
import Shelves from "./pages/Shelves";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/Footer";
import BookDetails from "./pages/BookDetails";

function App() {
  // 1. Create state to hold the user info
  const [user, setUser] = useState(null);

  // 2. Check if user is logged in when the app loads
  useEffect(() => {
    const getUser = async () => {
      try {
        // ⚠️ Make sure this port matches your server (3000 or 3001)
        const response = await fetch("http://localhost:3000/auth/user", {
          method: "GET",
          credentials: "include", // This sends the session cookie
        });

        if (response.status === 200) {
          const data = await response.json();
          setUser(data); // Save user to state
        }
      } catch (err) {
        console.log("Not logged in");
      }
    };

    getUser();
  }, []);

  return (
    <Router>
      <div className="website-container">
        {/* 3. Pass the user to the Navbar */}
        <Navbar user={user} />
        
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<Search />} />
          <Route path="/book/:olid" element={<BookDetails />} />
          <Route path="/shelves" element={<Shelves />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
      <Footer /> 
    </Router>
  );
}

export default App;