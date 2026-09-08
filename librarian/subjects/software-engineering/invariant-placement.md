---
subject: invariant-placement
domain: software-engineering
last_touched: 2026-09-04
dry_streak: 0
---

# invariant-placement

First touch: 2026-09-03, forged whole by an `/intake` run over a doctrine corpus
([[2026-09-03-rusttraining]]). The v2 XL trigger fired mechanically — seven real-gap
candidates shared one home-if-new, against a trigger of three.

## Why it exists

The corpus used "makes X unrepresentable" as a closing idiom in **45 documents
across all bundles, 35 in software-engineering** — `authorization.md:262`,
`data-access.md:117`, `status-fsms.md:34`, `exposure-controls.md:58` and more —
with no subject, no technique and no law owning it. Forty-five documents were
citing a principle the corpus had never stated.

The structural argument: `gate-laddering.md:24-28` enumerates the rungs as
editor / commit / push / merge-pipeline, and there is **no rung zero** — a
standard enforced zero times because the program expressing its violation cannot
be written. `quality-gates.md`'s foundational test, "name the input that makes it
block", cannot describe that stage: an invariant in a shape has no blocking
input, it has a non-existent program.

## State

Golden path + 7 techniques, 0 applications. Thesis: four altitudes — **shape /
door / gate / call site** — chosen by blast radius, then priced.

`placement-precedes-gate`, `constraint-deletion-is-silent`,
`initialization-proof-tokens`, `completeness-at-emission`,
`consumption-bounds-at-most-once`,
`build-time-evaluation-of-cross-value-invariants`,
`derived-properties-cannot-be-forged`.

## The costs are the differentiator

The source argues placement is free ("zero runtime cost… the safety of Haskell
with the performance of C") and across ~40,000 words never states a compile-time,
error-message, migration or onboarding cost — every "compile time" hit in it is a
boast. The golden path refuses that framing explicitly and carries five costs
found by reading what the source *does*: diagnostic legibility degrading with
tracked-property count; combinatorial declaration cost; the proof reaching method
availability but not data population; a validating door inventing a default
inside the chapter arguing that defect away; and a wrong early encoding as a
one-way door.

## Boundaries held

`build-time-evaluation-of-cross-value-invariants` lands **inside**
`gate-laddering.md:221-227` (a compile-time conditional "buys the deletion and
pays with the blindness"), with a distinction the corpus did not have: a
build-time *evaluation* is not a build-time *conditional* — an unconditional
assertion deletes no source from anyone's analyzer. When the invariant is itself
selected by configuration, the blindness rule governs and the technique yields.

The subject **owns the refusal** on staleness: a property with a clock cannot rise
to the top two altitudes, because nothing about the value changes when the fact
expires, so the proof outlives what it proved and goes on looking like proof.
Expiry machinery is handed to the subjects that own it.

## Leads

`derived-properties-cannot-be-forged` is a law candidate — a property of a
composite that is a function of its parts is computed, never declared. Adjacent
to but distinct from `derivation-names-recomputation` and `absent-guard-is-loud`.
One family of evidence today; return at three independent sightings.

## 2026-09-04 - `/intake`, cargo-make read for language craft

One technique, from [[../../sources/2026-09-04-cargo-make-rust-craft]].

- **`shape-with-a-not-applicable-member`** (new). A failure mode of this
  subject's **Shape** altitude that the golden path's own framing invites: the
  path says nothing is checked at Shape because there is nothing to check, and a
  set that gains a member meaning *none of these* does not merely readmit the
  illegal state - it inverts the mechanism. Exhaustiveness now **compels** every
  consumer to invent a semantics for a state that cannot occur, and the cheapest
  invention that compiles is silence. Shape regresses past Call-site, into a
  runtime handler nobody designed that reads as deliberate.
- The audit is mechanical and it is the technique's whole value: enumerate the
  **producers**, never the consumers. In the source, no path can emit the seventh
  member, so its arm is compiler-mandated dead code whose body returns a benign
  false - which the caller reads as "there was no work to do".
- The golden path's existing line - *a set of independent flags obliges every
  write site to prevent every illegal combination* - now has its mirror: a union
  with an extra member obliges every read site to invent a semantics for it.

### 2026-09-05 - `/intake`, amendment

One amendment to `constraint-deletion-is-silent` from [[2026-09-05-rusty-v8]]:
**the negative artifact is the test most likely to be excluded by
configuration.** Its output is the checker's own diagnostics, which vary by
toolchain version and target, so it acquires version and platform guards for
entirely honest reasons — and on every configuration a guard excludes it, the
altitude is back to having no liveness signal at all. The remedy, applied
naively, reproduces the disease. Two rules landed with it: a guard on a negative
artifact is a written coverage statement, and at least one blocking
configuration must run it.

The source keeps fourteen compile-fail fixtures with committed golden
diagnostics — the shape the technique advises against — and this was scored a
**catch, not a refutation**: the host language offers no stable error identifier
for lifetime diagnostics, so the tree sits in the technique's own third fallback
branch, small fixture count and all. The corpus priced the tree's choice before
the tree was read.

