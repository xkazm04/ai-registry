---
layer: application
type: application
subject: edge-queue-policy
technique: control-channel-headroom
stack: rust
status: forged
verified_on: 2026-10-22
verified_against: rust@1.95
applied: experiment
ab_verdict: better
---

# A pending-log queue that shed by age, in a job server

**Witness:** the tree's toolchain pin and a green `cargo test` run today. The seam is
the in-memory queue a job server fills with every job transition and every progress
sample before a writer drains it into a durable event log. It is bounded, and it is
reached only when the store is wedged. It is not a channel between peers, so this is the
technique applied to its nearest real shape, a bounded queue that two message classes
share.

**What the tree did.** A full queue evicted the *oldest* entry whatever it was, and kept
one counter, logged at warn level. A queued, succeeded, failed or cancelled transition is
the only carrier of that fact for every subscription downstream, while a progress sample is
superseded by the next one. The two classes were graded alike.

**The pair.** Store wedged, queue capacity 256, 60 jobs each emitting queued, running, ten
progress samples and a terminal transition (780 events, 180 transitions). The old policy
was modelled and asserted equal to the real queue's drop count before the other arms were
believed.

| Arm | Transitions kept of 180 | Events lost in total |
| --- | --- | --- |
| A: drop oldest (as shipped) | 58 | 524 |
| B: reserve of 16, data refused below it | 72 | 524 |
| B + eviction ladder (progress evicted first) | 180 | 524 |

The floor, total events lost, held at 524 in every arm: the queue stayed bounded and
nothing was lost that the bound did not force. With a heavier flood (100 samples per job)
the same three arms kept 7, 24 and 180. Phased arrival (every job's transitions bunched)
gave 60, 136 and 180.

**What the pair refuted.** The technique's reserve, on its own, did not carry this seam. A
wedged writer is the technique's own stated limit: the reserve holds *R* transitions and
the wedge outlasts it, so the transitions that matter are the ones lost after *R*. The
eviction ladder carried the result; the reserve was the weaker half. The reserve belongs on
a live channel whose consumer is still reading, not on a queue behind a writer that has
stopped.

**What shipped.** Class-aware eviction (oldest progress sample first; a transition goes
only when nothing cheaper is left, and an incoming sample never evicts one), a separate
counter for dropped transitions, and an error-level log for that counter. Two unit tests
pin the behaviour. The tree's own event and subscription tests stayed green.

**What it cannot do.** The classification is read from the event's kind at the drop site,
which is correct while the kinds are a closed vocabulary and wrong for a new kind added
later without a class (it would be treated as a transition and protected, the safe error).
The eviction scan is linear in the queue length and runs only on a full queue under the
ring lock. Nothing here makes a transition timely, only retained.

**Other trees read and set aside:** the single-class channels in the other Rust trees of
the fleet (an ingestion client queue, a database change-capture channel, a browser relay)
carry data of one class and signal shutdown by dropping the sender, so the technique's
skip condition applies to each.
