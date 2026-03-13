import { useState } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import WellnessGuide from './pages/WellnessGuide';
import ProtocolDetail from './pages/ProtocolDetail';
import Booking from './pages/Booking';
import Packages from './pages/Packages';
import Account from './pages/Account';

// Mock data imports
import locationData from './data/location.json';
import userProfileData from './data/userProfile.json';
import packagesData from './data/packages.json';
import protocolsData from './data/protocols.json';
import availabilityData from './data/availability.json';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [location] = useState(locationData);
  const [userProfile] = useState(userProfileData);
  const [packages] = useState(packagesData);
  const [protocols] = useState(protocolsData);
  const [availability] = useState(availabilityData);

  const navigate = (page, data = null) => {
    if (data) {
      setSelectedProtocol(data);
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard 
          userProfile={userProfile} 
          location={location}
          navigate={navigate}
        />;
      case 'wellness':
        return <WellnessGuide 
          protocols={protocols}
          navigate={navigate}
        />;
      case 'protocol':
        return <ProtocolDetail 
          protocol={selectedProtocol}
          packages={packages}
          navigate={navigate}
        />;
      case 'booking':
        return <Booking 
          protocol={selectedProtocol}
          availability={availability}
          location={location}
          navigate={navigate}
        />;
      case 'packages':
        return <Packages 
          packages={packages}
          location={location}
          navigate={navigate}
        />;
      case 'account':
        return <Account 
          userProfile={userProfile}
          location={location}
          navigate={navigate}
        />;
      default:
        return <Dashboard 
          userProfile={userProfile} 
          location={location}
          navigate={navigate}
        />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">💧✨ Water & Light</h1>
          <button className="location-btn" onClick={() => navigate('account')}>
            <span className="location-icon">📍</span>
            <span className="location-name">{location.city}</span>
          </button>
        </div>
      </header>

      <main className="app-main">
        {renderPage()}
      </main>

      <nav className="bottom-nav">
        <button 
          className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigate('dashboard')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Dashboard</span>
        </button>
        <button 
          className={`nav-btn ${currentPage === 'booking' ? 'active' : ''}`}
          onClick={() => navigate('booking')}
        >
          <span className="nav-icon">📅</span>
          <span className="nav-label">Book</span>
        </button>
        <button 
          className={`nav-btn ${currentPage === 'wellness' ? 'active' : ''}`}
          onClick={() => navigate('wellness')}
        >
          <span className="nav-icon">🔍</span>
          <span className="nav-label">Wellness</span>
        </button>
        <button 
          className={`nav-btn ${currentPage === 'account' ? 'active' : ''}`}
          onClick={() => navigate('account')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Account</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
