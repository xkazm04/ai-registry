---
layer: technique
type: technique
subject: grant-source-landscape
technique: close-date-normalization
status: forged
laws: [honest-null-over-forced-guess]
shared_with: []
use_when: [normalizing deadlines at the ingest boundary, handling multi-cutoff calls, a deadline pipeline shows wrong or missing dates]
---

# Close date normalization

The close date is the most consequential field in an opportunity row: it
drives the deadline pipeline, the "still applicable" filter, and the urgency
of every match. It is also the field publishers are most creative about.
Normalization at the ingest boundary must resolve every publisher's deadline
dialect into one explicit representation — **date, time-of-day, and
timezone, all three** — or into an honest null. A close date the corpus is
not sure of is more dangerous absent-and-null than present-and-wrong.

## A date is not a deadline

The core insight: publishers publish *dates*; applicants miss *moments*. A
bare date string leaves two questions open — what time on that date, and in
whose clock — and both have publisher-specific answers that must be encoded
at ingest, because downstream code cannot recover them:

- **The end-of-day convention.** A major clearinghouse's documented
  convention is that applications close at 23:59 in the publisher's home
  timezone on the stated date. Stamp that time and that timezone onto every
  row at normalization. Leaving it implicit makes the deadline float with
  the *reader's* timezone — an applicant west of the publisher sees hours
  they do not have, one east sees a deadline already passed while it is
  still open.
- **Explicit timestamps.** Sources that publish full timestamps (a
  supranational portal publishing a specific afternoon hour in its own
  zone) keep their explicit values — never coerced into the end-of-day
  convention of a different source.
- **The corpus schema carries all three parts.** One `closeDate` string is
  not enough; separate date, time and timezone fields let each source state
  its convention and let the deadline machinery compute one true instant.

## Multi-cutoff calls: resolve to the next upcoming

Some funders run one call with several submission deadlines — two-stage
evaluations, rolling cut-offs on a continuously open topic. The publisher's
record carries a *list* of deadlines and often a deadline-model marker
(single-stage, two-stage, multiple cut-off).

The normalization rule: **resolve the stored close date to the next
upcoming cutoff relative to now, so the call stays live until its last
cutoff passes.** The naive alternatives both fail:

- Taking the *first* deadline makes the call vanish from the corpus the
  moment cutoff one passes — while cutoffs two and three remain genuinely
  open. This is a real, observed failure: a deadline radar that went quiet
  on calls that were still applicable.
- Taking the *last* deadline alone hides the urgency of the imminent
  cutoff and, for two-stage calls, misstates when full proposals are due.

Keep the full deadline list in the retained raw payload; surface the next
upcoming one as the operative close date; recompute on each ingest so the
operative date advances through the list as cutoffs pass.

## Impossible dates get dropped, not stored

Feeds contain placeholder and garbage dates: far-past dates on live rows,
sentinel values, malformed strings that a lenient date parser "fixes" into
something plausible. The screening rule: **validate every close date with
the same parse the deadline machinery uses, and null anything that fails
the round trip.** Two specific traps:

- An unparseable date stored as-is becomes invisible to date-driven
  filters. In a corpus where "no close date" is read as "rolling /
  always-open", a garbage date silently converts into an always-open RFP
  sitting permanently in the match shortlist — the forced-guess failure in
  its most camouflaged form.
- A *differently* lenient parser at read time than at ingest time means
  the corpus and the pipeline disagree about which rows have deadlines.
  One validation function, shared by the boundary and the consumer, or the
  two drift.

Null is a first-class value here, with defined downstream semantics
(surfaced as "deadline unverified — check the funder's page", not as
"open forever"). The distinction between "the funder runs a rolling
program" and "we could not parse the date" should survive normalization
where the source lets you tell them apart.

## Decision rules

- When a source documents an end-of-day convention, encode it as explicit
  time + timezone at ingest; when it documents nothing, use the
  publisher's home-timezone end-of-day and record that assumption.
- When a record carries multiple deadlines, store the next upcoming one and
  recompute per ingest; never the first, never only the last.
- When a date fails validation, store null and keep the raw string in the
  retained payload for diagnosis.
- When comparing "is this still open", compare instants (date + time +
  zone), never date strings.

## When not to apply

Awarded-history rows have award dates, not deadlines — do not force them
through close-date semantics; their time fields are historical facts with
none of this machinery. And curated floor entries with maintained static
dates need only the validation and end-of-day stamping, not multi-cutoff
resolution.
