#!/usr/bin/env node
/**
 * Session evaluator — assesses session quality based on output
 */
const fs = require('fs');

const METRICS_FILE = process.argv[2] || null;

function evaluate(sessionData) {
  const score = {
    files_created: 0,
    files_modified: 0,
    tests_passing: 0,
    errors_encountered: 0,
    agent_delegations: 0,
    quality_score: 0,
  };

  if (sessionData?.summary) {
    const s = sessionData.summary;
    score.files_created = s.files_created || 0;
    score.files_modified = s.files_modified || 0;
    score.tests_passing = s.tests_passing || 0;
    score.errors_encountered = s.errors_encountered || 0;
    score.agent_delegations = s.agent_delegations || 0;
  }

  // Calculate quality: positive for productivity, negative for errors
  score.quality_score = (
    (score.files_created * 10) +
    (score.files_modified * 5) +
    (score.tests_passing * 3) -
    (score.errors_encountered * 15)
  );

  score.grade = score.quality_score > 50 ? 'A' :
    score.quality_score > 20 ? 'B' :
    score.quality_score > 0 ? 'C' :
    'D';

  return score;
}

function main() {
  if (METRICS_FILE && fs.existsSync(METRICS_FILE)) {
    const data = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
    const result = evaluate(data);
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(JSON.stringify({
      usage: 'node evaluate-session.js <session-metrics.json>',
      example: {
        summary: {
          files_created: 5,
          files_modified: 3,
          tests_passing: 12,
          errors_encountered: 1,
          agent_delegations: 4
        }
      }
    }, null, 2));
  }
}

main();
