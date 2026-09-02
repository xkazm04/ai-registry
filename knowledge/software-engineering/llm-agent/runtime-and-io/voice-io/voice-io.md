---
layer: golden-path
type: golden-path
subject: voice-io
status: forged
techniques:
  - stt-pipeline
  - tts-pipeline
  - engine-abstraction
  - spoken-intent-parsing
  - voice-ux-integration
  - on-device-vs-cloud
  - duplex-agent-sessions
  - portable-provider-package
  - speech-ready-text
  - transcript-normalization
  - authored-voice-identity
  - decode-time-vocabulary-biasing
  - transcript-handoff-receipts
---

# Voice input and output

Voice I/O is the surface you build when the product **listens** — capturing
speech and turning it into text or commands — and when it **speaks** — turning
text into audible output. It looks like one feature ("add voice") and is in
fact **two independent pipelines pointed in opposite directions**, sharing
almost nothing but a settings page:

- **Capture → transcription** (input): microphone, level metering,
  endpointing, transcription engine, transcript disposition. Its currency is
  *trust* — the user must believe the system heard them, and the system must
  never believe the transcript more than the transcript deserves.
- **Text → synthesis → playback** (output): synthesis queue, voice identity,
  playback lifecycle, interruption. Its currency is *tempo* — time to first
  audio, and the immediacy of shutting up when told to.

The two pipelines have different latency physics, different privacy physics,
and different failure physics, and the ancestral mistake of this surface is
designing them as mirror images. They are not. Output speaks the product's own
text — content the product already holds, at a sensitivity the product already
knows. Input captures **the user's voice in the user's room** — the most
sensitive sensor the product will ever touch, carrying whatever was said near
it, including things never addressed to the product at all. Every asymmetric
decision in this subject (consent posture, residency default, confirmation
requirements) flows from that asymmetry.

Both pipelines exist as a channel **over** a product that must work without
them. That is a definitional constraint, not an aspiration: voice depends on
hardware that may be absent, permissions that may be denied, engines that may
not be installed, and environments (open offices, shared rooms, muted devices)
that forbid it situationally even when everything works. A product where any
core flow *requires* voice is broken by design for a large fraction of every
session.

## When not to build voice

- **Precision-dense input** — identifiers, code, exact quantities, anything
  where one wrong character matters — is faster and safer typed. Voice input
  earns its place on low-precision, high-intent utterances: commands,
  dictated prose, choices from a small set.
- **When the spoken channel would carry the only copy of information.** If a
  value exists solely as audio the product has failed deaf users, muted
  devices, and its own logs simultaneously. Everything spoken must exist as
  text; everything heard must become text before it becomes action.
- **When you cannot show that you are listening.** Capture without a
  continuously visible indicator is surveillance-shaped regardless of intent.
  If the interface has no room for a live capture indicator, it has no room
  for a microphone.

One boundary question sorts audio work that lands near this subject: are you
**plumbing** sound through a product, **producing** it to a creative brief,
**placing** it in a simulated space, or **judging a person** by it? This
subject owns only the first — channels, engines, consent, latency. Producing
music or sound design, spatializing audio in a world, and drawing conclusions
about a speaker are three different crafts with their own standards, and each
is disqualified by rules that are correct here (and vice versa).

## The engine layer is swappable, and the product outlives every engine

Both pipelines terminate in an **engine** — a transcription model or a
synthesis model, running locally or remotely. Engines are the most volatile
component in the whole subject: models are retired, services are deprecated,
a better local engine ships next quarter, a user's machine can run one engine
but not another. So the engine sits behind **one interface per direction**,
with per-engine adapters, declared capabilities, and a normalization path for
configuration that references engines that no longer exist. No surface code
ever names an engine; surfaces speak in "transcribe this capture" and "speak
this text as voice V". The [engine-abstraction](./techniques/engine-abstraction.md)
technique owns the interface, the capability probing, and the
retired-engine problem.

## On-device versus cloud is a privacy decision first

Where an engine runs is usually framed as a quality/latency tradeoff. For
voice input it is a **residency decision**: does raw audio of the user's room
leave the machine? The defensible default is on-device transcription, with
cloud transcription as an explicit, disclosed, revocable opt-in — while
synthesis, which speaks the product's own text, can take the opposite default
without contradiction. The decision framework, the degradation ladder, and
the boundary with model provisioning (the download/install mechanics belong
to the sidecar-provisioning subject) live in
[on-device-vs-cloud](./techniques/on-device-vs-cloud.md).

