---
layer: technique
type: technique
subject: native-shell-integration
technique: query-transparent-overlay
status: forged
laws: [failure-not-empty-success, absent-guard-is-loud]
shared_with: []
use_when: [a point-under-cursor query returns the product's own overlay instead of the application underneath, an element picker works with the overlay hidden and returns nothing with it shown, deciding between making a surface click-through and making it invisible to the accessibility layer, a global input hook installed to work around an overlay leaves the user's mouse button stuck, hiding and reshowing a surface around each query produces visible flicker]
---

# Query-transparent overlay

A surface the product places over another application can be transparent in
three independent senses, and they are granted by three different mechanisms:

1. **Visually** — the user sees through it. A pixel format and a paint.
2. **To input** — clicks and pointer events reach whatever is underneath. A
   hit-testing flag.
3. **To query** — the host's structural interfaces, the ones that answer "what
   element is at this point" and "what is inside this window", do not return
   it. A property the accessibility layer's own traversal reads.

A surface that only *annotates* needs the first two, and that is the case
[non-stealing-overlay](./non-stealing-overlay.md) is written for: its teardown
order, its deliberately omitted focus call and its idempotent construction path
are not restated here. Its judgement — a teardown is judged by what remains
**clickable**, not by what remains visible — is a two-item enumeration, and
this technique is the third item. A surface that *reads* the application
underneath needs query transparency, and neither of the first two provides any
of it. An overlay can be perfectly invisible, perfectly click-through, and
still be the only thing the product's own picker can see.

## The instrument is topmost by construction, and the query is honest about it

The host's point-under-cursor interface is global and returns the **topmost**
element at that point. An always-on-top surface is topmost at every point it
covers — that is the definition of the thing the product built. So the query
returns the product's own surface, at every coordinate, every time, and it
returns it with no error, because nothing went wrong: the interface answered
the question it was asked, correctly.

The fix that suggests itself first makes the failure harder to read rather than
fixing it. Suppress the *overlay's own* structural provider so it has nothing to
report, and the query still resolves to the overlay and now returns an **empty
node** — a well-formed answer with no children and no error, indistinguishable
at the call site from an application that genuinely exposes nothing
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)). The
product has converted a wrong answer into an empty one, which is the wrong
direction: the wrong answer at least named its cause.

The correct move is one level out. The accessibility layer's traversal reads a
per-surface property whose meaning is *I am not part of this tree*. Set it, and
the same documented, supported query walks past the product's surface to the
application beneath, unchanged — no hooks, no synthesized input, no private
entry points, no per-query bracket. The whole cost is one property set once.

**Set it in the surface's single construction path**, beside the flags that make
it always-on-top and click-through, never at the show site. A surface built
through a second entry point without the property fails silently, and the
symptom — the picker keeps returning the product — arrives at a call site that
has no way to name its cause
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)).

## The two rejected rungs, and why each is worth writing down

Both alternatives look reasonable at design time and are expensive to abandon
later, which is why the reasons belong in the standard rather than in a commit
message.

**Input transparency plus a global low-level input hook.** Make the surface
click-through and stop querying under it at all: observe the pointer globally,
synthesize the events the product needs, and let them land wherever they land.
It works on a developer's machine and it fails at the worst possible moment.
Host-owned surfaces at a higher privilege level — the elevation prompt, the
secure attention surface — silence a global hook while they are up. If the hook
goes quiet **while holding a synthesized button down**, the release event is
never sent and the user's real mouse button is stuck down: the machine is
dragging, across every application, and the user's only recourse is to click
something to break it. Secondly, global hooks are a shared, ordered resource.
Other installed tools put their own in the same chain, and the product ends up
arbitrating behaviour with software it has never heard of, on machines it cannot
reproduce.

**Cloaking the surface at the compositor for the duration of one query.** Ask
the compositor to hide the surface, query, unhide. The flaw is a timing mismatch
that no amount of care removes: **the call is issued synchronously and the
effect is scheduled by someone else.** The composited frame catches up one or
two frames later, so the bracket costs a visible flash on a path that runs per
pointer move — one to two frames at ordinary refresh rates, so roughly 16-33 ms
of flicker on every move of the cursor. The general shape is worth carrying past
this case: *a request whose effect is scheduled by another process cannot be
used as a bracket around a synchronous operation.*

## Verify from outside the product, the way the neighbour verifies by clicking

Query transparency is not observable from the code that sets it — the property
returns success whether or not the traversal honours it. So the acceptance test
is external and cheap: with the surface shown, walk the tree from the *host's
own* inspection tool and confirm the product's surface does not appear in it,
and that the element under the cursor is the one a user would name. That is the
query-axis equivalent of judging a teardown by clicking where the surface was.
A screenshot proves nothing about either axis.

## Decision rules

- Enumerate all three transparencies for every surface placed over another
  application; a reader needs the third, an annotator does not.
- Prefer a property the queried layer *itself* reads over any mechanism that
  brackets, hooks or intercepts the query.
- Never suppress only the surface's own provider: an empty node is a worse
  answer than a wrong one.
- Set the exclusion in the one construction path, with the other surface flags.
- Reject any per-query bracket whose effect is applied by another process.
- Never hold a synthesized button down across a boundary the product does not
  control.
- Accept the surface only after walking the tree from outside the product.

## When not to use this

- **The surface never reads what is underneath.** Visual and input transparency
  are the whole requirement, and the third property is one more flag to keep
  correct for no benefit.
- **The host offers a scoped query.** Where the structural interface can be
  rooted at a named target rather than at the screen, the topmost-element
  problem does not arise. Prefer the scoped variant wherever it exists; it is
  cheaper and it cannot be defeated by anything the product later puts on
  screen.
- **The product owns the application underneath.** Ask it over the channel that
  already exists. Reading a sibling surface through the accessibility layer is
  an expensive way to avoid an interface.
- **The host exposes no such exclusion property.** Then this is no longer a
  property to set but a capability to reach, and the ordering rule in
  [unexported-capability-ladder](./unexported-capability-ladder.md) applies
  before any workaround is designed — including the two rejected above.
