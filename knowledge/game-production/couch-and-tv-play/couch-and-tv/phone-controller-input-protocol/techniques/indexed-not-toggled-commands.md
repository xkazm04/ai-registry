---
layer: technique
type: technique
subject: phone-controller-input-protocol
technique: indexed-not-toggled-commands
status: forged
laws: [one-authority-per-quantity, declaring-an-input-is-not-consuming-it]
shared_with: []
use_when: [a controller button selects a weapon, view or mode, a repeated packet changes a selection twice, the host and the phone disagree about which item is selected]
---

# Indexed, not toggled, commands

The named concern: a command that selects a state from a set carries the *index of the
selected state*, not a toggle or a next-item instruction. The defect this prevents is a
selection that changes once per delivery rather than once per press.

## Why a toggle cannot be made safe on this link

A toggle is relative: its meaning is "the opposite of whatever you currently believe".
The host cannot distinguish one press delivered twice from two presses delivered once
each, and the controller link both duplicates and reorders. A repeated "next weapon"
cycles twice and lands the player on the wrong weapon in the middle of a fight; a lost
"next weapon" does nothing and the player presses again, so a retry that arrives after the
original skips one. The common repair, sending the toggle as a numbered event with
deduplication, rebuilds an event protocol to protect one button, and still leaves the host
and the phone with two models of what is selected.

## The shape

The *phone* owns the selection. Its button toggles or cycles its own local variable, which
is entirely safe because it is one process handling one tap. Every frame then carries the
resulting index as part of the absolute state. The host stores the index from the newest
accepted frame and applies it to the simulation. A repeat of the frame carries the same
index and changes nothing. A lost frame is replaced by the next one. The two ends agree
because the host's value is always the most recent report of the phone's value, never a
count of events.

Where the controller should show what the host believes (a weapon name, an ammunition
count), the host's response carries the selected index back, and the phone shows that, not
its local variable. If the two ever differ the display shows the host's truth for the
instant before the next frame converges them, which is the honest state.

## Range and validity

The index is validated on receipt against the declared range of the set. An out-of-range
index is a malformed frame and is dropped as a whole, not clamped, because clamping turns a
corrupt value into a plausible wrong selection. The set's size is a fact the host owns: if
the host later grows from two selectable items to three, the validation range is the one
place that must grow with it, and a validation that is hard-coded to the original size
silently rejects every frame that selects the third. Derive the range from the host's own
list and test that the highest index is accepted.

A selection that changes the *effect* of an action channel (a different weapon on the same
fire button) takes effect on the host between steps, never mid-action. Whether a swap
cancels a cooldown or an in-flight action is a game rule and belongs in the host's rules;
the protocol only guarantees that the new index is applied once.

## Decision rules

- **When a command picks one of N, send the index.** Never a toggle, never "next", never
  "previous".
- **When the button on the phone cycles, keep the cycle on the phone.** Only the result
  travels.
- **When a selection must be confirmed by the host, echo it.** The phone displays the echo.
- **When the set changes size, change the validated range in the same change.**
- **When a selection has a cost (a swap delay), the host charges it on change of the stored
  index**, not on receipt of a frame. Receipt happens repeatedly; change happens once.
- **When a toggle genuinely cannot be avoided**, as with a one-time administrative flip,
  make it an acknowledged message with a request identifier the host deduplicates, outside
  the control stream.

## Evidence status

Measured by a scripted client against a real host: a single frame carrying the fire, mine
and weapon fields together yields distinct values in the host's mailbox, and the weapon
field is accepted at its allowed values. The design contract states, and a reading of the
code confirms, that the phone toggles locally and sends the index. Not measured: any
simulated duplicate or reorder of a selection, and no human has swapped weapons under
real packet loss. The range check in the reference realization is hard-coded to two items,
which is the validity hazard described above, made concrete.

## When not to use this

- **For a set of one.** A single on-off control is a held state, not a selection.
- **For a control that is an action and not a state**, like a one-shot horn. A counter or a
  held pulse carries it, as in the frame technique.
- **When the player's own prior selection is not the phone's to hold**, such as a selection
  determined by game state (the host has changed the weapon for the player). Then the host
  is the owner, and the phone shows it; the phone does not send an index that would
  overwrite it.
