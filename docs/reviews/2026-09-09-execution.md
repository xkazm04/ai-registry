# Architecture upgrade execution

The [architecture plan](2026-09-09-architecture.md) remains the dated baseline.
This log records execution and acceptance evidence without rewriting that baseline.

| Tranche | State | Evidence / remaining work |
| --- | --- | --- |
| 1. Enforcement and navigation | Complete | Commit `435fafb3`; recipe work included through preceding commit `fe1f55cf`. |
| 2. Format contracts | Implemented, validating commit | Full recipe renderer and drift check; all 136 views migrated with patch versions; craft JSON unchanged; practice/memory checks; unfiltered CI runs the shared plan. Ten tests and all 17 local gates pass. |
| 3. Installation and authority | Next | Explicit development/release modes, Codex adapter, capability contract, reflection scope, and local fleet roots. |
| 4. Selection and context | Pending | Conditional references and behavioral routing checks. |
| 5. Agentic-development subjects | Pending | Semantic review and source evidence per subject. |
| 6. Remaining domains and recipes | Pending | Remaining subject/topic decisions and evaluation evidence. |
| 7. Learning loop | Pending | Identity reconciliation, freshness and impact records. |

## Tranche 2 decisions

- Keep the current three-level recipe layout and ten-child hard limit. The documentation
  now requires a format/consumer migration before adding another grouping level.
- `recipe.json` is the complete authority. The generated view includes adoption details,
  provenance and unfamiliar extension values instead of losing them during rendering.
- Patch versions identify the rendering migration. Recorded maintenance lessons concern
  rendering verification only. Every recipe remains `seed`; no field effectiveness is claimed.
- Small-lane prose is UTF-8; frontmatter is ASCII. This matches the existing readable
  corpus while giving both small lanes concrete validation of identity and required fields.
- `registry.yml` has no path filter and calls `gate.mjs --all`. Existing workflow check
  names remain available for compatibility with remote protection settings.
- Regression tests use isolated temporary recipe trees: stale index and prose fail;
  regeneration repairs them; malformed source prevents writes.
