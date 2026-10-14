---
domain: game-production
subject: rigid-body-simulation-stability
last_touched: 2026-10-14
touched_by: intake-px1014
dry_streak: 0
---

# rigid-body-simulation-stability

## Founded - 2026-10-14

Forged in-session from a physics-engine repository's tuning guides (source note
`2026-10-14-nvidia-physx.md`, spec `librarian/handoffs/2026-10-14-rigid-body-simulation-stability.md`).
Five techniques, two applications. Home chosen because no bundle modelled solver
stability; neighbours are `racing-vehicles` (feel, not a solver) and
`gameplay-runtime-patterns` (update order). Corroborated by two soft-constraint and
solver-comparison primaries the worker fetched; two source claims were overridden by
them (implicit-spring saturation, the stability bound). One measured application from a
fleet integrator. Category `engine-integration` is now full (10 of 10).

Unverified in this subject: the N-squared growth of cloned-scene contacts (inference),
reflected-inertia from a secondary source, mass-ratio limits (not stated as rules).
Return: re-verify against a second tree that runs a constraint solver.
