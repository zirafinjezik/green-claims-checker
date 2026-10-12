const rows = $input.all().map(i => i.json);
const count = v => rows.filter(r => r.verdict === v).length;
return [{ json: {
  segments: rows.length,
  OK: count('OK'), FLAG: count('FLAG'), REVIEW: count('REVIEW'),
  decidedByRules: rows.filter(r => r.decidedBy === 'rules').length,
  decidedByLLM: rows.filter(r => r.decidedBy !== 'rules').length,
  matchesExpected: rows.filter(r => r.matchesExpected).length + ' / ' + rows.length,
  mismatches: rows.filter(r => !r.matchesExpected).map(r => r.id).join(', ') || 'none',
} }];
