---
layer: golden-path
type: golden-path
subject: machine-authored-documentation
status: forged
techniques:
  - three-gate-acceptance
  - packaged-surface-evaluation
  - declared-truth-boundary
  - evidence-without-verdict
  - stale-artifact-on-failed-write
  - rescored-baseline-uplift
  - preregistered-kill-criterion
---

# Machine-authored documentation

A team asks a model for an architecture map, a runbook, an onboarding page, a
sequence of what happens when a request arrives — and gets back a finished
document. It reads well. It is plausible in every particular. Nobody in the
room can say whether it is true, and the usual instrument for settling that
question is unavailable, because **this derivation cannot be re-run to disprove
itself.** Ask the same generator the same question tomorrow and a different
document arrives: different identifiers, different arrangement, different
emphasis, possibly a different set of facts. That single property is what
separates this subject from every other derived artifact in the corpus, and it
removes the load-bearing wall the others stand on.

[codegen](../../build-and-release/codegen/codegen.md) can afford its whole
discipline — commit the output, regenerate in the gate, fail on the diff —
because its generators are functions. Re-running one is a *proof*: if the
committed artifact differs from a fresh derivation, the artifact is stale,
full stop, and no judgment is involved. That subject's spine is
[derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation),
and it is exactly the law a model-authored document cannot satisfy. A
regeneration diff over a non-deterministic author is noise: it goes red on
every run, for reasons that have nothing to do with whether either document is
correct, and a gate that is always red is a gate somebody switches off within
the month.

So the entire acceptance burden moves off the derivation and onto the artifact
and the gates around it. What replaces the regeneration diff is a **layered
acceptance** — the document must say the right things, be structurally
admissible, and be looked at by a person — plus a set of disciplines that
exist because the generator is a model rather than a program: the artifact
must publish the boundary of what it is entitled to claim, the instruments
that gather evidence about it must not be allowed to render the verdict, and
any claim that the generator got *better* has to survive the fact that the
grader changed too.

The failure this subject exists to prevent is not a wrong document. It is a
wrong document with a green receipt attached — and every wall below is a
place where a green receipt has been observed to mean less than it appears
to.

## Where this subject's walls sit

This subject owns the **production and acceptance of a prose or visual
document whose author is a model**, from the moment a candidate exists to the
moment it is handed to a reader, plus the measurement of whether the generator
itself is fit to do that.

It does not own derived *source* — the deterministic pipelines, their
registry, triggering, isolation and drift gates are
[codegen](../../build-and-release/codegen/codegen.md), and this subject is
that one's complement rather than a variation on it: same word "generated",
opposite epistemics. **Determinism is the discriminator, and it decides
everything downstream.** Where a regeneration can settle the question, use
that subject; where it cannot, use this one.

It does not own the document's life after acceptance. Once a machine-authored
document is published it becomes a coupled surface like any other, and
everything about keeping it true as the system moves — the coupling map, the
change-boundary enforcement, rot scanning, dated corrections, the freshness
stamp's earning rule — is
[docs-sync](../docs-sync/docs-sync.md). **Authorship ends where the standing
claim begins.** The seam is worth stating precisely because it is easy to
elide: that subject asks whether a document is *still* true; this one asks
whether it was *ever* admissible. A document that fails here should never
reach that subject's coupling map at all.

It does not own the record shape of a published topic — what fields a document
carries, what their absence means, what projections derive from them — which
is [docs-content-model](../../../ui-surfaces/published-surfaces/docs-content-model/docs-content-model.md).

It does not own the model's structured-output plumbing. The single validation
door, the path-addressed error list, the model-assisted repair loop and its
give-up semantics are
[schema-validation-and-repair](../../../llm-agent/prompt-and-context/structured-output/techniques/schema-validation-and-repair.md);
this subject consumes that door as its second gate and contributes the two
things a *document* generator needs that a data extractor does not — a repair
loop whose progress measure is ordinal rather than binary, and a strictness
tier the candidate itself declares.

It does not own general gate mechanics. Instrument assertion, seeded failures,
and what a gate may certify belong to
[quality-gates](../../standards-and-gates/quality-gates/quality-gates.md).

