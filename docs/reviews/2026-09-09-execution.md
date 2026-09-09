# Architecture upgrade execution

The [architecture plan](2026-09-09-architecture.md) remains the dated baseline.
This log records execution and acceptance evidence without rewriting that baseline.

| Tranche | State | Evidence / remaining work |
| --- | --- | --- |
| 1. Enforcement and navigation | Complete | Commit `435fafb3`; recipe work included through preceding commit `fe1f55cf`. |
| 2. Format contracts | Complete | Commit `b2f223bf`; history check passed for all 136 recipes. Full recipe renderer and drift check; all 136 views migrated with patch versions; craft JSON unchanged; practice/memory checks; unfiltered CI runs the shared plan. Ten tests and all 17 local gates pass. |
| 3. Installation and authority | Implemented; harness smoke pending | Commit `d1150345`; explicit modes and rollback tested in isolated Git fixtures; capability preflight, mode-aware reflection, and private fleet roots. Full chain: 18/18; 13 tests pass. History check passed for 31 changed skills. |
| 4. Selection and context | Implemented; model comparison pending | Commit `1718d12d`; conditional branches extracted from research and architect with exact text reconstruction; Explorer quota/scope corrected; consult read-only logging corrected; 12 frozen routing cases. History check passed for four changed skills. |
| 5. Agentic-development subjects | Pending | Semantic review and source evidence per subject. |
| 6. Remaining domains and recipes | Pending | Remaining subject/topic decisions and evaluation evidence. |
| 7. Learning loop | Mechanism complete; unresolved identities queued | Explicit alias contract, retained unknown counts, report dates/windows, conservative state aggregation and reproducible freshness report. Source identity decisions still require producer evidence. |

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

## Tranche 3 decisions

- The new installer acts only on an explicitly selected project. Existing fleet
  operator scripts are not executed as part of the migration.
- Git fixtures exercise pinned release stability, explicit update and rollback,
  development edits, missing capabilities, edited caches and unowned directories.
- Roots formerly in the public fleet declaration were preserved locally before removal.
  All 12 local checkout resolutions remained identical. Missing roots no longer fall
  back to the caller's current directory. The privacy checker runs in the full chain.
- All 31 skills received reflection clause v4 and minor versions. Their maintenance
  lessons describe the instruction audit; no consumer outcome is inferred.
- A real Codex discovery smoke requires a separate agent execution. It has not run;
  filesystem discovery tests are not a substitute. Additional-agent authorization
  was requested under the session's delegation rule.

## Tranche 4 decisions and measurements

| Skill | Before | After | Entry bytes before / after | Conditional reference bytes |
| --- | --- | --- | ---: | ---: |
| research | 1.10.0 | 1.11.0 | 99,176 / 91,949 | 7,554 |
| architect | 1.7.0 | 1.8.0 | 70,640 / 62,519 | 8,405 |

Measurements normalize CRLF to LF and count UTF-8 bytes. Replacing each new stub with
its reference reconstructed the old entry exactly, apart from its version. These are
source-byte measurements, not observed token usage or latency. Optional branch runs
load the stub as well as the reference; no speed or quality gain is claimed.

Explorer 2.3.0 makes ten findings a ceiling, permits zero, and prevents quota-driven
scope expansion. Consult 1.4.0 resolves all catalog bundles and preserves read-only
scope when logging. The [12 routing cases](../evals/routing-cases.json) freeze desired
selection and action boundaries. They are evaluation inputs, not passing results.
The skills lane passes 5/5 checks. Model A/B execution remains pending.

## Tranche 7 decisions and evidence

This independent tranche was implemented while the model smoke/comparison remained
pending. Baseline: `1718d12d`. The task was to preserve telemetry uncertainty without
inflating named-artifact priority. `scripts/tests/telemetry.test.mjs` freezes duplicate
state, migration-alias, unresolved-count and freshness scenarios. All pass; the full
chain passes 18/18 with 16 tests. The aggregate deviation floor/ceiling remains 370/550.

`identity-aliases.json` requires a current target and a reason for each confirmed
migration. No mapping was guessed. Seven unknown usage names remain in the catalog's
evidence envelope; 24 unknown signal observations remain in the report and scorecard
JSON. These are assigned to identity reconciliation when producer evidence is available.
One possible duplicate block is diagnostic only, and cannot increase state priority.

The catalog now records source report dates/windows and distinguishes all reported
invocations from reported 30-day windows. `telemetry-report.mjs --as-of 2026-09-09`
is reproducible. It never updates source dates or infers current content from fresh
telemetry. [The contract](../telemetry-identity.md) defines future impact records;
the frozen workflow cases and unavailable model comparison remain open review work.
