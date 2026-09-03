---
layer: technique
type: technique
subject: motion-quality-gating
technique: genre-response-latency-norms
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass, one-authority-per-quantity]
shared_with: []
use_when: [setting responsiveness budgets per action class, publishing a norm table next to project data, a clip cannot be mapped to an action class]
---

# Genre response-latency norms

Responsiveness is the one axis of motion quality that has real numbers on it. The
budget is the interval from the player's input to the first frame that visibly answers
it, and comparable shipped products in a genre converge on similar figures because
player perception, not technology, sets them. A workable action-game ladder: locomotion
around fifty milliseconds, a hit reaction around a hundred, a dodge around a hundred
and fifty, an attack around two hundred. Each is the budget for that action class, in
seconds of wall-clock time, measured from input to visible response.

Those numbers are a rubric. They describe what the genre is held to. They are not, and
must never be presented as, a measurement of your build.

## Self-labelling is the technique

Write the disclaimer into the artifact that holds the numbers, adjacent to the numbers,
in words a reader cannot miss: *this is the standard the genre is judged against; it
describes the genre, never this project*. Then keep it attached when the table is
rendered, exported or summarised.

This sounds like documentation hygiene and it is a correctness rule. A norm table
placed beside project data acquires the appearance of an audit result within one
reading. Somebody screenshots it, somebody else reports that the game meets its
responsiveness targets, and no one measured anything. The failure is not that the
numbers are wrong — they are right — it is that a rubric has been laundered into a
measurement, and a measurement is what decisions get made on.

The hard version of the same rule: a norm table must never be folded over sample data
at load time to produce standing verdicts. A component that computes its grades from
fixtures the moment it is imported will display a confident, specific figure and a
verdict word for a project it has never read. Make the evaluation a function of the
timings it is handed, so that with no timings it returns nothing.

## Every derived number states what it was derived from

A responsiveness figure is assembled from parts, and the parts have different
epistemic status: some are read from real project data, some come from a declared
design contract, some are simply unavailable. So each result carries, in plain
language, which read values produced it and where they were read from.

The rule that follows is absolute: a term that is unavailable is omitted, never
estimated. If the blend duration into a state is not recorded anywhere, the blend
duration is not in the figure — and the figure says so. If the input pipeline's own
contribution is not instrumented, it is not a plausible constant added for realism. A
latency number assembled from one measured term and two invented ones has a unit, moves
when the real term moves, and is fiction; nobody downstream can separate it from a real
one. When removing the invented terms leaves the function returning nothing for most
inputs, that is the correct result, not a regression.

Distinguish the two honest sources explicitly. The transition topology — which states
can interrupt which, where the cancel windows sit — is usually a declared design
contract rather than a scan of the shipped configuration, and saying so is the
difference between "this is our design" and "this is what your project does".

## Unclassified beats defaulted

Mapping a clip to an action class is pattern work on names and metadata, and it fails
regularly. When it fails, report the clip as unclassified and count it. Do not fall
back to the most common class: a wrong class puts a real, correct duration against the
wrong budget and the wrong transition, and the substitution leaves no trace in the
output. An unclassified list is a visible gap someone can close; a defaulted class is
an invisible error that grades as a pass or a fail at random.

Order the classification patterns most-specific first and let the first match win.
Overlapping vocabularies are the norm — a name can plausibly read as several classes —
and an explicit precedence order is a reviewable decision, while an implicit one is a
bug waiting for a rename.

## Decision rules

- **One authority for the budget.** The norms live in one table that both the report
  and any check read from. A second copy in a document drifts, and the drift is
  undetectable from either side.
- **When a class has no norm, mark the comparison as ungauged.** A general fallback
  budget applied silently is the defaulting failure wearing a different hat. If a
  fallback exists at all, it must be labelled as a fallback wherever the grade appears.
- **Re-derive norms when the genre's reference products move, not when a build misses
  them.** A budget adjusted because the project could not hit it has stopped being a
  standard.
- **Grade the gap, do not just flag it.** "Over budget" is less useful than a ladder
  saying by how much and what that reads as to a player. The ladder is part of the
  rubric and inherits the same disclaimer.

## When not to use it

- **In a genre where deliberate commitment is the design.** Slow, weighty combat sells
  its long windups; measuring it against a fast game's budget grades the design rather
  than the execution. Derive norms from the products the game is actually competing
  with.
- **For non-interactive motion.** Cinematics, ambient loops and idle variations answer
  no input. A latency budget for them is a category error.
- **As a substitute for a measured frame-time trace.** These norms are a design target.
  What the player experiences also includes presentation and input latency that only
  instrumentation on the real build can see.

## The failure this prevents

A panel shows a table of norms next to a list of the project's clips. It reads as a
report card. It is a rubric beside an inventory, joined by nothing. The project ships
believing its responsiveness was validated, and the first external playtest describes
the combat as sluggish — a fact that was never in the data because the data never
contained a measurement.
