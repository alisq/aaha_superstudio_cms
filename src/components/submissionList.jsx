import { slugify } from '../utils/slugify';
import submissions from '../data/submissions.json';
import SubmissionTeaser from './submissionTeaser';

function SubmissionList({ activeFilter, onSubmissionClick }) {
  const filteredSubmissions = activeFilter 
    ? submissions.filter(item => {
        // Check if submission has the active filter class
        const tagClasses = item.Tags
          ? item.Tags.split(',').map(s => "t_" + slugify(s.trim()))
          : [];
        const demandClasses = item.Demands
          ? item.Demands.split(',').map(s => "d_" + slugify(s.trim()))
          : [];
        const studioClass = item.Home_Studio
          ? ["s_" + slugify(item.Home_Studio.split(" — ")[0])]
          : [];
        
        const allClasses = [...tagClasses, ...demandClasses, ...studioClass];
        return allClasses.includes(activeFilter);
      })
    : submissions;

  return (
    <div className="submissionList">
      {filteredSubmissions.map((item, index) => {
        const submissionId = item.Project_Title + (item.Timestamp || index);
        const delay = index * 0.02; // Stagger each submission by 20ms
        
        return (
          <div 
            key={submissionId}
            className="submission-wrapper rolling-down"
            style={{ animationDelay: `${delay}s` }}
          >
            <SubmissionTeaser {...item} onClick={() => onSubmissionClick(item)} />
          </div>
        );
      })}
    </div>
  );
}

export default SubmissionList;