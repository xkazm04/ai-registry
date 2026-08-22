---
layer: golden-path
type: golden-path
subject: combat-pacing-and-dramatic-arc
status: forged
use_when: [an encounter tests fine but feels flat, deciding whether a fight runs too long or ends too fast, turning simulation output into notes a designer can act on, defining what good pacing means numerically]
techniques:
  - intensity-and-threat-tension-curve
  - beat-taxonomy-climax-comeback-deadzone
  - difficulty-band-classification
  - encounter-duration-envelopes
  - plain-language-fight-report
---

# Combat pacing and dramatic arc

Two encounters can share a win rate of 78%, a mean time-to-kill of 22 seconds, and a
damage-taken figure within a percent of each other. One is the fight players talk about
afterwards; the other is the one they learn to skip. No scalar separates them, because
every scalar is an aggregate over the encounter, and pacing is exactly what aggregation
destroys. The first fight spent its 22 seconds *building* — pressure climbing, a moment
two hits from death, a recovery that the player earned. The second spent its 22 seconds
in a safe middle. The averages are identical. The experiences are not adjacent.

So the question this subject answers is not *how hard is this fight*. It is *what does
this fight do over time*. Concretely: a function from encounter time to a bounded scalar,
sampled finely enough to resolve events, mined for named moments, classified into a band
someone can act on, checked against a duration envelope, and reported in words. Everything
below is downstream of that one move — from a number to a shape.

## The two terms, and why neither works alone

The curve is built from two normalized terms with different meanings.

**Intensity** is how much is happening: consequential events per unit time. Damage flux is
the usual carrier — damage dealt and taken inside a short window — with high-consequence
events weighted above their raw magnitude, because a critical hit or a burst that removes a
third of a health bar reads louder than the same total delivered as a trickle. A weight in
the region of 1.3–1.4 on critical events is enough to make spikes legible without letting
them dominate.

**Threat** is how much is at stake: normalized distance to failure, most simply one minus the
player's remaining health fraction. Threat does not care whether anything is happening. It
rises as the player runs out of room.

Blend them and you have a tension value per window. An even split is the honest starting
point; a slight lean toward threat — in the region of 55 to 45 — holds up better in practice,
because stakes age well and spectacle does not. Add one nonlinearity: when the defender drops
below a small fraction of its resource, roughly a quarter, push the blended value up by a
fixed amount. A linear blend under-reports the last sliver of a health bar, which is the part
players remember most vividly.

Each term alone has a characteristic, opposite failure:

- **Intensity alone** reads a busy but safe fight as maximum drama. A player at full health
  clearing a trash pack produces enormous damage flux and no stakes whatsoever. The
  instrument reports a masterpiece; the fight is a fireworks display.
- **Threat alone** reads a slow grind as sustained tension. A player parked at 20% health
  chipping down an over-tuned enemy for 40 seconds registers as a sustained peak. Players
  report the same stretch as tedium, because anxiety without events is not drama.

Drama is *events that matter*. The blend is the encoding of "that matter", and it is the
single load-bearing idea in this subject. Everything else is bookkeeping around it.

The construction generalizes past a health-bar duel, and it should be transplanted rather
than copied. Intensity is any normalized rate of consequential state change; threat is any
normalized distance to a failure state. A survival wave: enemies engaged per window against
the fraction of the defended objective's integrity already lost. A racing game: position
changes and contact events per window against the gap to the last qualifying place. A boss
rush: ability usage density against the smallest remaining margin across the run. If a genre
has a failure state and a rate of consequence, it has a tension curve.

## A tension value without its basis is not a number

The law that a number carries its unit and its basis is not decoration here. A tension of
0.7 means nothing until three things are stated: the window length it was integrated over,
the reference it was normalized against, and the sample rate. A curve computed on
half-second windows and a curve computed on two-second windows disagree about whether
anything spiky exists, and neither is wrong.

