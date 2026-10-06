---
layer: golden-path
type: golden-path
subject: perf-regression-gating
status: forged
use_when: [gating a build on frame cost measured in a run, a performance check fails an unchanged build or passes a build players say stutters, a frame-cost regression is reported and nobody can say whether it is real, deciding what a performance verdict may claim when the run could not measure part of the frame]
techniques:
  - noise-floor-before-the-threshold
  - bracketed-capture-window
  - per-thread-budgets-not-one-frame-time
  - percentile-and-hitch-gate
  - baseline-bound-to-build-and-machine
---

# Performance regression gating

A build gets slower, and the claim to be tested is not that something behaves but that it
costs more than it did. That is a different kind of claim, because the evidence is a
duration or a count taken per frame in a run, and a duration taken in a run is a different
number every time it is taken. Everything else in a test stage can assume that measuring
twice gives the same answer; this one cannot. The subject is the pipeline that remains
sound anyway: **capture** a bounded window, **characterize** the noise of the quantity
measured, **compare** against something that can be named, and **promote** a new reference
only deliberately. Authoring-time budgets and package-size ceilings are decided elsewhere;
this is the stage that tests what a running build costs.

The naive reading is that a performance gate is a unit test whose assertion is a number:
run the base, run the head, compare, fail on a difference. Every part of that inherits a
property it does not have. It assumes the base and the head would reproduce themselves,
which nobody checked. It assumes the number is one number, when a frame has several
concurrent costs and the rate of frames hides which of them moved. It assumes the average
is what players feel, when they feel the rare long frame. And it assumes the reference
means the same thing next month on the machine that happens to run the job.

## The founding shape

The arc is familiar enough to be told by its stages. A team adds a frame-cost gate the way
everyone does: run the base build and the head build once each, take the mean frame time
of each, fail the change when the head is worse by more than a round percentage. For a
week it works, because the week's changes were large. Then it fails a commit that changed
nothing the player can see, the author re-runs it, it passes, and the re-run becomes a
habit. A retry that discards the first failure destroys the only record that the gate is
noisy. Someone widens the percentage until the red stops. The gate is now quiet and wrong
in the way that matters: it passes a change that doubled the cost of the worst frames,
because the mean did not move and the threshold is wider than any real regression it was
built to catch.

A quieter variant of the same arc exists in real trees. An analysis tool is handed
aggregates, not frames, rebuilds a per-frame series from them with a random spread so its
charts have something to draw, and then computes a high percentile and a hit rate over the
rebuilt series. Nothing in the output marks the series as reconstructed, so a gate
reading it has an instrument with no input and a verdict that looks like every other. The
two arcs are one failure: the number reached a decision without anyone having asked how
much of it was the measurement.

## Where this subject starts and stops

`runtime-observation-evidence` owns what evidence a behavioural claim requires: the
ladder, the tier declared before the act, the three outcomes, and the fixed-step rule that
makes a measured displacement mean the same thing twice. This subject borrows all of it
and adds only what changes when the quantity measured is itself different each time. Its
timestep technique ends by saying that real-time performance needs a different harness
with a different honesty discipline; this subject is that discipline. It also uses a
fixed step, for a narrower reason: to make the work in each frame identical across runs.
Identical work does not make identical time, and the distinction is the first thing a
cost gate has to state. The rule for picking is whether the claim is about what a thing
does, evidenced by state read before and after, or about what it costs, evidenced by a
duration or count per frame.

Two groups of budget subjects sit upstream. The authoring-time subjects decide what an
artifact may spend — a polygon count, a sampler allowance, a share of a frame — before it
is built, and the package-size subject holds a distributable against a ceiling and against
its own last build. Each compares a number that is the same every time it is computed.
This subject measures what a running build actually spent. It inherits the sentence form
those subjects settled on — the share consumed and the headroom left, written out so
neither can be read inverted — and it inherits the rule that a first build with nothing to
compare against is unmeasured, never green. The line is whether the number was decided
before the run from the artifact, which is upstream, or observed in the run's frames,
which is here. The allocation-discipline technique in the gameplay-patterns subject
already tells an author to state a per-step budget and to judge it by the tail rather than
the mean; this subject is how that sentence is checked in a pipeline, and it refines one
word of it: the worst observed step is a locator, not a gate, for the reason the
percentile technique gives.

