---
layer: golden-path
type: golden-path
subject: multi-speaker-speech-production
status: forged
use_when: [producing a scripted dialogue or narration with several voices as offline authored content, a script revision must not re-record the whole thing, a script is longer than one generation call allows, upgrading the speech engine under a cast of stored voices, direction markup that worked stops working, invented names are pronounced differently in different lines]
techniques:
  - line-addressed-re-render
  - chunk-boundary-continuity
  - voice-asset-model-generation-binding
  - inline-direction-dialect
  - world-lexicon-as-pronunciation-dictionary
---

# Multi-speaker speech production

A script with several speakers is not one piece of speech. It is a list of
**lines**, each spoken by someone, each of which a writer will want to change
after hearing it, and each of which a synthesis engine renders as a sampled
event that will come out slightly different the next time. Producing it well is
the discipline of treating that list as the unit of work: addressable,
re-renderable one line at a time, cast from stored voices that outlive any one
engine, directed in a vocabulary the script owns, and pronounced from a lexicon
the script also owns. The naive reading treats it as "paste the text, pick a
voice, press generate", and it fails in the same way every time: the first
revision re-rolls everything a reviewer already approved.

## Which side of the line this subject stands on

This subject is **offline production of authored content**: a script exists, a
cast is chosen, clips are rendered ahead of time, reviewed, revised and
delivered as files. The runtime speak path of a product — a reply spoken as it
is generated, engine selection, streaming, latency budgets, per-user voice
catalogs — is a different problem with different forces and is owned by the
voice-I/O subject in the software-engineering bundle. Two neighbours in this
bundle are cited, not restated:

- Grading a finished clip (round-trip intelligibility, three axes, the listening
  board) belongs to [generated speech acceptance](../generated-speech-acceptance/generated-speech-acceptance.md).
  This subject produces the unit that subject grades, and uses its board as the
  check wherever a technique below says "listen".
- How delivery is *written* for a human-sounding read — casting a narrator,
  adapting prose to its spoken form, pacing and emphasis intent — belongs to the
  spoken-delivery-direction technique of the creator-voice subject. What this
  subject adds is what happens to that direction when the engine changes.

Research on adjacent terms (audio-tag direction, voice cloning consent, narration
production) returned only subjects that own one slice: speech acceptance grades,
delivery direction writes, the voice-I/O engine plumbing runs, authored-voice
identity describes one voice. None of them models the forces that appear only
when a script of many lines meets an engine that samples, has a length limit,
changes generations and speaks a private markup dialect. That is the gap.

## The line is the unit, and only if identity holds

A revision changes a sentence in the middle of a scene. If the script is a blob,
the only move is to regenerate the blob, and every line a reviewer had already
accepted is re-sampled and must be reviewed again; the law that review is voided
by regeneration ([edit, do not regenerate](../../_laws.md#edit-do-not-regenerate))
applies to audio exactly as it applies to a cut. If the script is a list of
addressed lines, a revision re-renders the changed lines and leaves the rest
byte-identical. That is the whole payoff, and it rests on a precondition that
must be measured, not assumed: a re-rendered line must still sound like the same
person as its neighbours. Engines publish claims that identity is stable across
regenerations. Those claims are vendor measurements with no sample size behind
them, and this subject treats every one of them as **a claim to verify on a
listening board**, never as a fact. The first act of a line-addressed workflow
is the check; its fallback, when identity does not hold, is to re-render the
scene
([line-addressed-re-render](./techniques/line-addressed-re-render.md)).

## Length is a seam problem, not a chunk problem

Every engine caps the characters in one generation, and long scripts exceed it.
The cap forces a cut, and the cut is where the audible defect lives: a change of
energy, breath or room tone at the join, a sentence that starts as if it were the
first. The rules are to cut at speaker turns and never inside a sentence, to
give each chunk the context of the one before it through the engine's own
continuity mechanism rather than by re-priming, and to audit the **seam** rather
than the chunk, because each chunk can be flawless and the join still betray the
splice
([chunk-boundary-continuity](./techniques/chunk-boundary-continuity.md)).

## A voice is an artifact of one engine generation

A cloned or designed voice looks like a durable asset — it has an identifier, it
appears in a list, it is in the cast sheet. It is in fact a product of a
particular engine generation, and a newer generation may not accept it, may
accept it and render it differently, or may require it to be rebuilt from its
source audio. The failure is quiet: the identifier resolves, the engine renders,
and the cast has been silently re-cast. So an engine upgrade is a **re-casting
event**, gated on a per-voice acceptance pass and never on the model identifier
having changed. The same technique carries the one consent rule this subject
holds: a cloned voice is a likeness of a person, and rebuilding it on a new
generation is a new use of that likeness, so the consent record must cover the
rebuilt asset before anything is produced
([voice-asset-model-generation-binding](./techniques/voice-asset-model-generation-binding.md)).
Consent is a precondition there, not a technique of its own here; who may be
cloned is decided by people, outside any score.

## Direction is written in an engine's dialect, and dialects are disowned

Many engines accept direction as bracketed tags inside the text: a delivery, a
sound, a pause. That markup is a private dialect. A tag the engine does not know
may be read aloud as words, or silently ignored; a form that worked on one
generation may be explicitly disabled on the next. A script that has the
dialect baked into its sentences is therefore hostage to one engine version and
becomes unmaintainable at the first upgrade. Keep the script in a neutral
direction vocabulary the production owns, compile it to the engine's dialect at
render time, and pin the compiled output per engine generation
([inline-direction-dialect](./techniques/inline-direction-dialect.md)). Which
direction to give, and how to write it for a human read, is the delivery
subject's craft; whether it survives contact with the engine is this one's.

## Names are pronounced by a lexicon, not by hope

An invented place, a surname, an acronym, a technical term: the engine will
guess, and it will guess differently in different lines and after different
engine changes. A single lexicon, versioned with the script, states how each
term is said; every proper noun appearing in two or more lines enters it once;
and a lexicon change is a script change with a blast radius the tooling can
compute, because it re-renders exactly the lines that contain the term
([world-lexicon-as-pronunciation-dictionary](./techniques/world-lexicon-as-pronunciation-dictionary.md)).
This is not the text-normalization pass that turns digits and markup into
speakable words; that pass is per text and stateless, while the lexicon is
per world and its trigger is a revision.

## How the five compose

The line address is the join key for everything else. A line's render is keyed
by its text, its voice, the engine generation, the compiled direction, the
lexicon version and the continuity context it was given; change any one and
that line, and only that line, is stale. Length forces chunks whose seams need
an audit; the voice asset ties the cast to a generation; the dialect ties the
direction to a generation; the lexicon ties names to a version. Each is a way
a render can go stale without the script changing, and the production's job is
to make staleness visible and cheap to act on rather than discovered by ear
after delivery.

## What a naive reading gets wrong

- It re-renders the scene because one line changed, and voids the review.
- It trusts a published identity-stability claim and never listens for it.
- It cuts a long script at the character cap, mid-sentence, and joins files.
- It upgrades the engine because the new identifier is available, and finds the
  cast has changed only when a listener notices.
- It writes engine markup into the script, and rewrites the script on the next
  engine.
- It fixes a mispronunciation in one line and leaves it wrong in the other
  eleven.
- It caches renders by text and voice alone, so a changed engine serves stale
  audio that looks fresh.

## Where this subject ends

It ends where the runtime begins (streaming, latency, engine choice) and where
judgement begins (the acceptance verdict, and the consent decision). It does
not choose a cast, direct a performance or grade a clip; it makes a script of
many voices cheap to revise without losing what was already approved.
