---
layer: technique
type: technique
subject: controller-latency-instrumentation
technique: tick-sampled-versus-event-recorded-age
status: forged
laws: [a-number-carries-its-unit-and-basis, an-instrument-proves-it-had-input, unmeasured-is-not-a-pass]
shared_with: []
use_when: [deciding when a latency sample is recorded, a consumption-age figure is about to be read as the latency of a player's action, a stall on the controller side must show up in the numbers, two age distributions from the same session disagree]
---

# Tick-sampled versus event-recorded age

An age distribution is defined by its interval and by when a sample is taken. Two recorders
can share the interval, from the controller's stamp to the screen device's clock, and still
answer different questions, because one samples on the consumer's clock and the other
records when something arrives. The second choice is usually made by whoever wrote the
recorder, in whichever loop was handy. It is rarely written down, and it decides what the
tail means.

## The three bases

**Tick-sampled state age.** Each simulation step reads the latest held input and records how
old its stamp is. The samples are weighted by time: one per step whether or not anything
arrived. This is the age of the state the simulation acted on. It keeps counting while
nothing arrives, so a sender that stops sending (a frozen page, a dropped radio, a locked
screen) shows up in proportion to how long it stopped. It also counts the sender's own
cadence. A controller that resends its state on a heartbeat, or only when something changes,
holds each message until the next one, and every step in between records that hold as age.
So it overstates the latency of any single action, and the steady-state overstatement scales
with the send interval, not with the network.

**Event-recorded arrival age.** Each message records its age once, when it arrives. The
samples are weighted by message, and an interval in which no message was sent contributes no
sample at all. This is coordinated omission in its plainest form. The recorder only measures
when the measured system lets it, so the worst moments go unweighted. If the stamp is taken
when the sender gets round to sending, rather than when the action happened, a frozen sender
does not just go unweighted. It goes unseen: the message sent after the freeze carries a
fresh stamp and a small age. This basis excludes the wait for the consumer's next step, so it
understates the latency of an action from the other side.

**Action latency.** The interval from the moment the player acted to the first simulation
step that consumed the resulting state, recorded once per action. This is the quantity a
reader assumes either of the other two is. It needs the action's own time as the stamp,
which is the input event's timestamp where the platform provides one, not the time the
handler sent the message. It needs the consumer to note which step first read it.

None of the three is the correct one. They answer different questions: how stale the
simulation's view was, how long a message was in flight, and how long an action took to take
effect. A report that names only "input age" has picked one and hidden which.

## Procedure

1. Write the basis into the quantity's definition, beside its start and end events: per step,
   per arrival, or per action.
2. If only one basis can be afforded in the hot path, prefer the tick-sampled one for
   regression and stall detection, because it cannot be blinded by a silent sender. Label it
   *state age*, and state the controller's send interval beside it so a reader can see the
   floor it adds.
3. Before quoting any figure as the latency of a player's action, record the action basis, at
   least for a soak: stamp from the input event, and record at the first step that consumed
   it.
4. When the same session yields two bases, report both, side by side, never merged into one
   distribution. Merging per-step and per-message samples weights the result by a ratio
   nobody chose.

## Decision rules

- **When a controller freeze must be visible, do not rely on a per-arrival recorder whose
  stamp is taken at send.** Either sample per step, or stamp from the input event.
- **When a per-step age is read as action latency, subtract nothing and relabel it.** The
  hold component depends on the send cadence and on what the player was doing, so it is not
  a constant.
- **When the send cadence changes (an idle heartbeat versus an active one), treat the
  state-age figures from the two regimes as separate populations.** The same network gives
  different tails.
- **When the consumer's own loop stalls, neither the per-step nor the per-action basis sees
  it from inside.** No step means no sample. Count missed or late steps separately, from the
  frame-time recorder.
- **When a correction for coordinated omission is applied after the fact, say so.**
  Back-filling the samples that should have been taken is an estimate, and it is not
  interchangeable with samples actually taken on a clock.

## When not to use it

- **When the controller sends a continuous stream at a fixed rate well above the simulation
  rate and the sender never stalls.** The three bases then differ by a fraction of a step,
  and labelling the one in use is enough.
- **For the optical figure.** A film has its own basis, one sample per filmed action, and the
  optical protocol governs it.
