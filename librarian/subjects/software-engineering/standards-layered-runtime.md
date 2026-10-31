---
subject: standards-layered-runtime
domain: software-engineering
last_touched: 2026-10-31
dry_streak: 0
---

# standards-layered-runtime

Born 2026-09-03 from the forge wave `forge-boa-0903`, executed in-session from the `/intake` handoff `librarian/handoffs/2026-09-03-boa.md` (run `intake-boa-0903`, source `github:boa-dev/boa` @ `665f039`, routing count 13 NONE sharing one home-if-new). Placed in the new subcategory `backend-platform/language-runtime` with eight siblings (nine of a cap of ten). Stack `rust@1.91`, two applications against the source tree, gate green at birth.

Runtime packages layered by the claim an embedder wants to make: the engine is the language specification only, a standards package depending only on the engine (the worker overrode "one package per publishing body" to "one per claim"), a non-standard extras layer above, the executable as a thin assembler; status headers per API module; baseline-plus-extension tuple registration; backend-parameterised web APIs; re-exports that preserve import paths. Structural facts: five of nine registrars in the standards package are stubs that return success, and the events registrar is never called from the entry point - the package is a claim in progress.

No fleet consumer yet: no managed project embeds a language runtime. Return condition in `librarian/applied.md` (2026-09-03).

## 2026-10-31 - fleet apply that changed code: baseline-plus-extension-tuple (node)

Run intake-apply-bpet-1031, dispatched for "single stack (rust)". This was the technique's first applied row and the subject's first non-rust stack. personas' browser bridge installs the WebMCP registry (`document.modelContext`) into every page it drives: the native one when the build has it, a polyfill otherwise. The tree has one registrar signature with two implementations. The seam was chosen to falsify the one-validation-door law: a caught result would have been both implementations refusing the same registrations. They did not. The polyfill returned no promise, threw synchronously, and silently replaced a tool under a taken name, which the standard refuses. Code A/B, with the draft's registerTool method steps (fetched in-run, 27 Oct 2026 draft) as the oracle, 10 cases: conformant 0/10 -> 10/10. Floor held in both arms: listing, toolchange, abort-unregister. personas cca476b278 pushed. Application `node--baseline-plus-extension-tuple--personas.md`. What the tree shows: one signature is not one door when the baseline has a fallback implementation; the fallback's refusals are part of the baseline.

Banked, not written (Phase 5 scores, both GAIN 1 RISK 0 COST 1, below +2):
- Boundary for "The late door": when the guest registers its own extensions and their lifetime follows its UI state, the standard keeps only the late door, with an abort signal as the unregistration. "Prefer the tuple" is a rule for embedder-supplied extensions. Return: when a second standard or runtime shows guest-side registration with no batch door, or a fleet tree adds a batch door to a guest registry.
- Boundary for "Baseline is unconditional": a conditionally installed baseline (native or fallback) has one registrar per implementation, and the fallback's refusals must be tested against the standard's algorithm. Return: when a second fleet tree polyfills a standard API.
