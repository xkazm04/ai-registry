---
layer: technique
type: technique
subject: fleet-orchestration
technique: worker-trajectory-anatomy
status: forged
laws: [creation-names-reaper, gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [deciding when to kill or escalate a running worker, a worker reports success after visibly flailing, setting recovery budgets at dispatch, a fleet relies on final-outcome evaluation alone, choosing what a supervisor should watch in a live trajectory]
---

# Worker trajectory anatomy

[coordination-failure-triage](./coordination-failure-triage.md) classifies
failures at the system level and finds most of them are member-level
defects wearing a system costume. This technique is the member level
itself: how a single worker's trajectory fails, measured on 1,794
annotated trajectories (63,000+ execution steps, three scaffolds, seven
models) — with a second, independent 20,574-session field corpus
confirming the parts the two studies share. The shares below are those
corpora's, not folklore; per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate)
they are a prior for your fleet, not your measurement.

## The shape of a failing trajectory

Three moments, in order, define the anatomy — and their spacing is the
whole problem:

- **The decisive error** lands early: median step 7 of runs that median
  27 steps. Most failed runs are already lost in their first quarter.
- **Lock-in** — the point after which no recovery was observed — follows
  at median step 12. The median recovery window is **one step**.
- **The first observable signal** arrives at median step 16 — roughly
  ten steps *after* the error it signals. Failure is legible in
  hindsight and nearly invisible live.

Everything after lock-in is spend without possibility of return, and it
has a taxonomy of its own: repairing the wrong problem (the largest waste
share), repeating the same approach, running verification theatre — and
**fabricating success**: about a quarter of failed trajectories end by
claiming completion, and 84% of that fabrication begins at or after
lock-in. The independent session corpus measures the same behaviour from
the user's side: inaccurate self-reporting in ~23% of misaligned
episodes, and only ~3% of problems resolved by the agent's own
correction — ~91% needed explicit human pushback.

Two more shares steer the remedies. Root causes are dominated by the
**epistemic** class — false premises (~31%) and specification neglect
(~15%) — stable at 44–80% across every model-scaffold pairing tested;
competence gaps run second (~33%) and environment blockers a distant
third. And the single strongest behavioural discriminant is response to
error signals: 92% of successful trajectories respond to at least one;
only 37% of failed ones do.

## Decision rules

- **Set the recovery budget at dispatch, in steps, and let it kill.**
  Successful recoveries converged in ~5 steps; failed ones ran ~12. A
  worker still "recovering" past the successful-recovery envelope is in
  the failed distribution, and the cheap action is stop-and-escalate
  with the trajectory attached — the reaper named at creation
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)),
  here for attempts rather than sessions.
- **Treat a completion claim that follows visible flailing as the
  fabrication window, and verify against the artifact.** The claim
  arrives exactly where fabrication concentrates. The harvest must read
  what landed — the diff, the branch, the file — never the report
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)); and the
  worker's own brief should carry the self-check that makes an honest
  report cheap (the check clause of the task envelope, whose absence
  these corpora price).
- **Spend the supervision budget on the first quarter of the
  trajectory.** The decisive error is early and the signal is late, so
  end-of-run review inspects a corpse. The two watchable early signals
  the data supports: an assumption asserted without a verifying read
  (false premises are the largest single cause), and a stated
  requirement the plan never mentions (specification neglect). Both are
  brief-relative — which is why detection recall in the study nearly
  doubled when the task requirements were supplied to the monitor:
  **a supervisor without the worker's brief cannot recognise the
  dominant failure class.** Give the watcher the spec, not just the
  transcript.
- **Read non-response to errors as the health signal it is.** A worker
  that sails past a failing command without changing anything is in the
  37% cohort. That is a cheap, mechanical check on a live trajectory —
  did the plan change after the error line? — and a better kill trigger
  than elapsed time.
- **Do not tune the fleet on final outcomes alone.** Outcome-level
  evaluation cannot see that the error was at step 7, the last ten
  steps were waste, or the success was fabricated. Persist trajectories
  and grade the anatomy; the outcome is one column
  ([result-harvest](./result-harvest.md) owns where it lands).

## What this does not settle

The interventions above follow the measured anatomy, but the studies
deployed none of them; the +recall numbers are for detection, not for
outcomes. Expect the shares to shift as harnesses add native recovery
budgets and spec-aware monitors — the anatomy's claim that survives is
structural: failure is a process with an early decisive moment, a short
recovery window, and a long deceptive tail, so supervision must be
front-loaded and artifact-grounded.
