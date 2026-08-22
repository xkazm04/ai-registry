---
domain: software-engineering
subject: fleet-orchestration
last_touched: 2026-08-22
touched_by: research
dry_streak: 0
---

# fleet-orchestration

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-22 - `/research`, from a practitioner codebase

Gained two techniques (6 -> 8) and an application from
[[../../sources/2026-08-22-onecli-repo]]: `outbound-compute-plane` (the
executor plane dials out; single-use bootstrap tokens; the store's one door)
and `substrate-reconciliation` (deletion reaches compute by convergence; the
fence stack), plus `node--substrate-reconciliation` verified against the
public tree @ ff7a192. Both were missing *stages*: the GP owned the registry
and never said how the compute connects or how the substrate is kept aligned.

## Open leads

- The boundary between substrate-reconciliation's inward direction and
  job-coordination/terminal-state-recovery's boot sweep is stated on both
  sides; if either subject is next swept, confirm it reads as one seam.

## Declines

None.
