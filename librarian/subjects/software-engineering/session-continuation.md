---
domain: software-engineering
subject: session-continuation
last_touched: 2026-09-04
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
