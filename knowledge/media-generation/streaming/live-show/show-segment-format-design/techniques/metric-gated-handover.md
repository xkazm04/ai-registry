---
layer: technique
type: technique
subject: show-segment-format-design
technique: metric-gated-handover
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [deciding when a live segment ends, a segment cuts away from its best moment or outstays a dead room, adding an extend-on-success reflex]
---

# Metric-gated handover

A segment yields to the next format when a measured condition about the room has
held for long enough — not when a minute mark arrives, and not on the first sample
that crosses a line. The clock remains, as a floor and a ceiling around the gate.
Done well, the show leaves a format at the moment the format has done its job or
run out of room, and the audience experiences the change as the show responding to
them.

## Choosing the signal

The signal is whatever the segment's premise depends on. A format that needs a
crowd (a vote, a mass verdict) gates on audience size; a format that needs talk
gates on chat rate; a format with its own mechanic gates on participation in that
mechanic (submissions, entrants, guesses). Pick **one** primary signal per
handover. A composite of five weighted signals is untestable — nobody can say why
the segment ended — and a handover the owner cannot explain is one the portfolio
cannot learn from.

A gate may point either way. An *exit* gate ends the segment when its condition is
met or exhausted (participation fell below a floor; the scoreboard has a winner).
An *entry-readiness* gate hands over when the room has become what the next format
needs (enough viewers have arrived for the crowd format to work). Both are the same
mechanism; the table says which.

## Procedure

1. **Declare the gate in the segment's table:** signal, comparator, threshold, and
   sustain window, plus the floor and ceiling of the clock and the next format.
2. **Require the condition to hold for the whole sustain window.** Track the time
   the condition has been continuously true; reset it when the condition breaks.
   The window is long enough to outlast one burst (a group arriving together, a
   single spammy minute) and short enough that the audience still connects the
   change to what they did — typically tens of seconds to a couple of minutes.
3. **Respect the floor.** Before the floor, the gate is not evaluated; the premise
   has not had time to pay off, and a segment abandoned in its opening teaches the
   audience that formats are not worth learning.
4. **Enforce the ceiling.** At the ceiling the segment hands over whatever the
   signal says, and the event records "ceiling", not "rule". A format that hits its
   ceiling most runs has a gate that never fires — a design defect, not a success.
5. **Announce, then give the host a grace period.** When the gate fires, the
   segment enters a pending-handover state and the host is told. The host closes the
   premise (who won, what was decided) and introduces the next format in one move —
   ideally with a bridge the format itself supplies, such as a guest's dare that sets
   up the next segment's premise. If the host has not made the switch when the grace
   period lapses, the runtime completes it. Without the grace period the change is a
   hard cut that leaves a debt the audience notices; without the fallback, a host that
   misses the cue keeps the old segment running indefinitely.
6. **Record the cause** of every handover — rule, ceiling, operator — with the
   signal's value, so the portfolio can tell a format that ended on its own terms
   from one the clock had to rescue.

## The extend and cut reflexes

When a segment is running far above its own baseline, extend it once, by a fixed
increment, and re-evaluate at the new ceiling. The threshold is measured against
the segment's own history (a multiple of its standard deviation above its mean),
not a raw number, so a format that is always loud does not extend every night.
Cap the number of extensions per run: a reflex that can fire without limit is a
ceiling that does not exist. A format with no history has no baseline and does
not extend — its high reading is unmeasured, not exceptional.

The mirror reflex cuts a segment short and hands over when it runs far below its
baseline — and it needs a sustain window of its own, measured in minutes rather
than seconds, because a format in a slow patch recovers more often than one on a
hot streak collapses. Set the cut threshold further from the mean than the extend
threshold: leaving a format early costs the premise its payoff, and that cost
should need stronger evidence than giving a hit ten more minutes.

## Decision rules

- **When the signal is unavailable** (the metric feed dropped, the count is stale),
  do not treat it as the condition being met or broken. Hold the segment to its
  ceiling and record the handover as signal-missing; an absent number is not a
  low number.
- **When an operator overrides**, the override wins and is recorded as such; the
  segment's score for that run is marked, because the format did not decide.
- **When two segments share a signal**, give them different thresholds or windows,
  or the show oscillates between them on the same reading.
- **When the numbers are first chosen**, label them assumptions in the table itself
  and plan the comparison that will replace them (two ceilings tried over the first
  weeks, say). A threshold nobody has measured is a guess, and the table should not
  let a reader mistake it for a finding.

## When not to use it

A segment whose premise is inherently timed — a countdown, a fixed-length lightning
round — should hand over on its timer, because the timer is the premise. Gate the
segment that follows it, not the timed one.

## Failure modes

- **Single-sample gates** — the show lurches on one burst and lurches back.
- **Ceiling as the real rule** — a threshold set so high it never fires; every
  handover is the clock in disguise.
- **Gate with no floor** — a segment ends ten seconds in because the room was briefly
  already in the target state.
- **Unbounded extension** — the hit format eats the night and the portfolio never
  measures anything else.
- **The forgotten cue** — the gate fires, the host never acts on it, and nothing
  completes the switch.
- **The format with no exit** — a segment declared with no handover rule at all,
  ending only when the host chooses to leave it.
