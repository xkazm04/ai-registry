---
layer: golden-path
type: golden-path
subject: live-system-demo-film
status: forged
use_when: [producing a demo film of a working software system, deciding whether to record a demo by hand or drive it from a script, building a repeatable capture-and-narrate pipeline, reviewing a demo film for claims it cannot back]
techniques:
  - audio-first-beat-pacing
  - script-as-single-source
  - recording-that-asserts-its-claims
  - summary-rendered-from-the-run
  - seeded-stage-with-a-declared-boundary
  - recorder-owned-overlay
  - retake-without-an-edit-session
---

# The live-system demo film

A demo film of a live software system is the one factual film whose picture is
**evidence**. Every other kind of produced video argues about the world with
material that was shot or generated; this one argues about a machine the
audience could go and run. That single property decides the whole craft. If the
picture is evidence, it has to be captured by driving the real system rather
than produced by an editor or a model. If it is evidence, its claims can be
false, so something has to check them. And if it can be false, it can go stale —
which means the film is not a document you finish but **a build artifact you
re-run**.

The naive method is well known and it is a trap: record your screen, then add a
voiceover. It fails in four places at once. The picture is captured before the
voice exists, so the voice is either rushed onto it or the picture is re-timed
by hand — in an editing session, which is the cost this subject exists to
abolish. Nothing verifies that the system did what the film says it did, so the
most widely-distributed claim a team makes about its product is also the least
checked artifact in the building. The figures on the recap screen were typed by
somebody who watched the run once. And a single sentence changed in the script
costs the whole shoot again. Six months later the product has moved, the film
has not, and nobody finds out until a viewer follows it and the control is not
where it was.

Three inversions replace it, and they are the whole subject:

> **The voice is generated and measured before anything is recorded. The picture
> is driven by a machine-readable script that also asserts what it claims. The
> finished cut is the output of a command, not of an editing session.**

Each inversion buys a property the hand-made film cannot have. Measuring the
narration first means the picture is paced to the voice instead of the voice
being squeezed onto the picture, so the film is never faster than the words.
Driving the system from a script means the capture can assert, in the same pass,
against the same machinery, that every behaviour the narration describes
actually happened. Making the cut a command means a re-shoot costs one
invocation, which is what keeps the film honest over time: a demo that is
expensive to re-make is a demo that will be allowed to rot.

## The film has inputs, a build, and a gate

Treat the production as a build and most of the discipline follows without
argument. Its inputs are a script, a fixture, and a system under test. Its
build is three separable phases — synthesise the narration and measure it,
drive the system and capture it, assemble the cut — each of which can be run
alone and each of which is cheap to re-run because the one before it is
idempotent. Its output is a file. And, like every build, it has a **gate**: a
take whose assertions did not all hold produces a diagnostic recording, not a
publishable film.

The consequence worth stating out loud is that the film can be re-built on a
schedule, and its failure is a product signal rather than a media one. A demo
that stops passing tells you the product moved out from under the story, which
is information the team wanted anyway and could not previously get. A
hand-recorded demo degrades in exactly the same way and reports nothing.

## The clock belongs to the voice

In factual narration the spoken line is the argument and the picture is the
evidence for it, so the voice sets the clock and the picture waits. Concretely,
every beat holds for the longer of its measured narration and the minimum time
its picture needs to be legible, plus a fixed breath, timed from the moment the
beat's own actions begin — not from the moment they finish. That last clause is
the one people get wrong, and it is worth understanding rather than copying: if
the hold starts after the actions complete, every beat pays for its actions
twice, once while the voice is talking over them and again in the silence
afterwards, and the film runs minutes long in a way no single beat reveals.

The pacing runs on a **measured** duration, never a guessed one. Written word
counts under-predict spoken length wherever figures, abbreviations or proper
nouns appear, and marked pauses add time with no words at all. An estimate is a
planning device: it prices a script, it paces a rehearsal, and it never paces a
delivered cut. When a clip has not been synthesised yet, the estimate is used
*and the beat is marked unmeasured*, so the run can say how much of its own
timing it is guessing.

## The picture is captured, and it is checked

A capture that drives the real system is only worth its complexity if it
verifies what it captures. The standard: every claim the narration makes about
the system's behaviour is asserted while the take is being made, against the
same machinery the audience is watching, and the assertion is made against
**what is rendered** rather than against what was passed. A film that shows a
safeguard being honoured while it was not honoured is not a neutral artifact
with a bug in it; it is a false attestation with production values, and it is
strictly worse than having no film.

The failure policy is the counter-intuitive half. A beat that throws is recorded
as an error and the take **continues**. A take is long, serial, and already
carries the cost of synthesis; losing twenty minutes of it to one moved control
yields no film and exactly one defect. Carrying on yields a complete recording
to look at and the full list of everything that broke. The run then fails at the
end, naming every broken beat, so the policy never quietly becomes "ignore
errors".

## The stage is built, and the boundary is stated

A live environment cannot promise, on the day, the state the story needs, a
surface nobody changed overnight, or a boot that needs no credentials and no
network. So the film runs against a deterministic seeded fixture with its
defects planted exactly where the story needs them. Dressing a set is
legitimate; leaving the audience to guess which parts were dressed is not. The
price of the fixture is a **declared boundary** — the film's own documentation
states which parts of what the audience sees are the real system, which are
staged, and which are the recorder's own explanatory chrome. The discipline that
keeps the boundary from becoming decorative is a test on the script: write it so
that swapping a staged part for the real one changes the words, not the beats.
A beat that would disappear when the fixture is replaced was a beat about the
fixture, and a film made of those is a demo of the demo.

