---
layer: technique
type: technique
subject: production-pipeline-phasing
technique: approval-reads-forward
status: forged
laws: [cost-per-usable-output, edit-do-not-regenerate]
shared_with: []
use_when: [approving a location plate, character sheet, style contract or any other asset that later requests will be conditioned on, a later beat depends on where a light source or a landmark sits, deciding whether a shared asset is ready to graduate, a payoff shot cannot be made from an upstream artifact every reviewer already approved]
---

# Approval reads forward

Phase order settles which decisions are made before which money is spent, and
graduation gates an artifact's sign-off. Both read **backward**: the artifact
is checked against the brief that asked for it, and the question is whether
what was requested arrived. For most artifacts that is the whole check, and
this technique is not about them.

It is about the **shared upstream asset** — the location plate, the character
sheet, the master reference, the style contract, the schematic — that every
later request is conditioned on. A shot's brief is spent once. A plate's
geometry is inherited by every shot standing on it, and nothing downstream can
move it: a beat that needs the light to come from somewhere the plate did not
put it has two outcomes, and neither is a re-brief of that beat. Either the
beat is rendered wrong, or the plate is re-minted and every accepted shot
conditioned on it is silently a different world — which is
[edit-do-not-regenerate](../../../_laws.md#edit-do-not-regenerate) arriving at
the most expensive possible moment, because a shared asset's regeneration
voids not one review but every review downstream of it.

So the approval of a shared asset carries an obligation the approval of a shot
does not:

> **Before a shared asset graduates, walk the beats that will be conditioned
> on it and name, for each, what it needs from the asset that the beat's own
> prompt cannot supply. The asset is approved against that list, not only
> against its own brief.**

## What the forward list is looking for

Anything the asset *fixes* that a later request can only inherit. Four recur:

- **Where the light comes from.** A shadow, a rim, a silhouette, a reflection
  or a cast pattern in a later beat is a consequence of a source position the
  plate committed to. The commonest instance has the shape of a riddle only in
  hindsight: a payoff whose whole image is a figure's shadow thrown onto a far
  wall, over a plate whose one practical sits between the figure and the lens —
  so the shadow the beat is built on falls toward the camera, where nothing can
  see it. Moving the practical to the floor is one element and five seconds of
  work *at the plate*; it is a re-mint and a scene's worth of invalidated shots
  four stages later.
- **Where things stand, and how big.** A door a character must exit through, a
  wall a projection must land on, a window the light must arrive through, a
  landmark an approach is measured against.
- **Which way the space faces.** Screen direction across a sequence is settled
  by the plate; re-deciding it per shot is paid at the cut.
- **What a subject's reference holds still.** A wardrobe, a prop, a scar that a
  later beat needs *changed* needs a second reference, and the beat that needs
  it is the only place that is known.

## Procedure

1. **List the beats that will stand on this asset.** The shot list, the beat
   table, whatever the pipeline already derives durations from — it exists, or
   the asset is being approved ahead of its own phase order.
2. **One line per beat: what does it need from the asset that its own prompt
   cannot supply?** Most beats answer *nothing*, and that is the point. The
   list is short, it is cheap to write, and the two or three exceptions on it
   are the entire reason the approval is happening at this stage rather than at
   the one where the money is.
3. **Settle each exception in the asset, before approval.** The fix is almost
   always one element moved, not a re-conception — which is exactly why it is
   worth catching here and ruinous to catch later.
4. **Record the list beside the asset.** It is the asset's forward contract.
   When the script changes, the list answers whether the plate still covers the
   new beat, instead of the question being silently re-opened with no record
   that it was ever closed.

## Decision rules

- When an artifact will condition more than one later request, its approval
  reads forward. When it will condition exactly one, it does not — that
  request's own brief is the whole check.
- When a downstream need and the asset's own brief disagree, **the need
  wins.** The brief is one request's opinion; the need is a dependency.
- When the forward list cannot be written because the downstream beats are not
  settled, **the asset is not ready to graduate.** Running the phase order out
  of order is usually invisible until a render fails; this is the one place it
  is cheap to see.
- When a requirement reaches the asset *after* approval, price it as a re-mint
  with its downstream invalidation, not as an amendment. Per
  [cost-per-usable-output](../../../_laws.md#cost-per-usable-output), the cost
  of the re-mint is every usable output that was conditioned on the old asset,
  not the one render that replaces it.

## Failure modes

- **The approved-and-wrong plate.** Every reviewer liked it, it answered its
  brief exactly, and the last shot cannot be made from it. Nothing in a
  backward check can catch this, because nothing was wrong with the request.
- **The late re-mint.** The requirement surfaces at the payoff, the asset is
  re-minted, and the accepted shots conditioned on the old one now disagree
  with the new one about a world nobody re-approved.
- **The prompt patch.** The downstream brief tries to describe its way out of
  the geometry — a shadow named onto a wall the light cannot reach it — and the
  model, asked for an impossible lighting, returns an incoherent one. The
  symptom reads as a weak prompt and invites more prose, which makes it worse.
- **The forward check nobody wrote down.** It was done once, in somebody's
  head, and the next revision re-opened it for free.

## When not to use this

A single-shot piece has no downstream, and the forward list is a list of
nothing. And where shared assets are genuinely free to re-mint — nothing
accepted is conditioned on them yet, the phase is still diverging — the cheap
re-mint already buys what the check would, and writing the list is work the
pipeline does not owe until the first shot is accepted against the asset.
