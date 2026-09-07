---
layer: technique
type: technique
subject: measurement-honesty
technique: control-failure-is-not-a-datum-state
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
use_when: [a comparison ran cleanly but its control did not hold, deciding what to publish about an axis you measured and cannot compare, an axis quietly missing from a comparison that promised it, both arms of an A/B look fine and the difference is uninterpretable]
shared_with: []
---

# The control failed, not the instrument

The seven states of a datum are all properties of **one value's**
relationship to its instrument, to the system publishing it, or to its own
subject. A comparison has an invalidity none of them can express, because
it is not a property of either value: **both arms measured cleanly, nothing
errored, nothing is refuted, neither subject was exposed — and the
difference between them means nothing, because a condition that was
supposed to hold across the arms did not.** The load changed between them,
the population drifted, one arm ran through a warm cache, an environment
moved under the second run. Each number is exactly as good as it looks. The
contrast is worthless.

This state is missed reliably, and the reason is structural: every check in
this subject is applied per value, and this defect is invisible from inside
either value. A reviewer auditing the numbers finds nothing wrong, because
nothing is wrong with the numbers.

## Why it cannot be filed under any of the seven

The temptation is to route it to the nearest existing state, and all four
plausible routes are wrong in ways that cost something.

- **Unmeasurable** is the most tempting and the most damaging. That state
  requires a named mechanism by which the instrument *structurally cannot
  see* the thing. Here the instrument saw it perfectly. Filing a failed
  control as unmeasurable is precisely the laundering the unmeasurable gate
  exists to prevent — it converts "we ran the experiment badly" into "the
  world is opaque here", and it is unfalsifiable in exactly the cases where
  someone should be asked to run it again.
- **Measurement failed** claims an incident that did not occur; it puts a
  working collector on an on-call list and teaches the next reader to
  distrust an instrument that behaved.
- **Refuted** requires another published number proving this one cannot be
  true. Nothing here is untrue.
- **Compromised** is contamination of the *subject* before measurement — a
  fact about the past, detectable only by a second instrument. A failed
  control is a fact about the *present run*, detectable from the run's own
  environment log, and fixable by running it again properly.

The distinction that resolves all four is old and worth naming plainly:
this is a **confound**, not measurement error. Measurement error lives in
the value. A confound lives in the design, and it damages only the
comparison — which is why a model built for data has no slot for it.

## The honest handling: withhold the contrast, publish the axis

The failure mode is not publishing a bad number. Nobody does that here;
the number gets dropped, which feels like restraint. The failure is
dropping it **silently**, and it is expensive for a reason that has nothing
to do with this axis: a comparison that quietly omits the axes whose
controls failed is no longer reporting a measured set, it is reporting a
*selected* one. The reader cannot distinguish an axis that was never
considered from one that was measured and cut, so every remaining number
inherits a selection they cannot see. When the party publishing the
comparison also benefits from its result, the omission is indistinguishable
from choosing the flattering axes — and the honest publisher and the
motivated one produce byte-identical documents.

So the axis is published and the contrast is withheld, in three parts:

1. **The axis was in scope and was collected.** This is the part that
   prevents the selection inference, and it is the part restraint deletes.
2. **The control that failed, concretely** — what was supposed to hold
   across the arms, and what it did instead. "The event rate changed during
   the samples" is a disclosure; "the data was inconclusive" is a mood.
3. **No number.** Not the raw values with a caveat, and above all not a
   hedged summary: the contrast is the thing that is invalid, and a
   direction stated in words ("roughly comparable", "slightly better") is a
   contrast with the digits removed. A caveat under a number is read as a
   number.

Publishing per-arm values without the contrast is a judgment call and
usually wrong when the arms are the whole point: readers reconstruct the
difference themselves, uncaveated, in their heads.

## The band and the control are different refusals

An axis whose difference falls inside the instrument's measured noise band
is refused by [noise-band-and-hysteresis](./noise-band-and-hysteresis.md),
and it is a *stronger* result than this one: the comparison was valid and
found nothing worth announcing. A failed control is not a finding at all —
the experiment did not happen. Report them in different language and never
let the first absorb the second, because "no significant difference" and
"we could not tell" send a reader to opposite next actions: accept the
result, or run it again.

Both belong in a comparison's declared list of what it did **not**
establish, which is the artifact that makes the rest of it readable. That
list is also the cheapest available evidence that the publisher was not
selecting, and it costs a paragraph
([_laws:
count-carries-predicate_](../../../../_laws.md#count-carries-predicate)):
every number in a comparison carries the conditions under which it was
taken, and the axes that lost their conditions are part of that predicate.
