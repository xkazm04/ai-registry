---
layer: technique
type: technique
subject: translation-quality-measurement
technique: reference-free-quality-estimation
status: forged
laws: [coverage-is-counted-not-claimed, every-finding-cites-an-anchor]
shared_with: []
use_when: [scoring a machine-translated store that has no human translation to compare against, deciding which translated segments a reviewer should open first, setting a quality floor for a derived store before it is served, a quality score is about to be quoted as a pass, comparing two engine configurations on a corpus nobody has translated by hand]
---

# Reference-free quality estimation

A reference-based metric compares a candidate against a human translation of the
same source, and in a derived-and-served store that comparison is unavailable by
construction: had a human translated the unit, it would not be machine output.
What remains reads *source and candidate together* and predicts the score a
human annotator would have assigned. It is the only corpus-scale quality signal
a derived store can have, and its properties — not its existence — decide what
may be said with it.

## What the instrument is actually good at

The field's 2025 annual evaluation campaign measured this independently — 16
language pairs, roughly twenty systems per pair, Czech in three directions — and
four of its findings bound every use of the instrument.

**Span localization is low, and unreadable without its ceiling.** The best
automatic error-span annotator averaged 13.47% micro-F1 against human-marked
spans, the strongest span-level metric 12.61%, and a second human annotator on
the same task 47.48%. Hence the rule that makes any such figure interpretable:
**a span-detection score is meaningless without the human-versus-human number
beside it, measured on the same data.** 13% against a 47% ceiling is a quarter
of human performance; 13% against a ceiling near 20% is near parity with people
who are not level with each other — the real English→Czech case, where the
strong metric scored 10.55% against human agreement in the high teens.

The ceiling is itself a measurement with spread: on that pair the campaign's
three human-annotator columns read 14.40, 24.86 and 18.24, so which pair of
annotators you compare decides whether the machine looks close or half as good.
Never quote the metric number alone, never carry a ceiling from one pair to
another, and never reduce a ceiling to one number when the source reports several.

**System-level and segment-level skill come apart.** A frontier-model judge
scored 0.850 correlation ranking systems and 0.350 scoring segments; another
0.870 against 0.514. Cheap surface metrics beat the learned reference-free ones
per segment (chrF 0.588 and an embedding-overlap metric 0.593, against 0.565 and
0.505). A metric picked off a system-level leaderboard may be the worse
instrument for ordering segments, which is what this technique is for.

**A metric that selected a system cannot then judge it.** The campaign states
this as a caution; here it is a rule: **never evaluate a system with a metric
that played any role in selecting, tuning or training it.** Reranking candidates
by an estimator and then reporting that estimator's score is marking your own
exam, and the commonest way a genuine-looking improvement turns out to be nothing.

**Catastrophic recall is per-pair and can be terrible.** At each metric's best
threshold — chosen with hindsight on the test data, so an upper bound — recall
of catastrophic segments ran from 84% on English→Arabic to 12–21% on
English→Russian for the same metric. "It catches the disasters" is a claim about
one pair, and where it has not been measured on yours it has not been made.

The instrument is therefore **strong in aggregate over thousands of segments and
unreliable on any single one**, and three rules follow:

- **Rank, do not grade.** The output is an ordering — which segments a reviewer
  opens first. An ordering tolerates per-item noise; a label does not.
- **Compare, do not certify.** A score difference between two configurations
  over the same corpus holds corpus, domain and source fixed, and is far
  better-behaved than either score alone.
- **Never report the raw number as quality.** The scale is the estimator's, not
  the language's: no unit, no calibration to any product's threshold, and it
  shifts when the estimator is replaced.

## The floor is a routing rule, not a verdict

An estimator earns a threshold in one direction only. Below the floor the segment
goes to a human — a claim about attention, which is cheap to be wrong about.
Above it **nothing is asserted**: the segment is not reviewed, not approved and
not clean, merely not next. A pipeline that treats crossing the floor as a pass
has turned a routing rule into a quality claim, and every defect class the
estimator is weak on — the rare, severe, adversarial ones — ships with the
approval attached.

Set the floor from the review budget, not the score distribution: it sits
wherever the ordered list runs out of this cycle's reviewer capacity. A round
number on the estimator's scale is arbitrary and drifts with every estimator
upgrade; a capacity-derived floor stays meaningful and makes the trade explicit.
Whether the model behind a floor may be run and shipped at all is settled before
the floor is set, in [cost-and-licence-of-measurement](./cost-and-licence-of-measurement.md).

## What a score may and may not be recorded as

A score is not a finding.
[Every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor)
— a termbase row, a grammar rule, a format clause — and an estimator cites
nothing, which is the definition of taste in this bundle. The estimate is
**evidence about the store**: it may be aggregated, compared across
configurations, tracked over time and used to route. A defect is **a typed
finding about a segment**, produced by a rule or a human and citing what it
breaks. The estimator's job ends at the handover: it selects the segments, and
the typology and the reviewer produce the findings.

Nor is a scored store a reviewed store. Stated coverage is the number of segments
a human actually opened against the number assigned —
[coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed)
— never the number scored, which is always all of them and says nothing.

## Two controls that say whether the measurement is real

Both are cheap, both run when an evaluation is stood up rather than after it
disappoints, and both answer a question no correlation number answers.

**The blind sentinel.** Beside the real raters, score one that cannot see what it
judges — source-only or candidate-only. In the 2025 campaign a source-only
sentinel still reached **0.505 system-level correlation** while ranking thirtieth
at segment level (**0.166**). It knows nothing of the translation, so that 0.505
is the difficulty structure of the system pool leaking through, and a headline
number the sentinel nearly matches is not evidence about quality. Rerun it
whenever the pool changes: the artifact belongs to the pool, not the metric.

**Corner-case rater tests before trust.** Before an estimator routes anything,
feed it empty source, empty target, output in the wrong language, the right
language in the wrong script, and spelling variants of a correct answer. A rater
that scores any of those plausibly will do so in production — the 2025 campaign
saw real systems emit the wrong dialect (Modern Standard Arabic where a dialect
was required) and the wrong script (Latin for a Cyrillic target), and automatic
filtering did not flag it. Language and script identity are **deterministic**
checks and belong where verdicts are produced
([deterministic-checks-before-estimates](./deterministic-checks-before-estimates.md)),
not inside an instrument whose whole output is a number.

## When not to use it

- **When a rule decides the case.** A skeleton break, a termbase miss, a length
  overflow and a duplicated source with divergent targets are decidable exactly;
  an estimator's probability about them is worse information at higher cost.
- **On a pair or domain the estimator was not built for.** It degrades quietly —
  scores stay in range and stop meaning anything. Seed it first with segments a
  native speaker has already typed and check the ordering agrees; if it does not,
  the estimator is a random number generator on that pair.
- **As the only instrument on a critical surface.** Legal text, safety
  instructions, payment flows and error messages that instruct a user carry
  consequences an instrument correlating 0.35–0.57 with humans per segment cannot
  bound; those surfaces are the hand-authored or reviewed-and-committed case.
- **Across estimator versions.** A score series spanning an estimator upgrade is
  two series on two scales. Re-score the history with the new estimator or start
  a new series; never join them.
