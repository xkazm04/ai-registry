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

A reference-based metric compares a candidate translation against a human
translation of the same source. In a derived-and-served store that comparison
is unavailable by construction: if a human had translated the unit, the unit
would not be machine output. The metric family with the best published
behaviour is therefore missing at exactly the point of need, and the
instrument that remains reads *source and candidate together* and predicts the
score a human annotator would have assigned. That prediction is the only
corpus-scale quality signal a derived store can have, and its properties —
not its existence — decide what may be said with it.

## What the instrument is actually good at

The field's 2025 annual evaluation campaign measured this independently — 16
language pairs, roughly twenty systems per pair, Czech in three directions — and
four of its findings bound every use of the instrument.

**Span localization is low, and unreadable without its ceiling.** The best
automatic error-span annotator averaged 13.47% micro-F1 against human-marked
spans; the strongest span-level metric 12.61%. A second human annotator on the
same task reached 47.48%. Hence the rule that makes any such figure
interpretable: **a span-detection score is meaningless without the
human-versus-human number beside it, measured on the same data.** 13% against a
47% ceiling says the machine recovers a quarter of human performance. 13%
against a ceiling near 20% says it is nearly level with people who are not level
with each other — and that is the real English→Czech case, where the strong
metric scored 10.55% against human agreement in the high teens.

The ceiling is itself a measurement with spread, not a constant: on that pair the
campaign's three human-annotator columns read 14.40, 24.86 and 18.24, so which
pair of annotators you compare decides whether the machine looks close or half as
good. Quote the ceiling as the range it is. So: never quote the metric number
alone, never carry a ceiling measured on one pair across to another, and never
reduce a ceiling to one number when the source reports several.

**System-level and segment-level skill come apart.** A frontier-model judge
scored 0.850 correlation ranking systems and 0.350 scoring segments; another
0.870 against 0.514. Cheap surface metrics beat the learned reference-free ones
at segment level in the same campaign (chrF 0.588 and an embedding-overlap
metric 0.593, against 0.565 and 0.505). A metric picked off a leaderboard of
system-level correlations may therefore be the worse instrument for what this
technique is for, which is ordering segments.

**A metric that selected a system cannot then judge it.** The campaign states
this as a caution; here it is a rule. **Never evaluate a system with a metric
that played any role in selecting, tuning or training it.** Reranking candidate
outputs by an estimator and then reporting that estimator's score is marking
your own exam, and it is the most common way a genuine-looking improvement turns
out to be nothing.

**Catastrophic recall is per-pair and can be terrible.** At each metric's best
possible threshold — chosen with hindsight on the test data, so an upper bound —
recall of catastrophic segments ranged from 84% on English→Arabic to 12–21% on
English→Russian for the same metric. "It catches the disasters" is a claim about
one pair, and where it has not been measured on your pair it has not been made.

Those numbers are not an argument against the instrument. They say precisely
what it is: **strong in aggregate over thousands of segments, unreliable on
any single one.** So:

- **Rank, do not grade.** The correct output is an ordering — which segments a
  reviewer opens first — not a per-segment quality label. An ordering tolerates
  per-item noise; a label does not.
- **Compare, do not certify.** A score difference between two configurations
  over the same corpus is a far better-behaved quantity than either score
  alone, because the corpus, domain and source text are held fixed and only the
  variable of interest moves.
- **Never report the raw number as quality.** The scale is the estimator's, not
  the language's. It has no unit, no calibration to any product's threshold,
  and it shifts when the estimator is replaced.

## The floor is a routing rule, not a verdict

An estimator earns a threshold only in one direction. Below the floor, the
segment goes to a human — that is a claim about attention, and attention is
cheap to be wrong about. Above the floor, **nothing is asserted**: the segment
is not reviewed, not approved, and not clean; it is merely not the next thing
to look at. A pipeline that treats crossing the floor as a pass has converted
a routing rule into a quality claim, and every defect class the estimator is
weak on — and it is weak on the rare, severe, adversarial ones — ships with the
approval attached.

Set the floor from the review budget, not from the score distribution. The
budget says how many segments a reviewer can open this cycle; the floor is
wherever the ordered list runs out of budget. A floor chosen as a round number
on the estimator's scale is arbitrary and drifts every time the estimator is
upgraded, whereas a floor derived from capacity stays meaningful and makes the
trade explicit.

## What a score may and may not be recorded as

A score is not a finding. [Every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor)
— a termbase row, a grammar rule, a format clause — and an estimator cites
nothing; it produces a number with no rule attached, which is the definition of
taste in this bundle. The discipline that keeps the two apart:

