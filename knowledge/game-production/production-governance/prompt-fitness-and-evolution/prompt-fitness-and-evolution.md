---
layer: golden-path
type: golden-path
subject: prompt-fitness-and-evolution
status: forged
use_when: [revising a production prompt that authors project artifacts, claiming a prompt change improved quality, comparing two prompt variants, computing a fitness score for a prompt version]
techniques:
  - mutation-taxonomy
  - stamp-prompt-version-into-provenance
  - join-judge-verdicts-to-prompt-version
  - exclude-synthetic-fixtures-from-fitness
  - unjudged-is-null-not-zero
  - min-trials-and-confidence-banded-conclusion
---

# Prompt fitness and evolution

A production prompt is the piece of a generative pipeline that authors artifacts people
later ship: a step of a quest, a stat block, a level brief, an ability description. It gets
revised constantly, by whoever is closest to the last complaint, and the revision is almost
never treated as what it is. Editing a prompt *feels* like editing text. It is an
experiment — and it carries every obligation an experiment carries: a stated hypothesis, a
change small enough to be attributable, a defined population, a stopping rule, and an honest
treatment of missing data. Skip those and you do not get a worse experiment; you get no
experiment, plus a growing sediment of prompt clauses nobody dares delete because nobody
knows what any of them do.

This subject is the *measurement* half. The structure of a production prompt — how it is
composed, what context it is given, how its output is shaped — is a separate concern, and a
demanding one. So is verdict integrity: what a quality judgment is bound to, when it goes
stale, how a rubric is superseded. And the general operator practice of scoring live model
traffic with an evaluation harness belongs to the neighbouring discipline of model
observability, which owns telemetry, cost attribution and generic evaluation rigs. What is
here is narrower and more concrete: a prompt that runs in production, revised over time,
where the quality signal comes from the same judging apparatus the project already runs on
its own artifacts. You are not building an eval harness. You are asking whether last
Tuesday's edit helped.

## Prompt cruft is the disease; fitness is the diagnosis

Watch an undisciplined prompt over a year. Someone adds "be specific" after a vague output.
Someone adds three example outputs after a formatting complaint. Someone adds "do not
hallucinate item names" after an incident. Someone adds a paragraph of tone guidance copied
from a sibling prompt. None of these were measured. Each is now load-bearing in the sense
that nobody can prove it isn't. The prompt is 4,000 tokens of accreted superstition, it costs
more per call than the pipeline's next three steps combined, and the only honest statement
anyone can make about it is "it works well enough".

The disease is not the additions. It is that no addition was ever *attributable* to an
outcome. Fitness discipline reverses that: every revision is a named mutation of a known
parent, every artifact carries the version that produced it, and every quality verdict joins
back to that version. Then a clause can be removed, because removal is itself a mutation you
can measure. A prompt you can shrink is a prompt you understand.

## The five obligations

**A hypothesis.** "This variant will raise mean craft score on the step types that scored
below the threshold" is a hypothesis. "This reads better" is not. State the metric and the
direction before generating, because after generating you will find something that moved.

**An attributable change.** A revision must vary one thing from a closed set of ways a
prompt can be varied. Rewriting a prompt freehand and finding it scores higher tells you
nothing you can carry to the next prompt: you have a different prompt, not an improved one.
A closed taxonomy of mutations is what makes two revisions comparable, makes a gain
attributable to a kind of change, and stops a "revision" from being an unrelated rewrite
that happens to score better (mutation-taxonomy).

**A population.** A fitness number is a statistic over a set of artifacts, and the set is
part of the number's meaning. Test fixtures, seeded demo content, retry duplicates and
abandoned drafts sit in the artifact store and are not evidence about the prompt
(exclude-synthetic-fixtures-from-fitness).

**A stopping rule.** Stated in advance, in trials and confidence, not in the operator's
patience (min-trials-and-confidence-banded-conclusion). Stopping the moment a difference
looks favourable is not a weak experiment; it is a generator of favourable differences.

**Honest missing data.** An artifact the judge never scored is not a zero. It is *not
measured* (unjudged-is-null-not-zero).

## The join is the whole architecture

Everything above rests on one mechanical prerequisite: at scoring time you must be able to
answer "which prompt version produced this artifact?" for every artifact in the population.
There are only two ways to get that answer, and only one of them works.

The way that fails is reconstruction: infer the version from the artifact's creation
timestamp against a deployment log. It fails on retries, on backfills, on artifacts
regenerated from an old queue, on any window where two variants ran concurrently — which is
exactly the window an experiment lives in. It fails silently, and it fails hardest at the
moment of highest stakes.

The way that works is stamping: the identity of the prompt version travels with the artifact
as provenance metadata, written at generation time by the same code that made the call
(stamp-prompt-version-into-provenance). Then the fitness join is a lookup on a recorded key
rather than an inference (join-judge-verdicts-to-prompt-version).

**The stamp comes with a warning, and it is the sharpest one in this subject.** Provenance
must travel *beside* the artifact and be excluded from everything that grades or fingerprints
the artifact's content. Put the prompt identity — or worse, the prompt text — inside the body
that goes to the judge and you have contaminated your own measurement.

