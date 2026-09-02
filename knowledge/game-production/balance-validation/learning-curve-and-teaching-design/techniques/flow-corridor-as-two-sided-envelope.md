---
layer: technique
type: technique
subject: learning-curve-and-teaching-design
technique: flow-corridor-as-two-sided-envelope
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [checking whether a section demands more than the game has taught, players leave without complaining, encoding boredom as a failure a machine can report]
---

# Flow corridor as a two-sided envelope

The named concern: express, per position in the schedule, the band of demand that content
is allowed to make — a ceiling above which the demand exceeds what has been taught, and a
floor below which the content asks nothing new — and check both, because only the ceiling
generates complaints and only the floor generates silence.

## The two quantities the check compares

**Demanded competence** is a property of the content: the set of atoms a piece of content
requires in order to be completed, plus the level of execution it requires of each. It is
read off the content, and where it is generated, it is read off the generation request.

**Taught competence** is a property of the schedule *at that position*: the set of atoms
introduced, practised and tested upstream, discounted by decay for any atom not demanded
inside its interval.

The corridor is the relation between them. A demand outside the taught set breaches the
ceiling. A stretch whose demanded set is wholly contained in the taught set, with no atom
either new or newly combined, for longer than a stated run, breaches the floor.

Neither number means anything alone. A demand figure carries the schedule position it was
evaluated at and the taught set that position implies
([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis));
the same encounter is a ceiling breach in the first hour and a floor breach in the tenth,
with nothing about the encounter changed.

## Procedure

1. **Fix the position.** Evaluate content where it sits in the traversal order, never in
   isolation. Content whose position is not yet decided has no corridor verdict, and that
   is *not measured* rather than a pass
   ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).
2. **Derive the taught set** at that position from the atom schedule, applying decay. Where
   the check must also run live, materialise the taught set as durable, queryable state on
   the player — a flag granted the first time each atom is demonstrated — rather than
   inferring it from a progress counter. The same query then answers three questions with
   one authority: whether to teach, whether to skip teaching, and whether a demand is
   permitted.
3. **Extract the demanded set** from the content. For hand-authored content this is an
   annotation; for generated content it should be an output of the generator, because a
   generator that cannot say which competences its output requires cannot be checked at all.
4. **Check the ceiling**: every demanded atom is in the taught set, and every demanded
   combination has both parents tested. Report each violation by atom, not as a score — *this
   room requires an atom introduced two regions later* is actionable, *learnability 0.62* is
   not.
5. **Check the floor**: over a sliding run of content, at least one atom is new, newly
   combined, or newly demanded at a higher execution bar. State the run length in the
   schedule's own unit.
6. **Report both breaches at the same severity.** The instinct to warn on the floor and fail
   on the ceiling is exactly the bias that leaves the floor unencoded.

## Decision rules

- **When a demand exceeds the taught set, the fix is upstream, not local.** Either teach the
  atom earlier or remove the demand. Lowering the numbers on the content leaves an unteachable
  demand at a lower intensity, which reads to the player as an easier version of the same
  unfairness.
- **When a section breaches the floor, add an atom or a combination — not a difficulty
  increase.** More health on the same enemies re-uses the exhausted pattern more slowly. The
  complaint that follows a floor breach is *this is boring*, and it is never answered by
  *this is now boring and long*.
- **When the corridor and a difficulty setting disagree, the corridor wins.** A setting may
  move how hard a taught atom is to execute; it may not authorise demanding an untaught one.
  An unteachable demand is not a difficulty tier, and no dial converts it into one.
- **When decay would empty an atom from the taught set, prefer a demand that refreshes it
  over a warning.** The corridor check is most useful as an authoring constraint: give the
  generator the taught set and the run since the last new atom, and it produces content
  inside the corridor instead of content that fails the check afterwards.
- **When the population is measurably outrunning the schedule — competence reached far
  earlier than the schedule assumes — raise the floor rather than the ceiling.** The
  audience is not asking for more resistance; it is asking for the next pattern.
- **When content is optional, keep the ceiling and relax the floor.** Optional content the
  player chose to enter may legitimately repeat a known pattern; mandatory content may not.

## When not to use this

- **Before an atom schedule exists.** The corridor is a relation between two sets, and
  without the taught set it degenerates into a difficulty opinion with extra vocabulary.
- **On content whose position is genuinely player-chosen** and can be reached at wildly
  different points — an open structure with no traversal order. There the ceiling must be
  evaluated against the *minimum* taught set any legal path produces, which is a stricter and
  more expensive check, and the floor is not meaningful at all.
- **As a measurement of experience.** This check compares content to a schedule; it does not
  observe a player. It cannot tell you the atom was actually learned, only that it was
  offered before it was demanded. Pair it with a competence measurement, and never let a
  clean corridor stand in for one.
- **As a difficulty verdict.** A section can sit perfectly inside the corridor and still be
  brutal or trivial, because execution difficulty of a taught atom is a different axis with a
  different owner.