## Degradation is a designed state, never a blocked one

Voice has more legitimate "not available right now" states than almost any
other subject: no microphone, permission denied, engine not installed, model
still downloading, service unreachable, output muted, environment unsuitable.
Each is a **designed state with a designed next step** — never a dead control,
never a crash, and above all never a blocked product. The ladder is fixed:

1. full voice (the configured engines work);
2. partial voice (one direction works; the other degrades independently —
   the pipelines are independent here too);
3. no voice (everything the product does remains reachable through the
   visual/text surface, with voice affordances explaining their absence in
   one honest sentence each).

A tour that narrates must finish silently when synthesis is absent; a form
that accepts dictation must accept typing; a spoken command channel that is
down must leave every command clickable. This is the voice instance of the
degraded-state doctrine in [async-ui-states](../../../ui-surfaces/feedback-and-style/async-ui-states/async-ui-states.md),
and the per-affordance behavior is owned by
[voice-ux-integration](./techniques/voice-ux-integration.md).

## Spoken input is untrusted input with error bars

A transcript is not what the user said; it is an **engine's guess** about what
the user said, produced from noisy audio by a statistical process, arriving
without punctuation, with homophones resolved by luck, and with numbers spelled
unpredictably. The product therefore treats transcripts the way it treats any
low-confidence input:

- transcription output is **shown before it is trusted** — the user sees what
  was heard, and dictated text lands in an editable field, not directly in a
  committed record;
- transcript-to-action crossing is gated by the **cost of being wrong**:
  reversible actions may proceed on a confident match, destructive or
  expensive actions require an explicit confirmation that echoes the
  *interpretation* (not the raw transcript) back to the user;
- only **final** transcripts cross into action; partial transcripts are
  display-only, because they revise themselves — the non-monotone-increment
  problem [streaming output](../streaming-output/streaming-output.md) warns
  about, arriving here as a matter of course.

The [stt-pipeline](./techniques/stt-pipeline.md) technique owns capture through
transcript; [spoken-intent-parsing](./techniques/spoken-intent-parsing.md) owns
the transcript-to-typed-command crossing and its confirmation thresholds.

## The two lifecycles

**Capture → transcription.** The input pipeline is a lifecycle the user drives
and watches:

| State | Meaning | The surface shows |
| --- | --- | --- |
| **idle** | not listening | the affordance to start, or why it cannot start |
| **arming** | permission/device acquisition in flight | that the mic is being opened — not yet hearing |
| **listening** | audio flowing | a **live level meter** and an unmistakable capture indicator |
| **transcribing** | capture ended, engine working | the captured state is safe; work in progress |
| **transcribed** | final transcript ready | the text, editable, awaiting disposition |
| **failed** | any stage broke | which stage, and what to do — silence, no-speech, and engine failure are three different facts |

The meter in **listening** is not decoration; it is the only tool a user has
to debug their own audio. A flat meter during speech says "the microphone is
not hearing you" — a diagnosis no error message delivered after the fact can
match.

**Text → synthesis → playback.** The output pipeline is a queue of utterances,
each with its own lifecycle (queued → synthesizing → playing → done /
interrupted / failed), governed by two absolutes: **at most one voice audible
at a time** within a listening context, and **stop means now** — interruption
takes effect in perceptual time (audio halts, pending synthesis cancels), not
at the next sentence boundary. A stop control that finishes its thought
teaches the user that the control is fake. The
[tts-pipeline](./techniques/tts-pipeline.md) technique owns the queue, voice
identity, playback ownership, and interruption.

## Consent and indication are architecture, not copy

- Capture starts only from a **user gesture or an explicit standing opt-in**,
  never as a side effect of navigation.
- While the microphone is open, an indicator is **continuously visible** and
  the path to closing it is one action, always reachable.
- Playback begins from a gesture or a standing preference the user set; the
  platform may refuse un-gestured audio, and a refused playback surfaces a
  play affordance rather than passing as silent success.
- A **global voice mute** exists, persists, and outranks every local toggle.

## Accessibility posture

Voice features sit next to assistive technology; they must cooperate with it,
not compete:

- Synthesis is not a screen reader and must never be positioned as one; users
  running assistive audio get **one** audio narrator, and the product's
  narration yields (or is off by default) when assistive technology is
  driving.
- Everything narrated exists as visible text; everything dictated is
  reviewable as text. Voice adds a channel; it never becomes the only one.
- Capture and playback states are announced through the same non-audio
  channels as any other state: visible state, focusable controls, text
  labels — a deaf user must be able to operate the entire voice-output
  feature (start it for someone else, stop it, see that it is playing).

