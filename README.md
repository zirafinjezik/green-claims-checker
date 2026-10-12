# Green claims checker (EN→HR)

An n8n workflow that checks English source and Croatian target segments for environmental claims affected by **EU Directive 2024/825** (empowering consumers for the green transition). It flags generic claims ("eco-friendly", "sustainable", "green solution"), climate-neutrality claims and unsupported superlatives, and catches claims that only appear in the translation.

Status: tested end to end in self-hosted n8n 2.42 with gemma3:12b running locally in Ollama: **21/21 segments match the expected verdict** (16 decided by rules, 5 by the model), 12 Oct 2026.

## How it works

```
Test segments → Rule engine → Ambiguous? ──yes──→ Local LLM (Ollama) → Apply LLM verdict ─┐
                                         └──no───────────────────────────────────────────┴→ Report → Summary
```

1. **Rules first.** Deterministic and auditable. Every verdict states which term triggered it.
2. **Allow-list before matching.** Technical uses are masked first: *carbon filter*, *green/yellow earth wire*, *green LED*, *energy label class*, *natural refrigerant*, *ecodesign* / *ekološki dizajn*.
3. **Croatian inflection** is handled with stems and Unicode-aware word boundaries (`ekološk…`, `održiv…`, `zelen…`, `prihvatljiv… za okoliš`), so *održiva*, *održivog* and *održivost* all match.
4. **Claims introduced by the translation always FLAG.** If the target contains a claim term and the source has none, the segment is flagged regardless of wording.
5. **The LLM only sees ambiguous segments** (5 of 21 in the test set): "green" without context, recycled content, emissions figures. It runs locally through Ollama, so no content leaves the machine, and answers in fixed JSON: `NO_CLAIM` → OK, `GENERIC_CLAIM` → FLAG, `SPECIFIC_CLAIM` → REVIEW (a human checks the evidence). Unreadable answers go to human review.

## Verdicts

| Verdict | Meaning |
|---|---|
| OK | No environmental claim after the allow-list, or the LLM found none |
| FLAG | Generic, neutrality or superlative claim, or a claim introduced by the translation |
| REVIEW | Specific claim (figures, materials, standards) that needs evidence |

## Run it

Requirements: Node.js 24, n8n 2.x, Ollama with `gemma3:12b` (any local model that returns JSON works).

```
ollama pull gemma3:12b
npx n8n
```

In n8n (http://localhost:5678): **Workflows → Import from file → `workflow.json`**, then **Execute workflow**. The *Summary* node shows totals and any mismatch against the expected verdicts. To change the model or the Ollama address, edit the *Local LLM (Ollama)* node. It uses `127.0.0.1` rather than `localhost`, because on Windows `localhost` can resolve to IPv6, where Ollama does not listen.

Rules only, without n8n:

```
node tests/run-rules.mjs
```

## Files

- `workflow.json` – the n8n workflow
- `src/` – code of each Code node (test set, rule engine, LLM mapping, report)
- `tests/run-rules.mjs` – runs the rule engine on the test set outside n8n

## Limits

- The test set is synthetic (heating and appliance content), written to cover known traps: "green" as a colour (S01, S20) versus "green solution" (S19), split phrases (S13), claims added in translation (S15, S16).
- Term lists are a starting point for EN and HR, not a complete legal inventory.
- The tool supports a reviewer; it is not legal advice. FLAG and REVIEW results need a human decision.
