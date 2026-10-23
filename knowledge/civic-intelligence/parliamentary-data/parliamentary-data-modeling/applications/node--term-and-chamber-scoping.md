---
layer: application
type: application
subject: parliamentary-data-modeling
technique: term-and-chamber-scoping
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: task
ab_verdict: better
proof: ab-paired
---

# Node chamber store: a term read that stopped one level below the chamber

The node version is witnessed by the repository's CI workflow, which pins node 24.

The politicas repo follows the ingest half of the technique closely. One function maps
the publisher's term organ id to the human term code. A term body it cannot resolve gets
a visibly synthetic `ORGAN<n>` token. Mandates and roll calls carry both the id and the
code, and a source-reading test fails if the fallback is spelled a second way. Person
and body registries are loaded in full across terms, so identity is never term-scoped.
That made the read half the seam most likely to falsify the technique, and it was chosen
for that reason.

## The seam

Mandates and roll calls carry a stamped term code. Memberships do not: a membership
names an organ, and the organ's place in the body tree decides its term. The store's
term-scoped membership read placed a row in the term when its organ was the chamber or
had the chamber as its direct parent. The technique says the chamber-in-term is an
ancestor of every body inside it. The store implemented "ancestor" as "parent".

The publisher's tree is deeper than one level. A subcommittee hangs under its committee,
an interparliamentary group under the union that hosts them, and a working group under a
committee. Each of those is two or three levels below the chamber.

## The paired read

Replay of both predicates over the publisher's full registry dump as published on
2026-10-22, one term at a time:

| term | arm A (one level) | arm B (any depth) | rows only B returns |
| --- | --- | --- | --- |
| current (10th) | 1,345 | 3,260 | 1,915: 781 subcommittee, 1,134 group; 201 persons, 120 bodies |
| 9th | 1,363 | 3,216 | 1,853 |
| 4th to 8th | | | 1,140 to 1,961 each |
| 1st to 3rd | equal | equal | 0 (flat tree) |

- **Target:** term membership rows the scoped read returns. 59% of the current term's
  rows were missing under A.
- **Floor:** no row that A returns is missing from B, in any of the ten terms. No term
  code collides with another body's abbreviation, so A's scalar lookup never failed.
- **Fixture A/B:** a new store test adds a subcommittee under a current-term committee
  and one under a prior-term committee. Under A the current-term read misses the first
  (8 of 9 pass). Under B it returns the first and not the second (9 of 9). The
  neighbouring store, analysis, profile and election suites pass 846 of 846 under B.

## What the missing rows had become

The store holds every membership row, so the gap existed only in the read. It had then
been recorded as a fact. An earlier analysis batch measured "zero current-term
memberships reference any subcommittee" through this read. Three code comments repeated
that figure as the reason subcommittees are never counted, and a prose-checking gate
excludes the word "subcommittee" on the same basis. The contribution formula's own list
of committee body types includes subcommittees. The formula intended to count them, and
the term read was the only reason it never received one.

This is the technique's population check, run where nothing ran it. "All N rows of term
X" was never stated for memberships, so a 59% shortfall went unnoticed. It is also the
missing-is-not-zero law: a count taken through a read that cannot see the rows is an
absence of observation, not a zero.

## Why the fix is a task and not a commit

The read fix is small, and on its own it is correct. Its downstream effect is a scoring
choice. Under the current formula (distinct bodies, saturating at three), recomputing
through a depth-correct read would change the committee count for 173 of 207
current-term members. It would move the committee component for 51 of them, by +361.3
points in total. The interparliamentary groups are not committee types and move nothing.
Whether a subcommittee seat should count toward committee breadth is the owner's
decision. The two options are to keep the type and recompute, or to drop the type in the
same change.

So the project's default branch received the corrected comments and a plan, and the
read fix waits on a branch with its fixture test.

## What this realization cannot do

- The measurement uses the public dump, not the stored graph. No local store was
  reachable. The score impact is computed with all-time windows, the way the
  contribution writer does it.
- The membership row still carries no term code. Scope is derived from the body tree on
  every read. A stamped term column would make "everything in term N" a column scan, as
  the technique prefers. The tree walk is correct but has to be repeated by every reader
  that bypasses the store.
- Several consumers still name the current term with a literal rather than one shared
  constant. They all agree today. This is the drift the technique's one-definition rule
  predicts, and it was not changed here.