## Someone else can own the middle — on your terms

The two-pipelines framing assumes the product owns what happens between them.
A whole class of vendor now offers to own it too: one live session that
listens, decides what to say, and speaks, leaving the product to open the
session and read the transcript. Taken up carelessly this dissolves the
subject — the pipelines, the engine seam, the degradation ladder all become
someone else's implementation detail, and the product's conversational
behavior becomes a configuration object in an account you do not version.

Taken up deliberately it is often the right trade, because turn-taking,
barge-in and echo cancellation are each weeks of work. What makes it
deliberate is naming which half was handed over — speech transport, or the
conversation itself — and keeping on your side of the line the things that
make the handover reversible: the persona, the state after every exchange, the
transcript, and a runnable check that the remote configuration still matches
what the repository intends.
[duplex-agent-sessions](./techniques/duplex-agent-sessions.md) owns that
decision and its consequences.

## The engine layer travels as a package

The second product on the same machine that wants to speak should not
re-implement the adapters, and should not download a local model the first
product already installed. The engine layer becomes a package when it binds
to its host through one narrow seam (configuration lookup, a shared
per-user engine home, a log sink), keeps its own validation door and test
fake, and leaves authentication, throttling and the persistence of the
user's choice to the host route that wraps it. The preferred engine and the
allowed set are the host's data; resolving them against live probes, with a
fallback that stays visible at every boundary, is the package's job — and
a compare-by-ear surface over the allowed set is how a user decides,
rather than a benchmark deciding for them.
[portable-provider-package](./techniques/portable-provider-package.md) owns
the seam, the wrapper and the compare surface.

## A voice can be chosen, or it can be authored

The output pipeline's catalog assumes a voice is **picked**: the engine
publishes a set, the product stores a reference into it, and the hazard is
that reference going stale. Engines increasingly let a voice be **authored**
instead — built from a prose description, or cloned from a few seconds of real
speech — and that inverts the hazard rather than adding to it. There is no
engine-side identifier to retire; what is durable is the specification, and
what is volatile is the timbre, because nothing guarantees that re-synthesis
from the same description returns the same person. So an authored voice stores
its *inputs* as the system of record and treats any render as a cache, which
is the mirror image of how a selected voice is stored.

The same control also hides a consent boundary: a described voice is authored
from nothing, and a cloned voice is a real person's likeness that must arrive
with a provenance record. They are one field in a schema and two different
objects everywhere else.
[authored-voice-identity](./techniques/authored-voice-identity.md) owns the
three specification kinds, the storage rule, the consent line, and the
capability axis that says which kinds an adapter accepts.

## What the product holds is written for the eye

A chat reply is headings, bullets, emphasis, code, links and emoji — and an
engine voices exactly what it is handed: "asterisk asterisk", an address
read letter by letter, a stall on a code block. The queue and playback
discipline cannot repair text that was never speakable. One pure door turns
display text into speech-ready text before any engine sees it, and the
same door owns where a stream of it is cut into chunks — the boundary
rules (abbreviations, decimals, the ordinal dot of inflected languages,
open quotes), the sizes, and the first-chunk-may-be-a-clause exception
that wins time-to-first-audio.
[speech-ready-text](./techniques/speech-ready-text.md) owns it.

## What the user speaks is written for the ear

The mirror of that door is missing from most voice products, and it is the
one this subject was slowest to name. Display text is written for the eye and
must be prepared before it is spoken; a transcript is a record of *speech* and
must be prepared before it is **written down**. Fillers, false starts, a
self-correction arriving three words late, spoken numbers and addresses,
sentence boundaries that exist only as breath — the capture pipeline is right
to preserve all of it, and the destination is usually wrong to receive it.

The stage between transcript and destination is not the normalization the
parser already does. Those two point in opposite directions: the parser
normalizes **to discard**, producing a match key nobody reads, and is free to
be lossy; this stage normalizes **to keep**, and its output is the artifact
the user sends and later re-reads. A pipeline carrying only one of them has
not noticed it needs two.

The decision that governs the stage is what sits downstream. It pays where
the transcript is the artifact — a message, a note, a ticket, a document read
by a person. It **costs** where the transcript is an instruction to something
that reasons, because a small normalizer sees one utterance while the model
downstream holds the whole thread, and a rewrite in between is a lossy edit by
the less-informed party applied to input the better-informed party will never
see in the original. The stage is also optional by construction — every
consumer must already handle un-normalized text, which is what lets it be off,
absent, or out of language coverage without any consumer changing.
[transcript-normalization](./techniques/transcript-normalization.md) owns the
decision, the transform contract, the typed outcome, and the cut.