One boundary crosses a bundle and is therefore stated here rather than linked.
Regression gating for model quality — paired per-case comparison, the
statistics of a score that moves — is developed in depth in an observability
context, and the discriminator is *what is being compared*: that discipline
compares two model configurations against a **fixed** grader, which is the
ordinary case and the one worth optimising. This subject owns the case that
discipline assumes away — the grader changed between the runs being compared,
because the acceptance criteria were themselves being repaired. Where the
verifier is stable, use the regression-gating vocabulary; where the verifier
moved, [rescored-baseline-uplift](./techniques/rescored-baseline-uplift.md) is
the rule, and it is a rule about arithmetic rather than about statistics.

## The seven load-bearing walls

### 1. Acceptance is three gates, and none of them substitutes for another

A machine-authored document can fail in three unrelated ways and each has its
own detector. It can be *structurally admissible and semantically wrong* —
every field valid, every reference resolving, and the third service simply
absent from a map that claims to show the system. It can be *semantically
right and structurally inadmissible* — the facts correct, the document
unopenable. And it can pass both and still be **unusable on sight**: labels
overlapping, a route hidden under a node, a panel collapsed into a strip. The
three failures are independent, so the three gates are conjunctive, and the
tempting economy — accept two and infer the third — fails in whichever
direction was skipped. The hard part is not the conjunction but its honesty
clause: when the third gate cannot run, its result is `skipped`, and a
`skipped` review can never combine into a pass
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)). The gate
set, the semantic binding that survives vocabulary drift, and the reason the
human gate is not automatable away are
[three-gate-acceptance](./techniques/three-gate-acceptance.md).

### 2. Measure the generator at the surface people actually install

