import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import WellnessGuide from './pages/WellnessGuide';
import ConditionDetail from './pages/ConditionDetail';
import Booking from './pages/Booking';
import Packages from './pages/Packages';
import Account from './pages/Account';
import EmailGate from './components/EmailGate';
import storage from './utils/storage';

// Mock data imports
import locationData from './data/location.json';
import userProfileData from './data/userProfile.json';
import packagesData from './data/packages.json';
import conditionsData from './data/conditions.json';
import availabilityData from './data/availability.json';

function App() {
  const [userEmail, setUserEmail] = useState(null);
  const [showEmailGate, setShowEmailGate] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [location] = useState(locationData);
  const [userProfile] = useState(userProfileData);
  const [packages] = useState(packagesData);
  const [conditions] = useState(conditionsData);
  const [availability] = useState(availabilityData);

  // Check for existing email on mount
  useEffect(() => {
    const savedEmail = storage.getItem('userEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
      setShowEmailGate(false);
    }
  }, []);

  const handleEmailSubmit = (email) => {
    setUserEmail(email);
    setShowEmailGate(false);
  };

  const handleSwitchUser = () => {
    if (window.confirm('Switch user? Your current data will remain saved for this email.')) {
      storage.removeItem('userEmail');
      setUserEmail(null);
      setShowEmailGate(true);
    }
  };

  const navigate = (page, data = null) => {
    if (page === 'condition' && data) {
      setSelectedCondition(data);
      setCurrentPage('condition');
    } else if (page === 'booking' && data) {
      setSelectedCondition(data.condition || null);
      setSelectedProtocol(data.protocol || null);
      setCurrentPage('booking');
    } else {
      setCurrentPage(page);
    }
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
          conditions={conditions}
          navigate={navigate}
        />;
      case 'condition':
        return <ConditionDetail 
          condition={selectedCondition}
          packages={packages}
          navigate={navigate}
        />;
      case 'booking':
        return <Booking 
          condition={selectedCondition}
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
      {showEmailGate && <EmailGate onEmailSubmit={handleEmailSubmit} />}
      
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">💧✨ Water & Light</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {userEmail && (
              <button 
                onClick={handleSwitchUser}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                title={`Logged in as ${userEmail}`}
              >
                <span>{userEmail.split('@')[0]}</span>
                <span style={{ opacity: 0.7 }}>⚙️</span>
              </button>
            )}
            <button className="location-btn" onClick={() => navigate('account')}>
              <span className="location-icon">📍</span>
              <span className="location-name">{location.city}</span>
            </button>
          </div>
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
          className="nav-btn"
          onClick={() => {
            const feedbackEmail = `mailto:mojumedia@gmail.com?subject=Water%20%26%20Light%20App%20Feedback&body=Logged%20in%20as%3A%20${encodeURIComponent(userEmail || 'Not logged in')}%0A%0A---%0APlease%20share%20your%20feedback%20below%3A%0A%0A`;
            window.location.href = feedbackEmail;
          }}
        >
          <span className="nav-icon">💬</span>
          <span className="nav-label">Feedback</span>
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
