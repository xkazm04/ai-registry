---
layer: golden-path
type: golden-path
subject: difficulty-design-and-adaptation
status: forged
use_when: [deciding how a game gets harder, choosing between raising enemy numbers and improving enemy behaviour, adding difficulty settings or an adaptive system, players are exploiting or resenting an adjustment, a difficulty complaint has no agreed cause]
techniques:
  - four-term-difficulty-decomposition
  - skill-scaling-versus-power-scaling
  - player-chosen-challenge-and-adjustment-hazards
  - setting-bounded-overlapping-bands
---

# Difficulty design and adaptation

Ask how hard an encounter is and you get a number back. The number is a category error,
and it is the one that quietly wastes most difficulty work: hardness is not a property the
encounter has. It is a *relation* between the encounter and whoever is playing it. The
same room is a formality for one player and a wall for another, and nothing about the room
changed. A team that treats difficulty as an attribute of content will spend its whole
life tuning one side of a two-sided quantity and calling the other side variance.

This subject holds the design-side model of that relation: what difficulty is made of,
which parts of it a designer actually controls, which lever buys engagement and which
merely buys resistance, who is allowed to choose the setting, and what a system may do
about it while the player is playing. It measures nothing. The instruments that turn a
fight into a tension curve, a beat list, a duration verdict or a win rate are neighbours,
named at the end — what they measure *against* is written here.

## The four terms

Model perceived difficulty as the balance between two pairs.

- **Player power** — everything the player's strength was handed by the game: stats,
  equipment, unlocked abilities, consumables, level. Artificial in a precise sense — an
  author can grant or remove any of it.
- **Player skill** — game knowledge (what this enemy does, what this resource is for,
  which route is short) plus raw mechanical execution (aim, timing, reaction, input
  economy).
- **Enemy power** — the opposition's stats and its numbers: health, damage, count,
  density.
- **Enemy skill** — how well the opposition is *played*: navigation, target selection,
  ability choice, spacing, precision, and the willingness to punish a mistake.

Difficulty rises as the second pair grows against the first, and every difficulty decision
anyone has ever made moves one of these four. The model earns its place not by being
exhaustive but by being **separable**: the four have different costs, different failure
signatures and — the part that matters most — different owners.

## Three terms are set. The fourth is only ever estimated

Player power, enemy power and enemy skill are authored. Someone types them, reviews them,
versions them, and can change them tomorrow. Player skill is not authored. It arrives with
the player, it varies across the population by more than any lever in the game moves, and
it changes over the course of a single session.

That asymmetry is the load-bearing claim of this subject, and three consequences fall out
of it.

