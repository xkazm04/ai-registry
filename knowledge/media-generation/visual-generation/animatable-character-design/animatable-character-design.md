---
layer: golden-path
type: golden-path
subject: animatable-character-design
status: forged
use_when: [briefing a generated character still that an animation pipeline will drive, designing a product's companion or presenter presence, a round of character concepts came back as interchangeable human portraits, choosing between shortlisted character stills before committing to one]
techniques:
  - default-attractor-rejection
  - form-from-product-language
  - functional-animation-slots
  - animatability-trial
---

# Animatable character design

Some generated images are finished when they are generated. This subject owns
the ones that are not: a single still of a being — a product's companion, a
presence that speaks for an interface, a presenter — that a downstream
animation pipeline will split, rig or drive, and that people will then look at
every day while it blinks, breathes and talks. The still is a **master
asset with a second customer**. The first customer is the eye that judges it
as a picture; the second is the pipeline that has to move it. A still that
satisfies only the first is a poster, and the commonest way to discover that
is after the art has been approved.

Two questions organise the subject, and the naive reading answers neither.
**What is the being made of, and what shape does it take?** And **can the
chosen still actually be driven?** The naive reading — "generate a friendly
assistant character, pick the nicest one" — hands the first question to the
image model and never asks the second.

## The default is an answer nobody chose

Ask a diffusion image model, or a prompt writer in a hurry, to draw "the
assistant" and the answer is overwhelmingly the same: a realistic or painted
human portrait, usually a young woman, softly lit, three-quarter, looking
warmly at camera. It is the attractor of both the training distribution and
the writer's imagination, and it arrives without anyone deciding it.

It is the wrong default for this job on three counts that compound. It has no
relation to the product it is supposed to embody, so it could front any
product and therefore fronts none. It sits squarely where animated faces
fail: viewers forgive a great deal of crudeness in a stylised being and
forgive almost nothing in a near-human face that moves slightly wrong, so a
realistic human locks the execution into the hardest possible bar. And a
convincing human face presenting software carries an honesty cost — a
non-human presence cannot be mistaken for a person, and a near-human one is
designed to be.

The response is not "be more creative". It is to name the default in the
brief as a **banned outcome with its reason**, and to replace the open
question with a field of directions defined by explicit axes. A round that
comes back all-default is evidence about the brief, not about the writers or
the model. default-attractor-rejection holds that procedure.

## The being is derived, not invented

Once the default is off the table, the field is enormous, and an enormous
field produces striking images with no reason to exist. The discipline that
narrows it is derivation: **the being is made out of the product's own visual
language.** A product already has a palette with roles, colours that carry
runtime meaning (the hue of "listening", the hue of "working", the hue of
"something is wrong"), and usually some existing motif of presence — a glow,
a pulse, a mark. Those are the raw material. An owner-supplied reference sets
the bar for finish, and the namesake's attributes — what the product is named
for, what it stands for — survive as **structure**, never as costume.

One rule here is functional rather than aesthetic and is the one most often
missed: **the light belongs to the being.** A being that is lit from outside
— a key light, a rim, a coloured environment — has its colour decided at
generation time, forever. A being whose light is emitted from within, on a
near-black ground, can be tinted at runtime to whatever state the product is
in, because the colour is a property of the being that a shader can move
rather than a property of a scene that only a regeneration can change.
form-from-product-language owns the derivation.

## The brief speaks the pipeline's language as functions

An animation pipeline does not need a mouth. It needs **something that
changes on speech**. It does not need eyes; it needs a focal region that
reads as attention and something in it that can close or dim. Stated as
anatomy — "lips closed, eyes open, hair clear of the face" — those needs
quietly re-import the human default the brief just banned, because anatomy
words are the human default's vocabulary. Stated as functions, they admit an
aperture, a seam, a core, a lantern, a fold — anything that can do the job.

The functional slots are few and specific: one frontal focal region with
something that reads as a gaze and can close or dim; one speaking element,
shown at rest in the still, because a still caught mid-expression is a still
whose rest pose has to be painted by hand; parts separable by clear gaps,
with nothing in front of the focal region, because an occluded region has to
be invented before it can move; a calm upright pose with room around it to
sway; a clean near-black ground; and an aspect and resolution floor the
pipeline can actually use. Each candidate prompt also carries a short
**animation note** — what moves on speech, on blink, on breath, and what the
risk is — so the writer has to imagine the being moving before the image
exists. functional-animation-slots owns the wording.

## Beauty and drivability are separate verdicts

A shortlist of beautiful stills is not a shortlist of usable ones. Whether a
still can be driven is an empirical fact about the still and the pipeline,
and it is cheap to find out before commitment and expensive to find out after.
The trial is the cheapest real drive: split it into layers, run the face and
landmark detection a neural driver depends on, push a few seconds of speech
through it. Each result routes as well as filters. A non-human form that
every neural face detector rejects is not undrivable — it is a form for a
parametric rig, which moves separable parts by rule and never needs to find a
face — or for a hybrid that plays voice-predicted motion through that rig.
And "drivable" is still not "moves well": the last verdict is the owner's,
on the same lines rendered through every surviving route, with what each
costs the product to run beside it. The trial therefore decides **the route
as much as the art**, and per
[unmeasured-is-not-pass](../../_laws.md#unmeasured-is-not-pass) a still that
was never driven is not a drivable still. animatability-trial owns the
procedure.

## Where this subject stops

Three neighbours share ground with this one, and the seam with each is a
different line.

image-prompt-composition owns **how** a prompt is compiled: the style,
identity, action and constraint blocks, their order, their budgets, the
negative prompt and the colour-role vocabulary. This subject owns **what the
being is** — its material, its shape, its derivation from the product, and the
functions the pipeline needs from it — and hands those decisions to the
compiler as content. The rule a reader uses: if the question is about a
block's position, length or syntax, it belongs next door; if it is about what
the block should say the being is, it belongs here.

character-identity-continuity owns the same character **across shots** — the
reference channel, its timing, what a reference may show, and the ruler that
measures whether identity held. This subject stops at the master still. The
moment a second image of the being is needed and must be recognisably the
same being, the work crosses the seam; the master still this subject produces
is usually the reference that subject then governs, and the rest-state rules
here (speaking element at rest, gaze stated, even internal light) are chosen
partly so that hand-off is clean.

visual-style-locking owns **a look held across a batch** — the style record,
the reference sheet, the ratchet. A companion's look is often a candidate for
locking once it is chosen, and the field of directions this subject briefs is
the opposite act: deliberately unlocked exploration before a style exists.
Explore here; lock there.

Beyond the bundle, the runtime that takes the chosen still and animates it —
the rig, the driver, the state tinting, the frame budget — is owned by the
runtime animation discipline in the software-engineering corpus; this subject
ends where that one's inputs begin.

## Failure modes the standard exists to prevent

- **The unchosen portrait** — a round of realistic or painted humans nobody
  asked for, judged on which human is nicest, because the brief never named
  the default.
- **The mascot in costume** — a stock character wearing the namesake's
  emblem, where the brand is a prop on a body rather than the structure of
  the being.
- **The lit being** — colour cast from outside, so every runtime state needs
  a regeneration instead of a tint.
- **Anatomy smuggling** — functional needs written as body parts, and the
  human default returning through the constraint list.
- **The mid-word still** — a speaking element captured open or smiling, so
  the rest pose has to be painted before anything can move.
- **The occluded focal region** — a hand, a strand, a fold in front of the
  gaze, so the layer split has to hallucinate what is behind it.
- **The beautiful dead end** — a still approved as art and discovered
  undrivable by the pipeline it was made for.
- **The look kept, the speech dropped** — a driver that renders the being
  intact and never moves its speaking element, passed because nothing
  crashed and the character still looks right.
- **The detector verdict taken as final** — a non-human form rejected because
  a face detector could not find a face, when a parametric rig never needed
  one.

## The techniques

- [default-attractor-rejection](./techniques/default-attractor-rejection.md) —
  naming the model's default answer as a banned outcome, briefing a field of
  directions on explicit axes, and reading an all-default round as a brief
  failure.
- [form-from-product-language](./techniques/form-from-product-language.md) —
  deriving material, palette and structure from the product's existing visual
  language, with light owned by the being so state can tint it at runtime.
- [functional-animation-slots](./techniques/functional-animation-slots.md) —
  stating the pipeline's needs as functions rather than anatomy, and making
  every prompt carry an animation note.
- [animatability-trial](./techniques/animatability-trial.md) — the cheapest
  real drive per shortlisted still, run before adoption, deciding the
  animation route as much as the art.
