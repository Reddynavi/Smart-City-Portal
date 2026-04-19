import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Moon, Sun, Menu, X, Bell } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Complaints', path: '/complaints' },
    { name: 'Bills', path: '/bills' },
    { name: 'Traffic', path: '/traffic' },
    { name: 'Parking', path: '/parking' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <Building2 className="logo-icon" size={32} />
          <span>SmartCity</span>
        </Link>

        <div className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`nav-link ${isActive(item.path)}`}
              onClick={closeMobileMenu}
            >
              {item.name}
            </Link>
          ))}
          <Link to="/login" className="btn btn-primary" onClick={closeMobileMenu}>Login</Link>
        </div>

        <div className="navbar-actions">
          <button className="theme-toggle" onClick={() => {}} title="Notifications">
            <Bell size={20} />
          </button>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
