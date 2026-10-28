---
layer: technique
type: technique
subject: keyboard-shortcuts
technique: layered-key-dispatch
status: forged
laws: [one-validation-door]
shared_with: []
use_when: [an overlay key also triggers the screen beneath, one key press handled by two listeners, deciding where a shortcut listener is attached]
---

# Layered key dispatch

Several layers can want one key at once: an open overlay, the widget that has
focus, the screen, the application shell. Which hears it first is a product
decision, and when the code does not make it, it is made by subscription
order — which is the order components happened to mount, and the screen
beneath an overlay almost always mounted first.

## The order

Innermost wins:

1. **The topmost overlay** — a dialog, a guided-tour layer, a palette. While
   it is up, its keys are the only application keys that mean anything.
2. **The focused region or widget** — a composite with its own keyboard model
   (owned by the accessibility subject), or a panel that declares keys live
   only while focus is inside it.
3. **The screen** — the route's own accelerators.
4. **The global layer** — the shell's keys that work on every screen (open
   the palette, go to a section, open the reference page).

A layer that handles a key **consumes** it: it prevents the default action
and stops further propagation, so no layer beneath acts on the same press.
A layer that does not match a key leaves it entirely alone — no default
prevented, no propagation stopped — because the keys an overlay does not
claim still belong to whatever has focus inside it.

## Hearing first: the capture phase

In a browser the order is enforceable with event phases instead of with
bookkeeping. A key event travels down from the document to the focused
element (capture) and back up (bubble). A screen's shortcuts listen in the
bubble phase, where they hear a key only after the focused element had its
chance — which is right, since a focused widget should win over the screen.
An overlay's shortcuts listen in the **capture phase at the document**: they
hear the key before the focused element and before any bubbling screen
handler, and consume what they match. That is the one placement that makes
"the overlay above the screen hears first" true regardless of mount order and
regardless of which element inside the screen holds focus.

Capture is a privilege. A capture listener that consumes broadly — every
printable key, every arrow — makes the focused control inside the overlay
deaf. Capture only the declared chords; let everything else travel.

### Two listeners on one node are not two layers

Phases order an overlay against the screen; they do not order two overlays
against each other. Stopping propagation stops the event from reaching
*other nodes* — every listener already attached to the same node still runs,
in the order it was attached. Two overlays that each bind a capture listener
on the document both hear every key, and the one attached first (the one
lower in the stack) hears first. Stopping immediate propagation does not
rescue it: it lets the earliest-attached listener silence the later ones,
which is the bottom layer silencing the top. The symptom is the familiar
pair — one press closes the sheet under an open popover, and a menu opened
over the sheet never hears its key at all. Ordering between overlays is
therefore not an event-phase question; it is a stack question. One listener
per root consults an ordered list of open layers and hands the key to the
layer opened last, which is exactly the shape the overlay stack already has.

### A handler that declines must not consume

Matching the chord is not the same as handling it. A play/pause on Space
matches on every Space, and declines when focus is on a button so the button
can press. If the dispatch point has already counted the key as handled — and
in capture, stopped its propagation — the decline is only half-honoured: the
browser's own activation still happens, but every keydown listener on the
focused control and its ancestors never hears the key. Let a handler report
"not mine" so the dispatch treats the event as unmatched and leaves it
entirely alone, or express the condition in the declaration (live only when
focus is not on an activatable control) so the match itself fails.

## One dispatch point per layer

Each layer attaches one listener that looks the event up in its declared
table, not one listener per shortcut. The single point is where the event
hygiene lives — typing-target suppression, repeat filtering, composition
skipping — and it is the one door every key in that layer passes through
([one-validation-door](../../../../_laws.md#one-validation-door)). Thirty
listeners each re-implement the typing guard, and the thirty-first forgets.
Handlers are read through a reference that is updated on every render, so the
listener itself is attached once per mount and never re-subscribed when a
handler closes over new state; re-subscribing on every render moves the
listener to the end of the queue and quietly changes the order.

## Escape belongs to the stack

Escape is not a shortcut each overlay registers. The overlay stack owns it:
one press reaches the topmost entry only and closes one layer, because the
top of the stack owns input. The shortcut layer routes Escape to the stack
and does not let screens or regions bind it while any overlay is open. A
screen-level Escape (clear a selection, leave a mode) is legitimate only when
the stack is empty, and the stack's own handler runs first. The overlay still
*declares* its Escape entry, so the reference page says what Escape does
there; the dispatch simply routes that entry to the stack instead of binding
it in the overlay's capture list. Building a second
Escape chain in the shortcut layer re-creates the scattered form the stack
exists to eliminate — three layers closing on one press.

## Scope follows focus and visibility

A screen kept mounted but hidden (a cached route, an inactive tab) must not
hear keys. Its listener is attached while it is shown and removed when it is
hidden, or its dispatch checks visibility before acting. A region-scoped key
checks that focus is inside the region at the moment of the event, not at the
moment of mount. A key that runs an action on an invisible screen is the
keyboard version of clicking through a modal scrim.

## When not to use it

A surface with no overlays and no focused composites needs only the screen
and global layers; capture-phase listening there buys nothing and makes the
focused control's own keys lose. Reach for capture exactly when a layer must
be heard above content it does not own.
