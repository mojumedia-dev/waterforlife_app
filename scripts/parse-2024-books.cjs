#!/usr/bin/env node
/**
 * Parse Doug's 2024 SpectraLight Frequency Books into a normalized ailment list,
 * then diff against src/data/conditions.json.
 *
 * DRY RUN by default — never writes to conditions.json. Produces:
 *   scripts/output/2024-ingest-parsed.json    — the raw parsed ailment list
 *   scripts/output/2024-ingest-diff.md        — human-readable diff report
 *
 * Usage:  node scripts/parse-2024-books.cjs
 */

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const ALPHA_TXT = path.join(REPO, 'scripts', 'source_2024', 'alphabetical.txt');
const CURRENT_JSON = path.join(REPO, 'src', 'data', 'conditions.json');
const OUT_PARSED = path.join(REPO, 'scripts', 'output', '2024-ingest-parsed.json');
const OUT_DIFF = path.join(REPO, 'scripts', 'output', '2024-ingest-diff.md');

const KNOWN_SOURCES = new Set([
  'ALT', 'BIO', 'CAFL', 'CUST', 'HC', 'KHZ', 'ODD', 'PROV', 'R', 'VEGA', 'XTRA',
]);

function shouldSkip(line) {
  if (!line) return true;
  if (/^\d+$/.test(line)) return true;                 // page numbers
  if (/^[A-Z]$/.test(line)) return true;               // section letter dividers
  if (/^SpectraLight/.test(line)) return true;
  if (/^Frequency Book/.test(line)) return true;
  if (/^Ailment Frequency List/.test(line)) return true;
  if (/^Sorted Alphabetically/.test(line)) return true;
  if (/^Sorted by Frequency/.test(line)) return true;
  if (/^Empowering Wellness/.test(line)) return true;
  if (/^Through$/.test(line)) return true;
  if (/^Light and Frequency/.test(line)) return true;
  return false;
}

