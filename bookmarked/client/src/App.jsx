import { useEffect, useState } from 'react'; 
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
import CreateProfile from "./pages/CreateProfile"; 

function App() {
  const [user, setUser] = useState(null);

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
        console.log("Not logged in");
      }
    };

    getUser();
  }, []);

  return (
    <Router>
      <div className="website-container">
        <Navbar user={user} />
        
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<Search />} />
          <Route path="/book/:olid" element={<BookDetails />} />
          <Route path="/shelves" element={<Shelves />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* 👇 THE NEW ROUTE FOR DELETED/NEW USERS */}
          <Route path="/create-profile" element={<CreateProfile />} />
        </Routes>
      </div>
      <Footer /> 
    </Router>
  );
}

export default App;