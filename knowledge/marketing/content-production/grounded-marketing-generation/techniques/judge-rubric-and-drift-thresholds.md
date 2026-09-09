---
layer: technique
type: technique
subject: grounded-marketing-generation
technique: judge-rubric-and-drift-thresholds
status: forged
laws: [statistical-honesty-before-a-verdict, label-convention-as-convention, not-measured-is-not-zero]
shared_with: []
use_when: [setting up a judged quality run for generated marketing output, choosing the thresholds that turn a quality score into a red build, deciding whether a cheaper model tier may serve a generation tool]
---

# Judge rubric and drift thresholds

Generated marketing quality is a measured quantity with a threshold, not an
impression. The measurement is a judged run: every operation's output, scored on a
fixed rubric by a held-constant judge, recorded per operation and per serving model,
and compared on every later run against the recorded numbers by rules that can see
both a single collapse and a uniform slide. A floor alone catches the first; only a
baseline catches the second.

## The rubric

Five dimensions on a one-to-ten scale, each described in one line so the judge and the
reader agree what it means: overall quality; relevance to the brief; correctness and
constraint adherence (limits, prohibitions, facts); task and structure adherence
(every requested element present, in shape); language, tone and on-brand. Plus a
one-sentence verdict and a list of concrete issues, empty when none. The judge sees the
tool's system prompt, the input, and the output, and is told to judge only the output
against the task, strictly and concretely, in the project's language.

Correctness and constraint adherence is the dimension this subject cares about most,
and it is the one a fluent fabrication scores well on unless the judge is told what
was supplied. The judge's input must therefore include the grounding the generator
received, or the rubric cannot see an invented number.

## Judge discipline

- **Several judges, take the median.** Three judge calls per cell is the convention;
  the median of three absorbs one outlier verdict. The verdict and issue list shown are
  those of the judge closest to the median.
- **One judge model, held.** A generation wrapper that falls back to another provider
  on failure will silently score half the cells with a different judge, and a
  cross-cell comparison is then void. Keep only the verdicts from the intended judge;
  when none stayed on it, leave the cell unjudged rather than accept an off-model
  score ([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).
- **Disclose the home team.** When the judge and a target share a vendor family, those
  cells are graded by a sibling; print the bias beside the score, and do not read them
  as neutral.
- **Serve the target, or the cell is void.** A cell counts only when the model under
  test actually served the output; a fallback to another model or to a demo is an
  unserved cell, not a score.
- **Record validity beside the score.** A cell whose output failed the tool's own
  validator is marked invalid whatever the judge said - production would have clamped
  or dropped it.

## The thresholds

- **A floor** - "not terrible" - sized to leave one half-point of run-to-run judge
  variance and still fail a real collapse. It catches an operation dropping to six. It
  cannot catch a prompt edit that takes one operation from 8.5 to 7.0, or a model swap
  that takes every operation down most of a point with nothing red.
- **A per-cell maximum drop** against the recorded baseline, sized one full point:
  half a point is judge variance, so a full point is the smallest drop that means
  something changed.
- **A maximum mean drop** across all baselined cells, sized well under the per-cell
  rule (a third of a point in one product), because it is the only rule that sees the
  failure the per-cell rule cannot - every operation losing nine tenths and passing.

All three are practitioner convention sized from observed judge variance in one
product, and are labelled so ([label convention as convention](../../../_laws.md#label-convention-as-convention)).
Another judge, another rubric, another scale gives another variance and another set
of numbers; the shape - floor, per-cell drop, mean drop - is the technique.

## The baseline is custody, not a number

The baseline file records, per operation and per serving model, the score the product
ships with; the date it was measured; the judge; and, for each serving model, *where
in the source the product declares it serves that model*. The gate reads that
declaration on every run, so a model swap goes red on the swap - "the recorded quality
describes a model the app no longer serves" - rather than staying green until someone
spends half an hour on a fresh matrix. Moving the baseline requires a written reason
in a changelog, the same discipline as a golden prompt fingerprint, because
re-recording a number is how a regression is absorbed. A baselined cell missing from
a new bake blocks: an operation cannot disappear from measurement while it is still
served. The measurement's age is reported, and past a few months is flagged as
describing a model roster that has moved on.

## Tier degradation is categorical versus numeric

A benchmarked finding worth carrying as a hypothesis: the cheap tier fails in two
ways - it ignores hard constraints (over-limit assets that the clamp then truncates
mid-word) and it drops grounding (specifics become generic) - and on numeric tools it
inverts economics and fabricates counts. The safe boundary for a cost-driven downgrade
was not "creative versus constrained" but **categorical versus numeric**: a pure
regrouping task survived the cheap tier; anything that must carry numbers or specifics
needed the quality tier. The quality tier also self-validated limits at several times
the latency. Test the boundary on your own tools before trusting it
([statistical honesty before a verdict](../../../_laws.md#statistical-honesty-before-a-verdict)).

## Decision rules

- When a prompt fragment shared by several tools changes, re-judge every tool it
  feeds, not the one whose author made the edit; a hash over the shared fragment is
  how the gate knows.
- When a served model changes, re-bake and accept a new baseline with a reason; never
  edit the recorded numbers by hand.
- When a cell falls by more than the per-cell drop, or the mean by more than the mean
  drop, the build is red; a reason to accept the new numbers is a changelog entry, not
  a threshold edit.
- When only one judge stayed on model, report the cell as judged by one and read it
  with the variance that implies.
- When the judged run is expensive, keep it on demand and let the cheap gate compare
  the *baked* numbers against the baseline on every run; the split is what makes the
  number acquire a threshold at all.

## When not to use this

Do not use a judged score to decide *publication* of one output; that is the
publishable-as-is gate's job, and a rubric score has no line for "the shop never
offered free shipping". Do not compare scores across two different judges, two
different rubrics, or two different scales. Do not let a baseline stand in for a
floor: a product that baselines a six is protecting a bad number. Do not read a
half-point move as a change; it is inside the variance the thresholds were sized
from.
