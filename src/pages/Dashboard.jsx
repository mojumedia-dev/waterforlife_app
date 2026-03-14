import { useState, useEffect } from 'react';

function Dashboard({ userProfile, location, navigate }) {
  const [frequencies, setFrequencies] = useState({
    freq1: '',
    freq2: '',
    freq3: '',
    freq4: ''
  });

  // Load saved frequencies from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sessionFrequencies');
    if (saved) {
      setFrequencies(JSON.parse(saved));
    }
  }, []);

  // Save frequencies to localStorage whenever they change
  const handleFrequencyChange = (field, value) => {
    const updated = { ...frequencies, [field]: value };
    setFrequencies(updated);
    localStorage.setItem('sessionFrequencies', JSON.stringify(updated));
  };

  return (
    <div className="page dashboard-page">
      <div className="welcome-section">
        <h2>Welcome back, {userProfile.firstName}! 👋</h2>
        <p className="subtitle">Your wellness journey continues</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-value">{userProfile.sessionsRemaining}</div>
          <div className="stat-label">Sessions Remaining</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{userProfile.currentPackage.sessionsUsed}</div>
          <div className="stat-label">Sessions Completed</div>
        </div>
      </div>

      {userProfile.upcomingAppointment && (
        <>
          <div className="card upcoming-appointment">
            <div className="card-header">
              <h3>Next Appointment</h3>
              <span className="badge upcoming">Upcoming</span>
            </div>
            <div className="appointment-details">
              <div className="detail-row">
                <span className="icon">📅</span>
                <span className="label">Date:</span>
                <span className="value">{new Date(userProfile.upcomingAppointment.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="detail-row">
                <span className="icon">🕐</span>
                <span className="label">Time:</span>
                <span className="value">{userProfile.upcomingAppointment.time}</span>
              </div>
              <div className="detail-row">
                <span className="icon">💡</span>
                <span className="label">Protocol:</span>
                <span className="value">{userProfile.upcomingAppointment.therapyType}</span>
              </div>
              <div className="detail-row">
                <span className="icon">⏱️</span>
                <span className="label">Duration:</span>
                <span className="value">{userProfile.upcomingAppointment.duration} minutes</span>
              </div>
            </div>
          </div>

          <div className="card session-frequencies">
            <div className="card-header">
              <h3>Session Frequencies</h3>
              <span className="badge info">Hz</span>
            </div>
            <p className="frequency-help">Enter the 4 frequencies you'll use for this session</p>
            <div className="frequency-inputs">
              <div className="frequency-input-group">
                <label htmlFor="freq1">Frequency 1</label>
                <input
                  type="number"
                  id="freq1"
                  placeholder="e.g., 528"
                  value={frequencies.freq1}
                  onChange={(e) => handleFrequencyChange('freq1', e.target.value)}
                  className="frequency-input"
                />
                <span className="unit">Hz</span>
              </div>
              <div className="frequency-input-group">
                <label htmlFor="freq2">Frequency 2</label>
                <input
                  type="number"
                  id="freq2"
                  placeholder="e.g., 432"
                  value={frequencies.freq2}
                  onChange={(e) => handleFrequencyChange('freq2', e.target.value)}
                  className="frequency-input"
                />
                <span className="unit">Hz</span>
              </div>
              <div className="frequency-input-group">
                <label htmlFor="freq3">Frequency 3</label>
                <input
                  type="number"
                  id="freq3"
                  placeholder="e.g., 396"
                  value={frequencies.freq3}
                  onChange={(e) => handleFrequencyChange('freq3', e.target.value)}
                  className="frequency-input"
                />
                <span className="unit">Hz</span>
              </div>
              <div className="frequency-input-group">
                <label htmlFor="freq4">Frequency 4</label>
                <input
                  type="number"
                  id="freq4"
                  placeholder="e.g., 741"
                  value={frequencies.freq4}
                  onChange={(e) => handleFrequencyChange('freq4', e.target.value)}
                  className="frequency-input"
                />
                <span className="unit">Hz</span>
              </div>
            </div>
            <p className="auto-save-note">✓ Saved automatically</p>
          </div>
        </>
      )}

      <div className="current-package-card card">
        <h3>Current Package</h3>
        <div className="package-info">
          <div className="package-name">{userProfile.currentPackage.name}</div>
          <div className="package-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(userProfile.currentPackage.sessionsUsed / userProfile.currentPackage.sessionsIncluded) * 100}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {userProfile.currentPackage.sessionsUsed} of {userProfile.currentPackage.sessionsIncluded} sessions used
            </div>
          </div>
          <div className="package-purchased">
            Purchased {new Date(userProfile.currentPackage.purchasedDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button className="action-btn primary" onClick={() => navigate('booking')}>
          <span className="btn-icon">📅</span>
          <span className="btn-text">Book Session</span>
        </button>
        <button className="action-btn" onClick={() => navigate('wellness')}>
          <span className="btn-icon">🔍</span>
          <span className="btn-text">Wellness Guide</span>
        </button>
        <button className="action-btn" onClick={() => navigate('packages')}>
          <span className="btn-icon">💳</span>
          <span className="btn-text">Buy Sessions</span>
        </button>
      </div>

      <div className="location-info card">
        <h3>📍 Your Location</h3>
        <div className="location-details">
          <div className="location-name">{location.name}</div>
          <div className="location-address">{location.address}</div>
          <div className="location-contact">
            <a href={`tel:${location.phone}`} className="contact-link">📞 {location.phone}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
