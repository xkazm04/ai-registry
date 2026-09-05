---
layer: golden-path
type: golden-path
subject: translation-quality-measurement
status: forged
use_when:
  - choosing a machine-translation engine for a language pair
  - deciding whether a derived translation store is good enough to serve
  - a translation engine or its configuration is about to change under a live pipeline
  - a quality number is about to be quoted as though it were a review
  - deciding how much human review a corpus that cannot be fully reviewed gets
techniques:
  - reference-free-quality-estimation
  - deterministic-checks-before-estimates
  - error-typology-over-a-single-score
  - per-pair-engine-selection
  - regression-detection-under-a-moving-engine
  - human-review-sampling-under-a-budget
---

# Translation quality measurement

The language subjects in this bundle answer what a *correct* translation is.
[Translation pipeline topology](../translation-pipeline-topology/translation-pipeline-topology.md)
answers where translations live and what may claim to be source. Between them
sits a decision neither makes and both depend on: **which machine produced the
derived store, and how anyone would know it got worse.** The derived-and-served
topology defines its store as machine output, keyed to the source, regenerable
at will — the engine is a free variable in that definition, and the topology
never constrains it. Swap the engine and every string in the store changes;
nothing in a well-built pipeline notices, because nothing in a pipeline is
looking at the text.

The stance, in one sentence: **a quality number is evidence, never a review.**
A committed catalog asserts that a human stands behind the text; a score
asserts that an instrument looked at it and was not alarmed. The two are not on
the same scale and no arithmetic converts between them. The principal failure
of translation measurement is not a bad metric — it is a number promoted to a
verdict: a threshold cleared, a locale declared shipped, and a class of defect
the instrument was structurally blind to riding out with it.

## The case you are always in has no reference

Every metric a localizer has heard of divides at one line: does it need a human
translation of the same source to compare against? Overlap metrics do.
Learned reference-based estimators do. And in the derived-and-served topology
that reference *cannot exist by construction* — if a human had translated the
unit, the unit would not be in the derived store. The metrics with the best
published behaviour are unavailable at exactly the point of need, and the only
instrument that runs is the reference-free kind: an estimator that reads source
and output together and predicts how a human annotator would have scored them
([reference-free-quality-estimation](./techniques/reference-free-quality-estimation.md)).

That instrument is real and it is weak, and both halves matter. In the field's
annual evaluation campaigns the leading reference-free estimators reach
sentence-level correlations with human judgment in the neighbourhood of 0.4–0.5
on well-resourced pairs, word- and span-level error detection lands between
0.3 and 0.6 F1, and both degrade sharply on low-resource pairs and out of the
domain the estimator was trained on. Even the best reference-*based* metrics
recover under sixty percent of pairwise human preferences at segment level.
Read that as the design constraint it is: an estimator is a usable ranking
signal over thousands of segments and an unreliable verdict on any one of them.
The correct output of an estimator is therefore a **queue**, not a grade — the
segments a human should look at first, ordered.

## Decide what can be decided before estimating anything

