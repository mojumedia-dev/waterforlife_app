import storage from '../utils/storage';

function Account({ userProfile, location, navigate }) {
  const userEmail = storage.getItem('userEmail') || '';
  const username = userEmail.split('@')[0] || 'User';
  
  return (
    <div className="page account-page">
      <div className="page-header">
        <h2>👤 Account</h2>
        <p className="subtitle">Manage your profile and settings</p>
      </div>

      <div className="profile-section card">
        <div className="profile-header">
          <div className="profile-avatar">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h3>{username}</h3>
            <p>{userEmail}</p>
          </div>
        </div>
      </div>

      <div className="location-section card">
        <h3>📍 Your Location</h3>
        <div className="current-location">
          <div className="location-badge">CURRENT</div>
          <div className="location-details">
            <div className="location-name">{location.name}</div>
            <div className="location-address">{location.address}</div>
            <div className="location-contact">
              <a href={`tel:${location.phone}`}>📞 {location.phone}</a>
            </div>
          </div>
        </div>
        <button className="btn secondary" disabled>
          Switch Location (Coming Soon)
        </button>
        <p className="help-text">
          Multiple location support will be available in the production version
        </p>
      </div>

      <div className="settings-section card">
        <h3>⚙️ Settings</h3>
        <div className="settings-list">
          <button className="setting-item" disabled>
            <span className="setting-icon">🔔</span>
            <span className="setting-label">Notifications</span>
            <span className="setting-arrow">→</span>
          </button>
          <button className="setting-item" disabled>
            <span className="setting-icon">🗓️</span>
            <span className="setting-label">Appointment Reminders</span>
            <span className="setting-arrow">→</span>
          </button>
          <button className="setting-item" disabled>
            <span className="setting-icon">💳</span>
            <span className="setting-label">Payment Methods</span>
            <span className="setting-arrow">→</span>
          </button>
          <button className="setting-item" disabled>
            <span className="setting-icon">📄</span>
            <span className="setting-label">Terms & Privacy</span>
            <span className="setting-arrow">→</span>
          </button>
        </div>
      </div>

      <div className="feedback-section card">
        <h3>💬 Help & Feedback</h3>
        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          We'd love to hear from you! Share your experience, report bugs, or suggest improvements.
        </p>
        <a 
          href={`mailto:mojumedia@gmail.com?subject=Water%20%26%20Light%20App%20Feedback&body=Logged%20in%20as%3A%20${encodeURIComponent(userEmail)}%0A%0A---%0APlease%20share%20your%20feedback%20below%3A%0A%0A`}
          className="btn primary large"
          style={{ 
            display: 'block',
            textAlign: 'center',
            textDecoration: 'none',
            width: '100%'
          }}
        >
          📧 Send Feedback via Email
        </a>
        <p style={{ 
          marginTop: '0.75rem', 
          fontSize: '0.85rem', 
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          Opens your email app with pre-filled subject
        </p>
      </div>

      <div className="prototype-notice card highlight">
        <h3>ℹ️ Prototype Note</h3>
        <p>
          This is a front-end prototype using mocked data. In production, this app will connect to:
        </p>
        <ul>
          <li>Shopify for package purchases</li>
          <li>Easy Appointment for real-time booking</li>
          <li>Google Calendar for appointment sync</li>
          <li>Live backend for user authentication</li>
          <li>Multiple locations with real availability</li>
        </ul>
      </div>

      <button className="btn secondary large" onClick={() => navigate('dashboard')}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default Account;
