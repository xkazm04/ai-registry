---
layer: application
type: application
subject: repo-manifest-standard
technique: spec-ships-with-artifact
stack: process
status: forged
---

# Authoring the contract so it resolves in an air-gapped clone

The Ascent repo (`C:\Users\kazda\kiro\ascent`) forges its own repository
standard — a `.ai/` directory carrying `manifest.yaml`, a shipped `SPEC.md`, a
zero-dependency `doctor.mjs`, plus pointed-at memory, context index and
guardrails. The authoring workflow around that spec is the clearest realization
of `spec-ships-with-artifact`, and it exists because the obvious first version
failed.

## The incident that produced the rule

`src/lib/standard/spec.ts:1-13` states it plainly: the spec

> used to live only at `docs/features/onboarding/ai-manifest-spec.md` inside
> Ascent's own repo — so every generated manifest, memory seed and doctor header
> pointed an adopting repo at a path that does not exist there.

Every adopting repository received a manifest whose `spec` field named a document
only the *authoring* repository had. The generated contract was, in the field, a
contract with no accessible definition. The fix was not to publish the doc at a
URL — that reintroduces a network dependency and a rot surface — but to ship the
document into the adopting repo as `.ai/SPEC.md` (`SPEC_PATH`, `spec.ts:18`), so
"the spec now travels with the artifacts that reference it: simpler than hosting
it (no route, no network) and it still resolves in an air-gapped clone."

## Two copies, one source, one drift test

The vendored copy lives as `SPEC_MD`, a verbatim string-array mirror of the doc
(`spec.ts:21-160`). Three details make this safe rather than a second authority:

- **The direction is written down.** The header names the doc as SOURCE OF TRUTH
  and the constant as the mirror, with the exact re-mirror command inline —
  "edit the doc, then re-mirror; never edit only one side."
- **A test pins it.** `standard.test.ts:317` asserts `buildSpec().body` is
  byte-identical to the on-disk doc (normalizing line endings only) and that the
  emitted path is `.ai/SPEC.md`. The test compares the *shipped* bytes against
  the *source file* — not one derivation against another, which is the shape of
  drift check that is green forever.
- **It is a constant, not a runtime file read** — deliberately, "the route must
  work from a bundled/standalone build." A file read would have made the spec
  unavailable in exactly the packaged deployment that serves it.

The comment carries the consequence of skipping the re-mirror: "the adopting repo
ships a stale contract — fail loudly." That is the whole argument for pinning a
vendored copy in one sentence.

## The reimplementation clause, written into the spec text

`spec.ts:145` (inside `SPEC_MD`) closes the conformance section with:

> A reimplementation in another language is conformant if it performs checks 1–6
> against this spec. The check *contract* is language-neutral; `doctor.mjs` is
> just the reference runner.

That clause is only honest because the six checks above it are written as
prose an implementer can follow — structure, pointer resolution (with the
"a `CONTEXT.md` still carrying its `<placeholder>` markers is reported as
unfilled: existence alone is not context" refinement), capability resolution and
execution, control placement, freshness, guardrails. The spec even publishes the
scoring formula and its comparability caps (`score = round(100 × Σ weight /
findings)`, weights 1 / 0.5 / 0, "only comparable between runs with the same
shape") and the reference runner's 180-second per-capability timeout — the
numbers a reimplementer would otherwise have to reverse-engineer from the runner.

## What this repo teaches beyond the technique

`docs/AI-SDLC-STANDARDS-LANDSCAPE.md:9` frames why the standard was forged rather
than adopted: the layer where agents *build* software is "essentially
unstandardized, but already being audited" — controls demanded with no standard
to satisfy them. The strategic consequence at line 117 is the reason to keep the
contract additive and vendor-neutral: "when a committee eventually does
standardize this, we are the prior art and the reference validator rather than
the thing being replaced." Compatibility cost, in their own accounting, is "a few
optional fields the spec's must-ignore-unknown rule already accommodates."

The claims discipline in §5 of the same doc is the guardrail on all of it: say
"evidence for" a control, never "compliance with" a standard; publish the method
and sampling caps alongside every number, because "an over-claimed metric here is
not a marketing sin, it is a product-killing defect."
