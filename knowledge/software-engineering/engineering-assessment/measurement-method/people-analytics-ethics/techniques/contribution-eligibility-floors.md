---
layer: technique
type: technique
subject: people-analytics-ethics
technique: contribution-eligibility-floors
status: forged
laws: [count-carries-predicate, one-authority-per-vocabulary]
shared_with: []
use_when: [building a per-person distribution or ranking, a departed colleague still tops a list, deciding who is eligible for a celebratory badge]
---

# Contribution eligibility floors

Before a person may enter a distribution, a ranking, a rate, or a celebratory
list, they must clear eligibility floors that establish the output is a
measurement rather than an artifact of who happened to appear in a window.
These are distinct from the naming floor: that one asks *is the cohort big
enough to name anyone*
([naming-population-floor](./naming-population-floor.md)); this one asks *does
this individual have enough signal to be placed in it at all*.

## The four floors

**Volume.** A person with two contributions has no rate, no trend, and no
rank; a percentage over a denominator of two is noise rendered as precision.
Set a minimum contribution count for entry, chosen so the smallest eligible
denominator produces a number you would defend out loud. Below it, the person
is excluded from the distribution — not shown at zero, which reads as a
judgment about them rather than an absence of data.

**Window.** Activity must fall inside a stated period. An unbounded lifetime
window makes the list a tenure ranking with extra steps, and every newcomer
is permanently at the bottom of it. State the window in the output, always,
because a count without its window supports whatever claim the reader brings
([law: count carries predicate](../../../../_laws.md#count-carries-predicate)).

**Recency, evaluated per source.** This is the floor that gets learned from
an incident rather than a design review. When a ranking merges several
sources — a change history, a review system, an issue tracker — those sources
have different retention, different refresh cadence, and different backfill
behavior. A person who left the organization months ago can therefore remain
at the top of a "most active" list indefinitely, held there by whichever
source has the longest memory, while every source with a short horizon has
correctly dropped them. The list is arithmetically defensible and reads to
colleagues as a live claim about a current teammate. The fix is a recency
guard applied to **each contributing source independently** before the merge:
a person qualifies only if their most recent activity in every source that
feeds the ranking is inside the window, or the stale source's contribution is
excluded from their total. A single global recency check on the merged
maximum passes exactly the case it needs to catch.

Two refinements the guard needs to be usable. **Unknown recency is not stale
recency** — a source that carries no timestamp at all is kept, not dropped,
because dropping on missing data silently deletes populations for a reason
nobody can see. And **the exclusion is counted and published**: emit how many
sources or people the guard removed, so the surface can annotate "N excluded
as stale" instead of quietly shifting its denominator. An eligibility filter
whose effect is invisible is indistinguishable from a bug, in both directions.

**Sustained-habit, for anything celebratory.** A badge or highlight awarded
for one burst rewards an experiment, not a practice. Require the activity to
appear in more than one period — separate observation days, weeks, or
release cycles — before it can be labelled a habit. This floor exists to stop
the output becoming success theater: a list that celebrates everything
celebrates nothing, and the people who read it learn to discount it.

## Composition and ordering

Floors compose as an AND and run **before** the naming floor, never after.
The population that matters for suppression is the population that survives
eligibility, and evaluating in the wrong order publishes a four-person
breakdown because twenty people were present before filtering.

Each floor is one named constant, defined beside the producer that applies
it, with its rationale in a comment
([law: one authority per vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Rationale matters more here than elsewhere because these constants look
arbitrary and invite tuning: the comment must say what the number prevents —
success theater, an experiment counted as a habit, a departed colleague at
the top of a live list — so the next engineer tunes with knowledge or leaves
it alone.

## Framing the survivors

Clearing every floor licenses inclusion, not competition. Where a list of
people is genuinely worth publishing, keep three properties:

- **Bounded, not ranked.** A short recognition list without positions
  communicates the same information and does not create an ordering people
  will try to move within.
- **Explicitly not a scoreboard**, stated in the surface itself. Readers
  assume ranking when given names and numbers; the caption is the only place
  the intended reading exists, and its absence defaults to the harmful one.
- **Additive framings only.** Eligibility floors qualify people *into*
  positive lists. They must not be inverted to produce a below-the-floor
  list, which is a deficit framing with names attached and fails the
  admissibility test outright
  ([risk-framing-anonymization](./risk-framing-anonymization.md)).

## Decision rules

- **When a distribution looks lumpy at the low end, check eligibility before
  changing the visualization.** The lumps are usually people who should never
  have entered it.
- **When a floor would empty the list, publish the empty list with its
  reason.** An honest "no one met the sustained-habit floor this period" is
  information; padding the list by relaxing the floor is not.
- **When a new data source is added to a ranking, add its recency guard in
  the same change.** A source joins with its own horizon, and the merge is
  where the stale-name failure is introduced.
- **When someone asks for a lifetime list, ask what decision it informs.**
  Usually the answer is nostalgia, and a documentation or ownership record
  serves it better than a ranking.

## When not to use it

- **Artifact-level metrics.** A component's change rate needs no per-person
  eligibility; these floors apply only where an individual enters an output.
- **A person's own view of their own activity**, where their two
  contributions are exactly what they came to see. Eligibility floors would
  hide people's data from themselves.
- **Completeness-critical records** — provenance trails, compliance
  attestations, coverage inventories — where filtering out low-volume
  participants is precisely the defect the record exists to prevent.
