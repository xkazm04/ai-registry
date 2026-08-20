---
layer: technique
type: technique
subject: people-analytics-ethics
technique: naming-population-floor
status: forged
laws: [count-carries-predicate, one-authority-per-vocabulary]
shared_with: []
use_when: [a breakdown would name individuals, sizing a cohort before publishing per-person rows, choosing a suppression threshold]
---

# Naming population floor

A naming floor is the minimum number of **distinct identified people** that
must be present in a cohort before that cohort's output may name, rank, or
otherwise single out any of them. It is the cheapest privacy control in
engineering analytics and the one most often implemented incorrectly, because
the obvious implementation — count the rows, hide the panel if the count is
low — protects against none of the ways small-group reporting actually
identifies people.

## Count people, not rows

The floor's unit is distinct identities, not records, not events, not
contributions. A month of activity from three engineers can produce four
hundred rows; a row floor of fifty passes it and publishes a three-person
breakdown. Every floor comparison therefore runs against a distinct-identity
count computed at the same grain as the thing being published, and the number
travels with its predicate — *distinct authors active in the window, after
eligibility filters* — because "12 contributors" means three different
populations depending on which filters ran first
([law: count carries predicate](../../../../_laws.md#count-carries-predicate)).

Order matters: the floor is evaluated **after** eligibility filtering, not
before. A cohort of twenty that drops to four once the volume and recency
gates run is a cohort of four, and publishing it because the pre-filter count
was twenty is the most common way a correct floor produces an incorrect
result.

## The three attacks a naive threshold does not stop

1. **Complement disclosure.** A total is published for the group and a
   breakdown for all but one member. The remaining member is named by
   subtraction, with a precise value. Rule: if a total and a partial
   breakdown are both published, the number of *unnamed* members must also
   clear the floor — a residual of one or two is a disclosure wearing an
   aggregate's clothing. Where it cannot, publish the breakdown or the total,
   not both.
2. **Top-N with a small tail.** Showing the top three of five names the top
   three and, by exclusion, tells the reader the other two are the bottom.
   A ranked list published over a group barely above the floor is a full
   ordering. Rule: a ranking requires a materially larger population than a
   flat listing — a common working rule is that the excluded remainder must
   itself clear the floor.
3. **Longitudinal differencing.** Two reports a week apart, each individually
   above the floor, differ by one departure or one arrival; the difference
   isolates that person's numbers exactly. Rule: cohort membership changes
   between periods must not be inferable from the published series — freeze
   the cohort definition per period and label it, or suppress period-over-
   period deltas at small n.

## Choosing the number

There is no universal threshold; there is a defensible procedure.

- **State the smallest group the report is allowed to imply.** That is the
  floor. Working from the other direction — picking the number that leaves
  the current dashboard populated — produces a threshold that will be lowered
  again next quarter for the same reason.
- **Five to ten distinct people is the professional band** for reporting that
  touches identifiable humans, with the lower end acceptable for benign,
  self-selected, aggregate-only outputs and the upper end appropriate for
  anything comparative, evaluative, or exportable. Below five, per-person
  publication is not made safe by any threshold arithmetic; the correct move
  is to change the framing (see
  [risk-framing-anonymization](./risk-framing-anonymization.md)) or to not
  publish.
- **Sensitivity raises the floor, it never lowers it.** A celebratory badge
  and an evaluative ranking are not the same risk and should not share a
  number.
- **One authority per floor.** Each floor is a named constant defined once,
  beside the producer that enforces it, with a comment stating what it
  protects and why the value is what it is
  ([law: one authority per vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
  A threshold repeated in four files is four thresholds, and the fourth will
  be the one someone tunes.

## Suppression removes identities, not findings

The floor withholds *who*, and only *who*. Every aggregate that the report was
built to deliver — totals, shares, distributions, concentration measures — is
computed over the whole population and remains present below the floor. Two
consequences, both easy to get wrong:

- **The fallback is aggregation-only, never "no data".** A producer that
  returns nothing at all below the floor has converted a privacy control into
  an outage, and consumers will render it as absence of activity.
- **The smallest cohorts often carry the strongest finding, and suppressing it
  hides the finding rather than a person.** A two-person group is the most
  concentration-exposed group there is; withholding its risk read protects
  nobody and deletes the one result that mattered. Where the finding is
  phrased about the artifact it needs no floor at all — which is why framing
  ([risk-framing-anonymization](./risk-framing-anonymization.md)) is decided
  before thresholds are.

The design question is therefore never "does this panel appear below the
floor" but "which of its fields are identities". Compute the rest
unconditionally.

## Small-group behavior must be designed, not defaulted

What a report does below the floor is a product decision with a right answer:
it says so. "Not shown — fewer than N contributors in this period" is
informative, unambiguous, and cannot be mistaken for zero activity. The two
wrong answers are the blank panel (indistinguishable from a broken query) and
the silently unfiltered fallback that shows the small group anyway "because
otherwise the page is empty". Encoding the withheld state so it survives the
trip to every renderer is
[producer-enforced-suppression](./producer-enforced-suppression.md).

Pseudonymization is not an escape hatch at small n. In a group of nine,
stable pseudonyms plus the areas each pseudonym touches plus relative volume
re-identify everyone in the room within minutes, and the labels make the
report feel safe while doing nothing. Where the group is small, aggregate
harder or publish less.

## When not to use it

- **When no individual is identifiable in the output at all.** A repository-
  level or organization-level number computed over any population is not
  subject to a naming floor; applying one there suppresses harmless data and
  trains people to see floors as arbitrary friction. The floor guards
  identification, not aggregation.
- **When the person is the sole audience.** A private self-view has a
  population of one by design and is not made safer by a floor; its
  protections are structural instead
  ([private-view-separation](./private-view-separation.md)).
- **When the record must be complete by mandate.** Provenance retained for
  investigation is a different obligation with a different subject; do not
  apply reporting floors to an evidentiary trail, and do not treat an
  evidentiary trail as license to publish.
- **As a substitute for framing judgment.** A floor makes an admissible
  naming safe. It does not make an inadmissible one admissible — a
  sufficiently large cohort does not license labelling a named person a risk.
