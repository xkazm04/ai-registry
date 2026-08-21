---
layer: technique
type: technique
subject: structured-interview-scorecards
technique: separate-rubric-per-population
status: forged
laws: [meaning-does-not-live-in-a-label, a-claim-carries-its-sample-and-its-basis, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [hiring early-career and experienced candidates for the same role, a rubric penalises candidates for opportunities they have not had, deciding whether two candidates are comparable]
---

# Separate rubric per population

One instrument cannot score two populations whose evidence of quality is
structurally different. The canonical case is early-career versus experienced,
and it is worth stating exactly why it breaks, because the same failure recurs
wherever a population is defined by what it has not yet had the chance to do —
career changers, returners, internal transfers into a new discipline.

## Why the shared scale fails

Score a graduate against an experienced rubric and the instrument works
correctly, on the wrong question. Ownership, scope of impact, cross-functional
influence and judgment-under-ambiguity anchors all resolve against a track record
the candidate has not had the opportunity to build. The rating is accurate — they
did not do those things — and the inference drawn from it is false: the scale
reports absence of *opportunity* as absence of *capability*.

The mirror-image loss is larger. Everything predictive about an early-career
candidate — how fast they learn, how they respond to a correction, the quality of
their reasoning on an unfamiliar problem, what they do when they do not know — is
not an axis on the experienced scale at all. So the strong graduate and the weak
one score alike, both low, and the instrument has spent a whole loop
distinguishing nothing.

Compensating by "grading generously for level" is worse than either. It is an
undocumented per-rater adjustment applied inconsistently, and it destroys
comparability within the population it was meant to protect.

## The construction

Build a genuinely separate scoring model: its own competencies, its own anchors,
its own bar. Not a subset of the experienced one, not the same axes with softer
wording. The early-career model's axes are typically the *rate* competencies —
learning agility, coachability, reasoning quality, communication of unfinished
thinking — where the experienced model's are the *record* competencies.

Anchor-writing craft carries over unchanged (see
behaviourally-anchored-level-writing), and the low anchors matter as much here:
"ignores or reflexively defends against a hint" is a level-1 coachability
behaviour that is observable in a forty-minute conversation with someone who has
never held a job.

## The two disciplines that keep it honest

**Record the model on the scorecard; do not infer it at read time.** Which model
applied is a fact about how the candidate was assessed. Deriving it later from
years-of-experience, a title, or a graduation date means the classification can
change under a record that never changed, and it means a candidate can be
reclassified by an edit to their profile. Where the classification is genuinely
ambiguous at assessment time, resolve toward the model that does not penalise for
missing track record
([uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)),
and record the choice.

**Default historical records to the model that existed.** Rows written before the
second model was introduced belong to the original one, because nothing else
could have produced them (see rubric-versioning-at-write-time). Retro-assigning
them by profile attributes manufactures provenance.

## Comparability is within a model, never across

This is the rule that people most want to break, because a hiring manager wants
one ranked list. A 4 on learning agility and a 4 on scope of ownership are not the
same claim, are not on the same scale, and do not average
([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

What a cross-model view may legitimately do:

- **Group by model and rank within each group.** Two ordered lists, both honest.
- **Show the model as a first-class attribute of every row**, so nobody reads a
  mixed table as one ranking.
- **Compare at the decision layer, not the score layer.** "Both clear their bar"
  is a comparable statement; "4.2 versus 3.8" across models is not.

What it may never do: pool, average, percentile, or threshold across models. A
cutoff applied to a mixed population is a cutoff applied to two different
instruments at once, and which population it culls is an artifact of scale
construction, not of candidate quality.

## Do not multiply populations

Every additional model is another instrument to calibrate, another anchor set to
maintain, and another partition that shrinks every within-group sample. The bar
for splitting is high and specific: **split when the evidence of quality is
structurally different, not when the level is different.** Junior and senior
within the same experienced population share a rubric and differ in where the bar
sits — that is a bar decision, not a model decision. Population splits are
usually one, occasionally two; a system with six scoring models has built six
under-calibrated instruments.

Splitting by *role family* is a different axis entirely and is handled by adding
axes rather than by forking the model (see role-family-axis-extension).

## When not to use this

- **Do not split by a protected or proxy attribute.** Population here means the
  structure of available evidence — early in career, changing discipline,
  returning after a gap. A model keyed to anything that stands in for a protected
  characteristic is a fairness incident wearing a methodology.
- **Do not split when you cannot calibrate both.** A second model with no
  calibration practice behind it is less reliable than one imperfect shared scale,
  and its ratings will not be comparable even within itself.
- **Do not use the split to run a lower bar.** A separate model measures different
  evidence at the same standard. If it exists to let weaker candidates through, it
  is not a rubric, and the record will say so.