## What this subject does not own

**Assembly.** Once material exists and is placed on a timeline, the assembly
craft governs it: one clock, lanes that do not collide, gaps drawn rather than
skipped, loudness delivered to a stated number, drift measured at head and tail.
This subject owns how the material comes to exist and why it can be believed;
assembly owns where it sits and how it sounds against its neighbours. The rule
for picking is that question shape. "Where did this block come from and is what
it shows true" is here. "Where does this block sit, and what is under it" is
assembly. Note that the assembly step this subject prescribes is deliberately
**degenerate** — one picture track and a voice track placed at offsets the
recorder itself logged — and a cut with more lanes than that has crossed the
seam and inherits assembly's rules in full.

**Phasing.** The sequencing of a multi-phase generative production — what must
settle before the next phase's money is spent, which artifacts are durable and
which are disposable, how a minutes-long run stays out of the creator's way,
how progress reports itself honestly — is the phasing subject's, and this one
inherits it rather than restating it. The difference worth holding is the shape
of the graduation gate. Phasing's phases graduate on a human decision: someone
approves the script, someone picks the frame. This production's central phase
graduates on a **machine verdict** — the take either asserted its claims or it
did not — and that is why its gate can run unattended and on a schedule. Read
phasing for what must be settled before spending; read here for what must be
true inside a take for it to be usable at all.

**Voice.** How the narration should sound, how fast it should read, which voice
speaks, where it pauses and what it emphasises, and how a rate interacts with a
fixed slot — all of that belongs to the voice-and-tone craft, and it ends at the
rendered clip. This subject takes that clip as an opaque input and owns exactly
one property of it: its measured length, and what the picture does about it. A
decision about words, rate, casting or delivery is over there; a decision about
how long the picture waits is here. The seam is clean because the two subjects
meet on a number: the voice craft's own rule is that a synthetic narrator's rate
is emergent and must be measured from a render rather than declared, and this
subject is what consumes that measurement.

Two further seams are worth naming because they look adjacent and are not. The
two-minute cut derived from a long take is a re-authorship problem with its own
contract, owned by the short-form and trailer subjects; deriving it by trimming
a demo film proportionally produces exactly the failure they exist to prevent.
And the loop that answers a reviewer's creative notes — what to edit, what to
regenerate, where the seams fall — belongs to the review-iteration craft. The
re-shoot this subject owns is **mechanical and economic**: the cost of running
the same film again after the script or the system changed, not the question of
whether a note should be answered with an edit.

## What a principal practitioner holds true

- The film is a build artifact with inputs, a gate and a command. If re-making
  it takes an afternoon, it will be allowed to go stale, and a stale demo of a
  live system is a lie the team is still shipping.
- The voice sets the clock. A picture cut faster than its narration is not
  energetic; it is a film the audience cannot follow while being told why.
- A duration is measured or it is marked. There is no third state, and a run
  reports how many of its beats were paced by estimate.
- One script, four consumers. The narration, the driving, the captions and the
  price all derive from the same artifact; the second place a rule is written is
  the first place the film goes wrong.
- A generated clip must be able to prove it belongs to the line as it now
  stands. Presence on disk proves nothing, because a rewritten line keeps its
  identity and the old recording keeps its name.
- The recorder is a test. Every behavioural claim in the narration is asserted
  during the take, against the rendered text the audience reads.
- A broken beat is recorded and carried, and the run fails at the end with the
  whole list. Aborting a long take on the first defect is the one outcome a
  recorder must not have.
- Every figure on the recap is reduced from the run's own record. A recap that
  is a second authority disproves nothing, which is the only thing a recap is
  for.
- The stage is seeded and the boundary is declared. The list of staged parts is
  also a backlog: each line is a promise the product has not kept yet.
- The explanatory chrome belongs to the recorder, isolated in both directions
  and re-applied after every navigation, and it animates only what the audience
  must follow. When the product grows the surface the chrome stood in for, the
  same script runs with the chrome switched off.

## The techniques

- [audio-first-beat-pacing](./techniques/audio-first-beat-pacing.md) — measuring
  the narration before capture and holding the picture per beat so the film is
  never faster than the voice.
- [script-as-single-source](./techniques/script-as-single-source.md) — one
  machine-readable script behind narration, driving, captions and price, and the
  staleness check that keeps a clip honest about its line.
- [recording-that-asserts-its-claims](./techniques/recording-that-asserts-its-claims.md)
  — the recorder as a test: assertions during the take, on rendered text, with a
  record-and-carry-on failure policy.
- [summary-rendered-from-the-run](./techniques/summary-rendered-from-the-run.md)
  — recap screens, counts and end plates reduced from the run's own record
  rather than transcribed from it.
- [seeded-stage-with-a-declared-boundary](./techniques/seeded-stage-with-a-declared-boundary.md)
  — the deterministic fixture with planted defects, and the disclosure that is
  its price.
- [recorder-owned-overlay](./techniques/recorder-owned-overlay.md) — explanatory
  chrome injected from outside the system under test, isolated, re-applied, and
  removable without touching the script.
- [retake-without-an-edit-session](./techniques/retake-without-an-edit-session.md)
  — idempotent synthesis, per-beat re-narration, a spend guard, a dry mode, and
  assembly from logged offsets.

Cross-cutting invariants these techniques cite live in [`_laws.md`](../../_laws.md).
