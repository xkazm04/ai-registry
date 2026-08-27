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

## When not to use it

A call with a single reference class keeps the one-sentence labeling rule;
a map of one row is ceremony. And the map assigns authority — it does not
create capability: a model that cannot hold four identities does not start
holding them because the prompt is well-organized. The map removes the
failure the *prompt* was causing; what remains is the model's ceiling, which
is measured, not prompted away.
