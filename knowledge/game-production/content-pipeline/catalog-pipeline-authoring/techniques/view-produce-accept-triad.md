---
layer: technique
type: technique
subject: catalog-pipeline-authoring
technique: view-produce-accept-triad
status: forged
laws: [unmeasured-is-not-a-pass, one-authority-per-quantity, law-and-check-share-one-source]
shared_with: []
use_when: [designing what a production step must declare, a surface that shows one number while grading another, deciding whether a step is done]
---

# The view / produce / accept triad

Every step in a production line declares exactly three faces of one artifact:

- **view** — how the artifact is rendered and edited, declared as a shape plus the
  fields it reads, not as a hand-built screen;
- **produce** — how the artifact is created, as a function from the entity (and the
  operator's steer) to the artifact's data;
- **accept** — how the artifact is graded, as a checker derived from the persisted
  data that returns a status and a reason.

Three faces, one artifact. The declaration is the step; everything else is shared
machinery.

## Why all three, always

Drop any one and the step degenerates in a predictable way.

- **No accept**: the step is decoration. It renders, it produces, and nothing can ever
  say whether it is finished — so the class contributes nothing to any coverage number
  and its completion is a matter of opinion.
- **No produce**: the step is a chore. Somebody must fill it in by hand every time,
  automated authoring cannot touch it, and a walker cannot exercise it.
- **No view**: the step is invisible. The artifact exists and is graded, but no
  operator can see what was made or why it failed, so every correction is blind.

The corollary is that a step must be able to reach a verdict **without opening the next
step**. A step whose doneness depends on a downstream step's state is not a step; it is
half of one, and it should be merged with its other half or given a criterion of its own.

## The coherence rule: the displayed data is the graded data

The failure mode that survives review is not a missing face. It is three faces that
each name different fields. The surface charts a headline number, the checker grades a
different one computed elsewhere, and the operator watches a bar with no relationship
to the verdict. Everything looks right and the system is lying.

State the rule mechanically and enforce it mechanically:

1. **Every field the checker reads must be written by the producer** — with one honest
   exception, a gate that legitimately reads what a later runner or an external bridge
   writes, which must be identifiable as such rather than assumed.
2. **Every field the surface displays must be written by the producer**, with the same
   narrow exception for fields that arrive in an external envelope.
3. **The checker must grade the displayed field itself, or a value living inside it** —
   a mirror of what is on screen, not a duplicate maintained in parallel.

The third rule is the one that does the work, and it is what makes the duplicate-scalar
habit visible: a step that charts a nested figure and grades a top-level copy of it has
two authorities for one quantity, and they will diverge. Let the criterion address the
nested value directly by path so it grades the exact number it draws.

## How to enforce it without running the app

The producer is a pure function of an entity, so it can be executed offline with a
synthetic entity. Run it, then run the checker over a **recording proxy** of the
resulting data: the proxy notes every field the checker touches. You now have three
field sets — displayed, written, read — obtained by execution rather than by parsing,
and the comparison is trivial. Every failure names the class, the step and the field.

This offline linter is the fast complement to an end-to-end walk. It cannot see the
surface-to-persistence seams, but it runs in seconds over the whole corpus, so it can
be a required check on every change rather than an occasional one.

## The selection-step trap

Steps that present generated candidates have a subtle version of the coherence bug that
is worth calling out because it is nearly invisible and repeats across classes.

For a candidate gallery, the field the surface names must be the **selection field** —
the key onto which a chosen candidate's payload projects — and it must equal both the
field the checker grades and the key the candidate generator writes. It must never be
the produced candidate *array*. When it is, choosing a candidate overwrites that array
with a numeric index while acceptance grades a field no selection ever touched: the
step passes or fails for reasons unconnected to what the operator chose. Pin this with
its own regression check, separately from the general coherence rule, because the
general rule can be satisfied by the broken arrangement.

## Ordering criteria inside a composed acceptance

When a step's acceptance is a composition of several criteria, order matters. A
criterion that can legitimately resolve to a deferred, not-yet-measurable status must
be composed **last**, so its deferral cannot mask a sibling criterion that is outright
failing. A composition that reports "deferred" while one of its members is red has
converted a failure into an unmeasured state, which is the exact inversion the
acceptance layer exists to prevent.

Prefer a content assertion over a bare count. "At least six rows" is satisfied by six
empty rows; "at least six rows, each carrying these three fields" is not. A count-only
criterion is one of the few checks that can be green while the artifact is worthless.

## When not to use this

A step that is a pure hand-off — a human physically doing something outside the system —
has no honest producer, and forcing one produces a fabricated artifact. Model it as a
step with a produce that writes only what is known and an acceptance that reports the
unmeasured state truthfully, rather than as a triad with a fake face. And do not split
one deliverable into three steps to make each face simpler: the triad describes one
artifact, and three steps over one artifact means three verdicts about the same thing,
which is worse than one imperfect verdict.
