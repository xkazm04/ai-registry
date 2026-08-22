---
layer: technique
type: technique
subject: difficulty-design-and-adaptation
technique: player-chosen-challenge-and-adjustment-hazards
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [designing difficulty settings or opt-in modifiers, adding a system that adjusts difficulty from live performance, players have discovered how to game an adjustment, deciding whether an adjustment should be visible]
---

# Player-chosen challenge and adjustment hazards

The named concern: decide who declares the difficulty — the player or the system — and,
where a system adjusts on the player's behalf, handle the two hazards that come with it
rather than discovering them from a forum thread.

## Chosen and imposed are different objects

A challenge the player picked and a challenge the game imposed are not the same experience
even when their mechanical content is identical. The same extra enemy health, the same
tighter window, the same removed resource: one is a design the player asked for, the other
is a balance complaint.

The cleanest evidence is the class of system where players voluntarily stack constraints or
tougher opposition onto a run — and the informative detail is that such systems work **even
when the modifiers raise difficulty without raising reward**. There is no compensating
payout. The payoff is the declaration: the player has told the game what kind of experience
they want and the game has delivered it. That is a complete transaction. Apply the same
increase from the system side, unannounced, and the identical change is received as the
game being badly tuned.

So the order of preference is an ordering, not a set of alternatives:

1. **A setting the player declares** — chosen before play, revisable during it.
2. **Modifiers the player opts into** — per run, per encounter, or per objective, each with
   a stated effect.
3. **A system that decides on the player's behalf** — only where the first two cannot cover
   the spread, and only under the constraints below.

A declared preference is authoritative only if it can be revised. Skill is the term that
moves during play, so a preference declared at hour zero is an estimate of a moving
quantity; a game that makes correcting it costly, ceremonial, or content-losing has turned
a preference into a commitment and will collect players sitting on the wrong one.

## Hazard one: it punishes the player for being good

Live adjustment reads performance and raises resistance in response. Read that loop from
the player's side: they improve, and their reward for improving is a harder game for the
same payout. That is a treadmill, and players identify it accurately and quickly.

The fix is a positive requirement, not a caution. **An adjustment that raises difficulty
must raise what the run pays, proportionally and visibly — or it must be a trade the player
opted into knowing the terms.** Either the harder path is worth walking, or the player
chose it for its own sake. Anything else asks for effort and returns nothing, and the
system is then working against the exact behaviour the game wanted to encourage.

Whether the reward actually scales is a question for the reward economy and is answered
there. What belongs here is that a difficulty system which never asks it has shipped a
treadmill by default.

## Hazard two: once noticed, it is exploitable

An adjustment mechanism is a hidden regulator only until somebody works it out. After
that it is an *input*, and players optimise inputs — this is not bad faith, it is what
playing a system means.

The two canonical exploits are mirror images. Where the system eases off after failure, the
optimal play is to fail on purpose before a hard section. Where the system responds to
strong performance with tougher opposition, the optimal play is to sandbag until the moment
that matters. Both are available to any player who has noticed, and noticing spreads.

There is no stable middle, which gives the rule its shape: **subtle or explicit, never
half-hidden.**

- **Subtle** means the adjustment is small enough and slow enough that no player can
  produce a legible cause and effect from it. It regulates the tail of the distribution and
  is invisible in the middle of it. The design constraint is severity, not secrecy.
- **Explicit** means the game states what it is doing and on what basis. Once declared,
  "exploiting" it is just using a feature — which is fine, because the player is now making
  a choice, and a choice is the first item on the preference ordering above.
- **Half-hidden** is an adjustment large enough to feel, presented as though nothing is
  happening. It is the only version that loses trust, and it loses it first with the
  players most invested in the system.

## The grade the adjustment reads is a measurement, with a measurement's rules

Whatever performance signal drives the adjustment is a number and obeys the number rules.

It carries its **unit, window and basis**: graded over what, across how many encounters,
normalised against which reference. A grade computed over one encounter and a grade
computed over an hour disagree about whether the player is struggling, and neither is
wrong.

And it must have a **not-yet-graded state**. At the start of a session, after a long break,
or after a build change invalidates the history, the system does not have enough evidence
to move anything. The honest value there is *ungraded*, and the correct behaviour is to sit
at the declared starting position rather than to treat a thin sample as a middling score.
Collapsing "no evidence" into "average performance" is the collapse
[unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass) forbids, and here it
has a directly visible symptom: the game adjusts hard on the first two minutes of play.

## Procedure

1. **Exhaust declaration first.** Ship the setting and the opt-in modifiers before building
   anything adaptive; measure what spread is left afterwards.
2. **Define the performance grade** with its unit, window, basis and its ungraded state.
3. **Choose subtle or explicit, and write the choice down** as a design decision with its
   severity bound. A system with no recorded position on this drifts into half-hidden by
   accretion, one increased coefficient at a time.
4. **Pair every upward adjustment with a reward consequence**, or route the increase
   through an opt-in modifier instead.
5. **Adjust between encounters, not during one.** Changing enemy health mid-fight makes the
   player's own damage numbers lie to them, and a player who cannot trust their damage
   cannot learn the system.
6. **Instrument the exploits deliberately.** Watch for deliberate failure before hard
   sections and for performance suppressed ahead of rewards. Their presence is the
   measurement that the mechanism has become legible.

## Decision rules

- When an adjustment can be described by a player in one sentence, it is no longer subtle.
  Either shrink it until it cannot be, or declare it.
- When the choice is between a visible setting that some players will "pick wrong" and a
  hidden system that picks for them, take the visible setting. A wrong choice the player
  owns is recoverable; a correct adjustment they did not consent to is not.
- When an opt-in modifier raises difficulty, it does not need to raise reward. When the
  system raises difficulty, it does. The difference is consent, and it is the whole reason
  to prefer opt-in.
- When telemetry shows players deliberately failing, do not patch the exploit path. The
  exploit is a symptom; the mechanism became legible, and the response is to shrink it or
  declare it.
- When a build change alters what good performance looks like, invalidate the stored grades
  rather than carrying them forward. A grade is a judgment about the content it was
  measured on.

## When not to use this

- **In a competitive context between humans.** Adjusting one side's difficulty from live
  performance is a handicap system, which is a different design with different consent
  requirements, and applying it silently is a fairness failure rather than a tuning
  decision.
- **Where difficulty is the subject of the work.** A game whose whole proposition is a
  fixed, shared, non-negotiable challenge loses that proposition to any adjustment,
  including a subtle one. There the answer is teaching and telegraphing, not adaptation.
- **As a substitute for a difficulty setting.** An adaptive system is a way to handle
  residual spread inside a declared preference, not a way to avoid asking the player what
  they want. A game that adapts and never asks has taken the choice away and hidden that it
  did so.
