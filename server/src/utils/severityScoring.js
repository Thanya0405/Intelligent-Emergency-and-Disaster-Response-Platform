const calculateSeverityScore = (data) => {
  let score = 0;

  // Type-based base score
  const typeScores = {
    earthquake: 9,
    tsunami: 10,
    cyclone: 8,
    flood: 7,
    fire: 7,
    accident: 6,
    medical: 5,
    sos: 8,
    other: 4
  };

  score += typeScores[data.type] || 4;

  // Affected persons multiplier
  if (data.affectedPersons > 10) score += 3;
  else if (data.affectedPersons > 5) score += 2;
  else if (data.affectedPersons > 1) score += 1;

  // Normalize to 0-10
  score = Math.min(10, score);

  // Map to severity level
  let severity;
  if (score >= 8) severity = 'critical';
  else if (score >= 6) severity = 'high';
  else if (score >= 4) severity = 'medium';
  else severity = 'low';

  return { score, severity };
};

module.exports = { calculateSeverityScore };
