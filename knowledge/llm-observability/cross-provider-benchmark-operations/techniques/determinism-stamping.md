---
layer: technique
type: technique
subject: cross-provider-benchmark-operations
technique: determinism-stamping
status: forged
laws: [estimation-announces-itself, never-present-absence-as-an-answer]
shared_with: []
use_when: [a benchmark verdict must be reproducible, comparing runs across providers with different sampling controls, deciding how much run-to-run delta is dice]
---

# Determinism stamping

A verdict should be a measurement, and a measurement someone else cannot
reproduce is an anecdote with a decimal point. But providers expose wildly
different sampling controls — some take a temperature and a seed, some take
temperature only, some (notably CLI-mediated access paths) take nothing at
all — so "this run is reproducible" is not a policy you can set; it is a fact
you must *record*, per call, and fold honestly upward. The stamp is a small
closed vocabulary, ordered weakest first:

- **sampled** — deliberately unpinned: the operator asked for multiple draws
  on purpose (generation self-consistency). Pinning here would collapse every
  draw onto one output and silently delete the feature; so sample, and say so.
- **best-effort** — every control the provider exposes was pinned, but the
  provider exposes no seed (or no controls), so replays can differ.
- **exact** — temperature pinned *and* a seed accepted; a replay reproduces.

## Procedure

1. **Stamp both halves.** A benchmark cell *generates* a candidate and then
   *judges* it, and pinning only the judge was never enough — a candidate
   redrawn on every run makes the run irreproducible however deterministic
   the grading was. Record generation determinism and judging determinism
   separately, and let the run's headline stamp be the **weaker** of the
   two, with the detail naming which half is the limit. A half that did not
   happen (a mode that judges caller-supplied outputs and generates nothing)
   is null, not exact.
2. **Fold pessimistic.** A run takes its weakest call's stamp; an aggregate
   of runs takes its weakest run's. And an *unrecorded* stamp voids the
   claim entirely — it folds to "not recorded", never to the level its
   recorded neighbors would vouch for. A set of runs is only as reproducible
   as its least reproducible member, and silence is not a member in good
   standing.
3. **Keep the vocabulary closed.** Three levels, no fourth. Anything outside
   the vocabulary is clamped to "not recorded" at every boundary where
   stamps arrive from elsewhere. A free-form determinism label is both
   meaningless to a reader and a fingerprint of its author.
4. **Put the stamp in the artifact.** It appears in the run report and on
   each stored verdict's detail — the reader learns how pinned the number
   was from the number itself.
5. **Degrade, never exclude.** A provider with no sampling knobs still runs
   — stamped best-effort — rather than being silently included in an exact
   claim or silently dropped from the matrix. The stamp exists precisely so
   heterogeneous providers can share a scorecard honestly.

## Reading the stamp

The stamp changes how downstream numbers are read, and that is its value:

- On a best-effort run, part of the measured self-consistency disagreement
  is sampling noise rather than genuine ambiguity — read judge-agreement
  figures accordingly, and expect run-to-run deltas to carry a dice
  component that no amount of statistical correction removes.
- An exact-stamped run whose replay differs is a *bug report* — on the
  stamping, the provider, or an unpinned input (an unfrozen dataset defeats
  an exact stamp; the two disciplines only work together).
- When runs are compared or merged across instances, the stamp is part of
  what makes them commensurable: a pinned run against a frozen set is not
  the same evidence as a sampled run against a mutable one, and any merge
  that treats them as equals is lying by omission.

## Decision rules

- **When a pinned API path and an unpinned CLI path both reach the same
  model, prefer the API path for benchmarks** — it typically pins
  temperature, avoids ambient context injection, and upgrades the stamp.
  Keep the CLI path available (subscription economics are real) but stamped
  as what it is.
- **When the operator sets multiple generation samples per case, stamp
  sampled** — even on a seeded provider. Intent outranks capability.
- **When an old run predates stamping, report it as unknown, never libel it
  as sloppy** — and never let it vouch for a claim either.

## When not to use it

There is no situation where recording the stamp is wrong; the anti-pattern
is *enforcing* it — refusing to run on unpinnable providers. That converts a
disclosure mechanism into a coverage hole shaped exactly like your least
pinnable (often most interesting) provider. Stamp everything, refuse nothing,
and let the reader weigh the evidence.
