// Programmatic category derivation for a condition's protocols.
// No owner curation. Same logic for all 3,688 ailments.
//
// Buckets are frequency-band clusters that map to the sections on Doug's
// printed ailment sheets. Duty defaults are the ranges he printed for MCAS
// applied by band so the shape matches without needing per-condition input.

const BAND_DEFS = [
  { name: 'Foundational / General', purpose: 'Baseline wellness and cellular support', duty: '20–40%', maxHz: 100 },
  { name: 'Nerve / Recovery',        purpose: 'Nervous-system support and recovery',    duty: '20–40%', maxHz: 500 },
  { name: 'Muscle / Tissue',         purpose: 'Muscle-tissue and connective-tissue support', duty: '30–50%', maxHz: 780 },
  { name: 'Wellness Core',           purpose: 'Primary wellness frequency band',        duty: '30–50%', maxHz: 1000 },
  { name: 'Deep-Cellular / Harmonic',purpose: 'Deeper cellular and harmonic-band support', duty: 'Continuous or 30–70%', maxHz: 4000 },
  { name: 'Kilohertz',               purpose: 'Advanced kilohertz-band protocols',      duty: 'Continuous', maxHz: Infinity },
];

function parseFreqList(str) {
  if (!str) return [];
  return String(str)
    .split(',')
    .map(f => parseFloat(f.trim()))
    .filter(f => !isNaN(f) && f > 0);
}

function formatHz(f) {
  return Number.isInteger(f) ? String(f) : String(f);
}

export function deriveCategories(protocols) {
  const unique = new Set();
  for (const p of protocols || []) {
    for (const f of parseFreqList(p.frequencies)) unique.add(f);
  }
  const sorted = [...unique].sort((a, b) => a - b);
  const buckets = BAND_DEFS.map(b => ({ ...b, frequencies: [] }));
  for (const f of sorted) {
    const bucket = buckets.find(b => f <= b.maxHz);
    if (bucket) bucket.frequencies.push(f);
  }
  return buckets
    .filter(b => b.frequencies.length > 0)
    .map(b => ({ ...b, frequenciesText: b.frequencies.map(formatHz) }));
}

// Simple Session Structure: 3–4 curated session presets derived from the
// protocol pool. Short = a compact intro. Standard = the fullest single
// protocol (capped). Muscle/Tissue = mid-band subset. Recovery = KHZ or
// low-band subset.
export function deriveSessions(protocols, categories) {
  const parsed = (protocols || []).map(p => ({ ...p, freqArr: parseFreqList(p.frequencies) }));
  if (!parsed.length) return [];

  const largest = [...parsed].sort((a, b) => b.freqArr.length - a.freqArr.length)[0];
  const smallest = [...parsed].sort((a, b) => a.freqArr.length - b.freqArr.length)[0];

  const byName = (n) => categories.find(c => c.name === n);
  const midBand = byName('Wellness Core') || byName('Muscle / Tissue') || byName('Nerve / Recovery');
  const muscleCat = byName('Muscle / Tissue');
  const nerveCat = byName('Nerve / Recovery');
  const khzCat = byName('Kilohertz') || byName('Deep-Cellular / Harmonic');

  const sessions = [];

  if (midBand && midBand.frequencies.length) {
    sessions.push({
      name: 'Short Session',
      duration: '15–20 min',
      frequencies: midBand.frequencies.slice(0, 4),
    });
  }

  if (largest.freqArr.length) {
    sessions.push({
      name: 'Standard Session',
      duration: '25–40 min',
      frequencies: largest.freqArr.slice(0, 15),
    });
  }

  if (muscleCat && muscleCat.frequencies.length >= 3) {
    sessions.push({
      name: 'Muscle / Tissue Session',
      duration: '20–30 min',
      frequencies: muscleCat.frequencies.slice(0, 8),
    });
  } else if (nerveCat && nerveCat.frequencies.length >= 3) {
    sessions.push({
      name: 'Nerve / Recovery Session',
      duration: '20–30 min',
      frequencies: nerveCat.frequencies.slice(0, 8),
    });
  }

  if (khzCat && khzCat.frequencies.length) {
    sessions.push({
      name: 'Recovery Session',
      duration: '20–30 min',
      frequencies: khzCat.frequencies,
    });
  } else if (smallest.freqArr.length && smallest.freqArr.length <= 8) {
    sessions.push({
      name: 'Short Recovery',
      duration: '15–25 min',
      frequencies: smallest.freqArr,
    });
  }

  return sessions.map(s => ({ ...s, frequenciesText: s.frequencies.map(formatHz) }));
}

export function uniqueSources(protocols) {
  const s = new Set();
  for (const p of protocols || []) if (p.source) s.add(p.source);
  return [...s];
}
