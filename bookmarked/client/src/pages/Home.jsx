import { Link } from "react-router-dom";
import HeroImage from "../assets/images/home-hero.png";
import ArrowImage from "../assets/images/arrow-asset.png";

function Home() {
    return (
    <div className="container">
        <div className="hero-container">
            <h1>BOOKMARKED</h1> 
            <img src={HeroImage} alt="Design" />
        </div>
        <p className="tagline">Keep track of the stories that stay with you.</p>
        <Link to="/search">
            <img src={ArrowImage} alt="Go to dashboard" id="arrow-image"/>
        </Link>
    </div>
    );
}

export default Home;
