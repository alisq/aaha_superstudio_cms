import { useState } from "react";
import AboutStudio from "./AboutStudio";
import studios from "../../data/studios.json";

function AboutColThree() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="about-column" id="colThree">
      <div className="about-column-inner">
       
        <div className="about-column-content">
          <h3 className="about-sticky">Participating Studios</h3>
          <ul className="about-studio-list">
            {studios.map((item, index) => (
              <div key={index}>
                <AboutStudio
                  isOpen={openIndex === index}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  title={item.title}
                  desc={item.desc}
                  school={item.school}
                  term={item.term}
                  level={item.level}
                  demands={item.demands}
                  teacher={item.teacher}
                />
              </div>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AboutColThree;
