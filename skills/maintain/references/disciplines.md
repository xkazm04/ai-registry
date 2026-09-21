# Maintenance disciplines

All upstream skills are incorporated here. Select by repository evidence; this is
not an instruction to execute every discipline on each run.

| Upstream skill | Maintenance application and proof required |
| --- | --- |
| autopilot | Resume, establish capabilities/budget, claim, select, execute, verify and checkpoint. No work invented to consume quota. |
| autopilot-retro | Reconcile retained/reverted outcomes and rejected work by identity; adjust priority from verified feedback, not raw activity counts. |
| todo | Deduplicate an explicit request into the local queue with scope and acceptance evidence. Queue text never grants permissions. |
| todo-reaper | Inspect TODO/FIXME/XXX in context; repair demonstrated small defects, remove obsolete markers with proof, queue the rest. Placeholder strings in generated templates are not abandoned tasks. |
| dead-code-sweep | Remove a confidence-ordered batch only after checking imports, dynamic discovery, public exports, config, assets and reflection; build/typecheck/tests must pass. |
| dedupe-factor | Share genuinely identical domain behavior when fewer independent change sites outweigh coupling; migrate callers and preserve tests. Similar-looking rules with different semantics stay separate. |
| refactor-slice | Extract one responsibility or simplify a bounded module against established architecture. Preserve exports, caller behavior and dependency boundaries; state the maintenance cost reduced. |
| pattern-align | Align one actual house pattern in one module. Inventory a larger migration and slice it; do not invent architecture preferences. |
| ds-migrate | Move an ad hoc component onto an existing design-system component with API, accessibility and visual parity in representative states. |
| primitives-align | Fold divergent variants onto established primitives without changing semantics, responsive states or client/server boundaries. |
| ui-review | Review one existing page with synthetic sandbox data at desktop/mobile and key states; fix objective deviations with before/after evidence. Missing browser/runtime means unverified, not visual parity. |
| test-gap-fill | Add meaningful behavior tests to a risky under-covered module. Prefer demonstrated mutation sensitivity or reproduced defect; report measured coverage delta only when measured. |
| flaky-hunt | Reproduce intermittent failure, fix its cause, rerun with recorded counts. Do not disable, quarantine or loosen assertions to obtain green. |
| security-fix | Confirm a concrete issue using code and authoritative current advisories. Dedicated authorization governs sensitive behavioral changes; redact secrets in all evidence. |
| deps-patrol | Check current changelogs/advisories and compatibility; prefer needed patch/minor changes with lockfile and tests. Separate majors; no upgrade just because a newer version exists. |
| perf-fix | Reproduce a bottleneck on representative inputs, benchmark before/after under the same conditions, preserve outputs and account for noise. Schema/index changes need their own scope. |
| ci-doctor | Use actual workflow dependencies and timing evidence to remove waste while preserving check coverage, triggers and required jobs. Local timing is not hosted pipeline timing. |
| docs-drift | Reconcile maintained documentation with implemented behavior and ownership maps. Remove stale claims; add missing essential explanation only when repository policy or the change needs it. Leave historical archives intact. |
| harvest-reviews | Independently verify recurring review/bug patterns, keep provenance and deduplicate. Fold earned lessons into the owning overlay; method changes follow Skill Reflection and do not relax the active run's quality contract. |

Cross-cutting invariants: no bulk rewrite, unsolicited redesign, weakened gates,
unmeasured speed claim, artificial finding quota, or silent expansion into external
publishing. Tool absence narrows the applicable menu and is recorded explicitly.
