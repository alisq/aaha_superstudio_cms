import { Link } from 'react-router-dom';

import parse from 'html-react-parser';
import { slugify } from '../utils/slugify';
import { getSubmissionStudioFilterClass } from '../utils/studios';



function Submission({Timestamp, Project_Title, Text, Student_Names, Home_Studio, Tags, Project_Description, Image_1_Alt, Image_1_Caption, Image_2_Alt, Image_2_Caption, Image_3_Alt, Image_3_Caption, Image_4_Alt, Image_4_Caption, Image_5_Alt, Image_5_Caption, Image_6_Alt, Image_6_Caption, Image_7_Alt, Image_7_Caption, Image_8_Alt, Image_8_Caption, Image_9_Alt, Image_9_Caption, Image_10_Alt, Image_10_Caption, URL, Video_URL, Video_Caption, Demands, poster_image, img_01, img_02, img_03, img_04, img_05, img_06, img_07, img_08, img_09, img_10}) {
  
  return (
    <div className="submission">
    
      <div className="submission-grid">    
        <div className="submission-left-bar">
          <div className="submission-left-bar-content">
          
          <h2>{Project_Title}</h2>
          
          <label>Student{(Student_Names.split(",").length > 1) && ("s")}:</label> {Student_Names}<br /><br />
          
          <label>Home Studio:</label> {Home_Studio && Home_Studio.split(" — ").length > 0 && (
            <Link 
              className="home-studio"
              to={`/?filter=${getSubmissionStudioFilterClass(Home_Studio)}`}
              style={{ color: 'inherit' }}
            >
              {Home_Studio.split(" — ")[0]}
            </Link>
          )}
          <br />
          <label>School:</label> {Home_Studio && Home_Studio.split(" — ").length > 1 && (
                      <Link 
              className="home-studio"
              to={`/?filter=${getSubmissionStudioFilterClass(Home_Studio)}`}
              style={{ color: 'inherit' }}
            >
              {Home_Studio.split(" — ")[1]}
            </Link>
          )}
          <br />
          <label>Tags:</label>
          <div className="filter-tag-buttons">
            {Tags.split(",").map((tag, index) => {
              const trimmedTag = tag.trim();
              const filterClass = `t_${slugify(trimmedTag)}`;
              return (
                <Link
                  key={index}
                  to={`/?filter=${filterClass}`}
                  className="filter-tag-button"
                >
                  {trimmedTag}
                </Link>
              );
            })}
          </div>
          <br />
          <label>Demands:</label> 
          
            {(Demands ?? '').split("—, ").map((demand, index) => {
              const trimmedDemand = demand.replace("—", "").trim();
              if (trimmedDemand === '') return null;
              const filterClass = `d_${slugify(trimmedDemand)}`;
              return (
                <div key={index}>
                  <Link
                   
                    className="home-demand"
                  
                    to={`/?filter=${filterClass}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <strong><em>{trimmedDemand}</em></strong>
                  </Link>
                  </div>
                
              );
            })}
          
          <br />
          {parse(Project_Description.replace(/\n/g, '<br />&nbsp;&nbsp;&nbsp;&nbsp;'))}<br />
          <br /><br />
 
          </div>
        </div>
        <div>
          <div className="submission-poster-image" style={{backgroundImage: `url(${poster_image?.startsWith('/') ? process.env.PUBLIC_URL + poster_image : poster_image})`}}>
            <img src={poster_image?.startsWith('/') ? process.env.PUBLIC_URL + poster_image : poster_image} alt={Project_Title} />          
          </div>
              

  <div className="submission-slide">
      <img loading="lazy" src={img_01?.startsWith('/') ? process.env.PUBLIC_URL + img_01 : img_01} alt={Image_1_Alt} />
      <div className="submission-caption">{Image_1_Caption}</div>
  </div>

  <div className="submission-slide">
      <img loading="lazy" src={img_02?.startsWith('/') ? process.env.PUBLIC_URL + img_02 : img_02} alt={Image_2_Alt} />
      <div className="submission-caption">{Image_2_Caption}</div>
  </div>

  <div className="submission-slide">
      <img loading="lazy" src={img_03?.startsWith('/') ? process.env.PUBLIC_URL + img_03 : img_03} alt={Image_3_Alt} />
      <div className="submission-caption">{Image_3_Caption}</div>
  </div>

  <div className="submission-slide">
      <img loading="lazy" src={img_04?.startsWith('/') ? process.env.PUBLIC_URL + img_04 : img_04} alt={Image_4_Alt} />
      <div className="submission-caption">{Image_4_Caption}</div>
  </div>

  <div className="submission-slide">
      <img loading="lazy" src={img_05?.startsWith('/') ? process.env.PUBLIC_URL + img_05 : img_05} alt={Image_5_Alt} />
      <div className="submission-caption">{Image_5_Caption}</div>
  </div>

  {(img_06 != "/files/Image_06/") && (
    <div className="submission-slide">
      <img loading="lazy" src={img_06?.startsWith('/') ? process.env.PUBLIC_URL + img_06 : img_06} alt={Image_6_Alt || ''} />
      {Image_6_Caption && (
        <div className="submission-caption">{Image_6_Caption}</div>
      )}
    </div>
  )}

  {(img_07 != "/files/Image_07/") && (
    <div className="submission-slide">
      <img loading="lazy" src={img_07?.startsWith('/') ? process.env.PUBLIC_URL + img_07 : img_07} alt={Image_7_Alt || ''} />
      {Image_7_Caption && (
        <div className="submission-caption">{Image_7_Caption}</div>
      )}
    </div>
  )}

  {(img_08 != "/files/Image_08/") && (
    <div  className="submission-slide">
      <img loading="lazy"src={img_08?.startsWith('/') ? process.env.PUBLIC_URL + img_08 : img_08} alt={Image_8_Alt || ''} />
      {Image_8_Caption && (
        <div className="submission-caption">{Image_8_Caption}</div>
      )}
    </div>
  )}

  {(img_09 != "/files/Image_09/") && (
    <div className="submission-slide">
      <img loading="lazy"src={img_09?.startsWith('/') ? process.env.PUBLIC_URL + img_09 : img_09} alt={Image_9_Alt || ''} />
      {Image_9_Caption && (
        <div className="submission-caption">{Image_9_Caption}</div>
      )}
    </div>
  )}

  {(img_10 != "/files/Image_10/") && (
    <div className="submission-slide">
      <img loading="lazy"src={img_10?.startsWith('/') ? process.env.PUBLIC_URL + img_10 : img_10} alt={Image_10_Alt || ''} />
      {Image_10_Caption && (
        <div className="submission-caption">{Image_10_Caption}</div>
      )}
    </div>
  )}

  {Video_URL && (
  <div className="submission-slide submission-slide-video">
  {Video_URL}
  {Video_Caption}
  </div>
  )}
        </div>
        
      </div>

      <hr />
      <br />  

      

     
    </div>
  );
}

export default Submission;



