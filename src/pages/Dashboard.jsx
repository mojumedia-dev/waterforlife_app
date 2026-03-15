import { useState, useEffect } from 'react';
import protocolsData from '../data/protocols.json';
import storage from '../utils/storage';

function Dashboard({ userProfile, location, navigate }) {
  const userEmail = storage.getItem('userEmail') || '';
  const username = userEmail.split('@')[0] || 'User';
  
  const [frequencies, setFrequencies] = useState({
    freq1: '',
    freq2: '',
    freq3: '',
    freq4: ''
  });
  const [selectedCondition, setSelectedCondition] = useState('');
  const [lastBookedProtocol, setLastBookedProtocol] = useState(null);

  // Load saved frequencies and condition from localStorage on mount
  useEffect(() => {
    const savedFreqs = storage.getItem('sessionFrequencies');
    const savedCondition = storage.getItem('selectedCondition');
    const bookedProtocol = storage.getItem('lastBookedProtocol');
    
    if (savedFreqs) {
      setFrequencies(JSON.parse(savedFreqs));
    }
    
    if (savedCondition) {
      // Try to find protocol by ID first
      let protocol = protocolsData.find(p => p.id === savedCondition);
      
      // If not found by ID, try matching by ailmentName (fallback for name-based saves)
      if (!protocol) {
        protocol = protocolsData.find(
          p => p.ailmentName.toLowerCase() === savedCondition.toLowerCase()
        );
        
        // If found by name, update localStorage with the proper ID
        if (protocol) {
          storage.setItem('selectedCondition', protocol.id);
          setSelectedCondition(protocol.id);
        } else {
          // Keep the saved value even if no match (user might have entered custom)
          setSelectedCondition(savedCondition);
        }
      } else {
        setSelectedCondition(savedCondition);
      }
    }
    
    if (bookedProtocol) {
      setLastBookedProtocol(JSON.parse(bookedProtocol));
    }
  }, []);

  // Save frequencies to localStorage whenever they change
  const handleFrequencyChange = (field, value) => {
    const updated = { ...frequencies, [field]: value };
    setFrequencies(updated);
    storage.setItem('sessionFrequencies', JSON.stringify(updated));
  };

  // Handle condition selection and auto-populate frequencies
  const handleConditionChange = (e) => {
    const conditionId = e.target.value;
    setSelectedCondition(conditionId);
    storage.setItem('selectedCondition', conditionId);

    if (conditionId) {
      // Find the selected protocol by ID or by ailmentName (fallback)
      let protocol = protocolsData.find(p => p.id === conditionId);
      
      // If not found by ID, try matching by ailmentName
      if (!protocol) {
        protocol = protocolsData.find(
          p => p.ailmentName.toLowerCase() === conditionId.toLowerCase()
        );
      }
      
      if (protocol && protocol.frequencies) {
        // Parse frequencies from comma-separated string
        const freqArray = protocol.frequencies.split(',').map(f => f.trim());
        
        // Populate the 4 frequency fields
        const updated = {
          freq1: freqArray[0] || '',
          freq2: freqArray[1] || '',
          freq3: freqArray[2] || '',
          freq4: freqArray[3] || ''
        };
        
        setFrequencies(updated);
        storage.setItem('sessionFrequencies', JSON.stringify(updated));
      }
    }
  };

  return (
    <div className="page dashboard-page">
      <div className="welcome-section">
        <h2>Welcome back, {username}! 👋</h2>
        <p className="subtitle">Your wellness journey continues</p>
      </div>



      <div className="card session-frequencies">
        <div className="card-header">
          <h3>Session Frequencies</h3>
          <span className="badge info">Hz</span>
        </div>
        <p className="frequency-help">Select a condition to auto-fill frequencies, or enter manually</p>
        
        <div className="condition-select-group">
          <label htmlFor="condition">Target Condition</label>
          <select
            id="condition"
            value={selectedCondition}
            onChange={handleConditionChange}
            className="condition-select"
          >
            <option value="">Select a condition...</option>
            {protocolsData.map(protocol => (
              <option key={protocol.id} value={protocol.id}>
                {protocol.ailmentName}
              </option>
            ))}
          </select>
        </div>

        {lastBookedProtocol && selectedCondition === lastBookedProtocol.protocolId && (
          <div className="booking-sync-notice" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>✨</span>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                Synced with Your Booking
              </div>
              <div style={{ fontSize: '0.9rem', opacity: '0.95' }}>
                These frequencies match your upcoming appointment for {lastBookedProtocol.conditionName}
              </div>
            </div>
          </div>
        )}

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
