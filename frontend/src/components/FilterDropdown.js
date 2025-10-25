import React from 'react';
import './FilterDropdown.css';

const FilterDropdown = ({ 
  id, 
  label, 
  options, 
  selectedValue, 
  onChange, 
  placeholder 
}) => {
  const safeRender = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="filter-dropdown">
      
      <select
        id={id}
        value={selectedValue}
        onChange={(onChange)}
        className="filter-select"
      >
        <option value="">{placeholder}</option>
        {options?.map((option, index) => {
          // Handle tag options
          if (typeof option === 'object' && option.value) {
            // Use the tag value as the option value, not the _id
            return (
              <option key={index} value={option.value}>
                {option.label || option.value}
              </option>
            );
          }
          
          // Handle institution/demand options
          if (typeof option === 'object' && option._id) {
            const title = typeof option.title === 'object' ? JSON.stringify(option.title) : (option.title || 'No title');
            const slug = typeof option.slug === 'object' ? JSON.stringify(option.slug) : (option.slug || 'No slug');
            return (
              <option key={index} value={option._id || index}>
                {title}
              </option>
            );
          }
          
          // Handle Sanity reference objects
          if (typeof option === 'object' && option._type === 'reference' && option.current) {
            return (
              <option key={index} value={option.current._id || JSON.stringify(option)}>
                {option.current.title || option.current.name || option.current._id || 'Unknown'}
              </option>
            );
          }
          
          // Handle string options
          return (
            <option key={index} value={safeRender(option)}>
              {safeRender(option)}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default FilterDropdown;
