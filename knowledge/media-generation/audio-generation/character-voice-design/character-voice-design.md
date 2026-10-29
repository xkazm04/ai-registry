---
layer: golden-path
type: golden-path
subject: character-voice-design
status: forged
use_when: [giving a character, companion or assistant a synthetic voice that does not exist yet, writing a voice description for a text-to-voice designer, auditioning designed voice candidates before choosing one, a voice should evoke a known character without imitating its performer, a designed voice sounded right in its preview and wrong in production]
techniques:
  - character-vocal-brief
  - voice-description-composition
  - audition-line-set
  - casting-slate-spread
  - design-to-read-parameter-lock
  - finishing-effect-layer
---

# Character voice design

A text-to-voice designer turns a written description into a voice that never
existed: no actor, no recording, a few sentences of prose and a seed. That makes
the description the whole casting brief, and it makes casting a writing problem
before it is a listening problem. The craft is the chain from a **character** to
a **voice that ships**: read the character for what the voice must carry, write
that into the vocabulary the designer understands, audition a deliberately spread
slate on lines that exercise the character's range, lock the parameters that turn
a design preview into a repeatable voice, and add whatever makes the voice
non-human in a finishing layer the designer never sees.

The naive reading writes one rich adjective-heavy description, generates a
handful of voices, picks the one that sounds best on a greeting, and ships the
preview's settings by accident. It fails in four predictable places. The
description asks for things a voice cannot carry (a personality trait with no
acoustic correlate), so candidates differ at random rather than along the axis
anyone cared about. The audition line is easy, so every candidate passes it. The
voice that won in the preview sounds different once it reads real lines under a
different model and stability. And the "AI" quality the character needed was
asked of the designer in prose, where it comes back as a muddy compromise instead
of a controllable effect.

## Where this subject stands

Four neighbours own adjacent ground, and the seam with each is a single question.
Casting a narrator among voices that already exist, and writing delivery for a
human-sounding read of a script, belong to the spoken-delivery-direction technique
of the [creator voice](../../narrative-craft/creator-voice-and-tone/creator-voice-and-tone.md)
subject: the voice is chosen there, it is **authored** here. Grading a finished
clip, and the structure of the board a listener hears it on, belong to
[generated speech acceptance](../generated-speech-acceptance/generated-speech-acceptance.md):
this subject uses that board as its instrument and adds what a casting decision
needs on top of it. What happens to a stored voice when the engine changes
generation, and the markup dialect that direction compiles to, belong to
[multi-speaker speech production](../multi-speaker-speech-production/multi-speaker-speech-production.md);
a voice designed here enters that cast sheet as one of its assets. The durable
record of one voice's specification in a product, and the runtime speak path, are
owned by the voice-I/O subject of the software-engineering bundle. The rule a
reader uses: if the voice does not exist yet and the question is what it should
be, it is this subject.

## The character is read before it is described

A character is identity, arc and function; a voice is register, timbre, pace,
accent and age. The translation is lossy in both directions and is done on
purpose. Every trait in the character sheet is sent to exactly one of three
carriers: the **timbre** the designed voice owns permanently (age, pitch
register, texture, accent, baseline warmth); the **delivery** the line text and
its direction own per line (sarcasm, tenderness, panic, a laugh); and the
**treatment** a finishing layer owns (anything that marks the voice as a machine,
a hologram, a radio). A trait sent to the wrong carrier is the commonest casting
defect: a breakdown arc written into the timbre gives a voice that sounds
unstable on a cheerful line, and a synthetic sheen written into the description
gives a voice that cannot be heard clean
([character-vocal-brief](./techniques/character-vocal-brief.md)).

## The description is a specification in the designer's vocabulary

