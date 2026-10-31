---
domain: software-engineering
subject: session-continuation
last_touched: 2026-10-06
touched_by: intake
dry_streak: 0
---

# session-continuation

First touch: forged 2026-09-02 from
[[../../handoffs/2026-09-02-oh-my-claudecode-session-continuation-spec]], raised
by `/intake` (v2.0.0) from [[../../sources/2026-09-02-oh-my-claudecode]] and
executed in the same session by one forge worker. Placed at
`llm-agent/orchestration` (8 of a cap of 10). Seven techniques, three
source-tree applications (`process` x2, `node` x1) reconciled against the
source clone, none yet against a fleet tree.

## Why it exists

The design read of a community agent harness produced nine decisions; three had
no corpus home and all three sat inside one session: continuation as state the
harness re-reads at the turn boundary, a single loop authority with enumerated
conflict policies, and guards whose fail mode derives from a risk class.
`fleet-orchestration` says in its opening that it owns the layer above a
session and hands the process down to `subprocess-lifecycle`; nothing owned the
layer between. The v2 XL trigger (three design candidates, one home) made the
subject by construction.

## The boundaries, as the worker stated them

- fleet-orchestration: many sessions; completion-claim-verification owns the
  *evidence* a delegate's "done" is true - this subject owns who may say this
  session's loop is over. Receipts are not restated.
- agent-instruction-files/context-reset-redelivery: the instruction floor's
  redelivery across a reset; compaction-checkpoint here ferries the control
  loop's state, and says so.
- security/authorization/failure-direction: everything fails closed there
  because the fail-open interval is a disclosure; advisory-guard-fail-mode
  states the discriminating question (disclosure, or a stuck operator).
- pipeline-dag pins an authored graph; sealed-stage-advance owns the
  provenance of a model-driven advance.
- Cross-bundle, named in prose only: game-production's unattended-build-loop
  drains a spend budget; this subject gates a turn boundary.

## Applied on first touch

- advisory-guard-fail-mode -> kp and ascent: experiment, `better`, shipped
  (the doc-sync Stop hook's instrument failure was a silent pass in two trees
  and a loud "cannot check" in the third; the two now match the third).
