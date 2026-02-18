import parse from 'html-react-parser';

function AboutStudio({ title, desc, school, teacher, demands, isOpen, term, level, onClick }) {
  return (
    <li className={`about-studio ${isOpen ? "about-studio--open" : ""}`}>
      <div className="about-studio-header" onClick={onClick}>
        <h4><span className="about-studio-triangle">&#9656;</span> {title}</h4>
        <h5>{school}</h5>
      </div>
      <div className="about-studio-body">
        {(() => {
          const list = Array.isArray(demands) ? demands : (typeof demands === 'string' ? [demands] : []);
          return list.length > 0 ? (
            <h6>
              <label>demands:</label> <em>{list.join(", ")}</em>
            </h6>
          ) : null;
        })()}
        <h6><label>instructor(s):</label> <strong>{teacher}</strong></h6>
        <h6><label>term:</label> {term}</h6>
        <h6><label>level:</label> {level}</h6>
        {desc && parse(desc)}
      </div>
    </li>
  );
}

export default AboutStudio;
