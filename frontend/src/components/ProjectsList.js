import React, { useState, useEffect, useRef } from 'react';
import Isotope from 'isotope-layout';
import ProjectCard from './ProjectCard';
import ProjectDetail from './ProjectDetail';
import { API_URL } from '../config';
import './ProjectsList.css';

const ProjectsList = ({ selectedTag, selectedInstitution, selectedDemand }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const isotope = useRef(null);
  const isotopeContainer = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        const response = await fetch(`${API_URL}/api/projects`);
=======
        const response = await fetch('http://localhost:3000/api/projects');
>>>>>>> parent of 6e44efc (using railway prodiction)
=======
        const response = await fetch('http://localhost:3000/api/projects');
>>>>>>> parent of 6e44efc (using railway prodiction)
=======
        const response = await fetch('http://localhost:3000/api/projects');
>>>>>>> parent of 6e44efc (using railway prodiction)
=======
        const response = await fetch('http://localhost:3000/api/projects');
>>>>>>> parent of 6e44efc (using railway prodiction)
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        console.log('Fetched projects data:', data);
        setProjects(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Get filter selector based on selected filters
  const getFilterSelector = (project) => {
    const selectors = [];
    
    // Build tag selector
    if (project.allTags && project.allTags.length > 0) {
      project.allTags.forEach(tag => {
        if (typeof tag === 'object' && tag.value) {
          // Use the tag value as the primary selector
          const tagValue = tag.value;
          const cleanValue = tagValue.replace(/[^a-zA-Z0-9]/g, '-');
          selectors.push(`tag-${tag._id || cleanValue}`);
          selectors.push(`tag-value-${cleanValue}`);
          // Also add the original value
          selectors.push(`tag-${tagValue}`);
        } else if (typeof tag === 'object') {
          // Handle Sanity reference objects
          if (tag._type === 'reference' && tag.current) {
            const tagId = tag.current._id || tag.current.title;
            selectors.push(`tag-${tagId}`);
          } else {
            selectors.push(`tag-${JSON.stringify(tag)}`);
          }
        } else {
          // String tags
          selectors.push(`tag-${tag}`);
        }
      });
    }
    
    // Build institution selector
    if (project.home_studio?.institution?._id) {
      selectors.push(`institution-${project.home_studio.institution._id}`);
    }
    
    // Build demand selectors
    if (project.home_studio?.demands && project.home_studio.demands.length > 0) {
      project.home_studio.demands.forEach(demand => {
        selectors.push(`demand-${demand._id}`);
      });
    }
    
    return selectors.join(' ');
  };

  // Filter projects based on selected filters and return count
  const filteredProjects = projects.filter(project => {
    // Filter by tag
    if (selectedTag) {
      const hasMatchingTag = project.allTags?.some(tag => {
        if (typeof tag === 'object' && tag.value) {
          return tag.value === selectedTag || tag._id === selectedTag;
        }
        return tag === selectedTag;
      });
      if (!hasMatchingTag) return false;
    }

    // Filter by institution
    if (selectedInstitution) {
      const institutionId = project.home_studio?.institution?._id;
      if (institutionId !== selectedInstitution) return false;
    }

    // Filter by demand
    if (selectedDemand) {
      const hasMatchingDemand = project.home_studio?.demands?.some(demand => 
        demand._id === selectedDemand
      );
      if (!hasMatchingDemand) return false;
    }

    return true;
  });

  // Initialize Isotope
  useEffect(() => {
    if (!isotopeContainer.current) return;
    
    isotope.current = new Isotope(isotopeContainer.current, {
      itemSelector: '.project-item',
      layoutMode: 'masonry',
      masonry: {
        columnWidth: '.project-sizer',
        gutter: 20
      },
      filter: '*' // Show all items initially
    });

    return () => {
      if (isotope.current) {
        isotope.current.destroy();
      }
    };
  }, [projects]);

  // Update Isotope when filters change
  useEffect(() => {
    if (!isotope.current) return;
    
    let filterValue = '*'; // Show all
    
    // Build filter selector
    if (selectedTag || selectedInstitution || selectedDemand) {
      const selectors = [];
      
      if (selectedTag) {
        // Remove 'tag-' prefix if it exists
        const cleanTag = selectedTag.replace(/^tag-/, '');
        
        // Try multiple variations of tag selectors
        selectors.push(`tag-${cleanTag}`);
        selectors.push(`tag-value-${cleanTag}`);
        // Also try the encoded version
        selectors.push(`tag-${cleanTag.replace(/[^a-zA-Z0-9]/g, '-')}`);
        selectors.push(`tag-value-${cleanTag.replace(/[^a-zA-Z0-9]/g, '-')}`);
        
        console.log('Filtering by tag:', selectedTag);
        console.log('Clean tag:', cleanTag);
        console.log('Selector classes:', selectors);
      }
      
      if (selectedInstitution) {
        selectors.push(`institution-${selectedInstitution}`);
        console.log('Filtering by institution:', selectedInstitution);
      }
      
      if (selectedDemand) {
        selectors.push(`demand-${selectedDemand}`);
        console.log('Filtering by demand:', selectedDemand);
      }
      
      // Use OR logic for tags - if multiple selectors, project should match any
      filterValue = selectors.length > 0 ? selectors.join(', ') : '*';
      
      console.log('Final filter value:', filterValue);
    }
    
    isotope.current.arrange({ filter: filterValue });
  }, [selectedTag, selectedInstitution, selectedDemand, projects]);

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="projects-list">
      <h2>Projects ({filteredProjects.length})</h2>
      
      {filteredProjects.length === 0 ? (
        <p className="no-results">No projects found matching your filters.</p>
      ) : (
        <>
          <div ref={isotopeContainer} className="isotope-grid">
            <div className="project-sizer"></div>
            {projects.map((project) => (
              <div 
                key={project._id} 
                className={`project-item ${getFilterSelector(project)}`}
              >
                <ProjectCard 
                  project={project}
                  onClick={() => setSelectedProject(project)}
                />
              </div>
            ))}
          </div>
          
          {selectedProject && (
            <ProjectDetail 
              project={selectedProject}
              onClose={() => setSelectedProject(null)}
            />
          )}
        </>
      )}
    </div>
  );
};


export default ProjectsList;
