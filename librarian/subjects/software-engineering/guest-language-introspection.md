---
subject: guest-language-introspection
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# guest-language-introspection

Born 2026-09-03 from the forge wave `forge-boa-0903`, executed in-session from the `/intake` handoff `librarian/handoffs/2026-09-03-boa.md` (run `intake-boa-0903`, source `github:boa-dev/boa` @ `665f039`, routing count 13 NONE sharing one home-if-new). Placed in the new subcategory `backend-platform/language-runtime` with eight siblings (nine of a cap of ten). Stack `rust@1.91`, two applications against the source tree, gate green at birth.

Engine internals exposed to the guest language behind a flag: a modular non-enumerable debug global (in the CLI, not the engine, so embedders cannot receive it), a per-function trace bit on the code block that survives suspension, representation probes (shape identity, element storage kind, string encoding), guest-settable limits and optimiser switches, a realm factory. Structural fact: the debug global appears in no test file anywhere in the checkout, so the recorded purpose - engine tests written in the guest language - is unrealized. Deviations: a one-call trace clears the persistent mark; the realm factory builds a throwaway context.

No fleet consumer yet: no managed project embeds a language runtime. Return condition in `librarian/applied.md` (2026-09-03).
