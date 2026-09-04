---
subject: repo-manifest-standard
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# repo-manifest-standard

First touch: [[2026-09-01-1]], the librarian sweep that drained the consumer-lead inbox.

## 2026-09-01 - inbox leads landed

Two leads (ascent). `generated-from-provenance` gains a second drift axis - the
producer/consumer boundary, where the producer's suite is silent by construction - and the
rule that every value the producer has already decided for itself is derived, never
retyped, and pinned by a test comparing the two. `spec-ships-with-artifact` gains the
second-reader requirement: a shipped reference reader implements a subset, so a suite whose
only reader is the reference is green forever; at least one independent full-format parser
must read the artifact. Corroborated by a platform's forced multi-step runtime migration of
generated action code and by the canonical bare-token boolean-coercion problem in a popular
config format. Applications at ascent `a57f272c`: `node--generated-from-provenance` extended
(every pre-existing citation in it was stale and was re-resolved; `verified_on` bumped) and
`node--spec-ships-with-artifact` new, which says plainly that the second reader is NOT yet in
the source repo's suite.
First touch: [[2026-09-02-monai-v2]] — the design read of a medical-imaging toolkit's
model-package contract. Class: EXTENDS (boundary candidate).

## 2026-09-02 — intake v2 design read, [[2026-09-02-monai-v2]]

**Source-tree application** `python--spec-ships-with-artifact`: a model package whose
metadata file names its own schema by URL (validated by the toolkit's own verify
command), whose version pins are floors ("later versions expected to work"), and whose
input constraints are shared-variable shape expressions (`"2**p*n"`) rather than example
shapes, with post-processed outputs declared apart from raw ones. Design decision D6's
metadata half. **Boundary candidate:** this subject's golden path scopes itself to "a
contract a repository carries about itself"; the tree applies the same three rules to a
*carried artifact* consumed by programs its author never meets. Whether the scope widens
or a sibling subject owns artifact self-description is a question for the forge run over
the handoff (`librarian/handoffs/2026-09-02-monai.md`), which also holds the config-language
half (`+key` merge markers, `_requires_`, consumer-checked required properties) that no
subject models.

## 2026-09-04 - [[2026-09-04-cargo-make]] (intake, run cargomake-0904)

Gained `version-gate-precedes-schema-gate` + `node--version-gate-precedes-schema-gate` (this registry's own taxonomy loader, A/B paired, shipped).

**This subject now carries both sides of a discriminator it previously held only one side of.** `must-ignore-unknown` is right for the many-reader contract this subject is named for; the new technique is the single-reader case, where rejecting unknown keys is correct and therefore a version declaration must be parsed in a pass of its own, before the schema, or a forward-written document reports as a pile of key errors. The discriminating question is *how many independently written programs read this document* - and the subject should be read as owning both answers, not as having contradicted itself.

**The apply step corrected the technique before the commit.** The obvious early return was wrong: the loader returns a triple whose callers guard on the parsed object, so an early return handing back a truthy object leaves them cross-checking against a subject map nobody populated - 191 spurious findings on this bundle. The version refusal must return the loader's existing *not-usable* signal. That paragraph exists in the technique because the tree refuted the first draft.

**Known gap in the shipped realization, stated in its application:** the check is a string equality against one schema id, not a floor comparison. The technique's "floor, not equality" rule is stated and not yet realized here; do not read this registry as evidence for it.
