---
layer: technique
type: technique
subject: register-bytecode-execution
technique: fixpoint-pass-with-iteration-cap
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [adding an optimisation pass to a compiler that already runs one, a pass enables itself and nobody knows how many times to run it, an optimiser's statistics report a number that could mean changes or sweeps]
---

# Fixpoint pass with iteration cap

An optimisation pass over a syntax tree or an instruction stream is a rewrite that may
create its own next opportunity: folding a constant subexpression exposes a constant
comparison, which exposes a constant branch. The technique runs the set of passes as a
loop to a **fixpoint**, stopping when a full sweep changes nothing, and gives the loop
two properties the naive loop lacks: a cap on the iteration count, and statistics that
tell a pass that mutated apart from a pass that only confirmed.

## The loop

Each pass returns whether it changed anything. The loop can sit at either of two
altitudes. Around a single pass over a single node, it re-runs that pass on that node
until a run changes nothing, which is the right shape for a rewrite that mostly enables
itself (folding, reduction) applied bottom-up during one walk of the tree. Around the
whole pipeline, it re-runs every pass over the whole tree until a full sweep changes
nothing, which is needed when one pass enables a *different* pass that ran earlier in
the sweep. A pipeline that only has the inner loop relies on pass order for the
cross-pass cases: the eliminating pass runs after the folding passes have finished on
the node's children, and a fold the elimination exposes in the parent is caught because
the walk has not reached the parent yet. That ordering is a proof about the walk and it
should be written down beside the order, because the day a pass is added that enables a
parent it has already left, the inner loop is no longer enough and the outer one is
needed.

The fixpoint is the right stopping rule because a fixed count is wrong in both
directions: too few and the program compiled today is not the one compiled after a
harmless refactor moved a constant; too many and the compiler sweeps a large function
that stopped changing on the second pass. "Until nothing changes" is the only count that
is correct for every input.

## The cap

A pair of passes can undo each other's work (one canonicalises a form the other
un-canonicalises), and a pass with a bug can report a change without making one. Either
turns the fixpoint loop into an infinite loop, and an infinite loop in a compiler is a
hang in the user's editor. The cap turns it into a **report**: the optimiser stops, and
its statistics show the cap was reached, which is the signal that two passes disagree.
The cap's value is a small number chosen with a stated reason (the deepest chain of
mutual enablement a real program has been seen to need, plus margin); it is not a
tuning knob and a program that reaches it is a bug report about the passes, not an
argument for raising the number.

## The statistics carry their predicate

An optimiser that reports "ran 10 times" has reported a number with no predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). The reader
cannot tell whether the program was rewritten ten times, rewritten once and confirmed
nine times, or hit the cap. The technique keeps two counters per pass, **mutating** and
**checking**: a sweep in which the pass changed something increments the first, a sweep
in which it ran and changed nothing increments the second. "Constant folding: 2
mutating, 1 checking" reads as what happened: two rewrites, then the confirming sweep
that ended the loop. The counters are **counted, not derived**: the tempting shortcut
records only invocations and total sweeps and prints mutating as the difference, on the
theory that every invocation ends with exactly one checking sweep. That theory is false
in precisely the case the statistics exist to expose, a loop that hit the cap, whose
last sweep mutated and is reported as checking. The cap-hit is reported as its own line
for the same reason, because a reader who has to infer it from a count equal to the cap
will not.

The statistics are printed on request, not always; where the runtime exposes the
optimiser to the guest for testing, the switch and the counters are the surface it
exposes, and a test that asserts "folding happened exactly once on this input" is a
test on the mutating counter.

## Decision rules

- When a pass can enable itself or another, run the passes in a loop until a full sweep
  changes nothing; never a fixed number of times, because no fixed number is right for
  every input.
- When looping to a fixpoint, cap the iterations at a small stated number and treat a
  run that reaches the cap as a defect in the passes, because a loop that may not
  converge is a hang.
- When reporting, count mutating sweeps and checking sweeps separately per pass, and
  count them rather than deriving one from the other, because a single count cannot be
  read as changes or as sweeps, and a derived split is wrong exactly when the cap was
  hit.
- When the cap is reached, say so in the statistics as its own line, because a reader
  will not infer it from a total.
- When a pass returns "changed", require that it changed something the next sweep can
  observe, because a pass that reports change without making it defeats the fixpoint and
  is found only by the cap.

## When not to use it

A single pass that cannot enable itself runs once. A pass pipeline whose ordering is a
proof (each pass's precondition is the previous pass's postcondition, and no pass
re-enables an earlier one) is a sequence, not a fixpoint, and adding a loop to it
obscures the proof. The technique is for the optimiser that has grown past one pass and
has not yet grown an ordering proof, which is most of them.
