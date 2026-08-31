---
subject: versioning-snapshots
domain: software-engineering
last_touched: 2026-08-31
touched_by: external-reconcile
dry_streak: 0
---

# versioning-snapshots

First touch: [[2026-08-22-11]], external reconcile against `restic/restic`
@ `a80be14` (0.19.1-dev). Gained `go--retention-and-pruning` (uncovered);
single-stack debt cleared. Two alternative hints refuted on scope grounds
(content-hash IDs carry no minting semantics; the restorer writes a
filesystem, not a versioned entity). Director-trimmed 160 -> 147, stopping
where the next cut was a finding.

## Open leads (banked, convergence rule applies)

- THE SHARPEST OF THE WAVE: winner-per-bucket thinning is
  adversary-manipulable - whoever controls the sort key controls eviction;
  timestamps not fully trusted demand at least one additive duration clause.
  The technique's retention section has no threat model at all.
- Split the reaper into unlink and reclaim - two named operations, two blast
  radii, a recovery window between "policy decided wrong" and "bytes gone".
- Every eviction decision individually explainable (reason + counter state),
  beyond policy-visible.
- Under content-addressed storage, "storage freed" is not a property of the
  retention policy - only a reachability walk computes it. The golden path's
  cost arithmetic breaks under sharing (cross-proposal to its owner).
- A declared tolerance for leftover garbage as the third option between
  retain-everything and reclaim-fully.

## Cross-subject proposals

- Retention driven by attacker-influenceable sort keys generalizes to log
  rotation and cache eviction -> a security/threat-model home; flagged for
  the librarian.

### 2026-08-31 - `/intake`, from a single-author blog archive

Amended `retention-and-pruning`. Source: [[2026-08-31-brooker-blog]].

**An enumeration break, and every member of the set had the same shape.** The
technique declared that pruning is "a *query with guards*, not an age cutoff",
and the guard list - pinned, promoted, referenced - is exhaustive over
references that exist as **rows** the query can join against. An in-flight
reader holds a version nothing points at, so no guard can see it and the version
prunes out from under a live read. The failure is invisible in the way the
pinned cases are not: the query was correct, every guard passed, and a consumer
got a hole.

**The seam supplied a third mechanism the amendment had excluded.** A managed
tree had independently built an activity gate - track *whether anyone is
reading* rather than which version each reader holds, and defer the whole pass
while the count is non-zero - and recorded the incident that forced it, with the
conclusion "the fix is not a better interval, it is to stop scheduling and start
measuring". That is available exactly where the technique had said the time
bound is unavailable, because it never asks a long reader to be short.

Two clauses came back with it. A live-reader mechanism **owes a harm bound and a
deferral count**, or it converts a data-loss bug into a silent no-maintenance
bug - the janitor's own comment says it has no harm bound and defers
indefinitely under permanent load. And **register at the store touch, not at the
response**: the natural registration point is blind to a streaming body and to a
cursor walk spanning requests, which are exactly the two long readers.

Zero of six readers in that tree carry a lifetime bound; fleet-wide it is one in
about fifteen. The collision is latent with a computed trigger - a walk
exceeding the janitor interval, ~10s mean page latency at the observed creation
rate of 5,843 revisions/day.
