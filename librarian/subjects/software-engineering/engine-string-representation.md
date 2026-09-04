---
subject: engine-string-representation
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# engine-string-representation

Born 2026-09-03 from the forge wave `forge-boa-0903`, executed in-session from the `/intake` handoff `librarian/handoffs/2026-09-03-boa.md` (run `intake-boa-0903`, source `github:boa-dev/boa` @ `665f039`, routing count 13 NONE sharing one home-if-new). Placed in the new subcategory `backend-platform/language-runtime` with eight siblings (nine of a cap of ten). Stack `rust@1.91`, two applications against the source tree, gate green at birth.

An immutable string as a thin pointer whose target begins with an inline vtable; Latin-1 or two-byte decided once at construction; a compile-time static table with a length-gated hash cache; zero-copy slices; a dual-encoding interner whose symbols are offset past a perfect-hash common set. Structural fact: three static vocabularies (runtime table, interner prefix, per-site literal statics) none derived from another, which is why equality must be by content. Deviations: no cached hash; concatenation probes the static table after allocating.

No fleet consumer yet: no managed project embeds a language runtime. Return condition in `librarian/applied.md` (2026-09-03).
