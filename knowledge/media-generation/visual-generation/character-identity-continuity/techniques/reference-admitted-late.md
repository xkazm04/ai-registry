---
layer: technique
type: technique
subject: character-identity-continuity
technique: reference-admitted-late
status: forged
laws: [style-is-restated-not-remembered, unmeasured-is-not-pass]
shared_with: []
use_when: [a character reference is overriding the requested camera or staging, every shot in a batch comes back looking like the reference image, choosing how strongly to condition on a character reference, a reference-conditioned clip opens on the reference and drifts to the briefed shot]
---

# Admitting the reference late

A character reference supplied at full authority for the whole of generation
does not condition the shot — it **replaces** it. The briefed camera position
is discarded, the briefed staging is discarded, and the output is the
reference image again. This technique is the timing discipline that gets the
identity without losing the shot.

## Why timing and not strength

Generation settles a frame in a coarse-to-fine order: where things are, how
they are arranged and how the camera sees them are decided in the early part
of the process; surface, texture and the fine structure of a face are decided
late. A reference present from the first moment is therefore competing with
the brief over *composition*, which is not what it was supplied for — and it
wins, because a concrete image outweighs a sentence.

Withhold it. Let the brief have the frame to itself while composition is being
decided, then admit the reference for the remainder, where identity is settled
and the staging is already fixed. The reference then asserts a face into a
shot the brief chose, which is the behaviour everyone assumed they were
buying.

**The dial is when, not how much.** Attenuating a reference's strength
uniformly across generation weakens it where it is needed as much as where it
is harmful; moving its entry point trades only against the thing that competes
with it.

## The operating window has a cost at each end

Admitting the reference too late gives the brief unchallenged control of the
frame and leaves too little of the process for identity to assert:
composition is excellent and the face drifts toward the loose end of the
scale. Too early is the replacement failure. The window between is real and
worth locating once per model — a small sweep of entry points, scored on both
axes, is enough to find it and it does not need repeating per shot.

Report the sweep rather than the winner alone. An entry point chosen from two
samples is a guess with a decimal place, and the shape of the trade — how fast
identity degrades as the reference is admitted later — is what tells the next
person whether the window is wide or a knife edge.

## Isolate the fix before crediting it

Two changes usually arrive together: cropping the reference down to the
character alone, and admitting it late. They do different jobs and only one of
them is this technique.

- **Cropping** the reference to the subject on a neutral field removes the
  background, the body pose and the framing that the model was copying. It
  reduces *what* gets replaced.
- **Timing** is what returns control of the camera.

Test them separately at least once. A cropped reference at full authority
still overrides the requested camera — the crop only narrows what is copied,
not who decides the frame. Crediting timing to the crop leads the next project
to crop harder and stay stuck.

## In motion the failure relocates rather than disappearing

Where a still is replaced entirely, a clip conditioned the same way tends to
**open** on the reference and escape to its briefed shot part-way through.
Every clip in a sequence then begins on the same picture — a slideshow at clip
scale, and one that a per-clip review passes because each clip individually
ends up somewhere reasonable.

- **Measure the clip head separately from its body.** A difference score
  between the first frames of two clips that were briefed as different setups
  is the alarm; comparing their middles hides it.
- **Trimming clip heads is the cheap mitigation** and a trailer edit trims
  them anyway — but it is a workaround, not the technique. Where the motion
  generator exposes the same timing control the still generator does, use it.
- **Restating the contract still applies.** Per
  [style-is-restated-not-remembered](../../../_laws.md#style-is-restated-not-remembered),
  a reference is not a memory: the character block travels with every call
  whatever the entry point is set to.

## Decision rules

- When output ignores the requested camera and returns the reference, move the
  entry point later before touching prompt wording — the prompt is not being
  outvoted on content, it is being outvoted on composition.
- When identity holds but staging is monotonous across a batch, suspect the
  entry point is early even if no single shot looks like a copy.
- When identity drifts and staging is good, move the entry point earlier
  before reaching for a stronger reference or a trained model.
- When both axes are good, freeze the entry point with the model — it is a
  property of that generator's schedule and does not transfer.
- When a sequence must hold identity across many shots rather than three, this
  technique is necessary and not sufficient; the reference *set* becomes the
  question, and generated-shot-sourcing owns it.

## When not to use it

Where the intent genuinely is to reproduce a supplied image with small
variations — a turnaround sheet, a wardrobe variant, a plate to be nudged —
full-authority conditioning is correct and this technique removes control you
wanted. It applies when the reference is meant to travel *into a shot somebody
else staged*, which is the trailer and sequence case, not the plate case.
