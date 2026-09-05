---
layer: application
type: application
subject: repo-manifest-standard
technique: version-gate-precedes-schema-gate
stack: node
verified_on: 2026-09-04
verified_against: node@20
applied: code
ab_verdict: better
proof: ab-paired
---

# A taxonomy loader that checked the version and kept going

The consumer is a knowledge registry whose bundle layout authority is a JSON
document declaring `"schema": "rkb-taxonomy/1"` at its top level, loaded by one
shared function that every gate and every generator calls. The witness for the
runtime version is the workflow pin, `node-version: '20'`; the document is single-
reader by construction, which is what puts it in this technique's lane rather than
[must-ignore-unknown](../techniques/must-ignore-unknown.md)'s.

The technique originated in an external task runner, which performs a shallow
untyped read of its configuration for a declared minimum version *before* the
typed parse, tolerates a failure of that shallow read by returning no opinion, and
refuses with a version-specific error when the running binary is older. That tree
is the positive realization. This document is the consumer reconciliation, and the
consumer was doing it wrong in a way that is worth recording because it looks
right.

## 1. The order was already correct; the exit was not

The loader checked the declared schema string in the right place — after the parse,
before any structural validation. But the check *recorded* a finding and fell
through, so a document declaring a schema the loader does not know was then
validated against the schema it does know, accumulating findings about rules that
document never claimed to follow.

Paired arms, same instrument, one input — a document declaring `rkb-taxonomy/2`
and using a plausible v2 shape (a third layout value, a category holding both
subjects and subcategories):

| | findings | version verdict alone |
| --- | --- | --- |
| **A** — as shipped | 5 | no |
| **B** — return after the version finding | 1 | yes |

The four extra findings under A are not merely noise, they are **misdirection**:
one of them says *layout must be flat or nested, found "tiered"* — an instruction
to go and edit a key that was correct for the version the document declared. That
is the failure the technique names in its own words, reproduced exactly.

## 2. The naive fix was wrong, and the tree said so

Returning early is the obvious change and it is half of one. The loader's contract
returns a triple — the parsed object, the findings, and a subject map — and its
callers guard on the *object* to decide whether to continue. An early return that
still hands back a truthy object leaves those callers running their remaining
cross-checks against a subject map the early return never populated. Measured on
the same fixture: the bundle checker's cross-check block is gated on `if (taxonomy)`,
so the naive arm would have emitted one additional failure **per subject in the
bundle** — 191 of them — on top of the one true finding. Strictly worse than the
shipped behaviour it was meant to improve.

| | findings | version verdict alone | caller still cross-checks |
| --- | --- | --- | --- |
| **A** — as shipped | 5 | no | yes (against a populated map) |
| **B** — early return, truthy object | 1 | yes | yes (against an empty map) |
| **B2** — early return, no usable object | 1 | yes | no |

The shipped fix is B2: the version refusal returns the same *not-usable* signal the
loader's existing parse-failure path already returns. Two lines; exactly one of
them was the obvious one. This is the finding that was fed back into the technique.

## 3. What the tree confirms about the discriminator

The technique's discriminator is *how many independently written programs read
this document*, and this registry answers it structurally rather than by
assertion: the layout authority is read by five call sites, all in one repository,
all shipped together. It rejects unknown keys deliberately — the document is
generated and hand-edited by one team, and a silently ignored key there is a
subject that vanishes from every graph. The same repository publishes a *different*
artifact for arbitrary external readers and that one carries the opposite rule.
One team, two artifacts, two opposite parse policies, and the discriminator picks
the right one for each without anybody having to remember which.

## What this realization cannot do

The check is a string equality against a single known schema id, not a semantic
version comparison, so it cannot express "any 1.x reader will do" — a document
declaring `rkb-taxonomy/1.2` is rejected as unknown rather than accepted as a
compatible minor. That is adequate while exactly one version exists and becomes
wrong on the day a second ships; the technique's "floor, not equality" rule is
therefore **stated here and not yet realized**, and this document should not be
read as evidence for it.
