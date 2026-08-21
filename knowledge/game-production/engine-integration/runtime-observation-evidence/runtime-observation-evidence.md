---
layer: golden-path
type: golden-path
subject: runtime-observation-evidence
status: forged
use_when: [deciding what evidence a behaviour claim requires, building a harness that drives a live runtime, a check passed but the thing does not work, designing verdicts for an automated observer]
techniques:
  - tiers-of-truth
  - behavioural-discriminators-over-symbolic-pass
  - deterministic-headless-timestep
  - observation-spine-contract
  - bounded-evidence-with-provenance
  - unverifiable-is-not-fail
---

# Runtime observation evidence

Someone — a person, a build loop, an autonomous agent — claims a behaviour works. The
claim is worth exactly the evidence attached to it, and the whole of this subject is
the question of what evidence a *behavioural* claim actually requires, plus the
engineering of the observable that produces it.

The naive reading is that this is a testing problem answered by writing more tests. It is
not; it is an epistemics problem wearing a testing costume. A suite answers *did my
assertions hold*; the question here is *were my assertions capable of seeing the defect at
all*. Those come apart badly wherever the artifact under judgement moves, renders, or
evolves over time — a simulated character, a manipulator's trajectory, a physics-driven
vehicle, a rendered frame. There, the most dangerous state is not a failing check but a
complete, green, well-designed suite of checks every one of which is structurally incapable
of noticing the defect that shipped.

## The founding incident

A character was authored to move. Every check passed: the asset existed, its skeleton
was valid, its animation graph compiled, its input bindings resolved, its movement
component was present and configured, the whole thing loaded into a running world
without error. The character stood in its reference pose — arms out, motionless — for
the entire session.

Nothing in that list was wrong; each check was correct and necessary. The failure was a
**category error about what the checks could prove**. Existence, structure and wiring are
statements about the artifact at rest; motion is a statement about the artifact in time.
No accumulation of the first kind ever becomes the second, and no additional rigour at the
structural level would have caught it — motion is simply not information a structural
observer holds. Every rule below exists to operationalise that.

## The ladder is the primary artifact

Order the evidence a claim can rest on into rungs, where each rung is defined by **the
kind of observation that produces it**, not by how expensive it is or how hard it was to
build. Five rungs recur across every runtime-observation domain worth the name:

- **Existence.** The thing is there and can be found by an independent lookup. The
  mechanism is a query against the loaded world or the content graph. The blindness:
  everything about whether it is correct.
- **Structural validity.** Its declared shape holds — required parts present, types
  right, references resolving, values inside their stated bands. The mechanism is a
  reader that did not author it, walking its data. The blindness: whether anything ever
  reaches it.
- **Wiring.** It is granted, registered, bound, reachable — connected to the systems
  that are supposed to invoke it. The mechanism is a reachability walk from a real entry
  point. The blindness: whether invocation changes anything.
- **Behavioural state.** It was made to run, and an observer independent of the thing
  that ran it read measured state before and after. The mechanism is a stimulus plus
  sampled state over time. The blindness: what it looks like.
- **Perceptual report.** A seeing observer looked at a rendered frame or sequence and
  reported what it saw. The mechanism is a capture plus a judgement bound to it. The
  blindness: everything happening outside the frame, and everything the observer was not
  asked about.

The ordering is by containment, not cost, because tooling shifts costs constantly — a
perceptual check that cost a human an hour becomes a ninety-second automated critic within
a year — and a cost-ordered ladder reshuffles into nonsense when it does. Containment is
stable: whatever is visible at a lower rung remains visible at a higher one, plus more.

The upper rungs feed the upper rungs of a *content* acceptance ladder — a separate subject
that governs what "accepted" means for produced content and delegates its runtime and
perceptual rungs to a harness built this way. Do not merge them: one grades content, the
other produces observations.

## A required tier, declared before the act

The single most valuable structural change you can make to a harness is to make the
**required tier part of the request, not a property of the runner**. Whoever asks for a
behaviour to be verified states the rung at which they will accept the answer. The
harness then owes an observation at that rung or a stated inability to produce one; it
may never satisfy a request at a lower rung and report success.

