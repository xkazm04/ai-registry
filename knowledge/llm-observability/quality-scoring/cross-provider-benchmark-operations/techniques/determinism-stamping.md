---
layer: technique
type: technique
subject: cross-provider-benchmark-operations
technique: determinism-stamping
status: forged
laws: [estimation-announces-itself, never-present-absence-as-an-answer]
shared_with: []
use_when: [a benchmark verdict must be reproducible, comparing runs across providers with different sampling controls, deciding how much run-to-run delta is dice, a pinned and seeded request came back different on a replay]
applied: experiment
ab_verdict: better
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
- **exact** — temperature pinned *and* a seed accepted. This is a claim about
  the request. It does not promise that a replay reproduces (see "Exact is
  claimed from the request").

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
- An exact-stamped run whose replay differs is first a question about **what
  the replay was compared to**. A replay made in a different server state
  can differ with nothing wrong in the stamp, and a provider that documents
  its seed as best effort has promised nothing a replay could break. Only when
  the state matches and the provider does promise it is the difference a *bug
  report* — on the stamping, the provider, or an unpinned input (an unfrozen
  dataset defeats an exact stamp; the two disciplines only work together).
- When runs are compared or merged across instances, the stamp is part of
  what makes them commensurable: a pinned run against a frozen set is not
  the same evidence as a sampled run against a mutable one, and any merge
  that treats them as equals is lying by omission.

## Exact is claimed from the request

The stamp is written from what was sent. Whether the output repeats depends also
on what the serving process held when the request arrived, and the request does
not carry that. So keep the two facts apart:

- **The stamp stays as it is**, three levels, written from the request.
- **Replay evidence is a separate field beside it**: `k of n identical`, and the
  server state the n requests ran in (each reloaded, sequential on a loaded
  process, or with other requests in flight). A replay field with no state
  named reads as not recorded.
- **Compare like with like.** A warm pass that agrees with itself says nothing
  about the cold pass, and a number read across runs is only as stable as the
  state those runs shared.

Measured on one local server, CPU only, one small quantized model, eight judge
prompts built from real passages, temperature 0 and a fixed seed, five identical
requests per prompt, target and floors written first. Sequential on a loaded
process, 5 of 8 prompts split, each time the first request against the four after
it. With another request in flight, 6 of 8. With the model reloaded before every
request, 0 of 8. A second sequential pass gave 0 of 8, yet its repeated answer
differed from the first pass's repeated answer on 5 of 8, so a replay can agree
with itself and still not reproduce the run it is meant to check. Across all four
pinned conditions, 6 of 8 prompts produced more than one output. Unpinned, 8 of 8
split with five different outputs each, so the pin still narrowed things a great
deal. In a separate reading, reloading against repeating moved the parsed score on
2 of 8: the leading digit was there cold and gone warm. The pattern fits state the request
does not carry, such as a reused prompt prefix and the other work in the batch;
that cause was not isolated. One server, one small model, no GPU path and no
hosted provider were measured.

## Decision rules

- **When a number stamped exact will be compared across runs, replay each case
  at least twice in the state the comparison will be read in**, and put the
  replay field in the artifact. An exact stamp without one claims the request
  only, and is read that way.
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
