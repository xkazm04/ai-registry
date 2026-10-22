---
layer: application
type: application
subject: cv-presentation-and-parseability
technique: market-conventions-and-personal-data
stack: react
status: forged
verified_on: 2026-10-22
verified_against: react@19.3
applied: code
ab_verdict: better
proof: ab-paired
---

# The designed CV reads the candidate's own text, so "no field" is only half the default

Pinned at `kp@547f71b63` on top of `kp@d53f1d0f8`. The React version is the one kp's
`package.json` declares (`"react": "^19.3.1"`). kp builds its designed CV from the CV text the
seeker uploaded (`app/features/jobseeker/cv/cvDocument.ts`). The default-off rule is
honoured twice. The model has no field for any protected attribute
(app/features/jobseeker/cv/cvDocument.ts:76 "model carries NO photo, birth date, age, marital status, nationality or signature"),
and a block under a "Personal details" heading is read only so that it can be left out.
That leaves one channel open, and it is the one this application tested. Lines **above
the first section heading** sit in no block. The builder takes the first header line it
cannot classify as the headline printed under the name. A shared predicate,
`isPersonalData` (`app/features/jobseeker/cv/cvContent.ts`), keeps volunteered personal
lines out of that slot and out of the summary.

## Seam, chosen to falsify

The existing application recorded "no personal-data fields exist" as conformant. That was
a claim about the **model**. This seam asks whether a tool that *reads* a CV keeps the
default when the candidate's own text volunteers the data, in the label each market
actually prints. A caught outcome would mean the technique's rule is not met by a model
without the field. It was caught.

- **Target:** header lines that state or reveal a protected attribute and are printed as
  the headline. The fixture is 24 forms across en/cs/de/fr, plus the European standard
  format, which prints label and value with no colon.
- **Floor:** a real title in the same slot must still be printed. There are 12 controls,
  including "Gender Studies Researcher", "Health Informatics Lead" and "Age-verification
  flow lead". The feature's unit suite and the typecheck must also stay green.

| Arm | Leaks printed | Controls lost |
|---|---|---|
| A, the predicate as shipped | **18 / 24** | 0 / 8 |
| B, each market's missing labels plus a bare-label rule (label + one capitalised word) | **0 / 24** | 0 / 12 |

Under A, the printed headlines included the Czech nationality label
("Státní příslušnost: česká"; the predicate knew only the citizenship spelling), every
gender line, every place-of-birth line, the combined date-and-place labels in all four
languages, Czech religion and health, and the colon-less European-format pair
("Nationality Czech", "Gender Female"). A caught only the labels it already knew. The
permanent test added in B fails on A and passes on B. All 161 tests in the jobseeker
feature suite pass on B, and `tsc --noEmit` is clean.

## What the tree says about the technique

The leak sat exactly at the point the technique's rules do not name. "A template slot is
not a reason to fill it" governs what a tool *writes*. A tool that *imports* the
candidate's document inherits whatever that document volunteered, and minimisation then
depends on **recognition**: the absence of a field does not help. Recognition is
per-market vocabulary. The Czech label that leaked is the one a Czech CV most commonly
uses, and its market column in the technique already reads "customary". This amendment
went into the technique as a decision rule.

## What this realization cannot do

- It recognises labelled lines and bare marital-status words. A sentence that implies an
  attribute without a label ("mother of two", "practising Catholic") passes. The summary
  is filtered sentence by sentence by the same predicate, so it has the same limit.
- The `location` line comes from the profile reader, and the only instruction behind it
  is the prompt's "city or null". Nothing on the sheet checks that it is city-level. A
  street address the model returns would be printed. This was not measured here.
- A colon-less label followed by two capitalised words ("Nationality Czech Republic") is
  deliberately not matched, so that two-word titles stay titles. It is a known miss.