This kills, in one move, the most common way a verification layer rots: a runner that once
observed behaviour gets a fast path added, the fast path only checks structure, and a year
later everything is green and nothing is observed. When the tier is in the request, that
degradation is a named contract violation rather than an optimisation nobody noticed.

The observation loop that follows from this is fixed and short: **ground** the run in a
known world state, **snapshot** the measurable quantities you care about before acting,
**act** once with a single named stimulus, **observe** at the required tier, and **judge**
by comparing the post-state to the snapshot. Grounding and snapshotting are not
ceremony — without them a measured delta is not attributable to the act, and an
unattributable delta is not evidence.

## Assert on discriminators, not on pass flags

A behavioural rung is only as good as the quantity it measures. The failure mode here is
**symbolic pass**: the harness asks the system under test whether it succeeded, the system
says yes, and that yes is recorded as behavioural evidence. It is not. It is a
self-report, and `no-gate-self-certifies` forbids treating it as a verdict. A generator
saying its output is valid, a routine returning a success code, a log line reading
`OK` — all are inputs, all must be labelled as claims, and none of them is an observation.

What replaces it is a **discriminator**: a continuous measured quantity that separates the
two states a boolean cannot. The motionless-character case is the canonical illustration.
No boolean the system offers distinguishes "playing an animation" from "displaying a
static pose" — both report an animation as active. But the *variance across samples* of a
continuously-varying pose quantity does distinguish them, sharply and repeatably: an
animating figure's limb angles wander, a reference-posed one's do not move at all. One
sampled number, taken several times, sees what an entire structural suite could not.

Discriminators are earned by calibration, not by intuition. You run the known-good case
and the known-bad case, look at the distributions, and site the threshold where they
separate. A threshold nobody calibrated is a guess wearing a number's clothes, and it
will be quoted with a confidence it has not earned. Record the calibration alongside the
threshold — a number handed across a boundary without its basis is not information.

## Determinism is what makes a measurement mean anything

A measured quantity taken from a run whose timing is not controlled is not a measurement;
it is a sample from an unnamed distribution. Peak speed over a variable-rate loop is mostly
a report about machine load, and a displacement threshold calibrated on a fast machine
fails on a slow one until everybody learns to distrust the harness — the worst outcome
available, because a distrusted gate is removed and its removal is invisible.

So the harness fixes the timestep: run the world at a declared fixed rate, decoupled from
wall clock and render pacing, and state that rate next to every quantity derived from it.
Then split the run modes deliberately. A run with the renderer disabled is cheap, fast and
headless-safe, and serves every rung up to behavioural state; a run with an offscreen
renderer costs more, needs a properly lit scene, and is the only thing that can serve the
perceptual rung. Choose the mode from the required tier, and never let a cheap mode
silently answer an expensive question.

Timing is only half of it — a run deterministic in its clock but noisy in its content is
equally unmeasurable. **Settle before you snapshot**: give the world a stated interval to
reach rest after loading and before the pre-act reading, or the baseline is a transient.
And **isolate the confounders you know about**: measuring locomotion, remove the autonomous
agents that would stagger the subject; deciding whether a defect lives in the skeleton or
in the logic above it, drive a single motion directly rather than through the graph. Each
isolation is a named switch on the scenario description, off by default, so a reader of a
result can see which confounders were excluded when it was produced.

The corollary about process outcomes: **judge by markers, not by exit status**. A
long-running host process may exit non-zero for reasons that have nothing to do with the
observation — a teardown fault after all work completed is the classic one — and it may
exit zero having done nothing. The verdict comes from structured markers the run emitted
about what it observed. Where you have a choice between a facility that reports through
an exit code and one that reports through parseable output, prefer the second even if it
is slower; a status code carries one bit and the failure it names is usually not the one
you care about.

## Three outcomes, not two