A generator that is a package — an agent skill, a template kit, a prompt
bundle — is developed in a repository and consumed as an extract. Those are
different artifacts, and evaluating the first while shipping the second is
[gate-sees-target](../../../_laws.md#gate-sees-target) at the outermost
scope. The development tree helps the generator in ways the installed package
cannot: it contains the test suite that enumerates the edge cases, the
benchmark whose fixtures show what a good answer looks like, the design notes
that explain the intent. A model working in that tree does not merely have
more context — it has **the answer key**, and the measurement it produces is
of a configuration nobody will ever run. Keep the harness, the cases, the
prompts and the reference fixtures outside the model-visible working tree,
deliver the prompt through an external runner, and record the package digest
alongside the commit. The surface-parity argument, the leakage taxonomy, and
the fair-run protocol that makes two configurations comparable are
[packaged-surface-evaluation](./techniques/packaged-surface-evaluation.md).

### 3. The artifact publishes the boundary of what it is entitled to claim

A generated document is read as authoritative in proportion to how finished it
looks, and a model-authored one looks extremely finished. The dangerous part
is rarely the document's stated content; it is the **inference a reader draws
from a derived view over it.** A traversal over authored relationships will be
read as a call graph. A count of reachable nodes will be read as blast radius.
A confidence-shaped ornament will be read as a confidence. In each case the
mechanism is honest and the reading is not, and the gap is invisible unless
the artifact closes it in its own words. So the artifact carries an explicit
negative clause — what this view does *not* claim: not runtime causality, not
breakage, not completeness of the underlying model, not a measured confidence
— and every receipt it emits names counts and hops rather than impact
([count-carries-predicate](../../../_laws.md#count-carries-predicate)). The
strongest observed form of this discipline is a product decision recorded as a
refusal: an adjacent tool shipped the same traversal under an impact-shaped
name, and the deliberate choice was to ship the mechanism and refuse the name.
The clause, its placement, and the vocabulary rule that keeps it enforceable
are [declared-truth-boundary](./techniques/declared-truth-boundary.md).

### 4. The instrument that gathers the evidence must not render the verdict

The third gate is the expensive one, so every team eventually builds a tool to
help with it — a screenshot capturer, a containment measurer, a rendering
harness. The tool then faces a choice that determines whether the gate
survives: it can report what it measured, or it can report a verdict. Reporting
a verdict is fatal, and not because the measurement is wrong. It is fatal
because the measurable proper subset — does the layout overflow, did the
capture succeed — is the *cheap* part of the judgment, and a field named
`passed` next to it will be read as the whole judgment by every consumer
downstream. The discipline is a receipt whose review field is permanently
`pending`: the instrument proves containment and produces images, and the
images are evidence for an inspection that has not happened yet
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)). The
three-value vocabulary, the reason a `skipped` capture must delete its stale
sidecars, and the pairing with the gate that may not certify itself are
[evidence-without-verdict](./techniques/evidence-without-verdict.md).

### 5. A failed write leaves the previous artifact in place, and the next tool believes it

A generator that writes atomically — render to a private snapshot, check the
snapshot, replace the target only on success — is correct, and it manufactures
a trap for everything downstream. On failure the output path still exists and
still holds the **last good artifact**, so any inspector pointed at that path
measures a document that passed, reports green, and attributes the green to the
candidate that failed. Nothing in the receipt is false; the two halves simply
describe different files. This is
[gate-sees-target](../../../_laws.md#gate-sees-target) arriving through the
one door most pipelines leave open, because the atomic-write discipline that
creates it is itself good practice and nobody suspects it. The orderings that
close it — bind the inspector to the artifact's digest, gate the inspection on
the writer's exit code, and delete stale sidecars rather than let them present
as current — are
[stale-artifact-on-failed-write](./techniques/stale-artifact-on-failed-write.md).

### 6. An uplift claim re-scores its own baseline under the current grader

The generator gets a fix, the suite is re-run, the new number is better, and
the fix ships. The step that is almost always skipped: the *old* candidates
were scored by the *old* verifier, and the verifier changed — usually because
building the fix taught the team what the acceptance criteria should have
said. Comparing a new run against an old number then measures the grader's
movement and the generator's movement summed, with no way to separate them.
The corrective is cheap and nearly always skipped: freeze the candidates, not
the scores, and re-score the baseline under the current verifier before
claiming anything. Measured in the field record this subject is written from,
that arithmetic reversed a shipped conclusion — a matrix reported as 10 of 15
first-pass usable scored 8 of 15 under the corrected verifier, the post-fix
matrix also scored 8 of 15, and a second attempt at the same uplift scored 8
of 15 again while its targeted case improved and two neighbouring cases
regressed. The rule, the per-case decomposition that makes a flat aggregate
informative rather than merely disappointing, and the reason a targeted
improvement is not an uplift are
[rescored-baseline-uplift](./techniques/rescored-baseline-uplift.md).

### 7. The build-or-kill question is answered before the build, in writing

The costliest decisions in this subject are not about a document; they are
about what to build into the generator. Those decisions are made under an
aesthetic judgment nobody can articulate afterwards, which is why the
discipline is procedural rather than analytical: **write the pass bar down
before the arms exist.** Name the comparison arms, name the threshold, name
the sample, and name what the failing branch does — because the failing branch
is the one that gets renegotiated when the result arrives. The field record
holds the clean case: a planned input parser was gated on a blind-randomised
comparison with a pre-registered bar, the cheap arm failed against both
criteria on the owner's own first read, the parser was killed, and the
capability survived as a prompt-level instruction that cost nothing. The
finding it bought — that the expensive layer was the one nobody had planned to
build — was only legible because the criteria were fixed in advance
([silent-state-is-ungoverned](../../../_laws.md#silent-state-is-ungoverned)).
The pre-registration shape, the blinding rule, and the *degrade-don't-delete*
disposition that makes a kill cheap to accept are
[preregistered-kill-criterion](./techniques/preregistered-kill-criterion.md).

## The order these run in

The walls are not a checklist to be scattered across a pipeline. They compose
in one order, and each one's output is the next one's input:

1. A candidate exists. Nothing has been claimed yet.
2. **Gate one, semantic**: does the document contain the things it was asked
   for, bound by identity rather than by wording, and connected in the stated
   directions?
3. **Gate two, deterministic**: does it pass the validation door at the
   strictness tier the candidate declares — and is that tier the one intended,
   rather than a weaker one reached by a missing field?
4. Repair on failure, bounded by an ordinal stop rule, one diagnosed change per
   round, returning to gate two at the same door.
5. Freeze. The passing candidate's bytes are the artifact's input and are not
   edited afterwards.
6. Write atomically, and let the writer's exit code gate everything downstream
   (wall 5).
7. **Gate three, perceptual**: instruments gather evidence (wall 4), a person
   renders the verdict, and the verdict has three values.
8. Hand over a receipt that carries all three gate results, the digests, and
   the correction-round count — and never a fourth claim the receipt did not
   measure.

Walls 2, 6 and 7 sit outside this loop: they govern the generator rather than
any one document, and they run when the generator changes rather than when a
document is produced.
