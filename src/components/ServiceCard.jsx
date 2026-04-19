import { Link } from 'react-router-dom';
import './ServiceCard.css';

const ServiceCard = ({ title, description, icon: Icon, linkTo }) => {
  return (
    <Link to={linkTo} className="glass-panel service-card animate-fade-in">
      <div className="service-icon-wrapper">
        <Icon size={40} />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  );
};

export default ServiceCard;
