---
layer: technique
type: technique
subject: harness-fault-attribution
technique: clear-the-environment-first
status: draft
laws: [the-harness-is-a-suspect-in-every-red, measure-the-tree-not-the-summary, a-ceiling-is-a-measurement-boundary]
shared_with: []
use_when: [triaging a failed or red run, before writing down a finding about a model, investigating a cluster of failures across configurations, a failure passed when rerun alone or on a quieter host, timeouts or cancellations on a heavily loaded host]
---

# Clear the environment first

The concern: attribution errors are asymmetric. Blaming the model is free, immediate and
socially uncontested; blaming the harness requires work. Left to instinct, a fleet's defect
list fills with model findings that are environment faults, and each one is quoted
afterwards as evidence. **Run the checklist before the attribution, every time, and make it
cheap enough that nobody skips it.**

## The checklist

1. **Did the run happen, and on what?** Refused, truncated, killed, or genuinely executed.
   A run that did not happen has nothing to attribute. A run that completed was still
   served by something: record the snapshot the provider reported, not the alias
   requested, and the stop reason. A degraded backend returns a success-shaped envelope.
2. **Was it isolated?** Shared build directories, caches, dependency trees, generated
   artefacts, links into a real working tree — anything a sibling run or a human could have
   written while this run read it.
3. **Was setup complete?** The environment step the repository declares, run in the order it
   declares, before the checks that need it.
4. **Was the clock honest?** Host suspension, throttling, a ceiling that fired on wake.
5. **Was the measurement the same?** Compare the harness version the run was scored under
   with the current one; a fact added later may be missing, and a fact refined later may be
   computed two ways across the corpus.
6. **Was anything else writing, or running?** Concurrent runs, an editor, a dev server, a
   scheduled build touching the same paths. Work that touches none of the run's paths can
   still fail it by contending for the host:
   - **Oversubscribed cores.** At a load far above the core count, timed ceilings fire on
     slow work, not big work: a test's budget, a socket's read timeout, a per-command
     deadline.
   - **A shared build lock.** A compile queued behind a sibling's build spends its budget
     waiting, and its wall time measures the queue.
   - **The run's own fan-out.** Test binaries side by side, threads per binary and parallel
     link jobs multiply. A whole-suite run can be its own contention: a test that fails
     inside the suite passes alone on the same host.
   - **Memory pressure.** A neighbour's memory-heavy job pushes the host into paging, and
     everything on it stalls at once, whatever the processor load reads. A kill for memory
     reads as a crash.

   Contention cannot be reconstructed afterwards, so it is recorded while the run is live.
7. **Does it reproduce clean?** This is the decisive step and the reason the others are
   cheap. A fresh rerun changes the environment and the model's sample at once, so split
   it ([re-gate-then-resample](./re-gate-then-resample.md)). Clean means nothing shared,
   not nothing running.
   - Re-gate the stored output in a clean environment first. A flip there is a fault in
     the scoring side.
   - Then resample, under the contention the original run had. A failure that does not
     reproduce on one such rerun is *intermittent*, not environmental. Agents fail some
     tasks some of the time on their own. A pass on a quieter host shows neither, because
     the load moved too (next section).
   - A failure that does reproduce narrows the cause through the earlier answers, but only
     if the rerun drew a fresh sample and did not replay a cached one.

## Contention, and what a rerun alone proves

A rerun alone is the cheapest experiment a triager has, and it answers one question well.
A failure that reproduces alone, on a quiet host, is not a contention failure, whatever
its message says. A failure that passes alone is not explained yet. The rerun lowered the
load and drew a new sample at once, so the pass fits either cause. The environment stays
the suspect until a rerun under matched load decides.

Matched load copies the original run's conditions, minus what it shared:

- **The same parallelism.** Test threads, build jobs, how many binaries run at once.
- **The same pressure.** Background load of the same size against the core count, and the
  same memory headroom.
- **Load that shares nothing.** Contention and shared state rise with the same knob, the
  number of runs live at once. A rerun among the original siblings cannot tell a starved
  run from one that read a sibling's output. Generate the load with work that touches none
  of the run's paths, locks or outputs, or give every sibling its own.
