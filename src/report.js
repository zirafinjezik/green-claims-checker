// One row per segment, sorted, with a check against the expected verdict.
const rows = $input.all().map(({ json: j }) => {
  const verdict = j.verdict || j.ruleVerdict;
  return {
    id: j.id,
    verdict,
    decidedBy: j.decidedBy || 'rules',
    reason: j.reason,
    expected: (j.expected || []).join(' / '),
    matchesExpected: (j.expected || []).includes(verdict),
    source: j.source,
    target: j.target,
  };
}).sort((a, b) => a.id.localeCompare(b.id));
return rows.map(r => ({ json: r }));
