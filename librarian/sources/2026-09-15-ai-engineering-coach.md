---
source: https://github.com/microsoft/ai-engineering-coach
kind: repository
url: https://github.com/microsoft/ai-engineering-coach
title: "AI Engineer Coach - better agentic engineering"
author: Microsoft (first-party)
commit: 18b1a3d16b586c171426c6a407cc5c2dc073556e
commit_date: 2026-09-05
words: 1406 landing / 18,390 in-tree md (AGENTS, CHANGELOG, AUTHORING_RULES, docs/content, 45 rules, 10 metrics, skills)
extracted: 15
accepted: 1
declined: 0
leads: 1
already_covered: 3
untriaged: 9
dispatched: 6
applied: 9
shipped: 10
run_id: intake-aecoach
siblings: 3
operator_scope: "impact on software-development domain, project ascent"
rescan_when: "a release tag lands after 18b1a3d (CHANGELOG shows 0.1.0 plus an Unreleased section, so the first tagged release is the natural trigger); or ascent's UC3 local mentor sensor starts being built (the comparison study's adopt rows go stale then); or 10 weeks elapse (2026-11-24)"
---

# AI Engineer Coach - intake 2026-09-15

A source originates a finding; it never authorizes one.

**Class:** vendor repository in practitioner form: a shipped editor extension that parses
coding agents' local session logs (six harnesses), scores the user's habits with 45
markdown+DSL rules, and renders a dashboard. Not a hosted engine, so the types and the
rule files are the operating documents; the README is a feature tour.
**Expected yield said before the table:** a handful of design decisions about measuring
agentic work from logs, most of them catches in `engineering-assessment/*`, which is
mature; the operator-named project (ascent) is a near-peer, so the likeliest real
output was a comparison study and a seam, not a subject.
**Siblings live at claim:** 3 (intake-react-19-3 on ui-surfaces/motion, intake-ragas,
intake-awesome-llm-apps-0915); later intake-cline-desktop on prompt-assembly. None held
a subject this run landed in.
**Declared focus from the scorecard** (filmmaking digest): render-pair and seed-floor
rules do not apply to a repository; its third item, "run the map before extracting from a
digest", held in spirit - the map ran before any candidate went deep, and it moved the
run from `llm-agent` toward `engineering-assessment` and then `metered-billing`. The
motionbricks focus item "run the fleet's own ledgers in the seam hunt" is what produced
the landing.

**Swept** (Phase 2b order): `AGENTS.md`, `docs/AUTHORING_RULES.md`, `CHANGELOG.md`,
`docs/content/improve/{anti-patterns,context-health}.md`, `docs/content/level-up/sdlc.md`;
the instrument layer `src/core/rule-trust.ts`, `src/core/dsl/safe-regex.ts`,
`src/core/detectors/scoring.ts`, eight rules (`cache-hit-starvation`,
`runaway-agent-loops`, `speed-accept`, `instruction-bloat`, `mcp-tool-bloat`,
`agentic-no-tools`, `no-spec-driven-development`, `session-drift`); the measurement
`src/core/github-app-issue-credit-model.ts`, `github-app-delivery-funnel.ts`,
`edit-loc-diff.ts`, `analyzer-consumption.ts:120-200`; the types
`src/core/types/session-types.ts:47-127`, `parser-vscode-request.ts:400-500`;
`src/webview/page-experiments.ts`. README last. Tests not read beyond file names.

## Design record

Nine entries, one system (the extension).

1. **decision:** detection rules are markdown files with thresholds and a DSL block, and
   each carries inline `# Tests` rows run by the suite; built-in, personal and project
   layers. **forces:** users tune thresholds without code; a rule without fixtures drifts.
   **buys:** a rule change is reviewable and self-testing. **rejects:** rules as code.
   **where:** `docs/AUTHORING_RULES.md`, `src/core/rules/lazy-prompting.md`.
   **stage:** detection. **corpus:** conformance-checking/rule-registry-enumerated-fixtures
   and web-scraping/extraction-rule-dsl are the neighbours; NOT OPENED this run.
   **Corrected after the peer study:** the docs claim `npm test` runs every rule's
   `# Tests` block; only 4 of 45 built-in rules carry one, and `runTestCases` is exercised
   only on synthetic markdown in `metric-engine.test.ts` - no test iterates the shipped
   rules (director re-checked: `grep -l "^# Tests" src/core/rules/*.md` = 4). The
   fixture discipline is documented, not practised.
