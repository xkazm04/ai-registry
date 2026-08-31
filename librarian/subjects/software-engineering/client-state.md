---
subject: client-state
domain: software-engineering
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# client-state

First touch: [[2026-08-22-4]] — the 2026-08-22 harvest wave. Class: EXTENDS.

## State

6 -> 9 techniques, 2 -> 3 applications. Merged from FOUR independent scout proposals across four territories. One additive forward-pointer was added to an existing technique so the new write-path technique and the existing read-path guard do not read as rival owners.

## Open leads (banked, with return conditions)

- **the safe default is the failure you can see** (proposed law, not added). FIVE independent recurrences claimed, two of them in EXISTING techniques of this same subject (`persistence-and-migration`, `invalidation-strategy`). Tied with guard-failure-is-not-consent as the wave's best-evidenced proposal.

## Declines

- No application was written for `optimistic-write-path`. The source tree's entire optimistic-write API — mutex, compare-and-swap predicate, rollback — has zero call sites; the repo's own harness notes say so. Excellent material for a technique, but an application is a claim that a real stack realizes it in production, and unwired code is not that. The one place it is cited says plainly that it is unreferenced.

## 2026-08-29 — /deepen architecture batch (dry_streak 0)

10 techniques, 6→8 applications (rust--persistence-and-migration from personas — first
second stack; react--invalidation-strategy from systedo-case; ascent Tree B on
async-race-guards). Landed: replicated-record named as its own species (owned by
sync-replication); debounce/throttle excluded from the race-guard family; "invalidation
reaches readers, not only entries"; persistence version-skew split by payload class with
the older-build-never-writes-back invariant; paint-time revalidation cancel as
mitigation. Survived counter-evidence: per-entity mutation mutex, conditional revert,
derive-not-store, store-topology claims (atomic model = alternative realization, not
refutation). Banked: rust--status-fsms application from personas background_job.rs
(return: next round or when personas bumps the status vocabulary); retained-old-version
migration fixture (return: personas CURRENT_SCHEMA_VERSION bump). Techniques near
saturation; next yield expected from fleet deviations, not survey.

## 2026-08-31 — intake `github:TanStack/query` @ `1566c16d` ([[2026-08-31-tanstack-query]])

Gained `observed-read-subscription` + `next--observed-read-subscription`
(experiment, better, `structural-only`).

**The finding is an asymmetry, and the kind that survives a mature corpus.**
The golden path's "selective subscription" bullet models the **declared** form
— the consumer names the narrowest projection it reads — and the corpus had no
vocabulary for the **observed** form, where the framework records what was read
and infers the subscription. Both are legitimate; the observed form has failure
modes the declared form does not, and those are the technique. Neither the slug
map nor a summary could see this gap: the file genuinely covers the concept,
from one side only.

The sharpest rule is the fail-open: an **empty read set means unknown, not
"reads nothing"** (`unknown-is-not-a-value`), because a consumer that has not
yet rendered and one that reads nothing are indistinguishable at the check, and
getting it backwards means a consumer that never renders again.

Measured in `goat`: the explicit declaration appears **nowhere**, the lint
plugin is **not installed**, and the one known defeat sits in a shared wrapper
that spreads the tracked result — the propagation the technique predicts, in a
wrapper rather than a leaf. Blast radius honestly 2 consumers.

### Open lead

- **Install the lint rule** is a one-dependency repair in `goat` and would
  convert this application from a census into a standing gate. Sized and
  measured; the ask was not made at triage because the row named no project.
