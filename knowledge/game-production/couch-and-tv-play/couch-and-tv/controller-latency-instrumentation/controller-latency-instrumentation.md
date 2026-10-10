---
layer: golden-path
type: golden-path
subject: controller-latency-instrumentation
status: forged
use_when: [measuring how late a phone-as-controller input reaches the screen, reporting latency percentiles from a live session, deciding what a latency number is allowed to be called, filming a flash test to get a true input-to-photon figure]
techniques:
  - ping-pong-midpoint-clock-offset
  - best-rtt-sample-selection
  - exact-window-plus-histogram-quantiles
  - optical-flash-frame-count-protocol
  - consumption-age-versus-photon-age-labelling
  - window-percentiles-are-not-poolable
  - tick-sampled-versus-event-recorded-age
---

# Controller latency instrumentation

A phone becomes a controller for a game that runs on a television, and from that moment
"how late is the input" stops being one quantity. It is at least four: the time a message
takes to cross the radio and back, the time between the finger and the moment the
simulation reads the message, the time between the finger and the display scanning out a
frame that shows the result, and the time a player perceives, which also includes the
brain. Each has a different instrument, a different owner and a different failure mode,
and a team that owns only the cheapest instrument will report the cheapest number under
the most flattering name. This subject is the measuring machinery: how to get each number
honestly, how to store it without lying about its tails, and how to label it so it cannot
be read as a neighbour.

## Boundary with the latency norms

The neighbouring subject on motion quality owns the rubric: what response budget a genre
holds each action class to, and the rule that a norm table describes the genre and never
the build. This subject owns the instruments that produce the build's own numbers. The
rule a reader uses to pick: when the question is "what should this figure be", read the
norms; when the question is "how was this figure obtained, what does it mean, and may I
compare it to a norm", read here. The two meet at one place, and it is a refusal: a
number from this subject may be set beside a norm only when its label says it is a
photon-side measurement, because a consumption-side figure can pass a budget the player
still feels as lag. Nothing here proposes a budget; where a budget is quoted it is
somebody else's proposal and carries that label.

## The four numbers, and which one is which

The round-trip time is what a ping measures: radio out, radio back, in the controller's
own clock. It needs no clock agreement and so it is the one number every team already
has, and it is the wrong answer to almost every question asked of it. It contains the
return leg, which the player never waits for, and it excludes everything that happens
after the message is read.

The consumption age is the interval from the instant the controller stamped an input to
the instant the simulation consumed it, expressed in one clock. It needs the two devices'
clocks related, which is the offset estimate, and it is the first number with the shape
of a one-way latency. It still stops at the simulation. A frame has not been drawn, the
display has not scanned it, and the panel has not switched its pixels.

The photon age is the interval from the finger to the first display frame that visibly
carries the answer. It can only be observed from outside the system, by a camera that
sees both the finger-side event and the screen. It is the only number that includes
render queueing, buffer swaps, the display pipeline and the panel, and on a television
those can exceed everything upstream of them.

The perceived latency is a human judgement that no instrument yields directly; it is
what a playtest or a blind comparison supplies, and none of the machinery here
substitutes for it. A project whose numbers all came from scripted clients has the first
two and, at best, a procedure for the third.

The gap between the second number and the third is not noise to subtract; it is the
whole reason to keep them apart. The consumption age is fast to collect, continuous and
cheap enough to run for hours, so it is the right instrument for regression and tails.
The photon age is slow, manual and sample-limited, so it is the right instrument for the
claim. A team that collects the first and states the second has made a claim with no
evidence behind it; a team that collects only the second cannot see a tail that appears
fifteen minutes into a session.

## What each number rests on

The consumption age rests on a clock estimate, and the estimate rests on an assumption
that deserves to be said aloud: the path out and the path back take equal time. Under that
assumption the controller's clock differs from the screen device's clock by the screen
device's timestamp minus the midpoint of the controller's send and receive instants. When
the paths are asymmetric the error is bounded by half the round trip of the sample used,
which is why the lowest-round-trip sample is preferred: it carries the tightest bound and
the least queueing. The estimate has an error bar of its own, and any consumption age
smaller than that bar is not distinguishable from zero. Do not clamp negative ages to
zero without counting them; a negative age is the instrument reporting that its offset is
wrong. Two further assumptions hide in the same estimate. The first is that the screen device
answered at once: with a single reading of its clock, any time it spends before answering is
charged to the outbound leg, so a reply queued behind the game loop biases the offset by half
the wait. The second is that the controller's clock kept running. A phone page's clock can
pause while the device sleeps, so a resume invalidates the offset just as a reconnect does,
even when the socket survived.

