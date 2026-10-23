---
subject: engine-string-representation
domain: software-engineering
last_touched: 2026-10-22
dry_streak: 0
---

# engine-string-representation

Born 2026-09-03 from the forge wave `forge-boa-0903`, executed in-session from the `/intake` handoff `librarian/handoffs/2026-09-03-boa.md` (run `intake-boa-0903`, source `github:boa-dev/boa` @ `665f039`, routing count 13 NONE sharing one home-if-new). Placed in the new subcategory `backend-platform/language-runtime` with eight siblings (nine of a cap of ten). Stack `rust@1.91`, two applications against the source tree, gate green at birth.

An immutable string as a thin pointer whose target begins with an inline vtable; Latin-1 or two-byte decided once at construction; a compile-time static table with a length-gated hash cache; zero-copy slices; a dual-encoding interner whose symbols are offset past a perfect-hash common set. Structural fact: three static vocabularies (runtime table, interner prefix, per-site literal statics) none derived from another, which is why equality must be by content. Deviations: no cached hash; concatenation probes the static table after allocating.

No fleet consumer yet: no managed project embeds a language runtime. Return condition in `librarian/applied.md` (2026-09-03).

## 2026-10-22 - first fleet application, second stack (node)

Run `intake-apply-dual-enc-1022` (`/intake apply`). The 10-14 hunt looked for a compiler and found none; this one looked for the interner shape alone and found a metric-key interner in politicas' database instrument (closed vocabulary, arrival-order indices in a zeroed typed-array ring, a 256-entry statement memo in front). Paired experiment over a 300-statement replay: the fixed prefix left steady-state cost unchanged (A 8.0/7.9 ns, B 7.6/8.2 ns), with the snapshot byte-identical as the floor, so `not-better`. Seeded read past the ring fill: A charged 212 phantom samples and failures to the first-arrived key, silently, while B (zero unused) kept 41 of 41 named rows intact. Boundary amendment appended to `dual-encoding-symbol-interner` § When not to use it: a fixed vocabulary is necessary but not sufficient for the prefix, and the unused zero earns its keep wherever symbols sit in zeroed storage. No product change shipped. Two-interner alignment and the sentinel remain unapplied, and the return condition is a project with a compiler of its own.
