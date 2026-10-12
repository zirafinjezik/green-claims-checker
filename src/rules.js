// Rule engine: EN source + HR target. Croatian inflection via stems + Unicode letter boundaries.
// FLAG = generic/neutrality/superlative claim, or any claim introduced by the translation.
// AMBIGUOUS = needs context (green, recycled, emissions...) -> local LLM.
const B = '(?<![\\p{L}\\p{N}])';   // left word boundary (Unicode-aware)
const E = '(?![\\p{L}\\p{N}])';    // right word boundary
const rx = s => new RegExp(B + s + E, 'giu');
const stem = s => new RegExp(B + s + '\\p{L}*' + E, 'giu');

const ALLOW = {
  en: [/carbon filters?/giu, /green[\/-]yellow/giu, /green LEDs?/giu, /energy (label|efficiency) class/giu,
       /natural refrigerants?/giu, /eco-?design/giu],
  hr: [stem('ugljeni filt'), stem('ugljični filt'), new RegExp(B + 'zeleno-žut\\p{L}*', 'giu'),
       new RegExp(B + 'zelen\\p{L}* LED', 'giu'), new RegExp(B + 'energetsk\\p{L}* oznak\\p{L}*', 'giu'),
       new RegExp(B + 'prirodn\\p{L}* rashladn\\p{L}*', 'giu'), new RegExp(B + 'ekološk\\p{L}* dizajn\\p{L}*', 'giu')],
};

const RULES = {
  en: [
    { re: rx('eco-?friendly|environment(ally)?[ -]friendly|climate[ -]friendly|planet[ -]friendly'), level: 'flag', type: 'generic' },
    { re: rx('(carbon|climate|CO2)[ -]neutral(ity)?|net[ -]zero'), level: 'flag', type: 'neutrality' },
    { re: stem('sustainab'), level: 'flag', type: 'generic' },
    { re: rx('most (eco-?friendly|energy[ -]efficient|efficient|sustainable)'), level: 'flag', type: 'superlative' },
    { re: rx('green (solution|technology|choice|product|future|home)s?'), level: 'flag', type: 'generic' },
    { re: rx('green'), level: 'review', type: 'green' },
    { re: stem('biodegrad'), level: 'review', type: 'specific' },
    { re: stem('recycl'), level: 'review', type: 'specific' },
    { re: rx('(CO2|carbon) emissions?|reduces? emissions'), level: 'review', type: 'specific' },
  ],
  hr: [
    { re: new RegExp(B + 'prihvatljiv\\p{L}* za okoliš' + E, 'giu'), level: 'flag', type: 'generic' },
    { re: stem('ekološk'), level: 'flag', type: 'generic' },
    { re: new RegExp(B + 'klimatsk\\p{L}* (prihvatljiv|neutraln)\\p{L}*', 'giu'), level: 'flag', type: 'generic' },
    { re: new RegExp(B + '(ugljičn|CO2[ -]?)\\p{L}* ?neutraln\\p{L}*', 'giu'), level: 'flag', type: 'neutrality' },
    { re: stem('održiv'), level: 'flag', type: 'generic' },
    { re: stem('najučinkovitij'), level: 'flag', type: 'superlative' },
    { re: new RegExp(B + 'zelen\\p{L}* (rješenj|tehnologij|izbor|budućnost|dom)\\p{L}*', 'giu'), level: 'flag', type: 'generic' },
    { re: stem('zelen'), level: 'review', type: 'green' },
    { re: stem('biorazgradiv'), level: 'review', type: 'specific' },
    { re: stem('recikl'), level: 'review', type: 'specific' },
    { re: new RegExp(B + 'emisij\\p{L}*', 'giu'), level: 'review', type: 'specific' },
  ],
};

function scan(text, lang) {
  let t = text;
  for (const a of ALLOW[lang]) t = t.replace(a, m => ' '.repeat(m.length)); // mask allow-listed spans
  const hits = [];
  const taken = [];
  for (const r of RULES[lang]) {
    for (const m of t.matchAll(r.re)) {
      const s = m.index, e = s + m[0].length;
      if (taken.some(([a, b]) => s < b && e > a)) continue; // a stronger rule already covered this span
      taken.push([s, e]);
      hits.push({ term: m[0], level: r.level, type: r.type });
    }
  }
  return hits;
}

return $input.all().map(item => {
  const seg = item.json;
  const src = scan(seg.source, 'en');
  const tgt = scan(seg.target, 'hr');
  let ruleVerdict, reason;
  if (tgt.length && !src.length) {
    ruleVerdict = 'FLAG';
    reason = 'Claim introduced by the translation: ' + tgt.map(h => h.term).join(', ');
  } else if ([...src, ...tgt].some(h => h.level === 'flag')) {
    ruleVerdict = 'FLAG';
    reason = 'Rule match: ' + [...src, ...tgt].filter(h => h.level === 'flag').map(h => `${h.term} (${h.type})`).join(', ');
  } else if (src.length || tgt.length) {
    ruleVerdict = 'AMBIGUOUS';
    reason = 'Needs context: ' + [...src, ...tgt].map(h => h.term).join(', ');
  } else {
    ruleVerdict = 'OK';
    reason = 'No claim terms after allow-list';
  }
  const out = { ...seg, sourceHits: src, targetHits: tgt, ruleVerdict, reason };
  if (ruleVerdict === 'AMBIGUOUS') {
    out.llmPrompt = [
      'You check product content against EU Directive 2024/825 (empowering consumers for the green transition).',
      'Classify the segment below. Answer with JSON only: {"verdict": "NO_CLAIM" | "GENERIC_CLAIM" | "SPECIFIC_CLAIM", "reason": "one short sentence"}.',
      'NO_CLAIM: no environmental claim, for example "green" used only as a colour, or a technical term.',
      'GENERIC_CLAIM: a vague environmental benefit without specific, verifiable content, for example "green energy", "eco", "environmentally friendly".',
      'SPECIFIC_CLAIM: a concrete environmental claim (percentages, materials, test standards) that must be backed by evidence.',
      'Terms that triggered this check: ' + [...src, ...tgt].map(h => h.term).join(', '),
      'English source: ' + seg.source,
      'Croatian target: ' + seg.target,
    ].join('\n');
  }
  return { json: out };
});
