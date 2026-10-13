---
layer: application
type: application
subject: parliamentary-data-modeling
technique: membership-window-modeling
stack: node
status: forged
verified_on: 2026-10-13
verified_against: node@24
applied: code
ab_verdict: better
---

# Node profile page: a seat is current only while its window is open

The politicas repo stores one `membership` row per zarazeni stint, and the ingest
already follows the technique's key rule: the natural key carries the window start, so
a same-body rejoin stays two rows. The ingest keeps the raw end value and counts
duplicate keys. The defect sat one layer up, where the profile page decides which
committee seats a member holds *now*.

## Two adapters, one absence, two answers

The mandate window on the same page (the career spine) suppresses an end date that is
unreadable or later than the page's as-of date, and reports a closed window with such
an end as not running. The committee-seat code read the same absence the other way: an
unparseable end, or the year-2925 placeholder the publisher's dumps carry, counted as
current, because a future end compares greater than the as-of instant. A seat whose
end is a typo therefore rendered with full emphasis beside a flag that said the end
was unreadable. An end before the start was a silent past seat with no disclosure.
The technique's rule ("unknown end dates need a separate state and must not pass the
current-membership predicate automatically", impossible windows suppressed and
counted) was violated on the consumer side of a correct ingest.

## What changed

A pure predicate classifies the window as open, closed, unknown or impossible; only
open is current, and unknown or impossible set the existing unreadable flag. Nothing
is repaired. Shipped in the project as one commit with its test.

## Verdict

Mode `code`, proof `ab-paired`, n=5 fixture windows, both arms run in one test file.
Target: placeholder, unparseable and inverted ends read as current or undisclosed:
A 3 of 3, B 0 of 3. Floor, tolerance 0: open and past-ended seats keep their old
answer, A equal to B on both; the project's profile unit tests stay green (84 of 84).
Positive control: arm A is the previous logic copied verbatim and reproduces the
defect on the placeholder input before arm B is asserted.

Seam chosen to falsify: the project had written a comment choosing the opposite
("an unreadable end proves nothing about the seat having ended"), so the finding could
have lost to a deliberate decision. It held because the page already disclosed the
doubt and then contradicted it with emphasis; the cost is that a member whose
placeholder-ended seat is truly held now renders de-emphasized with the flag, which
the owner may want to review.

## What the realization cannot do

No raw dump was available locally, so how many real rows carry a placeholder end is
not measured here, and the fixture cannot say whether the seat is truly held. The
technique's half-open normalization and sub-day precision rules were not exercised.
