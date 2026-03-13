function Packages({ packages, location, navigate }) {
  const handlePurchase = (pkg) => {
    alert(`Purchase flow for ${pkg.name} would go here.\n\nIn production, this would connect to Shopify for secure checkout.`);
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

      <div className="package-info card">
        <h3>Package Information</h3>
        <ul className="info-list">
          <li>✓ Sessions never expire</li>
          <li>✓ Flexible scheduling - book when it works for you</li>
          <li>✓ Can be used for any protocol</li>
          <li>✓ Transferable to family members</li>
          <li>✓ Best value with larger packages</li>
        </ul>
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
