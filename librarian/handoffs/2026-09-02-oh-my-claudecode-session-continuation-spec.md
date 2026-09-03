---
spec: 2026-09-02-oh-my-claudecode-session-continuation
kind: xl-spec
status: EXECUTED
executed_on: 2026-09-02
overrides: none reported by the worker (it was cut off by a rate limit after writing every file; the director reviewed the diff - gate clean for the subject, purity clean, seven use_when, techniques list bidirectional, one citation opened and confirmed)
source_note: ../sources/2026-09-02-oh-my-claudecode.md
run_id: intake-omc-0902
bundle: software-engineering
category: llm-agent/orchestration
subject: session-continuation
resolved_path: knowledge/software-engineering/llm-agent/orchestration/session-continuation/
link_depth: golden path -> ../../../_laws.md ; techniques and applications -> ../../../../_laws.md
---

# XL spec: `session-continuation` (llm-agent/orchestration)

## Why a subject, not amendments

The design read (source note, "Design record") produced three load-bearing
decisions with `corpus: NONE` and one shared nearest neighbour
(`fleet-orchestration`, which states in its opening that it owns the layer
*above* one session and hands "is this process alive" down to
subprocess-lifecycle). Nothing in the corpus owns the layer *inside* one
session: what keeps an agent working past its own decision to stop, who may
say the loop is over, how it is torn down, and what the harness must carry
across a context compaction. Three NONE entries with one home is the v2
mechanical trigger. Under v1 these would have been five paragraphs in five
techniques of three subjects, and the mechanism would have gone nowhere.

Placement verified against `knowledge/software-engineering/taxonomy.json`
(the authority): `llm-agent/orchestration` holds seven subjects
(agent-chaining, fleet-orchestration, model-routing, hitl-approval,
remediation-handoff, proactive-nudges, plan-review) under the cap of ten,
so the eighth sits directly in the category. The taxonomy entry is already
written. The subject folder is a leaf.

## The subject in one paragraph

A coding-agent session ends its turn when the model decides it is done. For
any task longer than one turn that decision is wrong on schedule: the model
summarises after a positive review verdict, stops after a partial result,
or loses the plan to a compaction. This subject owns the harness layer that
keeps one session working until a stated condition holds and lets it be
stopped cleanly: the continuation fact as **state the harness re-reads at
the turn boundary** rather than an instruction in context; a **lease** on
that state so a crashed run expires instead of holding future sessions
hostage; exactly **one loop authority** per session with an enumerated
conflict policy; guards that **fail open unless their risk class says
otherwise**; an **ordered teardown** that clears every guard the harness can
set; a **checkpoint ferried across compaction** by the harness, not the
summariser; a **sealed multi-stage run** that advances exactly once on
authenticated evidence; and **stuck-loop detection** keyed on failure
identity, not attempt count.

## Boundaries it must NOT absorb

- `fleet-orchestration` owns many sessions: registry, dispatch, harvest,
  completion-claim-verification (the *evidence* that a delegate's "done"
  is true). This subject owns who may declare *this session's* loop over
  and what happens at the turn boundary. Cite that verdict evidence belongs
  next door; do not restate receipts.
- `subprocess-lifecycle` owns the process: spawn, signal, reap.
- `agent-instruction-files` owns the advisory floor and its redelivery
  across resets (`context-reset-redelivery`). The compaction technique here
  ferries *control-loop state* (active mode, plan anchor, job handles), not
  the instruction file; say so and name the neighbour.
- `hitl-approval` owns the human gate and `fixed-policy-amendable-plan`
  owns the executor's terms. This subject does not decide *what* is
  approved, only that a positive verdict is not a yield state.
- `plan-review` owns the reviewer's payload. `background-jobs`
  (`loop-supervision`) owns server-side timers and singleton loops; the
  discriminator is that a session loop is enforced at a turn boundary the
  model cannot skip, not by a scheduler.
- Cross-bundle, no link allowed: game-production's `unattended-build-loop`
  holds the budget-drain and self-report rules for a build loop. State the
  discriminator in prose (that loop drains a spend budget; this one gates a
  turn boundary) and do not duplicate its techniques.