- The estimate is **evidence about the store**: it may be aggregated,
  compared across configurations, tracked over time, and used to route.
- A defect is **a typed finding about a segment**: produced by a rule or a
  human, citing what it breaks, remediable by someone who can act on it.
- The estimator's job ends at the handover. It selects the segments; the
  typology and the reviewer produce the findings.

And a scored store is not a reviewed store. Where a store's coverage is stated,
it states the number of segments a human actually opened against the number
assigned — [coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed)
— never the number scored, which is always all of them and therefore says
nothing.

## Two controls that say whether the measurement is real

Both are cheap, both are run when an evaluation is stood up rather than after it
disappoints, and both answer a question no correlation number answers.

**The blind sentinel.** Alongside the real raters, score one that cannot see
what it is judging — source-only, or candidate-only. In the 2025 campaign a
source-only sentinel still reached **0.505 system-level correlation** while
ranking thirtieth of the field at segment level (**0.166**). A source-only rater
knows nothing whatever about the translation, so that 0.505 is not judgment; it
is the difficulty structure of the system pool leaking through. The sentinel is
the only thing that tells you how much of a headline system-level correlation is
an artifact of which systems happened to be in the comparison, and a number the
sentinel nearly matches is not evidence about quality. Run it every time the
pool changes, because the artifact is a property of the pool and not of the
metric.

**Corner-case rater tests before trust.** Before an estimator is allowed to
route anything, feed it: empty source, empty target, output in the wrong
language, output in the right language and the wrong script, and spelling
variants of a correct answer. A rater that scores any of those plausibly will
score them plausibly in production, on real output. This is not hypothetical —
the 2025 campaign saw real systems emit the wrong dialect (Modern Standard
Arabic where a dialect was required) and the wrong script (Latin where the
target is written in Cyrillic), and the automatic filtering did not flag it.
Note what that failure teaches about layering: language identity and script
identity are **deterministic** checks with unambiguous answers, not estimates,
and they belong where verdicts are produced
([deterministic-checks-before-estimates](./deterministic-checks-before-estimates.md))
— not inside the instrument whose whole output is a number.

## What running it costs, and what its licence permits

Two facts decide whether a design that leans on an estimator is buildable, and
neither of them is a quality fact.

**Compute is not the obstacle.** The largest open span-level estimator runs in
roughly **22 GB of accelerator memory** at about 8–10 segments per second on a
consumer card. Three-bit quantization brings that to about **8 GB with no
measurable quality loss** (rank correlation 0.435 against 0.433), and a
distilled 278M-parameter student keeps about **92% of quality at ~146 segments
per second** — two orders of magnitude more throughput than the teacher.
Pruning a distilled model, by contrast, collapses it (about −30%). The ladder is
therefore **distil or quantize, never prune**, and corpus-scale estimation over
a whole derived store is an affordable batch job rather than a per-call expense.
Budget arguments against scoring everything are usually arguments about a hosted
interface, not about the computation.

**The weight licence is a design constraint on the same footing as accuracy.**
In the most-used open metric family the reference-based checkpoint is
permissively licensed while **every reference-free and span-level checkpoint is
non-commercial** — which is to say, precisely the checkpoints a derived store's
gate would want are the ones a commercial product may not ship. At least one
major vendor's alternative publishes permissive code *and* weights, with an
error-score output and a reference-free mode, and that is what makes a
commercial build of this technique possible at all. The rule: **check the weight
licence before designing a gate around a model, because the strongest open model
in a family may be the one you may not use.** Finding out afterwards is a
rewrite and not a swap — the floor, the queue size and the review budget were
all calibrated on a scale that has to be abandoned, and the score history joins
the two-series problem below.

## When not to use it

- **When a rule decides the case.** A skeleton break, a termbase miss, a length
  overflow, a duplicated source with divergent targets: all are decidable
  exactly, and an estimator's probability about them is strictly worse
  information than the rule's answer, at higher cost.
- **On a pair or domain the estimator was not built for.** Its degradation is
  quiet — scores stay in range and stop meaning anything. Before trusting an
  estimator on an unusual pair, seed it with a small set of segments a native
  speaker has already typed, and check the ordering agrees with theirs. If it
  does not, the estimator is a random number generator on that pair.
- **As the only instrument on a critical surface.** Legal text, safety
  instructions, payment flows and error messages that instruct a user carry
  consequences an instrument correlating 0.35–0.57 with humans per segment
  cannot bound. Those surfaces are
  the hand-authored or reviewed-and-committed case, and the measurement
  argument does not reach them.
- **Across estimator versions.** A score series that spans an estimator
  upgrade is two series drawn on two scales. Re-score the history with the new
  estimator or start a new series; never join them.