- **The same warmth.** A first run pays cold loads that a rerun skips: caches, a model
  loaded into memory, a fetched dependency tree. Start both from the same state.

One matched rerun shows whether the failure is intermittent under that load. Whether the
load drives it takes a rate on each side, because contention fails a run only some of the
time even at a fixed load:

- **Fails alone, every time.** Not contention. Go back up the checklist.
- **Fails under matched load at a clearly higher rate than alone.** Contention. The load,
  not the model or the change, is the variable that moved the verdict, so the failure is
  environmental for the attribution. Whether the tree under test should have survived that
  load is a separate question.
- **Fails at the same rate both ways.** Load is not the variable. The failure is
  intermittent at that rate.
- **No matched rerun yet.** The label is "load-confounded", with the recorded load beside
  it. It is neither intermittent nor environmental until the matched rerun runs.

A re-gate obeys the same split. A check that flips when re-gated on a quieter host has
shown that its own environment failed it, which is a scoring-side fault, but not yet
whether load or shared state did.

### How the contention verdict goes wrong

- **"It was load" becomes the new free attribution.** It sounds technical, costs nothing,
  and is hard to refute later, because the load was rarely recorded. It has been the wrong
  first hypothesis before: the real cause was a build output shared between runs, whose
  damage also rose with the number of runs live at once. A contention verdict owes the
  matched rerun as much as a model verdict owes the clean one.
- **The message names the wrong cause.** A cancellation under a deadline passes through
  layers that translate it into their own failure words, so it can arrive as a validation
  or integrity refusal. An error that names a resource limit can be a deterministic defect
  that fails alone in seconds. Classify by the reruns, not the text.
- **A load-only failure can also be the tree's own.** A flat deadline that does not grow
  with the work fails any real deployment under the same load. Where the tree must survive
  contention, record both, as the [subject](../harness-fault-attribution.md) does for any
  harness fault that is also a real finding: the attribution, and the tree's ceiling that
  measures the host rather than the work.
- **A fix for a load-class failure is verified under the load that produced it.** The
  failure already passed alone before the fix, so a pass alone after it proves nothing.

## Making it cheap

- **Disposable, per-run environments** so step 7 is minutes rather than an afternoon.
- **A recorded environment fingerprint per run** — harness revision stamped at the run's
  start, isolation settings, ceilings, setup steps, the model snapshot served — so steps
  1, 2, 3 and 5 are lookups rather than reconstructions. Without the harness revision,
  two runs with identical configuration headers can be two harnesses, and their
  disagreement reads as rerun noise.
- **Contention sampled during the run**: load against the core count, memory headroom and
  paging, the runs and builds live beside it, and the run's own parallelism. The running
  half of step 6 is a lookup only if this was written down while it was true. A result that
  depends on a clock is published with this beside it.
- **Stored outputs**, so the scoring side of step 7 is a re-gate that samples nothing.
- **A shared fault-signature list** (see the sibling technique) so a triager recognises a
  known shape instead of re-deriving it.

## Decision rules

- **A cluster in time is environmental until proven otherwise; a cluster on an item is
  not.** Several configurations failing the same way in the same window, across tasks, is
  a coordination signal, and models do not coordinate. Several configurations failing the
  same task is what models trained alike do anyway, and what a broken task does. Read
  that kind against a control whose answer is known, and re-run it in another window
  before reading it either way.
- **Never publish a model finding whose cell has not been re-run clean, and state it as a
  rate.** One run is an anecdote; one run in a possibly-spoiled environment is not even
  that. One clean rerun under the original contention shows whether a failure is
  intermittent, not how often it happens.
- **A pass alone is not a clearance.** A failure that passes when rerun alone or on a
  quieter host stays load-confounded, with the environment as its suspect, until a rerun
  under matched load decides. The rerun alone settles only the other direction: a failure
  that persists alone is not contention.
- **Stop at the first plausible cause only if it reproduces.** A convincing hypothesis that
  was never tested is how a fleet ends up with a second, wrong explanation on record beside
  the first — and the wrong one is usually the one that sounded more sophisticated.
