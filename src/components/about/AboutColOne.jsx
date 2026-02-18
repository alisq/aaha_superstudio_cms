import ModalImage from "react-modal-image";

const base = (process.env.PUBLIC_URL || "") + "/about/img";

function AboutColOne() {
  return (
    <section className="about-column" id="colOne">
      <div className="about-column-inner">
        
        <div className="about-column-content">
          <div className="about-section" id="housing_in_canada">
            <h3 className="about-sticky">Housing Alienation in Canada</h3>
            <p>Housing is one of the most critical issues in Canada. Unaffordability seems to reach new heights each year, home ownership rates have declined, and precarity and homelessness are a constant presence almost everywhere. At the root of these problems is housing alienation—the condition of being separated from our fundamental connections to home. Alienation separates us from the land we inhabit, the social world that supports us, and our full creative lives.  The housing system in Canada is broken and needs to be redesigned from the ground up.  </p>
            <ModalImage small={`${base}/small/240828 AAHA tour_8024-facades.JPG`} large={`${base}/240828 AAHA tour_8024-facades.JPG`} alt="" />
            <p>Historically, the transformation of land and homes into profit-generating commodities has caused alienation. This condition began with colonial land dispossession. When European settlers arrived in Canada, they began a process that took land away from Indigenous peoples and worked to erase Indigenous ways of knowing and doing. Through this encounter, land became conceptualized as private property, reserved for the exclusive use of its owner and at the same time easily exchanged, throwing something as rooted as land into circulation.  </p>
            <p>Today, homes are designed to be exchangeable assets. They follow the rules of real estate speculation so that they can store wealth and be easily traded for profit, resulting in environments that perpetuate problems like racial and class segregation. Housing alienation disproportionately affects marginalized people, limiting their self-determination. Further, market-driven housing production applies pressures that value profit over fair labour practices and environmental sustainability.   </p>
            <p>We can end housing alienation by rebuilding connections to land, to community, and to creative self-determination. We believe that there is no better place to base this effort than in the design studios of Canada's architecture schools. The next generation of architects in Canada not only brings the perspective of those who will face the uncertainties of the future housing market but is best positioned to carry this monumental task forward. Learning about the conditions that have led to this point and using the tools that designers hold—while working in collaboration with partners who bring their own expertise in policy, local knowledge, construction, and beyond—gives us the best hope. As students, teachers, activists, advocates, and architects, we are learning collaboratively to design housing that is socially, ecologically, and creatively empowering for all, while contributing to the political will and economic and policy frameworks that support them. </p>
            <ModalImage small={`${base}/small/240828 AAHA tour_8042-underpass.JPG`} large={`${base}/240828 AAHA tour_8042-underpass.JPG`} alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutColOne;
