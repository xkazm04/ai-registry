---
layer: application
type: application
subject: blind-screening-and-redaction
technique: preserve-substance-while-masking-identity
stack: process
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# A phone-shaped pattern deleting tenure and scale (Python pipeline)

## The seam

The pipeline masks a CV before a model scores it. Earlier passes had already
protected substance against the name pass: a given name that is also a month
keeps its "Jan 2020" dates, a skill word that is also a surname survives, a role
headline is not mistaken for a name. The technique's contract list was therefore
mostly honoured for the name path. The seam hunt went to the path nobody had
pinned: the contact patterns, chosen because the technique says a rule that eats
numbers "has been written at the wrong altitude - matching a format, not a
meaning", and a phone pattern is the purest format-match in the redactor.

## A and B

- **A** - the phone pattern as it stood: an optional plus, a digit, seven or more
  digits and separators, a digit, not glued to a word.
- **B** - the same pattern, with a shape gate: a match with no leading plus that
  is a year range ("2015 - 2019", "06/2018 - 07/2022") or a grouped quantity of
  one or two leading digits followed by three-digit groups ("12 000 000",
  "1 200 000") is left alone and not counted as a phone redaction.

## What was read

Six substance lines (four tenure ranges, two scale figures) and four real phone
lines, each placed under an identical header.

- Target, substance masked as a phone: A 6 of 6, B 0 of 6. The tenure of a
  career and its scale figures were replaced by a phone placeholder while the
  document still read fluently, which is exactly the failure the technique
  opens with.
- Floor, real phones still masked (plus-prefixed, bare nine-digit, hyphenated,
  bracketed area code): A 4 of 4, B 4 of 4. The 34 redaction and lockstep tests
  and 120 pipeline tests selected for the redactor passed.

The new test class fails on A (two tests) and passes on B.

## What it did not measure

- Recall on eight-digit local numbers, unchanged by this gate but never measured.
- A real phone that happens to be three-digit groups with a one or two digit
  head and no plus ("12 345 678") would now survive; no such national format
  was in the tree's fixtures.
- Whether scores on real CVs moved. The held-out masked-versus-unmasked
  comparison the technique recommends was not run.
