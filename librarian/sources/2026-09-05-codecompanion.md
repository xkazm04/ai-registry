---
source: github
kind: practitioner build-walkthrough in repository form, design-deep in one subsystem (an editor-resident chat client over stateless endpoints and stateful agent protocols)
url: https://github.com/olimorris/codecompanion.nvim
title: codecompanion.nvim — AI coding, editor-resident chat, tools, context management
author: the plugin's maintainer (single first-party author across docs, code and tests)
date: 2026-09-05
words: 973 landing / 47,998 in-tree docs (doc/) + 16,159 root documents; 455 source files swept for the focus areas
extracted: 15
accepted: 4
declined: 0
leads: 1
already_covered: 7
untriaged: 4
dispatched: 0
applied: 3
shipped: 0
run_id: intake-codecompanion-20260905
siblings: 0
rescan_when: the client restores a client-side editing lane under provider-managed compaction (the intent doc/architecture.md still states lands in context_management/init.lua's gate), or a reactive compact-on-refusal path appears in the request or submit path; or 8 weeks elapse (2026-10-31)
---

# codecompanion.nvim — an editor chat client read for chatbot proficiency

Operator aim, stated in the invocation: **chatbot/voicebot proficiency: pipeline,
speed, resilience, db/memory design.** That framing scoped the sweep to four
subsystems (context management, the turn pipeline and its cancellation, the
attachment watchers, the memory and rules lanes) and left the rest of a large
plugin unread on purpose. Nothing in the tree is voice-specific; the voicebot half
of the aim was served by where the findings were applied (a voice-intake seam and a
companion with speech in and out), not by the source.

**Class and expected yield, said before the triage table.** A practitioner
build-walkthrough in repository form, design-deep in one subsystem. The class
predicts the README is the least reliable surface and the operating documents and
tests the most, and the ratio held: **973 words on the landing page against
~64,000 words of in-tree documents**, with the densest first-party material in
`doc/architecture.md` (846 words that argue two thresholds and a cycle unit) and in
test names that read as a failure taxonomy. Expected yield for the class: one or
two mechanisms, several catches against a mature subject. Delivered: two
techniques, two amendments, seven catches.

**Fetch budget: 0 of 3 spent.** Every accepted finding corroborated by code read in
the clone plus training-data convergence (the provider-side context-management
API and the stateful agent protocol are both derivable without the source), and
one by an independent instrument in a fleet tree.

**Board:** 0 siblings live at claim; none appeared. Subjects claimed at Phase 6,
re-checked clear before the first write; `index` lock taken for the regeneration
only.

Commit `f73f40e9` (2026-09-05, plugin version 19.23.0). Version witness for the
source-tree applications: the CI matrix's lowest editor tag (`ci.yml:17`,
`v0.11.0`), also the installation floor. The clone had to be re-taken at a short
path with `tests/screenshots/` excluded: the fixture filenames blow past the
platform path limit under the scratch prefix.

## Declared focus (round 28), answered

1. **Run the seam search for every technique before writing "unapplied".** Run
   across ten checkouts for the four landings. Hits outside personas and kp were
   usage accounting (`input_tokens` in a tracker and a pricing crate), not window
   management; no fleet project carries a token-window trigger. The two amendments
   therefore applied as a simulation on kp's turn-capped voice thread, and the
   simulation came back `not-better` and improved the amendment. No row reads
   "unapplied".
