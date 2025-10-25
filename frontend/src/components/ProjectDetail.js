import React from 'react';
import './ProjectDetail.css';

const ProjectDetail = ({ project, onClose }) => {
  const safeRender = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (!project) return null;

  return (
    <div className="project-detail-overlay" onClick={onClose}>
      <div className="project-detail-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        {/* Project Header */}
        <div className="project-detail-header">
          <h1 className="project-detail-title">{safeRender(project.title)}</h1>
          {(project.poster_image_url || project.poster_image) && (
            <img 
              src={project.poster_image_url || project.poster_image.asset?.url || project.poster_image} 
              alt={project.title}
              className="project-detail-image"
            />
          )}
        </div>

                  {/* Project Body */}
        <div className="project-detail-body">
          {/* Description */}
          {project.description && (
            <div className="project-detail-section">
              <h2>Description</h2>
              <p>{safeRender(project.description[0]?.children[0]?.text || project.description)}</p>
            </div>
          )}

          {/* Additional Images */}
          {project.images && project.images.length > 0 && (
            <div className="project-detail-section">
              <h2>Gallery</h2>
              <div className="images-gallery">
                {project.images.map((image, index) => {
                  // Get the image URL - either from the processed image object or from images_urls array
                  const imageUrl = image.url || project.images_urls?.[index];
                  
                  return (
                    <div key={index} className="gallery-item">
                      {imageUrl && (
                        <img 
                          src={imageUrl} 
                          alt={image.caption || `${project.title} - Image ${index + 1}`}
                          className="gallery-image"
                        />
                      )}
                      {image.caption && (
                        <p className="gallery-caption">{image.caption}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {project.allTags && project.allTags.length > 0 && (
            <div className="project-detail-section">
              <h2>Tags</h2>
              <div className="tags-list">
                {project.allTags.map((tag, index) => {
                  const tagValue = typeof tag === 'object' ? (tag.value || tag.label) : tag;
                  return (
                    <span key={index} className="tag-large">
                      {safeRender(tagValue)}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Studio Information */}
          {project.home_studio && (
            <div className="project-detail-section">
              <h2>Studio Information</h2>
              <div className="studio-details">
                <div className="detail-row">
                  <strong>Studio:</strong>
                  <span>{safeRender(project.home_studio.title)}</span>
                </div>
                
                {project.home_studio.institution && (
                  <div className="detail-row">
                    <strong>Institution:</strong>
                    <span>{safeRender(project.home_studio.institution.title)}</span>
                  </div>
                )}
                
                {project.home_studio.level && (
                  <div className="detail-row">
                    <strong>Level:</strong>
                    <span>{safeRender(project.home_studio.level[0] || project.home_studio.level)}</span>
                  </div>
                )}
                
                {project.home_studio.term && (
                  <div className="detail-row">
                    <strong>Term:</strong>

                    
                    <span>{(project.home_studio.term == "fall_2025" ? "Fall 2025" : "Winter 2026")}</span>
                  </div>
                )}

                {project.home_studio.demands && project.home_studio.demands.length > 0 && (
                  <div className="detail-row">
                    <strong>Demands:</strong>
                    <div className="demands-list">
                      {project.home_studio.demands.map((demand, index) => (
                        <span key={index} className="demand-badge-large">
                          {safeRender(demand.title)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.home_studio.description && (
                  <div className="detail-row">
                    <strong>Description:</strong>
                    <span>{safeRender(project.home_studio.description[0].children[0].text)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Video Link */}
          {project.video_url && (
            <div className="project-detail-section">
              <a 
                href={project.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="video-link-large"
              >
                Watch Video
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
