---
layer: golden-path
type: golden-path
subject: phone-controller-input-protocol
status: forged
use_when: [a phone or other handheld screen drives a game that runs on a separate host, designing what a controller sends and what the host does when it stops sending, a seat is stuck pressing a button nobody is touching, a controller reconnects mid-session and must get its seat back]
techniques:
  - absolute-state-over-event-frames
  - stale-hold-steer-drop-actions
  - sequence-gap-and-age-rejection
  - neutralise-on-every-loss-path
  - reconnect-by-token-seat-recovery
  - indexed-not-toggled-commands
---

# Phone controller input protocol

A phone is a controller the game does not own. It rides a wireless link the host cannot
tune, runs in a browser tab the operating system may freeze at any moment, is held by a
person who will put it down, lock it, take a call on it and walk out of the room, and
shares a radio with every other device in the house. The host is a separate machine that
runs the simulation and is the only authority on what happens in the world. The subject
is the small protocol between the two: what the phone says, how the host decides whether
to believe it, and above all what the host and the phone each do when the saying stops.

The naive reading is that this is a transport problem solved by choosing a fast socket.
The socket is the easy part. A fast socket delivers messages quickly and says nothing
about whether they still mean anything, whether they arrived in order, whether the sender
is still alive, or whether the thing the message commanded was applied once or twice. Every
interesting defect in this family is a *semantic* one: a car that keeps accelerating after
the phone went to sleep, a weapon that cycles twice because a packet repeated, a seat that
is lost for the rest of the race because a radio blinked for a second.

## The host is the authority and the phone reports a state

The first decision decides most of the rest. The phone does not tell the host *what to do*
(`press fire`, `next weapon`, `turn left a bit more`). It tells the host *what is currently
true of the controller* (`fire is held, the selected weapon is index one, the stick is at
minus point four`). The host owns the simulation, the clock and the consequences; the phone
owns exactly one thing, which is the posture of the person's fingers, and it reports that
posture as an absolute snapshot stamped with a sequence number and a send time.

Absolute state has a property that event streams buy only with machinery: **a lost message
costs nothing but time**. The next snapshot carries the whole truth, so loss, duplication
and reordering degrade into "the host's picture is slightly old", never into "the host's
picture is wrong". An event stream (`button down`, `button up`) has to guarantee delivery
and order or it drifts, and a drifted event stream is how a button becomes latched.
`absolute-state-over-event-frames` develops the frame shape and the one place events remain
legitimate.

## Three clocks, three questions, and they do not merge

A snapshot raises three questions, and each has its own instrument.

*Is this the newest thing I have heard from this seat?* That is a sequence question, and the
answer is a strict comparison with the last accepted number. *Is it recent enough to still
describe a hand?* That is an age question, and the answer needs the phone's send time
translated onto the host's clock, because the two clocks have unrelated origins. *Has this
seat said anything at all lately?* That is a liveness question, answered by the host's own
receive time and never by any timestamp the phone supplied.

Merging them produces the classic defects. Judging age only by arrival time accepts a
frame the radio held for a second and delivered in a burst. Judging liveness by a sender
stamp lets a phone with a wild clock look permanently alive or permanently dead. Judging
order by age alone lets an old frame overwrite a newer one whenever clocks jitter.
`sequence-gap-and-age-rejection` sets out the checks and what each one counts.

## Staleness is a policy per channel, not a switch

When the host has heard nothing recent, it must still produce *some* input for the
simulation this step, because the simulation does not wait. The mistake is a single policy
for the whole frame. Channels differ in what holding them costs. A held *steering
position* is a posture that changes slowly and fails gently: a vehicle that keeps its last
heading for a moment stays on the road. A held *throttle, brake or fire* is a command whose
continued application is the harm: the phone may be face-down in a pocket while the vehicle
accelerates into a wall or the weapon empties its magazine. So the host holds the
continuous, self-correcting channel for a bounded time and zeroes every channel whose
continuation is itself the danger. `stale-hold-steer-drop-actions` is the policy and its
bound.

## A neutral state is the safe state, and every loss path must reach it

The phone knows things the host cannot: the page lost visibility, the screen locked, a
settings sheet opened over the pad, the layout changed under a thumb. The host knows things
the phone cannot: the socket closed, nothing arrived for a quarter second, a new connection
replaced the old. Neither side can assume the other will report the loss, and a loss that
neither side turns into a neutral state leaves the last pressed state in force forever.

The rule is structural and has no clever form: **enumerate every way the controller can
stop being trustworthy, and for each one, name where it becomes neutral and who is
responsible.** The enumeration is the technique; a list written once, from both ends, then
exercised. A path missing from the list is a stuck input waiting for its first player.
`neutralise-on-every-loss-path` carries the paths and the double-ended responsibility,
including the phone's own failure detector, which cannot wait to be told it was cut off.

