---
subject: job-coordination
domain: software-engineering
last_touched: 2026-09-03
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


## 2026-08-28 - /intake cross-repo lane ([[2026-08-27-openexecutive-virtual-executive]])

The amendment landed the day before was taken into a connected `rust` consumer
and **confirmed from the direction that makes it hardest to notice**. The
existing `rust--terminal-state-recovery` application was extended rather than
duplicated; `verified_on` moved to 2026-08-28 and `verified_against: rust@1.96`
added, both earned - every citation in the document was re-resolved.

The structural fact, which nobody designed: the consumer had built a
heartbeat-lease leader election, whose own module doc states that several
processes run against one local store and that each runs its own copy of every
background loop. That module deferred the gating to "a later phase" and scoped
the deferral to the background **loops**. The boot recovery sweep runs about a
hundred lines before leadership is even constructed, and its passes key on
state alone - so a follower marks the leader's live work failed. **Loop gating
was deferred as the safe simplification, and the one caller that could not
safely wait was not on the list**: a follower's loops merely duplicate work
going forward, a follower's sweep destroys work already in flight.

This sharpens the amendment rather than merely instancing it. The amendment
says the constraint gets misattributed to the claim. Here there is no claim to
misattribute it to - the sweeps are unconditional statements - so the ceiling
is recorded **nowhere at all**: no config pins the instance count, no comment
says single-instance, and the limit survives only as a premise in a sentence
("their processes died when the app last exited") that stopped being true when
a different module shipped. **A limit carried by a stale comment is worse than
one carried by the wrong line**, and it is the form the amendment's diagnostic
still catches, because the diagnostic reads the sweep's condition rather than
the prose.

Fix landed in the consumer the same day: a read-only lease peek before the
destructive passes, deferring to a live leader, single-instance behaviour
byte-for-byte unchanged. Not compile-verified - the consumer's build fails on
this machine before the compiler runs, for a pre-existing reason confirmed by
reverting the change and reproducing the identical failure.

Also landed as a currency correction: two of the application's structural
citations had gone stale to one cause (a large startup closure lifted into a
module of named phase functions, and the engine's execution methods moved out
of the module root). The file survived the move and its contents did not, so
the old line numbers now resolve to unrelated registration entries - the
failure mode a line citation has when only the contents move.


## 2026-09-02 - intake `deer-flow` ([[2026-09-02-deer-flow]], run intake-deer-flow-0902)

**`lease-renewal` amended: "Absent is not lost, and a teardown is a held
state."** The two-way-channel section said a renewal reporting zero rows
means the lease is no longer ours; a harness's sandbox-ownership store paid
twice for that being one fact short. Lapsed (key absent, nobody holds) versus
lost (a peer holds): collapse them and a store flush evicts every live holder
at once. Renewal re-establishes on lapsed, stops on lost, and treats an
unanswerable store as unknown - the one deliberately fail-open path, while
adoption and reaping stay fail-closed; a reaper waits a full TTL of observed
unownership before adopting after a flush. For a lease over a *resource*:
take (unconditional, acquire path) versus claim (conditional, adopt/reap
path); an owned-versus-destroying state; and the destroying marker held on
the renewal cadence for the stop's duration with the release as the
heartbeat's last act.

**Applied not-better, and the condition landed.** A fleet job runner keeps
its lease as a column on the job row with attempt-fenced writes; zero rows
has one meaning there and the split protects nothing. The amendment's
closing paragraph now says when it applies. Separately, that tree discards
its heartbeat's boolean - the base technique's own two-way-channel rule,
unbuilt - recorded in the project's ledger as the few-line change owed.


## 2026-09-02 - /intake openbao (run intake-openbao-0902)

One amendment, one application, and the run's most useful `not-better`.

- `lease-renewal` gained "Renewal must not queue behind the work": the
  renewal is a write and needs a slot; if it shares a bounded pool with
  the work, a saturated pool reaps a live executor. The source's fix
  (transaction limit one below the connection limit) is the multi-writer
  half. **The single-writer half inverts it**, measured with a fleet
  project's own parameters (busy-timeout 5 s, TTL 120 s, renew at 40 s):
  a dedicated renewal connection failed at 5.5 s where the shared writer
  waited 6 s and succeeded. The bound on that engine is "longest write <
  TTL - renewal cadence", a property of the work.
- Applied to the job runner's store (`sql--lease-renewal`, `experiment`,
  `ab-paired`, `not-better`) - the condition is written into the
  technique. The server-store half (pool of 5, no reserved slot) is a
  prediction the store's own write-lock-wait meter could measure.

## 2026-09-02 - intake `deer-flow` v2 back half ([[2026-09-02-deer-flow-v2]], run intake-deer-flow-0902-v2)

Source-tree application added (python, against the source's own clone at
`08b27aef`), from the v2 design record's catch: the tree realises this
subject's forces one layer up from where the corpus wrote them. The design
record and its routing count live in [[2026-09-02-deer-flow-v2-replication]];
the catch, the anchors verified against the fresh clone, and what the tree
adds to the technique are in the application document itself.

## 2026-09-03 - `/intake` lightrag (run `intake-lightrag-0902`, intake 2.2.0, Opus workers)

New technique `liveness-proof-reclaim`: when legitimate job duration is unbounded no lease TTL is pickable, so a stale holder is reclaimed only on proof the holder is dead (an identity probe), never on a timer. Argued as a technique rather than a lease-renewal amendment: every rule there is parameterised on a renewable TTL and never reaches the holder that cannot renew. Spine item 2 gained the clause. Source-tree application. Deviations: the source keeps an alive-but-hung holder busy forever by design; reclaim no-ops off one platform with no runtime warning (the run`s task row).
