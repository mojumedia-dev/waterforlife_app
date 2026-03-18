import { useState, useMemo, useEffect } from 'react';
import protocolsData from '../data/protocols.json';
import storage from '../utils/storage';

function WellnessGuide({ conditions, navigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedConditionId, setSavedConditionId] = useState(null);
  const [frequencyDatabase, setFrequencyDatabase] = useState([]);

  // Load frequency database CSV on mount
  useEffect(() => {
    fetch('/assets/frequency_database.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.split('\n');
        const data = [];
        
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Simple CSV parsing
          const fields = [];
          let currentField = '';
          let inQuotes = false;
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              fields.push(currentField);
              currentField = '';
            } else {
              currentField += char;
            }
          }
          fields.push(currentField);
          
          if (fields.length >= 2) {
            data.push({
              condition: fields[0].replace(/^"|"$/g, ''),
              frequencies: fields[1].replace(/^"|"$/g, '')
            });
          }
        }
        
        setFrequencyDatabase(data);
      })
      .catch(err => console.error('Failed to load frequency database:', err));
  }, []);

  // Get unique categories from structured conditions
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(conditions.map(c => c.category))];
    return cats;
  }, [conditions]);

  // Filter conditions based on search and category
  const filteredConditions = useMemo(() => {
    let filtered = conditions;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // Filter by search term (including frequencies)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.conditionName.toLowerCase().includes(term) ||
        c.bodySystem.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term) ||
        c.tags.some(tag => tag.toLowerCase().includes(term)) ||
        // Search within frequency values
        c.protocols.some(protocol => 
          protocol.frequencies.toLowerCase().includes(term)
        )
      );
    }

    return filtered;
  }, [conditions, searchTerm, selectedCategory]);

  // Search frequency database
  const frequencyResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return frequencyDatabase.filter(entry =>
      entry.condition.toLowerCase().includes(term) ||
      entry.frequencies.includes(term)
    ).slice(0, 50); // Limit to 50 results
  }, [frequencyDatabase, searchTerm]);

  // Combine results - show structured conditions first, then frequency database matches
  const allResults = useMemo(() => {
    const results = [];
    
    // Add structured conditions
    filteredConditions.forEach(cond => {
      results.push({ type: 'condition', data: cond });
    });
    
    // Add frequency database results that don't match structured conditions
    if (searchTerm.trim()) {
      frequencyResults.forEach(freqEntry => {
        // Check if this condition already exists in structured results
        const alreadyExists = filteredConditions.some(c => 
          c.conditionName.toLowerCase() === freqEntry.condition.toLowerCase()
        );
        
        if (!alreadyExists) {
          results.push({ type: 'frequency', data: freqEntry });
        }
      });
    }
    
    return results;
  }, [filteredConditions, frequencyResults, searchTerm]);

  const handleConditionClick = (condition) => {
    navigate('condition', condition);
  };

  const handleSaveToDashboard = (e, condition) => {
    e.stopPropagation();
    
    const protocol = condition.protocols[0];
    const freqArray = protocol.frequencies.split(',').map(f => f.trim());
    const channels = Array(8).fill(null).map((_, i) => ({
      freq: freqArray[i] || '',
      duty: '',
      duration: ''
    }));
    
    const matchingProtocol = protocolsData.find(
      p => p.ailmentName.toLowerCase() === condition.conditionName.toLowerCase()
    );
    
    storage.setItem('sessionChannels', JSON.stringify(channels));
    
    if (matchingProtocol) {
      storage.setItem('selectedCondition', matchingProtocol.id);
    } else {
      storage.setItem('selectedCondition', condition.conditionName);
    }
    
    setSavedConditionId(condition.id);
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
        <p className="subtitle">Search 6,000+ conditions, symptoms, or frequencies (Hz)</p>
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
              if (result.type === 'condition') {
                const condition = result.data;
                return (
                  <div 
                    key={`cond-${condition.id}`}
                    className="protocol-card condition-card"
                    onClick={() => handleConditionClick(condition)}
                  >
                    <div className="protocol-header">
                      <h3 className="protocol-name">{condition.conditionName}</h3>
                      <span className="protocol-category">Protocol</span>
                    </div>
                    
                    <p className="condition-description">{condition.description}</p>
                    
                    <div className="protocol-info">
                      <div className="info-item">
                        <span className="icon">📊</span>
                        <span>{condition.protocols.length} protocol{condition.protocols.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="info-item">
                        <span className="icon">⏱️</span>
                        <span>{condition.protocols[0].durationMinutes} min sessions</span>
                      </div>
                      <div className="info-item">
                        <span className="icon">📅</span>
                        <span>{condition.protocols[0].frequencyPerWeek}x per week</span>
                      </div>
                    </div>

                    <div className="protocol-tags">
                      {condition.tags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="tag">{tag}</span>
                      ))}
                    </div>
                    
                    {savedConditionId === condition.id && (
                      <div className="saved-notice">
                        ✓ Saved to dashboard!
                      </div>
                    )}

                    <div className="protocol-footer">
                      <button 
                        className="btn secondary"
                        onClick={(e) => handleSaveToDashboard(e, condition)}
                      >
                        💾 Save
                      </button>
                      <span className="sessions-total">
                        View protocols & book
                      </span>
                      <span className="arrow">→</span>
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
