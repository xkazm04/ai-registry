---
source: https://cline.ghost.io/cline-desktop-an-open-source-app-for-open-weight-models
kind: web
url: https://cline.ghost.io/cline-desktop-an-open-source-app-for-open-weight-models
title: "Cline Desktop: An open-source app for open-weight models"
author: Cline (first-party vendor blog)
words: 1170 post / implementation read at github.com/cline/cline 6e8bea1c (session-import service, sanitizer, three adapters' shape, import-history compaction policy, runtime host wiring, desktop notice + client helper, 2 test files)
extracted: 14
accepted: 1
declined: 0
leads: 3
already_covered: 3
untriaged: 7
dispatched: 0
applied: 1
shipped: 0
run_id: intake-cline-desktop
siblings: 4
rescan_when: "the SDK's imported-history fold stops falling back silently to raw replay, or gains a test on summary content (grep createImportedHistoryCompactionPrepareTurn); or a fourth import adapter lands; or 10 weeks elapse (2026-11-24)"
---

# Cline Desktop announcement - intake 2026-09-15

A source originates a finding; it never authorizes one.

**Class:** vendor release announcement. The desktop app is open source, so the
class rule "the fetch is the extraction" became a clone. The previous scorecard
focus said to clone whatever implements a release and read the part the demo cut
away, and that is what this run did.
**Expected yield said before the table:** catches (parallel sessions, model per
phase, plugin distribution are mature in the corpus), one currency number (a
benchmark table relayed from the vendor's own earlier post), leads. One
mechanism was possible: the post's "import a conversation from another agent and
keep going" feature says nothing about how the history is carried.
**Siblings live at claim:** 4 (intake-react-19-3 on ui-surfaces/motion,
intake-ragas, intake-awesome-llm-apps-0915, intake-aecoach on
engineering-assessment). None held prompt-assembly. intake-aecoach mines a tool
that parses six harnesses' local session logs, which is a neighbouring but
different question (measuring habits, not continuing work).
**Fetches:** 0 of 3 web fetches. One blobless shallow clone plus a sparse
checkout of the SDK core and the desktop sidecar/webview.

## Design record (the implementation behind the announced feature)

```
decision:   store a foreign agent's session verbatim in native message shape, and fold the whole
            foreign span into a summary on the first resumed turn, before the model request
forces:     the foreign turns keep the source harness's tool names and input schemas, which a
            continuing model may try to call
buys:       a continuation that works in the receiving roster's idiom; a lossless record
rejects:    translating tool calls ("which Cline does not translate", imported-session-notice.tsx)
where:      sdk/packages/core/src/extensions/context/compaction.ts (createImportedHistoryCompactionPrepareTurn),
            runtime/host/local-runtime-host.ts:682-695
stage:      history composition at resume
corpus:     NONE. Nearest is prompt-assembly/endpoint-sealed-continuation-metadata, which models the
            provider-enforced seal and not a harness vocabulary that nothing rejects

decision:   repair provider validity at persist: strip signatures and redacted reasoning, cull
            orphan results, placeholder the unanswered calls, consolidate result spans
where:      session-import/sanitize.ts
corpus:     catch. endpoint-sealed-continuation-metadata (the seal) + history-compaction's resume
            invariant (the placeholder). One divergence: strips in the record, not at composition

decision:   idempotent import keyed tool:sourceId, in-flight coalescing, row born completed,
            importedFrom marker written last, rollback on failure
where:      session-import/service.ts
corpus:     not verified (no map run on the idempotency concept); recorded in the source-tree application

decision:   resume target (provider+model, both or neither) separate from source provenance
where:      session-import/types.ts SessionImportOptions, service.ts persistConverted
corpus:     likely model-routing/model-identity; not opened
```

**Routing count:** 1 NONE, 1 unverified, 2 catches. No home-if-new shared by three
entries. Below the forge threshold, so the run stayed in intake, and the one NONE
became a technique.

## Triage (v2.5 score; upper-layer rows scored, currency and leads under the corroboration table)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique (design) | M | Fold a foreign harness's history before continuing | prompt-assembly/endpoint-sealed-continuation-metadata | new-technique | real gap | 3/0/2 | **accept, landed** |
| 2 | K | currency | S | Same model, different harness: 52.8-82% on one benchmark | model-routing/applications/process--capability-floors | none | likely catch | table | **already covered** (opened: "The harness is a first-class variable", 14/16 vs 1/16 same model) |
| 3 | K | correction | S | Strip sealed reasoning metadata from imported turns | endpoint-sealed-continuation-metadata | none | likely catch | 1/2/1 | **already covered** (opened; divergence recorded in the node application) |
| 4 | K | correction | S | Answer an unanswered imported call with its own spelling | history-compaction ("The resume invariant") | none | likely catch | 1/2/1 | **already covered** (opened) |
| 5 | K | technique | M | Idempotent import with the claim marker written last | not mapped | ? | partial | 2/2/2 | untriaged |
| 6 | K | correction | S | Resume target and source provenance as separate fields | model-routing/model-identity | ? | likely catch | 1/2/1 | untriaged |
| 7 | K | correction | S | A different model for planning and acting | model-routing (routing-policy, turn-classification) | none | likely catch | 1/2/1 | untriaged |
| 8 | K | lead | S | Recurring agent jobs pinned to prompt, workspace, provider, model | no owner found in map | ? | thin | table | untriaged |
| 9 | K | lead | S | One marketplace for plugins, tool servers and skills | prompt-assembly/contributed-document-admission | ? | thin | table | untriaged |
| 10 | X | lead | M | Quota exhaustion as the trigger to continue on another engine | agent-cli-transport/subscription-auth-selection; llm-observability entitlement-exhaustion | ? | partial | table | **lead** |
| 11 | K | correction | S | Review one model's implementation with another model | fleet-orchestration/heterogeneous-model-panels | none | likely catch | 1/2/1 | untriaged |
| 12 | K | lead | S | Harness rebuild shipped behind an A/B rollout, 10x fewer failures | eval-harness; adoption-measurement | ? | thin | table | **lead** |
| 13 | K | currency | S | Open-weight scores on the benchmark (Kimi K3 82.02, GLM 5.3 Flash 64.0, DeepSeek V4 Flash 60.67 / Pro 59.6) | none owns an open-weight table | none | thin | table | **lead** |
| 14 | K | correction | S | A workspace to track many delegated agents | fleet-orchestration/session-registry | none | likely catch | 1/2/1 | untriaged |

auto = 1 accepted / 10 rejected (7 untriaged, 3 verified catches) / 0 escalated; fp = 0.
Rows 2-4 are catches established by opening the owning file. Rows 5-9, 11 and 14
were never opened and carry no judgment.

**Row 1, why a technique and not an amendment to endpoint-sealed-continuation-metadata.**
The file's own rules stay true (provider seal, segment unit, strip at composition).
The finding is a second mechanism with a different failure (imitation, not
rejection) and a different remedy (fold, not strip). Corroboration: code read in
two independent trees (Cline folds for continuation, Personas projects to text
for awareness), plus a paired local experiment run in this session.

## The experiment (Phase 7.5, before landing)

The fixture is a three-call repair session under foreign tool names (read, shell,
edit), a continuation prompt, and a native roster with different names.
qwen3.8:27b and gemma4:12b ran locally, 10 seeds per arm, temperature 0.8, first
response only.

| Arm | qwen3.8:27b foreign calls | gemma4:12b |
|---|---|---|
| A raw replay of foreign turns | **10/10** (0 native) | 0/10 |
| C same turns, roster names (control) | 0/10 | 0/10 |
| B folded summary | 0/10 | 0/10 |
| D text-only awareness block (Personas' render shape) | 0/10 | not run |

The instrument was asserted with a one-seed smoke run (arm A produced a foreign
`Edit` call) before the full run. The script is not banked, because it is a
scratch fixture and the technique table carries the numbers.

## Applied

- **personas**, `experiment`/`better`, seam `engine/src/cli_session_awareness/transcript.rs:140`
  (text-only reader) and `render.rs:35`. Chosen to falsify the awareness branch.
  It held (arm D 0/10). No code change, since the tree already sits on the
  winning arm. Row committed `c9e9fd8bd` on master, not pushed.

## Leads

- **Row 10, continuing a quota-blocked task on another engine.** Personas pauses
  engine admission on a session limit and resumes on the same engine. The
  announcement's headline use is the opposite. Return condition: a fleet project
  grows cross-engine continuation, or the operator asks for it. The fold is
  then the prerequisite.
- **Row 12, the harness-upgrade rollout.** The linked post claims a safe A/B
  rollout of a rebuilt harness across its whole user base, with failures
  reduced 10x. That is a release walkthrough, the class that states failure
  modes. Return condition: a run mines that post for its rollout protocol and
  its denominator.
- **Row 13, open-weight benchmark numbers.** These are relayed from the vendor's
  own September 2 post and compare the vendor's harness against two others.
  Return condition: a routing application cites open-weight scores on that
  benchmark. Bind the currency row to it then, per the survey run's focus.

## Directions not proposed

- **personas, cross-engine continuation on quota exhaustion.** The scope admits
  the forces ("observe runs ... and tune routing from evidence", heterogeneous
  wrapped CLIs, a quota governor already present). It was not written because
  the retry path (`healing_retry.rs`) was not read, and it may already restart
  failed executions on another engine from a fresh prompt, which changes what
  the proposal would be. Return: read that path, then propose.
