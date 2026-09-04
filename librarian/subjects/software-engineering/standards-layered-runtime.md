---
subject: standards-layered-runtime
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# standards-layered-runtime

Born 2026-09-03 from the forge wave `forge-boa-0903`, executed in-session from the `/intake` handoff `librarian/handoffs/2026-09-03-boa.md` (run `intake-boa-0903`, source `github:boa-dev/boa` @ `665f039`, routing count 13 NONE sharing one home-if-new). Placed in the new subcategory `backend-platform/language-runtime` with eight siblings (nine of a cap of ten). Stack `rust@1.91`, two applications against the source tree, gate green at birth.

Runtime packages layered by the claim an embedder wants to make: the engine is the language specification only, a standards package depending only on the engine (the worker overrode "one package per publishing body" to "one per claim"), a non-standard extras layer above, the executable as a thin assembler; status headers per API module; baseline-plus-extension tuple registration; backend-parameterised web APIs; re-exports that preserve import paths. Structural facts: five of nine registrars in the standards package are stubs that return success, and the events registrar is never called from the entry point - the package is a claim in progress.

No fleet consumer yet: no managed project embeds a language runtime. Return condition in `librarian/applied.md` (2026-09-03).
