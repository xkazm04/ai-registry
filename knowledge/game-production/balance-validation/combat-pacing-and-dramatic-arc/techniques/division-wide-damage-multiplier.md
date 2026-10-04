---
layer: technique
type: technique
subject: combat-pacing-and-dramatic-arc
technique: division-wide-damage-multiplier
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis, an-instrument-proves-it-had-input]
shared_with: []
use_when: [an opening is too lethal and per-weapon retuning would break relative balance, setting how dangerous each tier of a campaign is, recording which tuning coefficients were tried and why they failed]
---

# One damage multiplier per division, shared by every entrant

The named concern: tune how lethal a whole tier of a campaign is with exactly one data scalar,
applied to every entrant on the same terms, searched stepwise, with every coefficient tried —
failures included — kept in the record.

## Why a shared scalar

When the opening gate fails, the tempting repair is to cut the damage of the weapon that
killed most. It works once and then costs the balance: the weapon's share of kills, its place
among its peers, and every lint that compared it to them all move together, so the next
measurement answers a new question. A scalar over *all* damage dealt leaves the relative
structure of the arsenal untouched, because each source is scaled by the same factor. What
moves is only the tempo — how long a vehicle at full health lasts under the same pattern of
hits — which is precisely what the opening gate complains about.

Two rules make the scalar honest rather than a convenience.

**It applies to every entrant, human and rival, identically.** A multiplier that softened only
the player's incoming damage would be a hidden handicap, would change who wins as a side
effect, and would make the tier's difficulty a physics difference instead of a skill one. A
shared multiplier keeps the field symmetric: the rivals are also harder to wreck, so the race
stays a race about decisions. State in the tier's documentation that difficulty settings
change skill (reaction, line, choices) and that the damage scalar is a *content* property of
the division, the same for every setting.

**It is applied in exactly one place.** The resolution kernel multiplies; no adapter, harness
or preset pre-multiplies a weapon's number "for convenience". The failure is the factor-of-two
class: a harness bakes the scalar into attack values, the kernel applies it per hit, and the
sweep reports squared effect. The scalar lives as data, is read once per hit by the one
kernel, and a practice or sandbox mode holds it at 1.0 so the unscaled rules remain
observable.

## Procedure

1. Run the gate with the shipping unscaled (or current) values first, over the whole division,
   and keep the result whatever it says. It is the baseline against which every later
   coefficient is judged, and it is the only record that the problem was real.
2. Choose the next coefficient from the burst, not from taste: if the first-elimination time
   was a few seconds, a modest cut will not move it past the opening; take the larger step.
3. Re-run the same seeds, so a difference is the coefficient and not the draw. Log
   *coefficient, events, opening-wreck rate, retained later wrecks, first-elimination time
   range*.
4. Step again until the gate holds, then stop. Do not keep cutting past the gate; every extra
   point of softness shortens the tension the later-wreck count is evidence for.
5. Set the divisions on one monotonic series (each coefficient at or above the last, rising
   slowly toward the full rules), so the climb through the campaign reads as one ramp rather
   than a step wall at each join. Express them as a table in data, with the gate result per
   division beside each value.
6. Re-run the whole sweep after any weapon, armour or health change, because the scalar was
   tuned against the old values and the gate result is bound to them.

## Keep the failures

The coefficient log is a deliverable. A series such as *nearly every lead wrecked, then a
quarter still wrecked, then none* is the answer to the question a later maintainer will ask —
why is this number so small? — and to the more dangerous question that follows it, *can we
raise it back*. Without the log the final value reads as timidity and gets restored by someone
tidying; with it, the same person can see where the cliff is. Keep also the diagnostic that
was *discarded for a defect in the sweep itself* (for example a scenario grid whose two axes
rotated in lock-step so each class met one course) with the reason, so the discard is a
recorded decision and the surviving run is not mistaken for the first one.

## Choosing between the scalar and a start window

A start-protection window — a short, visibly signalled interval where damage and ammunition
use are suspended — is the other lever against opening bursts, and the two are not
interchangeable. Protection protects a *moment*: it does nothing about a lethal pattern that
begins the instant it expires, and the first-elimination times simply move to just after the
window. It is also visible to the player and can be exploited, which is why shooters that
lean on it keep it brief and break it on any aggressive act. The scalar changes the whole
race. Decision rule: when first eliminations cluster immediately after the window ends, the
window was masking the burst and the scalar must be lowered; when the burst is confined to
the grid and the rest of the race pacing is right, a window is the cheaper and more
legible repair. Use both only when each is measured separately.

## What is measured, simulated, authored

Each coefficient's effect is **simulated**, over seeded races on the shipping rules. The
direction of the scalar and the choice to share it are **authored** policy. How the softened
opening *feels* is not in this technique's reach.

## When not to use this

- **When the opening failure is not about lethality** but about a spawn arrangement, an
  unreadable telegraph or a camera that hides the first hit. A scalar will drive the rate
  down and leave the cause in place, and the player still dies confused, only later.
- **When a division has a single entrant with no rivals.** Symmetry is trivial there; tune
  the source of damage directly and record the change as a content edit.
- **To pass the gate with no later danger left.** If the retained later-wreck count falls to
  zero, restore the previous coefficient and look at the grid.
