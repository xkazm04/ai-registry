---
source: youtube
url: https://www.youtube.com/watch?v=bxp4G-oJATM
title: "Difficulty in Video Games - Game Design"
author: Brackeys
kind: designer-talk (domain knowledge, no tooling)
mined_on: 2026-08-22
words: 2332
skill_version: 0.5.0
extracted: 6
picked: 5
accepted: 5
declined: 0
leads: 0
untriaged: 1
dispatched: 1
cross_repo: pof
lands_on_branch: research/game-difficulty
---

# Game difficulty, 2026-08-22 - the run that finally exercised both lanes

Sixth run, run in parallel with [[2026-08-22-de-slop-a-codebase]], and the first that
produced **an application, a project-side change, and a version witness**. Those three
had been missing from every previous run, which the lessons file had been recording as
the method's defining gap since run 3.

## A fourth source class

**Designer talk** - domain knowledge with no tooling in it at all. Neither of the two
classes on file fits: it is not a second-hand survey (the author is teaching a craft they
practise) and not a first-party practitioner account (they are not describing a system
they built). It is a **teacher explaining an established body of practice**, and its
authority sits differently again: reliable for the *structure* of a domain's received
wisdom, unreliable for whether any particular studio's version of it is the best one.

For this registry the class has one defining property: **its findings never route to
`software-engineering`.** They route to a domain bundle, and if the domain bundle is not
on the branch you are standing on, the run has a placement problem before it has a
content problem. That happened here and is recorded below.

## The routing problem, and how it was resolved

The natural home is the `game-production` bundle - 40 subjects, with a `balance-validation`
category already carrying `combat-pacing-and-dramatic-arc` (including a technique named
`difficulty-band-classification`) and `encounter-balance-simulation`. **That bundle lives
on `forge/pof` and not on this branch.**

Operator decision: land on a branch off `forge/pof`. A second worktree was created at a
short path on `research/game-difficulty` rather than switching branches in the shared
checkout, per the skill's own rule about parallel sessions. Everything below landed
there, not here, which is why this note is the only artifact of the run on
`skill/research`.

Worth stating as a general finding: **the corpus is bigger than any one branch**, and a
research run that assumes otherwise will either misfile a finding or declare a gap that
is not one. The mapping instrument reads the working tree, so it is blind to bundles on
other branches by construction. It reported "no prior art" for difficulty terms that a
sibling branch covers in two subjects.

## Accepted - registry side (on `research/game-difficulty`)

Dispatched to a worker, which overrode the dispatch's "prefer existing subjects"
preference and made the case for it. The override was right and is worth recording:
`combat-pacing-and-dramatic-arc` is scoped to what one fight does over time and
`encounter-balance-simulation` to the honesty of a headless harness, so *who chooses the
difficulty* and *what adapts during play* are off-scope in both - and splitting the four
across subjects would have broken the asymmetry in the first technique that the other
three descend from.

**New subject `difficulty-design-and-adaptation`** (`balance-validation`, 4th of a cap of
10), with four techniques:

- `four-term-difficulty-decomposition` - perceived difficulty as player power, player
  skill, enemy power, enemy skill, with a "who sets it" column whose entry for player
  skill is **Nobody**. That asymmetry is the load-bearing content; the rest of the
  subject descends from it.
- `skill-scaling-versus-power-scaling` - a harder tier must add a decision, not just a
  longer fight; and an opposition advantage drawn from machine speed is a different game
  rather than a harder one.
- `player-chosen-challenge-and-adjustment-hazards` - live adjustment taxes competence
  unless the harder path pays better, and must be imperceptible or declared because a
  half-noticed adjustment becomes a system to game.
- `setting-bounded-overlapping-bands` - the chosen setting locks a band with margin
  rather than a value, and bands overlap across settings.

The worker also disambiguated a genuine collision it could have papered over: the word
*band* already means a **verdict** over a measured outcome in the neighbouring subject,
and means a **control region** in the new one. It wrote the disambiguation rather than
renaming, because both usages are correct in their own subject. That is the right call
and the kind of thing a self-report would normally hide.

Two neighbour golden paths gained a "where this stops" paragraph. The sharper of the two
now admits that its standing cast fixes player *power* and is silent on player *skill* -
which is the term every result in that subject is conditional on.

## Accepted - project side (cross-repo lane, first exercise)

Three evaluator criteria in the connected game-tooling project, on a branch in that
repository, **committed and deliberately not pushed** - merging is adopting on both sides
of the bridge, and it is a human act there as much as here.

The criteria went into the module contexts each term belongs to: the four-term model and
the flow-channel rule into the progression module, skill-versus-power and the
machine-speed cap into the enemy-AI module, and the adjustment hazards plus the band
shape into the world module where encounters and spawning live.

**Validated against that project's own hard-won rule.** Its criteria strings render into
every dispatch prompt, and a golden suite pins the rendered prompts; two of its earlier
research runs shipped knowledge entries having run only the unit test, and left that rail
red for eight days. The whole prompts directory was run: nine files, 168 tests, green,
plus a clean typecheck and a clean lint on the changed file.

## The application, and the negative confirmation

`node--four-term-difficulty-decomposition`, `verified_on: 2026-08-22`,
`verified_against: node@24`. **The first application any research run has produced, and
the only version witness in a 109-application bundle.**

Its content is the reason the lane was worth exercising. The evaluator's module-context
record carries an entry for every module the tooling knows how to build - fourteen of
them - and there is no entry for player skill, because nothing in a codebase can be
responsible for it. **The term the technique says nobody sets is exactly the term with no
owning module.** The tooling's structure confirms the model's central asymmetry without
having been designed to, and that is stronger evidence than the criteria themselves.

The application also states what the realization cannot do: the criteria are read by a
judging model, so the verdict is a judgment and never a measurement. The law that
unmeasured is not a pass applies to the evaluator, not only to what it evaluates.

## Untriaged

| # | Title | Disposition | Anchor |
| --- | --- | --- | --- |
| B2 | The flow channel needs breathing room; constant escalation is its own failure | Rated partial at the table and not picked. Partly absorbed anyway - the flow-channel rule landed on the project side in the progression criterion, though no registry technique carries it. | `[02:34]` |

## For the next run

- **Two lanes exercised in one run cost about one sitting**, with two workers running in
  parallel and the project-side change done in the main thread. The bottleneck was
  neither verification nor writing - it was waiting, which is an argument for dispatching
  earlier rather than for picking less.
- **Review the worker's diff, not its report.** Both workers self-reported green. The
  purity check on the game-design subject was the one that mattered, because the source
  is made almost entirely of game titles and a single leaked one fails the gate for
  everybody. It was clean - but the check was the point, not the result.
- **The instrument is branch-blind and should say so.** It reported no prior art for
  difficulty on this branch while a sibling branch carried two subjects on it. That is a
  real defect in the routing instrument, not a quirk of this run.
