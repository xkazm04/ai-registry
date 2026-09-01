---
subject: generative-artifact-gating
domain: game-production
last_touched: 2026-09-01
dry_streak: 0
---

# generative-artifact-gating

First touch: 2026-09-01, an `/intake` run on a free-tools 3D level walkthrough
([[../../sources/2026-09-01-stefan3d-free-ai-level]]). Amended, not swept — one technique
and the golden path, no new technique and no change to the `techniques:` list.

## State

Unchanged in shape: 6 techniques, now 3 applications (a new `node` one from the connected
project). The subject was already mature and the amendment did not disturb it.

## What changed and why

The subject's origin axis had two values — generated, or deterministic stand-in — and its
`placeholder-is-not-an-asset` technique ruled that a stand-in defers because *"the
generator must run"*. That is right whenever a generator is the only producer an asset
class has, and wrong otherwise. Origin now has three values: **generated**, **constructed**,
**stand-in**, where a constructed artifact carries its producer's own evidence (algorithm,
version, parameter set, seed) and grades on its own terms.

**Found by the denial hunt, and corroborated inside this bundle rather than from the
source.** The golden path asserted that a generated asset *"is the only thing that can
carry the line forward"* — an enumeration that denied too much. What refutes it is two
doors down: `balance-validation/procedural-level-planning` ships a locally computed,
seed-reproducible, terminal artifact, and its `seed-determinism-contract` is the
evidence-of-work record that a generation history is for a generated one. Two subjects of
one bundle disagreeing about whether deterministic output can be finished work is a
stronger corroboration than the source, and it cost no web fetch.

The technique already carried a *"Where the stand-in is the deliverable"* exception, which
is why this was an amendment and nearly a catch. But all three of its examples — a
fallback, a neutral default, a licence-safe substitute — are a **slot accepting a lesser
thing**, and the technique's disjointness rule (*a real asset is a served reference, a
stand-in is a locally computed value*) leaves a finished construction with no
representation at all. The gap was a third origin, not a fourth exception.

## Boundary recorded

`regeneration-vs-repair-economics` states that it *"starts after the money has been spent
once"*, and its `refuse-the-fix-that-cannot-help` enumerates three refusals, all of repairs.
Refusing the **producer** — declining to generate at all because the class has a terminal
deterministic producer — is the same failure one stage earlier and belongs here, not there.
Said in prose on this side only; the two subjects do not link.

## Consumer evidence

`pof` implements the three origins without naming them: 2 of its 13 Items steps are
generative and defer correctly when no asset stands behind them, 11 construct their
artifact locally and grade it on its own terms, and the swatch is excluded from evidence
entirely. The two-valued rule described 2 of 13 correctly; the amended rule describes 13.
A mutation probe added to that project reports 13/13 gates sensitive to their own content,
which is what makes "constructed" a fact about those eleven rather than an assertion.

## Open

- The three origins are implicit in `pof` — a consequence of which step frame a step lives
  in, not a declared property of the asset class. The technique asks for a declaration and
  no connected tree has one. Worth a return when a project grows an explicit producer
  declaration, or when a fourteenth step lands in the wrong frame and nothing reports it.
- The golden path's five-state section is introduced as "Five states, not two", lists five,
  and then refers to "the four-state shape". Pre-existing, left alone as out of scope for
  this run; a sweep should fix the sentence, not the list.
