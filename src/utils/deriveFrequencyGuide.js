// Programmatic derivation for the "{Hz} Hz Light Frequency — Master Reference"
// page. Given a target Hz value and the full conditions dataset, this computes:
//
//   - The frequency-band CATEGORY the Hz falls into (matches deriveCategories).
//   - Every ailment/protocol that references the Hz.
//   - The most-cited COMPLEMENTARY frequencies (co-appear in the same protocols).
//   - A 6-step Simple Session Flow with the target Hz as the primary step,
//     framed by complementary freqs from adjacent bands.
//   - Aggregate stats: how many ailments, which body systems, which sources.
//
// Same design principle as the ailment guide: no LLM decisions, all derivation
// is deterministic against the ingested source-database rows.

const BAND_DEFS = [
  { name: 'Foundational / General', purpose: 'Baseline wellness and cellular support',       commonApplications: 'Preparation, grounding, baseline wellness',                       dutyCycle: '20–40%',            intensity: 'Low',        sessionTime: '5–10 minutes', bestUse: 'Session opening / preparation',                     maxHz: 100 },
  { name: 'Nerve / Recovery',        purpose: 'Nervous-system support and recovery',           commonApplications: 'Nerve support, calming, recovery, tension release',              dutyCycle: '20–40%',            intensity: 'Low',        sessionTime: '5–10 minutes', bestUse: 'Early session, complementary to primary',           maxHz: 500 },
  { name: 'Muscle / Tissue',         purpose: 'Muscle-tissue and connective-tissue support',   commonApplications: 'Muscle recovery, tissue support, circulation',                   dutyCycle: '30–50%',            intensity: 'Low–Medium', sessionTime: '10–20 minutes', bestUse: 'Middle portion of a session',                       maxHz: 780 },
  { name: 'Wellness Core',           purpose: 'Primary wellness frequency band',               commonApplications: 'Primary wellness, cellular resonance, bioenergetic balancing',    dutyCycle: '30–50%',            intensity: 'Low–Medium', sessionTime: '10–20 minutes', bestUse: 'Primary wellness frequency',                        maxHz: 1000 },
  { name: 'Deep-Cellular / Harmonic',purpose: 'Deeper cellular and harmonic-band support',     commonApplications: 'Deep cellular support, harmonic wellness, integration',          dutyCycle: 'Continuous or 30–70%', intensity: 'Medium',  sessionTime: '5–15 minutes',  bestUse: 'Late-session integration and depth',                maxHz: 4000 },
  { name: 'Kilohertz',               purpose: 'Advanced kilohertz-band protocols',             commonApplications: 'Advanced protocols, session integration and closure',            dutyCycle: 'Continuous',        intensity: 'Medium',     sessionTime: '3–8 minutes',   bestUse: 'Session closing / harmonic integration',            maxHz: Infinity },
];

export function bandFor(hz) {
  const n = typeof hz === 'number' ? hz : parseFloat(hz);
  if (isNaN(n) || n <= 0) return null;
  return BAND_DEFS.find(b => n <= b.maxHz) || BAND_DEFS[BAND_DEFS.length - 1];
}

function parseFreqList(str) {
  if (!str) return [];
  return String(str)
    .split(',')
    .map(f => parseFloat(f.trim()))
    .filter(f => !isNaN(f) && f > 0);
}

function eq(a, b) {
  return Math.abs(a - b) < 0.001;
}

function formatHz(f) {
  return Number.isInteger(f) ? String(f) : String(f);
}