## The contamination trap

This is the deepest trap here, and it is worth stating as a scenario because teams walk into
it while believing they are being thorough.

A pipeline stores each generated artifact together with the request that produced it, for
debuggability. The judging step serialises the stored record and sends it to the critic. The
rubric — correctly — penalises artifacts that contain leaked instruction text, because leaked
instructions are a real defect in shipped content. So the critic sees instruction text inside
the payload, and the score reflects it. In one measured case this affected 240 of 816
artifacts and moved scores by roughly 17 points on a 100-point scale.

Three things are wrong at once, and only one of them is obvious.

The obvious one: those 240 scores are not measurements of the artifacts. The subtler one:
the corruption is *not random*. It is a function of how long the prompt is, so a mutation
that adds guidance is penalised more than one that removes it — the measurement has a
built-in preference over exactly the axis you are trying to evaluate. The subtlest: because
the effect is systematic, it survives averaging. More trials make you more confident in a
biased number.

**Prove a harness defect the same way you would prove a prompt change: run it as an arm.**
The magnitude above was not estimated, it was measured — a comparison across artifact cells,
median of three per arm, where re-running the *unchanged* pipeline as a control moved scores
by +0.4 (standard deviation 3.1) while the contaminated arm moved by +16.9. Without the
control arm, +16.9 is a number someone can argue with; with it, the run-to-run noise floor is
established and the defect is unarguable. This is the single most useful move in the subject:
the instrument that measures prompts also measures itself.

The countermeasure is a projection rule enforced in one place: the judged payload is a
declared projection of the artifact — the fields that constitute the shipped content, and
nothing else. **And the projection fails in both directions.** In the same investigation, a
second defect ran the other way: the payload projected sibling context as bare scalars, so
for 314 of the same 816 artifacts the siblings arrived empty and the critic condemned real,
correct cross-references as invented — worth +4.3 once fixed. Too wide and the judge grades
your provenance; too narrow and it condemns content for evidence you withheld. The declared
projection is exactly the shipped content: no provenance, no request records, no retry
history — and all of the context the criteria require. The general discipline of what a
verdict binds to and how payloads are projected is owned by the neighbouring subject on
verdict integrity; name the seam and use their rule. But the *consequence* is yours, because
in your subject the contaminant is the very thing under test.

## What a small comparison can and cannot claim

Comparisons of prompt variants are usually run on a handful of trials per arm, because each
trial costs a model call and a judging pass. Be honest about what that buys.

A minimum of three trials per arm with confidence banding at standard-score thresholds is a
real instrument for exactly two jobs: catching large regressions before they reach a batch,
and confirming an obvious win cheaply. At that sample size an effect has to be big to clear
even the weakest band, which is the point — it is a coarse filter, and coarse filters are
useful when the alternative is no filter.

It is not an instrument for fine-grained ranking. It cannot order four variants that are
within a few points of each other, it cannot support "variant B is 6% better", and a
difference that clears the weakest band on three trials per arm is a *lead*, not a result.
The failure mode is not the small sample; it is the small sample reported with the language
of a large one. Report the band, the trial count, and the basis — a score without its basis
is not a measurement.

## The positive case: revisions can produce large, durable gains

None of this scepticism means prompt revision is futile. A documented rewrite of an authoring
prompt moved every step type it governed into the top quality band and held it there, and it
is worth naming what that rewrite actually contained, because the mutations that produce
durable gains have a family resemblance:

- **Single source of truth with the arithmetic shown** — the artifact states a quantity once
  and derives dependents visibly, rather than restating a number that can drift.
- **Forward-derive rather than reverse-engineer** — compute the result from the inputs, never
  fit inputs to a desired result.
- **Sibling-sourced cross-references** — a reference names a real neighbouring artifact,
  checked, rather than a plausible-sounding invention.
- **Prove the hard cases inline** — the prompt requires the awkward instance to be worked
  through in the output rather than asserted.
- **Scope depth to the subject** — depth is spent where the subject warrants it, not spread
  evenly.
- **No vaporware** — nothing is described that does not exist.

The pattern: durable gains come from mutations that constrain *what the output must prove*,
not from mutations that add adjectives about tone. That is a hypothesis you can test, and it
is the kind of finding a mutation taxonomy exists to produce — attributable to a class of
change, transferable to the next prompt.

## Failure modes, stated plainly

**Fitness computed over everything in the store.** The number describes the store, not the
prompt. Nearly half of one measured arm was test fixtures.

**Unjudged treated as zero.** Manufactures a penalty proportional to judging backlog, which
correlates with volume, which correlates with whichever variant is winning traffic.

**Stopping on the first favourable difference.** With enough peeks, every variant wins once.

**A version that is a hash of the prompt text rather than an identity of the deployed
configuration.**
If the prompt is assembled from a template plus injected context plus model settings, the
fitness unit is the assembled configuration. Two artifacts stamped with the same version must
have been produced under the same conditions, or the join is joining noise.

**Retiring the loser without recording why.** The discarded variant is the only evidence you
will ever have that its mutation class does not work. Keep the lineage: parent, mutation,
trial count, band, verdict. A prompt you can shrink is a prompt whose history you kept.
