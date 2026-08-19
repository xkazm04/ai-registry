---
layer: technique
type: technique
subject: legislative-change-tracking
technique: statute-collision-clustering
status: forged
laws: [lead-not-finding, every-cap-ships-its-population]
shared_with: []
use_when:
  - detecting overlap between pending bills
  - partitioning omnibus bills per target statute
---

# Statute collision clustering

Two pending bills that issue amendment instructions against the same provision
of the same statute are on a collision course: whichever is enacted second
will amend text the first already changed, and the drafters of at least one of
them are working from a version of the law that will not exist by the time
their bill passes. Surfacing these overlaps *while both bills are pending* is
one of the highest-value products of legislative tracking — and one of the
easiest to get catastrophically wrong, because the naive implementation
(same provision number appears in both bills' text) is almost pure noise.

## Procedure

1. **Slice each bill to its operative text.** A bill document concatenates
   the amendment articles with an explanatory memo, and memos cite unrelated
   law liberally. Cut from the first operative marker (the opening article or
   part heading) to the memo heading; consolidated-text companion documents,
   which carry no memo, are used whole with a defensive trim. Normalize the
   extracted text's Unicode form at the single point it is read — text
   extraction tools can emit the same accented character in two encodings
   within one document, silently breaking pattern literals.
2. **Partition the operative text per target statute.** An omnibus bill's
   articles each amend a different statute; split on article boundaries and
   attribute each block to the statute cited near the block's top. Blocks
   that cite no statute of their own go into an explicit "unknown" partition
   — never attributed to the nearest neighbor. Without this step, a flat
   same-number check "collides" § 5 of the tax statute with § 5 of the
   pension statute because both live in one omnibus document.
3. **Within each statute partition, keep only provisions that pass the
   instruction grammar** — mentions do not collide; only operations do.
4. **Cluster across bills by (statute, provision).** A cluster of two or
   more distinct pending bills operating on one provision is a collision
   candidate. Sharpen with sub-unit targeting where the grammar recovered
   it: same-paragraph overlap outranks same-provision overlap.
5. **Emit clusters as a ranked review queue, not as findings.** Each item
   carries the bills, the statute, the provision, the sub-units, and the
   text blocks that triggered it, so a human can adjudicate from the item
   alone.

## Decision rules

- **A collision cluster is a lead until a human has read both blocks.**
  Co-targeting is a fact; *conflict* is a judgment about whether the edits
  are compatible (two bills appending different letters to one paragraph may
  compose cleanly). Publish the fact as co-targeting; publish "conflict"
  only after review, and label which happened.
- **When the corpus is capped, ship the cap with every count.** Collision
  sweeps typically run over a cached subset of bill documents (fetch
  failures, formats that resist text extraction). "N collisions found" over
  a partial corpus is a floor; state the denominator — how many pending
  bills had readable operative text — or the number reads as a census.
- **Rank by specificity, then by both bills' procedural velocity.** A
  same-paragraph collision between two bills that both cleared committee
  outranks a whole-provision overlap where one bill is dormant. Fate data
  (see the dating technique) is the ranking input.
- **Keep hand-read verdicts as labeled fixtures.** Every adjudicated
  cluster — genuine or incidental — becomes a regression case; the
  incidental ones in particular document the false-positive classes the
  pipeline must continue to suppress.

## When not to use it

Do not run collision clustering over enacted statutes — sequencing is
resolved there by enactment order and the question becomes consolidation,
a different subject. Do not use it to infer political coordination or
obstruction: two factions amending one provision is exactly what a
contested policy area looks like, and reading intent into co-targeting is
an editorial act the data does not support. And do not extend clusters
across statutes ("both bills touch pension law") — at that grain the
technique degenerates into topic modeling, and the collision framing, with
its implication of textual incompatibility, becomes misleading.
