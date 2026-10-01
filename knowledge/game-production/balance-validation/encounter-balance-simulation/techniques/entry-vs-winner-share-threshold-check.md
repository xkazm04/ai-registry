---
layer: technique
type: technique
subject: encounter-balance-simulation
technique: entry-vs-winner-share-threshold-check
status: forged
laws: [an-instrument-proves-it-had-input, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [writing a dominance or outlier threshold for a roster sweep, a dominance check has never failed, reviewing the balance instrument before accepting its pass]
---

# Entry rate versus winner share: can the threshold fire at all

The concern is the review of the balance instrument itself, one level above the review of the
game. Every dominance gate is a pair: a metric and a threshold. The pair is informative only if
the threshold lies inside the range the metric can reach under the roster and the schedule the
sweep actually runs. A gate whose threshold sits above its metric's attainable maximum is not a
lenient gate, it is an absent one, and it returns the same clean result as a gate over a perfectly
balanced roster. The tell is that it has never failed and nobody can say what failing would look
like.

Status of claims: every figure below is **simulated** (seeded races or fights driven by scripted
or proxy controllers); the reachable-maximum arithmetic is **exact** and needs no simulation. No
claim here is a human-felt balance verdict.

## The arithmetic

An entry rate is the share of a class's *entries* that end a given way: placed, won, survived. It
is bounded by how the roster fills the field. If each class appears as a fixed share of the
entries, a rate counted over those entries cannot exceed the share of the field the class
occupies, because the class is simply not present in the rest. With three copies of each of
several classes, and the rate normalised against the whole population, the cap on a per-class
rate in the reported example was one third. A dominance threshold of fifty-five percent on that
rate cannot be reached by any class under any tuning, so a forty-thousand-run sweep reported "no
dominance" with the force of a coin that has two tails.

The repair is to change the metric to one whose range includes the threshold. **Winner share**,
the fraction of all races won by each class, runs from zero to one. In a symmetric field its fair
value is one over the number of classes, and a threshold between fair share and one bites.
Because winner share depends on which courses or arenas the races were run on, it is taken over a
**declared mix** with its weights written beside the number. The roster-level ownership of that
metric belongs to the vehicle archetype balance work; this technique only requires that the
reviewer can show the metric was reachable.

## The procedure

1. **Write the gate as metric, threshold, population.** The population names the field
   composition: how many entries of each class, how many entrants, which schedule.
2. **Compute the maximum attainable value of the metric** under that population, by arithmetic or
   by constructing the extreme case (one class given every win) and running the metric on it. If
   the constructed extreme does not exceed the threshold, the gate is dead.
3. **Compute the fair-share value** under the same population. The threshold must sit strictly
   between fair share and the maximum, with the margin stated; one at or below fair share fires on
   a perfectly symmetric roster.
4. **Run the planted-defect test.** Hand the harness a roster in which one class is deliberately
   overtuned and confirm the gate fails and names that class. A gate that has never been seen to
   fail has not been shown to work.
5. **Record the check beside the gate.** Report the reachable range next to the verdict, so a
   reader sees "share 0.34, threshold 0.45, reachable 0.11 to 1.0" and not only "pass".
6. **Keep the dead summaries.** When the first sweep is replaced because its instrument was
   uninformative, its summaries are retained and labelled as initial evidence. They are an honest
   record of what was measured; they are not deleted and they are not quoted as a verdict.

## Craft notes

- Per-entry rates are legitimate descriptive statistics: a class's placing rate when present is a
  fine column in a report. The defect is only using one as a *gate* against a threshold chosen for
  a different denominator.
- A threshold carried over from a brief written for another denominator is the commonest source.
  A literal reading of "no class above fifty-five percent" quietly assumes a metric whose range
  reaches fifty-five. When replacing the metric, say whether the new gate is stricter or looser
  than the literal text and by how much, so the owner of the brief can overrule it.
- The same audit applies to every threshold in the report, not only dominance: a one-shot alarm
  over a population that contains no lethal hit, a sponginess alarm over fights that cannot last
  that long, a minimum-peer check over tiers that all have more peers than the minimum. Each
  alarm gets its reachable range.
- A clean alarm summary is a statement about the declared alarms and nothing else. Write it that
  way: no declared numeric alarm fired, and this is not a quality verdict.

## Decision rules

- If a threshold's reachable range was never computed, the gate's pass is `not measured`, not a
  pass.
- If the maximum attainable value is below the threshold, replace the metric before running
  anything further; do not lower the threshold until it can fire, because that discards what the
  threshold meant.
- If the replacement metric changes the denominator, rerun the sweep; the old numbers are about
  the old metric.
- If the gate fires on the planted defect only above a sample size the run does not reach, it is
  reachable in principle and uninformative in practice; raise the sample size or label the result
  as underpowered.

## When not to use it

- **On a threshold that is a design floor, not a dominance claim.** A floor such as a one-shot
  bound is meant to pass most of the time; its audit is that its inputs exist, not that it
  fails.
- **When the roster is not symmetric on purpose.** A campaign where one class is meant to appear
  more often has no fair-share value to measure against; state the intended shares instead and
  gate the deviation from them.
- **As a replacement for reading the results.** Showing a gate can fire does not show the game
  is balanced; it only shows the instrument is able to say otherwise.