## The transcript leaves through a channel the product does not own

The last stage of the input pipeline is the one the stage table names and
nothing built: the transcript, disposed as *accepted*, has to arrive
somewhere — and in a dictation product that somewhere is whichever
application holds the cursor, reached through a channel the product neither
owns nor observes: synthesized keystrokes, or the system clipboard plus a
paste chord. The clipboard route is fast and layout-proof and it clobbers
the one thing the user was holding, so it has to restore what it displaced —
and *when* to restore is a race, because the paste chord is only enqueued and
the target reads whenever its event loop gets there. A fixed delay loses that
race some fraction of the time, and the failure is the user's old clipboard
pasted into their document. The correction is to wait for the operating
system's own evidence that a consumer read the channel, count only the reads
that came after the product's own chord, restore only while the product
still owns the channel, and bound the wait with a timeout whose failure mode
is "the transcript lingers", never "stale content lands".
[transcript-handoff-receipts](./techniques/transcript-handoff-receipts.md)
owns the route decision, the receipt rules, and the restore's obligations.

## The techniques

- [stt-pipeline](./techniques/stt-pipeline.md) — capture, metering, endpointing,
  chunking, latency budgets, partial vs final transcripts, the three kinds of
  "nothing came back".
- [tts-pipeline](./techniques/tts-pipeline.md) — the utterance queue, voice
  catalogs and speaker identity, playback lifecycle, barge-in, synthesis
  caching.
- [engine-abstraction](./techniques/engine-abstraction.md) — one interface per
  direction, adapters, capability probing, retired-engine normalization.
- [spoken-intent-parsing](./techniques/spoken-intent-parsing.md) — transcript to
  typed command: constrained grammars, normalization, confidence-vs-cost
  gating, confirmation affordances.
- [voice-ux-integration](./techniques/voice-ux-integration.md) — read-aloud
  affordances, narration that never blocks what it narrates, the speech
  arbiter, mute and consent surfaces.
- [on-device-vs-cloud](./techniques/on-device-vs-cloud.md) — residency as a
  privacy decision, the decision matrix, the degradation ladder, the
  provisioning boundary.
- [duplex-agent-sessions](./techniques/duplex-agent-sessions.md) — when a vendor
  runs the whole conversation: the transport-or-brain decision, the
  account-vs-session configuration split, drift-checking remote configuration,
  the audience-safe brief, transport reachability, and the verdict at hang-up.
- [portable-provider-package](./techniques/portable-provider-package.md) — the
  engine layer as a reusable package: the host seam, one dispatch and one
  validation door, host-owned preference and package-owned resolution, the
  route wrapper, compare-by-ear, and a shared per-user engine home.
- [speech-ready-text](./techniques/speech-ready-text.md) — display text to
  speakable text: the markup door, what not to expand, prosody that travels
  (punctuation), chunk boundary rules and sizes, chunks as one utterance with
  one verdict.
- [authored-voice-identity](./techniques/authored-voice-identity.md) — the three
  specification kinds (selected, described, cloned), why an authored voice
  stores its inputs rather than a reference, the consent line between a clone
  and a description, and the capability axis that says which kinds an adapter
  accepts.
- [transcript-normalization](./techniques/transcript-normalization.md) — heard
  text to written text: reader-versus-reasoner destinations, the transform
  contract and its input-derived output ceiling, the destination as a typed
  parameter, why per-segment cleanup cannot resolve self-corrections, and the
  five-arm outcome where empty-by-design is a success.
- [decode-time-vocabulary-biasing](./techniques/decode-time-vocabulary-biasing.md)
  — handing the known vocabulary to the engine before it decodes: score-boost
  versus prompt biasing and their opposite failure physics, the level gate
  that must run before a prompted decoder sees silence, the engine's
  no-speech verdict arriving as a token in the text channel, bias only where
  a confusion is measured, and turn-scoped bias from the parser's own source.
- [transcript-handoff-receipts](./techniques/transcript-handoff-receipts.md)
  — delivering the accepted transcript into a foreign application: typing
  versus pasting through the shared clipboard, why a timed restore is a race,
  restore on the consumer's read receipt (post-chord receipts only, ownership
  unchanged, a quiet period, a bounded wait with a benign failure mode), what
  the restore must preserve, and changing one variable when introducing it.
