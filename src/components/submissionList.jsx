import submissions from '../data/submissions.json';
import Submission from './submission';

function SubmissionList() {
  return (
    <div className="submissionList">
        
      {submissions.map((item, index) => (
        
        <div key={index}>
          <Submission {...item} />
        </div>
      ))}
    </div>
  );
}

export default SubmissionList;