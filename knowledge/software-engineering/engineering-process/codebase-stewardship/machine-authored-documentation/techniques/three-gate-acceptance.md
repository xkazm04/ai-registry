---
layer: technique
type: technique
subject: machine-authored-documentation
technique: three-gate-acceptance
status: forged
laws: [absent-guard-is-loud, gate-sees-target, verdict-survives-boundary, unknown-is-not-a-value]
shared_with: []
use_when: [a generated document validated cleanly and is missing something the request named, deciding whether an automated check can stand in for looking at the output, a review was skipped and the run reported green, defining what first-pass usable means for a generator]
---

# Three gates, and none of them substitutes for another

A document produced by a model fails in three ways that do not correlate, and
the whole of this technique follows from that non-correlation. Each failure has
a detector; no detector sees the other two; and the arithmetic that combines
them is conjunction, not majority.

**Semantic failure.** The document is well-formed and does not say what it was
asked to say. The request named four services and the map has three. A
relationship exists but points the wrong way. A state machine describes a
recoverable failure and has no transition back to the active state. Nothing
here is detectable by a schema — every field is valid, every reference
resolves — because the missing information lives in the *request*, not in the
artifact, and the validator was never shown the request.

**Structural failure.** The document does not pass the validation door: shape,
domain vocabularies, reference resolution, cross-field invariants. This is the
one gate that is cheap, total and mechanical, which is exactly why it is the
one teams over-trust.

**Perceptual failure.** The document passes both and is unusable on sight. Two
labels occupy the same pixels. A route runs beneath an opaque node. The panel
collapses into a strip at the width people read it at. The content is correct
and the artifact does not deliver it.

## Why the conjunction cannot be economised

Each pairwise substitution has a standing counter-example, and it is worth
naming all three because each one is proposed by somebody every quarter:

- **"If it validates, it is probably right."** A renderer-valid, semantically
  wrong document is the *modal* failure of a competent generator, not an exotic
  one. The generator is good at producing well-formed output — that is the part
  it was trained and tooled for — so its residual error concentrates in
  content.
- **"If the content is right, the rendering will be fine."** The layout of a
  generated visual document is a solved problem only in the cases the solver
  covers. In the field record this subject is written from, the failures that
  survived a fully passing deterministic gate clustered entirely in layout and
  routing, and one of them was a stub segment three and a half pixels long —
  invisible to every semantic and structural check, obvious to anyone who
  opened the file.
- **"A person looked at it, so the checks are belt-and-braces."** A person
  reading a plausible document does not recompute its references. Human review
  is the *weakest* gate for structural and referential defects and the only
  gate for perceptual ones; it is not a superset of anything.

## Binding the semantic gate without freezing the wording

The semantic gate is the hard one to build, because the obvious implementation
— compare the output's strings to the request's strings — fails on the first
legitimate synonym and then gets relaxed until it checks nothing. The shape
that holds:

- **The case declares semantic keys, not labels.** Each required element gets a
  stable key. The case then lists the *accepted* technical labels for that key,
  and where more than one rendering of the element is legitimate, the accepted
  types as well.
- **Every required key must bind exactly once.** Binding is the check; the
  wording is a lookup table feeding it. A generator that names the thing
  differently but correctly passes. A generator that omits it fails no matter
  how fluent the surrounding prose.
- **Vocabulary aliases never substitute for topology.** This is the rule that
  keeps the relaxation from eating the gate. Accepting a synonym is a statement
  about what an element may be *called*; it is never a statement about whether
  the element or its relationships must *exist*. Every required relationship
  must still be present, in the declared direction, after every alias is
  applied.
- **The alias table is calibrated after the candidates are frozen, or not at
  all.** Widening accepted vocabulary while looking at the outputs it will
  admit is scoring the run twice and keeping the better score. Freeze first,
  then calibrate, then re-score everything under the widened table including
  the baseline (see
  [rescored-baseline-uplift](./rescored-baseline-uplift.md)).

## The skipped review is the whole discipline

The third gate is the one that will be unavailable — no image reader, no
browser, an unattended run, nobody with the domain knowledge on shift. What
happens then decides whether the gate set means anything, and the answer is
fixed: the review's result is `skipped`, `skipped` is not `passed`, and a run
carrying a `skipped` review can never report the document as accepted.

This is [absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) in
its purest form — a guard whose absence is silent protects the demonstrations
and nothing else — and the failure mode it prevents is not dishonesty but
*drift*. Nobody decides to upgrade a skip into a pass. The upgrade happens
structurally: a boolean field with two states has nowhere to put "not
attempted", so the code writes `false` and the summary line, reading a field
that was designed to mean "review failed", reports it as a defect count of
zero.

So the review carries three values and a required identity:

- `passed` — a named reviewer inspected the rendered output and reports no
  defect. The identity is not ceremony; an unattributed pass is
  indistinguishable from an unattempted one a week later.
- `failed` — with concrete defects, named from a closed tag vocabulary so the
  failure cluster is countable across runs rather than being free prose
  ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
- `skipped` — with the reason it could not run.

## What the composite result is allowed to say

One boolean — accepted, or not — plus the three gate results that produced it,
never the boolean alone. A consumer that can read the headline without reaching
the three components will use the headline for a claim it does not support, and
the three components are the predicate the headline is measured over.

Two clauses keep the composite honest under operational failure:

- **An absent candidate is a recorded outcome, not a missing row.** When the
  generator produces nothing — a timeout, a provider error, a crash — emit a
  failure receipt with a reason drawn from an allow-list. The semantic,
  structural and perceptual gates are then truthfully `not_run`, and the run
  counts toward the matrix's completeness in an *operational* cluster kept
  separate from the quality clusters. Never synthesise a placeholder artifact
  to stand in for the missing one: an invalid document fabricated to represent
  a timeout converts an operational failure into a quality failure and
  poisons the cluster that was supposed to explain it.
- **Completeness is a property of the matrix, not of a run.** A result set is
  evidence-eligible only when every configuration has exactly one first-pass
  receipt for every case. An incomplete or duplicated matrix is not a weaker
  result; it is not a result.

## Decision rules

- **When the document is prose rather than visual, the third gate still
  exists** — it is a read, not a look. The perceptual failure class becomes
  structure-of-argument failure: correct facts in an order nobody can follow,
  a reference section that does not correspond to the claims. It is no more
  automatable than the visual one.
- **When the volume makes per-document human review impossible**, sample and
  say so: the composite for an unreviewed document is `accepted (2 of 3
  gates)`, which is a different and weaker word than `accepted`. Do not
  redefine acceptance to fit the throughput.
- **When the semantic case is expensive to author**, author it once per
  document *class* and reuse it. The case is the reusable asset here, not the
  document.

## When not to use this

Not for a deterministic generator, where a regeneration diff settles
correctness at a fraction of the cost — that is
[codegen](../../../build-and-release/codegen/codegen.md), and running three
gates there is theatre. Not for a draft explicitly handed over as a draft: the
gates govern what may be *delivered*, and a document whose contract with its
reader is "unchecked starting point" is honest without them, as long as that
contract travels with it.
