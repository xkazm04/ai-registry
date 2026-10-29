---
layer: technique
type: technique
subject: concept-scene-parity
technique: refine-or-pivot-with-every-round-kept
status: forged
laws: [no-gate-self-certifies, a-verdict-is-bound-to-its-content]
shared_with: []
use_when: [a look or an asset is improved by repeated build-and-review rounds, every round's verdict is either pass or try again, the latest round is assumed to be the best one, a round reversed what the previous round improved, scores rose for a few rounds and then flattened]
---

# Refine or pivot, with every round kept

The named concern: a build-and-review loop for a look or an asset usually offers one verdict
besides pass, and that verdict means "try again". Try again means refine: the builder keeps its
approach and polishes the parts the reviewer named. When the approach itself cannot reach the
target, refine can only move the total around inside the approach's ceiling. Meanwhile the loop
treats the newest round as the current state. A round that made things worse replaces a better one,
and the series ends on whatever the last round produced. Two decisions fix this, and both are made
after every review: which kind of change the next round makes, and which round is the current best.

## Two kinds of "not yet"

The review returns one of two non-passing verdicts, never a bare "try again":

- **Refine.** The approach can reach the target. The findings say what to fix in the execution, and
  the next round fixes them inside the same approach. A refine verdict carries its findings and a
  bound on how many fix rounds it gets (one or two) before it must become a pivot or a stop.
- **Pivot.** The approach cannot reach the target or the budget. The next round changes the plan,
  not the execution: a different route (a kit, a script, a generator, a person), a different tool, a
  different technique for the same element, or a different brief. A pivot goes to the owner of the
  brief when the brief itself must change.

The reviewer, not the builder, chooses between them, and has to say which it is. A reviewer that
can only say "try again" will, round after round, ask a capped approach for more polish.

## When to call pivot

- An element has been refined for two rounds and its score has not moved by more than the panel's
  spread (the plateau rule of the subject).
- The findings repeat in kind across rounds: the same defect comes back in a new form after each fix,
  such as a hand that reads as wood, then plastic, then cardboard.
- The element's cap sits in a stage the approach does not control: the generator cannot produce what
  the element needs, however it is prompted.
- A refine round would reverse the previous round's gain to answer this round's finding. That is two
  panels disagreeing about taste, not a defect, and it goes to the owner rather than into the build.

## Keep every round, and name the best one

Scores across rounds rise and then flatten, and the path is not monotone. A middle round is
regularly better than the last. So:

1. **Every round is kept as a checkpoint:** its build, its captures and its marks. A round is never
   overwritten by the next one.
2. **After each review, the current best is named explicitly.** That is the round with the highest
   reading on the judged elements, by the instrument the decision uses (in the owner's units if the
   panel is anchored). The next round branches from the current best, not from the latest.
3. **A regression is reverted, not built on.** A round that scored below the current best on the
   element it changed is set aside, and its finding goes into the next round's brief as a constraint.
4. **The series ends on the best round,** not the last, and the record says which round that was.

## What it changed in practice

One look series ran nineteen rounds whose only non-passing verdict meant "polish more":
- The player's hands were refined for eight rounds. They moved from wood grain, to plastic, to
  cardboard, to smeared highlights, and never reached a passing style score. The same defect class
  came back after every fix, which is the pivot signal above.
- One round changed an effect to answer a panel's preference. The next panel preferred the version
  it had left, and the round was lost. A round-over-round reversal was being treated as a defect.
- The highest-scoring build was the second-to-last round. The series ended one round later on a
  lower build, and only an explicit current-best record kept the better one recoverable.

A pipeline that gates every asset stage gives the reviewer three verdicts: approve, revise (one fix
round on high-confidence findings, then the user), and reject, meaning "the approach cannot reach the
reference or the budget: change the brief, the route or the tool". A generator-evaluator loop with a
standing instruction to refine when scores are trending well, or pivot to an entirely different
direction when they are not, produced its strongest results from the pivots. It also showed
middle iterations that a person preferred over the final one.

## Decision rules

- **When a review can only say "again", add the pivot verdict before the next round.**
- **When an element has been refined twice without moving, the next verdict is pivot or stop,**
  never a third refine.
- **When the next round would undo the last round's gain, ask the owner.** Do not build it.
- **Branch every round from the named current best,** and end the series on it.

## Cost

One field in the review (refine or pivot), one record (current best) and storage for every round's
captures. The saving is every round spent polishing an approach that had already reached its cap.

## When not to use this

- **For a single-shot asset with no review loop.**
- **When rounds are cheap and fully reproducible from a seed.** Keeping only the inputs then retains
  every round, but the current-best record is still owed.
