import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Search from "./pages/Search";
import Shelves from "./pages/Shelves";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/Footer";
import BookDetails from "./pages/BookDetails";

function App() {
  return (
    <Router>
      <div className="website-container">
      <Navbar />
      <Routes>
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
