import { useState } from 'react';
import FiltersList from './components/filtersList';
import SubmissionList from './components/submissionList';
import SubmissionFull from './components/submissionFull';
import Header from './components/header';
import Footer from './components/footer';
import './css/main.css';

function App() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const handleSubmissionClick = (submission) => {
    setSelectedSubmission(submission);
  };

  const handleBackClick = () => {
    setSelectedSubmission(null);
  };

  return (
    <div className="App">
      <Header />

      <section className="filters-section">
        <FiltersList activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      </section>
      
      {selectedSubmission ? (
        <div className="submission-full-container">
          
          <SubmissionFull {...selectedSubmission} />
        </div>
      ) : (
        <SubmissionList activeFilter={activeFilter} onSubmissionClick={handleSubmissionClick} />
      )}
      <Footer />
    </div>
  );
}

export default App;
