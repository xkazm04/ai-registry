---
layer: technique
type: technique
subject: long-form-reading-surface
technique: focus-transfer-on-in-place-navigation
status: forged
laws: [identity-survives-reuse, gate-sees-target]
shared_with: []
use_when: [article content swaps without a document load, focus stays in the panel after choosing a new article, a focus effect fires on first paint and steals the top of the page]
---

# Focus transfer on in-place navigation

When a reader picks another article from a contents or index panel and the
surface swaps the content client-side, the page never reloads — which is the
point, and which is also why the transfer of attention that a real navigation
performs for free does not happen. A visual reader loses nothing: the new prose
is under their eyes. A keyboard reader is still focused on the link they
activated, in a panel that now describes a document they are not reading, and a
screen-reader reader has been told nothing at all — the surface changed
underneath a cursor that did not move.

This is a specific instance of a general contract owned by the accessibility
subject — in-place navigation moves focus or announces, and any surface that
replaces focused content owns the handoff
([keyboard-navigation-models](../../../feedback-and-style/accessibility/techniques/keyboard-navigation-models.md)).
This technique is the reading surface's realization of it, and it exists as a
separate document for one reason: the naive implementation introduces a
regression worse than the defect it fixes.

## The destination is the article's heading

Focus moves to the new article's top-level heading, not to the article
container, not to the first link, and not to the panel entry that now shows as
current.

- **The heading is the honest answer to "where am I now".** Focusing it makes
  assistive technology read the document's title, which is exactly the sentence
  a reader needs.
- **It sits above the content**, so subsequent reading and tabbing proceed
  forward through the new document rather than from its middle.
- **It must be programmatically focusable without becoming a tab stop.** A
  heading is not interactive; giving it a tab stop spends a keystroke on an
  element that does nothing when activated, which is a false affordance and
  banned outright. The distinction — reachable by script, skipped by the tab
  sequence — is the whole mechanism, and it is one attribute value apart from
  the wrong one.
- **Focus must be visible when it lands.** A focused heading with no indicator
  moves a sighted keyboard user's position invisibly. If the default indicator
  on a heading looks wrong, restyle it; do not suppress it.

Where the surface also scrolls, focus and scroll are one movement: the heading
lands clear of the fixed chrome, using the scroll margin the offset budget
already owns, so the element the reader was just sent to is not underneath the
header.

## The guard is the technique

The same effect that transfers focus on a content swap will, unguarded, fire on
first mount — every cold load of every article yanks focus to the heading,
which scrolls the page, dismisses the browser's own restored position, and
interrupts a reader who had not asked for anything. So the effect must
distinguish *the content changed* from *the content appeared*, and the guard's
shape matters:

- **Key the guard on document identity, not on a run count.** "Skip the first
  run" is a boolean that is right until the component remounts for an unrelated
  reason and skips a real navigation, or until the surface is reused and the
  count restarts. Remember which document was last rendered and transfer when
  that identity changes
  ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)); the
  initial mount is then simply the case where there is no previous identity,
  and it falls out of the rule instead of needing a special case.
- **Transfer on a real change, not on a re-render.** Re-rendering the same
  article — a theme change, a resize, a data refresh — is not navigation and
  must not move focus. Focus that moves on re-render is worse than focus that
  never moves, because it moves at moments the reader cannot predict.
- **Do it after the new content is in the tree.** Focusing an element that has
  not yet rendered silently does nothing, and nothing retries; the transfer
  happens in the same pass that commits the new content, and its success is
  "the element received focus", never "the effect ran".

An announcement is an acceptable alternative only where focus genuinely cannot
move — a surface where the reader's focus is in an input they are mid-sentence
in, for instance. It is not the general answer: focus movement both announces
and relocates, and an announcement alone leaves the keyboard reader where they
were.

## Assert the destination, not the attribute

The regression this technique guards against is invisible to every check that
looks at markup. A test asserting the heading carries a programmatic-focus
attribute passes on a surface whose effect never fires; a test asserting the
effect ran passes on a surface that focused a detached element. The observation
must be the thing itself
([gate-sees-target](../../../../_laws.md#gate-sees-target)): after simulating the
in-place navigation, assert that the focused element **is** the new article's
heading, and — the half that is always omitted — after an initial mount, assert
that focus has **not** moved from where the document put it. Both directions, or
the guard regresses the first time somebody simplifies the effect.

## When not to reach for this

If navigation between articles is a real document load, the platform performs
the transfer and adding one duplicates it. If the swap is not a navigation — a
tab within one article, an expanded detail block, a filter over a list — moving
focus to a heading is a jolt, and the correct handling is the smaller one that
subject owns: keep focus where the reader put it, and announce the change if it
is not visible from there.
