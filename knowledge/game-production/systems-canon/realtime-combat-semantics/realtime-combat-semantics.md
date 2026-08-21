---
layer: golden-path
type: golden-path
subject: realtime-combat-semantics
status: forged
use_when: [porting turn-based or spreadsheet rules into a real-time action game, reviewing a combat system that runs continuously, designing an ability that damages an area or ticks over time, diagnosing double hits or diverging health values]
techniques:
  - telegraph-or-homing-for-area-effects
  - real-time-timers-with-an-escapable-window
  - active-defense-two-axis-split
  - hit-dedup-per-swing
  - single-source-of-health-truth
  - death-via-state-tag-not-input-disable
---

# Real-time combat semantics

A combat system on paper is a function: inputs are two stat blocks and a chosen action,
the output is a number, and the moment at which it resolves is a fiction of the reader's
attention. A combat system in real time is not a function. It is a continuous process
observed by someone who is moving, who cannot see the whole state, who is holding a
button down, and who will be dead or elsewhere before the process finishes. Every rule
that was fair on paper has to be re-derived under those conditions, and most of them
change shape when you do.

This subject is the body of law that governs that re-derivation. It is not about damage
formulas, stacking buckets, mitigation order or rarity — those are genre canon and are a
separate concern, and they are equally true in a turn-based build of the same game. What
follows is the part that is true only because time never stops: what an effect owes the
player before it is allowed to hurt them, what a duration means when the target can walk
away, how a defensive action is scored when it is both a reflex and a stat, what identity
an attack has while its volume is sweeping through the world, who owns a combatant's
remaining health while three systems are writing to it, and what "dead" means to a system
that is still running.

## The one distinction everything descends from

**A turn-based rule assumes a discrete, consented moment. A real-time rule must survive a
moving player holding imperfect information.**

Consented is the load-bearing word. In a turn-based system the player has agreed to be at
this position, with this state, at this instant; the interface has told them everything
relevant; and the resolution happens inside a moment nobody else is using. Under those
assumptions the only question a rule has to answer is *how much*. Fairness reduces to
arithmetic.

Continuous time removes every one of those assumptions at once:

- **Position is not consented.** The player did not choose to be standing where the effect
  lands; they were passing through. Therefore an effect that lands on a position owes them
  either advance notice of where it will land, or a guarantee that it will follow them —
  never neither.
- **Information is partial and late.** The player is looking at a fraction of the screen,
  through a camera they are also driving. A rule that is only legible in a log or a tooltip
  is not legible. Therefore state that changes outcomes must be expressed as something
  perceivable and readable inside the reaction budget.
- **The player is mid-commitment.** They are in an animation, a recovery, a dash. Any rule
  whose fairness depends on the player being free to respond has to state the window in
  which they were free, and that window has to be longer than the commitment they were in.
- **Everything resolves in parallel.** Three abilities, two enemies and a lingering ground
  effect are all writing to the same combatant in the same frame, with no turn order to
  serialize them. Therefore every quantity that more than one of them touches needs one
  named owner, and every repeatable interaction needs an identity so it can be counted
  once.
- **Duration is wall-clock, not structural.** A "3 turn" effect ends when the structure
  says so. A "3 second" effect ends while the player is still doing something. Any number
  in this system is quoted in real seconds against a real player's traversal speed, or it
  is not quoted at all.

Read the six techniques as six consequences of that paragraph, not as six unrelated rules.
Each one is a place where a designer transplanting a paper rule reliably drops one of the
five assumptions and does not notice until play.

## Reaction budgets are the currency

Real-time fairness is bought in seconds and paid for out of one budget: the time between
when a threat becomes perceivable and when it becomes unavoidable. Everything else is
bookkeeping around that interval.

Useful anchors, all measured against a player of average reflex on a typical display:

- **~0.25 s** is the floor for a trained player to perceive and begin a response to a clear
  visual cue. Anything below it is a coin flip dressed as a skill check.
- **0.4–1.5 s** is the workable band for a committed action's wind-up. Under 0.4 s the
  action reads as instantaneous and cannot be responded to; over 1.5 s it reads as a stall
  and players stop watching it.
- **0.1–0.5 s** is the band for recovery after an action. Zero recovery makes every action
  free and removes the entire risk axis; over half a second the character feels
  unresponsive and the input queue starts eating intent.
- A window whose fairness the design asserts but nobody has measured against actual
  traversal speed is not a fair window. It is an unmeasured one, and it must be reported
  as unmeasured rather than assumed adequate.

These numbers are the exchange rate between the design's intent and the player's hands.
Publish them per action class and grade authored content against them, because an author
given no band will pick a number that feels right in isolation and produces a roster with
no rhythm.

## The six consequences

**An area effect must be telegraphed or homing.** If the effect resolves on a position, the
player must have been able to leave that position knowingly — which requires a cue with
lead time. If there was no cue, the effect must instead follow its target, which converts
it from a positional puzzle into a damage event the player was never asked to solve. The
forbidden third case — instant, untelegraphed, positional — is a rule that punishes the
player for where they happened to be. It is the single most common turn-based transplant,
because on paper "an attack that hits an area" needs no cue at all. The telegraph is also
what *buys* an attack the right to be enormous: the genre's survivability floor caps how
much of a defended character's effective health any single hit may take, and the one
sanctioned way past that cap is a clear, dodgeable tell.

