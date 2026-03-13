import { useState, useMemo } from 'react';

function WellnessGuide({ conditions, navigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get unique categories
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

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.conditionName.toLowerCase().includes(term) ||
        c.bodySystem.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term) ||
        c.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [conditions, searchTerm, selectedCategory]);

  const handleConditionClick = (condition) => {
    navigate('condition', condition);
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
            {filteredConditions.length} {filteredConditions.length === 1 ? 'condition' : 'conditions'} found
          </span>
        </div>

        {filteredConditions.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No conditions found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="protocols-list">
            {filteredConditions.map(condition => (
              <div 
                key={condition.id}
                className="protocol-card condition-card"
                onClick={() => handleConditionClick(condition)}
              >
                <div className="protocol-header">
                  <h3 className="protocol-name">{condition.conditionName}</h3>
                  <span className="protocol-category">{condition.category}</span>
                </div>
                
                <p className="condition-description">{condition.description}</p>
                
                <div className="protocol-info">
                  <div className="info-item">
                    <span className="icon">📊</span>
                    <span>{condition.protocols.length} protocol{condition.protocols.length > 1 ? 's' : ''} available</span>
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
                  {condition.tags.slice(0, 4).map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                
                <div className="protocol-footer">
                  <span className="sessions-total">
                    View protocols & book session
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
