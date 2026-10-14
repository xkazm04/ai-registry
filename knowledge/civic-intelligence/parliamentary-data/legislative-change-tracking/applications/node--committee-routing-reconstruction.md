---
layer: application
type: application
subject: legislative-change-tracking
technique: committee-routing-reconstruction
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Committee routing in the print-register ingest - the unreadable row that vanished

The civic-data workspace (`politicas`) collapses the register's committee-event
log in `parseCommitteeAssignments` (`lib/ingest/sources/psp-legislation.ts`).
It already satisfied most of the technique: a status ladder with strongest-wins,
an explicit `unknown` member ranked below every real status, the token kept out
of the renderer's label catalog, lead-wins role collapse, and the date taken
from the linked history step at the strongest status. The sibling application
on fate dating covers those. This one records what the seam hunt found beyond
them.

## Seam chosen to falsify

The technique's closing section says an unknown code must remain visible even
when an earlier row is understood. The collapse met the ranking half of that
(unknown never lowers the status) and violated the visibility half: a pair
whose log held both a documented row and an unreadable one was published as the
documented status alone, byte-identical to a pair with no unreadable row. A
test asserted exactly that, which is how it survived: "unknown never outranks a
documented status" was written as the goal and also froze the erasure.

## A and B

Input: the live `tisky.zip` committee-event table, 15,739 rows, 11,383
(print, committee) pairs, read 2026-10-14. Documented codes cover 15,738 rows;
one row carries an undocumented code (4).

- A (as shipped): that row is invisible. Pairs whose log holds an unreadable
  row but publish no sign of it: 1 (a committee listed as a further committee
  of one print, unreadable row at a history step earlier than the referral).
- B (collapse also returns the distinct unrecognised codes per pair, absent
  when there are none; the graph writer passes them onto the edge): 0 hidden.

Target: hidden unreadable rows, A 1, B 0. Floor: reported status and date
unchanged for all 11,383 pairs; the pair-level fields of every other pair
unchanged and the new field absent on them; the existing parser tests green.

## What the live data says

Unreadable rows are rare (one in fifteen thousand), so this is a visibility
fix and not a correctness one: no published status changed. The row's meaning
is not documented, and the technique's rule stands that it stays unknown until
documented, so the fix deliberately does not guess whether it is a withdrawal.
The collapse still reports strongest-ever status, which does not say who holds
the print now; the register documents transitions, but this ingest does not yet
model them. That gap is left open and is the return condition below.

## What this realization cannot do

It does not read a revocation or reassignment: it can only say that an
unreadable code exists. A consumer that wants "current committee" still has no
input to derive it from.

## Return condition

When a documented transition code for the unreadable value is found, extend the
status mapping with that evidence and decide whether the collapse can report a
current assignment alongside the historical one.
