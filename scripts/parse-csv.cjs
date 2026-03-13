const fs = require('fs');

const csvPath = 'C:/Users/adaml/.openclaw/media/inbound/full_frequency_database---fcd0ff7f-1234-4314-a556-425328b19fd9.csv';
const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.split('\n').slice(1); // Skip header

const conditionMap = {};

lines.forEach((line) => {
  if (!line.trim()) return;
  
  // Parse CSV line (handles quoted fields)
  const parts = line.match(/"([^"]*)","([^"]*)","?([^",]*)"?,"?([^",\r\n]*)"?/);
  if (!parts) return;
  
  const fullCondition = parts[1];
  const frequencies = parts[2];
  const source = parts[3];
  
  // Extract condition name and body system
  const conditionParts = fullCondition.split(',');
  const conditionName = conditionParts[0].trim();
  const bodySystem = conditionParts[1] ? conditionParts[1].trim() : 'General';
  
  if (!conditionName) return;
  
  const key = conditionName.toLowerCase();
  
  if (!conditionMap[key]) {
    conditionMap[key] = {
      conditionName: conditionName,
      bodySystem: bodySystem,
      protocols: []
    };
  }
  
  conditionMap[key].protocols.push({
    frequencies: frequencies,
    source: source.trim()
  });
});

// Convert to array and add IDs, categories, tags
const conditions = Object.values(conditionMap).map((cond, idx) => {
  // Generate tags from condition name
  const words = cond.conditionName.toLowerCase().split(' ');
  const tags = [...words, cond.bodySystem.toLowerCase()];
  
  // Map body system to category
  const categoryMap = {
    'Skin': 'Dermatological',
    'Respiratory': 'Respiratory',
    'Bone Tissue': 'Musculoskeletal',
    'Immune System': 'Immune System',
    'Blood Tissue': 'Cardiovascular',
    'Stomach': 'Digestive',
    'Mouth': 'Oral Health',
    'Nose': 'Respiratory',
    'Uterus': 'Reproductive',
    'DNA': 'Genetic',
    'Cancer': 'Oncology'
  };
  
  const category = categoryMap[cond.bodySystem] || cond.bodySystem;
  
  // Number protocols
  const protocols = cond.protocols.map((p, pIdx) => ({
    id: `prot-${idx + 1}-${pIdx + 1}`,
    name: `${cond.conditionName} Protocol ${pIdx + 1} (${p.source})`,
    frequencies: p.frequencies,
    source: p.source,
    frequencyPerWeek: 3,
    durationMinutes: 30,
    recommendedWeeks: 8,
    totalSessions: 24
  }));
  
  return {
    id: `cond-${idx + 1}`,
    conditionName: cond.conditionName,
    bodySystem: cond.bodySystem,
    category: category,
    tags: [...new Set(tags)],
    description: `SpectraLight therapy protocol for ${cond.conditionName.toLowerCase()}. Uses specific therapeutic frequencies to support healing and wellness.`,
    protocols: protocols,
    suggestedPackageId: protocols.length > 12 ? 'pkg-003' : 'pkg-002'
  };
});

// Output first 100 conditions
const output = conditions.slice(0, 100);
console.log(JSON.stringify(output, null, 2));
