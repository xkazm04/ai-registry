---
subject: declarative-resource-lifecycle
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# declarative-resource-lifecycle

Born 2026-09-03 from `/intake` run `intake-kube-0903` (intake 2.3.1, round 5 of the 2.x
series, every worker Opus): a scoped forge handoff over the resource-lifecycle system of a
control-plane client library, where design entries A3, A4, D1 and E1 carried `corpus: NONE`
and the HOME-IF-NEW clause fired on all four. First subject of the new subcategory
`operations/control-plane-operations`, created by the director because `service-operations`
was at eight of ten and the forces (independent writers converging on one record, no lock,
no transaction) are not service operation. Boundaries stated first: `entity-lifecycle`
(states for the product's sake vs contracts for independent writers), `concurrency-guards`
(refuses to elect a writer; the witnessing tree ships no leader election),
`job-coordination` (durable job state stays there), `authorization` (grades the caller,
in-process, one failure direction). Techniques: `deletion-blocked-until-dependents-confirm`
(admits soft-delete column plus a named reaper as the degraded case, under one removal door),
`ownership-edges-that-enqueue-the-parent`, `per-field-write-ownership` (kept as one
technique: every conflict path is a ledger mutation), `synchronous-gate-before-persistence`.
Director review: gate green, purity clean (the worker caught "overwhelming" containing
"helm"), `use_when` on all four, link depths right, the guarantee line at `finalizer.rs:101`
opened and read. Spec: `docs/subject-proposal-declarative-resource-lifecycle.md` (EXECUTED).
Fleet: no project runs a control plane; tracklight's fence-token lease reclaim is the nearest
instance, named only in the application. Apply step is a source-tree task (uid precondition
on marker removal, tests where there were none). Deviations for the backlog: the removal
helper guards on name-at-index not minted identity; the finalizer module has zero tests; the
deadlock is documented without either operator escape; cascade shape is chosen implicitly.
