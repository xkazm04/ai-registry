---
layer: technique
type: technique
subject: voice-io
technique: real-time-synthesis-budget
status: forged
laws: [gate-sees-target, count-carries-predicate, absent-guard-is-loud]
shared_with: []
use_when: [choosing a speech synthesis engine for live conversation, a vendor publishes a speed figure for a synthesis model, an engine clones or designs voices well but runs slower than real time, deciding whether a slow voice belongs in live replies or in pre-rendered content, a synthesis engine is started as a new process for every sentence, an acceleration option is enabled and the engine is still slow, deciding whether local synthesis should default to the graphics card or the processor, a voice capability works on the developer's machine and not on the machine most users have]
---

# Real-time synthesis budget

[engine-choice-on-decisive-terms](./engine-choice-on-decisive-terms.md) reads
the quality axis for recognition, and
[on-device-vs-cloud](./on-device-vs-cloud.md) decides where an engine runs.
Synthesis has a question that comes before either, and that no quality score
can answer: **does this engine keep up with the listener, on the machine that
will run it?** An engine that speaks beautifully and slower than real time is
not a worse live engine. It is not a live engine at all, and the product that
puts it in the reply loop has built a pause.

This technique owns the speed reading: which numbers to record, where to
measure them, and which use each engine is admitted to. The rule it defends
is short. **Admit an engine to the turn loop on a real-time factor and a
time-to-first-audio measured on the target tier; place everything else in the
content pipeline, or defer it.**

## Making a voice and speaking in it are two jobs

A voice product does two different kinds of synthesis work, and they have
opposite time physics:

- **Making** happens once, or off the turn: authoring a voice from a
  description, enrolling a reference sample, rendering a greeting in advance,
  producing narration for a video or an audio piece. It may take a minute. The
  listener is not waiting on it, or is waiting knowingly.
- **Speaking** happens every turn of a conversation, and it must keep up. A
  reply that arrives as text in a second and as audio in ten has taught the
  user to stop listening.

Engines split along exactly this line, so the design should too. An engine
that clones faithfully and runs slower than real time on the target tier
belongs in the **content pipeline** — pre-rendered clips, prepared greetings,
produced media — and not in the turn loop, however good its voice is. The
only thing the two jobs need to share is the voice's specification (the
reference sample and its record, owned by
[authored-voice-identity](./authored-voice-identity.md)), so that moving a
voice from one job to the other never means making it again.

## Two numbers, each with its kind

**Real-time factor** is seconds of compute per second of audio produced, taken
as the median over warm runs. Below 1, once audio starts the listener never
waits; above 1, the listener waits unless the whole text was rendered before
playback began. It is the number that decides whether an engine can serve a
turn at all.

**Time to first audio** is the interval from request to the first samples the
engine hands back, and it is meaningless without its **kind**:

- **streamed** — the engine returns a first chunk while it continues, so the
  figure stays roughly flat as the text grows;
- **whole** — the engine returns the finished sentence, so first audio equals
  total generation time and grows with every word.

Two engines with the same first-audio figure on a short greeting can be a
tenth of a second and forty seconds apart on a paragraph, and the kind is what
predicts it. Where an engine cannot stream, feed it one sentence at a time and
play the first while the second renders — which works only when its real-time
factor is below 1, so the second sentence is ready before the first finishes.

Record the rest of the row as well, because each is a different product state:
**cold load** (a fresh process building the model onto the device — a
provisioning or startup cost), **first call** (one-off kernel set-up after
loading, which a warm-up request can pay before the user speaks),
**enrolment** (turning a reference into the engine's voice prompt, paid once
per voice per process and cacheable), **peak memory on each device**, and the
**load on the machine** at the moment of the run. The admission rule then
reads the numbers that the turn actually pays:

> **Turn loop:** real-time factor comfortably below 1 on the target tier, and a
> first-audio time of the first chunk inside the turn's budget.
> **Content pipeline:** everything that clears the quality bar and not the
> speed bar.

"Comfortably" is load-bearing. The tier is shared with the rest of the product
— a language model, a user interface, whatever else the user is running — and
a factor measured on a quiet machine is the optimistic end of the range. Every
figure travels with the conditions it was taken under
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): the
device, the runtime, the thread count, the precision, the background load, and
the number of runs behind the median.

## Measure on the tier that will run it

A synthesis engine's rate is a property of the engine **and the device**, and
the spread across devices is not a constant factor. On the same processor, one
small engine runs several times faster than real time while a cloning engine
runs an order of magnitude slower than it; on a graphics card the first becomes
a rounding error and the second may only just keep up. There is no honest
sentence of the form "processor engines run at about half real time".

So the tiers are named and measured, not assumed:

- **the accelerator the owner has**, measured;
- **the same machine with the accelerator switched off**, which is a cheap,
  real measurement of the processor path and the nearest thing to the common
  case a single machine can give;
- **the machine most users have** — often a thin laptop with no dedicated card
  — which is an *estimate* until someone measures it, and is labelled as one.

A capability that clears the budget only on the first tier is a capability of
that tier. Shipping it as a product default is a decision about who the product
is for, and it should be made as one.

## A vendor's number describes the vendor's stack

A published speed figure is a measurement someone took on a serving stack: a
batched inference server, a compiled graph, a particular operating system and
accelerator, sometimes a streaming front-end the installable package does not
include. The product ships none of that by default. It ships the package it
can install, on the platforms its users run.

