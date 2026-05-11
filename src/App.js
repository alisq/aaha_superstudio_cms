import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import FiltersList from './components/filtersList';
import SubmissionList from './components/submissionList';
import SubmissionFull from './components/submissionFull';
import ReactGA from 'react-ga4';
import Header from './components/header';
import Footer from './components/footer';
import StudioPage from './components/studioPage';
import AboutPage from './components/about/AboutPage';
import submissions from './data/submissionsAll';
import { slugify } from './utils/slugify';
import './css/main.css'; 


function HomePage() {
  const [activeFilter, setActiveFilter] = useState(null);
  const location = useLocation();
  ReactGA.initialize("G-95XVYX70XD");

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
    
    <div className="home-layout">
      
      <section className="filters-section">
        <FiltersList activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      </section>
      <SubmissionList activeFilter={activeFilter} />
    </div>
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
        <Route path="/about" element={<AboutPage />} />
      </Routes>

      
      <Footer />
      
    </div>
  );
}

export default App;
