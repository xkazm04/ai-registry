---
layer: technique
type: technique
subject: racing-career-economy
technique: rival-shopping-windows-no-player-read
status: forged
laws: [one-authority-per-quantity, declaring-an-input-is-not-consuming-it]
shared_with: []
use_when: [deciding how opposing cars improve across a career, tempted to scale opponents to the player, wanting rivals that feel like they live in the same economy]
---

# Rivals shop in windows, and never look at you

The named concern: **how the opposition gets better across a career, and what it is allowed to
know.** There are two honest answers and one dishonest one. The honest ones are that the
opposition does not improve, or that it improves on a schedule. The dishonest one is that it
improves by reading the player.

## The rule

Each rival has a **shopping window** per career stage: a fixed list of the parts and cars
that rival buys, drawn from the **same catalogue and the same prices** the player uses. The
window is authored data keyed by stage and rival. The rival system's inputs are the stage and
the catalogue and nothing else. It does not read the player's car, rating, balance, win
streak, finishing position or damage.

Two things follow that a designer should check by construction.

- **Reproducibility.** The field at stage *n* is identical across every playthrough. A test
  that reconstructs the field from the stage alone must agree with what ran.
- **Legibility.** Because rivals pay catalogue prices for catalogue parts, a rival's rating is
  a fact in the same units as the player's. The gap is a number the player can reason about.

## Why not read the player

A runtime link from player to field is rubber-banding in every form: opponents slow when the
player trails, speed up when the player leads, or purchase in response to the player's
purchases. Whatever the lever, it decouples outcome from preparation. The player's upgrades
and driving change how close the race is by less than the regulator changes it, and a regulator
that is noticed is resented. Players read such fields accurately as dishonest, and the
dishonesty extends to the career's money: a part bought to win is bought to be neutralised.

The cost of the fixed schedule is real: a player ahead of the curve is bored and a player
behind it is stuck. That cost is paid at design time, by authoring prizes and prices so the
intended path tracks the schedule, and by offering the player choices — an easier class, a
rest race — rather than by the field reading them.

## The read that hides in the settlement

A rival who buys through the shop is a rival with a wallet, and a wallet is filled by results.
If rival results are settled from races the player also runs, the rival's wealth depends on how
the player drove: beat a rival and it earns less, so it buys less. The rival system never touched
the player's state and still reads it, one hop away. The audit for "no player read" is
therefore **transitive**, and there are three honest ways to satisfy it.

- **A ceiling and a grant, both fixed.** Purchases are bounded by a per-stage rating target
  authored in data, and grants top up a rival that fell behind it. Race results then move the
  rival only inside the band between its minimum and the ceiling, and the target itself, the
  grant and the window do not read the player.
- **Settle rival wealth from a player-free simulation.** The rival's income comes from races it
  ran against other rivals, never against the player.
- **Do not settle rival wealth at all.** The window is the whole schedule, and the rival has no
  wallet. This is the strongest form and the least lifelike.

Whichever is chosen, say which, and test blindness on the **realised field** after a run of
races, not only on the window table: run two careers with very different player results and
compare the field's ratings stage by stage.

A rival that remembers how the player treated it in the race — a grudge that changes its
passing or firing choices — is a different matter. It reads the player, in the race, and
belongs to difficulty design; it must not touch the rating, the damage rules or the prices. Keep
the two statements separate in the document so a reader does not take the second for a breach
of the first, and so a breach of the first is not excused by the second.

## Procedure

1. Author the window table: for every stage and rival, the exact purchases.
2. Price them through the shared catalogue so a rival's rating is computed, not typed.
3. Give the rival-building function a signature that cannot accept player state. If it takes
   the profile, the contract is already broken.
4. Test reproducibility: build the field twice from the stage alone and compare.
5. Test blindness: build the field with two very different player states and assert it is
   identical.
6. Report the rating of each rival per stage as a table the whole team can read.

## Decision rules

- **When a rival needs to be stronger for a boss, schedule it, do not scale it.** The boss is a
  stage, and a stage has a window.
- **When playtests say a stage is too hard, change the schedule or the player's pay, not a
  runtime multiplier.** A fix by reading the player lowers difficulty only for the testers who
  complained.
- **When a rival buys a part the player cannot yet afford, that is the design.** The gap is
  the thing to climb.
- **When a field input is declared but nothing reads it, fail the build.** A rival record with
  a field that adapts the car to the player and is never consumed is a trap for the next
  maintainer.

## Evidence grade

Reproducibility and blindness are exact structural tests. That a fixed field feels fairer
than a banded one is a design argument supported by public player sentiment about banding, not
by a measurement of this field.

## When not to use this

- **When the game is explicitly a dynamic-difficulty product.** Then difficulty adaptation is
  the feature and belongs to that craft, with its own disclosure rules.
- **In an arcade mode with no career.** Within a single race, a catch-up rule can be a
  deliberate, visible mechanic; this technique governs the economy between races.
