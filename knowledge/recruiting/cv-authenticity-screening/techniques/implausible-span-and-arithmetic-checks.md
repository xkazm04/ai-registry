---
layer: technique
type: technique
subject: cv-authenticity-screening
technique: implausible-span-and-arithmetic-checks
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate, say-only-what-the-record-holds]
shared_with: []
use_when: [a document claims more experience than its dates can hold, checking a career history against itself, deciding whether overlapping roles are a signal]
---

# Implausible span and arithmetic checks

The only authenticity heuristics that check something rather than sense
something. Everything else in this subject measures style; these read the
document against its own numbers and find the places where it cannot all be
true at once. That makes them the strongest family here — and the one most
likely to be over-trusted, because arithmetic feels conclusive when the inputs
never are.

## The checks worth running

- **Claimed years against career span.** A stated "twelve years of experience"
  set against a first dated role eight years ago is an internal contradiction,
  not an opinion. Compute the span from the earliest and latest dated positions
  and compare.
- **Sum of tenures against elapsed time.** Adding every role's duration and
  finding a total materially larger than the wall-clock career length means the
  roles overlap — which is a question, not yet a problem (see below).
- **Per-role implausibility.** A tenure that starts before a plausible working
  age, a role of forty years inside a career of fifteen, an end date in the
  future, a start date after its end date. These are almost always data errors
  and should be surfaced as such.
- **Seniority against span.** A title implying a decade of accumulated authority
  attached to a career the document dates at three years is a mismatch worth a
  note — the weakest check in the family, because title inflation is granted by
  employers, not claimed by candidates, and varies wildly by market.
- **Volume against time.** A skill inventory or certification list whose
  acquisition would exceed the available years is a soft version of the same
  arithmetic, and should be worded far more softly.

## Overlaps are ordinary life

The check that most often accuses honest people. Concurrent dated roles are
routine and legitimate: contracting and consulting engagements, a second
part-time job, academic work alongside employment, an internal transfer recorded
as two rows, a promotion listed as a separate entry, advisory or board seats,
military reserve service, parental leave recorded inside a continuing
employment, and — very commonly — a candidate who lists the agency and the
client as two positions covering the same months.

Decision rules that follow:

- **Overlap alone never fires.** Require a magnitude threshold — a total that
  exceeds the elapsed span by a substantial margin, not by months — and prefer
  a stated confidence over a binary.
- **Distinguish overlap from impossibility.** Two full-time roles running for
  six years in parallel is a different claim from two roles sharing a quarter.
  Only the first is worth a reviewer's attention, and even then the modal
  explanation is a documented dual appointment.
- **Never name the mechanism.** The flag says the totals do not reconcile. It
  does not say the candidate inflated a tenure — the record does not hold that,
  per [say only what the record holds](../../_laws.md#say-only-what-the-record-holds).

## Missing dates are missing, not zero

Career documents omit dates constantly, and the omission is usually deliberate
in a way that has nothing to do with deception: candidates are widely advised to
drop early dates to blunt age discrimination, and many formats simply lose them
in extraction.

- An undated role contributes **unknown**, never zero, to any total. A sum that
  silently treats missing spans as nothing understates the career and then
  accuses the candidate of overstating it — the exact inversion
  [absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)
  exists to prevent.
- When enough of the timeline is unknown that the comparison is meaningless, the
  check's output is **not computed**, a distinct state that is neither a pass nor
  a flag.
- Where an ambiguous date could be read two ways, resolve toward the reading
  that favours the candidate and note the ambiguity, per
  [uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate).

## Extraction damage is the leading false positive

Every arithmetic check inherits the quality of the dates it was handed, and
those dates come from a parser working over a document format designed for
printing. Reversed day/month order across locales, two-digit years, "present"
and its translations, ranges split across a line break, month names in a
language the parser did not expect, and a footer date mistaken for an end date
all produce arithmetic that is genuinely wrong about a document that is
genuinely honest.

Two rules follow. First, **consume the extraction damage report** — where the
parsing stage flagged the region a date came from as damaged, the arithmetic
check declines rather than fires. Second, **quote the raw date strings in the
flag**, not the parsed values; the reviewer resolves in one glance what the
pipeline could not, and the most common resolution is "the parser was wrong".

## When not to use this

- **Not on careers where overlap is the norm.** Freelance, portfolio, academic,
  clinical and creative careers routinely run many concurrent engagements;
  running a sum-of-tenures check on them produces noise proportional to how
  successful the person is.
- **Not as a gate on a self-reported years-of-experience field.** A candidate
  rounding "about ten years" upward is not committing fraud, and a requirement
  expressed in years is usually a poor proxy anyway.
- **Not against an inferred timeline.** If the dates were themselves inferred by
  a model rather than read from the document, the arithmetic is checking an
  inference against an inference and can conclude nothing.
- **Not when the check would be the only thing a reviewer sees.** A date
  discrepancy note attached to an otherwise unread application invites a
  rejection on a parser bug. Surface it beside the evidence, never alone.
