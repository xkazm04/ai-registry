---
layer: technique
type: technique
subject: subtext-and-voice-differentiation
technique: distinguish-by-rhythm-and-refusal
status: forged
laws: [unmeasured-is-not-a-pass]
shared_with: []
use_when: [two characters could swap lines unnoticed, a cast is differentiated only by accent or catchphrase, testing whether a generated cast sounds distinct]
---

# Distinguish by rhythm and refusal

The named concern: make each speaker identifiable without a name tag, by the structure of
what they say rather than by its decoration. A voice is the set of choices a person makes
under pressure — how long their sentences run, what they ask, which words they reach for,
what they will not say — and two characters are distinct only when those choices differ.

## Costume is not voice

The naive method dresses each character: an accent spelled phonetically, a catchphrase, a
signature oath, a verbal tic. Costume is cheap to apply and it does mark speakers, which is
why it persists. Measurement agrees that it marks them. A classifier study of characters'
speech in modern drama found forms of address and dialect words among the features that
separate characters most easily. So the objection is not that costume is indistinct. It is
that costume is not a voice. It fails on three counts. It is shallow: under the costume every character
builds the same sentences and concedes at the same beat, and readers feel the sameness. It
is fragile: one generator pass or one rushed writer drops the tic and the character
vanishes. And it wears: a catchphrase heard twenty times turns a person into a sound effect.
Keep at most one surface marker per character, as seasoning, and build the voice from the
three layers below.

## The three layers

**Rhythm.** Sentence length and its variance; whether thoughts finish or break off; whether
the speaker leads with the point or circles to it; questions versus statements; how they
open and how they end a turn; whether they interrupt. A character who speaks in short
declaratives and never asks a question sounds different from one who answers everything
with a question, before either says anything about the world. Rhythm also survives
translation and performance better than vocabulary does.

Grammar habits belong to rhythm and are among the cheapest markers to hold: a speaker who
drops subjects, one who never contracts, one who reaches for the passive whenever blame is
near ("the part was fitted wrong") is identifiable from syntax alone.

**Vocabulary.** The domain the words come from — the workshop, the ledger, the chapel, the
barracks — and the register within it; the metaphors they reach for, which come from what
they do all day; the words they use when angry or when moved; and the words they never use.
A mechanic describes a person as a machine and a bookkeeper describes one as an account,
and neither needs to say their job. Address is part of vocabulary and an unusually strong
marker: what a speaker calls the person in front of them — a name, a role, a number owed,
an endearment, nothing at all — states the relationship every time they open their mouth.

**Refusal.** What the speaker will not say: the topic they steer away from, the admission
they never make, the name they avoid, the apology they will not give, the way they say no
without the word. Refusal is the layer that matters most to the writing, because it is
structural: it shapes whole exchanges rather than single lines, and it is where character and
subtext meet. It is not the layer measurement finds first. Studies that attribute characters'
speech by machine lean on how often a speaker uses common words, on address terms, on dialect
and on topic. An absence needs far more text than a bark to register. So treat refusal as the
layer that makes a voice worth having, not as the cheapest one to detect. A man who never refers to his dead brother, across a whole game, has a voice defined
by an absence the player learns to hear. Refusal also gives every scene a pressure point: the
moment someone pushes on the refusal is a scene whether or not they break it.

## Building contrast across a cast

Distinctness is relational. Set the cast's voices against each other deliberately, on each
layer: at least one terse and one expansive speaker, one who asks and one who tells, one
whose vocabulary is technical and one whose is moral, and refusals that collide — the
character who will not talk about the past paired with the one who cannot stop. Two
characters who share a layer must differ sharply on another. Then write each speaker's
register toward each other person they address: the same character is clipped with an
employer, loose with a sibling, formal with a creditor, and those shifts are themselves voice.

## Voices converge at the peaks

Distinct voices are easiest to hold in a calm scene and are lost exactly where they matter:
under pressure, every character tends to deliver the same articulate emotional summary. The
villain explains himself, the hard one confesses, the shy one makes a speech, and all three
speak in whole, balanced paragraphs no frightened person produces. So state, for each
speaker, what pressure does to their voice — quieter, louder, more formal, more broken — and
check the peaks first. Real people under stress lose syntax, not gain it.

A drill that exposes convergence quickly: give the whole cast the same content and write it
once in each voice. "The race is fixed" from a creditor who speaks in accounting terms, from
a nervous apprentice who hedges in fragments, and from a former hauler who speaks in
imperatives should produce three lines that share no words. Where two versions come out
alike, those two characters are not yet distinct.

