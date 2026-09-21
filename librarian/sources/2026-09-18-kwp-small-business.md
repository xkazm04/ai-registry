---
source: https://github.com/anthropics/knowledge-work-plugins/tree/main/small-business
kind: vendor repository (first-party skills plugin; 44 skills + 15 shared contracts)
url: https://github.com/anthropics/knowledge-work-plugins/tree/main/small-business
title: Small Business plugin (knowledge-work-plugins), v1.35.1
author: Anthropic
commit: ebd7990cfa9495937da7726741e1ee6a96788565
words: 701 README / 214,635 in-tree (shared/ 14,254; gotchas files 27,236)
extracted: 20
accepted: 3
declined: 0
leads: 3
already_covered: 11
untriaged: 3
dispatched: 0
applied: 3
shipped: 2
run_id: intake-kwp-smallbiz
siblings: 0 on the board at claim; 1 unboarded writer in the tree (llm-observability WIP, skills/scan-sweep WIP)
rescan_when: "the plugin's shared/ directory gains a new contract file, or chain-seams.md changes; or 10 weeks elapse (2026-11-27)"
---

# Small Business plugin - the joins are where the wrong answers live

A first-party skills plugin: 44 skills for small-business owners, over about 25
connectors, plus a `shared/` directory of cross-cutting contracts that every
skill links. Mined from a clone, not the landing page. The sweep read all 15
`shared/` contracts in full and every `reference/gotchas.md` (27k words of
Bad/Good failure pairs), plus the router skill. The README was read last and
carries nothing the tree does not.

**Class and expected yield.** A vendor repository whose value is its operating
documents. The prediction was a mature-corpus catch rate of about 70%, with
yield in the `shared/` contracts rather than the per-skill domain advice. That
held: 11 of 20 candidates were already covered, several of them by laws in
three bundles.

**Sibling lane (declared focus).** I read the leads and untriaged rows of 34
source notes from 2026-09-11..18. None banked a question these findings answer.
The nearest was a "scheduled label-only inbox triage" lead, which is a
different mechanism. Answered: 0.

## Design record

Routing count: one system (the plugin). Decisions whose `corpus:` is NONE or a
missing stage: 3 (entries 1-3). Of those, 1 is NONE and 2 are missing stages in
subjects that exist, so there are no three sharing one home-if-new. **Stay in
intake**; no forge handoff and no XL trigger.

1. **decision:** a figure crossing a skill-to-skill seam is context, never a
   denominator. **forces:** composite commands chain skills that measure
   different universes (whole ledger vs one storefront). **buys:** ratios
   computed over the base a step can reach. **rejects:** "both halves steer by
   one number". **where:** `small-business/shared/chain-seams.md:33 "It must never become the"`.
   **stage:** the handoff between chained skills. **corpus:** agent-chaining
   models the envelope (shape, bounds, provenance) but not what a figure in it
   measured. Missing stage -> landed.
2. **decision:** one connector under two registrations is one product.
   **forces:** the host registers a plugin-declared server again under the
   plugin's scope, with a different tool prefix and separate consent.
   **buys:** name-keyed rules and counts that see both forms. **rejects:**
   treating an unauthorized copy as "not connected". **where:**
   `small-business/shared/connector-neutrality.md:90 "Identity is the product, not the registration."`,
   `small-business/shared/connector-neutrality.md:112 "Anything that matches on tool names must match"`.
   **stage:** host federation. **corpus:** NONE (tool-identity covers rename
   over time, client-integration covers two servers with one name). Landed.
3. **decision:** never tell a person a cadence is set unless something was
   scheduled. **forces:** no scheduler in the runtime; "saved" reads as
   "handled". **buys:** no two-week silent fuse. **rejects:** storing "weekly"
   as a string and confirming. **where:**
   `small-business/shared/chain-seams.md:56 "There is no scheduler in this plugin."`.
   **stage:** instruction soundness. **corpus:** capability-coverage-contract
   says soundness "fails loudly-ish"; this is the case where it does not.
   Boundary -> amended.
