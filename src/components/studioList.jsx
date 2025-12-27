import studios from '../data/studios.json';
import { Link } from 'react-router-dom';
import Studio from './studio';
import { slugify } from '../utils/slugify';

function StudioList() {
    

    return (
        <section id="all_studios">
            

           { 
           
           studios.map((studio, index) => (
                
                // <Studio key={index} {...studio} />
                <Link
                key={index}
                to={`/studio/${slugify(studio.title)}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                    <Studio {...studio} />
                </Link>
            ))}
        </section>
    )
}

export default StudioList;