## The blind attribution test

Distinctness is checkable, and an unchecked claim of distinct voices is not a pass, which is
[unmeasured is not a pass](../../../../_laws.md#unmeasured-is-not-a-pass) applied to a cast.
Strip the speaker tags from a scene of three or more speakers, shuffle the order of a pool of
lines, and ask a reader who knows the cast — or a separate judge given only the voice
references — to attribute each line. Lines that are misattributed or unattributable are the
findings; the deliverable is the list of those lines, not a percentage. A second, cheaper
check is the swap test: take any line and ask whether another character could have said it
unchanged. A line any character could say is a line no character owns.

Three conditions decide whether the test measures voice or something else.

**The reference must not contain the lines under test.** A voice bible usually quotes the
script as its sample lines. A judge holding it can then match a line rather than attribute
it. Remove the quoted lines from the pool, or the sample rows from the judge's copy.

**One judge's percentage is noise at cast scale.** With five or ten lines per speaker, a single
run's per-speaker score swings by several lines between runs. A model judge also sits well
below a human reader at picking the speaker of a line. So use at least two judges and keep the
lines they all miss. Those lines are stable. A ranking of whose voice is weakest usually is not.

**Mask the cheap markers when the cast leans on them.** Address terms and names make the test
easier. Replace them with a placeholder in one arm and compare. When the score barely moves,
the voices stand on structure. When it collapses, the cast was being told apart by its
costume.

## Decision rules

- **When two characters' lines can be swapped without anyone noticing, change the rhythm or
  the refusal of one of them**, not their vocabulary first — vocabulary changes are the
  easiest to make and the easiest to lose.
- **When a character is identifiable only by a tic, strip the tic and rewrite until they are
  still identifiable.** Then put the tic back, once.
- **When a line breaks a speaker's declared refusal, treat it as a defect** unless the
  break is the declared, scheduled one. A character saying the forbidden thing for the
  first time is a peak; plan it, spend it once, and never let it happen by drift. A rule
  that treats every break as a defect forbids the best beat a refusal can buy; a rule that
  treats none as a defect lets a generator spend it on a filler scene.
- **When spelling an accent, prefer word choice and syntax to altered spelling.** Phonetic
  spelling slows reading, condescends easily, and on a screen read from across a room it is
  simply illegible.
- **When generating a cast's lines, generate per speaker with that speaker's reference**,
  not a whole scene from one undifferentiated prompt, and run the blind attribution test on
  the result.

## When not to use this

Background voices — a crowd, a radio, a vendor heard once — need a register, not a
three-layer voice; building them out spends effort the player will never notice. Choral
moments where a group speaks as one are deliberately undifferentiated. And a character whose
arc is losing their voice — absorbed into a group, broken by events — may be written to
converge on another's rhythm on purpose, which the attribution test should then report as
intended.

## Evidence status

Differentiation by syntax, rhythm, tone and vocabulary is established writing doctrine in
screenwriting teaching, reached here through summaries of a dialogue textbook rather than
the text itself, and in practitioners' interviews, which report their words second-hand. The
"never says" discipline comes from a series writer's reported practice, with no primary
statement found. That one model voicing a whole cast gives every speaker its own family
fingerprint is supported by a measured study of over-used model phrasing, which covers
prose. A 2024 [speaker-verification study](https://arxiv.org/abs/2405.10150) of
agent-generated conversations measured the same thing in dialogue: role-playing models keep built-in characteristics across the roles
they play.

What separates characters under measurement comes from a different set of studies:

- A 2019 classification study of characters in modern drama
  ([Vishnubhotla, Hammond and Hirst](https://aclanthology.org/W19-2504)) found address and
  dialect words among the most separating features. It also found that characters cluster
  more closely in lesser playwrights' work.
- Classic stylometry of a novelist's characters by their rates of common words, reached here
  through secondary accounts.

Ranking refusal first is therefore craft opinion, not measurement, and the scheduled-break
rule is practitioner synthesis.

On the test as a gate:

- Model judges attribute the speaker of a line well below human readers. A 2025 benchmark
  ([PersonaEval](https://arxiv.org/abs/2508.10014)) puts the best model near 69% and humans
  at 90.8%.
- The leakage, multi-judge and masking conditions come from one field re-run of one cast,
  75 lines and four model judges. That run is recorded in the process application.

None of this has been tested with players in a played game.
