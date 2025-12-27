import { Link } from 'react-router-dom';
import { slugify } from "../utils/slugify";

function Submission({Timestamp, Project_Title, Text, Student_Names, Home_Studio, Tags, Project_Description, Image_1_Alt, Image_1_Caption, Image_2_Alt, Image_2_Caption, Image_3_Alt, Image_3_Caption, Image_4_Alt, Image_4_Caption, Image_5_Alt, Image_5_Caption, Image_6_Alt, Image_6_Caption, Image_7_Alt, Image_7_Caption, Image_8_Alt, Image_8_Caption, Image_9_Alt, Image_9_Caption, Image_10_Alt, Image_10_Caption, URL, Video_URL, Video_Caption, Demands, poster_image, img_01, img_02, img_03, img_04, img_05, img_06, img_07, img_08, img_09, img_10}) {
  
const tagClasses = Tags
  .split(',')
  .map(s => "t_"+slugify(s.trim()))
  .join(' ');

const demandClasses = Demands
  .split(',')
  .map(s => "d_"+slugify(s.trim()))
  .join(' ');

const studioClass = Home_Studio
  ? "s_"+slugify(Home_Studio.split(" — ")[0])
  : '';


  const posterImage = poster_image.replace("/files/","/files/thumbs/");
  
  return (
    
    <div 
      className={`submission submissionTeaser ${tagClasses} ${demandClasses} ${studioClass}`}
      style={{ cursor: 'pointer' }}
    >
      
          <img src={posterImage} />
        
        <div>
        <h3>{Project_Title}</h3>

<p>
  <label>Student{(Student_Names.split(",").length > 1) && ("s")}:</label> {Student_Names}
</p>
<p>
  <label>Home Studio:</label>{Home_Studio.split(" — ")[0]}
  </p>
<p>
<label>School:</label> {Home_Studio.split(" — ")[1]}
</p>
 </div>

     
    </div>
  );
}

export default Submission;