The subtlest rule in the subject: **an observation that could not be made is not a
failure**. Pass, fail, and *unverifiable* are three distinct epistemic states, and folding
the third into the second poisons every statistic computed downstream.

Consider a perceptual check where no capture could be obtained — no display environment, no
renderer, the capture step itself errored. The harness has learned *nothing* about the
artifact, and recording that as a failure asserts something false in a form indistinguishable
from a real defect. Six weeks later someone reads "12% perceptual failure rate" when the
truth was "2% failures and 10% we never looked" — opposite responses, one a content bug
queue, the other an infrastructure repair.

The third outcome is really two, and they must be reported apart. **Deferred** is "ran and
could not decide" — judging observer unreachable, result identity ambiguous, capture empty.
**Skipped** is "never attempted" — no runtime, prerequisite absent, out of scope. Both are
honest, neither is a fail, and one shared bucket makes a broken judge indistinguishable from
an unbuilt harness. Each gets its own count and a reason naming the specific missing thing.

The reverse asymmetry is deliberate and must be preserved: once evidence exists, an
infrastructure problem downstream of it may never downgrade it. If a frame was captured
and the judging observer is unavailable, the outcome is unverifiable — but if the captured
frame is measurably empty, that is a real, cheap, mechanical failure and it stands on its
own without any judge at all. Evidence that exists is stronger than the availability of
the thing that would have interpreted it. This is `unmeasured-is-not-a-pass` read in both
directions: an unmeasured thing is not a pass, and it is not a fail either — it is
unmeasured, and it says so.

## The evidence payload

An observation is only useful later if it survives with enough context to be re-read. Two
rules govern the payload. It is **bounded** — you retain a fixed-size, decision-relevant
extract, not the whole trace, because an unbounded evidence store is a store nobody
queries and a memory profile nobody predicted. And it is **provenance-bound** — every
payload names the run that produced it, the tier it was observed at, the timestep and
build it was observed under, and a fingerprint of the artifact as it stood. A verdict is
bound to the content it judged; when the content changes, the observation becomes evidence
about the past, and it must be able to say so rather than quietly presenting itself as
current.

## What belongs elsewhere

Two adjacent concerns are frequently confused with this one. **Driving a live runtime
without destroying somebody's session** — refusing rather than terminating, leasing a
non-reentrant resource, budgeting timeouts, classifying transport failures — is a separate
subject; observation depends on it but does not contain it. And **what an unattended builder
may certify about its own work** is a governance question downstream of the tier vocabulary
this subject provides: borrow the vocabulary, do not re-derive the ladder there.

## Failure modes to recognise

- **Tier inflation in reporting.** A structural observation is summarised as "verified"
  and read three layers up as behavioural. Every reported result carries its rung, in the
  same field, always.
- **The self-reporting observer.** The thing being observed also decides whether the
  observation passed. Split them; the observer reads state it did not write.
- **The uncalibrated threshold.** A number with no recorded known-good/known-bad basis.
  Treat it as unmeasured until it has one.
- **Silent mode downgrade.** A perceptual request served by a renderer-less run. The
  required tier must be checked against the run mode before the run, and refused if
  incompatible.
- **The one-shot behavioural sample.** A single post-act reading, compared to a hardcoded
  expectation rather than to a pre-act snapshot from the same run. It cannot separate "the
  act did something" from "the world started that way".
- **Failure-shaped infrastructure.** Environment gaps rendered as red. The dashboard is
  now measuring your harness, and reporting it as measurements of your game.
- **Ambiguous attribution.** The requested observation's identifier matches more than one
  registered result and the harness credits one of them. This is the only path by which a
  harness produces an actively *false* verdict rather than a missing one, and it is worth
  a dedicated check: a non-unique match is unverifiable, with the colliding identities
  named, never a pass and never a fail.
- **The substituted subject.** The requested observation target is unavailable, so the
  harness quietly falls back to a known-good one and judges that instead. The verdict is
  now about a different thing than the one asked about. Refuse and name the missing
  target; a fallback target is only legal when nothing specific was requested.
