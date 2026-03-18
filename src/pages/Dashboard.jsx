import { useState, useEffect } from 'react';
import protocolsData from '../data/protocols.json';
import storage from '../utils/storage';

function Dashboard({ userProfile, location, navigate, frequencyDatabase = [] }) {
  const userEmail = storage.getItem('userEmail') || '';
  const username = userEmail.split('@')[0] || 'User';
  
  const [channels, setChannels] = useState([
    { freq: '', duty: '', duration: '' },
    { freq: '', duty: '', duration: '' },
    { freq: '', duty: '', duration: '' },
    { freq: '', duty: '', duration: '' },
    { freq: '', duty: '', duration: '' },
    { freq: '', duty: '', duration: '' },
    { freq: '', duty: '', duration: '' },
    { freq: '', duty: '', duration: '' }
  ]);
  const [selectedCondition, setSelectedCondition] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [lastBookedProtocol, setLastBookedProtocol] = useState(null);
  const [conditionFilter, setConditionFilter] = useState('');
  const [showConditionResults, setShowConditionResults] = useState(false);

  // Load saved channels and condition from localStorage on mount
  useEffect(() => {
    const savedChannels = storage.getItem('sessionChannels');
    const savedCondition = storage.getItem('selectedCondition');
    const bookedProtocol = storage.getItem('lastBookedProtocol');
    
    if (savedChannels) {
      setChannels(JSON.parse(savedChannels));
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

  // Handle channel field changes
  const handleChannelChange = (channelIndex, field, value) => {
    const updated = [...channels];
    updated[channelIndex] = { ...updated[channelIndex], [field]: value };
    setChannels(updated);
    storage.setItem('sessionChannels', JSON.stringify(updated));
  };

  // Handle condition selection and auto-populate channels
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
        
        // Populate all 8 channels with frequencies only
        // Keep duty and duration empty (user fills these)
        const updated = channels.map((channel, idx) => ({
          freq: freqArray[idx] || '',
          duty: channel.duty,
          duration: channel.duration
        }));
        
        setChannels(updated);
        storage.setItem('sessionChannels', JSON.stringify(updated));
      }
    }
  };

  // Save current session to history
  const saveSession = () => {
    // Get existing history
    const historyRaw = storage.getItem('sessionHistory');
    const history = historyRaw ? JSON.parse(historyRaw) : [];
    
    // Get condition name
    const protocol = protocolsData.find(p => p.id === selectedCondition);
    const conditionName = protocol ? protocol.ailmentName : selectedCondition || 'Custom';
    
    if (editingSessionId) {
      // UPDATE existing session
      const sessionIndex = history.findIndex(s => s.id === editingSessionId);
      if (sessionIndex !== -1) {
        history[sessionIndex] = {
          id: editingSessionId,
          date: sessionDate,
          condition: conditionName,
          channels: channels
        };
      }
      setEditingSessionId(null);
    } else {
      // CREATE new session
      const session = {
        id: Date.now(),
        date: sessionDate,
        condition: conditionName,
        channels: channels
      };
      
      // Add to beginning of array
      history.unshift(session);
      
      // Keep only last 10
      history.splice(10);
    }
    
    // Save back
    storage.setItem('sessionHistory', JSON.stringify(history));
    
    // Reload history
    loadHistory();
  };

  // Load a saved session for editing
  const loadSession = (session) => {
    setChannels(session.channels);
    storage.setItem('sessionChannels', JSON.stringify(session.channels));
    
    // Set date from session
    setSessionDate(session.date);
    
    // Track which session is being edited
    setEditingSessionId(session.id);
    
    // Try to find matching condition
    const protocol = protocolsData.find(p => p.ailmentName === session.condition);
    if (protocol) {
      setSelectedCondition(protocol.id);
      storage.setItem('selectedCondition', protocol.id);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingSessionId(null);
    setSessionDate(new Date().toISOString().split('T')[0]);
    // Clear channels
    const emptyChannels = Array(8).fill(null).map(() => ({ freq: '', duty: '', duration: '' }));
    setChannels(emptyChannels);
    storage.setItem('sessionChannels', JSON.stringify(emptyChannels));
    setSelectedCondition('');
  };

  // Load history
  const [sessionHistory, setSessionHistory] = useState([]);
  
  const loadHistory = () => {
    const historyRaw = storage.getItem('sessionHistory');
    if (historyRaw) {
      setSessionHistory(JSON.parse(historyRaw));
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="page dashboard-page">
      <div className="welcome-section">
        <h2>Welcome back, {username}! 👋</h2>
        <p className="subtitle">Your wellness journey continues</p>
      </div>



      {sessionHistory.length > 0 && (
        <div className="card saved-sessions">
          <div className="card-header">
            <h3>Previous Sessions</h3>
            <span className="badge">{sessionHistory.length}/10</span>
          </div>
          <div className="sessions-scroll">
            {sessionHistory.map((session) => (
              <div key={session.id} className="session-card" onClick={() => loadSession(session)}>
                <div className="session-card-header">
                  <div className="session-condition">{session.condition}</div>
                  <div className="session-date">
                    {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div className="session-preview">
                  {session.channels.filter(ch => ch.freq).map((ch, i) => (
                    <div key={i} className="preview-channel">
                      <span className="preview-freq">{ch.freq} Hz</span>
                      {ch.duty && <span className="preview-duty">D: {ch.duty}</span>}
                      {ch.duration && <span className="preview-duration">{ch.duration}m</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card session-frequencies">
        <div className="card-header">
          <h3>Session Frequencies</h3>
          <div className="save-controls">
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="session-date-input"
            />
            {editingSessionId && (
              <button onClick={cancelEdit} className="cancel-edit-btn">
                Cancel
              </button>
            )}
            <button onClick={saveSession} className="save-session-btn">
              {editingSessionId ? '✓ Update' : 'Save'}
            </button>
          </div>
        </div>
        {editingSessionId && (
          <div className="editing-notice">
            ✏️ Editing saved session - modify channels and click Update to save changes
          </div>
        )}
        <p className="frequency-help">Select a condition to auto-fill frequencies, or enter manually</p>
        
        <div className="condition-select-group">
          <label htmlFor="condition">Select Condition or Protocol</label>
          
          {/* Show selected condition */}
          {selectedCondition && !showConditionResults ? (
            <div className="selected-condition-display">
              <div className="selected-condition-text">
                {(() => {
                  const protocol = protocolsData.find(p => p.id === selectedCondition);
                  if (protocol) {
                    return (
                      <>
                        <span className="selected-badge protocol-badge-inline">Protocol</span>
                        {protocol.ailmentName}
                      </>
                    );
                  } else {
                    return (
                      <>
                        <span className="selected-badge condition-badge-inline">Condition</span>
                        {selectedCondition}
                      </>
                    );
                  }
                })()}
              </div>
              <button 
                className="change-condition-btn"
                onClick={() => {
                  setShowConditionResults(true);
                  setConditionFilter('');
                }}
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <div className="condition-filter-input">
                <span className="filter-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Type to search conditions..."
                  value={conditionFilter}
                  onChange={(e) => {
                    setConditionFilter(e.target.value);
                    setShowConditionResults(true);
                  }}
                  onFocus={() => setShowConditionResults(true)}
                  className="condition-filter"
                  autoFocus
                />
                {conditionFilter && (
                  <button 
                    className="clear-filter-btn"
                    onClick={() => setConditionFilter('')}
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {showConditionResults && (
                <div className="condition-results">
                  {(() => {
                    const term = conditionFilter.toLowerCase().trim();
                    const results = [];
                    
                    // Add matching protocols first
                    const matchingProtocols = protocolsData
                      .filter(p => !term || p.ailmentName.toLowerCase().includes(term))
                      .sort((a, b) => a.ailmentName.localeCompare(b.ailmentName))
                      .map(p => ({ type: 'protocol', data: p }));
                    
                    // Add matching database conditions
                    const matchingConditions = frequencyDatabase
                      .filter(c => !term || c.condition.toLowerCase().includes(term))
                      .filter(c => !protocolsData.some(p => 
                        p.ailmentName.toLowerCase() === c.condition.toLowerCase()
                      ))
                      .sort((a, b) => a.condition.localeCompare(b.condition))
                      .map(c => ({ type: 'condition', data: c }));
                    
                    // Combine: protocols first, then database conditions
                    results.push(...matchingProtocols, ...matchingConditions);
                    
                    return results.slice(0, 100).map((result, index) => {
                      if (result.type === 'protocol') {
                        const protocol = result.data;
                        return (
                          <div
                            key={`p-${protocol.id}`}
                            className="condition-result-item"
                            onClick={() => {
                              handleConditionChange({ target: { value: protocol.id } });
                              setShowConditionResults(false);
                              setConditionFilter('');
                            }}
                          >
                            <div className="condition-result-name">{protocol.ailmentName}</div>
                            <div className="condition-result-category">
                              <span className="protocol-badge">Protocol</span> {protocol.category}
                            </div>
                          </div>
                        );
                      } else {
                        const condition = result.data;
                        return (
                          <div
                            key={`c-${index}`}
                            className="condition-result-item"
                            onClick={() => {
                              // Save database condition
                              const freqArray = condition.frequencies.split(',').map(f => f.trim());
                              const newChannels = Array(8).fill(null).map((_, i) => ({
                                freq: freqArray[i] || '',
                                duty: '',
                                duration: ''
                              }));
                              
                              setChannels(newChannels);
                              setSelectedCondition(condition.condition);
                              storage.setItem('sessionChannels', JSON.stringify(newChannels));
                              storage.setItem('selectedCondition', condition.condition);
                              
                              setShowConditionResults(false);
                              setConditionFilter('');
                            }}
                          >
                            <div className="condition-result-name">{condition.condition}</div>
                            <div className="condition-result-category">
                              <span className="condition-badge">Condition</span> Database
                            </div>
                          </div>
                        );
                      }
                    });
                  })()}
                  
                  {conditionFilter && 
                    protocolsData.filter(p => p.ailmentName.toLowerCase().includes(conditionFilter.toLowerCase())).length === 0 &&
                    frequencyDatabase.filter(c => c.condition.toLowerCase().includes(conditionFilter.toLowerCase())).length === 0 && (
                    <div className="no-condition-results">
                      No matches found. Try different keywords.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
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

        <div className="channels-grid">
          {channels.map((channel, idx) => (
            <div key={idx} className="channel-row">
              <div className="channel-label">Channel {idx + 1}</div>
              <div className="channel-inputs">
                <div className="channel-input-group">
                  <label htmlFor={`freq-${idx}`}>Frequency</label>
                  <input
                    type="number"
                    id={`freq-${idx}`}
                    placeholder="Hz"
                    value={channel.freq}
                    onChange={(e) => handleChannelChange(idx, 'freq', e.target.value)}
                    className="channel-input"
                  />
                </div>
                <div className="channel-input-group">
                  <label htmlFor={`duty-${idx}`}>Duty</label>
                  <input
                    type="number"
                    id={`duty-${idx}`}
                    placeholder=""
                    value={channel.duty}
                    onChange={(e) => handleChannelChange(idx, 'duty', e.target.value)}
                    className="channel-input"
                  />
                </div>
                <div className="channel-input-group">
                  <label htmlFor={`duration-${idx}`}>Duration</label>
                  <input
                    type="number"
                    id={`duration-${idx}`}
                    placeholder="min"
                    value={channel.duration}
                    onChange={(e) => handleChannelChange(idx, 'duration', e.target.value)}
                    className="channel-input"
                  />
                </div>
              </div>
            </div>
          ))}
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