The general testing-harness standard owns flakiness as a lifecycle, approval of recorded
output, and the isolation of lanes. The general metric-gate standard owns gating on a
recorded number — baseline provenance, ratchets, and the position that a clock compared
against a guessed threshold does not get to block, with a deterministic count of work as
the substitute where the work is compute-bound. This subject agrees with that verdict and
begins where the substitute ends: where the clock is itself the standard, because the
frame is bound by graphics or memory work that a count of operations does not see. There
the choice is not clock against proxy but guessed threshold against measured one. The
question in that neighbour is whether the proxy is valid; the question here is whether the
effect is larger than the noise. A threshold derived from a measured spread may block at
the resolution it states, and below that resolution the honest verdict is unverifiable.

Two rules in this bundle are borrowed rather than restated. A parity gate's choice of
summary statistic — a high percentile in the score, the maximum only as a locator — is the
same instinct applied to samples that are positions on one artifact; here the samples are
draws from a noisy process, so the percentile is itself an estimate with a sampling error
that has to be measured. And the control arm that establishes the noise floor of a judged
score is the same move applied to a judge; here the unchanged control is a rerun of the
same build on the same machine class, and what varies is the machine.

## One pipeline, four stages

**Capture** is the question of what part of the run is measured. A window is bounded by
the scenario's own phase markers, preceded by a quiet phase, with warm-up excluded by
construction; it is the smallest window that contains the symptom; and the scenario, not
the party under test, decides when it opens and closes
([bracketed-capture-window](./techniques/bracketed-capture-window.md)).

**Characterize** is the stage most pipelines skip. Before any threshold exists, the
unchanged build is run against itself, whole run by whole run, and the spread of the
statistic the gate will compare is taken. The threshold is derived from that spread; a
result whose spread is larger than the effect it must detect is unverifiable, not pass
([noise-floor-before-the-threshold](./techniques/noise-floor-before-the-threshold.md)).

**Compare** has two halves. What is compared is per concurrent stage of the frame, not one
number, so that a regression in a stage with headroom is a regression and a stage the run
cannot measure is reported as unmeasured
([per-thread-budgets-not-one-frame-time](./techniques/per-thread-budgets-not-one-frame-time.md)).
And the statistic is the one players feel — a high percentile, a count of hitches, a count
of missed frames — reported with the distribution beside the verdict
([percentile-and-hitch-gate](./techniques/percentile-and-hitch-gate.md)).

**Promote** is the question of what the reference is and who may change it. A baseline of
a noisy quantity is a recorded sample bound to the build, configuration, scenario, run
mode, instrumentation and hardware class that produced it, and a new one is promoted by an
explicit approval, never by a pipeline step that records whatever it just measured
([baseline-bound-to-build-and-machine](./techniques/baseline-bound-to-build-and-machine.md)).

## What a performance verdict may say

