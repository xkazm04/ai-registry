---
layer: golden-path
type: golden-path
subject: game-dialogue-voice-pipeline
status: forged
use_when: [adding synthesized or cloned speech to a game, deciding which lines are pre-rendered and which are spoken at runtime, a speech-model upgrade is about to touch a shipped cast, a translated line no longer fits its animation]
techniques:
  - bake-versus-runtime-speech
  - line-id-catalog-and-revision-diff
  - localized-voice-timing-budget
  - cast-ledger-with-consent
  - re-cast-gate
---

# Game dialogue voice pipeline

Spoken dialogue is the one audio class that is simultaneously text, performance, a
person's likeness and a runtime cost. A sound effect is judged once and forgotten. A spoken
line is attached to a graph node, an animation of fixed length, a subtitle, a translation
in every shipped language, and, when the voice was cloned, to a human being who agreed to
something. Every one of those attachments outlives the render, and a synthesized voice
changes the economics of all of them at once: producing a line becomes cheap, so the
lines multiply, and the discipline that used to be enforced by studio booking cost (freeze
the script, cast once, record once) is no longer enforced by anything.

This subject owns the production pipeline for spoken lines: which lines exist and in what
class, what identifies each one, what duration it must fit, whose voice speaks it, and what
happens to the whole catalog when the speech model underneath it changes. It does not own
where a rendered line sits in space or how it is occluded, and it does not own whether the
words are any good.

## Where this subject ends

Three neighbours sit close enough to be confused with it, and the rule for picking is a
question about the thing being decided. If the question is *where the sound is and what
stands between it and the listener*, that is
[spatial audio scene authoring](../spatial-audio-scene-authoring/spatial-audio-scene-authoring.md):
a rendered line is an emitter there, with a priority band and a positionless-or-positioned
choice, and everything after the file exists is theirs. If the question is *is the
conversation graph playable and how much text does it carry*, that is
[branching narrative graph validation](../../../content-pipeline/branching-narrative-graph-validation/branching-narrative-graph-validation.md):
it owns the node, its identity and its text budget in characters, and this subject reuses
that node identity instead of minting a second one. If the question is *may this provider
be routed for this kind of asset at all, and is its declared capability real*, that is
[generative provider auditing](../../../production-governance/generative-provider-auditing/generative-provider-auditing.md):
this subject borrows its audit stance for one specific claim, that a new model generation
serves an existing cast, and adds only what is specific to a voice catalog. Two concerns
live in other domains and are named here only in prose: the real-time synthesis budget
(time to first audible sample, chunking, buffering) belongs to the voice input/output
craft, and the acceptance of a rendered take on a listening board belongs to the media
generation craft. This subject decides *that* a render is accepted per voice before a
catalog is re-rendered; it does not restate how a take is judged.

## The line is the unit, and the line has a class

Nearly every failure in this territory comes from treating "dialogue" as one thing. It is
at least three. An authored story beat is a line whose wording is final, whose delivery
matters, and which plays once; it can be rendered a week before ship and heard by a person
before a player hears it. A reactive bark is short, repeats hundreds of times, and its
identity is its category rather than its wording. Open-ended conversation is text that does
not exist until the player asks, so it cannot be rendered in advance and cannot be heard by
anyone before the player does. The three want different pipelines: offline render with
human acceptance, a pool of baked variants with selection rules, and a generation path
under a latency budget with a fallback for when the budget is missed
(bake-versus-runtime-speech).

The classification is a property recorded per line, not a property of the game. A game that
"uses runtime speech" has a handful of runtime lines and thousands of baked ones, and
treating the whole game as runtime buys a latency problem and an acceptance problem for
lines that had neither. The reverse mistake, baking everything, produces a companion who
can only ever say what was anticipated.

The load-bearing runtime rule is about the failure, not the speed. Streaming speech has a
start latency and a tail latency, both variable, and a vendor's stated median describes
neither the worst case a player meets nor the network in the player's home. What the game
does when the stream is late is a design decision made before ship: play a pre-rendered
filler read that fits the character, or hold the interaction, or show text first. Silence
is not a fallback; it is the defect the fallback exists to prevent.

## Identity, or the catalog is fiction

A voiced game holds tens of thousands of recorded units, and the questions asked of them
are all questions about a subset: which lines changed since the last build, which lines
belong to this speaker, which lines were rendered by an older model. None of them can be
answered from filenames or from the text. Every line therefore has a stable identifier
minted once, a speaker, a script revision and a render revision, and the identifier is the
graph node's identifier plus a variant marker where one node speaks more than one text
(line-id-catalog-and-revision-diff). A second identifier scheme invented for audio is the
common mistake, and it fails the first time a writer splits a node.

