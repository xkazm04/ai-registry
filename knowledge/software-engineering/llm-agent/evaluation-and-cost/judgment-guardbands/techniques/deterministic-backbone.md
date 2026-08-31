---
layer: technique
type: technique
subject: judgment-guardbands
technique: deterministic-backbone
status: forged
laws: [failure-not-empty-success, gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [designing which part of a score is computed, deciding what a model is allowed to contribute, a detector returns zero and you must know why]
---

# Deterministic backbone

The backbone is the part of the score that no prose can move. It is produced
by named rules over observed artifacts — counts, presence checks, threshold
comparisons, parsed structure — and it is the value the model corrects rather
than the value the model proposes. Everything else in this subject is
arithmetic layered on top of a backbone; without one, there is nothing to
guard a band around.

## Enforced declarations are evidence; honored ones are not

"Prefer structural evidence over declared evidence" is the right instinct and
the wrong cut, and the difference decides what a parser may be trusted for.
The question is not whether a fact is structural or declared — it is **whether
something executes the declaration.**

A declaration a runtime consumes cannot lie without breaking the program. An
annotation a container acts on to wire a dependency is a *declared* fact and is
backbone-grade, because the system stops working if it is wrong. A comment
asserting a file is generated is also declared and is worth nothing, because
nothing enforces it — that is the case this technique already warns about, and
the general rule was drawn too wide from it.

The converse holds and is the half that surprises: a relation can be perfectly
structural and invisible to the grammar. Wiring realized at run time — dynamic
dispatch, reflection, a subscription resolved through a message bus — is real
structure that no parse can see. So the parser's reach is not "structure";
it is "whatever the runtime is obliged to have written down."

State the boundary that way and the extraction question becomes answerable in
advance: what does this platform *force* into syntax, and what does it leave to
convention? The forced part is backbone; the conventional part needs another
instrument, and pretending the parser covers it is how a structural extractor
reports high confidence over a hole.

## A stored backbone is admitted, not computed

The sequencing rule below assumes the backbone *runs* — a detector computing a
value before the model is invoked. A backbone that is instead a **persisted
value some earlier pass proposed** inverts the properties: it is trivially
reproducible on re-read and not reproducible at all on re-extraction, because
a model produced it.

Such a store is still usable, and the discipline is to make **admission**
mechanical even when proposal is generative. Two gates, and the second is the
one that gets skipped:

- **Bind the value.** The asserted figure must occur verbatim in the cited
  source, found by exact match before any looser search. This is the check most
  systems implement.
- **Bind the key.** The label the value is filed under must also be the
  source's. A number can be quoted perfectly and attached to the wrong metric,
  and value-binding alone passes it. One ledger that gated both rejected
  roughly three in ten model-proposed rows, nearly all at the key check.

Then carry the admission outcome on the row — which gate it passed and at what
strictness — so the coverage this technique demands is computable over a store
rather than only over a run. And say plainly what the store is: not *facts that
are deterministic*, but *proposals that survived a mechanical door*. The rows
that failed must be excluded from downstream arithmetic rather than defaulted,
which is `unknown-is-not-a-value` applied at the ledger boundary.

## What qualifies as backbone-grade evidence

Three properties, all required:

**Reproducible.** The same inputs produce the same number on a re-run. This
excludes anything sampled, anything time-dependent that is not pinned, and
anything that reads a mutable external surface without recording what it saw.

**Attributable.** Every contribution traces to a named rule a human can
argue with — "this dimension scored low because the check for X found none in
Y places examined." A number that cannot be attributed cannot be appealed,
and a score users cannot appeal is a score they stop believing.

**Immune to the content it measures.** The detector reads the artifact as
data. If the artifact contains text that changes how the detector behaves,
that detector is not backbone-grade; it belongs on the model side of the
line, where it is bounded.

**Exact, within no tolerance.** A comparison that admits a margin is not
backbone-grade inside that margin: it returns a confident pass for every
discrepancy smaller than the band, silently and systematically rather than at
random. A tolerant comparator satisfies all three properties above and is blind
in exactly the region where a wrong number is most plausible and hardest to
catch — one verifier recomputing values against a source with a half-percent
tolerance held near-perfect recall in general and fell to roughly seven in ten
on discrepancies within a few percent of the truth. Where rounding genuinely
differs, normalize the representation and compare exactly; do not widen the
comparator. A tolerance is a silent repair wearing a check's clothes.

The third property is the one teams get wrong. A regular-expression detector
is deterministic but not automatically immune — a rule that trusts a
self-declared marker in the content ("this file is generated, skip it") has
handed control to the content. Prefer structural evidence over declared
evidence wherever both exist.

## Coverage is a first-class output, not a footnote

Every dimension of the backbone emits two numbers: the score, and how much of
the dimension was actually measurable. Coverage is what the rest of the
machinery reads to decide how much authority the model gets, so it must be
computed honestly and defined per dimension — usually as the fraction of the
declared checks for that dimension that had something to examine, or the
fraction of the artifact surface the detectors could reach.

Coverage is not confidence and must not be derived from one. It is a fact
about the *instrument*: how much of the intended measurement actually
happened. Two dimensions may both score 40 while one had every check land and
the other had two of eleven; those are different numbers wearing the same
label, and any consumer that treats them alike is making a mistake the data
already contained the answer to
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)).

