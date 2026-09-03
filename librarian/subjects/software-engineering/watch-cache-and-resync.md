---
subject: watch-cache-and-resync
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# watch-cache-and-resync

Born 2026-09-03 from `/intake` run `intake-kube-0903` (intake 2.3.1, round 5, all workers
Opus): forged from design entries B1, B2 and B3 of a control-plane client library (desync
as an explicit state forcing a full relist; the local replica as the read model; a
one-shot completeness barrier with a warm queue) plus the DC8 promotion, forced resync
being absent from `sync-replication`. Third subject of `operations/control-plane-operations`.
The golden path opens on the conflict with the corpus's "invalidation, not replication":
replication is correct only under four stated source properties (totally ordered,
resumable, compacting change log with an explicit desync signal), and the same
discriminator was written into `realtime-events` from the other side in the same run.
Boundaries first: `sync-replication` (cursor, tick, dirty mark, conflict policy are theirs;
this cursor is deliberately not durable because re-reading is the repair),
`client-fetch-cache`, `delivery-guarantees`. Techniques: `desync-is-a-state`,
`atomic-swap-at-initial-sync`, `completeness-barrier-with-a-warm-queue`,
`one-stream-fanned-out`, `initial-read-strategy-behind-a-gate` (renamed from
`list-strategy-kept-behind-a-gate`; it carries the consistency knob and page-size rule).
Director review: gate green, purity clean, link depths right, `use_when` on all five, the
end-of-stream reset at `watcher.rs:632` opened and read. One fetch spent on the public
resource-version document. Fleet: no project replicates a remote log; tracklight and kp
received cluster-side studies this run. Deviations for the backlog: the FSM's "testable
without a server" benefit is unrealised (private mode, no fake); store keys ignore the
minted identity so delete-recreate reuses a key; a subscriber can park with no waker; page
size pinned to another client's default.
