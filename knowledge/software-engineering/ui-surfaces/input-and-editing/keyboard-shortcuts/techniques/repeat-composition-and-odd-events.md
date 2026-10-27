---
layer: technique
type: technique
subject: keyboard-shortcuts
technique: repeat-composition-and-odd-events
status: forged
laws: [unknown-is-not-a-value]
shared_with: []
use_when: [holding a key runs an action many times, shortcuts fire while an input method is composing, a chord works on one keyboard layout and not another]
---

# Repeat, composition and odd events

The model "one key, one press, one action" is wrong in five ordinary ways,
and each produces a defect that reproduces only on someone else's keyboard.
They are cheap to handle at the single dispatch point of each layer and
impossible to handle consistently across scattered listeners.

## Auto-repeat

A held key emits a stream of key-down events after the first, each marked as
a repeat. Per declaration, decide whether the action is **repeatable**:
stepping through rows, scrubbing a timeline, adjusting a value — yes, the
stream is the feature; toggling play, approving, deleting, opening an
overlay — no, a repeat is a second command the user did not give. Default to
non-repeatable and let the declaration opt in. A non-repeatable shortcut
still consumes its repeat events, so the held key does not fall through to
the layer beneath and act there.

## Input-method composition

Users of input-method editors compose a character or a word across several
key events; while composition is active, the events report that they are
composing (and some engines report the generic "processing" key code
instead of the real key). None of those events is a command. The dispatch
point ignores every key event during composition, including the Enter that
commits the composition — that Enter belongs to the editor, not to submit and
not to a shortcut. Treat an event whose key is unidentified the same way:
an unknown key is not a key that matches nothing, it is a key the shortcut
layer cannot interpret and must leave alone
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
The extreme case is an event with no key at all: some browsers fire a
key-down without one when they autofill a field, and a matcher that
lower-cases the key throws inside the document listener on every autofill.
Check that the key is a string before comparing it.

## Layouts: character versus position

An event reports both the character the key produced and the physical
position of the key. They answer different questions:

- **Match by character** for mnemonic shortcuts ("Shift+G", "?"), so the
  shortcut follows the letter wherever the layout puts it. Normalize case:
  with Shift held the reported character is upper case, and on some layouts
  Shift changes the character entirely (the question mark is Shift plus a
  key whose unshifted character differs by layout). So Shift is three-valued
  in a declaration — required, forbidden, or *not asked* — and a
  character-matched shortcut like "?" leaves it not asked, because whether
  Shift was needed to produce the character is the layout's business. The
  primary modifier and Alt are two-valued: a chord that does not ask for
  them requires them up, or every editing chord would also fire it.
- **Match by position** only for spatial shortcuts whose meaning is their
  place on the keyboard (a game-style cluster), and accept that their labels
  must then be rendered from the user's actual layout.

A chord written as "Mod+/" is a layout trap: on layouts where the slash needs
Shift, the chord is unreachable or arrives as a different character.
Prefer letters for chords; test punctuation chords on at least one non-
default layout.

## The right Alt

On many layouts the right Alt key (AltGr) arrives as Control plus Alt held
together, and it produces ordinary characters — the at sign, braces,
currency symbols. A shortcut on Control+Alt plus a letter fires when such a
user types that character. Either avoid Control+Alt chords or check that the
event's own AltGr modifier state is off before treating it as a chord.

## Lost key-ups and stale state

Focus can leave the window between key-down and key-up — a window switch, a
system dialog, a dev tool taking focus — and the key-up never arrives. Any
state built from "key is held" (a hold-to-peek, a modifier-tracked mode) is
then stuck. Clear held-key state when the window loses focus or the page is
hidden, and prefer reading modifier state from each event rather than
tracking it across events.

## Synthetic and already-handled events

Events dispatched by script, by an automation layer, or re-dispatched by a
component carry the same shape as real ones. The dispatch point checks that
an event was not already consumed (its default prevented by an inner layer)
before acting, so a handled key is not handled twice, and does not trust
untrusted events for destructive actions.

## When not to use it

A text editor component with its own input pipeline handles composition and
repeat internally; the shortcut layer leaves it alone entirely by treating it
as a typing target. These rules are for the application's accelerators, not
for re-implementing text input.
