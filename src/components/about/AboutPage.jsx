import AboutColOne from "./AboutColOne";
import AboutColTwo from "./AboutColTwo";
import AboutColThree from "./AboutColThree";
import AboutColFour from "./AboutColFour";


function AboutPage() {
  return (

    <div id="about-page" className="about-page">
      
      <div id="about-container" className="about-container">
        <AboutColOne />
        <AboutColTwo />
        <AboutColThree />
        <AboutColFour />
      </div>
    </div>
  );
}

export default AboutPage;
