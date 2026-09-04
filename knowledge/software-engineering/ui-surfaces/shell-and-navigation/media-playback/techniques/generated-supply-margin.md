---
layer: technique
type: technique
subject: media-playback
technique: generated-supply-margin
status: forged
laws: [limits-are-derived, count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [content is produced just ahead of the playhead rather than read from a store, deciding whether a continuous stream can be sustained at all, sizing the buffer for a producer that is nearly as slow as playback, a capacity gate certifies a mean rate against real time]
---

# Generated supply margin

Every other technique in this subject assumes the content already exists —
fetched, decoded, scheduled. This one covers the case where it does **not**:
the timeline is fed by a producer working just ahead of the playhead, and
each unit of content costs real time to make. Live-composed generated video,
synthesized speech played as it is produced, a rendered feed assembled on
demand — the pattern is the same, and its physics are the inverse of the
buffering discipline most engineers bring to it.

The inversion is worth stating flatly, because the wrong instinct is the
common one. The familiar live-stream buffer sits between a producer that
emits at machine speed and a consumer that renders at human speed; there,
the producer being faster **is** the operating condition, the failure is
overflow, and the answers are eviction, shedding and backpressure. Here the
consumer is a clock. It advances at wall-clock rate whether or not anything
is ready, it cannot be slowed, and it cannot be asked to wait. The failure
is **underflow**, eviction is nonsense (every unit is needed, in order),
and there is no backpressure in either direction — you cannot slow a clock
and you cannot hurry a model. A design that reaches for head-eviction here
has misread which side is scarce.

## The margin, not the ratio, is the quantity

Let `g` be the wall-clock time to produce one unit of content and `d` that
unit's playing duration. The **supply ratio** is `ρ = g / d`. If `ρ ≥ 1` the
stream does not exist at any buffer size, because the deficit compounds
forever. That much is obvious and it is where most reasoning about these
systems stops — *production takes thirteen seconds, the clip runs fifteen,
therefore it runs forever.*

It does not, and the reason is that `ρ < 1` is necessary and nowhere near
sufficient. What the system actually has to spend is the **margin**,
`1 − ρ`, and the margin is small exactly when the ratio looks comfortable.
Three quantities follow from it, and each one surprises people who only
checked the ratio:

- **Buffer accumulates at `(1 − ρ) / ρ` seconds of content per second of
  wall clock.** Reaching a target depth `D` therefore takes
  `D · ρ / (1 − ρ)` of wall clock. At `ρ = 0.87`, sixty seconds of buffer
  takes **six and a half minutes** to build. At `ρ = 0.95` it takes
  nineteen minutes; at `ρ = 0.99`, an hour and a half. Buffer in this regime
  is not configured, it is *earned*, and the price rises hyperbolically as
  the ratio approaches one.
- **A deficit is repaid at the same rate.** One unit that overruns by `x`
  seconds costs `x · ρ / (1 − ρ)` of wall clock to make back. At `ρ = 0.87`
  a single thirteen-second overrun costs **eighty-five seconds** of
  recovery. This is why these systems fail long after they appear stable:
  the first excursion is survived out of accumulated buffer, and the buffer
  never comes back before the second one arrives.
- **Startup is not free and is not hidden.** The stream cannot begin until
  the opening buffer exists, so time-to-first-frame is a design output of
  the same formula, not a loading spinner to be tuned away.

## Certify the excursion, never the mean

The gate that decides whether a configuration can sustain a stream is the
single most common place this goes wrong, and the mistake is always the
same shape: **the mean rate is compared against real time.** A check that
reads `mean(ρ) < 1` passes precisely the configuration that has no margin
at all, and it does so while the run's own jitter is sitting in the next
column of the same results table.

The mean is the wrong statistic because underflow is not caused by average
slowness — it is caused by **runs of slow units**, and a mean is defined by
averaging those away. What the buffer has to absorb is the worst cumulative
deficit the system intends to survive, which makes the depth a derived
limit and not a chosen one ([limits-are-derived](../../../../_laws.md#limits-are-derived)):

> `depth ≥ k · (g_high − d)`, where `g_high` is the production time at the
> percentile being promised and `k` is the number of consecutive excursions
> tolerated — plus the recovery term above, because a buffer spent is not a
> buffer held.

Both inputs are measured, not guessed, and both are usually already being
collected: a harness that records a mean rate almost always records its own
`p50`/`p95` beside it. The percentile and `k` are product decisions; that
the derivation is computed from measurements rather than written once in a
comment is not. And when the rate travels — into a certification verdict, a
capacity claim, a dashboard — it carries the predicate that produced it
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
a bare "1.4× real time" is not a finding, because it does not say whether
that is a mean over a warm window, a worst case, or a number from a run
whose cache was serving half the requests.

The tell that a gate has this defect is mechanical and takes one minute to
check: **does the pass condition read any dispersion measure at all?** If
the results row carries a `p95` and the threshold only compares a mean, the
gate is observing a proxy for the property it exists to protect
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## Quality is the ratio's only cheap lever

`ρ` moves in exactly two ways, and they are not comparable.

- **More capacity.** Usually superlinear in cost and sublinear in effect —
  the step from one rung of output fidelity to the next routinely multiplies
  the hardware required several times over for a single step of quality,
  and parallel capacity buys throughput without buying single-unit latency,
  which is the term `ρ` is actually made of.
- **Less work per unit of content.** Output size, model tier, sampling
  steps, post-processing. This moves `ρ` directly and immediately, and it
  is the lever that decides whether the stream is feasible *at all* rather
  than merely affordable.

So the deliberate posture is the opposite of an offline pipeline's. Where
content is produced ahead of time and reviewed, fidelity is chosen by what
each stage's output is *for*, and spend rises as certainty rises; a draft
is cheap because it will be discarded. Here there are no stages and nothing
is discarded — the delivered artifact is the only artifact, and its fidelity
is pinned by the **deadline** rather than by its purpose. A team arriving
from the offline discipline will try to ladder quality and find there is no
rung to promote to. (The offline ladder is real and belongs to the craft
domains that own generation economics; the discriminating question is
whether a unit of output can be reviewed before it is delivered. If it
cannot, fidelity is a latency parameter.)

This also makes **adaptive degradation** the natural failure response, and
it should be designed in rather than discovered: a pipeline that can drop a
fidelity rung under pressure converts an underrun into a quality dip, which
is very nearly always the better trade. A dip is noticed by some viewers;
a gap is noticed by all of them.

## Underflow is a defect and must be spelled as one

This subject already holds the rule that a scheduled hole in composed
content plays as intended blankness with the transport still *playing*,
because time is advancing by design and claiming *buffering* would be a lie
(see [timeline-scheduling](./timeline-scheduling.md)). Generated supply
inverts that case exactly, and the inversion is the point: an underrun is
**not** authored content. Nothing is scheduled there, the timing contract
was not honoured, and the transport must say so rather than presenting the
hole as composition. Whichever continuity behaviour is chosen — hold the
last frame, repeat a filler unit, degrade and continue — it is a declared
policy with a stated appearance, and the underrun is counted. A system that
silently loops filler when it falls behind will report perfect uptime while
showing the same eight seconds forever.

## There is no idle state, so plan for the trough

The last consequence is economic and it inverts ordinary capacity
intuition. The producer must run continuously at `ρ` of real time to hold
the buffer, whether or not anyone is watching and whether or not anyone is
interacting. There is no zero-demand mode: **the cost floor equals the
streaming cost.** Autonomously generated filler is not a degenerate case to
be optimized away later, it is the steady state, and it is what the
resource is paid for most of the time.

Request-response capacity planning sizes for the peak and lets the trough
be cheap. A continuously generated surface has no cheap trough, so it is
sized for the trough — which costs what the peak costs — and the only
questions worth asking are whether the surface can be *stopped* when nobody
is present, and whether the fidelity that sets `ρ` can be lowered when
nobody is interacting. Both are product decisions that must be made
explicitly, because the default is to pay peak rate continuously.

## Decision rules

- Measure `ρ` and its dispersion before designing anything else; they are
  the two inputs every other decision here consumes.
- Derive buffer depth from the tolerated excursion and write the derivation
  beside the number. A depth chosen by feel is raised by feel.
- Never certify sustainability on a mean. If the pass condition cannot see
  the jitter the run already measured, it is not a sustainability gate.
- State time-to-first-frame as a computed consequence of the target depth,
  not as an implementation detail.
- Prefer lowering fidelity over adding capacity to reach `ρ < 1`, and build
  the fidelity control as a runtime lever rather than a deployment
  constant.
- Count underruns, name the continuity policy, and never let filler stand
  in for content without saying so.

## When this does not apply

Content read from a store — a file, an object, a catalogue — is bounded by
transfer and decode, both of which are fast relative to playback and both
of which can be prefetched arbitrarily far ahead. That is
[timeline-scheduling](./timeline-scheduling.md)'s lookahead window, where
"too large" is a resource-residency cost rather than a physical
impossibility, and it is the right technique whenever the composition is
authored in advance. The moment the tail of the timeline does not exist
yet and costs real time to bring into existence, the window stops being a
tuning parameter and becomes the subject of this technique.
