---
subject: job-coordination
domain: software-engineering
last_touched: 2026-08-27
touched_by: intake
dry_streak: 0
---

# job-coordination

First touch: [[2026-08-22-5]], external reconcile against `riverqueue/river`
@ `f748a5c` (v0.44.1). Gained `go--step-position-and-resumability`
(uncovered) — second stack; single-stack debt cleared. All three hints refuted
or outranked; the tree's first-class resumable-step feature won on evidence.

## Open leads (banked, convergence rule applies)

- The resume path must be directly testable — seedable resume state, so
  re-entry is not first exercised in production.
- Enforced-unique step names as the cheaper alternative to plan versioning —
  a legitimate point on the curve the technique should name.
- Cursor-deleted-on-completion as a two-fact encoding (frontier +
  cursor-presence distinguishes done from partway).
- Name the durability boundary of the position write (which transaction), not
  just its ordering — attempt-boundary batching is the silent degrade.

## Cross-subject proposals

- No lease renewal AT ALL in a widely-used production queue (fixed RescueAfter
  horizon instead) — a strong negative data point for lease-renewal's "any
  hold longer than minutes renews" claim.
- MetadataKeyRescueCount is a dead constant where rescue lineage was intended
  → terminal-state-recovery material.
- attempt-rewinding soft stop ("graceful shutdown is not a failed attempt") →
  background-jobs. Note: same family as the wave-1 golang-migrate deviation
  (graceful stop returning success) — opposite outcomes, same design point.


## 2026-08-27 - /intake, from an open-tree vendor repository ([[2026-08-27-openexecutive-virtual-executive]])

`terminal-state-recovery` gained "The sweep, not the claim, sets the executor ceiling".
No new technique - the material hangs off the existing verdict table.

The subject already called the blanket boot sweep an anti-pattern, thoroughly: four
verdicts, evidence requirements, lineage, registry reconciliation. **It framed the sweep
entirely as verdict correctness and never stated its deployment consequence.** A grep for
instance / scale / horizontal across `terminal-state-recovery` and `lease-renewal`
returned two incidental matches between them - a subject that models process death in
five techniques, silent on the one number process death decides.

The finding: **how many executors a job system may run is decided by its recovery sweep,
not by its claim.** The claim is usually the safe half - a conditional write is
multi-writer safe wherever the store serialises writers. A blanket requeue of every
running row at boot cannot tell an orphan from a job a live sibling holds, so a second
executor re-queues the first in-flight work and reintroduces the exact duplicate the
claim prevents. Cited `gate-sees-target` (state is a proxy for executor liveness; they
diverge precisely when a second executor exists) and `unknown-is-not-a-value` (a running
row with no lease is an absence of evidence, converted by the requeue into a definite
*abandoned*).

The reusable half is the **misattribution**, which is why the section exists at all: the
claim is the interesting primitive, so it collects the comment, the design note and the
deployment paragraph - and therefore the blame. The source carried "must run a single
instance, because the claim..." in four artifacts while the comment beside the claim
said, correctly, that the claim was safe across processes. Diagnostic written in as one
read: look at what the sweep condition examines; if it names a state and nothing else, it
is a single-writer sweep however careful the claim is.

Consequence worth noting for a later run: this makes the ceiling a design choice rather
than a property of the store, and the fix is already spelled out in the subject - once
the claim writes holder and expiry, the `adopt` verdict is defined in exactly those
terms.

## Open leads

- **The one self-terminating recurring kind.** The source had a single recurring action
  that stops on its own while every other kind chains forever. Untriaged, thin, anchor in
  the source note. Worth a look if a later run touches recurring-work vocabulary.
