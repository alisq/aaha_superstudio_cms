import { useParams, useNavigate } from 'react-router-dom';
import { slugify } from '../utils/slugify';
import studios from '../data/studios.json';
import Studio from './studio';

function StudioPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
  
    // Find studio by slug
    const studio = studios.find(stud => {
      const studioSlug = slugify(stud.title);
      return studioSlug === slug;
    });
  
    if (!studio) {
      return (
        <div className="studio-full-container">
          <div>Studio not found</div>
          <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
      );
    }
  
    return (
      <div className="studio-full-container">
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            marginBottom: '1rem', 
            padding: '0.5rem 1rem', 
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          ← Back to All Studios
        </button>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <Studio {...studio} isOpen={true} onClick={() => {}} />
        </ul>
      </div>
    );
  }

  export default StudioPage