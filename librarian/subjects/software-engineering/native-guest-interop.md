---
subject: native-guest-interop
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# native-guest-interop

Born 2026-09-03 from the forge wave `forge-boa-0903`, executed in-session from the `/intake` handoff `librarian/handoffs/2026-09-03-boa.md` (run `intake-boa-0903`, source `github:boa-dev/boa` @ `665f039`, routing count 13 NONE sharing one home-if-new). Placed in the new subcategory `backend-platform/language-runtime` with eight siblings (nine of a cap of ten). Stack `rust@1.91`, two applications against the source tree, gate green at birth.

How a host value crosses into a guest object: an 8-byte-aligned C-layout cell with a compile-time assertion and a boxed escape hatch, typed downcast into a checked handle, a `Copy` bound on closures that follows where the closure is stored (a traced cell versus a rooted job), exact-or-error conversion at every integer width with omission only for the 32-bit float, host futures as promises via native async jobs, class-from-impl with a documented borrow hazard. Structural facts: signed and unsigned wide widths disagree on the safe-integer boundary; native closures are stored fat while host data is thin. Deviation worth an upstream issue: the class derive borrows mutably for shared receivers and panics on re-entry.

No fleet consumer yet: no managed project embeds a language runtime. Return condition in `librarian/applied.md` (2026-09-03).
