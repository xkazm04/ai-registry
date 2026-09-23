---
subject: repo-manifest-standard
domain: software-engineering
last_touched: 2026-09-23
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

### 2026-09-17 - `/harvest backlog` wave 3, one technique + one application from a tension unit

`reserved-space-must-be-unusable`, from [[2026-09-16-squid]] (shape claim), [[2026-08-31-whatwg-html]] (invalid on purpose) and [[2026-08-31-verou-2026-blog]] (an experimental namespace preserves nothing). The subject owned the reader's half of the forward-compatibility promise (`must-ignore-unknown`) and what may change (`semver-additive-evolution`); nobody owned how an author reserves room. The tension resolved into three rungs ordered by what a writer loses today, with the third member confirmed as the bottom rung rather than contradicted. Measured on a free-form field a service had already carved two names out of by enumeration: a caller could write both and have them read as host policy, 2 to 0. The unhunted return is the timing rule - the shape half was no longer reachable at that seam, priced at one migration per key, because the space had been released free-form. The golden path gains a section (the room you keep is the room nobody can use) and a failure mode (the extension space was reserved by announcement).

## 2026-09-23 - [[2026-09-23-1]]

Lead drain (run lib-0923), L268 APPLICATION + AMEND. **Correction** to `must-ignore-unknown`: an in-place writer passes the foreign-key test by construction; the fixture must look owned and the assertion cover the whole file. Machine paths removed from four published applications.

**Impact** (stale verdicts before this landing, from the map rebuilt at the run start): none recorded.
