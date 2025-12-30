import { Link } from "react-router-dom";
import HeroImage from "../assets/images/home-hero.png";
import HomeBooksImage from "../assets/images/home-books-image.png";
import LaptopImage from "../assets/images/laptop-shelves-image.png";
import Header from "../components/Header.jsx";
import HorizontalLine from "../components/HorizontalLine.jsx";  
import "../style/Home.css";

function Home() {
    return (
    <div className="container">

        <img className="hero-image" src={HeroImage} alt="Design"/>

        <HorizontalLine />

        <div className="explore">
            <h2>Explore a 1,000,000+ book catalogue.</h2>
            <img className="explore-image" src={HomeBooksImage} alt="Design"/>
            <p>Through the Open Library API—bookmarked allows users to browse from <br />millions of books and see all the details at a glance.</p>
        </div>

        <hr />

        <div className="organize">
            <h2>Organize reads into curated shelves!</h2>
            <img className="organize-image" src={LaptopImage} alt="Design"/>
            <p>Select from the catalogue and create shelves for every <br />mood, genre, or reading phase.</p>
        </div>

        <hr />

        <div className="digitize">
            <h2>Ditch manual diaries—go fully digital.</h2>
            <p>Set your goals, track every read, <br />and save moments you love. All in one place.</p>
            <Header />
            <Link to="/search" className="CTA-button">
                <p>Get Started</p>
            </Link>
        </div>

        <HorizontalLine />

    </div>
    );
}

export default Home;
