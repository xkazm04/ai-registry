---
source: github:NousResearch/hermes-agent
kind: repository - research-model release (the engine and its operating instructions ship in one tree: 49k words of first-party operating documents - ADRs, design docs, wire contracts, an RCA, a comparative spike - over ~638k lines of runtime and a million lines of tests; a peer of the fleet's own agent runtime)
url: https://github.com/NousResearch/hermes-agent
title: "hermes-agent - the agent that grows with you"
author: NousResearch
commit: 0cbc6e37ac9fce50905157805c89fae06da93845
words: 2,059 landing / 49,248 in-tree operating documents (docs/ 36,663 + AGENTS.md 12,585; ~22,500 read whole) over ~638,000 lines of runtime and 1,001,481 lines of tests; the ~500k words of vendored ML references under optional-skills were skipped as not-the-source
method: 2.1.1 (round 2 of the 2.x calibration series; every worker was Opus, the director Fable)
extracted: 30
accepted: 16
declined: 0
leads: 7
already_covered: 9
untriaged: 10
dispatched: 5
applied: 16
shipped: 1
routing_count: 3 (system B, profile isolation in one process; per system 4/3/3/2/0/0 over six systems)
handoff: forge (scoped to system B; one worker, one subject, same session) + three technique-grain workers on the systems whose home existed
directions: 4 proposed (pof 1, personas 3) + 1 peer comparison study (76 points) / 0 not proposed
run_id: intake-hermes-0902
siblings: 1 at claim (a forge run), 0 by commit
rescan_when: "the tree lands a VALID_HOOKS-to-emit-site drift test (deviation, RFC lesson 3) - honest-hook-registry then has a second realization; or the home resolver gains a fail-closed mode under multiplexing - fail-direction-follows-deployment-mode gains its second door; or a released CHANGELOG records the reclaim-size gate for micro-compaction"
---

# hermes-agent (research-model release; a peer of the fleet's agent runtime) - round 2

**Class read at Phase 2 (Opus worker, confirmed by the director):** research-model
release, not vendor repository - there is no hosted engine to reverse-engineer from a
client; the whole runtime is present and every documentary claim was checkable against
code in-run. Expected yield for the class is high and the run met it. **The README
contributed zero entries.** The fetch budget did not bind: the director spent 0, the forge
worker 2 (context-variable propagation and module-cache primaries).

**Round-2 declared focus, applied:** the routing count was stated per system (six systems,
one at three NONE with no home, two at three NONE with an existing home, one at two, two
at zero); technique-grain directions blocked by grain: 0 (the peer comparison made the
grain question moot for personas). **Newest scorecard focus re-read inside the ledger
lock:** yes.

**Who wrote what.** The front half (sweep, design record with the golden path opened per
`corpus:` line, per-system routing, candidates, seven promoting questions executed, the
spec draft with placement verified against the taxonomy) - one Opus worker, 235k tokens.
The subject - one Opus forge worker. Four technique-grain landings - three Opus workers in
parallel with disjoint write sets. The personas peer comparison - one Opus worker. The
director (Fable) claimed, spot-checked three tree anchors verbatim, re-ran the concept map
uncapped, reviewed every diff (gate, purity, `use_when`, taxonomy order, one cited line per
subject), applied the two golden-path follow-ups and the cross-subject correction the
workers could not write, wrote the task row, the pof proposal, the notes and the ledgers.
**Nothing the workers produced had to be redone.** The companion file
[`2026-09-02-hermes-agent.design-read.md`](2026-09-02-hermes-agent.design-read.md) is the
front half verbatim (904 lines): the full design record with evidence, the claim rows, the
promoting questions, the leads, the untriaged table, the reusable-engineering list and the
fleet judgments.

## Design record (Phase 2d) - summary; the evidence is in the companion file

| system | entries | NONE | landed as |
| --- | --- | --- | --- |
| B profile isolation in one process | B1 task-local secret scope with mode-dependent fail direction · B2 plugin manager keyed on home, evicting submodules · B3 store binds no handle at construction · B4 adapter owner stamped before routing | 4, no home | **subject `tenant-scoped-agent-runtime`** (6 techniques; `orchestration`, because `runtime-and-io` reached its cap this morning) |
| C extension host | C1 observer vs mutator surfaces · C2 rewrite before the gate, wrap exactly once · C3 timeout coverage as an allowlist with reasons; no dead hook names | 3, home `agent-runtime-assembly` | 3 techniques there (+ F1 below); correction into `advisory-guard-fail-mode` |
| A session state and compaction | A1 amortised micro-compaction · A2 user turns never compacted · A3 corruption class decides degrade-or-quarantine · A4 crash-resume escalation | 3 (A4 partial → promoted) | `amortized-compaction-cadence` (A1+A2 folded, argued) in prompt-assembly; `corruption-class-response` in embedded-db; amendment in `stuck-loop-detection` |
| F tools and capability surface | F1 capability is a property of the session · F2 deferred invalidation of prompt-state mutations | 2 | `session-scoped-capability` (agent-runtime-assembly); `deferred-interface-invalidation` (prompt-assembly) |
| D relay / connector | D1 the connector is the sole crypto boundary · D2 ship primitives with the consumer's obligations written | 0 | boundary correction in `webhook-ingestion` (a discriminator beside the standing rule); D2 untriaged |
| E cron | E1 NAS-mediated fires, reconcile on events not timers | 0 | catch (`job-coordination`, `adaptive-cadence`) |

## Landed (16)

- **Subject** `llm-agent/orchestration/tenant-scoped-agent-runtime`: `task-local-tenant-scope`,
  `fail-direction-follows-deployment-mode`, `tenant-keyed-cache-evicts-loaded-code`
  (renamed from the spec, argued), `resolve-handles-at-call-time`,
  `stamp-ownership-before-the-router`, `written-inventory-of-what-stays-global`; application
  `python--task-local-tenant-scope`. Spec
  [`docs/subject-proposal-tenant-scoped-agent-runtime.md`](../../docs/subject-proposal-tenant-scoped-agent-runtime.md)
  (EXECUTED).
- **agent-runtime-assembly** +4: `observer-and-mutator-surfaces`, `rewrite-before-the-gate`,
  `honest-hook-registry`, `session-scoped-capability`; application
  `python--rewrite-before-the-gate`; golden path intro and roster paragraph updated.
- **prompt-assembly** +2: `amortized-compaction-cadence`, `deferred-interface-invalidation`;
  application `python--amortized-compaction-cadence`.
- **embedded-db** +1: `corruption-class-response`; application `python--corruption-class-response`.
- **Amendments** (3): `stuck-loop-detection` § "The interruption that leaves no signature";
  `webhook-ingestion` relay clause gains its discriminator (who can hold the secret, and what
  distributing it would cost); `advisory-guard-fail-mode` "bound every handler" gains the
  safe-direction predicate.

Director review per subject: gate green corpus-wide; purity grep empty (one trap recorded:
a company name is a substring of "asynchronous"); `use_when` on every technique; taxonomy
slug appended last; one cited line opened per subject and read verbatim.

## Applied (Phase 7.5) and shipped (Phase 8)

| Landing | Where | Mode | Verdict | Note |
| --- | --- | --- | --- | --- |
| `stuck-loop-detection` amendment | source tree (clone) | **task** | better (2/2 escalation writes now report failure, from 0/2) | branch `intake/escalation-arms-visibly`, commit `0a57be2`, 1 file / 18 lines; compile-verified, suite not runnable in-run (collection error on the first gateway test file - a missing dependency). Exported as a patch beside [`the plan`](../handoffs/2026-09-02-hermes-agent-source-tree-task.md); clone deleted. |
| the other 15 | - | unapplied | - | no connected project serves several tenants from one agent process, runs an in-process plugin chain, or compacts a live transcript; return conditions per row in `librarian/applied.md`, and the seven-item backlog in the handoff plan |

Shipped: 1, with its predicate - a commit on a branch of the source clone, exported as a patch.

## Directions (Phase 7.6) - the peer-comparison shape

The operator, mid-run: hermes is very similar to personas; expect dozens of comparison
points, and often personas has the superior choice. So the direction pass for personas
became a **peer comparison study** rather than a three-proposal cap:
`personas/.ai/directions/2026-09-02-hermes-agent-comparison.md` (committed `f449d7061`) -
**76 points** across eleven areas, each with file:line on both sides and a closed verdict:
adopt 9 · adapt 20 · **keep ours 39** · different forces 8. Governing asymmetry stated up
front: the peer *is* the LLM client, personas is not, so every point about the message
array, prefix cache or turn counter is `different forces`. Strongest "keep ours": the
golden-path census (204 ratcheting rules that fail on a rise, a silent drop, and a rule
matching zero files) - the peer's own top RFC verdict is a census rule it is about to build
as a bespoke script. Ten tests to initiate, features ranked, the inverse list.
Three proposals in the schema: `runner-extension-surface` (agent-runtime-assembly),
`restart-class-recovery` (session-continuation), `store-damage-policy` (embedded-db).
Plus one for **pof**: `2026-09-02-agent-runtime-assembly.md` (committed `9aa31407`) - the
session-sourced capability surface for its MCP server, whose harness mode today keys on an
env var. All four wait for a ledger row; none is built.

## Already covered (9), leads (7), untriaged (10)

In the companion file §8, verified by reading with the technique named. Leads worth
naming here: the agent-to-trainer shared-metrics contract (return: an observability lane
on the producer side); the billing lifecycle taxonomy (return: plan-entitlements deepens or
a project ships billing); the kanban coordination vocabulary (return: fleet-orchestration or
hitl-approval deepens). Untriaged of note: delegation as capability subtraction with depth
and concurrency caps; escape hatches deliberately unobservable by plugins; plugin durable
state with a quota whose rejection leaves the previous file intact.

## Reusable engineering seen

Companion §9: per-file process isolation as the test primitive (replaced a hand-maintained
reset fixture); a subprocess-surviving isolation marker; capture the real root before
sandboxing it; a content-free telemetry line per pass with a reader that turns a log into
an answer; a config surface that dials a cost rather than toggling a feature; and the
comparative source spike as a deliverable with a **"Verified absences" section** - the one
our own source notes should carry by name.

## Round-2 method notes

In LESSONS under 2.1.1. Short form: the method shielded the model - Opus produced every
artifact the skill prescribes and the director's review found nothing to redo; per-system
routing splits a repository correctly and the technique-grain clusters need their own
workers; the direction pass has a third shape (peer source → comparison study, not a cap);
`verified_against` and the purity substring trap belong in the forge brief, not in every
dispatch.
