
function Submission({Timestamp, Project_Title, Text, Student_Names, Home_Studio, Tags, Project_Description, Image_1_Alt, Image_1_Caption, Image_2_Alt, Image_2_Caption, Image_3_Alt, Image_3_Caption, Image_4_Alt, Image_4_Caption, Image_5_Alt, Image_5_Caption, Image_6_Alt, Image_6_Caption, Image_7_Alt, Image_7_Caption, Image_8_Alt, Image_8_Caption, Image_9_Alt, Image_9_Caption, Image_10_Alt, Image_10_Caption, URL, Video_URL, Video_Caption, Demands, poster_image, img_01, img_02, img_03, img_04, img_05, img_06, img_07, img_08, img_09, img_10}) {
  return (
    <div className="submission">
      
          <img src={poster_image} /><br />
        
<strong>Title:</strong> {Project_Title}<br />
<strong>Student(s):</strong> {Student_Names}<br />
<strong>Home Studio:</strong> {Home_Studio}<br />
<strong>Tags:</strong> {Tags}<br />
<div className="image01">
    <img src={img_01} alt={Image_1_Alt} />
    <div className="caption">{Image_1_Caption}</div>
</div>

<div className="image02">
    <img src={img_02} alt={Image_2_Alt} />
    <div className="caption">{Image_2_Caption}</div>
</div>

<div className="image03">
    <img src={img_03} alt={Image_3_Alt} />
    <div className="caption">{Image_3_Caption}</div>
</div>

<div className="image04">
    <img src={img_04} alt={Image_4_Alt} />
    <div className="caption">{Image_4_Caption}</div>
</div>

<div className="image05">
    <img src={img_05} alt={Image_5_Alt} />
    <div className="caption">{Image_5_Caption}</div>
</div>

{(img_06 != "/files/Image_06/") && (
  <div className="image06">
    <img src={img_06} alt={Image_6_Alt || ''} />
    {Image_6_Caption && (
      <div className="caption">{Image_6_Caption}</div>
    )}
  </div>
)}

{(img_07 != "/files/Image_07/") && (
  <div className="image07">
    <img src={img_07} alt={Image_7_Alt || ''} />
    {Image_7_Caption && (
      <div className="caption">{Image_7_Caption}</div>
    )}
  </div>
)}

{(img_08 != "/files/Image_08/") && (
  <div className="image08">
    <img src={img_08} alt={Image_8_Alt || ''} />
    {Image_8_Caption && (
      <div className="caption">{Image_8_Caption}</div>
    )}
  </div>
)}

{(img_09 != "/files/Image_09/") && (
  <div className="image09">
    <img src={img_09} alt={Image_9_Alt || ''} />
    {Image_9_Caption && (
      <div className="caption">{Image_9_Caption}</div>
    )}
  </div>
)}

{(img_10 != "/files/Image_10/") && (
  <div className="image10">
    <img src={img_10} alt={Image_10_Alt || ''} />
    {Image_10_Caption && (
      <div className="caption">{Image_10_Caption}</div>
    )}
  </div>
)}

{Video_URL && (
<div className="video">
{Video_URL}
{Video_Caption}
</div>
)}
<strong>Demands:</strong> {Demands}<br />

<strong>Desc:</strong> {Project_Description}<br />

     
    </div>
  );
}

export default Submission;