Re-measure through that package, on the target platform, before adopting.
Record the vendor's figure beside yours with the stack each came from, and
write "not reproduced" rather than explaining a large gap away. A divergence of
several times is not a tuning problem; it is a different stack, and a gate that
admits an engine on the vendor's figure is reading a proxy that diverges from
the target at exactly the moment the choice is made
([gate-sees-target](../../../../_laws.md#gate-sees-target)). One bake-off, on a
fast desktop, measured a small model advertised at three times faster than real
time on eight processor cores running at 1.7 times *slower* than real time, and
a sub-100-millisecond first-audio claim arriving as a ten-second wait because
the installable package did not stream; the numbers, their n and their
conditions are in the stack application.

Classify a candidate before measuring it. A release described as a "voice
agent" is often a realtime conversation runtime — a duplex front-end placed in
front of an agent — rather than a synthesis engine. It competes with the
product's conversation loop instead of serving it, and belongs to the decision
[duplex-agent-sessions](./duplex-agent-sessions.md) owns, not to this one.

## An acceleration path that falls back silently

The fastest configuration of a local engine usually depends on an optional
component: a graph compiler, fused attention kernels, a reduced precision, a
platform-specific build of one of them. When that component is missing on a
platform, libraries commonly print a warning and continue on the slow path.
The engine then works correctly and runs several times slower, and nothing in
its outcome says so. A switch that must be turned on, and whose absence
degrades quietly, is an absent guard
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

- **Record the path actually taken** — compiled or not, which kernels, which
  precision — as part of every measurement. A figure with the path unrecorded
  cannot be reproduced and cannot be compared.
- **Probe the path at startup and surface it as capability state.** "Ready,
  but on the slow path" is a distinct state from "ready", and the preference
  chain should know which one it is choosing.
- **When the fast path rests on a third-party port**, pin it, and keep the slow
  path as a declared fallback rather than an accident. The difference between
  an engine that keeps up and one that falls behind can rest entirely on a
  package its own vendor does not publish.
- **Account for one-time costs as provisioning, not as latency.** A compiler
  that spends minutes on the first load is an installation step with a progress
  state, not a first reply that takes four minutes.

## The process boundary is part of the rate

Measure the product's call shape, not only the engine's best case. An engine
started as a new process for each sentence pays process start-up and model load
on every utterance — commonly seconds — and that cost lands on the first-audio
figure of every reply. On short lines it is enough to push an engine that runs
several times faster than real time past real time. The remedy is a resident
engine — a long-lived process fed sentences, or an in-process binding that
loads once — which [portable-provider-package](./portable-provider-package.md)
describes as the resident mode behind its concurrency bound. The measurement
that justifies the change is the same engine timed both ways, on the same
machine.

## Keep one tier that needs nothing

The engine that ships with the product, runs on every machine, and clears the
budget on the processor path is the floor of the preference chain
([engine-abstraction](./engine-abstraction.md)). Heavier engines are layered
above it: they may need an accelerator, a large download, a compile step, a
separate runtime or a network. Any of those can be missing or still
installing, and every one of those states falls back to the floor tier —
never to silence. A heavy engine can audition while it proves itself on this
machine; it takes over live replies only once it has measured inside the
budget here.

## When the device changes speed and not voice, let the user time it

Some engines produce the same voice on every device and runtime they support,
and only the speed differs. For those, the choice of device is a speed
question, and the machine that answers it is the user's own. Hard-coding a
default from the developer's hardware encodes an assumption about the user's
hardware. Offer the variants side by side with a timed sample of one line on
this machine, let the user choose, and let the default follow a probe rather
than a guess.

Two conditions keep that honest. It holds for an engine whose output does not
depend on sampling; a sampling engine gives a different take on every run, so
two device runs differ the way two takes of an actor do, and the surface must
label them as takes rather than invite the user to hear a device effect that is
not there. And "the same voice on every device" is a listening claim, checked
by a listener across the variants before the toggle ships, not inferred from
the engine being the same.

## When nothing clears the budget on the common tier, defer

Sometimes no candidate for a capability keeps up on the machine most users
have. Cloning is the usual case. The signs that the frontier is still moving
are measurable: the best candidate needs a community port to reach real time,
the vendors' speed figures do not reproduce, the installable packages lag
their own source, and licences and consent terms differ from engine to engine.

The disciplined response is to **ship the stable kind on the live path, keep
the moving capability as a declared kind behind the engine contract, and
re-evaluate on a trigger** rather than to ship the frontier into the turn loop.
In practice: selected voices speak live; the authoring capability is a
declared specification kind
([authored-voice-identity](./authored-voice-identity.md)) that no adapter on
the live path claims yet; where a slow engine is already useful, it serves the
content pipeline, where its wait is acceptable; and the placement review
trigger in [on-device-vs-cloud](./on-device-vs-cloud.md) — a newly available
engine that would clear the budget — is what brings it back. Enabling it later
is then a new adapter behind an existing contract, not a redesign.

## When not to use this

- **A product that only pre-renders** — narration, produced media, prepared
  prompts — has no turn loop. Real-time factor there is a throughput and cost
  number, not a gate, and first-audio time is irrelevant.
- **A hosted engine.** Its compute rate is the provider's problem; its
  first-audio time over the network from the user's region is still yours, and
  its variance follows the connection rather than the device.
- **One engine, one device, no alternative.** The measurement still tells you
  whether to split sentences and when to warm up, but there is no placement
  decision to make with it.