A designer responds to concrete acoustic vocabulary and largely ignores narrative.
An effective description reads like a casting call written by a sound engineer:
who (gender presentation, age as a number or band, accent), the instrument (pitch
register, texture, breathiness, resonance), the manner (pace, articulation,
attitude expressed as delivery), and the recording (studio-clean, close
microphone, no room). It names no real person and no existing character: a
designer refuses or flattens such names, and imitating a living performer's voice
is a likeness question that no prompt settles. A refusal here is information about
the brief, to be rewritten into attributes, never a request to retry
([voice-description-composition](./techniques/voice-description-composition.md);
[refusal is a state](../../_laws.md#refusal-is-a-state)).

## The audition is a set of registers, not a greeting

Every candidate sounds fine saying hello. The audition set is three to six short
lines, each five to ten seconds, each written to exercise one register the
character must own: the working register it spends most of its time in, the
humour, the tender turn, the high-intensity edge, and whatever the arc demands
at its extreme. The lines are original to the production, identical across every
candidate, and carry their direction tags in the same places, so that the only
variable on the board is the voice
([audition-line-set](./techniques/audition-line-set.md)).

## A slate is designed for spread

Ten candidates generated from ten paraphrases of one description are ten draws
from the same neighbourhood; the listener hears noise and picks the loudest. A
slate is designed: one canonical reading of the brief, then variants that each
move along one named axis (register lower, energy higher, age older, warmth
cooler, texture rougher), with the seed and the design text held constant so
that the axis is what changed. Each round narrows: the first finds the region,
the second varies around the picks, and the record of what was picked and why
travels into the next round's descriptions
([casting-slate-spread](./techniques/casting-slate-spread.md)).

## The design preview is not the voice

A designer returns a preview: the new voice reading the design text once, under
the designer's own generation settings. The voice that ships reads other lines,
under a speech model, a stability setting and a seed that the production chooses.
The two can differ audibly, so the decision is made on reads under the shipping
parameters, and those parameters (voice, model, stability, seed, output format)
are locked together and recorded as the render key from that moment on. A
consistency test, the same line rendered several times, decides the stability
setting; it is a choice between expressiveness and repeatability that the owner
makes by ear, not a quantity to maximize
([design-to-read-parameter-lock](./techniques/design-to-read-parameter-lock.md);
[unmeasured is not pass](../../_laws.md#unmeasured-is-not-pass)).

## The machine in the voice lives after generation

When a character is an artificial intelligence, a hologram or a voice over a
radio, the non-human quality is a treatment, not a timbre. Designers render
"robotic" or "holographic" unevenly and irreversibly, and a voice built with the
treatment baked in can never be heard clean, compared clean or retuned. So the
designed voice is human, and the treatment is a small, parameterised effect
chain applied at playback or at bake time, identical on every line, auditioned on
the same board as a toggle and shipped as the same chain that was auditioned.
Once the effect layer owns a quality, the description stops describing it
([finishing-effect-layer](./techniques/finishing-effect-layer.md);
[a typed input owns its channel](../../_laws.md#typed-input-owns-its-channel)).

## Evoking a character is not imitating a performer

A production often wants a voice "like" a well-known character. The legitimate
version of that request is a reading of the character's qualities, which is
exactly the vocal brief above: confident, wry, mid-register, quick, warm under
the edge. The illegitimate version is a copy of the performer who voiced it,
which is a likeness of a real person and needs that person's consent, whatever
the tool permits. A designed voice from attributes lands in the first category
by construction, which is also why it will not sound identical to the reference,
and the brief should say so up front rather than let the rounds chase an
imitation the method cannot and should not deliver.

## What a naive reading gets wrong

- It writes personality into the description and gets random variation instead
  of the trait.
- It asks the designer for "robotic" and cannot hear the voice without it.
- It auditions on a greeting, where every candidate passes.
- It generates ten paraphrases and calls the result a slate.
- It names a character or an actor, and treats the refusal as a glitch.
- It picks from design previews and ships under different read settings.
- It loses the description and seed, so the voice cannot be rebuilt.
- It tunes the effect chain on the board and ships a different one.

## Where this subject ends

It ends when one voice is chosen and its parameters are locked. Producing a
script of many lines with that voice, keeping it valid across engine generations,
grading individual clips and wiring it into a product's runtime speak path are
the neighbours' work. It does not decide whether a production may clone a real
voice; it designs voices that need no one's likeness.
