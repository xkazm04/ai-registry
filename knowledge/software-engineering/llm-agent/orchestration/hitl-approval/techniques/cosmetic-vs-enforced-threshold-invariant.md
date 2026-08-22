---
layer: technique
type: technique
subject: hitl-approval
technique: cosmetic-vs-enforced-threshold-invariant
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [a row turns urgent later than the machine acts on it, two threshold tables maintained by discipline alone, deciding where to assert a relation between two tables]
---

# Cosmetic vs enforced threshold invariant

Every queue that ages its items ends up with **two** ladders, and the second
one arrives so quietly that most systems never notice they have it. The first
is the enforcing ladder: the deadlines at which the machine takes a terminal
action. The second is cosmetic: the elapsed times at which a row starts looking
urgent to a human — the color change, the badge, the move to the top of the
sort, the word "overdue". They are built by different people at different
times, they live in different modules, and they are tuned for different
reasons. The invariant that binds them is one sentence, and asserting it is
worth more than any amount of documenting it.

## The invariant

**For every severity, the cosmetic threshold fires strictly earlier than the
enforcing one.** Not at the same time and never later. The window between them
is the operator's opportunity: the interval during which the interface says
"this needs you" and the machine has not yet decided on its own.

Invert it and the system produces its worst available outcome. The machine
escalates, or auto-approves, or otherwise acts — while the row on the screen
is still rendered calm. The operator, scanning a queue and correctly reading
its colors, sees nothing that needs them, and behind the calm color the
mechanism is taking terminal actions in their name. This is the proxy failure
in its purest form: the operator's judgment is a gate, and the thing that gate
observes is the styling, which diverges from the enforcement clock at exactly
the moment the divergence costs something
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The cost is not only the individual item. An operator who twice discovers that
things were decided while the queue looked fine learns that the colors do not
mean anything, and after that the cosmetic ladder is dead weight on every
screen it appears on. Urgency styling is a promise about the machine's
behavior; break the promise and you have not merely failed to help, you have
removed an instrument.

Equality is a violation, not a boundary case. A cosmetic threshold equal to the
enforcing deadline gives the operator a window of zero — the row turns red in
the same instant the sweep resolves it — and a strict inequality is the weakest
form of the invariant that still means anything. The useful form is stronger:
the window should be long enough that a human who checks the queue on their
normal cadence sees the warning at least once before the machine acts, which
makes the margin a policy number worth writing down beside the thresholds
rather than an accident of two independent tunings.

## Assert it at load, do not document it

This is the load-bearing half of the technique, and the reason it is a
technique at all rather than a footnote on the ladder.

An invariant between two tables is an invariant **no single edit sees both
sides of**. Someone shortens an enforcement deadline because an incident showed
the old one was too slow; they are editing the policy module and there is
nothing in front of them about styling. Someone else softens the urgency ramp
because the queue looked alarmist in a review; they are editing the display
module and there is nothing in front of them about deadlines. Both edits are
locally correct, neither author is careless, and the invariant is broken by the
second one — silently, because nothing anywhere compares the two tables.
Discipline does not survive this shape. A comment saying "keep these in sync"
is a request addressed to a person who is not looking at it.

So the relation is **executed**, at the moment the module that owns both tables
is first loaded, before a single row renders and before the first sweep runs:
walk the severity vocabulary, compare the two values for each member, and
refuse to come up if any pair violates the relation. Three properties make the
assertion worth its lines:

- **It fires at load, not at the crossing.** An invariant checked when the
  first item happens to cross a threshold is an invariant checked in
  production, at whatever hour that item arrives, in front of a user. Checked
  at load, the same defect surfaces the first time anybody starts the thing —
  in a test run, in review, on a developer's machine.
- **It fails, it does not warn.** A warning about a broken safety relation is
  a line in a log nobody reads, and the system proceeds to act early on a calm
  screen anyway. The failure has to be the loud kind
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)) —
  a system that cannot honor the invariant must not be a system that runs and
  hopes.
- **The message names the consequence, not the numbers.** "Threshold mismatch
  for severity `critical`" tells the next engineer what does not match; it does
  not tell them why anyone cared. The message that gets the defect fixed
  correctly, rather than fixed by loosening the assertion, is the one that
  states the outcome being prevented: the machine acting while the row still
  looks calm. An assertion whose rationale lives only in the head of whoever
  wrote it is an assertion someone will delete to make a build green.

## An assertion is only as live as its module

The one way this technique is commonly defeated is worth stating on its own,
because it defeats a correct assertion with a correct message: **the check runs
at load, so it runs only if something loads it.** Put the assertion beside the
cosmetic table — which is the natural place, since that is the module that had
to import the enforcement table to compare against — and it is guarded by the
display path. Then ship the enforcing sweep before the urgency styling, or
build a second surface that renders the queue without the ramp, or simply
delete the last component that imported the cosmetic module, and the assertion
becomes unreachable code that passes review, passes the type checker, and never
executes. The machine is now acting on a table nothing validated, and the file
that proves otherwise is sitting right there in the tree.

So place the assertion **on the side that acts**. The enforcing module is the
one that must not run unguarded; it is loaded whenever the terminal action is
possible, which is exactly the condition under which the invariant matters.
Better still where the codebase allows it: keep both tables in one module, so
the relation lives with its operands and the edit that changes one is an edit
that sees the other. Either way, the test of the placement is a question worth
asking out loud — *can the enforcing path run in a process where this file was
never loaded?* If yes, the assertion is decoration with an exception type.

## Both directions of the gap are wrong

The invariant bounds one side; judgment bounds the other. A cosmetic ladder
that fires far too early is a second way to destroy the same instrument — when
every row is red within minutes, redness is the background color and the
operator filters it out exactly as they would filter a broken one. Only the
strict-inequality bound is cheap enough to assert mechanically, which is a
reason to assert that one and *not* a reason to believe it is the whole rule.
The cosmetic ladder may also be richer than the enforcing one — several visual
steps where enforcement has a single deadline — and the invariant then binds
its **last** step: however many stages the ramp has, all of them are inside the
window.

## What this owns, and what it borrows

The enforcing side of the comparison is the severity SLA ladder's table, and
that technique owns its shape, its rungs, and the terminal action set. This
technique owns only the *relation between the two tables* and the machinery
that keeps the relation true, which is why it is separate: the enforcing ladder
is complete and correct on its own, and can be shipped by a team that has no
urgency styling at all. The invariant appears the moment styling does, and it
appears in a module neither table's author considers theirs. Generalize it with
care but do generalize it — wherever two tables key off one closed vocabulary
and must stand in a fixed relation, the relation belongs in code that runs, not
in prose that is read
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
