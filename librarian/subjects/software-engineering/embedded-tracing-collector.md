---
subject: embedded-tracing-collector
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# embedded-tracing-collector

Born 2026-09-03 from the forge wave `forge-boa-0903`, executed in-session from the `/intake` handoff `librarian/handoffs/2026-09-03-boa.md` (run `intake-boa-0903`, source `github:boa-dev/boa` @ `665f039`, routing count 13 NONE sharing one home-if-new). Placed in the new subcategory `backend-platform/language-runtime` with eight siblings (nine of a cap of ten). Stack `rust@1.91`, two applications against the source tree, gate green at birth.

A thread-local mark-sweep collector: derived tracing with escape hatches, roots discovered by counting (internal count saturates at the total, sharing its word with the mark bit), mark-finalize-remark-sweep, ephemerons to a fixpoint with weak references as unit-valued ephemerons, a 1 MiB threshold grown at 70 percent. Structural fact: the post-collection `shrink_to(len >> 2)` is `shrink_to_fit` in disguise. Proposed law from the worker: safe-direction-only arithmetic (a liveness counter may err only toward "more alive").

No fleet consumer yet: no managed project embeds a language runtime. Return condition in `librarian/applied.md` (2026-09-03).
