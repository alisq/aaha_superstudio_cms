
function Submission({Timestamp, Project_Title, Text, Student_Names, Home_Studio, Tags, Project_Description, Image_1_Alt, Image_1_Caption, Image_2_Alt, Image_2_Caption, Image_3_Alt, Image_3_Caption, Image_4_Alt, Image_4_Caption, Image_5_Alt, Image_5_Caption, Image_6_Alt, Image_6_Caption, Image_7_Alt, Image_7_Caption, Image_8_Alt, Image_8_Caption, Image_9_Alt, Image_9_Caption, Image_10_Alt, Image_10_Caption, URL, Video_URL, Video_Caption, Demands, poster_image, img_01, img_02, img_03, img_04, img_05, img_06, img_07, img_08, img_09, img_10}) {
  return (
    <div className="submission">
      
          <img src={poster_image} /><br />
        
<strong>Title:</strong> {Project_Title}<br />
<strong>Student(s):</strong> {Student_Names}<br />
<strong>Home Studio:</strong> {Home_Studio}<br />
<strong>Tags:</strong> {Tags}<br />

<strong>Demands:</strong> {Demands}<br />

<strong>Desc:</strong> {Project_Description}<br />

     
    </div>
  );
}

export default Submission;