Two choices in that block deserve to be made rather than defaulted. The **window** should
match the bucket size any sibling detector already uses on the same timeline — if a separate
check declares a two-second bucket empty, the curve should be integrated over two seconds, or
the two instruments will disagree about whether a lull exists. The **sample step** is then a
fraction of the window, a quarter is comfortable, so the curve is oversampled relative to its
own resolution and a beat cannot fall between samples. And the whole computation must be
deterministic: same timeline in, same curve out, no wall clock and no randomness, because a
curve that cannot be reproduced cannot be diffed across a tuning pass.

The specific error worth naming, because almost every first implementation commits it, is
**self-normalization**: dividing by the maximum observed in *this* fight. It is seductive
because it always produces a well-shaped curve in the range zero to one. It also guarantees
that every encounter peaks at 1.0 — a trivial fight and a lethal one both max out — and it
destroys every comparison between encounters, between tuning passes, and between builds.
Normalize against a fixed external reference instead: effective player health per second at
the encounter's intended difficulty, a declared damage baseline, a stated survivability
budget. Curves then mean the same thing across the whole game, which is the only condition
under which "this fight is flatter than that one" is a statement rather than an impression.

The corollary is that exactly one implementation owns the tension quantity. A second, simpler
model kept around for a dashboard will disagree with the first, and the disagreement stays
invisible until someone ships a tuning decision on the wrong one.

## Beats: the curve is mined, not admired

A curve is not yet a finding. A designer cannot act on a polyline; they act on named events —
*this fight has no climax*, *there is a nine-second stretch where nothing happens*, *the
comeback lands before the peak instead of after it*. Beat detection is the step that converts
shape into vocabulary, and the vocabulary is what the rest of the pipeline consumes.

Two properties make a beat taxonomy usable. First, every beat is a **detectable signature**:
a stated rule over the curve, not a human reading a chart. Second, every beat carries a
**design meaning** — what its presence or absence tells you to change. A beat that fires but
implies no action is a metric, not a beat, and should be deleted.

The distinction that catches everyone is between a **breather** and a **dead zone**. Both
look like a low stretch of curve, and they mean opposite things: one is authored recovery
that a long fight cannot do without, the other is absence of design. A detector keyed on
level alone reports them identically. What separates them is not depth but *definition*.

A breather is a **relative** feature of the blended curve: a local minimum with prominence on
both sides — the running maximum before it and the running maximum after it both stand clearly
above it, by a stated margin. That is what makes it a lull *between* intense moments rather
than a quiet fight. A dead zone is an **absolute** feature of the raw event stream: a run of
time in which literally nothing consequential happened, lasting at least one window, with
activity on both sides of it so that the quiet is interior rather than the head or tail of the
encounter. Compute one on the smoothed blend and the other on the unsmoothed flux, and the two
stop competing for the same stretch of fight.

## Bands are named for what you do about them

The end of a pacing analysis is a classification, and the classification must survive contact
with someone who does not read code. Two rules govern it. Bands are **named for the action
they imply** — a band called *tough* tells a designer this fight is meant to be a wall and is
succeeding; a band called *brutal* tells them to cut something. A band called *tier 3* tells
them nothing. And the **boundaries are stated as numbers in the output**, not implied by a
colour swatch or a bar length. A designer who cannot see where the line sits cannot tell
whether their change moved the fight or moved the fight barely at all.

## Duration is a two-sided envelope

Length is the other axis a scalar difficulty number hides, and it fails in both directions.
A fight over in under about three seconds is trivial regardless of how it was tuned: no arc
fits inside it, and the curve has no room to do anything. A fight past about forty-five
seconds is *spongy* — the failure is not that the enemy is too strong but that it takes too
many hits, which players read as the game refusing to acknowledge their input. The same
doubling shows up on the player's side: a death inside about five seconds is punishing rather
than hard, because a death nobody could see coming teaches nothing, while a death later in the
fight is only a statement that survival was not guaranteed.

Those bounds have a structural companion that fires before any trial runs: when the combined
health of the opposition exceeds the player's effective health by a large multiple — five
times is a serviceable alarm — the encounter will be tedious whether or not the timer agrees.

