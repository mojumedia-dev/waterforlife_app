import { useState } from 'react';
import storage from '../utils/storage';
import { deriveCategories, deriveSessions, uniqueSources } from '../utils/deriveCategories';

// New "Rife Frequency Summary" layout — programmatic categorization + curated
// session presets, both derived from the condition's protocols with no owner
// content authoring required. Matches the shape of Doug's printed ailment
// sheets while running against the ingested source-database rows.

function ConditionDetail({ condition, navigate }) {
  const [savedSessionName, setSavedSessionName] = useState(null);

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

  const categories = deriveCategories(condition.protocols || []);
  const sessions = deriveSessions(condition.protocols || [], categories);
  const sources = uniqueSources(condition.protocols || []);

  const persistSession = (session) => {
    storage.setItem('sessionFromCondition', JSON.stringify({
      conditionName: condition.conditionName,
      sessionName: session.name,
      frequencies: session.frequencies,
      duration: session.duration,
      sources,
      savedAt: new Date().toISOString(),
    }));
  };

  const handleStartSession = (session) => {
    persistSession(session);
    navigate('dashboard');
  };

  const handleSaveToDashboard = (session) => {
    persistSession(session);
    setSavedSessionName(session.name);
    setTimeout(() => setSavedSessionName(null), 3000);
  };

  const handleFreqClick = (hz) => {
    navigate('frequency', parseFloat(hz));
  };

  const primarySession = sessions.find(s => s.name === 'Standard Session') || sessions[0];

  return (
    <div className="page freq-sheet-page">
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate('wellness')}>
          ← Back to Wellness Guide
        </button>
        <button
          className="print-btn"
          onClick={() => window.print()}
          title="Opens your browser's print dialog. On phones, pick 'Save as PDF' from the destination."
        >
          🖨 Save as PDF
        </button>
      </div>

      <article className="freq-sheet">
        <h1 className="doc-title">{condition.conditionName} — Rife Frequency Summary</h1>

        <table className="doc">
          <colgroup>
            <col style={{ width: '22%' }} />
            <col style={{ width: '32%' }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>Category</th>
              <th>Purpose</th>
              <th>Common Frequencies (Hz)</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.name}>
                <td>{cat.name}</td>
                <td>{cat.purpose}</td>
                <td className="freq-cell">
                  {cat.frequenciesText.map((f, i) => (
                    <span key={f + '-' + i}>
                      {i > 0 && ', '}
                      <span className="fq" onClick={() => handleFreqClick(f)}>{f}</span>
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 className="doc-section">Simple Session Structure</h2>
        <div className="session-list">
          {sessions.map(s => (
            <p key={s.name}>
              <strong>{s.name} ({s.duration}):</strong>{' '}
              {s.frequenciesText.map((f, i) => (
                <span key={f + '-' + i}>
                  {i > 0 && ', '}
                  <span className="fq" onClick={() => handleFreqClick(f)}>{f}</span>
                </span>
              ))}
            </p>
          ))}
          {primarySession && (
            <div className="session-actions">
              <button className="btn primary" onClick={() => handleStartSession(primarySession)}>
                Start {primarySession.name}
              </button>
              <button className="btn" onClick={() => handleSaveToDashboard(primarySession)}>
                Save to Dashboard
              </button>
              {savedSessionName && (
                <span className="save-confirm">✓ {savedSessionName} saved</span>
              )}
            </div>
          )}
        </div>

        <h2 className="doc-section">Duty Guidance (Bed)</h2>
        <table className="doc">
          <colgroup>
            <col style={{ width: '30%' }} />
            <col style={{ width: '35%' }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>Category</th>
              <th>Purpose</th>
              <th>Duty Selection Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.name}>
                <td>{cat.name}</td>
                <td>{cat.purpose}</td>
                <td>{cat.duty}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="doc-section">Duty Selection by Category, Purpose, and Common Frequencies</h2>
        <div className="duty-list">
          {categories.map(cat => (
            <p key={cat.name}>
              {cat.name} (
              {cat.frequenciesText.map((f, i) => (
                <span key={f + '-' + i}>
                  {i > 0 && ', '}
                  <span className="fq" onClick={() => handleFreqClick(f)}>{f}</span>
                </span>
              ))}
              ): {cat.duty}
            </p>
          ))}
        </div>

        <h2 className="doc-section">General Use Notes</h2>
        <ul className="use-notes">
          <li>Begin with shorter sessions and lower intensity, then build up as your body adapts.</li>
          <li>Hydrate before and after sessions.</li>
          <li>Space sessions at least 24 hours apart unless running a short protocol.</li>
          <li>Log your sessions in the dashboard so you can track your progress across the recommended run.</li>
          <li>If you experience any adverse symptoms during a session, stop and consult a licensed healthcare provider.</li>
        </ul>

        <div className="disclaimer">
          <strong>This information is provided for educational purposes only and is not intended to diagnose, treat, cure, or prevent any disease.</strong> The SpectraLight / EverForged Light Bed and its frequency protocols are wellness-support tools. Consult a licensed healthcare provider before beginning any protocol, particularly if you have an underlying condition, are pregnant, or use a pacemaker or other implanted device.
        </div>
      </article>
    </div>
  );
}

export default ConditionDetail;
