import submissions from '../data/submissions.json';
import Submission from './submission';

function SubmissionList() {
  return (
    <div>
        
      {submissions.map((item, index) => (
        
        <div key={index}>
          <Submission {...item} />
        </div>
      ))}
    </div>
  );
}

export default SubmissionList;