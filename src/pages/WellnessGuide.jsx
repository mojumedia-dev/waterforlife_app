import { useState, useMemo } from 'react';

function WellnessGuide({ protocols, navigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(protocols.map(p => p.category))];
    return cats;
  }, [protocols]);

  // Filter protocols based on search and category
  const filteredProtocols = useMemo(() => {
    let filtered = protocols;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.ailmentName.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [protocols, searchTerm, selectedCategory]);

  const handleProtocolClick = (protocol) => {
    navigate('protocol', protocol);
  };

  return (
    <div className="page wellness-guide-page">
      <div className="page-header">
        <h2>🔍 Wellness Guide</h2>
        <p className="subtitle">Find your personalized healing protocol</p>
      </div>

      <div className="search-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search conditions, symptoms, or keywords..."
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
            {filteredProtocols.length} {filteredProtocols.length === 1 ? 'protocol' : 'protocols'} found
          </span>
        </div>

        {filteredProtocols.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No protocols found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="protocols-list">
            {filteredProtocols.map(protocol => (
              <div 
                key={protocol.id}
                className="protocol-card"
                onClick={() => handleProtocolClick(protocol)}
              >
                <div className="protocol-header">
                  <h3 className="protocol-name">{protocol.ailmentName}</h3>
                  <span className="protocol-category">{protocol.category}</span>
                </div>
                <div className="protocol-details">
                  <div className="detail">
                    <span className="icon">📅</span>
                    <span>{protocol.frequencyPerWeek}x per week</span>
                  </div>
                  <div className="detail">
                    <span className="icon">⏱️</span>
                    <span>{protocol.durationMinutes} min</span>
                  </div>
                  <div className="detail">
                    <span className="icon">🗓️</span>
                    <span>{protocol.recommendedWeeks} weeks</span>
                  </div>
                </div>
                <div className="protocol-tags">
                  {protocol.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="protocol-footer">
                  <span className="sessions-total">
                    {protocol.totalSuggestedSessions} total sessions recommended
                  </span>
                  <span className="arrow">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WellnessGuide;