2. **Say the decision count in the depth cell.** Done: `2T (2 NONE of 11)`.
3. **The registry-self experiment is reusable.** Not applicable to this source;
   the reusable instrument this run produced is the personas ledger replay
   (`t2_experiment.py`, kept in the application's body as its protocol).

## The design record, and the routing count

Grouped by system. `corpus:` names the subject whose golden path models the
decision's forces, or NONE with the nearest neighbour.

**System C — context management (client side)**

- **C1.** decision: two thresholds on one count, editing at 0.65 and compaction at
  0.85 of the window; editing checked second so a transcript past the upper mark
  is summarized. forces: editing is free and shape-preserving, compaction is a
  paid call with persistent errors. buys: fewer compactions. rejects: one
  threshold. where: `helpers/context.lua:83-104`, `context_management/init.lua:66-84`,
  `doc/architecture.md`. stage: end of turn, before `finish`. corpus: **partial**,
  `prompt-assembly/history-compaction` (one proactive fraction) and
  `elision-to-a-refetch-pointer` (the lane, no trigger) → amendment A1.
- **C2.** decision: elision ages by *cycle* (user turn plus the model's reply),
  keeping the newest three whole. forces: a tool loop cut in half. corpus: catch,
  elision's "prior units of work".
- **C3.** decision: skip a compaction whose pre-estimated reclaim is under 10,000
  tokens. corpus: catch, `amortized-compaction-cadence`'s reclaim-size gate.
- **C4.** decision: what survives compaction is decided by tag (system, rules
  kept; files/buffers/images to named placeholders; prior summary dropped). corpus:
  catch, `history-compaction` "nothing load-bearing only in the transcript" plus
  elision's classes. Structural fact recorded in the application: the dropped
  summary is still fed to the summarizer, so the second summary is a summary of a
  summary.
- **C5.** decision: the client's lanes are off when the provider manages the
  window (thresholds passed through, the provider's compaction block replayed
  verbatim) and off by adapter type for the stateful protocol. forces: double
  compaction (`#3283`); an opaque continuation block a client rewrite would orphan.
  buys: exclusive ownership. rejects: keeping client editing for wire savings (the
  doc's stated intent; the code declined it). where:
  `context_management/init.lua:11-25,50-59`, `adapters/shared.lua:102-117`,
  `adapters/http/anthropic.lua:125-131,331-335,376-416`. corpus: **NONE**; nearest
  `endpoint-sealed-continuation-metadata` (the block, not the ownership). HOME IF
  NEW: prompt-assembly → **T1 context-ownership-regimes**.
- **C7.** decision: the count anchors on the provider's last reported usage and
  estimates only the unsent delta. forces: the local estimator's error over a whole
  transcript. where: `context_management/init.lua:30-42`, `chat/init.lua:1537`.
  corpus: **partial**, `history-compaction`'s size invariant assumes a local count
  → amendment A2.

**System P — the turn pipeline**

- **P1.** decision: orphaned tool calls are closed with a synthesized result
  before every send, on stop, and before context management may run. corpus:
  catch, `agent-runtime-assembly/indeterminate-closure-on-interruption` and
  `history-compaction`'s resume invariant. Application written with the negative:
  the verdict lives in prose, no machine status; hazard latent.
- **P3.** decision: a failed, cancelled or rejected tool does not block the queue;
  cancel drains it with a per-tool cancelled handler. corpus: partial
  (`hitl-approval/resume-after-decision`). Untriaged.
- **P4.** decision: a message typed during a request is held and injected as a
  user message at the turn boundary. corpus: catch,
  `agent-runtime-assembly/additive-input-at-the-call-boundary`.

**System W — attachments**

- **W1.** decision: a watched buffer or file is shared once; each submit compares
  a change counter or mtime and appends a unified diff against the content last
  shared, or nothing; deletion is a message. forces: re-sending whole breaks the
  cache and makes the model diff; never re-sending is stale. where:
  `watchers.lua:17,36-45,93,194,206-248,257-280`, `chat/init.lua:1355`. corpus:
  **NONE**; nearest `continuation-prompts` (delta prompts for standing layers).
  HOME IF NEW: prompt-assembly → **T2 live-attachment-delta-resharing**.

**System M — memory and rules**

- **M1.** decision: memory is a model-written file tree under a fixed virtual
  root with whitelist mounts; its tool output is excluded from elision. corpus:
  catch (`agent-memory` outclasses it; elision's class-by-producer rule covers the
  exclusion).
- **M2.** decision: "memory" renamed to "rules"; rules are always-include files
  kept verbatim across compaction. corpus: catch, `agent-instruction-files` and
  `context-reset-redelivery`.

**System B — background side channel**

- **B1.** decision: side requests (title, summary, safety judge) run
  non-streaming on a separate adapter, errors silenced; the judge's every failure
  is "require approval". corpus: catch, `hitl-approval/unattended-mode` (the
  classifier inside the grant) and `oracle-before-gate`.

**Routing count.** Whole tree: 11 entries, **2 NONE** (C5, W1), both with HOME IF
NEW = prompt-assembly. Per system: C 1 NONE, W 1 NONE, P/M/B 0. No system at three;
no home-if-new shared by three. **XL not fired; stay in intake.** Both NONE
entries land as techniques in an existing subject.

## Triage table

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | design→technique | M | Who holds the transcript decides the compactor | prompt-assembly (endpoint-sealed-continuation-metadata) | new-technique | real gap | 2/0/2 | accept |
| 2 | K | design→technique | M | Re-share a live attachment as a diff, or not at all | prompt-assembly (continuation-prompts) | new-technique | real gap | 3/0/2 (+1 convergence: personas built the hash witness independently) | accept |
| 3 | K | design→amendment | S | The lossless lane gets the lower trigger | history-compaction | corrects-claim | partial → promoted (elision read: no trigger stated) | 2/0/1 | accept |
| 4 | K | design→amendment | S | Anchor the count on the provider's last verdict | history-compaction | corrects-claim | partial → promoted (size invariant read: local count assumed) | 2/0/1 | accept |
| 5 | K | design | S | Reclaim-size gate before a summary | amortized-compaction-cadence | none | likely catch | — | already covered |
| 6 | K | design | S | Compaction keeps by tag | history-compaction, elision | none | likely catch | — | already covered |
| 7 | K | design | M | Close orphans before every send | indeterminate-closure-on-interruption | fills-stack-gap | likely catch | — | already covered; application written |
| 8 | K | design | S | Interjection at the turn boundary | additive-input-at-the-call-boundary | none | likely catch | — | already covered |
| 9 | K | design | S | Fail-closed judge inside the auto-approve grant | unattended-mode, oracle-before-gate | none | likely catch | — | already covered |
| 10 | K | design | S | Memory as a model-written file tree, excluded from elision | agent-memory, elision | none | likely catch | — | already covered |
| 11 | K | design | S | Rules are not memory | agent-instruction-files, context-reset-redelivery | none | likely catch | — | already covered |
| 12 | K | design | M | A failed tool does not block the queue; cancel drains it | hitl-approval/resume-after-decision | new-technique? | partial | 1/1/2 | untriaged |
| 13 | K | technique | M | Retries live in the transport, under a streaming request with no application deadline | retry-backoff, one-deadline-across-attempts | corrects-claim? | partial | 1/2/2 | untriaged |
| 14 | K | amendment | S | The second summary is a summary of a summary | history-compaction, tiered-history-projection | corrects-claim? | partial | 1/1/1 | untriaged (fact recorded in the application) |
| 15 | K | technique | S | RPC wait: coroutine when available, 10 ms poll with a 20 s ceiling otherwise | — | none | thin | 0/2/1 | untriaged |

`auto=4/4/0`, `fp=0` (no accepted row died at Phase 6). Altitude on every accepted
row: technique (1, 2) and technique-level boundary (3, 4); nothing higher was
earned, and the two techniques' shared root (ownership decides which lanes run;
what enters the record versus what leaves it) is a doctrine-level pair the golden
path now states in its technique list rather than a law.

## Accepted (4)

- **context-ownership-regimes** (technique, prompt-assembly). Three regimes by who
  holds the transcript between turns; both client lanes off outside the
  client-held stateless regime; thresholds passed through; the provider's block
  replayed verbatim; the switch per adapter and per model at request time.
  **Source contradicts itself and the code wins:** `doc/architecture.md` says
  client editing keeps running under server-side compaction; the gate at HEAD
  disables both lanes and the changelog carries the fix (`#3283`). The technique
  records the doc's intent as the wire-cost trade the exclusivity gave up.
- **live-attachment-delta-resharing** (technique, prompt-assembly). Share once
  with a witness; diff against the last-shared content when it moves, nothing
  when it does not; deletion as a message; the boundary where the base is a
  rebuilt prefix. Measured against personas: 86% of composed bytes unchanged turn
  over turn.
- **history-compaction amendment A1**: the lossless lane's own lower trigger,
  cycle aging, the reclaim gate, and (from the kp simulation) the precondition
  that the lane exists only where the transcript carries re-fetchable bulk.
- **history-compaction amendment A2**: anchor on the provider's last reported
  count; estimate only the unsent delta; the anchor travels on the message and is
  lost with it.

## Already covered (7)

Rows 5 to 11. The best catch is row 9: the tree's safety judge is the classifier
`unattended-mode` describes, and its every failure path answers "require
approval", which is the fail-closed direction that technique argues for; nothing to
add. Row 7 is a catch that produced an application with a negative structural
fact, which is the shape the method values most.

## Untriaged (4) — extracted, reached the table, nobody verified these

- **Row 12**, the queue that does not block on a failed tool, with anchors
  `tools/orchestrator.lua:335-345,506-546`, changelog `#1852`.
- **Row 13**, `http.lua:130-142` (`--retry 3 --retry-delay 1 --connect-timeout 10`,
  no application-level deadline on the streaming path; `send_sync` alone carries
  120 s). The technique `one-deadline-across-attempts` would call this a number
  nobody chose; nobody verified whether a transport retry under `--no-buffer`
  replays a partial body into the stream reader.
- **Row 14**, `compaction.lua:208-249` versus `:127,148,174`.
- **Row 15**, `acp/init.lua:31-34,470-530`.

## Applied (3)

| Technique | Project | Mode | Verdict | Where |
| --- | --- | --- | --- | --- |
| live-attachment-delta-resharing | personas | experiment (ab-paired) | **better** | `rust--live-attachment-delta-resharing.md`; 65 recorded turn pairs, A 11.7M chars vs B 1.66M (14.2%); next change filed with its measurable |
| context-ownership-regimes | personas | simulation (3 real cases) | unmeasurable | `rust--context-ownership-regimes.md`; instrument named: a stateless endpoint path |
| history-compaction (A1, A2) | kp | simulation (3 real cases) | **not-better** | `node--history-compaction.md`; improved A1's precondition |

Ship: 0 project code commits. The `better` row's change is a few lines but its
proof needs live turns, so it is filed as the project's next change with the
number that decides it rather than committed on a replay. Two project ledger
commits (personas, kp), each with a pathspec.

## Directions not proposed

`build-fleet-map` after regeneration: prompt-assembly and agent-runtime-assembly
have **no absent projects** (every fleet project carries a context for both), so
the direction pass had no candidates. `directions=0/0`; the 7.7 gate had nothing
to show.

## Leads (1)

- The doc/code divergence on client editing under provider-managed compaction.
  Return condition: the `rescan_when` clause above. If the client restores the
  editing lane, T1's wire-cost paragraph gains a measured second arm.

## Reusable engineering noted, not landed

- `utils/tokens.lua`: a dependency-free byte-class token estimator (six alpha
  characters per token, three bytes otherwise, whitespace free). The registry has
  no estimator of its own in `scripts/`; a port would be under 80 lines.
- The test naming discipline in `AGENTS.md` (pairs that read as pairs: *DOES NOT
  truncate a tool INSIDE the limit* / *truncates a tool OUTSIDE the limit*) is the
  failure-taxonomy-as-tests shape this method already prefers.
