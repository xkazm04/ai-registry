---
layer: technique
type: technique
subject: cv-parsing-and-career-reading
technique: tenure-and-date-range-reading
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [computing total or relevant years of experience, parsing employment date ranges, interpreting gaps or overlaps in a career history]
---

# Tenure and date-range reading

Total experience is the most-used number extracted from a career document and the most
quietly wrong. It looks like addition. It is interval arithmetic over an ambiguous,
partially-specified, locale-dependent set of ranges, and every shortcut biases a
recognisable group of people.

## Parsing the range

A date range in a career document may be written with month and year, year alone, a
season, a quarter, a localised month name, an abbreviated one, a non-Gregorian calendar,
or a numeric form whose day and month order depends on where the writer lives. It may
run backwards. Its end may be an open marker in any language. Two ranges may be joined
by a dash the extractor's tokenizer treats as a hyphen inside a word.

Decision rules:

- **Preserve precision; never invent it.** A year-only range is stored as year-precision.
  Padding it to a January start is a systematic bias that always runs the same direction
  and is invisible in aggregate. Where a duration must be produced from a year-only
  range, use the midpoint convention and record that the value is approximate.
- **An ambiguous numeric date is ambiguous.** Resolve it from other unambiguous dates in
  the same document — the writer is internally consistent far more often than not — and
  where it cannot be resolved, mark it uncertain rather than picking your own locale's
  reading.
- **A range that runs backwards is a parse failure, not a negative duration.** Flag it;
  do not silently swap the endpoints, and never let it subtract from a total.
- **An open end is a value.** "Present" means "still held as of the document's own date."
  Resolve it against the document's authoring or submission date, not against the clock
  at the time of processing, or a reprocessing run silently awards the candidate the
  years since they applied. Where the document's date is unknown, the open end resolves
  to the submission date and is marked as such.

## Computing tenure

**Total experience is the measure of the union of the intervals, not the sum of their
durations.**

Overlap is normal, and it is most normal for exactly the people whose tenure matters
most: a promotion recorded as two entries at one employer, a permanent role plus
contract work, an advisory or teaching seat alongside a job, a founder who lists the
company and the role separately. Summation inflates these careers by years and
mis-ranks them against candidates who happened to describe a single continuous line.

The procedure: normalise every entry to a half-open interval, drop entries that failed
to parse (and record that they were dropped), merge overlapping intervals, then measure
the union. Compute *relevant* experience the same way over the filtered subset, never by
scaling the total.

Two corollaries. Adjacent intervals separated by a month boundary artefact should be
merged before measuring, or a candidate loses time to rounding at every job change. And
the measured value carries its basis: a total computed over three entries of which one
failed to parse is a different claim from one computed over three clean entries, and
[a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)
means the count of contributing entries travels with the number.

## Gaps

A gap is a property of the *record*: no entry covers this interval. That is the entire
extractable fact.

- **Emit gaps as intervals, not as narrative.** Length and position are data; cause is
  not present in the document.
- **Any reading of cause is a hypothesis with a probe attached**, rendered in the grammar
  of inference and never as a finding — [inference must look like
  inference](../../../_laws.md#inference-must-look-like-inference).
- **Do not let gap length feed a score directly.** It is the single most efficient proxy
  for caregiving, illness, migration, military service, imprisonment and study, and a
  penalty applied there is a criterion nobody wrote down and nobody can defend. Route it
  to a human as a question if it is material to the role, or drop it.
- **A gap at the top of the record is not a gap.** An entry with an open end that ended
  before the document was written is unemployment the candidate did not narrate, and a
  pipeline that infers "currently unemployed" from it is guessing about a person's
  present circumstances from a formatting choice.

## Missing dates

Entries with no dates at all are common in early-career and creative documents, where
the convention is a portfolio list rather than a chronology. They contribute *no*
interval. They must not contribute a default interval, and they must not cause the
entry to be dropped: the role is real evidence for the skills it names even when it is
worthless for tenure. Two separate states — "no duration" and "no entry" — and
[absence of evidence is not
evidence](../../../_laws.md#absence-of-evidence-is-not-evidence) forbids collapsing them
into a zero.

## When not to use this

Do not compute a total-experience figure at all where the role's requirement is
skill-specific rather than duration-specific; a years number invites a threshold, and a
threshold on years is the crudest instrument in screening. Where a jurisdiction or a
role genuinely requires a minimum period, compute it over the *qualifying* intervals
under a written definition, and treat the result as an input to a human gate rather than
an automatic filter — no adverse outcome should turn solely on an arithmetic your parser
performed on ambiguous dates.
