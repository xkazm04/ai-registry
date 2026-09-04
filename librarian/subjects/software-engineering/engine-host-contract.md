---
subject: engine-host-contract
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# engine-host-contract

Born 2026-09-03 from the forge wave `forge-boa-0903`, executed in-session from the `/intake` handoff `librarian/handoffs/2026-09-03-boa.md` (run `intake-boa-0903`, source `github:boa-dev/boa` @ `665f039`, routing count 13 NONE sharing one home-if-new). Placed in the new subcategory `backend-platform/language-runtime` with eight siblings (nine of a cap of ten). Stack `rust@1.91`, two applications against the source tree, gate green at birth.

Every host-varying behaviour as a named seam whose obligations the specification states: one override per host decision (spec requirements in the override doc, spec default as the body), a null and a blocking executor with the host bringing the loop, untraceable jobs as roots, an idle-aware job loop (1 ms minimum timer, exit when all foreground tasks idle, stop outranks everything), a contained async module loader (normalise without canonicalising, refuse outside a root canonicalised once), a monotonic/wall clock split with a construction-time can-block check. Structural fact: the documented default executor is not the installed one.

No fleet consumer yet: no managed project embeds a language runtime. Return condition in `librarian/applied.md` (2026-09-03).