- `retry-backoff/circuit-breakers` owns dependency-down detection; the
  stuck-loop technique here is about an agent repeating its own failure.

## Proposed techniques (7), each with the decision rule it must carry

1. `continuation-as-state` - The keep-going fact is a persisted record the
   harness re-reads at the turn boundary and enforces by refusing the stop;
   it is never a sentence in the prompt. Rules: the record carries a lease
   (the source uses two hours) after which it is treated as inactive; the
   activation channel (keyword or command that arms a mode) is suppressed
   inside spawned workers so the harness cannot arm itself recursively; one
   mode the tree deliberately keeps off auto-detection because it spawns;
   the set of states allowed to yield control to the human is enumerated
   (clean terminal exit; rejection) and a positive review verdict is not
   in it. Test: delete the reinforcement text, leave the file, continuation
   must still happen; age the file past the lease, it must stop.
2. `single-loop-authority` - A session has exactly one continuation
   authority, single-valued. When a second loop (the host's own goal
   evaluator, a nested mode) appears, resolution is one of an enumerated
   set of policies (refuse / adopt the existing / artifact-only) and there
   is no warn-and-continue branch; an unknown policy fails with a
   diagnostic. The host judge's pass is a distinct status from complete,
   with the harness's own verification between them, because a judge that
   reads only the conversation cannot be the source of truth about the
   tree.
3. `advisory-guard-fail-mode` - Every interceptor carries a declared risk
   class and its fail mode is derived from it; the fail-closed set is
   enumerable from the registry (the source: two of ~twenty entrypoints).
   Anything that blocks at the turn boundary must be a total function of
   the current message with an enumerated accept grammar; unlisted syntax,
   malformed parses and uncertain boundaries pass. Every handler is bounded
   by a declared timeout with a timer that cannot hold the process open.
   Ambiguity is a pass, not a block, because over-blocking deadlocks the
   operator and a turn-boundary hook cannot know enough to do better. An
   instrument failure (the checker itself throws) fails open *with a
   structured diagnostic*, never silently. Discriminator against
   `security/authorization`'s failure-direction (everything fails closed):
   that rule governs a decision path whose fail-open interval is a
   disclosure; an advisory guard's fail-closed interval is a stuck
   operator. Name the discriminating question.
4. `ordered-teardown` - Cancel clears every stop-blocking guard the harness
   can set, from one path, in a dependency order; a guard the teardown does
   not know about is an unkillable session (the source paid for this:
   users blocked for fifteen minutes after cancel). Primary first, then
   dependents; if the primary write fails, abort and leave the group
   resumable rather than half-erased. Distinguish deactivating a mode
   (a narrow write) from a global cancel signal, because a global signal
   emitted during a handoff disarms the successor mode for its window.
   Cancel must also win the race against the loop re-arming itself on the
   same turn.
5. `compaction-checkpoint` - Context compression is a boundary control
   state is explicitly ferried across: enumerate what must survive (active
   modes, plan anchor, background job handles, counts), write it at the
   pre-compaction event, restore it at the post-compaction session start
   keyed on the reason the session started, and never let the summariser
   carry anything the loop depends on. Two channels exist on purpose: the
   automatic checkpoint and a model-writable notepad; neither is
   sufficient alone. Boundary: the instruction floor's redelivery is the
   neighbour's; this is the control loop's.
6. `sealed-stage-advance` - A multi-stage run admits only sequences from a
   closed set whose stage inputs are self-produced; at selection the run's
   shape is sealed by a content hash into an immutable descriptor, so a
   resume cannot be altered by later configuration; a stage advances
   exactly once, on the current adapter's exact completion signal found in
   an authenticated record (no symlink, bounded, after a recorded
   activation boundary), under compare-before-write; a concurrent loser
   re-reads once and reports the current status. Rejected alternative,
   stated: a general workflow engine (arbitrary stages, branches, loops,
   callbacks) is a different safety model. Neighbour: `pipeline-dag` pins
   an authored graph at run start; here the advance is driven by model
   output and needs provenance.