function parseAlphabetical(txtPath) {
  const raw = fs.readFileSync(txtPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const entries = [];
  let buffer = '';

  // full-entry match: "<Name>[,BodySystem]: \"freqs\" - SOURCE"
  const entryPattern = /^\s*([^"]+?)(?:,\s*([A-Za-z][A-Za-z ]*?))?:\s*"([^"]*)"\s*-\s*([A-Z]+)\s*$/;
  // start-of-entry sniff: name up through `: "` — this is what qualifies a line as
  // the beginning of a record. Anything without `: "` is prose / headers / noise.
  const startSniff = /^[A-Z][^"]*:\s*"/;

  const flushIfMatch = () => {
    const m = buffer.trim().match(entryPattern);
    if (!m) return false;
    const [, rawName, rawSystem, freqs, source] = m;
    entries.push({
      conditionName: rawName.trim().replace(/\s+/g, ' '),
      bodySystem: (rawSystem || '').trim(),
      frequencies: freqs.split(',').map(f => f.trim()).filter(Boolean).join(', '),
      source: source.trim(),
    });
    buffer = '';
    return true;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (!buffer) {
      // Only START a buffer on a line that looks like an ailment record header.
      // Skips book front-matter, headers, page numbers, etc.
      if (!startSniff.test(line)) continue;
      buffer = line;
    } else {
      // Mid-record: this is a continuation. But if the incoming line ALSO
      // looks like a fresh record header, our current buffer is a broken
      // multi-line that never closed — drop it and start fresh.
      if (startSniff.test(line)) {
        buffer = line;
      } else {
        buffer += ' ' + line;
      }
    }
    flushIfMatch();
  }
  if (buffer) flushIfMatch();

  return entries;
}

function normalizeFreqString(s) {
  if (!s) return '';
  return s.split(',').map(f => f.trim()).filter(Boolean).join(',');
}

function normalizeAilmentKey(name) {
  return name.toLowerCase().replace(/\s+/g, ' ').trim();
}

function diff(parsed, current) {
  const currentByKey = new Map();
  const currentSources = new Set();

  for (const cond of current) {
    const key = normalizeAilmentKey(cond.conditionName);
    currentByKey.set(key, cond);
    for (const p of cond.protocols || []) {
      currentSources.add(p.source);
    }
  }

  const parsedSources = new Set();
  const newAilments = new Map();       // key -> { conditionName, entries: [...] }
  const newProtocols = [];             // { ailment, source, frequencies, bodySystem }
  const perAilmentDup = 0;             // (unused, kept for stats later)

  for (const e of parsed) {
    parsedSources.add(e.source);
    const key = normalizeAilmentKey(e.conditionName);
    const existing = currentByKey.get(key);

    if (!existing) {
      const bucket = newAilments.get(key) || { conditionName: e.conditionName, bodySystem: e.bodySystem, entries: [] };
      bucket.entries.push(e);
      newAilments.set(key, bucket);
      continue;
    }

    // ailment exists — is this specific (source, freqs) combo already covered?
    const parsedNorm = normalizeFreqString(e.frequencies);
    const alreadyHave = (existing.protocols || []).some(
      p => p.source === e.source && normalizeFreqString(p.frequencies) === parsedNorm
    );
    if (!alreadyHave) {
      newProtocols.push({
        ailment: existing.conditionName,
        source: e.source,
        frequencies: e.frequencies,
        bodySystem: e.bodySystem || existing.bodySystem,
      });
    }
  }

  const missingFromParsed = [];
  for (const [key, cond] of currentByKey) {
    // any current ailment whose key doesn't appear in the parsed set → potentially dropped
    const inParsed = parsed.some(p => normaliseAilmentKeySafe(p.conditionName) === key);
    if (!inParsed) missingFromParsed.push(cond.conditionName);
  }

  const newSources = [...parsedSources].filter(s => !currentSources.has(s)).sort();
  const droppedSources = [...currentSources].filter(s => !parsedSources.has(s)).sort();

  return {
    parsedTotal: parsed.length,
    parsedUniqueAilments: new Set(parsed.map(e => normalizeAilmentKey(e.conditionName))).size,
    currentTotal: current.length,
    parsedSources: [...parsedSources].sort(),
    currentSources: [...currentSources].sort(),
    newSources,
    droppedSources,
    unknownSources: [...parsedSources].filter(s => !KNOWN_SOURCES.has(s)),
    newAilments: [...newAilments.values()],
    newProtocols,
    missingFromParsed,
  };
}

function normaliseAilmentKeySafe(name) { return normalizeAilmentKey(name); }

function renderDiffReport(d) {
  const lines = [];
  lines.push('# 2024 SpectraLight Books — Ingest Diff Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Parsed entries (from 2024 alphabetical PDF):** ${d.parsedTotal}`);
  lines.push(`- **Parsed unique ailments:** ${d.parsedUniqueAilments}`);
  lines.push(`- **Current conditions.json ailments:** ${d.currentTotal}`);
  lines.push(`- **New ailments not in current JSON:** ${d.newAilments.length}`);
  lines.push(`- **New protocol rows for existing ailments:** ${d.newProtocols.length}`);
  lines.push(`- **Sources in 2024 books:** ${d.parsedSources.join(', ')}`);
  lines.push(`- **Sources in current JSON:** ${d.currentSources.join(', ')}`);
  lines.push(`- **New sources added by 2024 books:** ${d.newSources.length ? d.newSources.join(', ') : '(none)'}`);
  lines.push(`- **Sources in current JSON not in 2024 books:** ${d.droppedSources.length ? d.droppedSources.join(', ') : '(none)'}`);
  lines.push(`- **Unknown source codes encountered:** ${d.unknownSources.length ? d.unknownSources.join(', ') : '(none)'}`);
  lines.push(`- **Ailments in current JSON but not in 2024 books (potential drops or renames):** ${d.missingFromParsed.length}`);
  lines.push('');

  lines.push('## New ailments (top 50)');
  lines.push('');
  if (!d.newAilments.length) {
    lines.push('_None._');
  } else {
    for (const a of d.newAilments.slice(0, 50)) {
      lines.push(`- **${a.conditionName}** (${a.bodySystem || 'no body system'}) — ${a.entries.length} protocol row(s):`);
      for (const e of a.entries) {
        lines.push(`  - ${e.source}: \`${e.frequencies}\``);
      }
    }
    if (d.newAilments.length > 50) {
      lines.push('');
      lines.push(`_...and ${d.newAilments.length - 50} more._`);
    }
  }
  lines.push('');

  lines.push('## New protocol rows for existing ailments (top 50)');
  lines.push('');
  if (!d.newProtocols.length) {
    lines.push('_None._');
  } else {
    for (const p of d.newProtocols.slice(0, 50)) {
      lines.push(`- **${p.ailment}** — ${p.source}: \`${p.frequencies}\``);
    }
    if (d.newProtocols.length > 50) {
      lines.push('');
      lines.push(`_...and ${d.newProtocols.length - 50} more._`);
    }
  }
  lines.push('');

  lines.push('## Ailments in current JSON but not in 2024 books');
  lines.push('');
  lines.push('These may be dropped, renamed, or legitimately additional. Review before doing any deletes.');
  lines.push('');
  if (!d.missingFromParsed.length) {
    lines.push('_None._');
  } else {
    for (const name of d.missingFromParsed.slice(0, 50)) {
      lines.push(`- ${name}`);
    }
    if (d.missingFromParsed.length > 50) {
      lines.push('');
      lines.push(`_...and ${d.missingFromParsed.length - 50} more._`);
    }
  }
  lines.push('');

  lines.push('## Next steps');
  lines.push('');
  lines.push('- Review new-ailment list above. If any obvious garbage (parse artifacts, header fragments) shows up, tighten the parser.');
  lines.push('- Review new-protocol rows for existing ailments — these are extra frequency/source combos we\'d add without disturbing anything already in the JSON.');
  lines.push('- Review the "missing from parsed" list. Anything you want to keep (e.g., manually-added protocols) stays. Anything that\'s truly obsolete could be dropped in a follow-up pass — NOT this ingest.');
  lines.push('- On approval, run `node scripts/parse-2024-books.cjs --commit` (not implemented yet — commit mode is a follow-up).');
  lines.push('');

  return lines.join('\n');
}

function slugTags(name, bodySystem) {
  const words = name.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  const set = new Set(words);
  if (bodySystem) set.add(bodySystem.toLowerCase());
  return [...set].slice(0, 6);
}

function categoryFor(bodySystem) {
  if (!bodySystem) return 'General';
  const map = {
    'Stomach': 'Digestive', 'Intestines': 'Digestive', 'Colon': 'Digestive', 'Liver': 'Digestive', 'Pancreas': 'Digestive', 'Gallbladder': 'Digestive',
    'Skin': 'Dermatology', 'Blood': 'Circulatory', 'Blood Tissue': 'Circulatory', 'Blood Organs': 'Circulatory',
    'Bone': 'Musculoskeletal', 'Bone Tissue': 'Musculoskeletal', 'Joints': 'Musculoskeletal', 'Muscles': 'Musculoskeletal', 'Back': 'Musculoskeletal',
    'Brain': 'Neurological', 'Nerves': 'Neurological', 'Nervous System': 'Neurological',
    'Respiratory': 'Respiratory', 'Lungs': 'Respiratory',
    'Immune System': 'Immune', 'Allergies': 'Immune',
    'Heart': 'Cardiovascular',
    'Eye': 'Sensory', 'Eyes': 'Sensory', 'Ear': 'Sensory',
    'Reproductive': 'Reproductive', 'Uterus': 'Reproductive', 'Ovary': 'Reproductive', 'Prostate': 'Reproductive',
    'Kidneys': 'Renal', 'Bladder': 'Renal',
    'Cancer': 'Cancer',
    'Energy': 'Energy',
  };
  return map[bodySystem] || bodySystem;
}

function mergeIntoConditions(current, parsed) {
  const byKey = new Map();
  let maxCondNum = 0;
  for (const c of current) {
    byKey.set(normalizeAilmentKey(c.conditionName), c);
    const m = /cond-(\d+)$/.exec(c.id || '');
    if (m) maxCondNum = Math.max(maxCondNum, parseInt(m[1], 10));
  }

  let newAilmentCount = 0;
  let newProtoRowCount = 0;

  for (const e of parsed) {
    const key = normalizeAilmentKey(e.conditionName);
    let cond = byKey.get(key);
    if (!cond) {
      maxCondNum += 1;
      cond = {
        id: `cond-${maxCondNum}`,
        conditionName: e.conditionName,
        bodySystem: e.bodySystem || '',
        category: categoryFor(e.bodySystem),
        tags: slugTags(e.conditionName, e.bodySystem),
        description: `SpectraLight therapy protocol for ${e.conditionName.toLowerCase()}. Uses specific therapeutic frequencies to support healing and wellness.`,
        protocols: [],
        suggestedPackageId: 'pkg-002',
        ingested: '2024-book',
      };
      current.push(cond);
      byKey.set(key, cond);
      newAilmentCount += 1;
    }
    const parsedNorm = normalizeFreqString(e.frequencies);
    const already = (cond.protocols || []).some(
      p => p.source === e.source && normalizeFreqString(p.frequencies) === parsedNorm
    );
    if (already) continue;
    const nextProtoNum = (cond.protocols || []).length + 1;
    const condIdNum = /cond-(\d+)$/.exec(cond.id)?.[1] || '?';
    cond.protocols = cond.protocols || [];
    cond.protocols.push({
      id: `prot-${condIdNum}-${nextProtoNum}`,
      name: `${cond.conditionName} Protocol ${nextProtoNum} (${e.source})`,
      frequencies: e.frequencies,
      source: e.source,
      frequencyPerWeek: 3,
      durationMinutes: 30,
      recommendedWeeks: 8,
      totalSessions: 24,
    });
    newProtoRowCount += 1;
  }
  return { newAilmentCount, newProtoRowCount };
}

function main() {
  const commit = process.argv.includes('--commit');

  if (!fs.existsSync(ALPHA_TXT)) {
    console.error(`Missing extracted text: ${ALPHA_TXT}`);
    console.error('Run pdftotext -layout on the alphabetical PDF into scripts/source_2024/alphabetical.txt first.');
    process.exit(1);
  }
  console.log(`Parsing ${ALPHA_TXT} ...`);
  const parsed = parseAlphabetical(ALPHA_TXT);
  console.log(`  parsed ${parsed.length} entries`);

  const currentRaw = fs.readFileSync(CURRENT_JSON, 'utf8').replace(/^﻿/, '');
  const current = JSON.parse(currentRaw);
  console.log(`Loaded current conditions.json (${current.length} ailments)`);

  const report = diff(parsed, current);
  console.log(`Diff:`);
  console.log(`  new ailments: ${report.newAilments.length}`);
  console.log(`  new protocol rows on existing ailments: ${report.newProtocols.length}`);
  console.log(`  new sources: ${report.newSources.join(', ') || '(none)'}`);
  console.log(`  unknown source codes: ${report.unknownSources.join(', ') || '(none)'}`);

  fs.mkdirSync(path.dirname(OUT_PARSED), { recursive: true });
  fs.writeFileSync(OUT_PARSED, JSON.stringify(parsed, null, 2));
  fs.writeFileSync(OUT_DIFF, renderDiffReport(report));
  console.log(`\nWrote:`);
  console.log(`  ${OUT_PARSED}`);
  console.log(`  ${OUT_DIFF}`);

  if (!commit) {
    console.log('\n(dry run — pass --commit to merge into conditions.json)');
    return;
  }

  console.log('\n--- COMMIT ---');
  const backupPath = CURRENT_JSON + '.pre_2024_ingest.bak';
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, currentRaw);
    console.log(`Backup: ${backupPath}`);
  } else {
    console.log(`Backup exists at ${backupPath} — leaving in place.`);
  }
  const merged = current.slice();
  const stats = mergeIntoConditions(merged, parsed);
  const outRaw = '﻿' + JSON.stringify(merged, null, 2);
  fs.writeFileSync(CURRENT_JSON, outRaw);
  console.log(`Merged. New ailments: ${stats.newAilmentCount}. New protocol rows: ${stats.newProtoRowCount}. Total ailments now: ${merged.length}.`);
}

if (require.main === module) main();
