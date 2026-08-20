---
layer: technique
type: technique
subject: maturity-ladders
technique: band-design
status: forged
laws: [derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [cutting a continuous signal into named rungs, rung labels keep flipping between runs, choosing band edges]
---

# Band design

When a ladder sits on top of a continuous signal, the band edges decide every
rung label. They are policy of the same standing as a weight vector: owned,
rationalised, versioned, and — this is the part usually missed — *stabilised at
the announcement boundary*, because a rung is a word and a changed word reads as
news.

## Edges are placed, not spaced

Equal-width banding (five bands of twenty points) encodes a claim that capability
is uniformly distributed across the scale. It essentially never is. Real
populations pile up: a large mass of subjects with nothing, a long tail of
subjects with everything, and a thin middle. Equal widths put three quarters of
the population in one band, which is a ladder that has stopped discriminating
exactly where discrimination was wanted.

The procedure:

1. **Write the rung meanings first.** What does it mean, in words, to be
   `governed`? The criteria come before the numbers — the band edge is where the
   signal happens to separate subjects that meet those words from those that do
   not, and if you cannot state the words, banding is arbitrary by construction.
2. **Measure the current population.** Plot the signal's distribution across the
   real cohort. Look for joints — gaps, shoulders, the value above which
   subjects reliably have the property the rung asserts.
3. **Place edges at decision joints, then sanity-check the resulting
   distribution.** A defensible starting shape puts a meaningful minority at the
   top rung and a meaningful minority at the floor. If nobody can reach the top
   band, the ladder has no ceiling to aim at; if half the cohort is at the top,
   the top rung has stopped being an achievement.
4. **Freeze the edges and version them.** From this point the edges are a fixed
   reference frame. Re-fitting edges to each new cohort produces a ladder where
   improvement is invisible (everyone moves, nobody's rung changes) — the
   cohort-relative frame answers "who is ahead", the fixed frame answers "are we
   getting better", and a ladder is almost always asked the second question.
5. **Record how the label is recomputed.** Any stored rung derived from a signal
   names its derivation — the signal, the edge set, the version
   ([derivation-names-recomputation](../../_laws.md#derivation-names-recomputation)) —
   or the first disagreement between a stored label and a fresh computation has
   no arbiter.

## Bands must not be the only definition of the rung

The strongest ladders keep the rung's criteria authoritative and use the band
merely as the fast path. Where they can diverge, define which wins. The common
and correct arrangement: **a floor on the signal is necessary but not sufficient
for a rung** — the subject must both clear the numeric floor and satisfy the
rung's hard predicates. This is what stops a subject from buying a top rung by
accumulating cheap points on dimensions unrelated to the capability the rung
names. It also means the band edges can be re-tuned without the rung names
becoming lies.

Any count reported over bands carries its edge set and version
([count-carries-predicate](../../_laws.md#count-carries-predicate)); "18 projects
in the top band" is not portable without saying which edges produced it.

## Hysteresis: stabilise the announcement, not the number

A subject whose signal sits near an edge will oscillate between two rung names
across consecutive runs on noise alone — a re-scan, a transient failure, one
file added. Because the rung is a word, each flip generates a notification, a
status change, a conversation. The computation is not wrong; the *announcement*
is.

Two mechanisms, usually combined:

- **Asymmetric margins.** Promotion requires crossing the edge by a margin;
  demotion requires falling below it by a larger one. A subject that has been
  `governed` stays `governed` until it drops clearly, which matches the real-world
  asymmetry: capability is slow to build and rarely lost in one observation.
- **Confirmation over runs.** A rung change is announced only after N consecutive
  observations agree. Two is usually enough; more introduces lag that readers
  experience as staleness.

Rules that keep hysteresis honest:

- Hysteresis applies to the **published/announced** rung, not to the raw
  computation. Store both, so an audit can see "computed `curated`, published
  `governed`, held by hysteresis, 1 of 2 confirmations".
- Never let hysteresis hold a rung indefinitely. Bound it: after a stated number
  of runs disagreeing, the announcement follows the computation regardless.
- Apply it to **movement**, not to first observation. A subject's first-ever rung
  is published immediately; there is nothing to flap against.
- Size the margin from the signal's observed run-to-run noise, not from a round
  number. If re-running the assessment on an unchanged subject moves the signal
  by up to three points, a margin below three buys nothing.

## Edge changes are re-baselining events

Moving an edge re-labels part of the population without anything about those
subjects having changed. Before merging an edge change, compute the *label diff*
over the current cohort — who moves up, who moves down — and read it. If the
reshuffle is intended, the diff is the change's review evidence; if it surprises
you, the change was not understood. An edge move is a rung-moving change and
bumps the ladder version; see [ladder-versioning](ladder-versioning.md).

## When not to use this

If the ladder's rungs are defined by predicates alone, do not introduce bands to
"make it quantitative". Adding a synthetic score in order to band it invents a
scale, and then the invented scale's arbitrary weights become the real
definition of the rung. Predicate ladders are stronger, not weaker, for having
no number; the pressure to add one usually comes from a desire to average, which
the ordinal does not permit anyway
([ordinal-first-comparability](ordinal-first-comparability.md)).
