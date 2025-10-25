import React, { useState, useEffect } from 'react';
import ProjectsList from './components/ProjectsList';
import Header from './components/Header';
import './css/main.css';

function App() {
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedDemand, setSelectedDemand] = useState('');

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/filters');
        if (!response.ok) {
          throw new Error('Failed to fetch filters');
        }
        const data = await response.json();
        console.log('Fetched filters data:', data);
        console.log('Tags structure:', data.tags);
        console.log('Institutions structure:', data.institutions);
        console.log('Demands structure:', data.demands);
        setFilters(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching filters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  if (loading) return <div>Loading filters...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!filters) return <div>No filters data</div>;

  return (
    <div className="App">
      <Header
        filters={filters}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        selectedInstitution={selectedInstitution}
        setSelectedInstitution={setSelectedInstitution}
        selectedDemand={selectedDemand}
        setSelectedDemand={setSelectedDemand}
      />

      {/* Projects Section */}
      <main>
        <ProjectsList 
          selectedTag={selectedTag}
          selectedInstitution={selectedInstitution}
          selectedDemand={selectedDemand}
        />
      </main>
    </div>
  );
}

export default App;