export function deriveFrequencyGuide(hz, conditions) {
  const target = typeof hz === 'number' ? hz : parseFloat(hz);
  if (isNaN(target) || target <= 0) return null;

  const band = bandFor(target);
  const complementaryCounts = new Map(); // Hz -> co-occurrence count
  const sources = new Set();
  const bodySystems = new Map(); // system -> count
  const usingConditions = [];

  for (const cond of conditions || []) {
    let containsTarget = false;
    for (const p of cond.protocols || []) {
      const freqs = parseFreqList(p.frequencies);
      if (!freqs.some(f => eq(f, target))) continue;
      containsTarget = true;
      if (p.source) sources.add(p.source);
      for (const f of freqs) {
        if (!eq(f, target)) {
          complementaryCounts.set(f, (complementaryCounts.get(f) || 0) + 1);
        }
      }
    }
    if (containsTarget) {
      usingConditions.push(cond);
      if (cond.bodySystem) {
        bodySystems.set(cond.bodySystem, (bodySystems.get(cond.bodySystem) || 0) + 1);
      }
    }
  }

  // Top complementary frequencies by co-occurrence count.
  const topComplementary = [...complementaryCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, 24)
    .map(([f, count]) => ({ hz: f, count }));

  // Session flow: primary target Hz + 5 complementary freqs framing it.
  // We pick 2 lower-band and 3 higher-band complementary freqs to bracket the
  // target, sorted rising for a natural session ramp.
  const flow = buildSessionFlow(target, topComplementary);

  return {
    hz: target,
    band,
    stats: {
      usingConditionsCount: usingConditions.length,
      bodySystems: [...bodySystems.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
      sources: [...sources].sort(),
      complementaryCount: complementaryCounts.size,
    },
    topComplementary,
    frequencySeriesText: [target, ...topComplementary.slice(0, 8).map(c => c.hz)]
      .sort((a, b) => a - b)
      .map(formatHz),
    flow,
    // Sample so the "used in" panel isn't a scroll-of-death when a base
    // frequency like 727 appears in hundreds of protocols.
    sampleUsingConditions: usingConditions.slice(0, 20),
  };
}

function buildSessionFlow(target, topComplementary) {
  const complementaryFreqs = topComplementary.map(c => c.hz);
  const lower = complementaryFreqs.filter(f => f < target).sort((a, b) => a - b);
  const higher = complementaryFreqs.filter(f => f > target).sort((a, b) => a - b);

  // Take up to 2 lower (for prep + build), up to 3 higher (support + close).
  // If either side is thin, backfill from the other side so we always have a
  // full 6-step flow when there's enough data.
  const prepA = lower[0];
  const prepB = lower[1] ?? higher[0];
  const supportA = higher[0] && higher[0] !== prepB ? higher[0] : higher[1];
  const supportB = higher[1] && higher[1] !== supportA ? higher[1] : higher[2];
  const closeA = higher[higher.length - 1];

  const targetBand = bandFor(target);
  const labelFor = (hz, role) => {
    if (hz == null) return null;
    const b = bandFor(hz);
    switch (role) {
      case 'prepA': return `${b?.name || 'Complementary'} preparation`;
      case 'prepB': return `${b?.name || 'Complementary'} build`;
      case 'primary': return `Primary frequency (${targetBand?.name || 'Wellness Core'})`;
      case 'supportA': return `Complementary support (${b?.name || ''})`.trim();
      case 'supportB': return `Cross-band support (${b?.name || ''})`.trim();
      case 'close': return `Session integration (${b?.name || ''})`.trim();
      default: return b?.name || 'Complementary';
    }
  };

  const raw = [
    { hz: prepA, minutes: '5 min', label: labelFor(prepA, 'prepA'), role: 'prepA' },
    { hz: prepB, minutes: '5 min', label: labelFor(prepB, 'prepB'), role: 'prepB' },
    { hz: target, minutes: '10–15 min', label: labelFor(target, 'primary'), role: 'primary', isPrimary: true },
    { hz: supportA, minutes: '5 min', label: labelFor(supportA, 'supportA'), role: 'supportA' },
    { hz: supportB, minutes: '5 min', label: labelFor(supportB, 'supportB'), role: 'supportB' },
    { hz: closeA, minutes: '5 min', label: labelFor(closeA, 'close'), role: 'close' },
  ];
  return raw.filter(step => step.hz != null).map((step, i) => ({ ...step, index: i + 1 }));
}