The three outcomes of the observation neighbour apply unchanged, and this subject does not
restate them. What it adds is the vocabulary of reasons, because "unverifiable" alone is
nearly as useless as "fail". A performance verdict names which of five things produced a
non-answer: the **resolution** (the lane's spread exceeds the effect to detect), the
**sample** (too few frames in the tail for the percentile asked), the **window** (it never
opened or never closed, so the capture is empty), the **basis** (the reference was taken
under a different build configuration, run mode or hardware class, or cannot be
attributed), and the **mode** (the run cannot observe a stage the budget names). Each goes
to a different owner, and an owner who reads all five as "the gate is flaky" never fixes
any of them. A stage that could not be measured is reported as not measured beside the
stages that were, and a roll-up that counts passes counts it as not evaluated
([unmeasured-is-not-a-pass](../../_laws.md#unmeasured-is-not-a-pass)).

## Frame cost is not the presented interval

The interval between presented frames is a convenient number and the wrong one to gate. A
frame cap or a display-synchronised presentation floors the interval: every frame whose
cost is under the cap presents at the cap, so a regression that consumes headroom changes
nothing the interval reports until the headroom is gone, and by then the changes that spent
it are several builds back. The quantity to measure is the busy time of each stage of the
frame, and the run mode that measures it is uncapped.

A fixed simulation step makes the work in each frame reproducible: the same amount of
simulated time advances, so the same code paths run. It does not make the time that work
takes reproducible, because that depends on the machine's load, its thermal state and what
else is scheduled. So the step is part of the basis of every cost number and never a claim
of stability. It also hides things that only a paced, real-time run exhibits — how a long
frame feeds back into a variable step, how presentation interacts with the display, what a
sustained load does to a clock that throttles. Those are separate lanes with their own
baselines, and a result from one is never offered as a result from the other.

## A baseline is a verdict bound to what it judged

A reference measurement judged one build, in one configuration, on one scenario, with one
instrument attached, on one class of machine. Move any of those and it is evidence about
a different thing ([a-verdict-is-bound-to-its-content](../../_laws.md#a-verdict-is-bound-to-its-content)).
The size baseline in the shipping-gates subject already refuses to compare across
platforms and configurations; for frame cost the machine is on the list too, because the
same build is a different number on a different processor, a different graphics driver, a
different power policy. A comparison across a different hardware class is not a weak
comparison; it is not a comparison, and the report says which basis field differed.

The better design, where the lane can afford it, avoids the stored reference for the
comparison altogether: run the base again in the same job, interleaved with the head, so
that the slow drift of the machine lands on both. A stored baseline then serves only the
absolute budget, which is a policy and needs no machine at all to state.

## Failure modes of the naive reading

- **The bare difference.** Head minus base, compared with a round number nobody derived.
  It fires on noise and is then widened until it fires on nothing.
- **The retry that selects.** A failed run repeated until it passes. Every rerun is a
  replicate to add to the sample; the verdict is recomputed over all of them, never over
  the best.
- **The mean as the headline.** The average moves when the whole distribution shifts and
  stays put when a few frames get much worse, which is the regression players report.
- **The one number.** A late frame with no stage attribution, so a regression in a stage
  with headroom is invisible until that stage becomes the binding one.
- **The unmeasured stage that reads as within budget.** A run with no renderer reports the
  graphics stage as zero or as a default, and the roll-up is green.
- **The window that is nothing but warm-up, or nothing but average.** A capture that opens
  before the first frames settle measures first-use cost; one that spans the whole session
  dilutes a symptom that lasts a second into a mean that does not move.
- **The window the changed code chose.** The party being judged starts and stops the
  capture, so the window can be, and eventually is, drawn around the regression.
- **The reference from another machine.** A baseline recorded on last month's hardware
  compared against today's, with the difference reported as the build's.
- **The silent re-record.** A pipeline step that overwrites the reference with whatever it
  just measured converts the gate into a recorder.

## Where this subject ends

Memory and load time are not owned here. Peak resident memory is typically far steadier
run to run than time is, for fixed content, and its noise has a different structure; load
time is dominated by what is already cached, so cold and warm are different quantities with
different baselines. Each needs its own statement of what the basis contains. The rules
here transfer by substitution — characterize the spread, bound the window, bind the
baseline — but the decision rules for a cache state or a resident set are not these.

Endurance and soak — a slow leak, a clock that throttles after minutes, a cost that
drifts upward over a long session — are the measurement of a trend over a long window,
which this subject's tight-window rule excludes by design. The perceptual side of pacing
belongs with the observation neighbour's perceptual rung. Crashes and the attribution of
a fault to a build are another subject's. And the diagnosis of why a frame is expensive,
the profile a person reads to find the hot system, is the investigation that follows a
verdict and does not replace one: this subject decides whether cost rose, and stops where
the question becomes which function made it rise.
