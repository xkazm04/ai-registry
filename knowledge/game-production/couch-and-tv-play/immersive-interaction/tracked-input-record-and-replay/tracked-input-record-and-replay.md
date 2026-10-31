---
layer: golden-path
type: golden-path
subject: tracked-input-record-and-replay
status: draft
use_when: [an input rule driven by tracked hands or controllers must be regression-tested without a device, real tracked sessions are recorded for later tests, synthetic or mouse-drawn input stands in for real hands before the device arrives]
techniques:
  - versioned-input-corpus
  - headless-replay-against-the-rules
  - proxy-corpus-miss-ledger
  - record-below-the-rule
---

# Tracked input record and replay

An input rule that reads a tracked hand, such as a timing window, a gesture recogniser or a
pinch threshold, is hard to regress. The device is not always on hand, a person cannot
repeat a motion exactly, and a rule tuned on one afternoon quietly breaks on the next
runtime update. The answer is to record real tracked sessions once, keep them as a corpus
that says what it is, and replay them headlessly against the game's rules, so a change to
the rules is judged on the same input every time. This subject owns that loop: the corpus,
the replay, and the honest handling of stand-in input used before real recordings exist.

## Status of this subject

This subject is a draft. Its techniques have been reconciled against one consumer's tree,
on synthetic clips only, and no application has yet set replay against a person. Its
evidence gate is owed: the regressions that replay catches,
set against the regressions that a person playing catches. There is no evidence for that
comparison yet, and nothing below should be read as having passed it. The gate is met by a
later application, never by this text.

## Boundaries, stated first because the one-copy rule binds here

Three neighbours own rules this subject uses and does not restate.

- **The evidence ladder** belongs to runtime observation evidence, through
  [tiers of truth](../../../engine-integration/runtime-observation-evidence/techniques/tiers-of-truth.md).
  A replay result is placed on that ladder. This subject mints no tiers of its own.
- **Replay determinism** belongs to the same subject, through
  [deterministic headless timestep](../../../engine-integration/runtime-observation-evidence/techniques/deterministic-headless-timestep.md).
  Whether a replay yields the same outcome twice is that technique's question. This subject
  asks only what is fed to it.
- **That an injected input is not a hand** belongs to the on-device verification harness,
  through
  [emulated touch is not physical touch](../../couch-and-tv/on-device-verification-harness/techniques/emulated-touch-is-not-physical-touch.md).
  Its rule covers any emulator or injection: the result is labelled as emulated, and a
  verdict about feel stays unmeasured until a person plays on a device.

The general test harness, meaning how a suite is organised, run and reported, belongs to the
test-harness subject of the software-engineering bundle. It is named here in prose only,
because it lives in another bundle.

**Emulator expressiveness: left out on purpose.** This subject carries no technique on
whether an emulator can produce the gesture under test. The one-copy rule applies, and the
emulated-touch technique already owns the general rule that injection is not a hand. The
narrow extra check, asking whether the emulator can even produce the gesture being tested,
is a decision rule that fits as an addition to that technique. A second copy here would
drift from it. Reports that use an emulator cite that technique and add nothing to it.

## What a principal practitioner holds true

**A recording is evidence only if it says what it is.** A clip with no record of the
tracking runtime, the sensor mode, the device class and the rules revision it was made
under cannot be compared with a later clip. A test that passes on a clip nobody can identify
proves nothing about any build. The corpus is versioned like code, and each clip
carries its provenance.

**A corpus made on an older runtime is a different corpus.** Tracking runtimes change
latency, confidence and smoothing. A clip recorded under one is not a sample of another.
The corpus keeps the runtime it was made under beside each clip, and a rule is judged on
clips from the runtime it will ship on, or the gap is stated.

**A recording sits at one layer, and replay is blind beneath it.** Raw sensor data re-runs
the tracker on playback, tracked poses bypass it, and decided values such as a contact
strength bypass the recogniser that decided them. A frame of joints often carries such a
decided value too, and a rule that reads it is regressed only on its use of the verdict. The
layer each rule reads says which changes a replay can catch, and which a runtime update leaves
unmeasured.

**Replay is headless and runs the real rules.** The replay feeds recorded samples into the
same rule code the game runs, with no rendering and no device. A replay that re-implements
the rule in a test double proves the double. When a replay diverges from the live session
it recorded, that divergence is a finding about the input path, not noise.

**A stand-in is a loan, not a result.** Before the device arrives, synthetic clips or
mouse-drawn strokes keep the work moving. Every figure they produce is a proxy figure, and
it is labelled so. The stand-in earns trust only by being compared with real recordings once
they exist, and a ledger of what it missed says how far to trust it.

**Replay does not replace a person.** It finds regressions in rules against known input. It
does not find what a person feels, or the input nobody recorded. How much it finds relative
to a person is the open question named above, and the answer is measured, not assumed.

## The load-bearing distinctions

- **Recorded versus synthetic input.** The first is a sample of real hands. The second is
  an author's idea of them.
- **A measured field versus a decided field.** Joints are samples of the hand. A contact
  strength or a gesture flag is the runtime's verdict about the hand, carried in the same
  frame.
- **Replay of the rules versus replay of the device.** Headless replay exercises the
  rules. It says nothing about the sensor.
- **A divergence versus a failure.** A failure is a rule that gives a wrong verdict. A
  divergence is a replay that disagrees with the session it came from.
- **A proxy that agrees versus a proxy that is validated.** Agreement on the clips tried is
  not coverage of the motions not tried.

## What the naive build gets wrong

- **It keeps clips without provenance**, so no one can say which runtime a pass belongs to.
- **It records once and never retires a clip**, so an old runtime's input judges new rules.
- **It tests a rule that reads the runtime's decided value as if the joints decided it**, and
  a runtime update moves the verdict while every clip stays green.
- **It replays against a copy of the rule**, so the test passes while the game is wrong.
- **It reports an emulator pass as device evidence.**
- **It trusts proxy numbers after real hands contradict them**, and never records the
  contradiction.
- **It retires the proxy corpus by feel**, not by what the ledger shows it missed.

## Seams with neighbouring craft

How the timing window itself is judged from tracked hands belongs to hand-tracked timing
windows. Which motion or pose the hand made belongs to drawn-gesture command recognition.
This subject supplies the recorded input those subjects are regressed on.
