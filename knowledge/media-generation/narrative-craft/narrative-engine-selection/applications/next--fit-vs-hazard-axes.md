---
layer: application
type: application
subject: narrative-engine-selection
technique: fit-vs-hazard-axes
stack: next
status: forged
verified_on: 2026-09-28
verified_against: next@16
applied: code
ab_verdict: better
---

# The hazard axis, from a stored field to one read at selection (next)

*Read from the video studio's app tree at commit `2c1f836`, 2026-09-26.
Re-read and repaired at `29c6b9d`, 2026-09-28. The line references below
are the 2c1f836 read.*

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

## The repair, applied (2026-09-28)

Both deviations were closed in the tree in one commit.

- **Required.** `hazard` joined the schema's `required` list. The shape
  check reports a record with no `hazard` key, and `""` is a valid answer
  that means *assessed, none found*. The type stays optional, because the
  run-1 fixture predates the field and is the control.
- **Shown.** One shared line component draws three states. Text is shown
  as a warning, `""` reads "none found", and a missing key reads "hazard
  not assessed" instead of nothing. It sits under `fit` in the notebook's
  fit section and in each render column, before the adopt control.

Measured on the 28 engine-fit rows of the studio's four real 2026-08-12
notebooks, through the old and new runtime validators:

| | before | after |
|---|---|---|
| rows with no hazard key flagged | 0 of 5 | 5 of 5 |
| false flags on rows that carry one | 0 of 23 | 0 of 23 |
| rows whose hazard the fit surfaces draw | 0 of 23 | 23 of 23 |

The three sharpest rows are `good` fits whose hazard reads "REFUSE",
"HIGH FIT, HIGH HAZARD", and "the fit score hides it". Before the repair
the selection surface showed each of them as a bare `good`.

**The condition this adds.** All five missing hazards sat on `poor` fits.
In these notebooks the model skipped the axis only where selection was
already unlikely. So the requirement has not yet caught an unasked
high-fit row. Its value on this evidence is closing the ambiguity, not a
measured catch. Live model output under the new schema is unmeasured.

## Status

The two-axis record is required, rendered, and read where an engine is
adopted. What remains is arbitration's hazard-first cut as a rule the
surface enforces, for example refusing to adopt a render whose hazard reads
"refuse" without an override. That is a product decision and was not taken.
