---
layer: technique
type: technique
subject: phone-controller-input-protocol
technique: absolute-state-over-event-frames
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [designing the message a handheld controller sends to a host, a held control is stuck after a dropped packet, choosing between press-release events and periodic snapshots]
---

# Absolute state over event frames

The named concern: the controller's message is a complete snapshot of the controller's
posture, sent repeatedly, rather than a stream of changes the host must replay correctly.
The defect this prevents is the latched control: a `released` event that never arrived, so
the host believes a finger is still down.

## The frame

One frame carries every channel the simulation reads, each as the value it has *now*: the
continuous axes (steering position, throttle depth, brake depth), the held buttons as
numbers between zero and one rather than booleans where a pressure or a ramp is possible,
the selected index of any selection (see the indexed-commands technique), and two
bookkeeping fields: a sequence number that increases by one per frame and a send time from
the phone's own monotonic clock. Nothing in the frame refers to a previous frame. A frame
that arrives alone, first, or twice means the same thing.

The phone sends on a fixed cadence regardless of whether anything changed, plus once
immediately on every contact change so a press is not delayed by the cadence. The steady
cadence is not wasted bandwidth. It is the heartbeat the host's staleness policy and the
phone's own failure detector both depend on, and it is the redundancy: at thirty frames a
second, losing one frame costs thirty-odd milliseconds of a picture that was already
changing slowly. Redundancy by repetition of the *current* state is cheaper and simpler
than the netcode habit of bundling the last several inputs per packet, which exists because
a prediction model needs the exact input of every tick. A controller feeding a host that
simply wants the player's present posture needs only the present.

## Why events fail, in order of cost

An event stream must be reliable, ordered and exactly-once to be correct, and each guarantee
costs machinery the link does not give for free. Reliable delivery over a lossy radio means
retransmission, which means a delay that is applied to the *next* event as well, so one
loss stalls the line behind it. Ordering needs a sequence and a buffer. Exactly-once needs
deduplication. After all that, the host reconstructs the posture by folding the events, and
a single missed fold leaves a posture that is wrong and stays wrong until the next event on
that control, which for a held control may be a minute away. A snapshot discards the whole
apparatus, because the posture is read, not reconstructed.

## Decision rules

- **When a value describes what the player's hands are doing right now, send it as state.**
  Held, position, depth, selected index: all state.
- **When the host must never miss a discrete act, send the act as an index or a counter in
  state, not as an event.** A monotonically increasing `shots requested` counter is state
  and survives a lost frame; the host acts on the difference from what it has already
  consumed. A pure `pressed` event does not.
- **When a command is a one-time administrative act (start the race, leave the lobby, buy a
  part), send it as a message of its own, acknowledged, outside the control stream.** These
  are the legitimate events, and they are low-rate, idempotent by construction or guarded
  by the host's phase, and never carry a held posture.
- **Clamp every channel on receipt to its declared range, and reject non-finite numbers.**
  The host does not trust the controller to stay inside the contract, and a not-a-number
  reaching a simulation step corrupts every value it touches.
- **State the unit and range of each channel in the contract.** Steering as a fraction of
  full lock in minus one to one, depth as zero to one, times in milliseconds on a named
  clock. A channel without a unit is read differently by the two ends and fails silently.

## What the host does with the frame

The host does not apply a frame to the simulation directly. It places it in a bounded
latest-state mailbox, one per seat, and the simulation reads the mailbox once per step.
Bounded means a mailbox holds one frame, not a queue: a burst of five frames delivered
together leaves the newest, never five steps of backlog. The mailbox is also where the
sequence, age and staleness policies live, so the simulation sees one clean frame per seat
per step and knows nothing about the link.

## Evidence status

Measured on scripted clients: a mailbox holds the newest accepted frame, clamps its
channels and rejects non-finite values, and a scripted client's mixed frame (axes, held
buttons and the selection together) round-trips to distinct fields on a real host. Authored,
not observed: the cadence. The thirty-per-second send rate and the immediate send on contact
change are design choices, and nobody has measured whether they are enough on a congested
real network or whether a physical phone sustains the cadence with its screen on for a
session.

## When not to use this

- **For turn-based or menu input.** A tap on a card is an act; send it as a message, not as
  a posture, and let the host's phase guard it.
- **For a host that needs the exact input of every simulation tick** (a deterministic
  rollback model, a replay). That is a different protocol with redundancy per tick; the
  snapshot design deliberately forgets the path between samples.
- **When the link is guaranteed reliable and ordered and the controls are discrete**, the
  event form is simpler. A wired controller bus is that case. A wireless handheld is not.
