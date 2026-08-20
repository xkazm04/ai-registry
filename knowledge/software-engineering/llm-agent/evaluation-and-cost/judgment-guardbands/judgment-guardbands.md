---
layer: golden-path
type: golden-path
subject: judgment-guardbands
status: forged
use_when: [a model contributes to a user-visible score, mixing computed signals with model judgment, a judge can be influenced by the content it judges, designing how much a model may move a number]
techniques:
  - deterministic-backbone
  - score-guardband
  - confidence-weighted-blend
  - self-audit-budget
  - narrate-dont-rescore
  - judgment-integrity-record
---

# Judgment guardbands

A guardband is the width of the band inside which a language model may move a
number that something else computed. The subject is what happens when you
want both things at once: the nuance only a reading model supplies, and a
score that cannot be talked into a different answer. The naive reading — "let
the model score it, the model is smart" — produces a system whose output is a
function of persuasion, and whose worst outputs arrive precisely when the
material being scored has an interest in the result. The disciplined reading
gives the model a real job with real authority, then bounds that authority so
tightly that total capture of the model changes the number by a known, small,
pre-declared amount.

The boundary with the neighbours, stated up front. Measuring a model
*offline* against declared scenarios — pinned judges, anchor sets, drift
charts, comparability across versions — is the
[eval-harness](../eval-harness/eval-harness.md) subject; here the judgment is
*live*, in a production path, producing a number a user will act on, with no
re-run to average over. Defending the prompt boundary — fencing untrusted
spans, tripwires, taint — belongs to
[prompt-safety](../../prompt-and-context/prompt-safety/prompt-safety.md); this subject assumes that
defence has already failed somewhere and removes the *payoff* of the
successful injection. Getting a machine-readable verdict out of model prose
at all is [structured-output](../../prompt-and-context/structured-output/structured-output.md)'s
contract; here we assume a parsed verdict exists and decide what it may do.
Composite arithmetic over dimension scores is
[scoring-rubrics](../../../operations/service-operations/scoring-rubrics/scoring-rubrics.md); this subject decides
only which of the two contributors owns each number.

## The backbone is computed; the model is a correction

One architectural decision is made at the top and every other rule follows
from it: **the deterministic signal is the score, and the model is a bounded
correction applied to it** — not a co-equal opinion, not a tie-breaker, not
"the smart half". Detectors, parsers, counters and threshold checks produce a
number that is reproducible, auditable and attributable to a named rule. The
model produces an adjustment.

This is not a claim about which is more accurate; on many qualitative
dimensions the model reads better than any detector you will write. It is a
claim about **which failure you can survive**. A wrong detector is wrong the
same way every time, visibly, and gets fixed. A wrong model is wrong
differently on every input, invisibly, and — the part that matters — is wrong
*on purpose* whenever the material it reads contains an instruction. Invert
the ordering and the system's output is only as trustworthy as the least
trustworthy text that reached the prompt.

