---
layer: technique
type: technique
subject: difficulty-design-and-adaptation
technique: four-term-difficulty-decomposition
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a difficulty complaint has no agreed cause, deciding which term a difficulty change should move, writing down what a difficulty setting actually scales, a balance figure assumes a player nobody has described]
---

# Four-term difficulty decomposition

The named concern: hold perceived difficulty as four separable terms rather than one
scalar, so that a difficulty argument is about *which* term moved, and so that the one
term nobody can set is visible as an assumption instead of hiding inside a number.

## The four terms

| Term | What it is | Who sets it |
| --- | --- | --- |
| Player power | Stats, equipment, unlocked abilities, consumables, level — strength the game granted | Author |
| Player skill | Game knowledge plus mechanical execution: aim, timing, reaction, input economy | Nobody |
| Enemy power | Opposition stats and numbers: health, damage, count, density | Author |
| Enemy skill | How well the opposition is played: navigation, target selection, ability choice, spacing, precision | Author |

Difficulty rises as the enemy pair grows relative to the player pair. The split into four
rather than two is what makes the model useful: **power and skill fail differently on both
sides**, and treating either side as one quantity destroys the distinction that tells you
what to fix.

On the player's side, out-gearing an area and getting better at it produce the same
outcome and are not the same event. An area that only becomes passable once the player has
enough power was never tuned for skill; an area that stays hard at any power level is a
skill wall, which may or may not be intended. A single "player strength" figure cannot
tell those apart, and teams that use one routinely apply a progression fix to a difficulty
problem.

On the opposition's side, the same distinction separates a bigger version of an enemy from
a smarter one, which is the whole of the next technique.

## Three are set; the fourth is estimated

This is the asymmetry the model exists to expose. Three terms are authored — typed,
reviewed, versioned, changeable tomorrow. The fourth arrives with the player, varies across
the population by more than any lever in the game moves, and changes within one session.

Two consequences are binding.

**A difficulty claim carries its assumed skill level or it is not a claim.** *This fight is
fair* is a statement about a player, and if the document does not say which player, two
readers will supply two different ones and both will be certain. Basis travels with the
number, exactly as it does for a survivability figure or an economy rate.

**An unestimated skill assumption renders as unestimated.** Not *average*, not *typical*,
not a neutral middle. The default that fills the gap unattended is a competent player who
knows the mechanics and executes cleanly — and that default describes the design team, the
test team and every headless harness, which are the three highest-skill readers of the
system that will ever exist. A silent optimistic default makes a game look better tuned
than it is, and the error survives review because everyone reviewing shares it.

## Procedure

1. **Enumerate the levers you actually have** and tag each with the term it moves. A lever
   that moves two terms at once — a global multiplier that scales health *and* damage *and*
   aggression — is recorded as moving two, which is usually the finding.
2. **State the assumed player skill level** for every difficulty target, in whatever terms
   your genre can express: knows the telegraphs or does not, uses defensive options or does
   not, plays at a stated input rate. Vague is acceptable; absent is not.
3. **Mark the skill assumption's provenance** — measured from real play, estimated by a
   designer, or unestimated. These are three epistemic states and they must render
   differently.
4. **Separate the two player-side terms in every report.** When a fight's outcome changes,
   say whether the player got stronger or got better; the fixes point in opposite
   directions.
5. **Re-derive after any progression change.** Player power is the term that moves fastest
   without anyone touching difficulty, so a progression retune silently retunes difficulty
   across the whole game.

## Decision rules

- When a complaint arrives as "this is too hard", ask which term the complainant is short
  on before touching anything. Short on power is a progression fix, short on skill is a
  teaching or telegraph fix, and enemy power or enemy skill being too high is a tuning fix.
  The same sentence maps to four different edits.
- When a lever moves more than one term, split it before tuning it. A combined knob cannot
  be moved without moving something you did not intend, and the unintended half is what
  produces the second complaint a week later.
- When the skill assumption is unestimated and the answer matters, go and measure it rather
  than picking a value. A high-sensitivity assumption that is a guess is the measurement to
  take next; a low-sensitivity one can stay a guess and that conclusion retires work.
- When two people disagree about whether a fight is hard, check whether they are holding
  different values of the fourth term before assuming they disagree about the first three.
  They usually are, and the argument is unresolvable until that is said out loud.

## When not to use this

- **As a formula.** The four terms are a decomposition for reasoning and reporting, not a
  scoring model to sum or weight. A single number produced from them reinstates the scalar
  the decomposition exists to reject.
- **Where the opposition is not an agent.** A timing puzzle, a traversal hazard or a
  resource-starvation section has no enemy skill term, and forcing one produces a
  meaningless zero. Use the two player-side terms and name the challenge's own axis.
- **On a co-operative or competitive encounter between humans**, where the opposition's
  skill is another player's and therefore also unsettable. The model still describes the
  situation but three of its four terms become unauthored, which is a different design
  problem.
