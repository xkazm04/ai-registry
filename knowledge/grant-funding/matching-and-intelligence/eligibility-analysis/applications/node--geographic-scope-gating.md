---
layer: application
type: application
subject: eligibility-analysis
technique: geographic-scope-gating
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@22
applied: code
ab_verdict: better
---

# Node: one whole-word matcher for the eligibility check and the ranking score

The structured country gate in a grant-matching engine already followed the
technique: a country-and-scope gate first, supranational member set as data,
unknown for a legacy row, and the eligibility check matched the applicant's
city, region and abbreviation through a shared whole-word, escaped, two-character
helper that reports the granularity that matched.

## The seam chosen to falsify

The claim under test was that prose refinement is whole-word everywhere. The
heuristic ranking score, which sits beside the eligibility check, still tested
the applicant's city and state with a bare substring. A town name embedded in
a longer word scored a listing at full geography marks (a city "Reno" against a
"Renovation fund"), and an empty city or state profile field, being a substring
of every string, scored every listing at full marks. Had the score matched the
check, the technique would have held across surfaces; it did not.

## A and B

- A (as shipped): two new cases fail (embedded place name, empty profile field).
- B: the score calls the shared whole-word helper; both pass.
- Target: both cases 0 geography points after, 30 before. Floor: the 209
  existing grant-ingest tests, tsc and eslint stay green. They did.

Not measured: how often real profiles carry an empty field or a town name that
is a prefix of a common word in the live corpus.
