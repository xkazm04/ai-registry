---
subject: versioning-snapshots
domain: software-engineering
last_touched: 2026-08-22
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
