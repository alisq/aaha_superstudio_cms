import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import FiltersList from './components/filtersList';
import SubmissionList from './components/submissionList';
import SubmissionFull from './components/submissionFull';
import StudioList from './components/studioList';
import Studio from './components/studio';
import Header from './components/header';
import Footer from './components/footer';
import StudioPage from './components/studioPage';
import submissions from './data/submissions.json';
import studios from './data/studios.json';
import { slugify } from './utils/slugify';
import './css/main.css'; 


function HomePage() {
  const [activeFilter, setActiveFilter] = useState(null);
  const location = useLocation();

  // Get filter from URL query params if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter');
    if (filter) {
      setActiveFilter(filter);
    }
  }, [location.search]);

  return (
    <>
      <section className="filters-section">
        <FiltersList activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      </section>
      <SubmissionList activeFilter={activeFilter} />
    </>
  );
}

function SubmissionPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Find submission by slug
  const submission = submissions.find(sub => {
    const submissionSlug = slugify(sub.Project_Title);
    return submissionSlug === slug;
  });

  if (!submission) {
    return (
      <div className="submission-full-container">
        <div>Submission not found</div>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="submission-full-container">
      <SubmissionFull {...submission} />
    </div>
  );
}


function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/submission/:slug" element={<SubmissionPage />} />
        <Route path="/studio/:slug" element={<StudioPage />} />
      </Routes>

      
      <Footer />
      
    </div>
  );
}

export default App;