2. **decision:** personal and project rule files are trusted on first use by SHA-256 of
   their content; any edit revokes approval; blocked files queue for review; user regexes
   pass a backtracking heuristic and input cap. **forces:** a cloned repository can ship a
   rules directory whose DSL executes when the dashboard opens. **buys:** opening a view
   never runs content the reader did not approve at that exact byte state. **rejects:**
   trust by location. **where:** `src/core/rule-trust.ts:7-26,67-80`,
   `src/core/dsl/safe-regex.ts:9-60`. **stage:** load. **corpus:** NONE; nearest
   sidecar-provisioning/split-trust-by-registration-path (opened), which splits trust by
   the door a runtime plugin entered through and has no third door for "a file inside the
   thing being analysed". HOME IF NEW: security (contested).
3. **decision:** AI credit for a work item comes from sessions linked by evidence
   precedence - a workspace created from the item, else a pasted link, else a single
   referenced item, else NOTHING; per-item estimates count a shared session fully in each
   row while the total dedupes sessions. **forces:** inferred links are cheap and wrong
   when a session mentions two items. **buys:** no guessed attribution. **rejects:**
   splitting a session across candidates. **where:**
   `src/core/github-app-issue-credit-model.ts:139-154,197-238`. **stage:** attribution.
   **corpus:** adoption-measurement/attribution-provenance-tiers ("refuse the mixed sum",
   frontmatter and that step read, body not read in full) and
   delivery-analytics/attribution-channels. Likely catch, not verified to the line.
4. **decision:** AI lines are counted by reconstructing each file version from its
   baseline and diffing, because whole-file-rewrite edit tools re-serialize the body
   (over-count) and ranged-replace tools only show insertions (under-count). **forces:**
   comparing models or harnesses by "lines written" otherwise measures their edit grammar.
   **buys:** a tool-agnostic unit. **rejects:** summing edit payloads. **where:**
   `src/core/edit-loc-diff.ts:6-19`. **stage:** measurement. **corpus:** NONE for
   producer-reported volume; nearest delivery-analytics/batch-size-thresholds "the unit is
   stated" (opened), which assumes the unit comes from version-control diffs.
5. **decision:** each token counter's accumulation scope is written beside the field
   (prompt = last round only; completion = cumulative), and requests that could not carry
   tokens (`pending`, `errored`, `no-data`) leave the coverage denominator. **forces:** the
   host log mixes per-round and whole-request counters. **buys:** honest coverage.
   **rejects:** reading absence as zero. **where:** `session-types.ts:70-109`,
   `parser-vscode-request.ts:422-446,478-491`. **stage:** ingestion. **corpus (at Phase 2d):**
   measurement-honesty covers the denominator half (golden path opened); the scope half had
   NONE - now `usage-event-ingestion/running-total-or-increment`, with this tree as its
   source-tree application. **The source inverts its own rule** at
   `parser-vscode-request.ts:418`: `completionTokens` falls back to the last-round value
   the comment calls a dramatic undercount, and nothing records which filled it.
6. **decision:** a weekly 0-100 score per practice group from per-request penalties,
   including requests before 05:00 and on weekends as "session hygiene". **forces:** a
   single trend number for a person. **buys:** a legible private trend. **rejects:**
   nothing stated. **where:** `src/core/detectors/scoring.ts:17-27`. **stage:** scoring.
   **corpus:** people-analytics-ethics (golden path opened): the extension is a private
   view on the user's own machine, which that subject permits; the share card
   (`page-peers.ts`) is where it would leave. Catch.
7. **decision:** "spec-driven" sessions are classified by first-prompt keywords including
   `must|should|ensure`. **forces:** no structured signal for intent. **buys:** a cheap
   ratio. **rejects:** nothing. **where:** `src/core/rules/no-spec-driven-development.md`
   `patterns.specKeywords`. **corpus:** metric-gates/proxy-metric-counts-its-own-satisfiers
   (NOT opened). The proxy saturates on ordinary English.
