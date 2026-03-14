import { useState } from 'react';

function ProtocolDetail({ protocol, packages, navigate }) {
  const [savedMessage, setSavedMessage] = useState('');

  const handleSaveToDashboard = () => {
    // Parse frequencies and save to dashboard
    const freqArray = protocol.frequencies.split(',').map(f => f.trim());
    const frequencies = {
      freq1: freqArray[0] || '',
      freq2: freqArray[1] || '',
      freq3: freqArray[2] || '',
      freq4: freqArray[3] || ''
    };
    
    // Save to localStorage
    localStorage.setItem('sessionFrequencies', JSON.stringify(frequencies));
    localStorage.setItem('selectedCondition', protocol.id);
    
    // Show confirmation message
    setSavedMessage('✓ Frequencies saved to dashboard!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  if (!protocol) {
    return (
      <div className="page protocol-detail-page">
        <div className="error-state">
          <h2>Protocol not found</h2>
          <button className="btn primary" onClick={() => navigate('wellness')}>
            Back to Wellness Guide
          </button>
        </div>
      </div>
    );
  }

  const suggestedPackage = packages.find(p => p.id === protocol.suggestedPackageId);

  return (
    <div className="page protocol-detail-page">
      <button className="back-btn" onClick={() => navigate('wellness')}>
        ← Back to Search
      </button>

      <div className="protocol-hero">
        <span className="protocol-category-badge">{protocol.category}</span>
        <h1 className="protocol-title">{protocol.ailmentName}</h1>
        <p className="protocol-subtitle">Personalized light therapy protocol</p>
      </div>

      <div className="protocol-summary card">
        <h2>Treatment Overview</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-icon">📅</div>
            <div className="summary-content">
              <div className="summary-value">{protocol.frequencyPerWeek}x per week</div>
              <div className="summary-label">Frequency</div>
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-icon">⏱️</div>
            <div className="summary-content">
              <div className="summary-value">{protocol.durationMinutes} min</div>
              <div className="summary-label">Session Duration</div>
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-icon">🗓️</div>
            <div className="summary-content">
              <div className="summary-value">{protocol.recommendedWeeks} weeks</div>
              <div className="summary-label">Program Length</div>
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-icon">🎯</div>
            <div className="summary-content">
              <div className="summary-value">{protocol.totalSuggestedSessions}</div>
              <div className="summary-label">Total Sessions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="protocol-details-section card">
        <h2>About This Protocol</h2>
        <p className="protocol-notes">{protocol.notes}</p>
        
        <div className="protocol-tags-section">
          <h3>Addresses</h3>
          <div className="tags-list">
            {protocol.tags.map((tag, index) => (
              <span key={index} className="tag large">{tag}</span>
            ))}
          </div>
        </div>

        <div className="technical-info">
          <h3>Technical Details</h3>
          <div className="tech-detail">
            <span className="tech-label">Frequencies:</span>
            <span className="tech-value">{protocol.frequencies} Hz</span>
          </div>
        </div>
      </div>

      {suggestedPackage && (
        <div className="suggested-package card highlight">
          <h2>💡 Recommended Package</h2>
          <div className="package-suggestion">
            <div className="package-header">
              <div className="package-name-section">
                <div className="package-name">{suggestedPackage.name}</div>
                {suggestedPackage.badge && (
                  <span className="package-badge">{suggestedPackage.badge}</span>
                )}
              </div>
              <div className="package-price">{suggestedPackage.priceDisplay}</div>
            </div>
            <div className="package-details">
              <div className="package-sessions">
                {suggestedPackage.sessionsIncluded} sessions ({suggestedPackage.perSessionPrice} per session)
              </div>
              <div className="package-description">{suggestedPackage.description}</div>
            </div>
            <div className="package-match">
              ✓ Perfect for this {protocol.recommendedWeeks}-week protocol ({protocol.totalSuggestedSessions} sessions)
            </div>
          </div>
        </div>
      )}

      {savedMessage && (
        <div style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          fontWeight: '600',
          marginBottom: '1rem',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {savedMessage}
        </div>
      )}

      <div className="action-buttons">
        <button 
          className="btn primary large"
          onClick={() => navigate('booking', protocol)}
        >
          Book This Protocol →
        </button>
        <button 
          className="btn secondary large"
          onClick={handleSaveToDashboard}
        >
          💾 Save to Dashboard
        </button>
        <button 
          className="btn secondary large"
          onClick={() => navigate('packages')}
        >
          View All Packages
        </button>
      </div>
    </div>
  );
}

export default ProtocolDetail;
