---
layer: golden-path
type: golden-path
subject: keyboard-shortcuts
status: forged
use_when: [adding a shortcut to a screen or an overlay, a shortcut fires while the user is typing or does nothing in a table, writing or auditing a keyboard reference page, two layers both react to one key press]
techniques:
  - declared-keymap-authority
  - layered-key-dispatch
  - shortcut-collision-rules
  - repeat-composition-and-odd-events
---

# Keyboard shortcuts

An application shortcut is an accelerator: a key or chord that runs an action
the interface already offers some other way — go to a screen, play or pause a
replay, open the palette, approve the selected item. The subject is the layer
that holds those accelerators as a **system**: declared in one place, heard in
a defined order, chosen so they cannot fight the keys the user is typing, and
robust to the parts of the keyboard event stream that are not one key, one
press. It is not the keyboard model inside a widget. Arrow keys roving through
a listbox, Home and End inside a grid, a menu's type-ahead — those are the
widget's own contract with the user, and a product that calls them shortcuts
ends up registering them twice.

The naive reading treats a shortcut as a line of code: a key listener on the
document, an `if` on the key, a call to the action. Each one works the day it
is written. The defects arrive with the third and the thirtieth, and they are
always the same four. Nobody can say which keys a screen answers to, because
the answer is scattered across listeners and the help page was typed by hand
and is already wrong. Two listeners react to one press because nothing decides
which layer heard it first. A bare letter that worked on an empty screen is
swallowed the day a focused table starts honoring type-ahead, or worse, fires
in the middle of a word. And a held key machine-guns an action, an input-method
user's composition triggers commands, a chord lost to a window switch leaves a
modifier stuck. The four techniques below are one answer to each.

## The keymap is a vocabulary, so it has one authority

The set of shortcuts a screen answers to is a closed vocabulary in exactly the
sense of [one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary):
action ids, their keys, their human labels, the scope in which each is live.
It has consumers — the handlers that run the actions, the reference page that
lists them, the tooltips and menu hints that show the key beside the control,
the accessibility attribute that announces it, the palette that can run the
same action by name — and every one of them derives from a single declaration
per screen. Handlers bind **by id**, never by restating the key, so changing a
chord is a one-line edit that every surface follows. The reference page is a
render of the declarations, never a document someone remembers to update.
The authority also makes the system testable: an inventory test can assert
that every declared id has a binding, every binding names a declared id, and
every screen that listens for keys has a row on the reference page — a
ground-truth check that catches the hook added next quarter, which is exactly
the copy that drifts. The full shape is
[declared-keymap-authority](./techniques/declared-keymap-authority.md).

## Layers are heard in a declared order

At any moment several layers may want one key: an open overlay, the focused
widget, the screen, the application shell. The order is a policy, not an
accident of which component subscribed first. The standard order is
innermost-wins: the topmost overlay first, then the focused region, then the
screen, then the global layer — and a layer that handles a key **consumes**
it, so nothing beneath acts on the same press. Mount order cannot express
that, because the screen beneath an overlay usually mounted earlier and the
overlay's listener would otherwise hear second. The mechanism that does
express it in a browser is the event phase: an overlay listens in the capture
phase at the document, hears the key before any bubbling handler on the
screen below, and stops what it matched. Phases order an overlay against the
screen; they do not order two overlays against each other, because every
listener on one node runs whatever propagation is stopped, so between overlays
the order is the stack's. Escape is the one key the layers do
not negotiate at all; it belongs to the overlay stack, where the top of the
stack owns input and one press closes one layer
([stack-ownership](../../shell-and-navigation/modal-stack/techniques/stack-ownership.md)).
The dispatch order and the consume rule are
[layered-key-dispatch](./techniques/layered-key-dispatch.md).

## A shortcut is chosen around what the user is typing