8. **decision:** parsing runs in a forked child with a capped heap and streams per-session
   chunks back under ack-window backpressure. **forces:** out-of-memory on large log sets
   (#106). **where:** `CHANGELOG.md` Unreleased, `src/core/parse-worker-stream.ts`.
   **corpus:** streaming-output/buffering-and-backpressure (NOT opened). No fleet seam named.
9. **decision:** context provision is read from session behaviour per harness
   (file-reference rate, instruction attachment rate, skills and tools usage) beside an
   eight-signal readiness score. **Corrected after the peer study:** the readiness score
   itself is weighted checks for files on disk; only the per-harness provision table and
   context management come from sessions. **forces:** a skills directory nobody invokes
   is not adoption. **where:** `docs/content/improve/context-health.md`.
   **corpus:** maturity-ladders/present-vs-enforced and
   adoption-measurement/attribution-provenance-tiers (observed-act tier) - golden paths
   opened. Catch for the corpus; for ascent it is the unbuilt half of UC3.

**Routing count.** NONE per system: 3 (entries 2, 4, 5-scope) in one system. HOME IF NEW
across entries: security / delivery-analytics / metered-billing-ingestion - no two share
a home, so the XL clause does not fire. The per-system clause fires on the letter (three
NONE) and **the handoff was declined**: the three are single mechanisms belonging to
three existing subjects' territories, not a system whose architecture the corpus lacks;
a forge over a 45-rule dashboard would design subjects the engineering-assessment
category already holds. Recorded so the scorecard's depth cell can call it a routing
judgement rather than a miss.

## Where the landing came from

Not from the source. Phase 7.5's seam hunt opened ascent to look for where entry 5
(counter scope) would apply and found a live defect the source's own habit pointed at:
ascent's metrics ingest reads one interval report into two stores, a day table that ADDS
and a session table that REPLACES, and neither reads the report's temporality field. The
vendor's monitoring documentation (fetch 1 of 3) sets the exporter default to **delta**,
60-second interval, and ascent's connect snippet does not override it. The session
table's header comment asserted the counters were cumulative. Primary-over-comment:
the documentation wins the tier conflict.

## Triage (v2.5 scored)

Rule column: `score` = Phase 5 arithmetic; `table` = currency/lead under the
corroboration table.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Rule | Decision |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | Decode running total vs increment at the door | usage-event-ingestion (NONE) | new-technique | real gap | 3/0/2 | score | **accept** - landed, applied code/better, shipped |
| 2 | K | amendment | S | A producer-reported line count measures its edit grammar | delivery-analytics/batch-size-thresholds | corrects-claim | partial | 1/0/1 | score | untriaged (below +2) |
| 3 | K | technique | M | Trust workspace-supplied executable rules by content hash | sidecar-provisioning (contested) | new-technique | partial | 2/1/2 | score | untriaged (below +2) |
| 4 | K | design | M | Rules as data with inline fixtures | conformance-checking | none | likely catch | - | - | untriaged (neighbour not opened) |
| 5 | K | design | S | Evidence precedence, attribute nothing on ambiguity | attribution-provenance-tiers | none | likely catch | - | - | untriaged (read partially) |
| 6 | K | design | S | Coverage denominator by end state | measurement-honesty | none | catch | - | - | already covered |
| 7 | K | design | S | Hour and weekend penalties in a private score | people-analytics-ethics | none | catch | - | - | already covered |
| 8 | K | design | S | Behaviour in session over presence in repo | maturity-ladders/present-vs-enforced | none | catch | - | - | already covered |
| 9 | K | design | S | Keyword proxy for spec-driven work saturates | metric-gates | none | likely catch | - | - | untriaged (not opened) |
| 10 | K | design | S | Forked parser with capped heap and ack backpressure | streaming-output | none | likely catch | - | - | untriaged (not opened) |
| 11 | K | currency | S | Always-on instruction file budget ~4 KB | agent-instruction-files | resets-clock | thin | - | table | untriaged (a threshold with no measurement behind it) |
| 12 | K | currency | S | Tool catalogs past ~40 tools inflate every prompt | mcp-tools | resets-clock | thin | - | table | untriaged |
| 13 | K | design | S | Cache starvation: long prompts under 10% cache read | prompt-assembly | none | likely catch | - | - | untriaged (not opened) |
| 14 | K | lead | S | Seconds-to-next-message as a review proxy | machine-paced-delivery | none | thin | - | table | **lead** |
| 15 | X | direction | L | Ascent peer comparison study (UC3 sensor) | - | fills-stack-gap | real gap | - | E1 | **escalated** - study dispatched, gate below |

auto=1/2/1, fp=0. Row 1 was never at risk at Phase 6: the tree read, the primary and
the paired arm A all agreed before drafting.

## Untriaged - nobody verified these

Anchors kept so a later run does not re-derive them. Not declines.

- **Row 2, producer edit grammar.** `edit-loc-diff.ts:6-19`. Return condition: ascent (or
  any fleet project) sums a lines metric from **two** providers - ascent's
  `buildAttemptRollup` already sums `linesAdded` with no source key, harmless with one
  source. Scored as an amendment to batch-size-thresholds ("a stated unit name is not a
  stated unit when each producer computes it").
- **Row 3, trust on first use.** `rule-trust.ts`, `safe-regex.ts`. Return condition: a
  fleet project evaluates detector or rule content authored inside the tree it analyses
  (personas' operator-supplied code is the likeliest). Home must be argued first.
- **Rows 4, 9, 10, 13:** neighbours named, not opened.
- **Row 5:** read attribution-provenance-tiers in full before calling it a catch; the
  ambiguity refusal (a session naming two items gets neither) may be the missing clause.
- **Rows 11-12:** the rules state thresholds (4000 bytes, 40 tools) without a measurement;
  a threshold is not a finding.

## Leads

- **Seconds-to-next-message as a review proxy** (`src/core/rules/speed-accept.md`: next
  message within 15 s of 20+ AI lines). A latency between chat turns cannot see review
  done in a diff view or after the next prompt. Return condition: a fleet project records
  editor-side review events that could calibrate it.

## Already covered (files opened)

Rows 6, 7, 8 - golden paths of measurement-honesty, people-analytics-ethics and
maturity-ladders opened at Phase 4/6.

## Applied and shipped

- `running-total-or-increment` -> ascent, `code`, `better`, `ab-paired`. Seam chosen to
  falsify: the day table could have shown the technique redundant (it was correct under
  the default); the session table, written specifically to avoid the running-total
  mistake, was the one that inverted it. A (HEAD) delta: session 500 / day 1500;
  cumulative: session 1500 / day 2500. B: 1500/1500 and 1500/refused-and-counted. 114 test
  files / 2085 tests green, tsc and eslint clean. Shipped `7dc3a545` on ascent's active
  branch `docs/org-path-of-use-adr-20260914`, pathspec, not pushed; ascent's tree carried
  23 foreign modified files, none touched.
- Registry commits: `c203de35` (technique, golden-path section, two applications),
  `21dbbf8e` (index, rules, catalog built in a detached worktree of HEAD because
  intake-ragas had an uncommitted subject failing check-bundles and a lesson was
  uncommitted in skills/perfect - neither baked in).

## Directions

**Peer shape (v2.2).** Ascent's UC3 "individual care" plans a local mentor sensor that
reads a developer's own sessions; the source is a shipped sensor of that class. A study
was dispatched, not written by the director: ascent
`.ai/directions/2026-09-15-ai-engineering-coach-comparison.md` (`ef6ddce8`), 43 points -
adopt 4 / adapt 12 / keep ours 20 / different forces 7 - six paired tests, eight ranked
features, and what ascent does better (bounded payoff for scanned-party text, typed
withheld states, producer-enforced floors, allocation over attribution). The study
corrected five seeded points against both trees, two of which this note had wrong (entries
1 and 9, now marked). Its new findings: the source penalizes instruction files over 4000
bytes while ascent paid points at 4000 characters; ascent's planned org bands claimed no
individual is recoverable at a floor of 3, which is false; the source's "code review"
penalty measures how fast the model replied.

**Gate (7.7).** Operator multi-select 2026-09-15: all eight accepted, none declined.
Ledger rows `c4238053`. Executed in-session by five workers on five branches split by
file ownership (v2.3.2); the director reviewed each diff, re-ran each gate, merged
`--no-ff` into ascent's active branch and union-resolved `.ai/applied.jsonl` four times:

| Feature | Branch merge | Proof read from the gate |
|---|---|---|
| source-keyed-attempt-rollup | `963d44e3` | T2: one row mixing sources 1 -> 0; unit economics folds back per repo so the denominator counts once |
| care-share-contract | `768c4823` | validator refuses 15/15 bad payloads the code accepted |
| care-band-floor-on-sharers | `768c4823` | T6: at 3 sharers a sharer recovers 2/2 others exactly -> suppressed, 0/2 (at 5 the middle quartiles are still real values; stated, not hidden) |
| guidance-signal-census | `54d77637` | stuffed 4001-char file scores the grader maximum 56 vs real median 34 |
| stop-rewarding-guidance-length | `54d77637` | rubric r17 -> r18; T4 boundary +3 -> 0; mock bench exact level 7/10 -> 8/10, MAE 0.3 -> 0.2 |
| mentor-intake-counter | `6a57af7f` | T1 on fixtures; real local logs (read-only, counts only): 349 interactive sessions counted, 8,106 programmatic excluded, plan mode 0%, tests before 31.1% of 2,771 commits |
| self-reported-count-ceiling | `4a75ef85` | T5: 1,000,012 -> 15,012 invokes30d, 1 contributor clamped and named |
| prompt-egress-redactor | `4a75ef85` | 16 secret shapes x 6 prompt builders: 96 reaching prompts -> 0; found a JSON-escaped quote leak mid-build |

Merged tree: full vitest 964 files / 12,567 tests green, tsc clean. Nothing pushed;
worktrees and merged branches removed (node_modules junctions removed first).

**Directions not proposed:** none cut by a cap - the peer shape moves the cap onto the
study's ranked features and all eight reached the gate.

## Instrument notes

- The first LOC grep matched `local`/`lock` case-insensitively and proved nothing; the
  rerun used a positive control (`tool-written` must hit delivery-analytics) before
  trusting the absence.
- A cited line (`analyzer-consumption.ts:133`) was opened after drafting and did not say
  what the application claimed; the application now cites `:161-167`, which does.
