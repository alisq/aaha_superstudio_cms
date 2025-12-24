import submissions from '../data/submissions.json';
import SubmissionTeaser from './submissionTeaser';

function SubmissionList() {
  return (
    <div className="submissionList">
        
      {submissions.map((item, index) => (
        
        <div key={index}>
          <SubmissionTeaser {...item} />
        </div>
      ))}
    </div>
  );
}

export default SubmissionList;