7. `stuck-loop-detection` - Stop on error identity, not attempt count: the
   same failure signature surviving N repair attempts (the source uses 3
   at every layer) halts that lane with a root-cause hypothesis handed
   upward, and this stop outranks any batching or deferral policy. Keep
   two independent counters, stagnation (wins too small to matter) and
   failure (no win), with asymmetric resets, because a single counter
   conflates them. Accept a candidate only after re-measuring the merged
   state; forbid the same approach family from winning N rounds running.

## Source-tree applications the worker writes (v2: the clone is an opened tree)

Clone: `C:/Users/kazda/AppData/Local/Temp/claude/C--Users-kazda-kiro-ai-registry/9edd554e-ce7d-485c-bf5b-9c3b871bea4b/scratchpad/intake-omc-0902/repo`
at commit `e9e8fa3847ce0b3529b84d895e841988c7308f3d`. Three applications,
`stack: process` or `node`, citing the tree's own files:

- `process--continuation-as-state.md` from `docs/HOOKS.md:261-272` (the
  persistent-mode hook, the two-hour staleness rule), `:404-405` and
  `:510-512` (worker suppression, the mode kept off auto-detection),
  `skills/ralph/SKILL.md:288` and `:155` (approval is not a yield state),
  `src/hooks/persistent-mode/__tests__/cancel-race.test.ts:32` (issue #921).
- `node--advisory-guard-fail-mode.md` from
  `docs/design/ISSUE-3707-HOOK-REGISTRY-SHADOW.md:21,31,45` (risk class by
  convention, two fail-closed entrypoints, bounded awaits),
  `docs/HOOKS.md:244-259` (the stateless drift guard and its grammar),
  `hooks/hooks.json`, and `src/hooks/registry/` if present.
- `process--sealed-stage-advance.md` from
  `docs/adr/03487-named-autopilot-stage-profiles.md:30-39,61-86,97-113`.

Also cite where it fits: `docs/HOOKS.md:182-191,361-384` (pre-compact
checkpoint, issue #3730); `skills/cancel/SKILL.md:112-123,279-288,322-326`
and `docs/cancel-skill-active-state-gap.md` (teardown order, issue #2118);
`skills/plan/SKILL.md:88-89` (deactivate vs global cancel signal);
`docs/shared/mode-selection-guide.md:56-80` and
`docs/design/CLAUDE_CODE_GOAL_ADAPTER.md:36-52,76-85` (single authority,
evaluator_passed is not complete); `skills/self-improve/SKILL.md:271-318`
and `skills/autopilot/SKILL.md:34,105,149` (counters, failure identity).

## Open questions the drafter decides (do not discover them mid-draft)

- Whether the yield-state enumeration belongs in technique 1 or 2. Default:
  technique 1 (it is about the turn boundary), with technique 2 owning who
  may declare the loop over.
- Whether the lease duration is stated as a number. Default: no number in
  the upper layers; "hours, not days" and the two reasons (a crash must
  expire; a long task must not).
- Whether `stuck-loop-detection` cites `count-carries-predicate` or
  `failure-not-empty-success`. Cite only what the text genuinely rests on.
- Laws available (anchors verified in `_laws.md`): gate-sees-target,
  silent-state-is-ungoverned, failure-not-empty-success,
  absent-guard-is-loud, unknown-is-not-a-value, count-carries-predicate,
  verdict-survives-boundary, deletion-is-not-repair, creation-names-reaper.

## Override instruction

If a technique in this list turns out to be a boundary case of a
neighbour's mechanism rather than a mechanism of its own, fold it into the
nearest technique here and say so in your report with the argument. If the
placement or a boundary statement above is wrong, say why and do what is
right; the brief is a starting point, not a contract.

## Web budget

At most three fetches, primary documents only: the host harness's own hook
lifecycle reference (event names, exit-code semantics, the stop-hook
re-entry flag), and nothing from commentary. The corpus and the clone are
the corroboration for everything else.