4. **decision:** absent is not zero, as one plugin-wide contract with nine
   measured instances. **where:** `small-business/shared/absent-is-not-zero.md:6 "fixtures, and the reason is structural"`.
   **corpus:** three laws (civic-intelligence#missing-is-not-zero,
   marketing#not-measured-is-not-zero, software-engineering#unknown-is-not-a-value)
   plus measurement-honesty. Catch.
5. **decision:** content never widens the write. **where:**
   `small-business/shared/untrusted-content.md:42 "A read never widens the write."`.
   **corpus:** mcp-tools/untrusted-result-handling (application gates),
   grant-funding#untrusted-text-is-data. Catch.
6. **decision:** a connected document store is not the owner's until matched,
   and a missing data connector never falls back to one. **where:**
   `small-business/shared/tenant-scope.md:24 "A missing data connector never falls back to a document store."`.
   **corpus:** mcp-tools/ambient-selection-is-not-an-argument (resolve at the
   boundary; a fallback to "the first one" is the failure). Catch after the
   promoting read.
7. **decision:** failure knowledge is hoisted into shared, connector-labelled
   files so one fix reaches every skill. **where:**
   `small-business/shared/connector-call-shapes.md:35 "row here rather than to one skill: every skill that touches the connector"`.
   **corpus:** agent-instruction-files/single-source-topology; also the
   registry's own shape. Catch.

## Triage (v2.5 gate; upper-layer rows scored, currency and leads under the table)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | Handoff figures carry their population | agent-chaining/handoff-payload-contracts | new-technique | real gap | 3/0/2 | accept (director opened both files and the personas tree; +1 refutes chain-identity-and-rollup's crash-only failure list) |
| 2 | K | technique | M | One server, many registrations | mcp-tools/tool-identity-vs-tool-name, client-integration | new-technique | real gap | 2/0/2 | accept (primary: Claude Code 2.1.276 binary refuses plugin-scoped mock dirs because tool names "would be granted against the real thing") |
| 3 | K | amendment | S | Soundness fails silently on a forward promise | agent-instruction-files/capability-coverage-contract | corrects-claim | real gap | 2/0/1 | accept (boundary +1, refutes "fails loudly-ish" +1) |
| 4 | K | law | - | Absent is not zero | three laws | none | likely catch | - | catch |
| 5 | K | technique | - | Total the rows, not the summary object | agent-operations#measure-the-tree-not-the-summary, metrics-rollups/aggregate-honesty | none | likely catch | - | catch |
| 6 | K | technique | - | A constrained call describes its slice | civic floor-versus-total-disclosure, #every-cap-ships-its-population | none | likely catch | - | catch |
| 7 | K | technique | - | Read never widens the write | mcp-tools/untrusted-result-handling | none | likely catch | - | catch |
| 8 | K | technique | - | Tenant scope for connected stores | mcp-tools/ambient-selection-is-not-an-argument | none | partial -> catch | - | catch (promoting read done) |
| 9 | K | technique | - | Gate at the consequential moment, in dollars, unbundled | hitl-approval/consent-gates, review-queues | none | likely catch | - | catch |
| 10 | K | technique | - | Voice profile with never-dos, edits written back | marketing/brand-voice-capture | none | likely catch | - | catch |
| 11 | K | technique | - | Partial period vs full period | marketing/period-comparison-significance | none | likely catch | - | catch |
| 12 | K | technique | - | Offset beats the zone label | recruiting interviewer-timezone-anchoring, grant timezone-correct-day-math | none | likely catch | - | catch |
| 13 | K | technique | - | Unassessed criteria out of both sides | recruiting/structured-interview-scorecards, measurement-honesty/renormalize-over-present | none | likely catch | - | catch |
| 14 | K | technique | - | Platform and CRM conversions disagree | marketing#platform-reported-is-not-causal | none | likely catch | - | catch |
| 15 | K | technique | M | Fixtures carry the holes real connectors have | eval-harness/scenario-design (degenerate inputs) | fills-stack-gap | partial | 1/2/2 | untriaged |
| 16 | K | technique | M | Never report an AI visibility score; no instructions to AI in page copy | marketing/local-visibility-and-reputation | new-technique | partial | 2/2/2 | untriaged |
| 17 | K | technique | S | Command wins shared phrases, skill wins "just this step" | none clear | none | thin | 1/2/1 | untriaged |
| 18 | K | lead | - | Stockout counted as zero demand (censored demand) | none (no inventory subject) | new-subject | real gap | - | lead |
| 19 | K | lead | - | Disclose a custom connector's failure signature at install | none clear | - | partial | - | lead |
| 20 | K | lead | - | Grant go/no-go before drafting (capacity before fit, portal registration in the gate) | grant-funding (not mapped by slug) | - | partial | - | lead |

**Admission cell:** auto=3/3/0, fp=0. The scored rows ran under the Phase 5
gate. Leads ran under the corroboration table.

## Untriaged (nobody verified these)

- **15 - fixtures are complete by construction.** `small-business/shared/absent-is-not-zero.md:6 "fixtures, and the reason is structural"`.
  scenario-design already lists degenerate inputs (empty, truncated). The
  unwritten part is connector-shaped holes: a summary that contradicts its
  rows, a zero standing for absent, a future-dated record, identical
  bulk-import stamps, an empty result that is a failed query. Promoting
  question: does scenario-design's capture guidance tell a scenario author to
  keep these when promoting real payloads to fixtures?
- **16 - AI visibility.** The source says an assistant-recommendation "score"
  measures noise (results vary by run and assistant), and that writing
  instructions to AI systems into page copy is manipulation. Whether the
  marketing bundle's search subjects compute or endorse such a score was not
  read.
- **17 - router tie-break.** When a command chains a skill, shared phrases go
  to the command and the skill wins only on "just this step" phrases. No home
  was read.

## Leads

- **18 - censored demand.** Zero sales on out-of-stock days read as slow demand,
  so the next order is smaller and the item runs out sooner. The rule is to
  compute velocity over in-stock days only. It survives the strip test and has
  no home in any bundle. **Return:** a fleet project grows a reorder or
  velocity seam, or a second source.
- **19 - failure signature at install.** When connecting a fragile integration,
  tell the operator what its failure will look like ("if this ever shows zero
  and that seems wrong, it is probably this"). **Return:** a second source, or
  a fleet integration whose silent-zero failure was diagnosed late.
- **20 - bid/no-bid before drafting.** **Return:** the next grant-funding pass
  reads its eligibility subjects for a go/no-go stage.

## Landed

- technique `software-engineering/llm-agent/orchestration/agent-chaining/handoff-figures-carry-their-population`
  (+ golden-path paragraph, + one sentence in chain-identity-and-rollup, + application `rust--handoff-figures-carry-their-population`)
- technique `software-engineering/llm-agent/runtime-and-io/mcp-tools/one-server-many-registrations`
- amendment `software-engineering/llm-agent/prompt-and-context/agent-instruction-files/capability-coverage-contract` ("When soundness fails silently too")
- intake skill 2.11.1: the rescan_when sentence no longer claims a clock that nothing runs

## Applied

- **personas, code, better, ab-paired, shipped `1ce23dde3`.** The chain cost
  ceiling compared a path-carried total, while the breadth guard beside it
  counted the whole trace. A (HEAD): siblings summing to 1.20 against a 1.00
  ceiling, and the next link fired. B: halts, and the single-path control
  fires. Floor: the failure set is identical to HEAD. The seam was chosen to
  falsify (had the chains never fanned out, nothing would move). The tree also
  holds a third reading: the live summary shows the max over paths as "spent
  by the chain", left as found.
- **personas, experiment, unmeasurable, `45af0e18a` (row only).** The reflect
  parser keys MCP tools on the registration segment. Its own expression splits
  one product into 2 keys. Live: 0 plugin-scoped calls in 10,294, so the
  defect is latent. No fix shipped, because the plugin segment cannot be parsed
  reliably.
- **ai-registry, code, better, before-after.** The intake skill claimed
  `/librarian` reads rescan_when "on a clock". The weekly CI cron
  (`knowledge.yml`, Mondays 06:17) does not run `upstream-check.mjs`, and no
  other scheduler exists. False forward claims: 1 before, 0 after. The seam was
  chosen to falsify (had CI run the check, the sentence would have been true).
  A grep of 7 fleet trees found no other unbacked cadence claim.

## Directions

Skipped (`directions=n/a`). The three entries with homes landed as techniques
with applied rows, and the rest are catches. The 7.7 gate was skipped because
the run was unattended.

## Notes

- The checkout was on `harvest/live-system-demo-film`, which has diverged from
  `main` (3 main-only commits, 22 branch-only). Commits went to the branch the
  checkout was on; the branch was not switched.
- `node scripts/check-skills.mjs` is red on `skills/scan-sweep`, from an
  unboarded writer's uncommitted edit without a version bump. Not this run's.
- `catalog.json` was left uncommitted because its hash covers the
  llm-observability index, which carries a sibling's uncommitted technique
  edits.
