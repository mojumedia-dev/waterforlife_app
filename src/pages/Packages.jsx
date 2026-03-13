function Packages({ packages, location, navigate }) {
  const handlePurchase = (pkg) => {
    // Redirect to Shopify product page
    window.location.href = pkg.shopifyUrl;
  };

  return (
    <div className="page packages-page">
      <button className="back-btn" onClick={() => navigate('dashboard')}>
        ← Back to Dashboard
      </button>

      <div className="page-header">
        <h2>💳 Session Packages</h2>
        <p className="subtitle">Choose the package that fits your wellness goals</p>
      </div>

      <div className="location-context card">
        <div className="context-icon">📍</div>
        <div className="context-content">
          <div className="context-name">{location.name}</div>
          <div className="context-address">{location.city}, {location.state}</div>
        </div>
      </div>

      <div className="packages-grid">
        {packages.map((pkg) => (
          <div key={pkg.id} className={`package-card ${pkg.badge ? 'featured' : ''}`}>
            {pkg.badge && (
              <div className="package-badge">{pkg.badge}</div>
            )}
            <div className="package-header">
              <h3 className="package-name">{pkg.name}</h3>
              <div className="package-price">
                <span className="price-amount">{pkg.priceDisplay}</span>
              </div>
            </div>
            <div className="package-body">
              <div className="package-sessions">
                <span className="sessions-count">{pkg.sessionsIncluded}</span>
                <span className="sessions-label">sessions included</span>
              </div>
              <div className="package-per-session">
                {pkg.perSessionPrice} per session
              </div>
              <p className="package-description">{pkg.description}</p>
            </div>
            <div className="package-footer">
              <button 
                className={`btn ${pkg.badge ? 'primary' : 'secondary'} large`}
                onClick={() => handlePurchase(pkg)}
              >
                Purchase Package
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="single-session-card card highlight">
        <h3>💡 Book a Single Session</h3>
        <p>Not ready to commit to a package? Try a single session first!</p>
        <div className="single-session-options">
          <div className="session-option">
            <span className="session-duration">15 minutes</span>
            <span className="session-price">$35</span>
          </div>
          <div className="session-option">
            <span className="session-duration">30 minutes</span>
            <span className="session-price">$65</span>
          </div>
          <div className="session-option">
            <span className="session-duration">60 minutes</span>
            <span className="session-price">$125</span>
          </div>
        </div>
        <a 
          href="https://waterlightforhealth.com/products/spectralight-therapy-bed-appointment-booking" 
          className="btn secondary large"
          style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}
        >
          Book Single Session
        </a>
      </div>

      <div className="package-info card">
        <h3>Package Information</h3>
        <ul className="info-list">
          <li>✓ Sessions never expire</li>
          <li>✓ Flexible scheduling - book when it works for you</li>
          <li>✓ Can be used for any protocol</li>
          <li>✓ Transferable to family members</li>
          <li>✓ Save 50% off single-session rates</li>
        </ul>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
          <strong>Single Sessions Available:</strong> 15 min ($35), 30 min ($65), 60 min ($125)
        </p>
      </div>

      <div className="contact-card card">
        <h3>Questions?</h3>
        <p>Our wellness team is here to help you choose the right package.</p>
        <div className="contact-options">
          <a href={`tel:${location.phone}`} className="contact-btn">
            📞 Call Us
          </a>
          <a href={`mailto:${location.supportEmail}`} className="contact-btn">
            ✉️ Email Us
          </a>
        </div>
      </div>
    </div>
  );
}

export default Packages;
