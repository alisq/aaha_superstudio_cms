import React from 'react';
import './ProjectCard.css';

const ProjectCard = ({ project, onClick }) => {
  const safeRender = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="project-card" onClick={onClick}>
      {/* Project Image */}
      {(project.poster_image_url || project.poster_image) && (
        <div className="project-image">
          <img 
            src={project.poster_image_url || project.poster_image.asset?.url || project.poster_image} 
            alt={project.title}
          />
        </div>
      )}

      {/* Project Title */}
      <h3 className="project-title">
        {safeRender(project.title)}
      </h3>

      {/* Project Description */}
      {project.description && (
        <p className="project-description">
          {safeRender(project.description[0].children[0].text)}
        </p>
      )}

      {/* Tags */}
      {project.allTags && project.allTags.length > 0 && (
        <div className="project-tags">
          <strong className="tags-label">Tags:</strong>
          <div className="tags-container">
            {project.allTags.map((tag, index) => {
              const tagValue = typeof tag === 'object' ? (tag.value || tag.label) : tag;
              return (
                <span key={index} className="tag-badge">
                  {safeRender(tagValue)}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Studio Information */}
      {project.home_studio && (
        <div className="studio-info">
          <div><strong>Studio:</strong> {safeRender(project.home_studio.title)}</div>
          
          {project.home_studio.institution && (
            <div><strong>Institution:</strong> {safeRender(project.home_studio.institution.title)}</div>
          )}
          
          {project.home_studio.demands && project.home_studio.demands.length > 0 && (
            <div className="demands-container">
              <strong className="demands-label">Demands:</strong>
              <div className="demands-badges">
                {project.home_studio.demands.map((demand, index) => (
                  <span key={index} className="demand-badge">
                    {safeRender(demand.title)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.home_studio.level && (
            <div><strong>Level:</strong> {safeRender(project.home_studio.level[0])}</div>
          )}

          {project.home_studio.term && (
            <div><strong>Term:</strong> {safeRender(project.home_studio.term[0])}</div>
          )}
        </div>
      )}

      {/* Video Link */}
      {project.video_url && (
        <div className="video-link">
          <a 
            href={project.video_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="video-button"
          >
            View Video
          </a>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
