import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Building2 } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section">
            <Link to="/" className="navbar-logo" style={{ marginBottom: '1.5rem', display: 'flex' }}>
              <Building2 className="logo-icon" size={32} />
              <span>SmartCity</span>
            </Link>
            <p>Digital services for modern citizens. Experience the future of urban living with our centralized city management portal.</p>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/complaints">Register Complaint</Link></li>
              <li><Link to="/bills">Pay Utility Bills</Link></li>
              <li><Link to="/traffic">Traffic Updates</Link></li>
              <li><Link to="/parking">Smart Parking</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact Support</h3>
            <div className="contact-item">
              <MapPin className="contact-icon" size={20} />
              <span>123 Smart Avenue, Tech District, City Center</span>
            </div>
            <div className="contact-item">
              <Phone className="contact-icon" size={20} />
              <span>1800-SMART-CITY (Toll Free)</span>
            </div>
            <div className="contact-item">
              <Mail className="contact-icon" size={20} />
              <span>support@smartcity.gov</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Smart City Services Portal. Final Year Engineering Project.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