## A seat is an identity, not a connection

The person at the sofa is not the socket. Radios blink, tabs reload, an operating system
reclaims a page; each produces a new connection from the same person. If the seat is bound
to the connection, every blink forfeits it, and in a race that means a driver losing a
place to a stranger or to an empty slot. If the seat is bound to a secret the host issued
and the phone remembers, a returning phone proves who it is and gets the same seat back,
with its sequence and clock state reset and its input neutral. The care is in the
details: a late close event from the replaced connection must not mark the reclaimed seat
dead, and a returning controller is accepted at times a new one would not be.
`reconnect-by-token-seat-recovery` states the claim rules and the generation fence.

## Commands that change state name the state

Some controller actions are not postures but selections: which weapon, which view, which
gear. The tempting encoding is a toggle or a "next" command because it matches the button.
It is also the encoding that fails under duplication, because a repeated "next" is applied
twice and the host has no way to tell a repeat from a second press. The cure is to send the
*index* the player selected, so the host's response to a repeat is to do nothing new.
`indexed-not-toggled-commands` makes this a rule and shows where the toggle may live.

## Where this subject ends

The nearest neighbour is the discipline of structuring gameplay runtime behaviour. That
subject decides what shape the simulation's own code takes and treats the order of updates
within the host as a first-class force. This one starts at the host's door: the input
mailbox where an untrusted, late, duplicated stream is turned into the single value the
simulation reads at each step. The rule for picking is where the data came from: if a value
is produced inside the simulation, its structure is a runtime-pattern question; if it
arrives over a link from a device the host does not control, what it may do to the world is
a protocol question and belongs here. The mailbox then hands a clean frame across that
seam, and the simulation's update-order rules take over from there.

The second neighbour is the observation of live behaviour as evidence. That subject asks
what a harness must observe before a behavioural claim is believed, and its ladder is
what this subject's verification climbs: a unit check that a mailbox drops a stale frame
is behavioural state on emulated input, and it is not a statement about a hand. The rule
for picking is whether the question is *what the controller protocol does* (here) or *what
counts as proof that it does it* (there). A false finding in this domain is almost always
a harness that released a contact wrongly and reported a latched button; the evidence
subject owns the discipline that would have caught it, and this one owns the specific
instrument defects (contact release semantics) that recur.

The third neighbour judges motion for quality, including how long a control may take to
produce a visible response in a given genre. That is a budget on the *whole* chain from
touch to pixel and is judged on what a viewer sees. This subject owns one slice of that
chain, the link and mailbox, and its numbers (an age limit, a quiet-link limit) are
protocol thresholds, not responsiveness verdicts. A reader asking whether the steering
*feels* immediate goes to the motion subject; a reader asking whether a frame that
arrived 300 ms old is allowed to move the car goes here.

## What was measured, and what was not

Everything stated here as a behaviour of a controller link is established on emulated and
scripted clients: unit checks against the input mailbox with hand-picked sequence numbers
and timestamps, and a scripted client speaking the protocol to a real host on a real
device. No human has held a phone and driven, and no physical handset has been put through a
sleep, a call or a Wi-Fi dropout. The techniques say for each claim whether it is measured
(a scripted check observed it), simulated (a model of the link produced it) or only
authored (it is a rule the code and the design contract state). Thresholds in particular
are chosen, not discovered: the age limit and the quiet-link limit are starting values that
a physical-handset session must confirm, and that a person must judge for feel.

## Failure modes of the naive reading

- **Transport thinking.** Choosing a low-latency socket and treating the protocol as done.
  The defects that ship are semantic and survive any transport.
- **Event frames for held controls.** A `down` and an `up` that must both arrive. One lost
  `up` is a latched button that persists until the next press on that control.
- **One stale policy.** Zeroing everything on silence makes steering snap to centre on every
  hiccup; holding everything makes a sleeping phone drive. Policy belongs to the channel.
- **Trusting the sender's clock for liveness.** The only honest liveness signal is the
  host's own receive time.
- **Connection equals seat.** Reconnection becomes forfeiture, and a returning player is
  indistinguishable from a stranger.
- **Neutral on the happy path only.** The pad clears on release, and not on the page being
  hidden, the settings sheet opening, the socket erroring or the layout switching.
- **Toggles on the wire.** A duplicated packet becomes a second press.
- **A harness that releases wrongly.** An emulated multi-touch that lifts the wrong contact
  reports a latched button that the protocol never had. Verify the instrument before
  accepting the finding.
