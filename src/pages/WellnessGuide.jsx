import { useState, useMemo } from 'react';
import protocolsData from '../data/protocols.json';
import storage from '../utils/storage';

function WellnessGuide({ conditions, navigate, frequencyDatabase = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedConditionId, setSavedConditionId] = useState(null);

  // Get unique categories from protocols
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(protocolsData.map(p => p.category))];
    return cats;
  }, []);

  // Filter protocols based on search and category
  const filteredProtocols = useMemo(() => {
    let filtered = protocolsData;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search term (including frequencies) - word order independent
    if (searchTerm.trim()) {
      const words = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length > 0);
      
      filtered = filtered.filter(p => {
        const searchableText = `${p.ailmentName} ${p.category} ${p.frequencies}`.toLowerCase();
        // Match if ALL words appear somewhere in the searchable text
        return words.every(word => searchableText.includes(word));
      });
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  // Search frequency database
  const frequencyResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const words = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    return frequencyDatabase.filter(entry => {
      const searchableText = `${entry.condition} ${entry.frequencies}`.toLowerCase();
      // Match if ALL words appear somewhere in the searchable text
      return words.every(word => searchableText.includes(word));
    }).slice(0, 50); // Limit to 50 results
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
