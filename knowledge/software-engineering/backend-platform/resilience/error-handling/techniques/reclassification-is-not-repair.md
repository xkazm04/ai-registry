---
layer: technique
type: technique
subject: error-handling
technique: reclassification-is-not-repair
status: forged
laws: [deletion-is-not-repair, failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
use_when: [a failure class declared unreachable turns out to be reachable, deciding between assigning a real error code and fixing the caller, using your own test suite as a detector for internal errors, an internal-error count is being reported or driven to zero]
---

# Reclassification is not repair

Most taxonomies carry one member whose entire value is that it **never fires**:
the internal class, the assertion class, the "this cannot happen" code. It is
not the catch-all. The catch-all ([taxonomy-design](./taxonomy-design.md)) means
*we did not recognize this failure*; the internal class means *we recognized it
and it is impossible*. Those are opposite claims, and they need opposite
handling.

## The class you can run a detector over

Because its declared rate is zero, the internal class is the one failure kind
where **any occurrence at all is a defect report** — which makes it the only
category you can detect mechanically without building anything. Run the suite
you already run, watch for the internal code, and every hit is a place where
something declared unreachable was reached, complete with the query or input
that reached it and the exact site that raised it.

This is close to free, and it is the strongest argument for keeping the class
distinct in the first place. A taxonomy that folds "impossible" into a generic
error kind gives up a detector it was already paying for.

## The repair fork

A hit gives you a proven-reachable internal error. There are exactly two
repairs and **they are not interchangeable**:

- **The declaration was wrong.** The condition is genuinely something a caller
  can produce through a supported interface with values that interface accepts.
  It was never internal. Assign it a real class, and the taxonomy is now more
  correct than it was.
- **The declaration was right.** Reaching this condition requires some caller to
  have already produced a value it should never have produced. The error is
  correctly classed; the defect is upstream, at the call site, and that is what
  gets fixed.

Choosing the first by default is the failure this technique exists to name.
Assigning a friendly class to a condition that only an internal bug can produce
does not fix anything — it states something false about the failure, retires the
detector's ability to ever see that class again, and closes the finding. It is
[deletion is not repair](../../../../_laws.md#deletion-is-not-repair) in the
taxonomy's own vocabulary: the artifact that exposed the defect is removed and
the defect stays.

**The test that separates them** is not how the error looks at the boundary, it
is who can produce the input:

> Can a user reach this condition through a documented interface, using values
> that interface accepts? If yes, the class was wrong. If reaching it requires
> an internal caller to have already computed something nonsensical, the class
> was right and the caller is the bug.

**The tell that you are reclassifying wrongly**: the class you are about to
assign describes the *symptom where it surfaced* rather than the *cause where it
originated*. A sentinel or zeroed identifier arriving at a lookup is not an
invalid argument from a user — no interface accepts it — it is a computation
upstream that produced a value it had no business producing, and labelling the
lookup's complaint an input error blames the messenger
([failure is not empty success](../../../../_laws.md#failure-not-empty-success)).

Whichever repair is chosen, it is chosen **once, in the taxonomy's one
authority** ([one authority per vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
not by each call site deciding locally what to raise.

## When not to use this

Do not run the detector against a suite that reaches internals directly. A test
that calls an internal entry point with a deliberately invalid value will raise
the internal class correctly, and counting it as a finding manufactures work.
The detector is only meaningful over inputs that arrive through the interfaces
users actually have.

Do not drive the internal-error count to zero as a goal. The cheapest way to
meet that target is to reclassify every hit, which is precisely the move above,
and a team that has done it has traded a working detector for a number. Report
the count with the suite and the surface it was measured over
([a count carries its predicate](../../../../_laws.md#count-carries-predicate)).

Do not expect the fork to find anything in a taxonomy that has already been
split deliberately. Where the internal class is narrow, documented as
*unexpected* rather than *unhandled*, and constructed only at sites a user
cannot reach through any accepted input, every hit the fork examines will come
back "declaration was right" — measured on one such tree, three of three. The
technique still has value there, but it is the detector and not the fork: the
class is correct and nothing is watching it.

Do not apply this where the internal class is the default fall-through rather
than a declared never-fires member. If everything unrecognized lands there, it
is the catch-all wearing the wrong name, its rate is not declared zero, and
[taxonomy-design](./taxonomy-design.md) owns it instead.
