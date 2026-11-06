// Runs the rule engine on the test set without n8n: node tests/run-rules.mjs
import fs from 'fs';
const dir = new URL('../src/', import.meta.url);
const run = (f, input) => new Function('$input', fs.readFileSync(new URL(f, dir), 'utf8'))({ all: () => input });
const out = run('rules.js', run('testset.js', []));
let failed = 0;
for (const { json: j } of out) {
  const ok = j.ruleVerdict === 'AMBIGUOUS' || j.expected.includes(j.ruleVerdict);
  if (!ok) failed++;
  console.log(`${ok ? 'pass' : 'FAIL'}  ${j.id}  ${j.ruleVerdict.padEnd(9)}  ${j.reason}`);
}
const amb = out.filter(i => i.json.ruleVerdict === 'AMBIGUOUS').length;
console.log(`\n${out.length - failed}/${out.length} pass; ${amb} sent to the LLM`);
if (failed) process.exit(1);

// Second gate: the workflow must embed exactly the code in src/.
const { status } = await import('child_process').then(cp =>
  cp.spawnSync(process.execPath, [new URL('check-sync.mjs', import.meta.url).pathname], { stdio: 'inherit' }));
process.exit(status || 0);