- stuck-loop-detection -> registry (self): task row; first step on branch
  `intake-omc-0902/harvest-stuck-loop` (the harvest loop's stop rule).
- The other five techniques carry no fleet seam yet: the fleet's harness is
  the host CLI, and no managed project builds its own persistence loop or
  hook registry. Return when one does, or when the registry's own skills
  grow a mode-state file.

## Owed

- A fleet application. The three applications cite the source; the first
  registry-side realisation is the run board (claims with a 45-minute lease,
  locks with a 15-minute breakable TTL), which is continuation-as-state's
  lease rule applied to a fleet, not a session - an application under
  fleet-orchestration, not here.
- The hook *source* of the origin tree was not opened by this run (the
  instrument sweep failed on a rate limit); the applications cite the hook
  reference and the registry design, not the implementation. A later pass
  should open the persistent-mode staleness function and the drift guard's
  grammar and re-anchor.

## 2026-09-02 - `/intake` hermes-agent (run `intake-hermes-0902`, intake 2.1.1, Opus workers)

`stuck-loop-detection` gained "The interruption that leaves no signature": crash-resume marks recently touched sessions resume-pending, auto-continues them, keeps the mark until a turn succeeds, and escalates to suspended after three consecutive restarts; a clean-shutdown marker suppresses the sweep. The technique keyed only on failure identity; involuntary interruption is the second key. Also corrected on the other side of a boundary: `advisory-guard-fail-mode` says "bound every handler", and the peer runtime shows the handlers where abandonment has no safe direction (a last-chance flush, a policy gate) - the correction is recorded as a boundary in agent-runtime-assembly rather than an edit here. Deviation for the task backlog: the restart-count write and the suspend save are swallowed by bare excepts, so the terminal state can silently fail to arm.

## 2026-09-04 - /intake run (stencil harness playbook)

- New technique `ordered-yield-composition`. `single-loop-authority` holds the continuation authority "to one value per session" and resolves a second claimant from a "closed set" of three - refuse / adopt / artifact-only - **all of which work by ensuring the second loop does not exist AS a loop**. A harness postmortem demonstrates a fourth: keep both alive, give them a total order, and let the innermost frame see the candidate yield first with exactly one consumer per yield (pass / continue / yield / push / done / fail, with `pass` the only way outward).
- Two sharp points. The corpus's stated safe default, `refuse`, is **verbatim the source's postmortem anti-pattern** - an exclusivity check restated by hand at six entry points, telling the user to exit one mode before entering another. And `adopt`'s reconcile-or-refuse fork for irreconcilable yield conditions **does not arise** under a stack, because conditions evaluated at different depths never have to merge.
- `one-authority-per-vocabulary` survives intact and is why the landing is legitimate: the stack IS the authority. The corpus's error was identifying the authority with a *behaviour* rather than with an *arbiter*. `single-loop-authority` gained one scope paragraph (claimants with no defined order between them) and keeps every existing sentence true.
- Corroboration is **training-data convergence, not the source** - an ordered interceptor chain with single consumption is long-established practice - which matters because the source's own Director stack is designed and not fully shipped.
- The technique imports two obligations the subject already owns: a declared risk class per frame with a derived fail direction (a frame that throws must re-offer the yield it held, not swallow it), and leases on a restored stack so a crashed session does not resume into an armed force.
- **Unapplied.** One fleet project has 18 restated checks of two mode flags across 8+ files - the right shape - but those modes gate permission rather than a candidate yield. Return condition: a project grows two behaviours that each want to hold a session open.

## 2026-09-04 - lead from the `/deepen` batch ([[2026-09-04-1]])

- **`advisory-guard-fail-mode`: one event, two documented fail directions by handler
  family.** The agent-runtime-assembly worker found a harness whose timed-out command
  hook does not block while its SDK-callback hook for the same event does - primary
  evidence for "the handler class fixes the direction", which this technique argues
  from one side. Return condition: the next deliberate edit of the technique, or a
  second harness documenting per-family fail direction.

## Architecture review - 2026-09-09

Historical intake and application outcomes above remain historical. This pass
corrects unconditional persistence and composition claims, separates required-input
and resource-limit yields from rejection, and makes cancellation/storage races
explicit. Source inspection narrows the three application guarantees without
refreshing their verification dates or claiming live harness evidence.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/session-continuation",
  "date": "2026-09-09",
  "baseline": "8ea10877",
  "digest": "sha256:e1b17473dcda7343",
  "disposition": "clarify",
  "coverage": "All twelve owned documents read in full. Pinned dispatcher and stage ADR read; relevant persistent-mode functions checked. No full plugin, hosted workflow or historical runtime suite executed.",
  "counterexamples": [
    "A review-only task can be complete at a positive review verdict.",
    "An authenticated assistant record can contain a false claim that tests passed.",
    "A timed-out Promise.race loser can continue and write later.",
    "A writer paused past a short tombstone expiry can resurrect an old run without a generation check.",
    "A child can push indefinitely even when each yield has one consumer.",
    "Changing error signatures do not prove progress, so hard budgets remain necessary."
  ],
  "sources": [
    {
      "url": "https://nodejs.org/download/release/v20.20.0/docs/api/timers.html#timeoutunref",
      "result": "Primary timer semantics: unref removes timer liveness requirement and does not guarantee callback execution."
    },
    {
      "url": "https://github.com/Yeachan-Heo/oh-my-claudecode/blob/e9e8fa3847ce0b3529b84d895e841988c7308f3d/src/hooks/registry/dispatcher.ts",
      "result": "Full pinned source read; handler evaluated before timeout promise, no loser cancellation, shadow result only."
    },
    {
      "url": "https://github.com/Yeachan-Heo/oh-my-claudecode/blob/e9e8fa3847ce0b3529b84d895e841988c7308f3d/src/hooks/persistent-mode/index.ts",
      "result": "Read isStaleState, timestamp and cancellation validation; no complete plugin execution or full module audit."
    },
    {
      "url": "https://github.com/Yeachan-Heo/oh-my-claudecode/blob/e9e8fa3847ce0b3529b84d895e841988c7308f3d/docs/adr/03487-named-autopilot-stage-profiles.md",
      "result": "Pinned ADR read in full; design intent distinguished from implemented and verified behavior."
    }
  ],
  "documents": {
    "session-continuation.md": {
      "disposition": "clarify",
      "reason": "Continuation respects accepted scope, explicit yield reasons, cancellation and budgets; links all eight techniques and distinguishes claims from acceptance."
    },
    "techniques/continuation-as-state.md": {
      "disposition": "clarify",
      "reason": "Session/run identity, bounded renewal, required-input and resource-limit yields; intermediate approval does not create new authority."
    },
    "techniques/single-loop-authority.md": {
      "disposition": "clarify",
      "reason": "One arbiter can compose multiple contributors; adoption cannot expand accepted scope and evaluator roles alone do not determine authority."
    },
    "techniques/ordered-yield-composition.md": {
      "disposition": "clarify",
      "reason": "Ordering does not prove termination or reconcile incompatible conditions; bound push/continue and preserve protective refusal and cancellation."
    },
    "techniques/advisory-guard-fail-mode.md": {
      "disposition": "clarify",
      "reason": "Unknown hook classification cannot silently become advisory; timeout bounds waiting, not synchronous execution or later writes."
    },
    "techniques/ordered-teardown.md": {
      "disposition": "clarify",
      "reason": "Failed durable cancellation must not permit local continued execution; generations defeat writers delayed beyond short signal expiry."
    },
    "techniques/compaction-checkpoint.md": {
      "disposition": "clarify",
      "reason": "Persist at transitions and restore idempotently against current generation; missing snapshot has unknown cause, and a note cannot re-arm control."
    },
    "techniques/sealed-stage-advance.md": {
      "disposition": "clarify",
      "reason": "External declared inputs are valid; hash is not authentication, completion phrase is not acceptance, and atomic advance differs from reliable dispatch."
    },
    "techniques/stuck-loop-detection.md": {
      "disposition": "clarify",
      "reason": "Retain hard resource limits, evidence-sensitive thresholds, reversible integration validation and authority-scoped crash resume."
    },
    "applications/node--advisory-guard-fail-mode.md": {
      "disposition": "reverify",
      "reason": "Pinned source and timer documentation narrow timeout/shadow guarantees; live enforcement and historical runtime remain unverified."
    },
    "applications/process--continuation-as-state.md": {
      "disposition": "reverify",
      "reason": "Pinned staleness/cancel source read; future timestamp caveat and distinction between cancel-channel fixtures and concurrent race proof."
    },
    "applications/process--sealed-stage-advance.md": {
      "disposition": "reverify",
      "reason": "Pinned ADR read; correct self-produced-input and current-profile interpretations; acceptance, atomic implementation and delivery require runtime evidence."
    }
  }
}
```

## 2026-09-15 - /intake QwenPaw (run `qwenpaw-0915`, intake 2.10.0)

Source [[../../sources/2026-09-15-qwenpaw]]: an agent runtime whose loop evaluates composable stop gates on every iteration. Two techniques landed, taking the subject to 10.

- **boundary-applied-stop.** A stop decided on a tool-call iteration waits until the results are in. The drafter's override sharpened the discriminator: it is whether any reasoning call will read the batch, not when the stop was decided. A batch nobody will read is refused with not-executed results.
- **gate-state-lifetimes.** Gate state is keyed by session and has three lifetimes. The un-spend test defines a meter. No phase reset or resume touches a meter, and every terminal path charges it.
- **Applied in athena-everywhere.** Both rows are code mode, better, and shipped. `e106230`: a parked job resumed with its whole budget and spent 12 of 10. `60108d0`: the last round ran a tool nobody read, 8 executions against 7.
- **Untriaged here:**
  - a closed gate catalog (home contested with quality-gates)
  - unscoped handlers running beside an active mode (a single-loop-authority boundary, GAIN 1)
  - a mirrored transcript that silently re-threads on a failed resume (home contested with fleet-orchestration)
- **The source contradicts its own docs.** The docs say the first definitive gate wins; the code lets a later TERMINATE win.

## 2026-09-23 - [[2026-09-23-1]]

Lead drain (run lib-0923): **L132 COVERED** by `subprocess-lifecycle/termination-and-reaping`. Proposal from L369 (declined at `durable-agent-operations`): `stuck-loop-detection` could carry "a stagnation or saturation counter is recomputed from the loop's recorded outcomes; a field only an initialiser writes cannot fire" - the registry itself was the sighting and was fixed the same run (librarian-scan computes `dryStreak` from run results).

**Impact** (stale verdicts before this landing, from the map rebuilt at the run start): none recorded.

## 2026-10-06 - boundary from /intake apply close-is-a-controlled-crash (run `ap-cicc-1006`)

`stuck-loop-detection` gained a paragraph and a decision rule: **the clean-shutdown
marker may skip a sweep keyed on recency, never one keyed on in-flight state.**
It is code-read corroboration, not a source. personas had copied the marker onto
its state-keyed execution sweep. Its exit drain did not cover agent runs, so a quit
mid-run skipped the resume a crash would have given. The fix is in
[[durable-agent-operations]]'s application. The technique's own rule stands for
the recency-keyed sweep it describes. The amendment names the condition under which
"after the drain completes" is false: the drain must cover the population the sweep
reads.

## 2026-10-08 - intake (claude-code-doctor)

New application `claude-code--advisory-guard-fail-mode` (applied: experiment,
ab_verdict: better, proof ab-paired). A host-side spawn filter in front of a
blocking guard intersects the guard's accept grammar: the obvious filter missed
timeout-wrapped commands, a third of the project's real inputs, and the guard could
not report it because it never started. The general rule is untriaged at GAIN 1 in
the source note; a second sighting on another hook or harness promotes it into the
technique as a boundary case of "unlisted syntax passes".

## Architecture review - 2026-10-31

Re-review after the 2026-09-15 QwenPaw landing, which added two techniques and two
applications, then the 2026-10-06 stuck-loop amendment and the 2026-10-08 claude-code
application. All 17 documents were read. The 2026-09-09 technique clarifications are
mostly unapplied. Only the three applications gained source-check sections. Every
technique-level change named in that record is carried forward. Nothing is retracted.

The new techniques make one of the carried items sharper. continuation-as-state still
lists exactly two yield states: a clean terminal exit and an explicit rejection. The
golden path repeats that list. But boundary-applied-stop and gate-state-lifetimes
introduce stops on time, token, round and iteration limits, and the subject now endorses
them. Under the enumerated set those stops are not legitimate yields. The 2026-09-09
"resource-limit and required-input yields" item is therefore an internal contradiction
now, not only a refinement.

Second gap: the golden path says consumption meters "outlive a suspended and resumed
invocation". gate-state-lifetimes never says so. Its meter rule covers phase resets and
terminal-path charging only, although the 2026-09-15 note records the motivating
athena-everywhere defect (a parked job resumed with its whole budget).

Primary checks (read only, not executed):
- The QwenPaw runner at the pinned commit confirms the deferral rule, including the
  reason-required condition, and that no not-executed tool result exists.
- The QwenPaw channel base confirms that staged turn usage is committed only on the
  success branch and discarded on error, cancellation and exception.
- Claude Code's hooks reference confirms that the `if` filter is best-effort and that the
  hook runs when a command cannot be parsed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/session-continuation",
  "date": "2026-10-31",
  "baseline": "c052abb9",
  "digest": "sha256-b2:b0eabf78abd856a4",
  "disposition": "clarify",
  "coverage": "All 17 owned documents read: golden path, 10 techniques, 6 applications. Primary source read for the two QwenPaw applications (runner.py and channels/base.py at the pinned commit) and the claude-code application (current hooks reference). Not re-checked: oh-my-claudecode sources (relied on the 2026-09-09 pinned reads), the athena-everywhere commits, and any runtime. No harness, hook or test was executed.",
  "counterexamples": [
    "A turn stopped by a token or round limit is neither a clean terminal exit nor an explicit rejection, yet boundary-applied-stop requires the harness to yield on it.",
    "A parked job resumed with a fresh meter spent 12 of a 10 budget; no phase reset was involved, so the phase-only meter rule does not catch it.",
    "A custom gate that terminates with an empty reason is dropped on every tool-call iteration by the QwenPaw deferral site.",
    "A child frame can push indefinitely while every yield has exactly one consumer, so ordering alone does not prove termination.",
    "A timed-out Promise.race loser can keep running and write after the guard has failed open.",
    "Error signatures that change every round do not prove progress, so a hard attempt or spend budget is still needed beside failure identity.",
    "A host-side spawn filter narrower than the guard's grammar fails open silently, and the guard never starts to report it."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/agentscope-ai/QwenPaw/cbf1a4031d71915e0648d6cd2ef864989ccb42ae/src/qwenpaw/loop/gates/runner.py",
      "result": "apply_stop_result docstring 'Defer stops and strategy warnings until tool results are processed. Ordinary keep-working prompts are unnecessary on tool-call iterations.'; body 'if stop_result.action == StopAction.TERMINATE and stop_result.reason:' sets _gate_pending_stop; continuation kept only with inject_on_tool_call and continuation_message. No not-executed tool result is created. Supports python--boundary-applied-stop."
    },
    {
      "url": "https://raw.githubusercontent.com/agentscope-ai/QwenPaw/cbf1a4031d71915e0648d6cd2ef864989ccb42ae/src/qwenpaw/app/channels/base.py",
      "result": "_clear_session_turn_usage docstring names 'turn start / cancel / error'; called on the response-error, asyncio.CancelledError and Exception branches of both process loops; _commit_turn_usage only in the success else-branch. Supports python--gate-state-lifetimes' zero-charge finding."
    },
    {
      "url": "https://code.claude.com/docs/en/hooks",
      "result": "'When Claude Code can't determine which commands the Bash input runs, it runs your hook regardless of the pattern. Because the if filter is best-effort, use the permission system rather than a hook to enforce a hard allow or deny.' Leading VAR=value assignments are stripped and each subcommand is checked; one rule per if field. Supports claude-code--advisory-guard-fail-mode's cost-filter-not-authority framing and its separate-handler fix."
    },
    {
      "url": "https://github.com/Yeachan-Heo/oh-my-claudecode/blob/e9e8fa3847ce0b3529b84d895e841988c7308f3d/src/hooks/registry/dispatcher.ts",
      "result": "Carried from 2026-09-09, not re-fetched: Promise.race bounds waiting, not execution. Still supports the advisory-guard-fail-mode clarification."
    }
  ],
  "documents": {
    "session-continuation.md": {
      "disposition": "clarify",
      "reason": "Widen the enumerated yield states so they include limit stops (with their typed reason), required input and cancellation, matching the new boundary-applied-stop section. Keep the meter-across-resume sentence only if gate-state-lifetimes states it. Still owed: claims are not acceptance, and continuation respects accepted scope."
    },
    "techniques/continuation-as-state.md": {
      "disposition": "clarify",
      "reason": "Add the yield states a limit gate, a required input and cancellation produce, so boundary-applied-stop's stop is legitimate here. Still owed: session vs run identity, bounded lease renewal, and that intermediate approval creates no new authority."
    },
    "techniques/single-loop-authority.md": {
      "disposition": "clarify",
      "reason": "Unchanged and still owed. One arbiter may compose several contributors; adopt cannot widen accepted scope; evaluator roles alone do not fix authority."
    },
    "techniques/ordered-yield-composition.md": {
      "disposition": "clarify",
      "reason": "Replace 'the stack terminates because each frame either consumes or passes' with an explicit bound on push and continue (depth and round ceilings). Still owed: protective refusal and cancellation outrank the order."
    },
    "techniques/advisory-guard-fail-mode.md": {
      "disposition": "clarify",
      "reason": "'The timeout is enforced by the registry ... abandoned at the deadline' must say that it bounds the wait, not the handler: a loser keeps running unless cancelled, and synchronous work is not bounded. An unknown hook class cannot silently default to advisory."
    },
    "techniques/ordered-teardown.md": {
      "disposition": "clarify",
      "reason": "Still owed. When the primary write fails, the group stays resumable but the local loop must still stop. Prefer generation or compare-and-swap over the short-expiry tombstone, because a writer paused past the tombstone's expiry resurrects the run."
    },
    "techniques/compaction-checkpoint.md": {
      "disposition": "clarify",
      "reason": "Still owed. Persist at control transitions as well as pre-compaction. Restore idempotently against the current generation. A missing checkpoint has unknown cause, not necessarily a failed write. The notepad cannot re-arm control."
    },
    "techniques/sealed-stage-advance.md": {
      "disposition": "clarify",
      "reason": "Still owed. Externally declared inputs, such as the invocation task, are valid. A content hash detects inconsistency, not tampering. A completion phrase is not acceptance. Compare-before-write needs a real lock or CAS, and an atomic advance does not guarantee delivery."
    },
    "techniques/stuck-loop-detection.md": {
      "disposition": "clarify",
      "reason": "The 2026-10-06 recency-vs-state marker paragraph holds. Still owed: keep a hard attempt and resource budget beside failure identity (changing signatures are not progress), make thresholds evidence-sensitive, and scope crash-resume authority."
    },
    "techniques/boundary-applied-stop.md": {
      "disposition": "keep",
      "reason": "The boundary definition, the pending typed stop, the one-iteration lateness bound with its injected-clock test, the will-anyone-read-it question and the not-executed status are coherent. The protective-stop exception is stated. The QwenPaw source confirms the deferral half."
    },
    "techniques/gate-state-lifetimes.md": {
      "disposition": "clarify",
      "reason": "Add the resume rule the golden path already asserts: a suspended and resumed invocation restores its meters and never re-arms them at full allowance (the athena-everywhere sighting). Otherwise sound: session keying, reset vs disarm, reset-peers constraints, the un-spend test, and charging on every terminal path."
    },
    "applications/node--advisory-guard-fail-mode.md": {
      "disposition": "reverify",
      "reason": "Its 2026-09-09 source-check section is in place. Live enforcement and the Node runtime were not exercised."
    },
    "applications/process--continuation-as-state.md": {
      "disposition": "reverify",
      "reason": "The source-check section landed with the future-timestamp and cancel-channel caveats. No live harness run."
    },
    "applications/process--sealed-stage-advance.md": {
      "disposition": "reverify",
      "reason": "Corrected to cite the ADR as design evidence. Implementation and delivery remain unverified at runtime."
    },
    "applications/python--boundary-applied-stop.md": {
      "disposition": "keep",
      "reason": "The pinned runner confirms the deferral sorting, the reason-required condition and the absence of any not-executed result. The doc says it read the code and did not execute it, and it states the unhandled refuse-before-dispatch case and the doc/code precedence disagreement."
    },
    "applications/python--gate-state-lifetimes.md": {
      "disposition": "keep",
      "reason": "The pinned channel base confirms commit-on-success-only and discard on error, cancel and exception. The phase-reset misfiling of wall time and tool calls, and the plugin scope gap, are stated as limits."
    },
    "applications/claude-code--advisory-guard-fail-mode.md": {
      "disposition": "keep",
      "reason": "The current hooks reference corroborates best-effort if-filtering, the run-anyway behaviour on unparseable input and one rule per handler, which matches the two-entry fix. The n=1, version-bound proof is disclosed with a re-run condition."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify apply)

Applied every clarify item in the earlier 2026-10-31 record, including the
2026-09-09 technique items it carried forward. The yield-state contradiction is
closed: continuation-as-state and the golden path now list limit stops, required
input and cancellation as typed yields. gate-state-lifetimes now states the
meter-across-resume rule the golden path asserted. The three source-tree
applications stay reverify (no runtime evidence). Nothing earlier is retracted.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/session-continuation",
  "date": "2026-10-31",
  "baseline": "42172877b",
  "digest": "sha256-b2:23f9ee426474cca5",
  "disposition": "reverify",
  "coverage": "Clarify-apply pass on the earlier 2026-10-31 record. All 17 owned documents re-read; every clarify item applied in the golden path and nine techniques. Promise.race cancellation semantics re-checked in MDN for the advisory-guard timeout item. Applications were not edited and their citations not re-checked; the oh-my-claudecode sources rely on the 2026-09-09 pinned reads. No harness, hook or test was executed.",
  "counterexamples": [
    "A turn stopped by a token or round limit is neither a clean terminal exit nor an explicit rejection, so the yield list must name limit stops.",
    "A parked job resumed with a fresh meter spent 12 of a 10 budget with no phase reset involved.",
    "A child frame can push indefinitely while every yield has exactly one consumer, so ordering alone does not prove termination.",
    "A timed-out Promise.race loser can keep running and write after the guard has failed open.",
    "A writer paused past a short tombstone expiry can resurrect a cancelled run without a generation check.",
    "Error signatures that change every round do not prove progress, so a hard attempt or spend budget is still needed beside failure identity.",
    "A host-side spawn filter narrower than the guard's grammar fails open silently, and the guard never starts to report it."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/javascript/reference/global_objects/promise/race/index.md",
      "result": "'Settling the returned promise does not cancel the losing operations or unsubscribe the handlers attached to their promises.' Supports advisory-guard-fail-mode's 'the deadline bounds the wait, not the handler'."
    },
    {
      "url": "https://github.com/Yeachan-Heo/oh-my-claudecode/blob/e9e8fa3847ce0b3529b84d895e841988c7308f3d/src/hooks/registry/dispatcher.ts",
      "result": "Carried from 2026-09-09, not re-fetched: handler evaluated before the timeout promise, no loser cancellation. Supports the same clarification as observed practice."
    },
    {
      "url": "https://raw.githubusercontent.com/agentscope-ai/QwenPaw/cbf1a4031d71915e0648d6cd2ef864989ccb42ae/src/qwenpaw/loop/gates/runner.py",
      "result": "Carried from the earlier 2026-10-31 record, not re-fetched: stops are deferred until tool results are processed. Supports treating limit stops as legitimate typed yields in continuation-as-state and the golden path."
    },
    {
      "url": "https://code.claude.com/docs/en/hooks",
      "result": "Carried from the earlier 2026-10-31 record, not re-fetched: the if filter is best-effort and the hook runs when the command cannot be parsed. Still supports claude-code--advisory-guard-fail-mode."
    }
  ],
  "documents": {
    "session-continuation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: yield states widened to typed clean exit, rejection, limit stop, required input and cancellation (invariant updated); added that a claim is not acceptance and continuation never widens the accepted scope (new invariant). The meter-across-resume sentence kept, now stated in gate-state-lifetimes."
    },
    "techniques/continuation-as-state.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: yield list now includes limit stop, required input and cancellation with typed reasons; record keyed by session and run, carries accepted scope; lease renewal bounded by a ceiling stated at arming and future timestamps treated as stale; intermediate approval creates no new authority and a model claim is not confirmation."
    },
    "techniques/single-loop-authority.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: one arbiter may compose several evaluators; adopt cannot widen accepted scope (out-of-scope arming is refused); an evaluator's role does not by itself fix authority, the control state names it."
    },
    "techniques/ordered-yield-composition.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: replaced 'the stack terminates because each frame either consumes or passes' with push-depth and continue-round ceilings that pop and re-offer; new section ranks protective refusal and operator cancellation above the order."
    },
    "techniques/advisory-guard-fail-mode.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the timeout now bounds the wait, not the handler (loser keeps running unless cancelled or isolated; synchronous work unbounded; late results discarded); an unidentified hook has an unknown class, is a drift finding, and never defaults to advisory."
    },
    "techniques/ordered-teardown.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: on a failed primary write the record stays resumable but the local loop still stops and reports it; generation or compare-and-swap preferred over a short-expiry tombstone, which a writer paused past expiry defeats."
    },
    "techniques/compaction-checkpoint.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: checkpoint also written at control transitions; restore idempotent and never applied over a newer generation; a missing checkpoint has unknown cause (not asserted to be a failed write); the notepad cannot re-arm control."
    },
    "techniques/sealed-stage-advance.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: inputs declared at invocation and captured in the descriptor are valid; the hash detects inconsistency, not tampering; a completion signal is a claim, not acceptance; compare-before-write requires an atomic CAS or lock; an atomic advance is not reliable dispatch, so advanced-not-started is detected and dispatched."
    },
    "techniques/stuck-loop-detection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: a hard attempt and resource budget kept beside failure identity (changing signatures are not progress); N declared per lane from evidence with flaky failures confirmed; crash-resume limited to sessions that held unexpired continuation authority, within accepted scope and budget."
    },
    "techniques/boundary-applied-stop.md": {
      "disposition": "keep",
      "reason": "The boundary definition, the pending typed stop, the one-iteration lateness bound with its injected-clock test, the will-anyone-read-it question and the not-executed status are coherent. The protective-stop exception is stated. The QwenPaw source confirms the deferral half."
    },
    "techniques/gate-state-lifetimes.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: new section 'Meters survive a suspend and resume' (restore spent meters, never re-arm at full allowance, unknown meter stops the resume) with the 12-of-10 sighting, plus a decision rule."
    },
    "applications/node--advisory-guard-fail-mode.md": {
      "disposition": "reverify",
      "reason": "Its 2026-09-09 source-check section is in place. Live enforcement and the Node runtime were not exercised."
    },
    "applications/process--continuation-as-state.md": {
      "disposition": "reverify",
      "reason": "The source-check section landed with the future-timestamp and cancel-channel caveats. No live harness run."
    },
    "applications/process--sealed-stage-advance.md": {
      "disposition": "reverify",
      "reason": "Corrected to cite the ADR as design evidence. Implementation and delivery remain unverified at runtime."
    },
    "applications/python--boundary-applied-stop.md": {
      "disposition": "keep",
      "reason": "The pinned runner confirms the deferral sorting, the reason-required condition and the absence of any not-executed result. The doc says it read the code and did not execute it, and it states the unhandled refuse-before-dispatch case and the doc/code precedence disagreement."
    },
    "applications/python--gate-state-lifetimes.md": {
      "disposition": "keep",
      "reason": "The pinned channel base confirms commit-on-success-only and discard on error, cancel and exception. The phase-reset misfiling of wall time and tool calls, and the plugin scope gap, are stated as limits."
    },
    "applications/claude-code--advisory-guard-fail-mode.md": {
      "disposition": "keep",
      "reason": "The current hooks reference corroborates best-effort if-filtering, the run-anyway behaviour on unparseable input and one rule per handler, which matches the two-entry fix. The n=1, version-bound proof is disclosed with a re-run condition."
    }
  }
}
```
