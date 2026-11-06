// Verifies that every Code node in workflow.json carries exactly the code in src/.
// Run: node tests/check-sync.mjs   (also run by run-rules.mjs)
import fs from 'fs';
const root = new URL('../', import.meta.url);
const workflow = JSON.parse(fs.readFileSync(new URL('workflow.json', root), 'utf8'));
const map = {
  'Test segments (EN→HR)': 'src/testset.js',
  'Rule engine':           'src/rules.js',
  'Apply LLM verdict':     'src/apply_llm.js',
  'Report':                'src/report.js',
  'Summary':               'src/summary.js',
};
let drift = 0;
for (const [name, file] of Object.entries(map)) {
  const node = workflow.nodes.find(n => n.name === name);
  if (!node) { console.log(`MISSING  node "${name}" not in workflow.json`); drift++; continue; }
  const inWorkflow = (node.parameters.jsCode || '').trim();
  const inSrc = fs.readFileSync(new URL(file, root), 'utf8').trim();
  const ok = inWorkflow === inSrc;
  if (!ok) drift++;
  console.log(`${ok ? 'sync ' : 'DRIFT'}  ${name.padEnd(24)} ${file}`);
}
console.log(drift ? `\n${drift} node(s) differ from src/. Re-export the workflow or update src/.` : '\nworkflow.json and src/ are in sync');
process.exit(drift ? 1 : 0);