Two revisions are tracked because they invalidate different things. A script change
invalidates the lines whose words changed and nothing else. A render change (new model, new
voice, new pronunciation rules, new settings) invalidates lines whose *sound* changed
regardless of whether one word moved. Conflating them yields either a re-record of the
whole game for a comma, or a silent overwrite of an approved performance by an unrelated
tooling change. A render is bound to everything that produced it, in the sense of
[a verdict is bound to the content it judged](../../../_laws.md#a-verdict-is-bound-to-its-content):
the acceptance a line earned was earned by those exact bytes under that exact recipe.

## Time is a property of the line

A line that is attached to a fixed-length animation, a facial clip or a cutscene beat has a
duration budget, and the budget is declared in the catalog next to the line, in seconds,
with its basis
([a number carries its unit and its basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).
A word count is the tempting proxy and it is wrong twice. It ignores that a synthesized
delivery of the same words varies with the voice and the emotion asked for, and it ignores
that translation changes length by language, so a source-language word cap is
satisfied by lines that overrun in translation. The measured duration of the rendered take
is the quantity, and the budget applies per locale
(localized-voice-timing-budget).

When a locale render is outside its budget, the order of remedies matters. Re-word first,
because a line that needs to be shorter in a language usually has a shorter true
phrasing. Speeding up a synthesized voice is a legitimate small correction and a bad large
one: it changes the performance, and the audible artifacts appear exactly on the lines the
player is meant to listen to. Stretching the animation is a production decision with its
own owner, not a pipeline reflex. This is the audio face of the same argument the media
craft makes about delivery-rate budgeting, and the two should agree on the number.

## A voice is a ledger row

A cast of synthesized voices is a set of assets with an owner, and the ledger that records
them answers four questions per voice: which role it plays, which voice asset it is, which
model generation it was made under, and, if it was cloned from a person, the recorded
consent of that person for this use (cast-ledger-with-consent). The rule is a gate: no line
renders against a voice with no ledger row. Clone consent is a precondition of the
pipeline, not a feature of it; a voice cloned without documented agreement is not a
technical debt to be repaid later, it is a line the game cannot legally ship, and every
render made against it is a render made for nothing.

Consent has a second axis that teams miss. A cloned voice inherits the terms of the
recording it was conditioned on. A clone made from a clip generated by another service, or
lifted from a video, binds that source's terms to every line the clone produces, however
permissive the synthesis model's own terms are. The ledger therefore records the reference
material and its terms, not only the person's agreement. Providers increasingly enforce
part of this themselves (own-voice verification, restrictions on cloning another person),
which narrows what a studio can do and does not remove the studio's duty to record what it
did.

## A model upgrade is a re-cast event

The naive reading of a speech-model release is a version bump: switch the identifier,
re-render, ship the better voices. It fails because a voice is not portable across model
generations. A clone made under one generation may need retraining under the next to sound
right, a clone type that one generation did not support may exist in the next (or the
reverse), and a new generation's improvements in expressiveness are improvements the
existing cast was never accepted against. A vendor's claim that the new model is better is
an input to a decision
(the same stance the provider-auditing subject takes toward every capability claim), and
the decision is per voice: render the same fixed reference lines under the old and new
model, judge them blind, and accept voice by voice (re-cast-gate). Voices that fail stay on
the older model, which is possible only because the catalog records the model per line and
not per game.

Two limits keep this honest. A pin has a lifetime, because providers retire model
identifiers, so a voice held on an old model is a scheduled cost with a date, and the
baked audio for it should be in the studio's own custody before that date. And the gate
never grades itself: the audition set, the blind ordering and the accept decision belong to
people or a grader that is not the render pipeline
([no gate self-certifies](../../../_laws.md#no-gate-self-certifies)).

## Failure modes of the naive reading

- **One class for all speech.** The game is declared "runtime voiced", and story beats
  inherit a latency budget and lose their offline acceptance.
- **Silence as the late-stream fallback.** The first slow network turns an NPC into a
  mute.
- **Filename identity.** Lines are found by text or by path; a rewrite orphans every
  recording, and nobody can say which lines are stale.
- **The word cap as a timing constraint.** The budget passes in the source language and
  fails in three others, on the animation, at ship.
- **The unrecorded clone.** A voice exists, a person did once agree to something, and
  neither fact is in the catalog when a legal question arrives.
- **The version-bump re-render.** Every approved performance is replaced overnight by
  renders nobody listened to.
- **The declared-but-unserved modality.** A pipeline names speech as a kind it produces
  while no provider actually serves it, and downstream steps report a voiced deliverable
  that is text. Declaring an input is not consuming it
  ([declaring an input is not consuming it](../../../_laws.md#declaring-an-input-is-not-consuming-it)).

## What a claim about latency is

A provider's published latency figure is a vendor measurement of a specific stage, usually
model inference under favourable conditions, and it excludes the application and network
time a player actually experiences. Two documents from one vendor can state different
numbers for the same variant, and a release announcement can state a third. None of these
is a fact about your game until measured on your target network and hardware, from the
moment the text is ready to the first audible sample, at the median *and* at the tail. Until
then the number is a lead that motivates a benchmark; it does not set a budget, and the
budget in the catalog is derived from the game's own tolerance for silence.
