import { useState, useMemo, useEffect } from 'react';
import storage from '../utils/storage';

// Search over the full ingested conditions.json (3,688 ailments). Each result
// card is a clickable link that opens the Rife Frequency Summary page for
// that ailment. Frequency chips on cards filter the search inline.

function WellnessGuide({ conditions = [], navigate, frequencyDatabase = [], initialSearchTerm = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedConditionId, setSavedConditionId] = useState(null);

  // Sync when a freq-click on ConditionDetail routes here with a Hz value.
  useEffect(() => {
    if (initialSearchTerm && initialSearchTerm !== searchTerm) {
      setSearchTerm(initialSearchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearchTerm]);

  const categories = useMemo(() => {
    const set = new Set();
    for (const c of conditions) {
      if (c.category) set.add(c.category);
    }
    return ['all', ...[...set].sort()];
  }, [conditions]);

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

  // Roll a condition's protocols into a single searchable freq-token set.
  const conditionFreqTokens = (cond) => {
    const combined = (cond.protocols || []).map(p => p.frequencies).filter(Boolean).join(', ');
    return parseFreqTokens(combined);
  };

  // Combined-text search across name / body system / category / tags.
  const conditionSearchText = (cond) => {
    return [
      cond.conditionName,
      cond.bodySystem,
      cond.category,
      ...(cond.tags || []),
    ].filter(Boolean).join(' ').toLowerCase();
  };

  const filteredConditions = useMemo(() => {
    let filtered = conditions;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const words = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length > 0);
      filtered = filtered.filter(c => {
        const text = conditionSearchText(c);
        const freqs = conditionFreqTokens(c);
        return words.every(word => wordMatches(word, text, freqs));
      });
    }
    // Cap the render to keep the page snappy on searches with thousands of hits.
    return filtered.slice(0, 200);
  }, [conditions, searchTerm, selectedCategory]);

  // Total unfiltered hit count (before the 200-cap) so users know when more exist.
  const totalHits = useMemo(() => {
    let filtered = conditions;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const words = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length > 0);
      filtered = filtered.filter(c => {
        const text = conditionSearchText(c);
        const freqs = conditionFreqTokens(c);
        return words.every(word => wordMatches(word, text, freqs));
      });
    }
    return filtered.length;
  }, [conditions, searchTerm, selectedCategory]);

  const openCondition = (condition) => {
    navigate('condition', condition);
  };

  const handleFreqChipClick = (e, freq) => {
    e.stopPropagation();
    navigate('frequency', parseFloat(freq));
  };

  const handleSaveToDashboard = (e, condition) => {
    e.stopPropagation();
    const firstProtocol = condition.protocols?.[0];
    if (!firstProtocol) return;
    const freqArray = String(firstProtocol.frequencies || '').split(',').map(f => f.trim()).filter(Boolean);
    const channels = Array(8).fill(null).map((_, i) => ({
      freq: freqArray[i] || '',
      duty: '',
      duration: '',
    }));
    storage.setItem('sessionChannels', JSON.stringify(channels));
    storage.setItem('selectedCondition', condition.conditionName);
    setSavedConditionId(condition.id);
    setTimeout(() => setSavedConditionId(null), 2500);
  };

  return (
    <div className="page wellness-guide-page">
      <div className="page-header">
        <h2>🔍 Wellness Guide</h2>
        <p className="subtitle">Search {conditions.length.toLocaleString()} ailments and their frequencies.</p>
      </div>

      <div className="search-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search ailments, symptoms, or frequencies (Hz)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-btn"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="category-filters">
          {categories.slice(0, 12).map(category => (
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
            {totalHits === 0
              ? 'No results'
              : totalHits > filteredConditions.length
                ? `Showing ${filteredConditions.length} of ${totalHits.toLocaleString()} — refine your search to narrow down`
                : `${totalHits} result${totalHits === 1 ? '' : 's'}`}
          </span>
        </div>

        {filteredConditions.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No ailments found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="protocols-list">
            {filteredConditions.map(condition => {
              const uniqueFreqs = [...conditionFreqTokens(condition)]
                .map(f => parseFloat(f))
                .filter(f => !isNaN(f))
                .sort((a, b) => a - b);
              const sources = [...new Set((condition.protocols || []).map(p => p.source).filter(Boolean))];
              return (
                <div
                  key={condition.id}
                  className="protocol-card wellness-result-card"
                  onClick={() => openCondition(condition)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') openCondition(condition); }}
                >
                  <div className="protocol-header">
                    <h3 className="protocol-name">{condition.conditionName}</h3>
                    {condition.bodySystem && (
                      <span className="protocol-category">{condition.bodySystem}</span>
                    )}
                  </div>

                  {condition.description && (
                    <p className="condition-description">{condition.description}</p>
                  )}

                  <div className="frequency-list">
                    <div className="frequency-list-label">
                      {condition.protocols?.length || 0} protocol{condition.protocols?.length === 1 ? '' : 's'}
                      {' · '}
                      {uniqueFreqs.length} unique frequenc{uniqueFreqs.length === 1 ? 'y' : 'ies'} (Hz):
                    </div>
                    <div className="frequency-chips">
                      {uniqueFreqs.slice(0, 20).map(freq => (
                        <span
                          key={freq}
                          className="frequency-chip clickable"
                          onClick={(e) => handleFreqChipClick(e, freq)}
                          title={`Filter search to ${freq} Hz`}
                        >
                          {freq}
                        </span>
                      ))}
                      {uniqueFreqs.length > 20 && (
                        <span className="frequency-chip more">+{uniqueFreqs.length - 20} more</span>
                      )}
                    </div>
                  </div>

                  {savedConditionId === condition.id && (
                    <div className="saved-notice">
                      ✓ Saved to dashboard!
                    </div>
                  )}

                  <div className="protocol-footer">
                    <button
                      className="btn primary"
                      onClick={(e) => { e.stopPropagation(); openCondition(condition); }}
                    >
                      View Rife Frequency Summary →
                    </button>
                    <button
                      className="btn secondary"
                      onClick={(e) => handleSaveToDashboard(e, condition)}
                    >
                      💾 Save first protocol
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default WellnessGuide;
