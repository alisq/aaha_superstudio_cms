import ModalImage from "react-modal-image";

const base = (process.env.PUBLIC_URL || "") + "/about/img";

function AboutColTwo() {
  return (
    <>
      <section className="about-column" id="colTwo">
        <div className="about-column-inner">
  
          <div className="about-column-content">
            <div className="about-section" id="cross_canada_superstudio">
              <h3 className="about-sticky">The Cross-Canada Superstudio</h3>
              <p>Architecture schools across Canada are coming together to simultaneously teach design studios around a shared goal: To end housing alienation. This superstudio meets a momentous pedagogical challenge: To prepare tomorrow's designers to create housing that meaningfully contributes to improving housing for all.  </p>
              <p>At the heart of the Superstudio format is the belief that there is a profound strength in numbers and that all big challenges require collaboration. It's incredibly exciting that twelve higher learning institutions are participating in this Superstudio to share knowledge, inspiration, and foster solidarity. Through the studio we will be simultaneously educating ourselves in a vast array of knowledge and technique, inventing new design methods and solutions, and building a movement for change. </p>
              <ModalImage small={`${base}/small/AAHA instagram post Nov 24 2023 2-paperproto.jpg`} large={`${base}/AAHA instagram post Nov 24 2023 2-paperproto.jpg`} alt="hands playing over a printed outline of a building" />
              <p><strong>The Superstudio functions on two pedagogical levels</strong></p>
              <p><strong>Shared Characteristics and Tactics</strong></p>
              <ul>
                <li>All individual studio courses share a broad common theme, guiding principles, and pedagogical structure as described in this brief. </li>
                <li>We come together as a whole to both kick-off and conclude each semester. </li>
                <li>We share resources and design knowledge as it emerges. </li>
              </ul>
              <ModalImage small={`${base}/small/240828 AAHA tour_8004-tour.JPG`} large={`${base}/240828 AAHA tour_8004-tour.JPG`} alt="students being led on a guided architectural tour" />
              <p><strong>Studio Specific Content and Tactics</strong></p>
              <ul>
                <li>While adhering to our shared characteristics and tactics, each of the eleven studio courses is entirely unique to the intellectual and pedagogical aims of the faculty and institutions guiding it. </li>
                <li>Each of the eleven studios will have unique building sites, types of housing, and conceptual parameters. </li>
                <li>The Superstudio seeks to accelerate and celebrate a diversity in approaches to solving Canada's contemporary housing challenges. </li>
              </ul>
              <ModalImage small={`${base}/small/Bhathella_Ali_Choi_DistrictAgricole-map.png`} large={`${base}/Bhathella_Ali_Choi_DistrictAgricole-map.png`} alt="a proposed map of housing in downtown Halifax" />
            </div>
            <h3>Shared Principles</h3>
            <ModalImage small={`${base}/small/AAHA instagram post Oct 3 2023 1-post its.jpg`} large={`${base}/AAHA instagram post Oct 3 2023 1-post its.jpg`} alt="a grid of post-it notes" />
            <ol>
              <li><strong>Indigenous solidarity:</strong> Whether these studios focus directly on Indigenous housing issues in direct collaboration with Indigenous partners, or whether they focus exclusively on urban housing issues for a diverse population, all studios will acknowledge Indigenous land relations and the effects of colonization within the studio.</li>
              <li><strong>Housing decommodification:</strong> The housing problem in Canada is a result of the rapid increase in the cost of land caused by the assetization of land and housing. These studios will explore decommodified approaches to housing.</li>
              <li><strong>Wholistic quality:</strong> The housing problem is often addressed quantitatively, as either a question of supply or price-point, but housing alienation is a qualitative issue. Housing needs to be better designed to connect inhabitants to their surrounding natural ecology, community of family and friends and neighbours, and sense of creative agency.</li>
              <li><strong>Collaboration:</strong> Housing is part of a complex system, with many participants. Architects have a deep understanding of the qualitative dimensions of home, but they don't have the training to navigate the policy landscape, diverse lived experience, and social struggles that shape the housing problem, so they need to address these issues with collaborators with other forms of expertise and within an ethical framework.</li>
            </ol>
            <ModalImage small={`${base}/small/AAHA instagram post Feb 3 2025 3 - vince.JPG`} large={`${base}/AAHA instagram post Feb 3 2025 3 - vince.JPG`} alt="still from a public meeting regarding housing" />
            <h3>Shared Structures</h3>
            <ul>
              <li><strong>Collaboration with non-architectural partners:</strong> Studios will collaborate with non-architects, with direct knowledge and familiarity with community needs (for example: working with a local land trust, community group, First Nation, or directly with a community). </li>
              <li><strong>A broad set of shared protocols for partner engagement</strong> (we are looking for an existing set of protocols which are broad enough to address the range of potential collaborations and look for input from all participating schools—the Design Justice Network's principles seem a good possibility: https://designjustice.org/read-the-principles)  </li>
              <ModalImage small={`${base}/small/AAHA instagram post Nov 24 2023 1-pavillion.jpg`} large={`${base}/AAHA instagram post Nov 24 2023 1-pavillion.jpg`} alt="students gathered around a home-made table in the Canadian Pavillion at Venice" />
              <li><strong>One or more demands to end housing alienation in Canada.</strong> Each studio is organized around a 'demand.' These can be existing demands within Architects Against Housing Alienation's manifesto (1-10), or it can be entirely new demand. Demands aspire to things that do not currently exist, but which are realizable in specific places, and are supported by local residents and organizations.   </li>
              <li><strong>Common online workshops and reviews with paired schools</strong> using virtual tools like MIRO and Zoom, amongst studios clustered based on shared studio subjects or demands. </li>
              <li><strong>Website Exhibition of Studio Work</strong> All student projects will be displayed on a designated Superstudio website. The virtual exhibition's launch will coincide with the End-of-Term Webinar. </li>
            </ul>
          </div>
          <div className="about-section" id="shared_schedule">
            <h3>Shared Schedule</h3>
            <ul>
              <li><strong>Super Studio Kick-Off Webinar:</strong><br /> Saturday, September 06, 2025<br />10:00am - 1:00pm PT, 1:00-4:00pm ET</li>
              <li><strong>Demand Groupings Studio Mid-Reviews:</strong><br /> Specific Dates TBD by Studio Groupings</li>
              <li><strong>Super Studio End-of-Term Webinar & Celebration:</strong><br /> Saturday, December 06, 2025<br />10:00am - 1:00pm PT, 1:00-4:00pm ET</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutColTwo;