**A timer is real time, and the window it defines must be escapable.** A duration in this
system is seconds; a period is seconds; and the two are not the same number even when they
happen to be equal. The most expensive confusion in this area is between *how often the
actor may do the thing* and *how often the thing ticks while it is doing it* — one governs
an actor's economy, the other governs a target's damage intake, and a system that reads one
as the other silently converts a single hit into a stream. Beyond units: a zone whose radius
grows faster than a player can run out of it is not a timer, it is a delayed guarantee, and
it must be named as one.

**An active defence has two axes: when you pressed it, and what your character is worth.**
A block, a parry, a guard, a dodge with invulnerability frames — each is scored on a
player-timed trigger crossed with a stat-scaled magnitude. Collapse it to the timing axis
and gear stops mattering, so the whole progression system is decorative during the moment
that matters most. Collapse it to the stat axis and the player's hands stop mattering, so
the action layer is decorative. Both failures ship regularly, and both feel to a playtester
like "combat is flat" rather than like the specific structural error they are.

**A sweeping attack needs an identity so each target is hit once per swing.** A weapon
volume, a beam, a projectile with penetration, a lingering aura — anything whose contact is
continuous rather than instantaneous will report contact on every frame it overlaps. The
correct unit of a damage number is *per activation*, so the activation must be a thing with
an identity that owns the set of targets it has already resolved against. Deduplicating by
target alone breaks the second swing; deduplicating by time window breaks fast weapons;
deduplicating not at all is a damage figure multiplied by an unstated frame count, which is
the same defect as quoting a number without its unit.

**A combatant's remaining health has exactly one owner.** In parallel resolution it is
routine for the damage pipeline, a status-effect system, an interface widget and a
convenience field on the actor to each hold a version of the same quantity. Two of them
will drift. The drift is invisible while both are decreasing and becomes load-bearing at
the boundary — one says dead, one says alive, and which one wins depends on evaluation
order that nobody wrote down. One implementation owns the number; everything else reads it
or routes its writes through it.

**Death is a state the whole system can observe, not the absence of input.** A combatant
whose death is implemented by disabling its controller is still, to every other system, a
living target: abilities activate on it, effects apply to it, the health authority accepts
writes for it, and a queued attack lands after the death animation. Death must be a tag on
the combatant's state that every gate already consults — the same gate that blocks
activation while stunned, rooted or silenced — so that "can this act", "can this be
targeted" and "did this die" are three readings of one fact.

## The failure modes of the naive reading

The naive reading is that real-time is turn-based with a shorter turn. It produces four
recognizable pathologies, and they are worth naming because each has a distinct smell in
playtest feedback.

**"It feels unfair."** Almost always a missing telegraph or an inescapable window. The
player is being asked to solve a positional problem they were never shown. Check lead
times against traversal speed before touching damage numbers — lowering the damage of an
unreadable attack makes it boring instead of unfair, which is not an improvement.

**"It feels flat."** Almost always a collapsed defence axis, or actions with no recovery.
Nothing the player does with their hands changes the outcome, or everything is free, so
there is no risk to read.

**"It feels random."** Frequently a deduplication defect. The same attack sometimes takes a
third of the player's health and sometimes all of it, because the number of overlap frames
depended on the approach angle. Players describe this as a difficulty spike; it is an
identity bug.

**"It's spongy" / "it's a one-shot."** A pacing problem expressed in seconds, and the
seconds are the diagnosis. Time-to-kill bands are the honest measurement here, and they are
narrow enough to be worth stating as thresholds: an encounter that resolves in **under 3 s**
is trivial; one that runs past **45 s** is spongy; a player death inside **5 s** is not a
difficulty setting but a rule that never gave the player a turn; and a roster whose combined
enemy health exceeds about **five times** the player's own reads as tedious regardless of how
the damage is distributed. Sample the fight in **2 s** buckets and look for buckets where
neither side's state changed — dead air at that grain reads as broken even when every number
is correct. The pacing and dramatic-arc craft that shapes those curves deliberately is a
separate subject, and the Monte-Carlo validation that turns these bands into evidence is
another; what belongs here is only the claim that these are *real-time* constraints,
invisible to any evaluation that resolves the same fight as arithmetic.

## What this looks like outside one genre

None of the above is action-RPG specific. A shooter has the same telegraph problem in the
shape of a hitscan weapon with no tracer and no audio tell. A fighting game lives or dies
on the recovery band and on the two-axis split between a block's timing and its chip
mitigation. A survival game meets the timer problem as a status effect whose tick period
and whose reapplication period were conflated. A multiplayer game meets the health-authority
problem hardest of all, because its two authorities are on different machines and the
disagreement is called desync. The rules transplant because the underlying condition
transplants: continuous time, a moving observer, partial information.

## Where the boundary of this subject sits

Damage composition, mitigation ordering, ailment derivation, rarity and item-level scaling
belong to the genre's systems canon; this subject consumes those numbers and says nothing
about how they are formed. Monte-Carlo validation of an encounter's numbers is its own
discipline and is what turns the bands above into evidence. Tension curves, beat placement
and dramatic arc are the pacing subject. Authoring an ability specification and generating
runtime code from it is the authoring-to-engine pipeline. The four-pass method by which a
reviewer walks a subsystem is review doctrine. Each of those is referenced here in prose
because the seams are real; none of their rules are restated, because a rule with two homes
has no home.

What is left, and what this subject owns, is small and absolute: **six obligations a system
takes on the moment it decides that time does not stop for the player.**
