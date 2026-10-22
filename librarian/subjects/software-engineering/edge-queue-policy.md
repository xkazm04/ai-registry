---
subject: edge-queue-policy
domain: software-engineering
last_touched: 2026-10-22
touched_by: intake
dry_streak: 0
---

# edge-queue-policy

First touch: 2026-09-02, forged in the intake 2.0.0 handoff over a dataflow runtime
(source note `2026-09-02-dora-v2.md`, design record D4 plus the flush half of D3).
Category `backend-platform/process-graph-runtime`. Single-stack (`rust`); a
transplant pass is owed.

## State

6 techniques, 2 applications. Owns the queue on one declared edge between two
long-lived peers: per-edge depth and overflow policy (drop-oldest by default, a
zero depth clamped to one), control-channel headroom, least-recently-used input
fairness (the lifecycle class is served ahead of the rotation, which is why an
edge-closed notice can overtake that edge's last data), eviction as a
classification (ordinary first, never the stop signal, correlated last and loudly;
compact tombstones on the drop path), in-band flush (ordinary messages only), and
drop accounting per edge and per class, honoured on every transport.

Boundaries drawn: `admission-queue` (work items with a fate; here messages have a
successor), `delivery-guarantees` (whether delivered at all; here which messages
are lost and who is told), `streaming-output` (interruption at the renderer; here
at queue admission one hop upstream).

Deviations recorded: the source's `backpressure` policy applies no backpressure
anywhere - it is a 10x buffer that drops at the cap while its spec says "blocks
sender"; drop counters exist only at the node-API scheduler; the patterns page
still states the superseded "flush discards all" rule. The intake-written
`streaming-output/applications/rust--cancellation-and-finalization.md` repeated
that stale rule and was corrected in this wave.

Proposed law from the forger (not added): *measurement lives at the site of the
decision* - a sender's handoff is not evidence of delivery; possibly a corollary
of `gate-sees-target`.

## 2026-10-22 - drop-accounting applied, first `next` application

`/intake apply drop-accounting` (run `intake-apply-drop-accounting-1022`), dispatched
on the scan's single-stack finding. The subject is no longer single-stack: an
application against a browser-to-server observation queue (cap 60, drop-oldest) in a
hiring app's live voice call. Reconciliation: a 100-observation outage acknowledged 60
with residual 40 and no counter; a hang-up lost 5 of 5 the same way. With per-cause
counters (evicted, flushed) the residual was 0 in both, and the delivered set was
unchanged. Shipped as code with a reconciliation test that fails on the old arm.

What the seam added to the technique, with no amendment needed: the reconciliation
found a discard site nobody had listed (close), and a test named for the eviction
order that never asserted it. The run's own first draft of the test also computed
delivered from the send side and missed by one. A third site, the server's
per-session storage ceiling answering `ok` while storing nothing, is the
send-side-blindness case, and it stays open in that tree.
