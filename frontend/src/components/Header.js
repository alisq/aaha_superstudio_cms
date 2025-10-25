import React from 'react';
import FilterDropdown from './FilterDropdown';
import './Header.css';

const Header = ({ 
  filters, 
  selectedTag, 
  setSelectedTag,
  selectedInstitution, 
  setSelectedInstitution,
  selectedDemand, 
  setSelectedDemand 
}) => {
  const safeRender = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <header className="app-header">
      
      <div className="filter-container">
        {/* Tags Dropdown */}
        <FilterDropdown
          id="tag-select"
          label={`Tags (${filters.tags?.length || 0})`}
          options={filters.tags}
          selectedValue={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          placeholder="All Tags"
        />

        {/* Institutions Dropdown */}
        <FilterDropdown
          id="institution-select"
          label={`Institutions (${filters.institutions?.length || 0})`}
          options={filters.institutions}
          selectedValue={selectedInstitution}
          onChange={(e) => setSelectedInstitution(e.target.value)}
          placeholder="All Institutions"
        />

        {/* Demands Dropdown */}
        <FilterDropdown
          id="demand-select"
          label={`Demands (${filters.demands?.length || 0})`}
          options={filters.demands}
          selectedValue={selectedDemand}
          onChange={(e) => setSelectedDemand(e.target.value)}
          placeholder="All Demands"
        />

      
      </div>
    </header>
  );
};

export default Header;
