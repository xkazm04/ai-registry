---
layer: application
type: application
subject: conflict-of-interest-detection
technique: temporal-alignment-of-money-and-role
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# Node: one role-window function under the money triage score

In the politicas money layer the offline triage script ranks tie candidates by a
signal score whose inputs include the contract money signed inside the tie's
registered period. Before this application that test was a private
lexicographic comparison in the script, which broke four of the technique's
rules at once.

## What A did

The comparison treated any missing bound as unbounded. A tie whose provenance
string read `?-2007-01-01` therefore aligned every contract signed before 2007;
an `ongoing` tie aligned every contract after its start, including rows signed
in years 3062 and 2027 and 0002; and a signature carrying a time part on the
last day of the role sorted after the end date and fell outside, so the
inclusive boundary was not inclusive. Undated and implausible signatures were
not counted anywhere.

## What B did

One pure function (`features/money/roleAlignment.ts`) returns aligned amount,
aligned count and undated count. No registered start means no window and no
aligned money. An open end is bounded by the snapshot day. Dates pass the
corpus's shared plausibility screen first and compare at day precision. The
script imports it, and a flag marks ties with an end but no start.

## Paired result (three constructed cases through both arms, same inputs)

| Case | A aligned | B aligned |
| --- | --- | --- |
| tie with end date, no start | 300 | 0 (not windowed) |
| open window, rows dated 3062, 0002, 2027 and one real 2020 row | 13000 | 8000 |
| timestamp on the last day of the role | dropped | kept |

Floor held: inclusive boundaries, plausible in-window rows and raw contract
totals unchanged; 87 money and case-loop tests green. Not measured: how many
live ties moved score, since the scoring run needs the full graph.

The seam was chosen to falsify the claim that the script already honoured the
technique. It did not; the shipped source is the pushed commit on the
project's default branch.
