---
layer: technique
type: technique
subject: model-composed-workspace
technique: reversible-screen-ops
status: forged
laws: [one-validation-door, record-precedes-effect]
shared_with: []
use_when: [a model changes the screen and the user cannot tell what moved or undo it, the user presses stop and the screen stays half-changed, a model's screen change lands on top of the user's own click]
---

# Reversible screen operations

When a model can change the screen, every change is a small act of authority over
the user's attention. The user tolerates that only while three things stay true:
they can tell what changed, they can take it back, and they can make it stop. A
screen that moves without explanation teaches the user that it moves for no
reason; a change without an undo makes every model mistake the user's job to
repair; a stop that freezes half-way leaves the user with a screen nobody chose.

## A closed set of verbs

The model changes the screen only through a **closed vocabulary of operations**,
each with a typed argument shape. The working set is small:

- **show** - place a module view in the composition region.
- **focus** - bring one view forward or into the reading position.
- **filter** - narrow what a view shows (an account, a date range, a category).
- **navigate** - take the user to an existing module screen.
- **highlight** - mark something already on screen, without moving it.
- **propose** - offer an action that changes *data*, armed only through consent.

The list is closed in the same sense as any model-emitted grammar: an unknown verb
is not applied and not silently skipped, a known verb with bad arguments is
dropped, and both are counted and disclosed. The grammar's mechanics are
[op-grammar-allowlisting](../../../prompt-and-context/structured-output/techniques/op-grammar-allowlisting.md),
and every reply's operations pass through **one validation door** before any is
applied ([one-validation-door](../../../../_laws.md#one-validation-door)). A cap on
operations per reply is part of the vocabulary: a reply that wants to apply
fifteen changes at once is a rearrangement, whatever its verbs are called.

Note what is absent. There is no verb that moves, hides or resizes the product's
own chrome or modules; that is the composition region's rule expressed as
grammar. **Focus, highlight and filter change emphasis, never presence**: a filter
dims what falls outside it and leaves every item drawn, in place and clickable,
so the user's map of the screen survives the model's narrowing and the item the
filter wrongly excluded is still one click away. And everything that would change
the user's data rather than their view is a **proposal**: rendered as an offer,
armed only through the product's consent surface, never executed by being
applied. A proposal that would change data and arrives with any field its
definition does not name is dropped whole, not trimmed into shape, because the
one part of a reply that can change something is the part that must never be
rebuilt from damage. The wiring is
[action-consent-wiring](../../../../ui-surfaces/input-and-editing/schema-driven-ui/techniques/action-consent-wiring.md).

## One step, one undo, one line

Each applied operation is a **step**, and each step has:

- a **one-step undo** that restores exactly the arrangement before it - not "reset
  the board", which throws away the user's own work along with the model's;
- a **"what changed" line** in plain words, visible where the change happened or
  beside the conversation: "Showing the forecast for the next 30 days, filtered to
  the joint account." The line names the verb's effect, not the model's reasoning.

Record the undo before the effect
([record-precedes-effect](../../../../_laws.md#record-precedes-effect)). The prior
arrangement is captured, then the operation is applied; an operation whose prior
state could not be captured is not applied. Capturing afterwards is the naive
order, and it produces the undo that restores the wrong thing exactly when two
changes landed close together.

A reply with several operations is several steps, applied in order, each
undoable on its own, and the reply as a whole is undoable as a group. The user
should be able to say "keep the forecast, drop the filter" without restarting.

**Undo belongs to the host, never to the vocabulary.** The model cannot emit
"undo", and it cannot propose the reversal of an act the user consented to; the
undo control is the product's own, drawn from the product's record of what was
applied. A model that can undo can also be talked into undoing, and the user's
one guaranteed way back must not pass through the party that made the change.

## Stop restores

When the user says stop - a button, an escape key, "never mind" - the model
**halts at once and restores the arrangement the user last saw before the turn
began**. Not the arrangement half-way through the turn's operations; not an empty
region. Disengaging means stepping back to where the user was, and the user was
never consulted about the intermediate states.

Stop is therefore not just cancellation of the stream. Cancelling the stream is
[streaming-output](../../../runtime-and-io/streaming-output/streaming-output.md)'s
lifecycle; this technique adds the screen half: the turn's pre-image is held for
the turn's duration and reinstated on stop.

The cheapest correct form, for a surface that does not stream operations, is to
**apply nothing until the whole reply has passed the validation door**. Then a
stop before the reply lands restores by construction, and the line it shows can
be the strongest one available: "Stopped. Nothing changed." The pre-image becomes
necessary the moment operations apply as they stream, and the honest line then
names what was rolled back.

## Ambiguity gets a question or a smaller view

When the model is unsure what the user meant, it does not rearrange the screen to
find out. It asks, or it makes the smallest change that could help - highlight
rather than show, show one view rather than four. An unsure model that reshapes
the screen has made its uncertainty the user's problem, and the user pays twice:
once to understand the change, again to undo it.

## The user's hand wins

Model operations arrive late - the model was composing while the user was
working. When a user's own action lands on a view that a pending model operation
targets, **the user's action wins**: the stale operation is dropped, and the drop
is said ("I didn't apply the filter - you changed the view while I was working").
The same applies when the user navigates away: operations aimed at a screen the
user has left are not applied to the screen they are now on. The test is simple
and worth writing down: a model operation never undoes something the user did
after the model's turn began.

The precondition is that every operation **names its target by identity** - this
view, this account, this item - never "the current selection" or "the open
panel". The user's selection moves while the model works, so an operation that
resolves against it at apply time lands on whatever the user is looking at now;
the same failure on the tool-protocol side, where a request names ambient state
it does not carry, is
[ambient-selection-is-not-an-argument](../../../runtime-and-io/mcp-tools/techniques/ambient-selection-is-not-an-argument.md).

Proposals have the same staleness, measured at the press rather than at the
apply. The world can change between the moment a consent box was drawn and the
moment the user presses it; re-resolve the proposal at the press, compare what
it would do now with what the box said, and disarm it with a line ("this changed
since it was offered") when they differ.

## Decision rules

- **When a verb would move, hide or resize module chrome, it is not in the
  vocabulary.** Offer the region instead.
- **When an operation changes data, it is a proposal**, whatever the model called
  it.
- **When any operation is dropped, disclose the count with its reason** in the
  reply, so "it did nothing" and "it tried and was refused" are distinguishable.
- **When stop fires, restore the turn's pre-image** and say so in one line.
- **When the model's operation targets a view the user touched since the turn
  began, drop it.**

## When not to use this

- **A read-only answer with no screen effect.** Prose replies have no steps to
  undo; do not add an undo control to a sentence.
- **Operations the user performs.** A user's own click is not a model step and
  does not need a "what changed" line; it is ordinary interface state.
- **Fully delegated background work.** When the user has handed a long task to an
  agent and left, the screen changes it makes are a report to read on return, not
  live steps to supervise - the review flow, not the undo stack, is the control.