## "Could not measure" is spelled differently from "measured zero"

This is the technique's sharpest rule and its most common violation. A
detector that ran and found nothing produces a real zero with full coverage.
A detector that could not run — the surface was absent, the parse failed, the
fetch timed out, the artifact was unreadable — produces *no measurement*, and
must say so in a form the callers can branch on
([_laws: failure-not-empty-success_](../../../../_laws.md#failure-not-empty-success)).

Collapsing the two is expensive in both directions. Reported as zero, a
broken detector penalizes a subject for a defect in the instrument, and the
appeal is unanswerable because the record shows a legitimate-looking zero.
Reported as full marks, a broken detector silently exempts everything it
cannot read — the failure mode where the worst artifacts score best because
they are the ones the parser choked on. The only safe representation is a
third state, propagated into coverage, and visible in the final record.

The corollary is a self-check on the instrument: before a run's numbers are
published, assert that the detectors ran. A scoring pass that emits a
plausible score sheet while half its checks silently no-opped is a gate
reading a proxy of itself
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)).

## Sequencing: compute first, then show the model

The backbone runs to completion *before* the model is invoked, and its
results are placed into the model's context as settled facts, labelled as
such. This ordering has three effects worth naming:

- The model cannot influence the computation, because the computation is
  already done when the model is first asked anything.
- The model's job becomes correction of a stated number rather than
  origination of one, which is a materially easier task and produces a
  materially more stable output distribution.
- The deterministic result survives model failure. A timeout, a refusal, an
  unparseable response — each degrades to publishing the backbone alone,
  which is a complete, defensible score, not an error page.

That last property is worth designing for explicitly: the model path is
optional by construction. If your system cannot produce a score when the
model is unavailable, the model is not a correction, it is the backbone, and
the guardband is decorative.

## Decision rules

- **When a property is mechanically checkable at all, check it mechanically**
  — even partially. A detector with 60% coverage plus a bounded model
  correction beats a model verdict with no backbone, because the failure of
  the former is bounded and the failure of the latter is not.
- **When a detector's result depends on a claim made inside the artifact,
  demote it.** Move it out of the backbone or make it structural.
- **When coverage for a dimension is zero, do not let the model silently
  become the score.** Publish the dimension as unmeasured, or apply a
  declared policy for that case — but decide it, do not let it happen by
  arithmetic default.
- **When a detector is fixed or its rules change, the backbone's version
  changes.** Scores from before and after are different series; the record
  that travels with each score says which rules produced it.

## When not to use this

Do not force a backbone where nothing is mechanically observable. Some
dimensions — tone, strategic fit, whether an explanation is actually helpful
— have no reproducible detector, and a fabricated one (keyword counts
standing in for quality) is worse than an honest model-only judgment, because
it lends a spurious appearance of objectivity to what is still a model's
opinion. For those dimensions, say so: mark the dimension model-scored, give
it its own visible label, and do not blend a fictional computed value into
it. The guardband regime's honesty depends on the backbone being real; a
decorative backbone is the one way to make this whole subject a liability.
