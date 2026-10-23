---
layer: application
type: application
subject: legislative-change-tracking
technique: sponsorship-and-rapporteur-roles
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Signature rank in the print-register ingest - later joiners restart at 1

The civic-data workspace (`politicas`) reads the register's signature table
(`predkladatel.unl` in the `tisky.zip` open-data dump) in three places: the
parser `parseSponsorRoles` and the per-member split `splitBillAuthorship`
(`lib/ingest/sources/psp-legislation.ts`, `lib/ingest/sources/psp-activity.ts`),
and the law dossier's read side (`features/lawwatch/getLawData.ts`). The first
application (2026-10-14) fixed the missing-rank rule in the parser. This one
took the half that application left open, contradictory duplicates, and the
replay over the whole dump turned up a larger defect beside it. The project's
code is public; the change is commit `d668a88` on its default branch. Node 24
is the version the project's own CI and engines pin.

## Seam chosen to falsify

The technique says to surface contradictory duplicate ranks rather than keep
the lowest. The seam could have shown that the case never happens in the
dump, which would have made the rule dead weight here. It happens once:
one bill lists one later-joining member at rank 1 and at rank 2, beside a
submission-time list that already holds ranks 1 to 3. Lowest-rank dedupe
made that member a second first signatory.

Counting rank-1 holders per bill while measuring that case gave a stronger
result: 21 bills in the full dump have two different members at rank 1. In
every one, one row is submission-time and the other joined later. Of the 23
bills carrying both kinds of row, 21 restart the joiners' numbering at 1.
In 3 of 3 sampled, the bill's own proposer text names the submission-time
signatory. "Rank 1 is first signatory" had been implemented as written, and
as written it is wrong for this register. The technique gained the boundary
section on restarting ranks from this seam.

A second check could have broken the fix. Six bills hold only joined-later
rows. If a joined-later rank 1 could be the real proposer, those bills
would show it. They do not: on both bills checked, the proposer text names a
member who is absent from the table entirely, and the old rule had credited
the first joiner instead.

## A and B

Input: the public `tisky.zip` read 2026-10-22, 27,324 signature rows,
27,323 (bill, member) pairs, 5,738 bills; the published per-member split runs
over the current term's 79 member-authored bills, 156 members.

- A (as shipped): first signatory = rank 1, rows counted one by one,
  lowest rank kept on a duplicate.
- B: first signatory = rank 1 on a submission-time row, with the list ordered
  submission first, then joiners; contradictory duplicates keep rank unknown
  and carry the conflicting values; the split counts pairs and has a third
  bucket for unknown rank.

Target: bills with two first signatories, A 21, B 0 under the new rule (the
replay's raw rank-1 count stays 20 because rank is kept as published, and
only the role changed). The term split moves for 11 of 156 members: 10
lose a false first-signed bill, and 1 loses a double count. Floor: rank
unchanged on 27,322 of 27,323 pairs; authored-bill totals unchanged for all
156 members; the project's gate green (382 test files, 4,208 tests,
typecheck, copy check). Six new tests fail on the old source.

## What the tree's shape says

The read side derived the role from rank again, independently of the
ingest, so fixing only the writer would have left the dossier crowning
joiners. The rule now lives in one exported predicate, and both sides call
it. The authored-bill total that feeds the published contribution formula
still counts rows, not pairs, because the project versions that formula by
reference. On this dump that leaves exactly one member whose split falls
one short of the total, and the writer's existing mismatch warning now names
a real duplicate instead of never firing.

## What this realization cannot do

It does not take the proposer from the bill row on the six bills where the
table lacks one; those bills show no first signatory, which is true of the
table but not of the bill. It was measured on the public dump, not on the
stored graph, so how many stored edges carry the false role is inferred.

## Return condition

When the next roles backfill runs against the store, read its conflict line
and the split-mismatch count (expected 1 and 1), and decide whether the six
proposer-less bills take the bill-row proposer as a separately sourced
claim.
