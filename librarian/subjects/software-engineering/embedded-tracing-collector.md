---
subject: embedded-tracing-collector
domain: software-engineering
last_touched: 2026-10-22
dry_streak: 0
---

# embedded-tracing-collector

Born 2026-09-03 from the forge wave `forge-boa-0903`, executed in-session from the `/intake` handoff `librarian/handoffs/2026-09-03-boa.md` (run `intake-boa-0903`, source `github:boa-dev/boa` @ `665f039`, routing count 13 NONE sharing one home-if-new). Placed in the new subcategory `backend-platform/language-runtime` with eight siblings (nine of a cap of ten). Stack `rust@1.91`, two applications against the source tree, gate green at birth.

A thread-local mark-sweep collector: derived tracing with escape hatches, roots discovered by counting (internal count saturates at the total, sharing its word with the mark bit), mark-finalize-remark-sweep, ephemerons to a fixpoint with weak references as unit-valued ephemerons, a 1 MiB threshold grown at 70 percent. Structural fact: the post-collection `shrink_to(len >> 2)` is `shrink_to_fit` in disguise. Proposed law from the worker: safe-direction-only arithmetic (a liveness counter may err only toward "more alive").

No fleet consumer yet: no managed project embeds a language runtime. Return condition in `librarian/applied.md` (2026-09-03).

## 2026-10-22 - first fleet application, second stack (run `intake-apply-atgp-1022`)

`allocation-threshold-growth-policy` applied `code` / `better` at kp's generic TTL memo (node). Three earlier hunts (2026-09-03, 2026-10-14, 2026-10-22) looked for a traced heap and found none. This run looked for the technique's trigger policy instead: a reclaim fired at a constant bound on insert. The memo walked all 256 entries on every miss once the live set filled the bound. Prefix reclaim (one TTL, so insertion order is expiry order): visits per get 254.7 -> 1.97, floor identical. Shipped to kp origin. A second instance of the failure, already fixed with a budgeted resumable sweep, is on record in ascent's rate limiter. Boundary amendment "When the threshold is a hard cap": the growth rule cannot apply where the threshold is the promised memory bound, so the reclaim is made proportional to its yield instead. Single-stack finding clears (rust + node). The collector-specific rules (traced byte count, host signal, bookkeeping shrink) are still unapplied in the fleet; return when a project embeds an interpreter.