An estimator is the instrument of last resort, and reaching for it first is the
most common way to spend a measurement budget on nothing. A large fraction of
what actually breaks a translated product is **decidable** — checkable against
a rule, with an unambiguous answer and no model in the loop
([deterministic-checks-before-estimates](./techniques/deterministic-checks-before-estimates.md)).
A placeholder that changed name is a runtime failure and
[the format skeleton is inviolable](../../_laws.md#format-skeleton-is-inviolable)
makes it critical unconditionally — no estimator is needed and none should be
consulted. A term with a settled rendering that appears in the source and not
in the target is a mechanical signal against a recorded decision
([one concept, one rendering](../../_laws.md#one-concept-one-rendering)). A
source sentence appearing verbatim under two keys whose targets differ is a
comparison
([identical source, identical target](../../_laws.md#identical-source-identical-target)).
These run over the whole store, cost nothing per unit, and return verdicts.
The rule: **every defect class that a rule can decide is decided by the rule,
and the estimator is pointed at the residue.**

The deterministic layer here assumes translatedness and tests constraints on
it. Whether a value was translated at all is a different and prior question,
answered by the topology subject's identity audit — a store can be perfectly
constraint-clean and entirely untranslated.

## One number cannot say what to do next

Given a segment the estimator is unhappy about, a single score says a human
should look. It does not say who, and it does not say what the fix is — and the
two most common defects have opposite remediation. A mistranslation is an
accuracy failure: the target says something the source did not, the fix is a
retranslation, and shipping it is a factual error in the product. An awkward
register is a fluency failure: the target says the right thing in the wrong
voice, the fix is a rewrite against a style rule, and shipping it costs polish.
Averaged into one number they are indistinguishable, and a store optimized
against that number will trade the first away for the second, because fluency
defects are more numerous.

So the finding is typed: a category from a published multidimensional error
typology — accuracy, fluency, terminology, style, locale convention, and the
non-translation class — crossed with a severity, weighted so that the classes
separate rather than blend (the widely used analytic model weights minor,
major and critical errors 1, 5 and 25, and the point of a spread that steep is
that no volume of minor defects can outvote one critical one)
([error-typology-over-a-single-score](./techniques/error-typology-over-a-single-score.md)).
The categories are *slots*; what fills them is per-language. What counts as a
register defect in one language is a decision that language's subject records,
and a typology whose categories carry no language-specific content collapses
back into taste —
[every finding cites an anchor](../../_laws.md#every-finding-cites-an-anchor)
is what keeps the typed finding a finding.

## A ranking is about a pair or it is about nothing

Engine quality does not transfer across language pairs. An engine trained
heavily on one direction, or on the domain your corpus happens to be in, wins
that pair and loses the next one; a published overall ranking is an average
over a basket of pairs, and the average is a claim about the basket, not about
the pair you serve. Treat any leaderboard the way this bundle treats a style
authority —
[the authority is a hypothesis until counted](../../_laws.md#the-authority-is-a-hypothesis)
— and count it against your own pair, your own domain, your own source
catalog before adopting it. The corollary is a discipline of speech: **every
quality claim states the pair it was measured on.** "Our translations score
0.82" is not a sentence with a truth value
([per-pair-engine-selection](./techniques/per-pair-engine-selection.md)).

## Regeneration is the native failure of a regenerable store

The derived store's defining virtue is that it can be rebuilt from source at
any time. That is also the mechanism by which its quality silently changes: a
hosted engine's model moves under a stable interface, a prompt is improved, a
glossary gains a row, and the next regeneration produces different text for
unchanged source. Nothing in the pipeline reports this, because the pipeline's
only correctness condition is that the output exists.

The defence is not to freeze the store — an engine that improved should be
adopted. It is that **every input that can change the output is pinned and
named, and any change to one obliges a re-proof on a fixed sample before the
regeneration is published**
([regression-detection-under-a-moving-engine](./techniques/regression-detection-under-a-moving-engine.md)).
A regeneration that rewrites text nobody reviewed for a reason nobody recorded
is
[clean strings stay untouched](../../_laws.md#clean-strings-stay-untouched)
violated at store scale, and it is worse than churn: it can silently revert a
correction a review pass had already landed.

## The budget is the premise, so the sample is the design

Full human review of a derived store is not on offer — that is the premise of
the topology, not a shortfall in it. What is on offer is a sample, and the
sample is where measurement is usually lost. A reviewer handed "some strings"
reviews the short ones, the ones near the top of the file, and the ones the
estimator already flagged; the resulting number describes what was easy to
check and is then quoted as if it described the corpus. Two different samples
are needed and they must not be confused: a **random** sample, drawn without
regard to score, is the only thing that estimates the corpus; a **targeted**
sample, drawn from the estimator's worst segments, is the only thing that fixes
it efficiently. Reporting the second as the first understates quality;
reporting the first as coverage of the second leaves the real defects in place
([human-review-sampling-under-a-budget](./techniques/human-review-sampling-under-a-budget.md)).
Whatever is drawn,
[coverage is counted, not claimed](../../_laws.md#coverage-is-counted-not-claimed):
the number reviewed goes in the summary beside the number assigned.

## Failure modes this subject exists to prevent

- **The score as a verdict.** A threshold cleared and a locale declared
  shippable, on an instrument that recovers well under two-thirds of human
  preferences per segment. A score routes attention; it does not clear text.
- **The estimator on a decidable defect.** A model consulted about a
  placeholder rename, a broken plural branch, or a termbase miss, all of which
  a rule answers exactly — measurement budget spent producing a probability
  where a verdict was available.
- **The averaged typology.** Accuracy and fluency defects summed into one
  number, after which the store optimizes toward fluent mistranslation.
- **The global leaderboard.** An engine chosen on an aggregate ranking, then
  serving the one pair where it is worst, with no measurement on that pair to
  contradict it.
- **The silent regeneration.** The engine moves, the store is rebuilt, quality
  changes in either direction, and the first report is a user's.
- **The convenience sample.** A review budget spent on whatever was easy to
  open, its result reported as a corpus estimate.
- **The measurement laundered into a claim.** A store described as "reviewed"
  because it was scored — the trust-class upgrade the neighbouring topology
  subject exists to prevent, arriving through the measurement door instead of
  the storage one.

## Boundary

What a correct translation *is* — which register, which counter, which plural
category, which loanword — belongs to the language subjects, and this subject
depends on them: the error typology's categories are empty slots until a
language fills them, and a severity ruling on a register defect is that
language's call, not the instrument's. Where translations live, what may claim
review, and how a derived store is built, cached and served belongs to
[translation pipeline topology](../translation-pipeline-topology/translation-pipeline-topology.md);
this subject may say a score is evidence about a store, never that it is a
review of one. The general machinery of running an evaluation — pinning a
judge, declaring an aggregation, comparing two configurations — is a
software-engineering standard that holds for any judged output; the
translation-specific discriminator, and the whole reason this subject exists,
is that the reference is *absent by construction* rather than merely expensive,
which removes the option that every general eval standard assumes is available.
Composite scoring arithmetic — how weighted sub-scores combine into one
reportable figure — is a service-operations concern and is deliberately not
re-derived here.

One thing this subject does own that looks like it belongs next door:
**post-edit distance**, the measured extent of a human's correction to machine
output. It is a by-product of review, not of authorship — a hand-authored
translation has no machine baseline to differ from, so the hand-authored
exception contract has no distance to measure and cannot own the signal. It is
treated here as a volume measure of remediation effort, never as a severity
measure, because a one-word fix can be the critical error and a full rewrite
can be style.
