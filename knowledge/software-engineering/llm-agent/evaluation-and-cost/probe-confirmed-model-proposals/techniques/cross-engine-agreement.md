---
layer: technique
type: technique
subject: probe-confirmed-model-proposals
technique: cross-engine-agreement
status: forged
laws: [count-carries-predicate, claimant-does-not-adjudicate]
shared_with: []
use_when: [choosing which engine proposes configurations, measuring how determined a proposal is by its evidence, deciding where a person should look before saving]
---

# Cross-engine agreement

Run the same fact pack through two or more engines and compare their
proposals. What the comparison measures is narrow and worth having: **how much
of the proposal is fixed by the evidence, and how much by the proposer.** A line
every engine proposes is one the pack determines. A line only one engine
proposes is one where the pack is ambiguous or the engine is reaching. Neither
statement is about correctness, and the technique's discipline is keeping it
that way.

## Agreement is a property of the proposer, not of the line

Engines trained on overlapping corpora share priors. Faced with an
unconventional target, they agree on the conventional guess — the test command
a typical project in that ecosystem would use, the folder name such projects
usually have — and they agree confidently. Published audits of agreement as a
confidence signal find the same thing at scale: it predicts correctness weakly
and conditionally, and the most consistent engines are the most over-confident
when they are wrong. So agreement is never a vote that admits a line, never a
reason to skip a probe, and never a reason to save a line the probes refuted.
The probes adjudicate; agreement describes the proposers who were adjudicated
([_laws: claimant-does-not-adjudicate_](../../../../_laws.md#claimant-does-not-adjudicate)).

## Choose engines that can disagree

Two samples of one model measure that model's sampling noise. Two sizes of one
model family share most of their priors and measure less than they appear to.
The informative comparison is across **independent families**, at the same
effort setting, over the same pack. A same-family comparison is still useful
for one decision — whether the cheaper size is good enough to be the default —
but report it as that, not as stability.

Run the arms one after the other, not in parallel, when wall time is part of
what is being compared, so neither arm's latency carries the other's load.

## Compare per line kind, after normalization

A single overall percentage hides where disagreement lives. Compare per line
kind — pipelines, variants, components, cloud resource — as sets keyed by the
identity that matters for that kind (a pipeline by its definition file, else its
id; a component by its path), order-insensitive and deduplicated. Normalize
both proposals through the same cleaners first, so a difference in spelling the
probes would erase is not counted as disagreement. Better still, compare the
two *confirmed* configurations as well as the raw proposals: raw agreement
measures the proposers, confirmed agreement measures what the system would
actually save under each, and the gap between them is the work the probes did.

Every agreement figure carries its predicate — which engines, which pack, which
kinds, raw or confirmed, keyed how — because "three of four agree" travels and
will be reused for a claim it does not support
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)).

## Pair agreement with a reference target

Agreement can be high while both engines are wrong. Keep at least one
reference target whose correct configuration is known — the variants it must
yield, the component it must find, the resource it must name — and score every
arm against it alongside the agreement figure. Agreement says the proposal is
stable; the reference says the stable answer is right on a case someone
checked. Neither substitutes for the other, and only the reference catches the
shared-prior failure.

## What to do with disagreement

Disagreement is the cheapest pointer available to where a person's attention
pays. Show the lines on which engines split, with each engine's version, before
the save; those are where a missing fact or an ambiguous convention lives, and
the fix is usually a fact added to the pack rather than a better engine. Store
each comparison as a report — engines, timing, dropped specs, line counts,
per-kind agreement, reference checks — so the choice of default engine is made
from a series rather than from one run.

## Decision rules

- When agreement is high, still run every probe.
- When choosing comparison engines, prefer independent families; label a
  same-family comparison as a cost decision.
- When reporting agreement, report it per line kind, normalized, with its
  predicate.
- When agreement and a reference check diverge, trust the reference and add the
  missing fact to the pack.

## When not to use this

When a single proposal costs as much as the configuration is worth — a one-off
target nobody will onboard twice — the second engine buys little that the
probes do not already provide. Agreement earns its cost when the proposer is a
standing component whose default engine, prompt and pack are being tuned across
many targets.