**Every difficulty lever operates on three of four terms.** There is no lever on the
fourth, so a design that claims to have "set the difficulty" has set three quantities and
assumed the fourth. That assumption is part of the number:
[a-number-carries-its-unit-and-basis](../../_laws.md#a-number-carries-its-unit-and-basis)
says a difficulty figure without its assumed skill level is not information. *Hard* is
always *hard for whom*.

**The fourth term must be modelled, not defaulted.** The usual silent default is a
competent player — one who knows the mechanics, executes cleanly and never wastes a
resource. It is the wrong default because it describes the team. Designers, testers and
headless harnesses are the three highest-skill readers of a combat system that will ever
touch it, and all three converge on the same optimistic estimate. Where the estimate has
not been taken, the honest render is *unestimated*, never *average*
([unmeasured-is-not-a-pass](../../_laws.md#unmeasured-is-not-a-pass)) — an unestimated
skill assumption silently makes a game look better tuned than it is.

**Everything downstream is a device for handling variance in that one term.** Difficulty
settings, opt-in modifiers, onboarding, catch-up mechanics and adaptive systems are not
four unrelated features. They are four answers to the same question: the term you cannot
set is the term with the widest spread, so what do you do about it?

One more separation the model insists on: **player power is not player skill.** A player
who has out-geared an area is not better at the game, and an area that only becomes
passable after out-gearing it was never tuned for skill at all. Conflating the two is how
a progression problem gets diagnosed as a difficulty problem, and how a difficulty fix
gets applied to a progression system that was working.

## Resistance and engagement are different purchases

Two families of lever raise difficulty, and they buy different things.

**Power scaling** multiplies numbers — enemy health, enemy damage, spawn count, density.
It is cheap in every sense: one coefficient, no new behaviour, no new readability burden,
no new bugs, shippable in an afternoon. It is also the common approach, precisely because
it is cheap. What it buys is **resistance**: the fight takes longer and punishes harder,
and it asks the player nothing new.

**Skill scaling** changes behaviour — a trait the opposition did not have, a mechanic that
changes what the player must do, better target selection, better use of space. It is
expensive: new behaviour is new content, with its own defects, its own telegraphs and its
own legibility cost. What it buys is **engagement**: the player is asked a different
question rather than the same question louder.

The rule is about *proportion*, not prohibition. Power scaling is legitimate, and in whole
genres it is mandatory — a game whose progression loop is numbers going up needs
opposition whose numbers go up too, or the loop has nothing to push against. The defect is
a difficulty tier whose entire change list is coefficients. That tier is a rename of the
tier below it, and its characteristic product is the top setting where every enemy absorbs
punishment and deletes the player in two hits. Nobody is playing better there; they are
playing more slowly and more carefully, and the fight's dramatic shape flattens into a
grind that the duration instruments will correctly report as spongy and punishing at once.

Skill scaling has a ceiling of its own, and it is the more interesting bound. A machine
can aim perfectly, react within a frame, and issue more commands per second than a human
hand can produce. Uncapped, that is not a harder game — it is a *different* game, in which
the player is asked to be a machine rather than to play well. The clearest precedent comes
from real-time strategy, where a competent computer opponent is deliberately capped on
actions per minute so that the contest stays about decisions instead of throughput. The
general form: every enemy-skill lever needs a stated, human-plausible ceiling, and that
ceiling is a design decision written down, never whatever the implementation happens to be
capable of.

## Who is allowed to choose

A challenge the player picked and a challenge the game imposed are different objects even
when their mechanical content is identical. This is not a soft observation; it changes
what the same difficulty increase costs.

The strongest evidence is the class of system where players voluntarily stack constraints
or tougher opposition onto a run — and it works **even when the modifiers raise difficulty
without raising reward**. The payoff is the declaration itself: the player has told the
game what kind of experience they want, and receiving it is the reward. Apply the same
increase from the system side, unannounced, and the identical change produces complaints
about balance.

So the default order of preference is: a setting the player declares; then modifiers the
player opts into per run or per encounter; and only then a system that decides on the
player's behalf. A declared preference is also only authoritative if it can be revised —
skill is the term that moves during play, so a preference declared at hour zero is an
estimate of a moving quantity and the player must be able to correct it without ceremony.

## Adaptation, and the two hazards that come with it

Dynamic difficulty adjustment reads the player's live performance and moves a lever. It is
the honest response to the fourth term being unset, and it carries two specific hazards
that are not general caveats — each has a definite mechanism and a definite fix.

**It punishes the player for being good.** The player performs well, the system responds
with more resistance, and the return on improving is a harder game for the same payout.
That is a treadmill, and players read it accurately as one. The fix is stated positively:
an adjustment that raises difficulty must also raise what the run pays, or it must be a
trade the player opted into knowing the terms. Whether reward actually tracks difficulty
is an economy question and is owned next door — but a difficulty system that never asks it
has shipped the treadmill.

**Once noticed, it becomes exploitable.** The moment the mechanism is legible it stops
being a hidden regulator and becomes an input, and players optimise inputs. A player who
works out that the game eases off after deaths will die on purpose before a hard section;
a player who works out that performing well summons tougher opposition will sandbag. There
is no stable middle here, which gives the rule its shape: **subtle or explicit, never
half-hidden.** Subtle means the adjustment is small enough and slow enough that it never
produces a cause-and-effect a player can drive. Explicit means the game says what it is
doing, at which point "exploiting" it is just using a declared feature. The half-hidden
middle — an adjustment large enough to feel, presented as though nothing is happening — is
the only version that loses trust, and it loses it with exactly the players who care most.

## The hybrid that keeps both

The construction that gets adaptation's responsiveness without taking the choice away from
the player has three moves.

1. **Grade live performance onto one bounded scale**, stated in a unit with a window and a
   basis, shared by every setting.
2. **Let the chosen setting lock a band on that scale, not a point** — a floor and a
   ceiling with margin around a declared starting position. A mid-range setting starts in
   the middle of the scale and may drift down or up within stated limits.
3. **Overlap the bands across settings.**

The third move is the one most implementations omit and the one that makes the design
work. With overlap, a player doing well on an easier setting can meet the same live
difficulty as a player struggling on a harder one — which is the correct outcome, because
they are, at that moment, the same difficulty problem. Without it the settings are
disjoint stacked tiers and the adaptation is cosmetic within each.

What the construction buys, precisely: the player's declaration is never overridden,
because the band cannot be left; the adaptation is real, because inside the band it
responds; and two players are commensurable, because there is one scale underneath both.

## One authority over the live difficulty value

Once a game has a chosen setting, a live grade and per-encounter tuning, three systems hold
an opinion about the same quantity. If two of them apply a multiplier to the same term the
result is a product nobody authored and nobody can read back — the same defect as a
balance harness that pre-bakes a coefficient the resolution kernel also applies. Exactly
one component owns the live difficulty value
([one-authority-per-quantity](../../_laws.md#one-authority-per-quantity)); everything else
is a named, ordered input to it.

The companion rule is about what the value is *applied to*. A single scalar that scales
everything at once — health, damage, count, aggression — guarantees that the two opposite
duration failures can never be fixed independently, because sponginess is a health problem
and unfairness is a damage problem and one knob moves both. Difficulty is a vector over
the four terms. Wiring it as one number is how a tuning pass makes two complaints worse
with one edit.

## Failure modes of the naive reading

- **One multiplier for everything.** Covered above, and it is the most common shipped form
  of a difficulty setting.
- **Tuning against a player who does not exist.** The design team is the highest-skill
  population the game will ever have, and a headless harness assumes perfect execution by
  construction. Both estimate the fourth term optimistically, and they agree with each
  other, which is what makes the error so durable.
- **Treating a setting as a ranking of players.** A difficulty setting states which
  experience the player wants, not how good they are. Naming that implies a hierarchy
  turns a preference into a status decision, and players then choose the setting that
  protects their self-description rather than the one they would enjoy.
- **Adjusting inside the thing being adjusted.** Changing enemy health mid-fight makes the
  player's own damage numbers lie to them, and a player who cannot trust their damage
  cannot learn the system. Adapt between encounters; hold the encounter still while it
  runs.
- **Calling silence calibration.** No complaints is not a measurement. It is the same
  collapse [unmeasured-is-not-a-pass](../../_laws.md#unmeasured-is-not-a-pass) forbids,
  applied to a population instead of a metric.
- **Adding a skill lever with no human ceiling.** Perfect accuracy and single-frame
  reactions are trivially available and are not difficulty; they are the removal of the
  contest.

## The path, in order

1. **Write the four terms down** for the system you are tuning, and mark which of the
   three authored ones each lever moves.
2. **State the assumed skill level** every difficulty claim is conditional on, and mark it
   unestimated where nobody has measured it.
3. **Check each difficulty tier's change list** for at least one entry that is not a
   coefficient; a tier that is all numbers is a rename.
4. **Give every enemy-skill lever a stated human-plausible ceiling.**
5. **Let the player declare first** — a setting, then opt-in modifiers — before any system
   decides on their behalf.
6. **If you adapt, adapt inside a band the declared setting bounds**, overlap the bands,
   make the adjustment subtle or explicit, and pair any rise in difficulty with a rise in
   what the run pays.

## Where this subject stops

Measuring what a fight actually does over time — the tension curve, the beats, the
duration envelopes, the classification of a measured outcome into a named band — belongs
to the pacing and dramatic-arc craft and is not restated here. Answering *is this fight
fair* by resolving it thousands of times headlessly, attributing the result, and solving
backwards for a lever value belongs to encounter balance simulation. What an effect owes a
moving player — a telegraph or a homing guarantee, an escapable window, legibility inside
the reaction budget — is real-time combat law and sits **upstream** of everything here: an
unfair rule is not a difficulty setting, and no amount of banding makes it one. And
whether the harder path actually pays better is an economy question, owned by the subject
that holds reward stance and generosity multipliers.

The seam is clean in one sentence. Those subjects answer *what is this fight, and is the
measurement trustworthy*. This one answers *what should be different about it, who gets to
say so, and what may change while the player is watching*.
