---
layer: application
type: application
subject: brand-voice-capture
technique: tenant-never-speaks-the-sample-persona
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# The tenant never speaks the sample persona - the twin's injection seam and the readiness hole beside it

The Czech-first adtech workspace (`systedo-case`, commit `163a4de8` on branch
`cur/n47-readiness`, 2026-10-14) already implements the injection half of the
technique: a pure selector takes the resolved state, the trained scopes and the
project kind, filters a tenant's pool to saved voices, ignores empty-directive
rows, and reads demo-ness from the project-kind seam. The seam was chosen to
falsify the claim that the tree holds the whole technique, and it did not: the
second half, "the seed carries no evidence", leaked at the readiness scorer.

## What A was

The resolve step merges the seeded per-type voice (stamped at the epoch, with
directives and two red lines) under whatever a tenant saved, and the readiness
scorer counted that merged list raw. A tenant who trained nothing therefore
earned partial credit on the voice milestone (a generic register exists) and on
the guardrails milestone (two constraints exist). Measured across all five
project types: an untrained twin scored 33 of 100, of which half a milestone
each on voice and guardrails - one sixth of the score together - came from the
seed.

## What B was

The scorer counts only voices that pass the existing "was this actually
trained" predicate (non-empty directives and a training stamp after 2015). Same
untrained twin: 17, both milestones empty. A voice saved with a real stamp still
earns the voice milestone in full, and a fully trained twin still scores 100
(the old fixture used epoch stamps and had to be re-stamped, which is the
fixture asserting the leak). Target moved, floor held: 52 twin and injection
unit tests, type check and lint green.

## Not measured

The channels milestone still scores in full for the seeded, enabled, supervised
channels, so an untouched tenant keeps a 17 floor. Whether a seeded channel is a
tenant decision or a product default is a judgement the technique does not
settle. The full pre-push suite was red for four unrelated tests (hook installer
and workflow-permission fixtures, an embeddings file) in a fresh clone, so the
commit sits on a branch rather than the default branch.
