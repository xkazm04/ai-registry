---
source: github:OpenBMB/StaffDeck
kind: repository
url: https://github.com/OpenBMB/StaffDeck
title: A declared door is right for capacity and wrong for a right
author: OpenBMB / ModelBest, THUNLP and partners
words: 9358
extracted: 22
accepted: 2
declined: 0
leads: 3
already_covered: 10
untriaged: 7
dispatched: 0
applied: 2
shipped: 0
run_id: in-sd-0929
siblings: 1
fetches: 1
commit: 7adc7c84 (single-commit history)
rescan_when: a second tagged release after v0.5.0 lands with a change to its human-handoff or evolution modules; or 12 weeks elapse (2026-12-22)
---

# A declared door is right for capacity and wrong for a right

**Class:** vendor-style repository, a design-deep one (backend + console, 817 files, a
FastAPI service, a state-machine procedure runtime, a multi-agent team feature). The
operator asked a specific question: does it hold concepts worth adopting for the
human-resources domain and for a hiring workspace that manages AI agents. Expected
yield per the class: catches from the runtime, one or two contrast findings, and a
fact-check of the product's HR vocabulary. The README was read last.

## What was swept

The clone was read in yield order, by three read-only readers over three slices (runtime
and teams; procedural skills, knowledge retrieval and memory; governance), each returning
design-record entries with `path:line "quote"` anchors, and the director opened the anchors
the two landings rest on and ran `scripts/check-anchors.mjs` over both applications
(8 of 8 and 5 of 5 held). In-tree documents: 9,358 words across the design records, the
prompts and the READMEs, against 2,207 for the landing page. Tests were read for
failure-named cases; nothing was executed in the source tree.

## Fact-check notice (kept out of the findings, per the standing rule)

The README says the product manages digital employees "with positions, employee IDs,
capability profiles and work records". Read against the code, those are UI labels: the
position is a free-text field rendered into a prompt, the only identifier is the generated
agent id, no capability-profile entity exists (the nearest is a scope flag plus resource
bindings), and the work record is a count of replies plus an assignment timeline. "Human
takeover" is an escalation at a workflow step and there is no mode where a person joins a
live conversation. The multi-agent team design record claims a zero-health elimination that
cannot occur at the default of three rounds, an optimistic-lock column that is never
compared, and a blackboard query tool that does not exist. For the HR question the result
is unambiguous: **the employee metaphor carries nothing to adopt.** The kp hired-agent
lifecycle (approval window, probation review with a required decision, retire, KPI rollups)
is more developed than the source's.

## Design record (one system, 22 entries; the strongest, condensed)

| # | decision | corpus | home |
| --- | --- | --- | --- |
| 1 | every external side effect gets an intent row; an allowlist of provably-not-sent failures releases it; any other failure is `outcome_unknown` and blocks retry | modelled (`unknown-is-not-a-value`, `in-flight-is-a-position`, `error-classification-for-retry`) | - |
| 2 | each execution layer holds an owner-fenced lease; every terminal write is conditional on it | modelled (`fence-inside-write-transaction`) | - |
| 3 | recovery keyed to who initiated the work: a human turn is terminalized and the user asked to resend, a machine event is re-run | partial (`indeterminate-closure-on-interruption` states the human case, not the initiator split) | lead |
| 4 | a planner owns intent and order; an executor gets a compiled requirement | modelled | - |
| 5 | tool manifest frozen per task, disclosed in stages, authorization revalidated at call time | modelled (`catalog-projection-modes`, `activation-is-a-separate-mutation`) | - |
| **6** | **human handoff opens only at a declared workflow node; the answerer is resolved from a fixed chain of authenticated internal identities before the ask; a chat reply is honoured only from the delivered notice's recipient** | **NONE** | hitl-approval |
| 7 | each model adjudicator has its own fail-safe after one repair turn | partial | untriaged |
| 8 | one `escalated` sink doubles as the waiting state | the tree's own cost | - |
| 9 | members propose shared-memory writes, only the reviewer's verdict commits | modelled (`memory-governance`, `pending-beliefs-live-apart`) | - |
| 10 | the model chooses among edges the code enumerates | modelled (`deterministic-vs-model-nodes`) | - |
| 11 | a real submission needs the current node's grant and replays the previewed body by digest; trusted code injects the confirm flag and idempotency key | modelled (`resume-after-decision`: "byte for byte") | - |
| 12 | completion refused until the node's required capability succeeded; a failure verdict needs an attempt | modelled (`completion-claim-verification`, `unattempted-is-not-failed`) | - |
| 13 | feedback is evidence: proposal on a private branch, human approve, snapshot, rollback; downvotes bucketed by failing layer | modelled except the layer taxonomy | lead |
| 14 | a generated procedure is untrusted; URLs kept only if verbatim in the source; reviewers attribute a defect to the input or the generation | partial | lead |
| 15-22 | subflow inlining, structure-card retrieval, keyed overwrite memory, persist-before-ack, credential intersection, role read from the database not the token, own-only session lists with 404, team bidding and blackboard | modelled or product features | - |

