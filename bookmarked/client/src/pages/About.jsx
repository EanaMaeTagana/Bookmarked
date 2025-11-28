import AboutImage from "../assets/images/about-asset.png";
import Header from "../components/Header.jsx";

function About() {
    return (
    <div className="container">
        <Header />
        <div className="about-container">
            <img className="about-image" src={AboutImage} alt="Design" />
            <div className="about-text"> 
                <p>Bookmarked is a personal digital space designed to keep track of the stories that leave a lasting impression. It brings together real book data with a customizable shelf, allowing notes, ratings, and reflections to be stored alongside each title. From romance and contemporary fiction to mysteries and fantasy, Bookmarked organizes stories in a single, easy-to-navigate space. It preserves the details and memories that make each book meaningful, offering a clear view of reading progress and personal insights. By combining discovery, organization, and reflection, Bookmarked transforms a collection of books into a curated record of experiences, making every story easy to revisit and remember.</p>
                <p>From romance and contemporary fiction to mysteries and fantasy, Bookmarked organizes stories in a single, easy-to-navigate space. It preserves the details and memories that make each book meaningful, offering a clear view of reading progress and personal insights. By combining discovery, organization, and reflection, Bookmarked transforms a collection of books into a curated record of experiences, making every story easy to revisit and remember.</p>
            </div>
        </div>
    </div>
    )
}
export default About;