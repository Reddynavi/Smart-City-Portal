import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Complaints from './pages/Complaints';
import BillPayment from './pages/BillPayment';
import TrafficUpdates from './pages/TrafficUpdates';
import SmartParking from './pages/SmartParking';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import './index.css';

function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <Router>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main className="page-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/bills" element={<BillPayment />} />
          <Route path="/traffic" element={<TrafficUpdates />} />
          <Route path="/parking" element={<SmartParking />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
