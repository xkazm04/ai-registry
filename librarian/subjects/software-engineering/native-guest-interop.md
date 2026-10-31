---
subject: native-guest-interop
domain: software-engineering
last_touched: 2026-10-31
dry_streak: 0
---

# native-guest-interop

Born 2026-09-03 from the forge wave `forge-boa-0903`, executed in-session from the `/intake` handoff `librarian/handoffs/2026-09-03-boa.md` (run `intake-boa-0903`, source `github:boa-dev/boa` @ `665f039`, routing count 13 NONE sharing one home-if-new). Placed in the new subcategory `backend-platform/language-runtime` with eight siblings (nine of a cap of ten). Stack `rust@1.91`, two applications against the source tree, gate green at birth.

How a host value crosses into a guest object: an 8-byte-aligned C-layout cell with a compile-time assertion and a boxed escape hatch, typed downcast into a checked handle, a `Copy` bound on closures that follows where the closure is stored (a traced cell versus a rooted job), exact-or-error conversion at every integer width with omission only for the 32-bit float, host futures as promises via native async jobs, class-from-impl with a documented borrow hazard. Structural facts: signed and unsigned wide widths disagree on the safe-integer boundary; native closures are stored fat while host data is thin. Deviation worth an upstream issue: the class derive borrows mutably for shared receivers and panics on re-entry.

No fleet consumer yet: no managed project embeds a language runtime. Return condition in `librarian/applied.md` (2026-09-03).

## 2026-10-31 - apply:class-from-impl-with-borrow-warning (run apply-cfibw-1031)

First application of the technique against a fleet tree: pumper's component-model dynamic-app host (`crates/engine-wasm`, wasmtime 49.0.4 by lockfile, toolchain 1.96.1, commit `31714bf`). Mode simulation, verdict **not-better**, seam chosen to falsify: the interface derive hands every import an exclusive receiver, which the technique names its worst case. It cannot bite there because the host state is store-owned rather than guest-aliased, the contract declares no resource and no callback parameter, imports serialize on one fiber, and the engine refuses guest re-entry as a typed trap. Amendment landed on the technique: "When the engine owns the host state, not the guest heap", with the discriminator read from the engine source that a re-borrow only host code can trigger may panic, while one guest input can trigger must surface as a value. Side finding filed in pumper's ledger: `progress` drops a malformed snapshot silently, unlike its two sibling imports; the guest-side fix is a contract MAJOR, filed with the one pending from the 2026-10-22 async application. Return: when the contract gains a resource or a callback-carrying import, or the imports move to the concurrent model.
