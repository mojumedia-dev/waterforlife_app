import { useMemo } from 'react';
import { deriveFrequencyGuide } from '../utils/deriveFrequencyGuide';

// Per-frequency Master Reference page. Layout matches Doug's printed
// "{Hz} Hz Light Frequency — Master Reference" sheet: 8-row category /
// purpose / applications / duty / intensity / session time / best use /
// frequency series table + Simple Session Flow + reference paragraph +
// disclaimer. Data is derived programmatically from conditions.json —
// no owner content authoring required.

function FrequencyDetail({ frequency, conditions, navigate }) {
  const guide = useMemo(() => deriveFrequencyGuide(frequency, conditions), [frequency, conditions]);

  if (guide == null) {
    return (
      <div className="page">
        <h2>Frequency not found</h2>
        <button className="btn primary" onClick={() => navigate('wellness')}>
          Back to Wellness Guide
        </button>
      </div>
    );
  }

  const { hz, band, stats, topComplementary, frequencySeriesText, flow, sampleUsingConditions } = guide;

  const handleFreqClick = (nextHz) => {
    if (Math.abs(nextHz - hz) < 0.001) return;
    navigate('frequency', nextHz);
  };

  const openCondition = (condition) => {
    navigate('condition', condition);
  };

  return (
    <div className="page freq-sheet-page">
      <button className="back-btn" onClick={() => window.history.length > 1 ? navigate('wellness') : navigate('wellness')}>
        ← Back to Wellness Guide
      </button>

      <article className="freq-sheet">
        <h1 className="doc-title">{hz} Hz Light Frequency — Master Reference</h1>

        <table className="doc">
          <colgroup>
            <col style={{ width: '25%' }} />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <td>Category</td>
              <td>{band.name}</td>
            </tr>
            <tr>
              <td>Purpose</td>
              <td>{band.purpose}</td>
            </tr>
            <tr>
              <td>Common Applications</td>
              <td>{band.commonApplications}</td>
            </tr>
            <tr>
              <td>Duty Cycle</td>
              <td>{band.dutyCycle}</td>
            </tr>
            <tr>
              <td>Intensity</td>
              <td>{band.intensity}</td>
            </tr>
            <tr>
              <td>Session Time</td>
              <td>{band.sessionTime}</td>
            </tr>
            <tr>
              <td>Best Use</td>
              <td>{band.bestUse}</td>
            </tr>
            <tr>
              <td>Frequency Series</td>
              <td className="freq-cell">
                {frequencySeriesText.map((f, i) => (
                  <span key={f + '-' + i}>
                    {i > 0 && ', '}
                    {Math.abs(parseFloat(f) - hz) < 0.001 ? (
                      <strong>{f} Hz</strong>
                    ) : (
                      <span className="fq" onClick={() => handleFreqClick(parseFloat(f))}>{f}</span>
                    )}
                  </span>
                ))}
              </td>
            </tr>
          </tbody>
        </table>

        <h2 className="doc-section">Simple Session Flow</h2>
        <div className="session-list">
          {flow.map(step => (
            <p key={step.index}>
              <strong>{step.index}. {step.isPrimary ? (
                <span>{step.hz} Hz ({step.minutes})</span>
              ) : (
                <span>
                  <span className="fq" onClick={() => handleFreqClick(step.hz)}>{step.hz}</span> Hz ({step.minutes})
                </span>
              )}</strong>
              {' — '}{step.label}
            </p>
          ))}
        </div>

        <h2 className="doc-section">Where This Frequency Appears</h2>
        <p className="table-note" style={{ marginBottom: 12 }}>
          {stats.usingConditionsCount.toLocaleString()} ailment{stats.usingConditionsCount === 1 ? '' : 's'} across
          {' '}{stats.sources.join(', ')}{' '}source list{stats.sources.length === 1 ? '' : 's'} reference {hz} Hz.
          {stats.bodySystems.length > 0 && (
            <>
              {' '}Most-cited body systems:
              {' ' + stats.bodySystems.slice(0, 4).map(([sys, n]) => `${sys} (${n})`).join(', ')}.
            </>
          )}
        </p>
        <div className="duty-list">
          {sampleUsingConditions.map(c => (
            <p key={c.id}>
              <span
                className="fq"
                onClick={() => openCondition(c)}
                style={{ borderBottomStyle: 'solid' }}
              >
                {c.conditionName}
              </span>
              {c.bodySystem ? ` — ${c.bodySystem}` : ''}
              {' · '}
              {(c.protocols || []).length} protocol{(c.protocols || []).length === 1 ? '' : 's'}
            </p>
          ))}
          {stats.usingConditionsCount > sampleUsingConditions.length && (
            <p className="table-note">
              …and {(stats.usingConditionsCount - sampleUsingConditions.length).toLocaleString()} more. Search {hz} in the Wellness Guide to see the full list.
            </p>
          )}
        </div>

        {topComplementary.length > 0 && (
          <>
            <h2 className="doc-section">Complementary Frequencies</h2>
            <p className="table-note" style={{ marginBottom: 12 }}>
              Frequencies most frequently paired with {hz} Hz across the source lists. Click any to open its own Master Reference.
            </p>
            <div className="duty-list">
              {topComplementary.map(c => (
                <p key={c.hz}>
                  <span className="fq" onClick={() => handleFreqClick(c.hz)}>{c.hz}</span>
                  {' Hz'}
                  {' — appears with '}{c.count}{' protocols using '}{hz}{' Hz'}
                </p>
              ))}
            </div>
          </>
        )}

        <div className="disclaimer">
          <strong>This information is provided for educational purposes only and is not intended to diagnose, treat, cure, or prevent any disease.</strong> The SpectraLight / EverForged Light Bed and its frequency protocols are wellness-support tools. Consult a licensed healthcare provider before beginning any protocol, particularly if you have an underlying condition, are pregnant, or use a pacemaker or other implanted device.
        </div>

        <p className="cite-footer">
          Reference base: {stats.sources.join(', ')} source list{stats.sources.length === 1 ? '' : 's'}; SpectraLight 2024 Frequency Book (alphabetical + numerical volumes).
        </p>
      </article>
    </div>
  );
}

export default FrequencyDetail;
