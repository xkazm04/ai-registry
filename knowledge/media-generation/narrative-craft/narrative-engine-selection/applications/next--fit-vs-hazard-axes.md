---
layer: application
type: application
subject: narrative-engine-selection
technique: fit-vs-hazard-axes
stack: next
status: forged
verified_on: 2026-09-26
verified_against: next@16
---

# The hazard axis as a stored field that nothing reads (next)

*Read from the video studio's app tree at commit `2c1f836`, 2026-09-26.*

The studio's methodic prescribes two axes (see the process application).
Its app encodes both in the research notebook's engine-fit record, and it
encodes the second one well. What it lacks is any reader, and a
requirement.

## The axis as written in code

`app/_phases/_shared/notebook/types.ts:345-356` declares `hazard?: string`
beside the one-scalar `fit`. The doc comment states the technique's thesis
and its anti-shape. `fit` "answers only 'does the material fit the shape' —
so an engine that fits EXCELLENTLY and misleads is unrepresentable". The
anti-shape it names is "demoting `fit` to carry the warning. That hides the
engine from selection instead of arming the person selecting it."

The structured-output schema the model answers against
(`lib/notebook/validate.ts:300-313`) carries the same field, described as
"what a WRONG render through this engine costs". It sits beside a
three-grade `fit` enum.

## Where it falls short

- **Not required, so unasked reads as clean.**
  - The schema's `required` list is `engine`, `label`, `fit`, `why`
    (`:312`). `hazard` is not in it.
  - A model that never assessed hazard returns a valid record with no
    hazard. That is indistinguishable from a model that assessed it and
    found none.
  - The technique says "never leave the axis unasked and let the blank read
    as clean". The methodic draws the same line in prose ("empty means
    assessed, none found"), and the schema cannot hold it.
  - The repair is small: require the field and let an empty string mean
    *assessed, none found*.
- **Stored, never shown.**
  - No component in `app/` reads `.hazard`. The only non-type reference is
    the schema description.
  - The field meant to arm the person selecting an engine is persisted and
    never put in front of them.
  - The anti-shape the doc comment names (hiding the warning from
    selection) is reached by a different route: the warning is not demoted,
    it is simply not displayed.

## The adjacent blocker, realized

The no-engine verdict does have a first-class code path. The research run's
terminal states are `done`, `no-tension` and `failed`
(`app/_phases/research/run/useResearchRun.ts:123-131`). The `no-tension`
reason (`app/_phases/research/run/trace.ts:51`) reads "A topic with no
tension is not a video yet … Reporting this is the correct end of the run,
not a fail[ure]". Here the blocker verdict is a state distinct from failure,
which is what `no-engine-means-no-video` asks for. The run is a scripted
trace in this tree, so the state is modeled, not yet produced by a live
fit assessment.

## Status

Confirmed: the two-axis record exists in types and schema, with the
technique's reasoning written into the code. Deviations: the hazard is
optional, and it is never rendered. Until both change, a hazard assessed in
research stops at the notebook, and arbitration's hazard-first cut can only
run in someone's head.
