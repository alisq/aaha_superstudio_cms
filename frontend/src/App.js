import React, { useState, useEffect } from 'react';
import ProjectsList from './components/ProjectsList';
import FilterDropdown from './components/FilterDropdown';
import './css/main.css';

function App() {
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedDemand, setSelectedDemand] = useState('');

  // Helper function to safely render any value
  const safeRender = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

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
      <header className="App-header">
        <h1>Filter Selection</h1>
        
        <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          {/* Tags Dropdown */}
          <FilterDropdown
            id="tag-select"
            label={`Tags (${filters.tags?.length || 0})`}
            options={filters.tags}
            selectedValue={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            placeholder="-- Choose a tag --"
          />

          {/* Institutions Dropdown */}
          <FilterDropdown
            id="institution-select"
            label={`Institutions (${filters.institutions?.length || 0})`}
            options={filters.institutions}
            selectedValue={selectedInstitution}
            onChange={(e) => setSelectedInstitution(e.target.value)}
            placeholder="-- Choose an institution --"
          />

          {/* Demands Dropdown */}
          <FilterDropdown
            id="demand-select"
            label={`Demands (${filters.demands?.length || 0})`}
            options={filters.demands}
            selectedValue={selectedDemand}
            onChange={(e) => setSelectedDemand(e.target.value)}
            placeholder="-- Choose a demand --"
          />

          {/* Selected Values Display */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h3>Selected Filters:</h3>
            {selectedTag && (
              <p><strong>Tag:</strong> {safeRender(selectedTag)}</p>
            )}
            {selectedInstitution && (
              <p><strong>Institution:</strong> {safeRender(selectedInstitution)}</p>
            )}
            {selectedDemand && (
              <p><strong>Demand:</strong> {safeRender(selectedDemand)}</p>
            )}
            {!selectedTag && !selectedInstitution && !selectedDemand && (
              <p style={{ color: '#666' }}>No filters selected</p>
            )}
          </div>

          {/* Debug Section */}
    
        </div>
      </header>

      {/* Projects Section */}
      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
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
