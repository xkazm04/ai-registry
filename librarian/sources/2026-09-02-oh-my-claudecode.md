---
source: github:Yeachan-Heo/oh-my-claudecode
kind: practitioner build-walkthrough, repository form (a community-maintained agent harness for one coding CLI; single maintainer plus contributors; the README is the tour, the ADRs, design documents, skills and the receipts directory are the operating half)
url: https://github.com/Yeachan-Heo/oh-my-claudecode
commit: e9e8fa3847ce0b3529b84d895e841988c7308f3d
title: "oh-my-claudecode - Teams-first multi-agent orchestration for Claude Code"
author: Yeachan-Heo and contributors
words: 4573 landing / ~230,000 in-tree markdown (docs 66k, skills 65k, seminar 28k, agents 22k, benchmarks 16k, shellmark 15k, src docs 15k); ~123,000 read across ~90 files by four sweep workers (design 32,490 in 27 files; prompts 41,100 in 28; history 28,300 full + 8,500 partial; measurement ~12,500)
extracted: 27
accepted: 11 (1 subject with 7 techniques + 3 source-tree applications; 3 amendments)
declined: 0
leads: 4
already_covered: 8
untriaged: 5
dispatched: 1 forge worker (session-continuation)
applied: 4 rows (1 experiment, 3 simulation) + 1 task row
shipped: 2 (kp 0307a014 main; ascent 2f029039 moonshot/wave-4; pathspec, not pushed)
run_id: intake-omc-0902
siblings: 2 at claim (deer-flow v2 re-run; OpenViking), no subject overlap; 4 by Phase 7 (two more entered agent-memory and agent-runtime-assembly, both read-only for this run)
rescan_when: "the source ships a benchmark result with a graded success predicate (the SWE-bench arm currently reports patch emission, not solves); or the alias-retirement receipts show a first retirement under the four-condition gate; or a second first-party harness publishes its hook fail-mode registry"
---

# oh-my-claudecode (2026-09-02)

## Phase 1 checks, said out loud

- Gates green, index current, source not in the ledger. Two live siblings at
  claim, neither in an llm-agent home this run named.