**Routing count (Phase 2d), written before deciding.** Entries with no home: one clear (6) and
two partial (3, 14), across one system. Under three, so the run stayed in intake; the
`HOME IF NEW` clause did not fire (no three entries share one home). Handoff to `/forge`: no.

## Triage (v2.5 score; siblings live: 1, holding no subject in these bundles)

| # | Row | Shape | Prior art | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- |
| 6 | declared handoff door + resolved answerer + reply bound to the delivered notice | technique | hitl-approval (corollary 1 states the principle; the mechanism is absent) | 3/0/2 | **accept** |
| 6b | the contrast: a candidate's request for human review is a universal door, delivered at the decision, recorded against the sealed decision, routed by sealed actor | technique | bulk-adverse-action-governance (the queue exists, its request-side entrance does not) | 3/1/2 | **accept** |
| 11 | approval binds to the previewed artifact | technique | already says it | - | already covered (verified by opening `resume-after-decision`; the first probe for it returned zero and was wrong) |
| 1, 2, 4, 5, 9, 10, 12, 16, 17 | runtime, memory and retrieval decisions | technique | modelled | - | already covered |
| 3 | recovery keyed to the initiator | technique | partial | 2/1/2 | lead (see below) |
| 13b | feedback bucketed by the layer that failed | technique | partial | 2/1/2 | lead |
| 14 | generated procedure treated as untrusted input | technique | partial | 2/1/2 | lead |
| 7, 8, 15, 18, 19, 20, 21 | per-adjudicator fail-safes; escalated as one sink; subflow inlining; persist-then-ack; credential intersection; 404 over 403; team bidding | - | unverified | - | untriaged (nobody verified these) |

Both accepted rows were scored after a promotion read: for row 6 the director opened the
five handoff files in the source tree and confirmed the reader's claims, including two the
reader had not flagged as failures (a null assignee is answerable by any tenant user on the
web path, and the answered check is a read-then-write).

## The landings

1. **`handoff-is-a-declared-door`** (hitl-approval technique) with two applications:
   `python--` against the source tree, and `next--` against the hiring workspace.
   The cross-bundle discriminator, stated in prose on each side and not linked: a declared
   door is correct when the human is a resource the workflow owns and wrong when the human
   is a right of the person being served. The hitl-approval golden path gains the technique
   and a pointer at its first corollary.
2. **`contest-door-at-the-point-of-decision`** (bulk-adverse-action-governance technique)
   with one application, `node--`, against the hiring workspace. Authorised by the
   automated-decision guidance itself, which was fetched as a PDF and read as extracted text
   rather than through a summary (the three quoted phrases were checked against the text).
   The bundle's golden path gains one paragraph and the technique list.

**What the seam changed.** The hiring workspace already carried the finding as an open
compliance row (an unbacked promise to candidates). What it did not carry was the routing
distinction: the reconsider queue excludes human decisions by design, so a request recorded
as the row describes would have been silently dropped for exactly the decisions a person
made. That is in the technique and in the plan.

## The applied rows

- `handoff-is-a-declared-door` x hiring workspace, mode `experiment`, `unmeasurable`. Arm A
  measured: of 56 (status, push-event) pairs on the public report route, 8 reach `active`,
  six from statuses where nobody had decided, and the payload has no decider field. Arm B
  needs the sibling application to send one. Instrument named: the probe, re-run.
- `contest-door-at-the-point-of-decision` x hiring workspace, mode `task`, `unmeasurable`.
  Plan committed in the project's task folder; no code step taken (an owner's compliance row
  with a sequencing decision, a schema change, and local main carrying unpushed sibling work).

## Leads (return conditions)

- **Recovery keyed to who initiated the work** (3): return when a second source or a fleet
  tree shows the split, or when `indeterminate-closure-on-interruption` is next opened.
- **Feedback bucketed by the failing layer** (13b): return when a project has a feedback
  surface over an agent procedure; the source's own list is model, trigger, slot,
  transition, capability, knowledge, tool, plus an honest unclear.
- **A generated procedure as untrusted input** (14): return on a second source that
  attributes a defect to the input or to the generator separately.

## Untriaged (nobody verified these; anchors kept)

Rows 7, 8, 15, 18, 19, 20, 21 above, with the reader's anchors recorded in the design table.
Row 8 in particular is the tree's own admitted cost rather than a design to copy.

## Directions not proposed

No new capability was proposed. The team-bidding and shared-blackboard features are the
material a fleet-of-agents direction would draw on, and the hiring workspace's scope
declares it does not do agent fleets and lists orchestration as out of scope, so they were
classified out and not written up. A peer comparison against the fleet's own agent-runtime
project was not requested and was not run.

## Environment facts

The recruiting bundle gate was already red on a sibling's file when the run started (a
misnamed application), unchanged by this run. The recruiting index was stale before the run.