The consumption age also rests on a choice made before any number exists: when a sample is
taken. Sampling the held input's age on every simulation step measures how stale the state
was, and it includes the controller's send interval. Recording once per arriving message
measures flight time and goes blind whenever the controller stops sending. Recording once per
player action, from the action's own timestamp to the step that consumed it, is the only one
of the three that is the latency of an action. Each is defensible; an unnamed one is not.

The percentiles rest on a storage choice. A live service cannot keep every sample for
ever, so it keeps a bounded window exactly and a bounded histogram for the lifetime. The
window answers "what is it doing now" without approximation; the histogram answers "what
has it ever done" with a stated resolution and a stated cap, and with the exact maximum
and exact count kept beside it, because the histogram's last bucket swallows everything
above the cap. Percentiles of different windows cannot be combined by arithmetic, so a
long run is summarised by merging the underlying distributions or by reporting the worst
window with its own label, never by averaging the quantiles.

The photon age rests on a camera. A flash test makes the screen do something unmistakable
exactly once per input; a high-frame-rate camera sees the input and the flash in one
shot; the count of camera frames between them, times the camera's frame period, is the
latency. The resolution is one camera frame, and an input that lands at a random phase of
the display refresh adds a spread of one display frame that no camera can remove, so the
protocol takes many taps and reports a distribution, never one tap. The film is only as
honest as its start event. The controller's own flash appears after the phone has drawn it,
tens of milliseconds after the touch and after the message has already left. A film that
starts there measures a lower bound, and the shortfall changes from tap to tap. The start
has to be the touch itself, instrumented, or the phone's own leg has to be filmed and
carried beside the figure.

## Labels are the deliverable

Every figure leaves this system with its name, its unit, its clock basis and the thing
that produced it. "Input age" is a consumption figure and says so; "ack round trip" is a
radio figure and says so; "optical" is reserved for a figure that came from a film. The
cost of a missing label is not that the number is wrong but that it is read as the next
number over, and the two typical misreadings have opposite signs: a round trip is read as
the one-way latency and overstates it by the return leg, a consumption age is read as the
photon latency and understates it by the display pipeline. A flattering misreading is
more dangerous than an alarming one, because nobody investigates it.

The unmeasured state gets its own label too. A photon figure that nobody filmed is not
zero and not "within budget"; it is not measured, and a report with no optical row says so
in words. This is the same refusal the norms subject makes about manufacturing numbers,
applied one layer down: the machinery never fills a gap to make a report look complete.

## Disagreeing with the first story

Instrumentation exists partly to refuse the obvious explanation. A long latency tail on a
wireless link is blamed on the wireless link before anybody measures it; the cheap
experiment is to measure two paths at once, the application's own path and an unrelated
service on the same device over the same radio, and ask whether the application's stalls
coincide with the radio's. When none do, the radio is exonerated by data and the search
moves to the application's own frame loop, which is where such tails usually live. The
same discipline applies to this subject's own numbers: when the round trip is fine and the
consumption age is not, the difference is on the screen device, and the instruments
already say so.

## What the naive setup gets wrong

- **It reports the ping as the latency**, and the number includes a leg the player never
  waits for while excluding the pipeline they do.
- **It trusts the first clock sample**, which is as likely to be a queued one as a clean
  one, and carries an error bar nobody wrote down.
- **It averages the windows**, so the one window that contained the stall dilutes into
  the quiet ones and the tail disappears from the summary meant to show it.
- **It stores percentiles instead of distributions**, so nothing downstream can be
  recombined or re-cut once the question changes.
- **It calls the consumption age the input-to-screen latency**, and the project passes a
  budget nobody measured on the surface the player looks at.
- **It films one tap**, or films at a frame rate whose period is the size of the effect.
- **It starts the film at the controller's flash** and reports the remainder as
  input-to-photon, short by the phone's whole touch-to-photon latency.
- **It records age when messages arrive, stamped when they were sent**, so a controller that
  froze for a fifth of a second leaves no trace in the distribution.
- **It keeps the offset across a sleep** because the socket stayed open.
- **It fills the optical row from the network figures** because the row looked empty.
- **It lets a clamp hide a bad clock**, so a mis-estimated offset shows up as a
  suspiciously low latency instead of as an error.

## Seams with neighbouring craft

Getting the input to the screen device at all, in order and with loss accounted, is the
input protocol's concern; this subject measures what that protocol delivers and does not
design it. Making a stall reproducible on the real device and capturing evidence from it
belongs to on-device verification. What the device itself does to frame pacing, and which
of its behaviours are quirks of the hardware class, belongs to device realities. This
subject only insists that whatever those subjects find is recorded with the label that
says how it was measured.
