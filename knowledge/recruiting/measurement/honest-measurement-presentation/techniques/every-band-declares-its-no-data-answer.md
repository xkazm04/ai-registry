---
layer: technique
type: technique
subject: honest-measurement-presentation
technique: every-band-declares-its-no-data-answer
status: forged
laws: [absence-of-evidence-is-not-evidence, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [defining a colour or severity band, adding a health tier to a metric, a band table is consumed by more than one surface, writing the adjective in a summary sentence]
---

# Every band declares its no-data answer

A band is a total function from a metric's domain to a meaning: a colour, a
tier name, a sort key, an adjective in a sentence. The recurring defect is
that band tables are written as if the domain were the real numbers. It is
not. The domain includes *no data*, and a band table that does not name its
answer for that case delegates the answer to whichever branch happens to fall
through — and a fallthrough is almost always the extreme.

The failure is quiet and consistent: a comparison chain like
`value >= high ? good : value >= mid ? watch : critical` returns *critical*
for a missing value, because a missing value is not greater than anything.
Nothing throws. The panel simply reports that an unmeasured thing is in
crisis. Every consumer of that table then inherits the lie in its own
vocabulary — the tile turns red, the sort puts it at the bottom, the summary
sentence calls it the worst stage, the export writes "critical".

## The procedure

**1. Make the no-data tier a declared member of the band set.** The tier has a
name, a neutral visual treatment, a sort position and an adjective, exactly
like every other tier. It is enumerated in the same place the numeric tiers
are, so a reader of the definition can see it, and a new consumer cannot
accidentally not-handle it.

**2. Resolve the state before the number.** The band function takes the metric
state first: if the state is not *measured*, return the no-data tier and never
look at the value. Ordering the check this way makes the fallthrough
impossible rather than merely discouraged.

**3. One table, every consumer.** Colour, legend, tier label, chart threshold
lines, sort order, the adjective in the narrative sentence and the export all
read the same definition. The most common way this technique decays is a
second, hand-maintained cutoff list inside a summary-writing prompt or an
export formatter, which drifts and then contradicts the screen. Where a second
runtime genuinely cannot import the first's table, assert the mirror with a
test that fails on divergence rather than maintaining it by intention.

**4. Put the no-data tier in the legend.** This is what converts the neutral
treatment from an absence into a statement. A reader who sees "— not measured"
in the legend understands the grey rows; a reader who does not, reads grey as
disabled, stale, or someone else's problem.

**5. Keep the vocabulary closed and the cutoffs locale-independent.** A small
fixed set of tiers, named once, with labels localized and thresholds not — so
translating a surface cannot move a boundary. An open tier vocabulary is a
display string, and meaning does not live in a label
([meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label)).

**6. Give the no-data tier a sort position, not an imputed value.** Unmeasured
rows group — conventionally after every measured row in a ranked view,
including after a measured worst — and are visibly a separate group, so
position is not read as performance. They never interleave by a substituted
number.

## Interaction with the goal rule

Bands and verdicts are different axes and both must be answered before
anything is coloured. A band says where a value sits in a declared range; a
verdict says whether that is acceptable. A band may exist with no goal, in
which case it may carry a *descriptive* treatment (a sequential ramp, a
position on a scale) but not a *valenced* one — no red, no green. The
combination table is small and worth writing down: measured with a goal gets
the full verdict palette; measured without a goal gets a neutral descriptive
band; unmeasured gets the no-data tier regardless of whether a goal exists.

## Decision rules

- **When a band is applied to an inferred quantity rather than a measured
  one**, drop the band. Tone and tiering are the grammar of measurement;
  lending them to a model's self-reported confidence or a projection makes a
  guess look like a reading. The inference-labelling discipline owns that rule
  — this technique's obligation is to honour it by not banding what it has
  classified as inferred.
- **When a band boundary is also offered as a filter floor**, derive the
  filter from the boundary. A "show at least 70" control on a scale whose top
  band starts at 72 keeps rows the grid paints as not-top, and the filter and
  the colours then disagree in front of the reader.
- **When a tier is added or a cutoff moves**, treat it as a change to what the
  product claims. Historic exports and saved views were banded under the old
  table; either re-band them and say so, or stamp the table version.
- **When a value falls outside the band table's range**, show the value and
  extend the vocabulary; never clamp it into range. A band set that tops out at
  100% will silently rewrite a 140% ratio into a "perfect" reading, deleting
  the most interesting number on the surface. Out-of-range is a declared tier
  like no-data is.
- **When two metrics share a palette but not a scale**, do not share the
  table. Reusing "good above 70" across a conversion rate and a satisfaction
  score is how a threshold ends up applied to a domain nobody checked it for.

## When not to use this

- **Continuous encodings with no tiers.** A heat map or a sequential ramp with
  no semantic breakpoints needs a declared no-data colour, but not a tier
  vocabulary — the technique reduces to rule 1 alone.
- **Where the band is purely decorative** and drives nothing a reader could
  act on. These are rarer than they look: if the colour ends up in an export
  or a digest, it is not decorative.
- **Where a single row's absence is already stated in words.** Do not stack a
  no-data tier, a dash, a tooltip and an inline caption on the same cell; one
  clear statement beats four redundant ones, and the redundancy trains readers
  to stop looking.
