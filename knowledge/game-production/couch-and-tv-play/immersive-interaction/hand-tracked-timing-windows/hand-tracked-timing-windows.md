---
layer: golden-path
type: golden-path
subject: hand-tracked-timing-windows
status: draft
use_when: [a timed defence or perfect-timing reward is judged from a tracked hand rather than a button, a recognised gesture arrives frames after the player moved, the hands leave the sensor's view or lose confidence during a timed action]
techniques:
  - onset-recovered-from-tracking-history
  - sensor-latency-inside-the-window-budget
  - confidence-gated-detection
  - tracking-loss-as-a-game-state
---

# Hand-tracked timing windows

A reward window, such as a perfect block, a parry or a timed counter, asks one question:
did the player act at the right moment? With a button the question is easy, because the
press is the act and its timestamp is the moment. With a tracked hand it is not. The act is
a motion. The sensor reports it some tens of milliseconds late, with a confidence that
falls exactly when the motion is fast, and it sometimes stops reporting altogether. A pose
classifier then needs several confident samples before it names the motion. If the game
judges the window at the moment the classifier speaks, every player is judged late by the
sum of all of that, and the amount varies with how fast they moved, how well they were
tracked and which runtime version the device is on. This subject owns the timing of a
tracked hand: recovering when the motion actually began, budgeting the sensor's delay and
doubt inside the window, and treating the absence of tracking as a state the game handles
on purpose.

## Boundaries, stated first because the one-copy rule binds here

Windows in general belong to the combat semantics subject: what a window is, how a defence
splits into a player-timed trigger and a stat-driven magnitude, and how a timer is made
escapable. The general rule that a window is judged from the input's onset and not from its
recognition holds for any recognised input, and it belongs there too. This subject owns
only how that onset is **recovered from a tracked sensor**, and what the sensor's latency,
confidence and loss do to the window.

Three neighbours own rules this subject uses and does not restate:

- **Measurement** of input-to-photon and consumption-side latency belongs to controller
  latency instrumentation, through its
  [optical flash frame-count protocol](../../couch-and-tv/controller-latency-instrumentation/techniques/optical-flash-frame-count-protocol.md)
  and its
  [consumption-age versus photon-age labelling](../../couch-and-tv/controller-latency-instrumentation/techniques/consumption-age-versus-photon-age-labelling.md).
  A tracked-hand latency figure is obtained and labelled by those rules.
- **Releasing what a lost input held** is the general rule of
  [neutralise on every loss path](../../couch-and-tv/phone-controller-input-protocol/techniques/neutralise-on-every-loss-path.md).
  This subject adds only the sensor's own loss modes and how the game presents them.
- **Where window widths and thresholds live** is
  [canon as the single source of thresholds](../../../systems-canon/design-canon-as-executable-law/techniques/canon-as-single-source-of-thresholds.md).
  Every width, confidence floor, lookback and grace interval named below is one of those
  thresholds.

## The four timestamps

A tracked defensive motion has four instants, and a design that names only one of them
cannot be fair.

1. **Onset**: when the hand started moving with intent. This is what the player experiences
   as "I blocked", and it is what the window should be judged against.
2. **Capture**: when the sensor sampled the frame that first shows the motion. It comes
   after onset by up to one sensor frame.
3. **Delivery**: when the tracked pose reaches the game. It comes after capture by the
   tracking pipeline's latency, which is the bulk of the delay and changes with runtime
   versions and tracking modes.
4. **Classification**: when the game's pose or motion classifier, after its confidence and
   hold requirements, names the action. It comes after delivery by however many samples the
   classifier needs.

The fair verdict uses the onset, recovered from history once classification has happened.
Feedback can only follow classification, so the player sees the result late. The design
therefore has two budgets: a **judgment** that is fair to the onset, and a **presentation**
that hides or tolerates the delay between onset and feedback.

## What a principal practitioner holds true

**Judge the onset; it is in the history.** By the time a classifier names a block, the
tracking history already holds the samples where the motion began. Search backwards from
the classification for the point where speed rose out of rest, or where acceleration turned
positive, within a bounded lookback. Use the capture timestamp of that sample, not the
frame time at which it was processed. A threshold crossing on its own lands late, because
by the time speed crosses a detection threshold the motion is well under way. The backward
search to a lower threshold is what removes that bias. The search has one trap. A hand
usually settles at the top of a raise before it turns into the accepted pose, so the walk
from the classification meets stillness before it meets the motion. The walk crosses a
bounded settle first, then walks the fast region, and it stops at the last release.

**The sample grid is the floor of the error.** With the onset recovered, extra pipeline
latency stops moving the verdict. What remains is the sensor's sampling. A camera that
updates more slowly than the game runs shows the start of a motion up to one camera period
late, by an amount set by the phase between the motion and the camera clock. A bar of "one
game frame" fails on that grid however well latency is handled. Either the window tolerates
one sensor period, or the onset is stamped earlier by a measured fraction of it.

**Latency belongs inside the budget, not on top of the width.** A window widened by hand
until tracked play "feels right" carries an unknown amount of compensation that breaks the
moment the runtime changes. Write the window once, in onset time, and keep the channel's
measured latency as a separate, labelled parameter. With that, the same rule ships on a
button channel and a tracked channel, and a runtime update changes one measured number, not
a tuned feel.

**A window cannot close before its latest sample can arrive.** If verdicts are judged on
onset time, the game must wait until every sample that could fall inside the window has
been delivered and classified before it declares a miss. That horizon is the sensor's
measured high-percentile latency plus the classifier's hold. Declaring the miss earlier
punishes the players with the slowest tracking.

**Confidence is lowest when the defence happens.** Fast motion blurs, the hand turns edge-on
and fingers occlude each other. The samples in the middle of a block are the least
trustworthy samples in the session. A reward must not be earned from a low-confidence pose.
A brief dip should defer the decision for a bounded few samples rather than reject it
outright, because rejection on the dip is a systematic penalty on fast players.

**Tracking loss is a game state, not an error.** The hands leave the view, overlap or drop
below the confidence floor many times a session. The game decides what the simulation
receives during the gap: the last state for a short, bounded coast, then neutral. A held
defence does not persist through a long gap. It also decides what the player sees, a frozen,
faded or coloured hand, so the player can tell a lost hand from a failed block.

**Re-acquisition is a teleport, and a teleport looks like fast motion.** When a hand comes
back into view at a new position, the jump between its last and first samples has huge
apparent speed. An onset detector or a swipe recognizer that reads velocity will fire on
it. Mark the first samples after re-acquisition as untrusted for motion, and never recover
an onset across a gap.

## The load-bearing distinctions

- **Onset time versus classification time.** The first judges, the second presents.
- **Measured latency versus tuned width.** The first is a number with a protocol. The
  second is a feel that hides the first.
- **Deferring versus rejecting a low-confidence sample.** Deferral waits a bounded time for
  confident data. Rejection decides now. Each is right in different places, and the choice
  is written down.
- **Gap versus loss.** A gap is shorter than the coast bound and is bridged. A loss is
  longer, and it ends what the hand was holding.

## What the naive build gets wrong

- **It judges the window when the classifier fires**, so every block is late by the
  pipeline delay, and late by more for faster motion.
- **It widens the window until the author's blocks land**, which bakes the author's device
  and runtime into the canon.
- **It declares a miss as soon as the window closes in game time**, before slow samples
  can arrive.
- **It awards a perfect from a low-confidence pose**, or rejects every fast block because
  confidence dipped.
- **It holds the last pose through a long loss**, so a ward stays up while the hands are in
  the player's lap.
- **It reads re-acquisition as a swipe** and casts or blocks on a hand coming back into view.
- **It treats a hand first seen already in the pose as fresh**, so a ward held while the
  sensor was blind earns a perfect.
- **It recovers the onset in a test resolver and judges the live window at classification**,
  so the fairness is proven in a test the game never runs.
- **It computes speed between game frames on a slower sensor**, so re-sent poses read as
  stops and each new camera sample reads as a burst.
- **It quotes the vendor's latency figure** instead of measuring its own build on its own
  device, with a label.

## Seams with neighbouring craft

Recognising which motion or pose the hand made belongs to drawn-gesture command recognition.
This subject consumes its classification and the sample history behind it. Recording real
hand sessions and replaying them against the window rules belongs to tracked-input record
and replay. Teaching the timing, and how forgiving a first window should be, belongs to
learning-curve and difficulty design.
