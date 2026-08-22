---
layer: technique
type: technique
subject: public-claim-provenance
technique: presentation-invariants-on-derived-values
status: forged
laws: [failure-not-empty-success]
shared_with: []
use_when: [a live count is rendered against a hand-authored target, a progress bar could exceed its track, a ratio can divide by zero, one flag drives several parts of one component]
---

# Presentation invariants on derived values

The moment one half of a displayed pair updates without a human, the pair can
reach combinations nobody drew. The values are each individually correct; the
*presentation* is not defined for their combination, and the rendering does
something — clamps, overflows, or emits a non-number — with no error and no
signal. These are the invariants that must be stated as rules and asserted
where the pair is declared, because by the render site only the ratio is left
and the two halves can no longer be compared.

## Every target sits at or above its live count

A hand-authored target and a derived count drift toward each other from
opposite directions: the count grows as the product ships, the target sits
still until someone revises it. Eventually the count passes it.

What happens next is never good and is usually invisible. A width computed as
count over target renders past its track, breaking the layout — the loud
failure, and the lucky one. Or the width is clamped and the bar sits at full
while the surface reports "62 of 60", which is the quiet failure: the reader
sees an internally inconsistent claim and cannot tell which half to believe.
Or the ratio is clamped *and* the count is clamped to the target, at which
point the surface is under-reporting real work and nobody will ever notice,
because the number went down without an event.

The invariant is stated where both halves are visible — the declaration that
holds the targets — as a rule with a consequence: **a target below its live
count is not a rendering problem, it is a stale target**, and the fix is to
raise the target, never to clamp the display. Assert it: a table that must
satisfy `target ≥ live` for every row is mechanically checkable at build, and
that check is the only thing that will catch the day the catalog overtakes the
goal.

Clamping still belongs in the renderer as a floor against the impossible, but
clamping is a seatbelt and not a policy. A clamp that silently absorbs an
inverted pair converts a stale-target incident into a permanently wrong page.
Clamp *and* fail the build.

## Guard the empty denominator at its single computation

Zero over zero is not a number, and the value it produces is not an error —
it is a well-formed thing that flows through arithmetic silently until it
reaches a rendering. This is the case
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) is about
at pixel scale: "nothing to measure" and "measured, none of it done" are
different facts, and the naive arithmetic spells them the same way or worse.

The damage is asymmetric in a way worth internalising. The *visual* rendering
usually survives: a bar of non-numeric width collapses to zero width, which
looks exactly like honest zero progress, so every screenshot review passes.
The *non-visual* rendering does not: the accessibility attribute that carries
the value to assistive technology receives the garbage verbatim, and the
surface becomes broken or nonsensical for precisely the readers who cannot see
that it is broken. A defect that is invisible to sighted review and total for
everyone else will live for years.

So: one computation of the ratio, guarded there, returning a defined value for
the empty case — and the guard's comment says what it protects downstream, not
merely that it protects something, because the next author will otherwise
inline the division and rediscover the bug. Where the honest answer is "there
is nothing here", the surface says that instead of rendering a zero-length bar
that claims a measurement of nothing.

## One condition flips every dependent presentation

A public surface's state usually rides on a single condition: is this section
complete, is this data live, is this cohort included. That condition typically
drives more presentation than anyone remembers — the count, the total, the
percentage, the accessible value, the bar geometry, and the pluralised prose
beside it are six separate renderings of one fact.

The rule is that they read the same source or none of them do. A surface with
six dependents where five switched is worse than one that never switched at
all: a consistently stale surface is merely out of date, while an internally
contradictory one — a bar at 40% beside the words "all four shipped" — reads
as a lie, and the reader has no way to work out which half was neglected. The
structural form is to derive the whole presentation set from the condition in
one place and hand the component a resolved set, rather than letting each
element re-ask the question and letting one of them be added later by someone
who re-asked it differently.

The screen-reader value is the reliable canary. If the number reaching an
assistive rendering can differ from the number a sighted reader sees, there
are two doors onto one claim, and the second one is unreviewed.

## Decision rules

- **When a hand-authored bound and a derived value disagree, the derived value
  wins and the bound is the bug.** The catalog is the world; the target is an
  opinion about it.
- **When a guard has to choose a fallback, prefer the value that renders as
  absence over the value that renders as a claim.** Zero is a claim. A dash,
  an omitted bar, or an explicit "not started" is not.
- **When an invariant can be asserted at build, assert it at build.** Runtime
  clamps protect the reader; build assertions protect the truth. They are not
  substitutes and a surface wants both.
- **When adding a new element driven by an existing condition**, find the other
  elements it drives before adding it. This is the single most common way the
  lockstep rule is broken, and it is broken by addition, not by edit.

## When not to use this

A pair of values that are both derived from one catalog cannot invert, and a
ratio whose denominator is a constant cannot be empty; asserting invariants
over them is noise. The technique's weight belongs where provenances are
mixed — one half moving on its own, one half held by a human — because that is
the only configuration in which the combination can surprise both of them.
