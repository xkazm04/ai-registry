---
layer: technique
type: technique
subject: image-prompt-composition
technique: reference-role-map
status: forged
laws: [style-is-restated-not-remembered, refusal-is-a-state]
shared_with: []
use_when:
  - a generation call carries more than two or three reference attachments
  - identities blend, styles bleed, or dialogue lands on the wrong character in a multi-reference call
  - scaling a shot from one conditioned subject to a cast, props, and a location
  - a crowd or group must render from a single reference
---

# Reference role map

## The concern

The labeling rule for references was written for one attachment class: say
that the images are style references before they appear, or the model reads
them as content. It holds, and it stops scaling the moment a call carries
*heterogeneous* references — two identities, a location, a prop, a style
guide, perhaps a clip. Each attachment is still ambiguous by default, and now
they are ambiguous *about each other*: which face goes with which name, which
image is the room and which is the look, whose voice speaks the line.
Unmapped, the failure is blending — identities average, the style guide's
subject leaks into the scene, dialogue lands on the wrong character — and it
gets worse per attachment, which is exactly backwards from why the references
were added.

The technique is the labeling rule generalized into a prompt block:

> **Every attached reference gets one named role, declared in a map at the
> top of the prompt, and the map says what each asset controls — and
> controls nothing else.**

"Image 1 is Kai and controls only his identity. Image 2 is Ren and controls
only hers. Image 3 is the chamber and controls the set and its lighting.
Image 4 is the style guide and controls line work and palette, never
content." The subjects are then named by their map labels throughout the
beats, so the action clause never re-describes what a reference already
carries. This is what lets conditioning scale from three attachments to
dozens: the marginal reference adds one map line, not one more ambiguity.

## Procedure

1. **One primary job per asset.** An attachment that controls two things
   (this image is the character *and* the mood) is two ambiguities wearing
   one label; split the roles or split the assets.
2. **The map leads the prompt.** Roles are declared before any beat mentions
   a subject, for the same reason style leads — the half that resolves
   ambiguity has to arrive before the ambiguous material does.
3. **Names in the map are the names in the beats.** The beats say the label,
   never a fresh description; a re-description beside a reference is a second
   identity source competing with the first.
4. **Negative scope where bleed is likely.** The map states what an asset
   must NOT influence when the risk is real: a style guide that "controls the
   anime style, not the content"; a choreography clip that "controls blocking
   and pacing, never identity or style". Scoping is most of the value on
   exactly the references that are most useful.
5. **One reference multiplies into a group.** A horde does not need a card
   per member: one member reference plus group language in the beats ("a
   dozen of them, varying in silhouette") lets the model instantiate the
   crowd from the single identity. Individuals who must be tracked by name
   across shots each keep their own card; interchangeable extras share one.

## Decision rules

- When a call carries references of more than one kind, write the map — the
  single-kind labeling sentence stops being sufficient at exactly that
  point.
- When output blends two identities, check the map before the descriptions:
  the usual cause is two references with overlapping authority, not a weak
  prompt.
- When a speaker must be unambiguous, bind the line to the map label ("KAI
  says, quietly: …") and state who stays silent — silence is an assignment
  too.
- When the reference count grows, grow the map and nothing else — beats that
  re-describe mapped subjects are where drift re-enters a well-mapped call.

## The seam between two references belongs to neither

Step 3 forbids the beats from re-describing a mapped asset, and the decision
rules name re-description as where drift re-enters a well-mapped call. That is
right about *attributes* and it has one exception, which shows up on the most
common heterogeneous call there is: a subject reference and a location plate,
merged into one frame.

The map handles this cleanly on paper — image one is the room and controls the
set and its lighting, image two is the subject and controls identity only. But
a subject reference is not a floating identity. It is an image of a subject
*somewhere*, and the conditioning channel carries the whole of it, key light
included ([reference-shows-only-invariants](../../character-identity-continuity/techniques/reference-shows-only-invariants.md)).
So both attachments arrive holding lighting authority, and the map's exclusive
scope cannot actually be granted: telling the subject's card to control
"identity, never lighting" does not remove the light already baked into it.

The result is the composite failure that passes every per-asset check. The room
is the right room, the subject is the right subject, the map is well formed —
and the subject reads as pasted onto the plate rather than standing in it,
because it is still lit by the light of wherever its reference was made.

What is missing is not an attribute of either asset. It is the **relation**
between them, and a map with one row per asset has no row that can hold one:

> **Where two references must merge in one frame, the beats author the
> interaction — how the subject meets the plate's light, its floor, its
> scale, its atmosphere. That is not re-description, because neither
> reference contains it.**

Concretely, and in the described-effect vocabulary the lighting dials already
use: name the plate's own source and put the subject in it — the amber
practical behind them catching the back of the coat, the window throwing the
shadow across the same floor the plate lights, the fog of the room passing in
front of them at depth. The test is the same one a compositor uses: **the
subject must pick up something that already exists in the plate.** A subject
that shares no light, no contact and no atmosphere with its background has
been placed in front of it, not in it.

Two constraints keep this from reopening the door step 3 closed:

- **Author the relation, never the endpoints.** "Lit by the lamp behind him"
  is the seam; "in his black coat, under the lamp behind him" has smuggled a
  re-description of the identity card back in and re-earned the drift.
- **The plate is the authority in the exchange.** The interaction is written
  from what the plate already contains, so the map's grant of set-and-lighting
  to the location is strengthened by the clause rather than contradicted — the
  subject bends to the room's light, the room is never re-lit to suit the
  subject's card.

A frame with no subject needs none of this: an empty plate passes through as
itself, and there is no seam to author.

## When not to use it

A call with a single reference class keeps the one-sentence labeling rule;
a map of one row is ceremony. And the map assigns authority — it does not
create capability: a model that cannot hold four identities does not start
holding them because the prompt is well-organized. The map removes the
failure the *prompt* was causing; what remains is the model's ceiling, which
is measured, not prompted away.
