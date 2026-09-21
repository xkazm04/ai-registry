---
layer: technique
type: technique
subject: harness-fault-attribution
technique: clear-the-environment-first
status: draft
laws: [the-harness-is-a-suspect-in-every-red, measure-the-tree-not-the-summary]
shared_with: []
use_when: [triaging a failed or red run, before writing down a finding about a model, investigating a cluster of failures across configurations]
---

# Clear the environment first

The concern: attribution errors are asymmetric. Blaming the model is free, immediate and
socially uncontested; blaming the harness requires work. Left to instinct, a fleet's defect
list fills with model findings that are environment faults, and each one is quoted
afterwards as evidence. **Run the checklist before the attribution, every time, and make it
cheap enough that nobody skips it.**

## The checklist

1. **Did the run happen?** Refused, truncated, killed, or genuinely executed. A run that
   did not happen has nothing to attribute.
2. **Was it isolated?** Shared build directories, caches, dependency trees, generated
   artefacts, links into a real working tree — anything a sibling run or a human could have
   written while this run read it.
3. **Was setup complete?** The environment step the repository declares, run in the order it
   declares, before the checks that need it.
4. **Was the clock honest?** Host suspension, throttling, a ceiling that fired on wake.
5. **Was the measurement the same?** Compare the harness version the run was scored under
   with the current one; a fact added later may be missing, and a fact refined later may be
   computed two ways across the corpus.
6. **Was anything else writing?** Concurrent runs, an editor, a dev server, a scheduled
   build touching the same paths.
7. **Does it reproduce clean?** Re-run the cell in a fresh environment. This is the
   decisive step and the reason the others are cheap: if it reproduces, the earlier answers
   narrow the cause; if it does not, the finding was environmental.

## Making it cheap

- **Disposable, per-run environments** so step 7 is minutes rather than an afternoon.
- **A recorded environment fingerprint per run** — harness version, isolation settings,
  ceilings, setup steps — so steps 2, 3 and 5 are lookups rather than reconstructions.
- **A shared fault-signature list** (see the sibling technique) so a triager recognises a
  known shape instead of re-deriving it.

## Decision rules

- **A cluster is environmental until proven otherwise.** Several configurations failing the
  same way in the same window is a coordination signal, and models do not coordinate.
- **Never publish a model finding whose cell has not been re-run clean.** One run is an
  anecdote; one run in a possibly-spoiled environment is not even that.
- **Stop at the first plausible cause only if it reproduces.** A convincing hypothesis that
  was never tested is how a fleet ends up with a second, wrong explanation on record beside
  the first — and the wrong one is usually the one that sounded more sophisticated.
