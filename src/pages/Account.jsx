function Account({ userProfile, location, navigate }) {
  return (
    <div className="page account-page">
      <div className="page-header">
        <h2>👤 Account</h2>
        <p className="subtitle">Manage your profile and settings</p>
      </div>

      <div className="profile-section card">
        <div className="profile-header">
          <div className="profile-avatar">
            {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
          </div>
          <div className="profile-info">
            <h3>{userProfile.firstName} {userProfile.lastName}</h3>
            <p>{userProfile.email}</p>
            <p>{userProfile.phone}</p>
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
