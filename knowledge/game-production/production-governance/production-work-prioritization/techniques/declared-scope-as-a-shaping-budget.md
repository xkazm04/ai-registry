---
layer: technique
type: technique
subject: production-work-prioritization
technique: declared-scope-as-a-shaping-budget
status: forged
laws: [a-budget-shapes-the-output, a-number-carries-its-unit-and-basis, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [handing a scope figure to a producer human or automated, deriving a part's allowance from a whole's, a delivered part came in far under or far over what was requested]
---

# Declared scope as a shaping budget

State scope as the intended size of the thing, derive a part's scope from the whole's
rather than repeating the whole's allowance, and grade what was delivered against what was
requested. The naive reading treats a scope figure as a ceiling — a line not to cross —
and that reading produces a different plan, and a measurably worse result, than the same
number stated as a target.

The mechanism is not laziness. A process spends what it is given because unclaimed
allowance attracts elaboration: an engineer who is told a part may cost up to some amount
finds ways for it to cost that, and a generative producer told the same thing does so
faster and more thoroughly. A ceiling invites approach. A target invites fit.

## The two readings produce different plans

"Up to twelve" and "twelve" are the same number and different instructions. Under the
first, twelve is success and eleven is unexplained; a reviewer who sees eleven asks what
went wrong. Under the second, twelve is the size of the thing and both eleven and thirteen
are deviations worth a sentence. Only the second reading gives you a signal when a part
comes in *small*, and the small part is the one that is usually thin rather than
efficient.

This matters most where the producer cannot ask a clarifying question. A person told a
ceiling will often infer the intent from context; an unattended producer will not. Hand it
a ceiling and it returns work at the ceiling, every time, for every part, and the result
is a product that is uniformly at its limit and nowhere at its intended shape.

A scope figure is also meaningless without its unit and the stage it is measured at. The
same part measured before and after an optimisation pass, or counted in one primitive
rather than another, differs by more than any tolerance anyone would set. State the unit
and the stage in the declaration, or the number will be honoured against a basis nobody
intended.

## Derivation: a part's scope comes from the whole's

The characteristic failure is the **repeated allowance**. A whole is allotted some amount.
Each part is then briefed with that same amount — because it was the number written down,
and nobody stated a smaller one — and every part is delivered inside its stated budget by
a producer that broke no rule. The assembled whole overruns by roughly the number of
parts, and there is no single place to point at.

The rule is therefore mechanical: **when a whole is allotted an amount and contains parts,
each part's declared scope is a division of that amount by the weight of the part's role.**
The weights are the argument and the numbers are the consequence, so publish the
derivation alongside the parts — a part-owner who can see why theirs is what it is will
argue about the weight, which is the productive argument, instead of quietly ignoring the
number.

A part with no declared scope of its own inherits nothing. This has to be said out loud,
because to a producer that must produce something, an undeclared budget reads as the
nearest declared one — which is the whole's. An undeclared part is an omission to be
reported, not a slot to be filled with the parent's figure.

## Grading: both directions, against the request

A delivered part is graded against the **requested** size, not against the class ceiling,
and the comparison runs in both directions. Over is the obvious defect. Under is the
interesting one: a part delivered far below its request is either thin work or evidence
that the request was wrong, and both need saying. A single-sided check — under the ceiling
means pass — cannot distinguish them, and so it systematically rewards the thin result.

The residual matters too. When the parts are delivered, the difference between the whole's
allotment and the sum of what arrived is a real quantity that somebody owns; it is either
reclaimed deliberately or it is quietly absorbed by whichever part is worked on next.

## Procedure

1. **State the whole's scope as an intended size**, with its unit and the stage it is
   measured at.
2. **Enumerate the parts and their role weights before deriving any number.** Deriving
   first and rationalising the weights afterwards produces weights that cannot be argued
   with, which is the same as having none.
3. **Divide, publish the derivation, and give each part its own declared figure.** Never
   restate the whole's number at a part.
4. **Hand the producer the intended size.** Where a hard ceiling also exists it is a
   separate, labelled number, and it is not the one shown at authoring time.
5. **Grade delivered against requested in both directions**, with a stated tolerance, and
   report which way the deviation went rather than collapsing both into pass or fail.
6. **Report the residual** — the unspent or overspent remainder of the whole — as a number
   with an owner. When the derived parts do not sum to the whole, that discrepancy is the
   report, not a rounding to be hidden.

## Decision rules

- **When a producer asks how much it may spend, answer with the intended size, never the
  ceiling.** It will spend what it is given, so what you give it is a design decision.
- **When a part is added after derivation, re-divide the whole.** A part appended at the
  whole's allowance is the repeated-allowance failure arriving one item at a time.
- **When a delivered part is under its request beyond tolerance, inspect rather than
  congratulate.** The saving is real only if the request was wrong, and that is a finding
  about the plan.
- **When only a ceiling has ever been stated for a class, treat that class as unbudgeted
  and say so.** "Within the ceiling" is not evidence of an intended size; reporting it as
  compliance hides that nobody has decided what the thing should be.
- **When an unattended producer must choose between delivering every part at its intended
  size and delivering some at the ceiling, it delivers at intended size and reports the
  residual.** The choice is not its to make and the residual is the report that lets
  someone else make it.

## When not to use this

- **Where scale carries no real cost.** A budget over something whose size changes nothing
  downstream shapes nothing, and it will be maintained for its own sake until someone
  stops.
- **Before the first of a class exists.** An intended size declared with no grounds is a
  number that will be obeyed and wrong, which is worse than an open question. Make one,
  measure it, and declare the class from what it taught you.
- **Where the figure is an external hard limit** imposed by a platform or a contract. That
  is a genuine ceiling and belongs in a conformance conversation — but an intended size
  still has to be declared beneath it, or the whole class drifts to the limit.
- **As a proxy for quality.** A part that hits its intended size exactly can still be
  placeholder work. Scope discipline decides how much of a thing there is; it says nothing
  about whether the thing is any good.