The backbone must also be able to say "I could not measure this here": a
detector that found nothing and one that could not run produce different
outputs, because the correction machinery treats them differently
([_laws: failure-not-empty-success_](../../../_laws.md#failure-not-empty-success)).
Full discipline:
[deterministic-backbone](./techniques/deterministic-backbone.md).

## The guardband is a number, declared once, in one place

The correction is clamped to an explicit band around the computed value. That
amount is a **named constant**, defined in exactly one place, referenced by
every path that applies a correction
([_laws: one-authority-per-vocabulary_](../../../_laws.md#one-authority-per-vocabulary)).
Two properties make the band load-bearing rather than decorative.

**It bounds the *delta*, never the result.** "The model may return a score
between X and Y" is not a guardband; it is the scale, and a captured model
returns Y. "The model's score is clamped to within D of the computed score"
means a captured model returns computed + D, and D is the entire blast
radius. Size D by the only question that matters: *if an adversary owned the
model completely, is computed + D an outcome I can publish?* If not, shrink
D — never add another layer of model-side detection on top. The sharpest
sanity check is to compare D against the width of your published tiers: if D
is as wide as a tier, model influence alone moves a subject a full level.

**It is applied at one door.** Every path from a model verdict to a number
passes through the same clamp
([_laws: one-validation-door_](../../../_laws.md#one-validation-door)) — a clamp
duplicated across call sites is a clamp minus the site added next quarter,
and that site is the one that ships an unbounded number. Sizing, asymmetric
bands and legitimate widening:
[score-guardband](./techniques/score-guardband.md).

## Blend weight follows coverage, not confidence

Inside the band, how much of the model's opinion lands is governed by a blend
weight, and the common design error is letting that weight follow the model's
own stated confidence. Confidence is a fluent register, not a calibrated
probability, and — being model output — a channel an attacker can write to.
Scaling the model's authority by its self-reported confidence is a dial
labelled "how much you may be trusted", handed to whoever wrote the input.

The weight follows **evidence coverage** instead: how much of the material
*the model read* was actually inspected, against a backbone that is
coverage-robust because it reads structured facts rather than sampled text.
The direction is the one people invert first. A truncated, rate-limited or
partially-sampled run means the model is extrapolating from a fragment —
exactly when its reading is least grounded, and when any planted text makes
up the largest share of what it saw. So **low coverage damps the model and
leans harder on the deterministic signals.** The tempting inversion ("the
computed number is weak here, so let the model speak") applies a coverage
argument to the wrong contributor.

Two invariants keep the scaling honest: at full coverage the effective weight
equals the calibrated base weight *exactly*, so the well-understood path is
not silently re-tuned; and a coverage that could not be computed is not a low
coverage — it defaults to the calibrated path and records that it did.

Two guards attach. Any numeric value arriving from the model, or any coverage
estimate from a component that can break, crosses a trust boundary and is
validated at the edge — a not-a-number value does not throw, it propagates
through clamps and means, collapses a whole score sheet with no warning, and
surfaces much later as blanks in a display. And the sanitized value is bound
**once**, shared by the arithmetic and by whatever is persisted and rendered;
guarding it for the math alone yields a correctly-blended score beside an
impossible confidence figure nobody can reconcile afterwards. The effective
weight is itself derived and names how it is recomputed
([_laws: derivation-names-recomputation_](../../../_laws.md#derivation-names-recomputation)).
Full formulation:
[confidence-weighted-blend](./techniques/confidence-weighted-blend.md).

## The model may say the evidence is wrong — on a budget

A regime that never lets the model contradict the backbone is brittle in an
expensive way: detectors have blind spots, and the model is often the first
thing in the system to notice. Refusing it any channel to say "your detector
missed this" discards the one signal that finds detector bugs before users
do. So there is a channel, and it is **budgeted**: the model may flag a
bounded number of dimensions — one or two out of many — where it believes the
deterministic evidence is wrong, and those get a wider band.

A second outcome belongs in the channel and is the safer one to grant: **the
model may argue a dimension is unmeasurable, and unmeasurable is not a
score.** Where the evidence is a blind spot rather than a finding, drop the
dimension and renormalize over what was measured, rather than letting the
model raise the number. Exclusion cannot manufacture a high score, so its
injection payoff is far smaller than a widened band's, while the correction
it makes is the one detectors most often need.

**Enforce the budget all-or-nothing, not keep-the-first-N.** Over budget,
honour *none* rather than the first N — for two independent reasons. The
evidential one: a self-audit claiming most of the deterministic layer is
broken has not earned extra trust; it is a broken run or a capture attempt,
and both call for falling back entirely to the backbone. The structural one,
which is stronger: *any* keep-N rule needs a tie-break — order, severity,
confidence — and every tie-break is a control surface the model can steer.
All-or-nothing has no tie-break, so there is nothing to steer. That is the
difference between a budget and a queue, and it belongs in a comment beside
the code that enforces it.

**Disclose the budget in the prompt.** "At most two, and if you flag more,
none count" converts over-flagging from a strategy into a self-defeating move
— the honest auditor and the captured one face the same incentive gradient.
And note what the budget substitutes for: the ideal response to "the detector
is wrong" is to *re-run the detector*. Where the correcting stage receives
already-computed signals and cannot re-measure, corroboration is unavailable
and the budget is the enforceable half of the same idea. Full design:
[self-audit-budget](./techniques/self-audit-budget.md).

## Prose narrates; prose does not rescore

The model produces two kinds of output and only one goes near a number.
**Numbers come from the scoring channel, bounded as above; prose explains
numbers that already exist.** The rule sounds like a style guideline and is
the system's primary defence, because it is what makes a successful prompt
injection *worthless*: text reaching the model can change what the report
says, never what it scores, and a manipulation surviving only in prose is one
the person reading the score will catch. Four consequences.

**Some dimensions are narrate-only, declared at the point of evidence.**
Where a dimension is fully computed by a battery of graded checks, the model
gets no correction on it at all: the number is stated in its context as
fixed, and its job is to explain and prioritize the gaps *from that exact
evidence*. Record its proposed value anyway, unused — the cheapest measure of
how far it would have moved a number it could not move.

**A claim in prose by an interested party is not evidence.** Material under
evaluation asserting that a control exists ranks below the computed signals
and below observed process evidence, and never on its own justifies raising
anything. Say so explicitly; without it, a confident self-description reads
as corroboration and no injection was required.

**State the negative space in the prompt.** The evidence block says what the
model may move and, explicitly, what it may not — which values are computed
and final, that numbers in prose are restatements, that its role is auditor
rather than author. A prompt saying only what the model *should* do leaves
the rest of the surface undefined, and undefined surface is where injected
instructions live.

**Route found instructions to a non-scoring channel, and never let the
display path recompute.** Text aimed at the scorer is recorded where it
cannot influence a number — dropping it silently loses a real security
signal, feeding it to the scoring path is the whole vulnerability, because
the scoring path is what widens a guardband. And the number a user sees, the
number in the record and the number in an export are one stored value with
one provenance; a surface that recomputes from prose has reinstated
everything the guardband removed
([_laws: gate-sees-target_](../../../_laws.md#gate-sees-target)). The technique is
[narrate-dont-rescore](./techniques/narrate-dont-rescore.md).

## Every prose-triggered change to a number is recorded

A guardband you cannot audit is a guardband you cannot tune. Each score
carries a small record of its own integrity: what the deterministic layer
computed, what the model proposed, the effective weight and its inputs,
whether the band was widened and under what flag, whether the audit was
suppressed for exceeding its budget, whether the clamp actually bound, and
what was rejected at the trust boundary. It travels with the score
([_laws: count-carries-predicate_](../../../_laws.md#count-carries-predicate)),
keyed by an identity surviving re-runs and re-ordering
([_laws: identity-survives-reuse_](../../../_laws.md#identity-survives-reuse)).

Build it on day one; it answers questions the scores cannot. How often does
the clamp bind — never means the band can be shrunk for free, constantly
means the model or the backbone is systematically wrong and the record says
which. Which dimensions have coverage so thin the model is effectively
scoring them alone? And the one that matters most in production: when two
runs over an *unchanged* subject disagree, was it the subject or the
judgment? Without the record every such difference is reported as a change in
the thing measured, and people investigate a subject that did nothing. See
[judgment-integrity-record](./techniques/judgment-integrity-record.md).

## The failure modes of the naive reading

**"We'll just tell the model to be objective."** Instructions are not a
boundary. Its compliance with your framing and with injected framing are the
same mechanism; you cannot buy a bound with prose.

**"We validate the output against a schema, so it's safe."** A well-formed
number in a valid schema is exactly what a captured model returns. Schema
validity constrains shape, never magnitude.

**"The model is more accurate than our detectors, so it should have the final
word."** Accuracy on the median input and safety on the adversarial input are
different properties. The band is sized by the second.

**"Averaging several model verdicts removes the bias."** Judges share
systematics — a preference for whichever option appears first, for longer and
more polished text, for output in their own idiom. An average over correlated
biases is a more confident version of the same bias. Guardbands bound what
survives every debiasing trick, which is why they alone do not depend on the
bias having been correctly characterized.

**"We removed the audit channel because a run abused it."** Deleting the
channel that surfaces detector blind spots does not fix them
([_laws: deletion-is-not-repair_](../../../_laws.md#deletion-is-not-repair)); it
converts a budgeted, recorded disagreement into an unmeasured one. Shrink the
budget, tighten the widened band, keep the channel.

## The techniques

- [deterministic-backbone](./techniques/deterministic-backbone.md) — what
  qualifies as computed evidence, coverage as a first-class output, and
  "could not measure" spelled differently from "measured zero".
- [score-guardband](./techniques/score-guardband.md) — the bound as a named
  constant, delta-bounds versus ranges, sizing against tier widths, one door.
- [confidence-weighted-blend](./techniques/confidence-weighted-blend.md) —
  coverage-scaled weight and its direction, why self-reported confidence must
  not drive it, one sanitized binding for math and display.
- [self-audit-budget](./techniques/self-audit-budget.md) — widen versus
  declare-unmeasurable, all-or-nothing enforcement, eligibility before
  counting, disclosing the budget so over-flagging cannot pay.
- [narrate-dont-rescore](./techniques/narrate-dont-rescore.md) — the two
  channels, narrate-only dimensions, the negative space, routing found
  instructions away from anything that can move a number.
- [judgment-integrity-record](./techniques/judgment-integrity-record.md) — the
  per-score provenance of every prose-triggered adjustment, and the tuning
  and attribution questions it answers.
