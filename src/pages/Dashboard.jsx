function Dashboard({ userProfile, location, navigate }) {
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
