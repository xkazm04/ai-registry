---
layer: golden-path
type: golden-path
subject: visual-style-locking
status: forged
use_when: [generating many images that must read as one publication, designing a style or theme system for a generation pipeline, diagnosing look drift across a batch, deciding what a project's visual identity record should contain]
techniques:
  - style-block-restated-every-call
  - approved-reference-sheet
  - style-onboarding-from-sample
  - draft-proofing-locked-ratchet
  - rejections-as-negative-evidence
  - consistency-control-arm
---

# Visual style locking

One generated image can look like anything. Forty generated images that must
look like they came from one publication is a different problem entirely, and
it is the problem this subject owns. A generative image model has no memory
between calls; every call reinvents the world from the prompt in front of it.
Consistency therefore cannot be *remembered* by the system — it must be
*carried*, explicitly, into every call, by an artifact built for the purpose.
The naive readings — "add the style words to each prompt", "attach a
reference image and the model will match it" — each fail in a measurable,
characteristic way, and the discipline of this subject is the set of
structures that close those failures.

## Style is a property of the project, not of the shot

The first structural decision is where style *lives*. A generation prompt is
two blocks with different lifetimes: a **style block** whose lifetime is the
whole project — technique, palette, element vocabulary, surface finish — and
an **action block** whose lifetime is one shot: what happens in this frame.
The failure this split prevents is the one every practitioner reports first:
generate shot by shot from free prose and each shot invents its own look,
because the look was never a separate object that could be held constant.

Filing style inside any one production step is the same mistake in
architectural clothing. If the frame step owns the style, the motion step
re-derives it and drifts; if each template carries its own copy, the copies
diverge. Style sits *above* the steps, as a record both steps read.

## The style block is an artifact, not a string

A style described as a vibe — "clean, modern, editorial" — drifts, because
every call re-interprets the adjectives. A style that survives a large batch
is written as an **attribute grammar**: a small fixed set of slots, each in
plain language the owner can edit, compiled to model syntax only at
generation time. The load-bearing slots:

- **Technique** — the rendering idiom (the kind of drawing, not a mood).
- **Subject treatment** — how this style depicts things, independent of what
  is depicted.
- **Palette with roles** — a small set of named colors, each *assigned a
  job*: ground, objects, accent. An unassigned palette looks fine on one
  image and shreds consistency across a project, because the model is free
  to re-cast which color carries meaning on every frame.
- **Finish** — surface qualities: grain, shadow behavior, margins, the
  presence or absence of gradients.

The plain-language form is not a concession to non-technical users; it is
what makes a style *ownable*. A style the owner can read and edit is a
reusable theme; a model-syntax incantation is a one-off that dies with the
person who wrote it.

## Ratification: a style is approved, not typed

The block alone is words. A style becomes trustworthy only when renders made
from it have been **reviewed and approved by a human**, and the approved
renders — the reference sheet — become part of the artifact. This is a
lifecycle, and it deserves the same rigor as any state machine that gates
production: a style is *drafted* (still words), then *proofed* (renders
exist, awaiting judgment), then *locked* (every render decided, at least one
approved). Only a locked style may anchor production, and the lock is a
one-way ratchet — a style that dozens of frames were generated against must
never quietly change underneath them; evolution happens by duplicating into
a new draft, never by unlocking. Skipping the approval step is the single
reliable way to get forty frames that do not match: the gate is the point of
the whole surface, not ceremony around it.

## Both channels, every call — the central empirical fact

The locked artifact conditions generation through **two channels at once**:
the textual style block *and* the approved reference images. The central
empirical fact of this subject is that **neither channel is sufficient
alone**, and the failure of each is asymmetric:

- **Text without references** holds the nameable attributes — a palette of
  named colors survives on words alone — but loses everything language
  cannot pin down: the simplicity of shapes, line character, the amount of
  interior detail. The block does most of the work on color; references do
  the work on everything color cannot describe.
- **References without text** drift measurably *within a single batch*, and
  even within a single clip when a still is handed to a motion model. There
  is no short form; no call may opt out of the style half of its prompt.
  This is the [style-is-restated-not-remembered](../../_laws.md#style-is-restated-not-remembered)
  law, and it is a law because teams rediscover it by shipping the drift.

A third hazard sits in the reference channel itself: an attached image is
**ambiguous by default**. The model cannot know whether it is being shown a
subject to redraw or a look to imitate, and it guesses "subject" — so an
unlabeled style reference returns the previous frame's content in the new
frame's style, exactly backwards. The instruction must say what the images
are *for* before they appear.

## Consistency is measured, not felt

"These look consistent to me" is an impression, and impressions ratify drift
one flattering sample at a time. A style system makes claims — "conditioning
on the sheet holds the look" — and claims earn measurement. The honest
instrument is a **controlled comparison**: an anchor render, a conditioned
render of a *different* subject, and an unconditioned control of that same
subject, scored by an independent judge (a vision model reading through one
schema, or embedding-space similarity — self-supervised image embeddings
separate style better than text-aligned ones, which reward shared content).
The control arm is what distinguishes "the references locked the style" from
"the block was already specific enough on its own" — a genuinely plausible
alternative whenever the block names exact colors. One production pipeline
that ran this comparison measured conditioning roughly doubling palette
retention over its control; the same run showed the subtler half of the
story, that references carried simplicity and shape discipline more than
color. Per [unmeasured-is-not-pass](../../_laws.md#unmeasured-is-not-pass), a
consistency claim without this measurement is not a pass — it is unmeasured.

## Failure modes the standard exists to prevent

- **The vibe style** — mood words instead of an attribute grammar; every
  call re-interprets, every frame differs.
- **The prompt-suffix style** — style as a string pasted into prompts, with
  no lifecycle, no approval, and copies that drift apart across steps.
- **Reference-only conditioning** — attach images, drop the text, watch the
  look transform mid-batch.
- **The unlabeled reference** — style images read as content; subjects clone
  instead of styles locking.
- **The unassigned palette** — three colors with no roles, re-cast on every
  frame.
- **The silent stand-in** — a project whose style record is missing rendered
  in "some locked style", often the account's most recently touched one; on
  any account with two styles this is wrong for at least one project,
  always. A missing style is a named state to surface, never a gap to paper
  over.
- **The mutable lock** — a ratified style edited in place, voiding every
  approval and every frame generated against it; cousin to
  [edit-do-not-regenerate](../../_laws.md#edit-do-not-regenerate).
- **Discarded negative evidence** — rejected renders deleted, so the sheet
  forgets what the style is *not* and the next proofing round repeats the
  same misses.

## The techniques

- [style-block-restated-every-call](./techniques/style-block-restated-every-call.md) —
  the full style contract on every generation, every hop, compiled from the
  structured record; references labeled for what they are.
- [approved-reference-sheet](./techniques/approved-reference-sheet.md) — the
  sheet of ratified renders as the image half of conditioning: what goes on
  it, what the reference window caps, how many references to actually send.
- [style-onboarding-from-sample](./techniques/style-onboarding-from-sample.md) —
  capturing a look from an existing image into the editable attribute
  grammar; a style is captured and ratified, not composed from nothing.
- [draft-proofing-locked-ratchet](./techniques/draft-proofing-locked-ratchet.md) —
  the lifecycle: derived status, the lock gate, the one-way ratchet, one
  resolution point per project, and honest miss states.
- [rejections-as-negative-evidence](./techniques/rejections-as-negative-evidence.md) —
  rejected proofs kept as the record of what the style is not; never sent as
  references, never counted against the window.
- [consistency-control-arm](./techniques/consistency-control-arm.md) — the
  anchor/conditioned/control experiment and the judging discipline that
  turns "it looks consistent" into a number.
