---
domain: software-engineering
subject: session-continuation
last_touched: 2026-09-02
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
