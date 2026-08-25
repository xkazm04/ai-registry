---
domain: software-engineering
subject: fleet-orchestration
last_touched: 2026-08-25
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

## 2026-08-25 - /intake run 10 ([[2026-08-25-19-claude-code-mistakes]])

- New technique `brief-carries-the-session` (what a fresh worker does and does not inherit; primary: the harness's subagent reference). Registered in the golden path. `agent-chaining/handoff-payload-contracts` is the chain-side sibling; boundary stated in the source note, not linked.
- New application `rust--brief-carries-the-session`: three worker classes in one companion tree, each carrying the session a different way (restated invariants with a pinning test; records injected into a sessionless call; context-map pointers). Negative finding: no brief tells the worker what it cannot see.