- **Standing foci read before triage.** (1) Re-scan conditions in the ledger
  rows: two carry one; neither fired. (2) Lead return conditions across the
  last ten notes: read; the nearest was deer-flow's "fail fast at startup when
  a mode needs a capability the backend lacks", which this source *does*
  implement (the headless-mode platform guard refuses at the boundary) - a
  catch on a lead, not a fire. (3) Changelog first: the top-level changelog is
  338 words of release notes for one minor; its one durable sentence ("a
  failing or unavailable gate is not represented as passing evidence") is the
  trigger for one amendment whose content came from the design documents -
  the fourth consecutive row where the changelog was index, not content.
  (4) The openbao focus - name the condition under which the technique would
  NOT hold before choosing the seam - was applied to the one experiment row
  (below). (5) The dora focus - when an experiment returns `better` and the
  change is a few lines, run the paired proof in the tree and ship - fired:
  two project commits.
- **Declared class and expected yield, before the table:** a practitioner
  harness in repository form. The tour half (README, feature docs, the
  seminar slides) yields proper nouns; the operating half (ADRs, `docs/design`,
  the skills' own failure-mode prose, the receipts) yields decisions. Expected:
  2-4 landings from the operating half if read as claims; a subject if read as
  design. It was read as design (v2) and yielded a subject.

## What was swept (clone, not ingest)

Cloned at `e9e8fa38`, 6,812 files. Five parallel read-only sweep workers, one
per surface: the design documents (three ADRs, eleven design documents, the
architecture and hook references, the shared mode and tier documents); the
operating prompts (14 skill files, 3 agent prompts, the verification-tier and
agent-tier documents, the root instruction files); the measurement surface
(two benchmark harnesses, the session-replay format, the research comparison,
16 receipts, 8 mission files, the audit); the failure record (compatibility,
migration, the issue documents, the alias-retirement module, the interop and
provider adapters, the seminar notes, 12 of 78 failure-named test files out of
722). **The fifth worker - the instrument sweep over `src/hooks` (the code
enforcing the rules the docs name) - failed on an API rate limit before
reading anything.** Its ground was partly covered by the design worker's read
of the hook reference and registry design, and the history worker's read of
the hook regression tests; the hook *source* (the delegation enforcer's shell
parser, the drift guard's grammar, the pre-compact checkpoint writer) was not
opened by this run, and the forge worker was pointed at it for the
applications. The README was read last, as an index.

## Design record (Phase 2d)

Nine entries; three read `corpus: NONE` and share one home.

1. **decision:** execution modes are state files under the harness's own
   state directory; a stop-time hook reads them and refuses to end the turn,
   with a two-hour staleness lease and an explicit cancel that deletes them.
   **forces:** the stop event is the only cross-turn point the harness owns;
   a stale file would hold every future session hostage. **buys:**
   persistence that survives the model's own judgment and a context reset.
   **rejects:** prompt-only persistence; making each mode its own hook; the
   team mode is kept off keyword auto-detection "to prevent infinite
   spawning" and detection is disabled inside workers. **where:**
   `docs/HOOKS.md:261-272,404-405,510-512`. **stage:** stop. **corpus:**
   NONE - fleet-orchestration owns the layer above a session; background-jobs'
   loop-supervision owns server timers; nothing owns one session's turn
   boundary.
2. **decision:** a pre-compaction hook writes a checkpoint (active modes,
   plan anchors, job handles, project memory); the post-compaction session
   start restores the newest matching one. **forces:** the summariser was
   observed dropping plan detail (issue #3730). **buys:** a survival
   guarantee independent of what the summariser kept. **rejects:** the
   summariser as carrier; the notepad alone. **where:**
   `docs/HOOKS.md:182-191,361-384`. **stage:** compaction. **corpus:**
   agent-instruction-files/context-reset-redelivery models the *instruction
   floor's* redelivery across the same boundary; it does not model the control
   loop's state. Partial - folded into the new subject as its own technique
   with that boundary stated.
3. **decision:** every hook carries a risk class from a closed set and its
   fail mode is derived from it; two of ~twenty entrypoints fail closed; the
   one stop-time blocking classifier is stateless with an exhaustively
   enumerated accept grammar, and ambiguity passes. **forces:** "a generic
   Stop hook cannot safely infer that the assistant is in the wrong branch
   ... without overblocking valid work". **buys:** guards that cannot
   deadlock the operator, with an auditable fail-closed set. **rejects:**
   heuristic or stateful blocking; a hand-maintained metadata table.
   **where:** `docs/HOOKS.md:244-259`,
   `docs/design/ISSUE-3707-HOOK-REGISTRY-SHADOW.md:21,31`. **stage:** stop
   and pre-tool-use. **corpus:** NONE - security/authorization's
   failure-direction says every degraded state resolves to refusal, and is
   right for a decision path whose fail-open interval is a disclosure; an
   advisory guard's fail-closed interval is a stuck operator. The
   discriminator is stated in the new technique.
4. **decision:** a named multi-stage run admits only four sequences; its
   shape is sealed by a content hash at selection; a stage advances exactly
   once on the adapter's exact completion signal in an authenticated record,
   under compare-before-write. **forces:** no marker proves a model call
   belongs to the active workflow; symlink-spoofed transcripts; config drift
   across a resume. **buys:** exactly-once transitions under concurrent stop
   invocations. **rejects:** a general workflow engine, in the ADR's own
   words. **where:** `docs/adr/03487-named-autopilot-stage-profiles.md:30-39,
   61-86,97-113`. **stage:** stage transition at stop. **corpus:**
   pipeline-dag pins an authored graph at run start; job-coordination owns
   claim protection. Partial - the provenance half is the new subject's.
5. **decision:** one continuation authority per session, conflicts resolved
   by an enumerated policy with no warn-and-continue; the host's goal
   evaluator's pass is a distinct status from complete. **forces:** two
   stop-time loops fight for one lifecycle point; the host judge reads only
   the conversation. **where:** `docs/shared/mode-selection-guide.md:56-80`,
   `docs/design/CLAUDE_CODE_GOAL_ADAPTER.md:36-52,76-85`. **stage:** loop
   activation, then verification. **corpus:** completion-claim-verification
   owns "status from a marker the runtime owns, never prose" (the second
   half). The first half is NONE.
6. **decision:** model tier is injected pre-dispatch from the callee's
   definition when absent, explicit always wins; verification depth is a pure
   function over change metadata with security paths forcing the top tier.
   **where:** `docs/DELEGATION-ENFORCER.md:20-66`,
   `docs/shared/verification-tiers.md:26-48`. **corpus:** model-routing
   (routing-policy, consumer-overrides) models the first half - catch. The
   second half is untriaged (below).
7. **decision:** control plane and data plane are separate stores joined by
   artifact descriptors with a 2 KB inline-vs-handle threshold and a
   retention class. **where:** `docs/ARCHITECTURE.md:461-497`,
   `src/interop/shared-state.ts:59`. **corpus:** fleet-orchestration
   (durable-fleet-state, result-harvest's declared drop point) - catch.
8. **decision:** per-worker worktrees with one leader-owned coordination
   root handed by environment variable; worker location persisted, never
   inferred; cleanup refuses on a dirty worktree. **where:**
   `docs/TEAM-WORKTREE-MODE.md:12-48`. **corpus:** fleet-orchestration
   (session-registry, substrate-reconciliation) plus concurrent-vcs'
   never-lose-work rules - catch.
9. **decision:** public surface collapsed through a registry and aliases;
   deletion gated on elapsed releases AND days AND usage share over two
   consecutive releases AND zero known critical consumers; a major version
   waives time, never a consumer; the closure verifier has a PENDING exit
   code and currently reports FAIL. **where:**
   `src/alias-retirement/policy.ts:4,36`, `verifier.ts:130`, `closure.ts:1`,
   `docs/design/ISSUE-3712-RELEASE-VERIFICATION.md:34-36,50-63`.
   **corpus:** release-pipeline/deprecation-by-version-arithmetic models the
   clock and only the clock. Partial - landed as an amendment (boundary case:
   a public *name* with consumers).

## Routing count and decision

**Three entries read NONE (1, 3, 5), and all three share one home:
`llm-agent/orchestration`.** The forge-handoff threshold is three; the XL
trigger is three design candidates with one home. The second applies and
collapses the first: one subject, one spec, one forge worker dispatched in
this session (not a bundle-wide scout wave), with entries 2 and 4 folded in as
techniques and the cancel-teardown and stuck-loop mechanisms from the prompt
sweep added as the sixth and seventh. Spec:
`librarian/handoffs/2026-09-02-oh-my-claudecode-session-continuation-spec.md`.
Placement verified against `taxonomy.json`: the category holds seven subjects
under a cap of ten; the entry was written before dispatch.

## Triage (unattended: `real gap` rows advanced; every `partial` row's promoting question executed)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | Outcome |
|---|---|---|---|---|---|---|---|---|
| D1 | K | design | XL | Continuation is state re-read at the turn boundary, with a lease | fleet-orchestration (layer above) | new-subject | real gap | subject: session-continuation / continuation-as-state |
| D3 | K | design | XL | Guards fail open by risk class; blocking classifiers are stateless with an enumerated grammar | authorization/failure-direction (inverted) | new-subject | real gap | technique: advisory-guard-fail-mode; **applied, experiment, better, shipped x2** |
| D5 | K | design | XL | One loop authority per session; the host judge's pass is not completion | completion-claim-verification (second half) | new-subject | real gap | technique: single-loop-authority |
| D2 | K | design | L | Ferry control state across compaction by hook, not by summariser | context-reset-redelivery | new-technique | partial -> promoted (the neighbour ferries the floor, not the loop) | technique: compaction-checkpoint |
| D4 | K | design | L | Sealed run descriptor; advance exactly once on authenticated evidence | pipeline-dag; job-coordination | new-technique | partial -> promoted (provenance of the advancing signal is unowned) | technique: sealed-stage-advance |
| P4 | K | technique | M | Cancel clears every guard it can set, primary first; deactivate is not a global cancel signal | subprocess-lifecycle | new-technique | real gap | technique: ordered-teardown |
| P9 | K | technique | M | Stop on repeated failure identity; two counters with asymmetric resets | circuit-breakers; coordination-failure-triage | new-technique | partial -> promoted (neither owns an agent repeating its own failure) | technique: stuck-loop-detection |
| D9 | K | amendment | M | A public name with consumers: the clock is necessary, not sufficient; a major version waives time, never a consumer | deprecation-by-version-arithmetic | corrects-claim | real gap | **amendment landed**; applied (simulation) |
| P3 | K | amendment | M | A refuted criterion leaves the active set only through an evidence-preserving amendment; malformed ledgers fail closed on read | hitl-approval/fixed-policy-amendable-plan | fills-stack-gap | partial -> promoted (the technique sends "success condition wrong" upward and has no record for the answer) | **amendment landed**; applied (simulation) |
| M6 | K | amendment | M | Evidence binds to the exact head; red stays red after merge; closure has a third state; the prose summary drifts flattering | quality-gates/advancement-evidence-fields | corrects-claim | real gap | **amendment landed**; applied (simulation) |
| P5 | K | technique | S | The context that produced the diff is disqualified from approving it | plan-review/fresh-posture-self-challenge; completion-claim-verification | none | likely catch | catch |
| P6 | K | technique | S | Hedge words in a completion claim trip automatic rejection | completion-claim-verification | none | likely catch | catch (its "claim with no receipt is a claim") |
| P16 | K | technique | S | Write a fixed-schema handoff at every stage boundary; rejected alternatives first | fleet-orchestration/brief-carries-the-session | none | likely catch | catch |
| P15 | K | technique | S | Pre-assign work when the store has no atomic claim; forbid nested spawning | fleet-orchestration/parallel-dispatch; job-coordination | none | likely catch | catch |
| H8 | K | technique | S | Author every normative clause once; provider differences are data | agent-instruction-files/single-source-topology | none | likely catch | catch (typed sections + digests are the neighbour's "bridge, never restatement") |
| H10 | K | technique | S | Derive the registry from the runtime config; assert zero drift in a test | docs-sync; prose-rule-drift | none | likely catch | catch |
| H12 | K | technique | S | Auto-approve flags differ per runtime and are one risk class | agent-cli-transport/permission-stance-enforcement | none | likely catch | catch |
| M9 | K | technique | S | Missing telemetry is insufficient, never zero; unpaired is inconclusive | count-carries-predicate; eval-harness | none | likely catch | catch |
| M2 | K | currency | S | The orchestrated arm emitted 0 of 5 patches at 18.6x the baseline's time; "completed" meant emitted, not solved | fleet-orchestration/coordination-failure-triage | none | thin (n=5, ungraded) | lead L1 |
| H6 | K | technique | M | Ship a replacement dispatcher in shadow mode with decision-shape digests; side effects defer | none (0 hits, uncapped) | new-technique? | partial | lead L2 (promoting question: does any subject own dual-run cutover? grep over migrations and resilience: no) |
| D6b | K | technique | M | Review depth as a pure function of change metadata; security paths force the top tier | quality-gates/gate-laddering; plan-review | new-technique? | partial | untriaged U1 |
| P13 | K | amendment | S | Absence is not discoverable by reading: a "what is missing" section with its own prompt | plan-review/objection-before-artifacts | none | partial | untriaged U2 |
| P14 | K | technique | S | Never ask the human what the codebase can answer; one question at a time | hitl-approval/oracle-before-gate | none | partial | untriaged U3 |
| H11 | K | technique | M | Foreign-runtime workers return verdicts by file drop, applied by role | result-harvest (declared drop point) | none | partial | untriaged U4 |
| H14 | P | practice | M | A name collision with the host's command gets an invocation-time notice, never a rename | none | none | partial | lead L3 (registry-relevant) |
| H16 | P | practice | S | A name-retirement sweep over prose must be case-insensitive and diff-reviewed | none | none | real gap (practice lane) | folded into the D9 amendment's closing paragraph; lead L4 for the registry's own sweeps |
| M5 | K | technique | M | Ten of ten children merged and the parent metric moved zero | advancement-evidence-fields | corrects-claim | real gap | folded into M6's amendment (the row's obligation is the parent's metric) |

## Verification notes (Phase 6)

- **D1/D3/D5 - the absence was established uncapped.** Concept greps over
  `llm-agent`, `engineering-process` and `backend-platform` for "loop
  authority", "competing loop", "shadow mode" returned zero; "persistence
  loop / persistent mode / keep going" returned three files, none about a
  session; "stop hook / turn boundary" returned six, all applications or
  gates that fire at turn end (mutating-local-gates), none owning the loop.
  `research-map --deep` on eighteen concept terms put fleet-orchestration,
  background-jobs and unattended-build-loop (other bundle) nearest. The
  fleet-orchestration golden path's opening sentence hands the
  member-level problem down and takes the layer above; it never says who
  keeps one member working.
- **D3's contradicted neighbour was kept as the discriminator, not dropped.**
  failure-direction is correct in its subject; the new technique states the
  question that tells a reader which side they are on (is the fail-open
  interval a disclosure, or a stuck operator?).
- **D9 read against the whole technique.** Its "operand is whatever the
  project advances" section already admits a caller count; its "when not to
  use" hands product retirement to entity-lifecycle. The gap sits between:
  a referenced public name, external callers, and the question of whether
  the promised version may keep its promise. Amendment placed before "When
  not to use this".
- **P3 read against the whole technique.** The discriminator's second branch
  ("a success condition that has turned out to be wrong: stop and escalate;
  propose, never adopt") names the case and leaves the record unwritten.
  Amendment placed after the discriminator; the technique's own
  `creation-names-reaper` and `silent-state-is-ungoverned` citations carry
  it without new laws.
- **M6 read against the whole technique.** Its closed vocabulary has
  *unknown* and *absent-with-a-pointer*; it has no version binding and no
  *pending*. The receipts' exact-head rule and the verifier's third exit
  code are the boundary case. The measurement worker parsed the receipt
  file and found the README's claim ("non-green results retained") false
  against the bytes (7 PRs, 0 non-green, three named PRs absent) while the
  risk register said so - that contradiction is the amendment's closing
  paragraph.
- **0 of 3 fetches.** Every landing corroborated corpus-internally or by
  training-data convergence (the hook fail-mode split, the lease, the
  amendment-ledger shape); the eighteenth consecutive zero for a repository
  class.

## Landed

- **Subject** `llm-agent/orchestration/session-continuation` (7 techniques,
  3 source-tree applications) - forged by one worker from the spec; reviewed
  by diff, gate and purity grep (see the subject note).
- **Amendment** `deprecation-by-version-arithmetic`: "When the symbol is a
  public name with consumers, the clock is necessary and not sufficient".
- **Amendment** `fixed-policy-amendable-plan`: "When the fixed tier has to
  move: the record that lets a criterion stop governing".
- **Amendment** `advancement-evidence-fields`: "The satisfied pointer names
  the exact version it was measured on".

## Applied (Phase 7.5)

1. **advisory-guard-fail-mode -> kp and ascent, experiment, `better`,
   shipped.** Seam: each tree's doc-sync Stop hook, which exits 2 on a
   finding (a bounded block: the host feeds the message back once and the
   re-entry flag stops it re-firing). **Condition under which the technique
   would NOT hold, named before the seam was chosen:** a hook whose instrument
   failure must block the stop (release-authority or destructive class); no
   Stop hook in the fleet is in that class. Arms: the same four payloads
   (empty; a transcript path that does not exist; an empty transcript; the
   re-entry flag) through the hook. A: kp and ascent resolved both broken
   payloads to exit 0 with empty stderr (0/2 loud) - a broken trigger read as
   a clean turn. B: pumper's hook, which already carried the rule (exit 3 =
   could not check, non-blocking, surfaced to the human), 2/2 loud. The
   change is ~25 lines per tree and was copied from pumper, not invented.
   Paired proof after the change: kp 2/2, ascent 2/2 loud; the clean and
   re-entry controls unchanged at 0. Commits: kp `0307a014` (main), ascent
   `2f029039` (moonshot/wave-4); pathspec; not pushed. Ledger rows in each
   tree's `.ai/applied.jsonl`.
2. **deprecation amendment -> personas and gravity, simulation, `better`.**
   Three real cases. (a) personas `a1e516254`: two dispatch surfaces retired
   in one change, 53 files, 1,841 deletions, no window - correct under both
   readings, because the surfaces had no external callers ("the one nobody
   was standing on"); the amendment's gate would have cost nothing and
   proven the same. (b) gravity `309eeb1`: a stopgap keyed on exact tone
   strings deleted with its type; a card without a key degrades to the
   gradient - internal, correct. (c) personas `c203b216f`: an earlier intake
   row recorded a *fallback-retirement condition* for a surface with a
   consumer and no clock - under policy A (version arithmetic) that
   condition has no operand; under B the consumer term is the blocker and
   the version bump would not clear it. Falsifier: a fleet retirement that
   the four-condition gate would have blocked and that broke nobody; none
   found in the three histories read.
3. **criterion-amendment ledger -> pof, simulation, `better`.** Three cases
   from one tree's history: `dc7fe6cf` applied 81 hand-authored fact
   corrections against a measured predicate (106 of 110 code-class steps
   emit a byte-identical artifact from two synthetic entities) and retired
   the disputes *in the same change*, with the grading file Director-only
   "precisely so a lot cannot grade itself" - that is the authority field;
   `327499c2` states that retiring a dispute never moves a grade and only
   flips the provenance mark - that is the "not a goal-weakening tool" rule;
   and the "every recorded dispute is REAL" guard that fires the moment a
   fact lands is the fail-closed-on-read rule. Under A the corrections would
   have been edits to the criteria; under B they are the amendment record
   the tree already keeps. Falsifier: a pof dispute retired without a
   measurement in the same change; none in the two commits read.
4. **evidence-fields amendment -> ascent, pumper, kp, simulation, `better`.**
   ascent `8edb4e2c`: nine phantom follow-ups retired off one commit would
   have rendered as nine closures until "Retired" became its own render
   state - the third state. pumper `694f865`: a contract `pass` outlived its
   run, its dataset and its retired source because the verdict map had one
   mutation and no age - the exact-version binding, added as age and
   staleness from fields the worker already stamped. kp `3fe8e702`: a missing
   block read for weeks as a reporter gap until the two truths were split -
   two fields for two claims. Falsifier: a fleet record where binding the
   evidence to its version made a real reading worse; none.
5. **session-continuation -> registry (self), task row.** The fleet's only
   managed continuation loops are the registry's own `/harvest loop` and
   `/deepen` saturation loop, whose stop rules are a pass cap and a budget
   guard with no failure-identity check and no separate stagnation counter.
   Plan and first step: see the subject note and the applied ledger row.

## Already covered (8) - catches, not declines

P5, P6, P15, P16, H8, H10, H12, M9 as in the table. One more from the lead
check: the platform guard that refuses headless mode where the OS cannot run
it (`src/team/model-contract.ts:669`) is deer-flow's banked lead
("fail fast when a mode needs a capability the backend lacks") observed in a
second first-party tree - the lead's return condition is met, and the
corpus already holds it (optional-dependency-degradation).

## Leads (4, with return conditions)

- **L1 - multi-agent overhead, measured badly.** On five real issue
  instances the orchestrated arm produced zero patches against the plain
  arm's five, at 4,637 s mean against 249 s, exceeding its own 1,800 s
  timeout - and "success" in both arms meant a non-empty patch string, with
  token counts recorded as zero. A dated fact about one harness, not a
  finding about orchestration. *Return when the source or a second harness
  publishes a graded solve rate for the same arms.*
- **L2 - shadow-mode dispatcher replacement.** Run the new dispatcher beside
  the old, off by default, recording an equivalence verdict per event from a
  content-free decision-shape digest; side-effecting handlers are never
  re-run and record `deferred`; rollback is one flag. No subject owns
  dual-run cutover (uncapped grep over migrations, resilience, quality-gates:
  none). *Return when a managed project replaces a dispatcher or a hook
  chain, or a second source states the deferred-verdict rule.*
- **L3 - host-command name collision.** When a plugin's command name
  collides with the host's official one, detect it from the installed
  registry AND the effective settings, match the full id, probe with a file
  existence check only, emit a one-line notice at invocation; never rename
  (246 files, orphaned live state, silently broken user configs). Relevant
  to the registry's own skill layout (`claude-code-skill-resolution` memory).
  *Return when a registry skill name collides with a harness built-in.*
- **L4 - prose retirement sweeps.** The registry's own purity sweeps remove
  names from prose; the source's mode-hierarchy documents show what a
  case-sensitive sweep leaves behind. *Return when a check-bundles denylist
  addition triggers a bulk prose edit.*

## Untriaged (5) - reached the table, nobody verified them

| # | Title | Anchor | Promoting question, executed |
|---|---|---|---|
| U1 | Review depth from change metadata; security path globs force the top tier | `docs/shared/verification-tiers.md:26-48` | Does quality-gates own a tiering-by-change-size rule? gate-laddering tiers by *latency rung*, not by change risk; plan-review's decision-sized-slicing sizes the plan, not the review. Not promoted: the source's 40% cost claim is unmeasured, and the mechanism is a cost policy the corpus states nowhere; a real gap with a thin source - lead-shaped, banked here. |
| U2 | Absence needs its own prompt section; predict-before-reading; pre-mortem | `agents/critic.md:21-27,58-107` | Does objection-before-artifacts already require a "what is missing" pass? It charters objections, not absence. The source's "A/B showed dozens vs zero" has no protocol. Not promoted: unmeasured. |
| U3 | Classify a question before asking the human; codebase facts are never asked | `skills/plan/SKILL.md:64,198-204` | Does hitl-approval own which questions reach the human? oracle-before-gate decides whether a gate is armed, not what is asked. Partial; small; banked. |
| U4 | Foreign-runtime workers return verdicts by writing a JSON file the leader polls; applied by role | `src/team/cli-worker-contract.ts:1,66,84` | Is the file drop result-harvest's "declared drop point"? Yes for the channel; the *role-not-capability* applicability rule and the "write revise rather than exit silently" rule are the residue. Banked. |
| U5 | Two independent cost models in one tree (1x/5x/20x vs per-token prices) claiming 40% and 47% | `docs/shared/verification-tiers.md:87-93`, `docs/design/TIERED_AGENTS_V2.md:306-315` | Currency-shaped and self-contradictory; nothing to reset. Recorded for the contradiction ledger only. |

## Contradictions the source carries (for the next pass)

Eighteen, from the design worker: two conflicting decisions for `plan` and
`verify` in one table; the consolidation epic reported FAIL by its own
verifier; lifecycle-event and hook counts disagreeing across four documents
(21 hooks vs 294 files; 11 vs 12 events; 19/32 agents; 31/41 skills); a
general engine rejected in one ADR and a graph core landed in the next; a
name-removal sweep that corrupted the mode-hierarchy documents in place. The
count is the finding: the doc whose job is to prevent drift carries stale
numbers.

## What the 1.6.0 method would have produced, in one row

Read as claims this source yields eight catches and perhaps three
amendments (D9, P3, M6 are all boundary cases and would have landed either
way). Read as decisions it yields a category-sized gap with three NONE
entries and one home. The amendments are the same under both methods; the
subject exists only under v2.
