---
layer: technique
type: technique
subject: motion
technique: continuity-across-change
status: forged
laws:
  - identity-survives-reuse
shared_with: []
use_when: [a state change is rendered by swapping one element for another, a pending marker and the result it becomes are separate components, deciding whether an update animates the whole surface or only what changed, an update flickers at the moment the reader engages]
---

# Continuity across change

Most of a motion system's attention goes to entrances, and most of a product's
motion is not entrances. A reader sees a surface arrive once and then watches it
**change** for the rest of the session: a value updates, a region folds, a
pending marker becomes the answer it was waiting for, an item moves to a
different place in the same list. Those are the transition class, and the budget
is better spent there than on the greeting. An entrance is seen once, by someone
who has not started reading. A change happens while they are reading, and a
change rendered badly costs them their place at the moment they were about to
act.

## A change rendered as a swap is a discontinuity

The default shape of a change in a component-structured interface is a swap: a
condition flips, one element leaves, another arrives. It is what a conditional
render produces for free, and it is almost always the wrong picture, because as
far as the engine is concerned the two elements have nothing to do with each
other. One is removed and one is inserted; whatever motion each carries runs
independently — a fade out crossing a fade in, or no motion at all and a blink.

The reader does not see one thing becoming another thing. They see something
disappear and something else appear near it, and they have to assemble those two
events into a change themselves. That assembly is precisely the work motion
exists to do for them, and it is most expensive exactly where swaps are most
common: a result arriving after a wait, which is the instant the reader's
attention is highest and their next action is closest.

## One identity, held by one element at a time

The mechanic is to stop describing the change as two elements and start
describing it as one. Give the before and the after the **same animation
identity**, and the engine matches them, measures both, and tweens a single
object from where it was to where it now is. The waiting marker grows into the
settled answer. The count in an expanded header travels to its place on the
collapsed rail. An item whose slot changed glides to the new one instead of
vanishing from the old.

Three rules make an identity work, and each is
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse) applied
to a gesture rather than to a record:

- **Exactly one element holds an identity at a time.** Two simultaneous holders
  is the failure that reads as a bug in the engine: it matches one pair and the
  loser jumps. Where the identity names a slot in a sequence, it advances with
  the sequence, so the marker waiting for the next entry and the entry that
  lands name the same slot and never coexist.
- **The identity belongs to the thing, not to its position.** An identity minted
  from an index or a slot number ties the gesture to a place in a list, so a
  reorder glides the wrong object into the right position — the positional-key
  defect arriving one layer up, in the animation instead of in the data.
- **One identity per moving thing, never one per candidate destination.** The
  inverse mistake, and the more common one: minting a distinct identity for every
  place the object could land produces a separate element at each location, each
  of them correctly animating nothing, and the glide that was the entire point
  never happens.

## Continuity of the picture is not continuity of the element

Worth stating flatly, because the mechanic above is easy to oversell: **a matched
pair is still two elements.** The engine animates the picture; it does not move
the node. Everything the platform attaches to the element itself — keyboard
focus, a selection inside it, the scroll position it anchors, an uncommitted
edit, an assistive technology's cursor — belongs to the element that left, and it
is discarded when the swap commits, however continuous the tween looked.

So the order of preference is not "animate the change". It is:

1. **Do not unmount.** Keep the element and animate the property that changed.
   This is the only option that preserves interaction state, and it is the one to
   insist on wherever the reader may be typing into the thing, reading from it,
   or about to press it. A region that collapses stays mounted and animates its
   width; it is not replaced by a narrower region.
2. **If two elements must genuinely exist, give them one identity.** The reading
   is continuous even though the element is not — right for a marker becoming a
   result, an indicator moving between positions, a value travelling between two
   layouts, none of which hold state the reader would miss.
3. **If neither is possible, make the swap short and plain.** A cross-fade
   between two things the reader cannot match is not continuity, it is two
   gestures overlapping. An instant switch is more honest and reads as less of a
   defect.

The distinction decides the case that motivates the technique. If the pending
element and the settled one are the *same* element, the reader keeps their place
and the platform keeps their focus. If they are two elements sharing an identity,
the reader keeps their place and the platform does not — acceptable for a marker,
unacceptable for anything the reader was interacting with.

## Animate the difference, not the surface

The second half of spending the budget on change: when an update rewrites part of
a collection, the gesture belongs to **the members that changed**, not to
everything that happened to re-render. A surface that animates every row on every
update has converted an edit into a reload, and a large update then reads as a
queue draining rather than as an answer landing — the specific way a
well-intentioned cascade makes a product feel slower than the same product with
no motion at all.

The instrument is a delta computed over the data by identity, never over what the
view re-rendered: which members are new, which were rewritten in place, which are
untouched. The three get different answers. A new member arrives — the semantics
of that cascade belong to the arrival doctrine and its guard mechanics to
[one-shot-guarding](./one-shot-guarding.md). A rewritten member marks itself
where it already sits, without moving. An untouched member does nothing at all,
including not re-entering because a neighbour changed. The rule worth holding
even when the delta costs something to compute: **the number of things that move
is the size of the change, never the size of the surface.**

A changed member's mark is temporary by construction. It says *this just
changed*, which stops being true shortly afterwards, so it clears itself — a mark
that persists has become a permanent annotation nobody asked for, and a mark that
survives into the next render is a cascade waiting to replay. That clearing
window is the short-lived arrived-set in
[one-shot-guarding](./one-shot-guarding.md), read from this side.

## What a matched change costs, and its reduced form

A matched identity is not free. The engine measures both elements' geometry and
runs a layout-aware tween — exactly the geometry read inside a frame path that
[performance-discipline](./performance-discipline.md) warns about, paid here
deliberately and briefly for one gesture rather than accidentally and forever
inside a loop. Budget it as a transition: enough duration to preserve continuity
of place, per [taste-budgets](./taste-budgets.md), and no more. It is also one of
the few gestures whose cost scales with how much of the layout moved, so a
matched change spanning a whole column is a different proposition from one
spanning a marker.

Its reduced form is the part most often gotten wrong: **withdraw the identity; do
not set its duration to zero.** A matched tween with no duration is still a
match — it still measures, still commits a computed position, still pays the
layout work — while removing the only thing the match was for. Dropping the
identity turns the change back into an ordinary swap, which is what a reader who
asked for less motion should get: the new state, immediately, in place. For the
mounted-element form the reduction is the same shape one level down: the property
still changes, the travel does not.

## Where this does not apply

A change the reader caused and can see resolve immediately — a toggle, a press, a
selection — is feedback, not transition, and owes immediacy rather than
continuity; matching it buys nothing and delays the answer to a question the user
just asked. And a surface whose entire content is replaced has nothing to be
continuous *with*: matching an unrelated pair across that boundary produces a
cross-fade of two strangers, which is the discontinuity this technique exists to
remove, wearing a smoother curve.
