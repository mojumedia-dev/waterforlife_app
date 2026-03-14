import { useState } from 'react';

function ConditionDetail({ condition, packages, navigate }) {
  const [savedProtocolId, setSavedProtocolId] = useState(null);

  const handleSaveToDashboard = (protocol) => {
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
    setSavedProtocolId(protocol.id);
    setTimeout(() => setSavedProtocolId(null), 3000);
  };

  if (!condition) {
    return (
      <div className="page">
        <h2>Condition not found</h2>
        <button className="btn primary" onClick={() => navigate('wellness')}>
          Back to Wellness Guide
        </button>
      </div>
    );
  }

  const suggestedPackage = packages.find(p => p.id === condition.suggestedPackageId);
  const maxSessions = Math.max(...condition.protocols.map(p => p.totalSessions));

  const handleBookProtocol = (protocol) => {
    navigate('booking', { condition, protocol });
  };

  return (
    <div className="page condition-detail-page">
      <button className="back-btn" onClick={() => navigate('wellness')}>
        ← Back to Wellness Guide
      </button>

      <div className="protocol-hero">
        <div className="protocol-category-badge">{condition.category}</div>
        <h1 className="protocol-title">{condition.conditionName}</h1>
        <p className="protocol-subtitle">{condition.description}</p>
      </div>

      <div className="condition-overview card">
        <h3>📊 Treatment Overview</h3>
        <div className="overview-grid">
          <div className="overview-item">
            <div className="overview-label">Available Protocols</div>
            <div className="overview-value">{condition.protocols.length}</div>
          </div>
          <div className="overview-item">
            <div className="overview-label">Sessions Per Week</div>
            <div className="overview-value">{condition.protocols[0].frequencyPerWeek}x</div>
          </div>
          <div className="overview-item">
            <div className="overview-label">Session Duration</div>
            <div className="overview-value">{condition.protocols[0].durationMinutes} min</div>
          </div>
          <div className="overview-item">
            <div className="overview-label">Recommended Weeks</div>
            <div className="overview-value">{condition.protocols[0].recommendedWeeks}</div>
          </div>
        </div>
      </div>

      <div className="tags-section card">
        <h3>🎯 Addresses These Symptoms</h3>
        <div className="tags-list">
          {condition.tags.map((tag, index) => (
            <span key={index} className="tag large">{tag}</span>
          ))}
        </div>
      </div>

      <div className="protocols-section">
        <h2>Available Frequency Protocols</h2>
        <p className="section-subtitle">
          We offer multiple frequency protocols for {condition.conditionName}. Each protocol uses different therapeutic frequencies from various research sources.
        </p>
        
        <div className="protocol-options">
          {condition.protocols.map((protocol, index) => (
            <div key={protocol.id} className="protocol-option-card card">
              <div className="protocol-option-header">
                <h3>{protocol.name}</h3>
                <span className="source-badge">{protocol.source}</span>
              </div>
              
              <div className="protocol-frequencies">
                <div className="freq-label">Therapeutic Frequencies (Hz):</div>
                <div className="freq-values">{protocol.frequencies}</div>
              </div>

              <div className="protocol-schedule">
                <div className="schedule-item">
                  <span className="icon">📅</span>
                  <span>{protocol.frequencyPerWeek}x per week</span>
                </div>
                <div className="schedule-item">
                  <span className="icon">⏱️</span>
                  <span>{protocol.durationMinutes} minutes</span>
                </div>
                <div className="schedule-item">
                  <span className="icon">🗓️</span>
                  <span>{protocol.recommendedWeeks} weeks</span>
                </div>
                <div className="schedule-item">
                  <span className="icon">📊</span>
                  <span>{protocol.totalSessions} total sessions</span>
                </div>
              </div>

              {savedProtocolId === protocol.id && (
                <div style={{
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  fontSize: '0.9rem'
                }}>
                  ✓ Frequencies saved to dashboard!
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn primary large"
                  onClick={() => handleBookProtocol(protocol)}
                  style={{ flex: 1 }}
                >
                  Book This Protocol
                </button>
                <button 
                  className="btn secondary large"
                  onClick={() => handleSaveToDashboard(protocol)}
                  style={{ flex: 1 }}
                >
                  💾 Save to Dashboard
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {suggestedPackage && (
        <div className="suggested-package card">
          <h3>💡 Recommended Package</h3>
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
            <div className="package-sessions">
              {suggestedPackage.sessionsIncluded} sessions included
            </div>
            <p className="package-description">{suggestedPackage.description}</p>
            <div className="package-match">
              ✓ This package covers the recommended {maxSessions}-session treatment program
            </div>
            <button 
              className="btn secondary large"
              onClick={() => navigate('packages')}
            >
              View Package Details
            </button>
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button 
          className="btn primary large"
          onClick={() => handleBookProtocol(condition.protocols[0])}
        >
          Book a Session Now
        </button>
        <button 
          className="btn secondary large"
          onClick={() => navigate('wellness')}
        >
          Browse Other Conditions
        </button>
      </div>
    </div>
  );
}

export default ConditionDetail;
