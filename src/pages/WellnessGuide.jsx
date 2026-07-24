import { useState, useMemo, useEffect } from 'react';
import protocolsData from '../data/protocols.json';
import storage from '../utils/storage';

function WellnessGuide({ conditions, navigate, frequencyDatabase = [], initialSearchTerm = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedConditionId, setSavedConditionId] = useState(null);

  // If a freq-click on ConditionDetail routed here with a Hz value, sync it
  // once so the search input shows the value and results filter to it.
  useEffect(() => {
    if (initialSearchTerm && initialSearchTerm !== searchTerm) {
      setSearchTerm(initialSearchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearchTerm]);

  // Get unique categories from protocols
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(protocolsData.map(p => p.category))];
    return cats;
  }, []);

  // Per-word matcher: numeric words match against exact frequency tokens
  // (so "72" doesn't also match "172", "720", "727"); text words match as a
  // substring against the searchable text. Users mix both freely
  // ("anxiety 72" → anxiety-related conditions that use frequency 72).
  const wordMatches = (word, textLower, freqTokens) => {
    if (/^\d+(\.\d+)?$/.test(word)) {
      return freqTokens.has(word);
    }
    return textLower.includes(word);
  };

  const parseFreqTokens = (freqStr) => {
    if (!freqStr) return new Set();
    return new Set(
      String(freqStr).split(/[,\s]+/).map(t => t.trim().replace(/[^0-9.]/g, '')).filter(Boolean)
    );
  };

  // Filter protocols based on search and category
  const filteredProtocols = useMemo(() => {
    let filtered = protocolsData;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search term - word-order independent, numeric words match
    // exact frequency tokens, text words match against name/category/notes.
    if (searchTerm.trim()) {
      const words = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length > 0);
      filtered = filtered.filter(p => {
        const textLower = `${p.ailmentName} ${p.category}`.toLowerCase();
        const freqTokens = parseFreqTokens(p.frequencies);
        return words.every(word => wordMatches(word, textLower, freqTokens));
      });
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  // Search frequency database (~6320 rows). No hard result cap — a bare
  // frequency search (e.g. "72") should return every condition that uses
  // that frequency, not just the alphabetically-first 50.
  const frequencyResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const words = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    return frequencyDatabase.filter(entry => {
      const textLower = String(entry.condition || '').toLowerCase();
      const freqTokens = parseFreqTokens(entry.frequencies);
      return words.every(word => wordMatches(word, textLower, freqTokens));
    });
  }, [frequencyDatabase, searchTerm]);

  // Combine results - show protocols first, then frequency database matches
  const allResults = useMemo(() => {
    const results = [];
    
    // Add protocols
    filteredProtocols.forEach(protocol => {
      results.push({ type: 'protocol', data: protocol });
    });
    
    // Add frequency database results that don't match protocols
    if (searchTerm.trim()) {
      frequencyResults.forEach(freqEntry => {
        // Check if this condition already exists in protocol results
        const alreadyExists = filteredProtocols.some(p => 
          p.ailmentName.toLowerCase() === freqEntry.condition.toLowerCase()
        );
        
        if (!alreadyExists) {
          results.push({ type: 'frequency', data: freqEntry });
        }
      });
    }
    
    return results;
  }, [filteredProtocols, frequencyResults, searchTerm]);

  const handleProtocolSave = (e, protocol) => {
    e.stopPropagation();
    
    const freqArray = protocol.frequencies.split(',').map(f => f.trim());
    const channels = Array(8).fill(null).map((_, i) => ({
      freq: freqArray[i] || '',
      duty: '',
      duration: ''
    }));
    
    storage.setItem('sessionChannels', JSON.stringify(channels));
    storage.setItem('selectedCondition', protocol.id);
    
    setSavedConditionId(protocol.id);
    setTimeout(() => setSavedConditionId(null), 2500);
  };

  const handleFrequencySave = (e, freqEntry) => {
    e.stopPropagation();
    
    const freqArray = freqEntry.frequencies.split(',').map(f => f.trim());
    const channels = Array(8).fill(null).map((_, i) => ({
      freq: freqArray[i] || '',
      duty: '',
      duration: ''
    }));
    
    storage.setItem('sessionChannels', JSON.stringify(channels));
    storage.setItem('selectedCondition', freqEntry.condition);
    
    setSavedConditionId(freqEntry.condition);
    setTimeout(() => setSavedConditionId(null), 2500);
  };

  return (
    <div className="page wellness-guide-page">
      <div className="page-header">
        <h2>🔍 Wellness Guide</h2>
        <p className="subtitle">Search 6,400+ conditions, protocols, and frequencies (Hz)</p>
      </div>

      <div className="search-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search conditions, symptoms, frequencies (Hz), or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-btn"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="results-section">
        <div className="results-header">
          <span className="results-count">
            Results
          </span>
        </div>

        {allResults.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No conditions found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="protocols-list">
            {allResults.map((result, index) => {
              if (result.type === 'protocol') {
                const protocol = result.data;
                const freqArray = protocol.frequencies.split(',').map(f => f.trim());
                
                return (
                  <div 
                    key={`prot-${protocol.id}`}
                    className="protocol-card"
                  >
                    <div className="protocol-header">
                      <h3 className="protocol-name">{protocol.ailmentName}</h3>
                      <span className="protocol-category">Protocol</span>
                    </div>
                    
                    <p className="condition-description">{protocol.description}</p>
                    
                    <div className="frequency-list">
                      <div className="frequency-list-label">Frequencies (Hz):</div>
                      <div className="frequency-chips">
                        {freqArray.map((freq, i) => (
                          <span key={i} className="frequency-chip">{freq}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="protocol-recommendations">
                      <div className="recommendation-item">
                        <strong>Intensity:</strong> {protocol.intensity}
                      </div>
                      <div className="recommendation-item">
                        <strong>Sessions:</strong> {protocol.sessionsPerWeek}x per week
                      </div>
                      <div className="recommendation-item">
                        <strong>Notes:</strong> {protocol.notes}
                      </div>
                    </div>
                    
                    {savedConditionId === protocol.id && (
                      <div className="saved-notice">
                        ✓ Saved to dashboard!
                      </div>
                    )}

                    <div className="protocol-footer">
                      <button 
                        className="btn secondary"
                        onClick={(e) => handleProtocolSave(e, protocol)}
                      >
                        💾 Save
                      </button>
                    </div>
                  </div>
                );
              } else {
                // Frequency database entry
                const freqEntry = result.data;
                const freqArray = freqEntry.frequencies.split(',').map(f => f.trim());
                
                return (
                  <div 
                    key={`freq-${index}`}
                    className="protocol-card frequency-card"
                  >
                    <div className="protocol-header">
                      <h3 className="protocol-name">{freqEntry.condition}</h3>
                      <span className="protocol-category" style={{ background: '#6366f1', color: 'white' }}>Condition</span>
                    </div>
                    
                    <div className="frequency-list">
                      <div className="frequency-list-label">Frequencies (Hz):</div>
                      <div className="frequency-chips">
                        {freqArray.map((freq, i) => (
                          <span key={i} className="frequency-chip">{freq}</span>
                        ))}
                      </div>
                    </div>
                    
                    {savedConditionId === freqEntry.condition && (
                      <div className="saved-notice">
                        ✓ Saved to dashboard!
                      </div>
                    )}

                    <div className="protocol-footer">
                      <button 
                        className="btn secondary"
                        onClick={(e) => handleFrequencySave(e, freqEntry)}
                      >
                        💾 Save to Dashboard
                      </button>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default WellnessGuide;
