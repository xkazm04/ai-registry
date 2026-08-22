---
layer: technique
type: technique
subject: agent-addressable-ui
technique: call-site-vs-implementation-resolution
status: forged
laws: [failure-not-empty-success]
shared_with: []
use_when: [every click resolves to the same shared primitive, deciding which ancestor is the useful source location, an agent edited the design system when one screen was wrong]
---

# Call site versus implementation resolution

The element under the cursor carries a stamp, the stamp is correct, and handing
it over is close to useless. This is the finding that separates a working
addressability tool from a demo, and it is not obvious until the first time an
agent, given a technically accurate location, edits the shared button component
because that is where the location pointed.

The innermost stamped element is almost always inside a shared primitive: the
design-system control, the layout box, the icon wrapper, the typography
component. Its source is a file that renders two hundred screens, and it is
virtually never the file the person wanted to change. The useful answer is one
or more rungs out — the **call site**, where the product composed that primitive
into this screen.

## The walk

Resolution is an outward walk, not a lookup:

1. start at the event target;
2. climb the ancestor chain, and for each ancestor read the stamp attribute if
   it has one, collecting an ordered list of `(element, source location)` from
   innermost to outermost;
3. classify each collected location as **library-internal** or **product**;
4. the default answer is the innermost ancestor classified as product.

The walk terminates at the document root or at a configured boundary, and it
must not stop at the first stamped ancestor — stopping early is the same bug as
using the target, one level up.

Note what the walk does *not* consult: no component tree, no framework handle,
no render graph. It reads attributes and follows parent links, which is why the
answer is version-independent.

Two mechanical details save a surprising amount of confusion. **Collapse
consecutive rungs that resolve to the same location** — nested host elements
declared on one line of source are common, and an ancestry that repeats the same
file and line four times reads as a bug in the tool. And **exclude the tool's own
chrome from the walk**, twice over: mark the inspector's own source as
library-internal so a resolution can never land on it, and ignore events whose
target lies inside the overlay, so that reaching for the tool's own controls does
not re-resolve to the tool. An inspector that resolves to itself is a small,
extremely disorienting bug.

## Classification by path segment, never by substring

The classification is a list of path segments that mark a location as belonging
to shared machinery rather than to a screen: the component library's folder, the
primitives folder, a vendored dependency's directory, whatever your tree calls
its shared layer.

Match on **segments**, not on the whole path as a string. A bare substring test
fires on any path that happens to contain the token anywhere — a feature folder
whose name embeds the word, a file named after the library it wraps — and the
misclassification is invisible: the resolver simply keeps walking past the call
site and hands over a grandparent. Either split the path and compare whole
segments, or keep the separators in the pattern itself and normalize the
path so the leading segment also has one in front of it. The second form is a
one-line implementation and is exactly as correct, but only while both
separators are present: dropping either one silently reverts it to the bug it
was written to avoid, so the delimiters deserve the comment, not the list.

Three rules keep the list from rotting:

- **short and explicit.** It is a judgment about your own tree, not a universal;
  five to ten segments is normal and thirty means the tree, not the list, is the
  problem.
- **commented with why.** A segment nobody remembers adding is a segment nobody
  dares remove, and it silently makes a whole area of the product resolve one
  level too far out.
- **owned by one declaration**, since the same notion of "shared layer" shows up
  in more than one tool.

## When the walk finds nothing product-owned

Two exhaustion cases, and each needs its own honest answer rather than a
plausible-looking default.

**Every stamped ancestor is library-internal.** This happens legitimately: the
person clicked deep inside a self-contained widget whose entire subtree is
shared code. Returning the innermost location and presenting it as the call site
is a lie the person cannot detect. Return the outermost stamped ancestor — the
closest thing to a boundary that exists — and *say* that no product call site
was found, so the reader knows to widen the click rather than to trust the
answer
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

**No ancestor is stamped at all.** This is not a resolution failure; it is a
different state entirely, and conflating them wastes the operator's time on the
wrong hypothesis. It belongs to
[uninstrumented-degradation](./uninstrumented-degradation.md).

## Both answers stay reachable

Roughly one time in ten the defect really is in the primitive — the button's own
padding is wrong, everywhere. A tool that only ever offers the call site sends
that person straight back to guessing, and worse, teaches them that the tool
lies. So the interaction offers both: the **default gesture yields the call
site**, and the same gesture **with a modifier yields the innermost stamped
element**. Two gestures, no menu, nothing unreachable.

The choice of which is the default is a frequency argument and it goes to the
call site, because the common case should cost nothing and the rare case should
cost one modifier key. State the mapping wherever the tool announces itself —
permanently, in the tool's own chrome, not in documentation — because a modifier
nobody knows about is a feature that does not exist.

## Make the walk visible

The single cheapest thing that makes this technique trustworthy is showing the
person that the walk happened. Draw **two outlines, styled differently**: one
around the element under the pointer, one around the ancestor that will actually
be copied, and draw the first only when the two differ. The person now sees, at a
glance, that they touched a primitive and that the tool climbed to the screen —
which is exactly the reasoning they would otherwise have to take on faith, and
exactly the reasoning that is wrong when the segment list is wrong.

Extend the same honesty to the chain display: render each rung's classification,
so library rungs are visibly dimmer than product rungs and the default rung is
marked. A misconfigured segment list then announces itself the first time
somebody hovers — no test required, because the classification is on screen
beside the thing it classified.

## The chain is the richest output

The full stamped ancestry — outermost to innermost, each with its location — is
worth more than either single answer, because it is the render path: it shows
which screen composed which container composed which primitive. Two ways to
expose it, and the cheaper one is usually better. **Rung by rung**: every entry
in the displayed chain is itself a copy target, so the person picks the level
with one click instead of pasting a block and asking the agent to choose. **Or
whole**, as a deliberate "copy everything" gesture, when the change genuinely
spans layers and the agent should see the composition.

Whichever you offer, keep it exact. A truncated chain is worse than no chain: the
reader will assume the outermost entry they can see is the top.

## Ambiguity the walk cannot resolve

Two situations produce a correct-looking answer that is wrong, and both are
worth knowing rather than engineering around:

- **portalled and teleported content.** An element rendered into a different
  part of the document than where it was declared has an ancestor chain that
  reflects its destination, not its composition. The walk will climb into
  whatever hosts the portal. Detect the boundary if the framework marks one; if
  it does not, prefer to report the innermost stamped location honestly over
  inventing a parent.
- **content whose structure is data.** A list of a thousand rows resolves every
  row to the same location, correctly — the difference between rows is data, not
  source. This is not a defect, but the reference should carry the visible-text
  anchor so the agent knows *which* row was meant, which is one of the reasons
  that anchor exists.

## When not to use this

A codebase with no shared primitive layer — early, small, every screen written
in full — does not need classification, because the innermost stamp already *is*
the call site. Adding the segment list before there is a shared layer produces a
list that is empty, then wrong, then load-bearing without anyone deciding it
should be. Introduce the walk when the first shared component library appears,
which is also the first day the naive answer starts pointing at it.