Envelopes therefore have a floor and a ceiling, both stated per encounter class, and the two
are checked separately because they have different fixes. Spongy is a health problem;
punishing is a damage problem. Collapsing them into one "difficulty" knob is how a tuning
pass makes both worse.

## The report is part of the instrument, not documentation of it

The last step is the one most teams treat as optional and it is the one that determines
whether any of the previous four change a decision. A metric a designer cannot interpret does
not change any decision — it is computed, displayed, and ignored. So the plain-language layer
is not a write-up of the instrument; it is a component of it, and it fails the same way a
miscomputed curve fails.

What that means in practice: every metric that reaches a human ships with a definition in
ordinary words, a worked example with real units, and the design judgment that makes it
actionable — *a one-shot rate above roughly five percent reads as unfair*, *an ability used a
tenth of a time per fight should be buffed or cut*. Those judgments are the expensive part.
They are the accumulated opinion of people who have tuned fights, and writing them next to
the number is what converts a telemetry dump into a design conversation. When the numbers
support it, naming a single dominant cause — one damage source responsible for a large share
of deaths — is worth more than any distribution, because it points at one thing to change.

Two moves make the prose land. Express a rate as a small count rather than a percentage —
*you win seven of ten tries* is picturable in a way that *0.71 survival* is not. And keep the
prose layer reading its thresholds from the same source as the checks: the moment the narrated
card calls a fight a slog at thirty seconds while the alert that gates it fires at forty-five,
the tool contradicts itself in front of the person it was built to convince, and it only takes
one such contradiction for a team to stop trusting the whole readout.

## Failure modes of the naive reading

- **Tuning the peak instead of the shape.** Raising maximum tension is easy and usually makes
  the fight worse. The complaint "this fight is boring" is far more often *no variance* than
  *not intense enough*.
- **Averaging the curve across runs and losing the drama.** A median curve over a thousand
  simulated fights is smooth by construction. The interesting fact is often that twelve
  percent of runs contained a near-death. Report the distribution of beats, not the mean of
  the curve.
- **Treating a target curve as the goal.** There is no single correct arc. A boss wants a
  long build and a late climax; a trash pack wants to be over. The instrument tells you what
  shape you have; what shape you *want* is a design decision, and a tool that optimizes toward
  one canonical curve will flatten a game into one fight repeated.
- **Grading a fight by its worst beat.** One dead zone in a three-minute boss is a note. The
  same detector applied to a ten-second encounter is measuring its own window size.
- **Reading silence as health.** No detected beat is not a passing grade; it is the signature
  of flat pacing, and it should be reported as a finding rather than as an empty list.

## Where this subject stops

Producing the event timeline is somebody else's job. The simulation harness that runs many
trials against configured presets, holds seeds, attributes kills to sources, drives goal-seek
searches over stats and lints an encounter against its peers is a neighbouring concern; this
subject consumes whatever timeline that produces, and works equally well on a timeline
captured from real play. The semantics of the individual attacks — telegraph windows,
escapability, cancel rules — are another neighbour, upstream of the curve rather than part of
it.

So is the design-side model this instrument reports against. What difficulty is made of, which
of its terms a designer can actually set, who is allowed to choose the setting, and what a
system may adjust while the player is watching are a separate subject. A curve says the fight
is flat; it does not say which lever to move, and this subject deliberately does not either.

One neighbour deserves more than a boundary line, because it shares this subject's central
idea one level up. The same pacing thinking applies at room-graph scale, where the questions
are whether three or more combat spaces run back to back, whether difficulty jumps or drops by
a large step between adjacent spaces, whether the ramp climbs monotonically for so long that
it stops reading as a ramp, and whether a boss has a rest space next to it. Those checks are
owned as level-design work and are not restated here. What transplants is the principle: **rest
is a designed beat with a duration budget, not leftover space.** The failure has the same shape
at both scales — unbroken pressure, or a flat stretch nobody put there — and a team that
learns to see it in a thirty-second fight will see it in a thirty-minute zone.