The key a shortcut uses is a negotiation with three prior owners. The user
typing into a text field owns every printable key. A focused composite that
honors type-ahead — a listbox, a tree, a table that jumps to the row whose
first cell starts with the typed letter — owns every printable key with no
modifier while it has focus. And the platform owns its reserved chords: the
browser's, the operating system's, and the screen reader's, whose own key map
reaches users who have no other way in. A bare-letter shortcut is therefore
the most fragile choice there is: it is suppressed in fields (it must be, or
it fires mid-sentence), silently eaten by type-ahead, and a speech-input user
dictating a word can trigger it letter by letter, which is why the
character-key criterion of the accessibility guidelines requires single
printable shortcuts to be switchable off, remappable to a modifier chord, or
live only while their component has focus. The reliable default for an
application-wide accelerator is a modified chord heard in capture phase;
Space and Enter on a focused button belong to the button. The negotiation
rules are [shortcut-collision-rules](./techniques/shortcut-collision-rules.md).

## The event stream is not one key, one press

Keyboard events carry more than a key. A held key repeats, and a repeat of
"approve" is a second approval. An input-method editor composes characters
over several key events that are not commands, and the final Enter commits
the composition, not the form. Layouts differ: the character a key produces
and the physical position it sits at are different questions, and a chord
written against the character breaks on a layout where that character needs
a modifier to reach. The right Alt on many layouts arrives as Control plus
Alt. Focus can leave the window between key-down and key-up, so state built
from key-up never clears. Each of these is cheap to handle at the single
dispatch point and impossible to handle in thirty scattered listeners, which
is the practical argument for the dispatch layer existing at all. The rules
are [repeat-composition-and-odd-events](./techniques/repeat-composition-and-odd-events.md).

## Where this subject stops

This subject owns the application shortcut layer: which accelerators exist,
where they are declared, the order layers hear them in, the keys they may
take, and the event hygiene of the one dispatch point. The keyboard model
inside a widget — Tab between widgets and arrows within them, roving focus,
a composite's own type-ahead — belongs to
[keyboard-navigation-models](../../feedback-and-style/accessibility/techniques/keyboard-navigation-models.md)
in the accessibility subject, which also keeps the equivalence obligation:
every shortcut accelerates a path a user can reach without it. The overlay
stack owns Escape and the rule that the top of the stack owns input; this
subject routes keys around that rule and never re-implements dismissal. The
command palette in [search](../../data-display/search/search.md) runs the same
actions by name and reads the same declarations for its key hints, but its
ranking and its summon-type-enter loop are its own. The picking rule: if the
question is "what does this key do here, and who hears it first", it is this
subject; if it is "how does focus move inside this widget", it is
accessibility; if it is "which overlay closes", it is the overlay stack.

## Failure modes of the naive reading

- **The hand-typed reference page.** Correct on the day it was written, wrong
  after the first chord change, and nobody notices because nothing compares
  it with the handlers. Derive it.
- **Mount order as precedence.** The overlay that mounted last hears last;
  the screen beneath acts on the press that was meant for the overlay.
- **The global bare letter.** Works on the empty screen, dies in a focused
  table, fires in a field the day someone forgets the typing guard.
- **Escape everywhere.** Five components each close on Escape; one press
  closes three layers or the wrong one.
- **The undebounced held key.** A repeat stream runs a non-idempotent action
  thirty times a second.
- **Commands from composition.** Keys an input method is composing reach the
  shortcut layer and run actions while the user is writing a word.

## The techniques

- [declared-keymap-authority](./techniques/declared-keymap-authority.md) — one
  declaration per screen; handlers bind by id; the reference page, hints and
  announced shortcuts are renders of it; the inventory test.
- [layered-key-dispatch](./techniques/layered-key-dispatch.md) — overlay,
  region, screen, global; capture phase for overlays; consume on match;
  Escape handed to the stack.
- [shortcut-collision-rules](./techniques/shortcut-collision-rules.md) —
  typing targets, type-ahead, platform and assistive reservations, the
  character-key criterion, the modifier-chord default.
- [repeat-composition-and-odd-events](./techniques/repeat-composition-and-odd-events.md)
  — auto-repeat, input-method composition, layouts and the right Alt, lost
  key-ups, synthetic and stale events.
