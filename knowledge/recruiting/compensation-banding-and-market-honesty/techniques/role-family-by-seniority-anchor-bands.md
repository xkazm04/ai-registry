---
layer: technique
type: technique
subject: compensation-banding-and-market-honesty
technique: role-family-by-seniority-anchor-bands
status: forged
laws: [meaning-does-not-live-in-a-label, a-claim-carries-its-sample-and-its-basis]
use_when: [designing the grid a salary benchmark corpus is keyed by, deciding how finely to slice pay data, a role does not match any benchmarked cell]
---

# Role family by seniority anchor bands

The grid a compensation corpus is keyed by determines everything downstream:
how many observations stand behind each number, which roles can be priced at
all, and how often the honest answer is refusal. Get the grid wrong and no
amount of provenance discipline saves the band.

## The grid

**Two required dimensions, and no more than two optional ones.**

1. **Role family** — a small set of occupational groupings defined by what the
   work *is*, not by what it is called. A family is correct when a practitioner
   from another organisation, handed only the family definition, would sort the
   same jobs into it.
2. **Seniority anchor** — three to five levels, defined by scope, autonomy and
   dependency: what the person decides without asking, what they own, and who
   is blocked when they are absent.

Optional, and each one earns its place by having enough data to survive the
division: **geography** (a market, not a city, unless the corpus is genuinely
that deep) and **currency-and-period** (which is not really a slice but a lock
— see the currency technique).

Everything else — sector, company size, company stage, specialisation — enters
as a **bounded modifier applied to a cell**, never as another axis of the grid.
The distinction is the whole discipline: an axis divides your evidence, a
modifier does not. A grid of a few dozen well-populated cells with three
clamped modifiers is defensible. The same information expressed as a
five-dimensional grid is a table of anecdotes.

## Why title is not the key

Titles are organisational dialect. The same words denote a team lead in one
company and an individual contributor in another; the same job carries four
different names across four employers, and one of them is a morale gift rather
than a description ([meaning does not live in a
label](../../_laws.md#meaning-does-not-live-in-a-label)).

The practical consequence is that **title matching must be many-to-one and
explicit**. A role family carries a set of recognised title variants that map
into it, that set is data rather than code, and a title outside the set does
not silently pick the nearest string — it fails to match, and failing to match
routes to refusal. Fuzzy title matching is how a specialist gets priced as a
generalist, and it does so quietly.

## Anchors and interpolation

Anchors are *points*, and a role can sit between them.

- **Between two anchors**, interpolate, and label the result as interpolated.
  Linear interpolation between adjacent anchors is adequate; the error it
  introduces is far smaller than the error in the anchors themselves.
- **Above the top anchor or below the bottom**, do not extrapolate. Pay curves
  are not linear at the ends — they flatten at the bottom against statutory
  minima and fan out at the top with equity and variable pay. An extrapolated
  executive band from an individual-contributor curve is wrong by an amount
  nobody can estimate.
- **Outside the family set entirely**, refuse. See
  `refuse-to-quote-an-uncalibrated-market`.

State the interpolation in the band's basis, alongside the source and year. A
consumer who knows a figure was interpolated between two anchors treats it
differently from one who thinks it was measured, and correctly so.

## Sample floor per cell

Every cell carries a **minimum observation count**, below which the cell does
not publish a band. The floor exists for two independent reasons, and both
must be satisfied:

- **Meaning** — a median over a handful of observations is noise. Single-digit
  sample sizes in the specific cell you are quoting are a red flag in any
  compensation methodology worth the name.
- **Anonymity** — where the corpus is assembled from identifiable
  organisations, a small cell can expose an individual employer's pay, or an
  individual's. The cohort floor for anonymity is often *higher* than the floor
  for meaning; take the larger of the two.

Where a cell falls below the floor, the correct behaviour is to **coarsen, not
to publish thin**: collapse the geography, or merge two adjacent seniority
anchors, and say which collapse was applied. A band from a coarser cell,
labelled as such, is honest. A band from a thin cell is a number with a decimal
point and no basis ([a claim carries its sample and its
basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## Decision rules

- When a role's title is not in the family's recognised variant set, **do not
  price it** — route to a human rather than snapping to the closest string.
- When a role sits between anchors, **interpolate and label**; when it sits
  outside them, **refuse**.
- When adding a discriminating factor, ask whether it is an axis or a modifier.
  If applying it as a modifier would be defensible, it is a modifier. Only make
  it an axis when the corpus has the depth to keep every resulting cell above
  the sample floor.
- When a cell falls under the floor, **coarsen one dimension and record the
  coarsening**. Never lower the floor for a specific cell to make it publish.
- Define seniority by scope, never by years of experience. Years is a weak
  predictor of scope and a discriminatory proxy in several jurisdictions; the
  band inherits both problems.

## When not to use this

- **Where roles genuinely have no comparators** — a single-of-its-kind
  executive role, a newly invented specialisation, a hybrid of two families.
  The grid will produce a cell for these, and the cell will be wrong. Refusal
  plus a human-led comparator search is correct.
- **Where variable pay dominates total compensation** — commissioned sales,
  partner-track roles, equity-heavy early-stage offers. A base-pay grid is
  still meaningful, but only if every consumer knows it is a base-pay grid, and
  it must never be compared against a total-compensation figure.
- **Where the corpus is your own organisation's history.** The grid is fine;
  the data is not a market. Market bands read from a shared corpus only.
