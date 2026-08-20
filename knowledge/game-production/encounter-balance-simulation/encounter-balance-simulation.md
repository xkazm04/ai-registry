---
layer: golden-path
type: golden-path
subject: encounter-balance-simulation
status: forged
use_when: [asking whether a fight is fair before the engine runs it, tuning a combatant or ability against a target metric, reviewing a new enemy against its peers, building a stochastic balance harness]
techniques:
  - monte-carlo-scenario-presets
  - per-cell-seed-derivation-for-order-independence
  - kill-share-and-damage-share-attribution
  - one-shot-rate-and-ehp-floor-checks
  - goal-seek-on-a-seeded-monotonic-lever
  - tier-band-peer-outlier-linting
---

# Encounter balance simulation

Encounter balance simulation answers one question — *is this fight fair?* — before a
real-time engine ever runs it, and it answers it as a **measurement**, not as an
opinion with numbers attached. A designer changes a number; a harness resolves the
resulting fight thousands of times under the shipping combat rules; the harness
reports a win rate, a time-to-kill, a survivability margin, and who actually caused
the outcome. Done well, this is the cheapest feedback loop in a combat game: it
costs seconds rather than the hours a playtest costs, and it can answer questions a
playtest cannot answer at all, such as "how often does this hit one-shot a player who
is ten levels behind the area".

Done badly it is worse than nothing, because it *looks* like measurement. A harness
that models the damage rules a second time answers a question about a game nobody
plays. A harness whose numbers move when you re-run it teaches designers to re-roll
until they like the answer. A harness that reports a mean and nothing else hides
exactly the tail that ruins the player's evening. The craft of this subject is
almost entirely the craft of keeping the instrument honest.

## The instrument is asserted before the result

A stochastic tool that is not reproducible is not a measurement instrument, it is a
rumour. This is the load-bearing sentence of the whole subject, and three separate
disciplines serve it.

**Seeds are derived from identity, never drawn from a shared stream.** The moment two
cells of a sweep pull from one advancing generator, the value of any cell depends on
how many cells ran before it — so the same cell reports different numbers depending on
whether the sweep ran left-to-right or was resumed after a crash. The fix is not to
"reset the generator between cells" (that makes every cell identical). The fix is to
derive each cell's seed from a hash of the cell's own coordinates, so a cell's result
is a pure function of what the cell *is* (per-cell-seed-derivation-for-order-independence).

**Draws are consumed lazily.** Inside the resolution kernel, a random draw taken for a
layer whose probability is zero costs nothing in the result but shifts every subsequent
draw. Consume a draw only when the outcome actually depends on it. This is what allows
one kernel to be reused by a different caller — a replay tool, an adapter, a second
harness — without its draw order changing underneath, and it is the difference between
a determinism claim that holds and one that holds until someone adds a feature.

**A solver requires a seeded, monotonic target or it is not solving anything.** Bisection
on a noisy metric converges on the noise, and returns a different lever value every run
(goal-seek-on-a-seeded-monotonic-lever). Most teams discover this precondition by
shipping the solver first.

Together these give the property that makes the harness usable in review: two people, a
month apart, on different machines, asking the same question, get the same number — so
the argument can be about the number instead of about the tool.

## One kernel, or you are balancing a different game

The simulation must call the same damage-and-mitigation resolution the runtime calls.
Not a port of it, not a "close enough" formula in the harness, not last quarter's copy.
The moment a second model exists, its disagreement with the first is invisible until it
is load-bearing, and the failure mode is brutal: the harness certifies an encounter as
fair, the build ships it, and the discrepancy surfaces as a player complaint nobody can
reproduce in the tool. Where a legacy or simplified model must be kept for speed, it may
be an exploratory aid and must be barred from producing a verdict.

The corollary is architectural: the resolution kernel is extracted so that both the
runtime and the harness are *callers* of it, with the harness supplying a deterministic
generator where the runtime supplies a live one. If extracting the kernel is hard, that
difficulty is the finding — a combat system whose maths cannot be called headlessly
cannot be validated before it runs.

There is a subtler form of the same defect that survives even after the kernel is
shared, and it is the one that actually bites: an **adapter that partially applies a
quantity the kernel also applies**. A harness pre-bakes a global damage multiplier into
a combatant's attack power for convenience; the shared kernel then applies the same
multiplier per hit; the sweep silently reports squared numbers. Nothing crashes, both
sides are "using the canonical formula", and the discrepancy is a factor. The rule that
prevents it: an adapter converts *shape*, never magnitude — every scaling knob is applied
in exactly one place, inside the kernel — and where a harness must pre-compute anything,
it records which quantities it has deliberately not touched.

The laws the systems canon defines — how damage types stack, how a defence soft-caps,
what mitigation means — belong to that canon and are not restated here. This subject
consumes them; it does not own them.

## A survivability number without its reference hit is not a number

"The player survives" is not a statement. Effective health is only meaningful against a
*stated* incoming hit, because most defence curves are non-linear in the size of the hit
they absorb: the same armour value that removes half of a small hit removes a tenth of a
large one. Every survivability figure the harness emits therefore carries the reference
hit it was computed against, and every threshold is expressed as a ratio against that
same reference rather than as a bare number of health points. A harness that reports
"effective health: 4,180" and lets the reader supply the assumption has handed over a
number that two people will read two ways.

The same discipline applies to time-to-kill (against which target, at which level, with
which rotation assumed) and to damage per second (over which window, including or
excluding the opening burst).

## The standing cast

Balance questions are asked repeatedly over months, by different people, about
different systems. If each question invents its own combatants, no two answers are
comparable and the archive of past results is worthless. The discipline is a **fixed
cast** of scenario presets — a reference player build, a weak trash enemy, a heavily
armoured target, a caster with low health and high output, a boss — with stated stat
blocks and a stated iteration count, checked in alongside the code and changed only
deliberately (monte-carlo-scenario-presets). A preset change is a versioned event,
because it invalidates every stored result taken against the old cast.

The cast is not a claim about the real distribution of player builds. It is a claim
about *comparability*. Its job is to make "this ability got 12% stronger" a sentence
that survives being read next month.

## What a run must report

An outcome rate alone is not actionable. "The party wins 68% of the time" tells a
designer nothing about which knob to turn. Three families of output make a run useful:

- **The outcome, with its spread.** A win rate is an estimate with a standard error;
  at a few thousand iterations the error on a rate near 50% is on the order of one
  percentage point, so a one-point difference between two configurations is noise and
  must not be reported as a change. State the iteration count next to every rate, and
  refuse to render a difference smaller than the resolution of the run.
- **Attribution.** Kill share and damage share name *who* produced the result, which
  turns an aggregate into a lead (kill-share-and-damage-share-attribution). A single
  participant or ability holding a large fraction of the kills — around three tenths is
  a defensible line — is a finding whether the fight passed or failed: the encounter is
  really a one-actor encounter wearing a group's costume. Below that line the honest
  output is *no single source dominates*, not the name of whichever source happened to
  come first in the sort. Reporting an argmax as a culprit when it holds a tenth of the
  deaths sends a designer to nerf noise.
- **Floor compliance.** Some checks are not bands, they are hard gates:
  one-shot rate and effective-health floors (one-shot-rate-and-ehp-floor-checks). A
  fight can be perfectly balanced on average and still be unshippable because one
  telegraph in a hundred deletes the player from full health.

## Bands are judgments, floors are laws

Keep these two kinds of verdict visibly separate, because they have different authority.

A **band** maps a continuous outcome onto a designer-facing word and its boundaries are
a taste decision that a lead owns and may move. A survival-rate banding that has held up
in practice: at or above nine wins in ten the fight is *easy* and probably not worth
the player's time; down to about six in ten it is *fair*; down to roughly a third it is
*tough*; below that it is *brutal*. The exact cuts matter less than that they are
written once, shared by every surface that reports a fight, and phrased as a sentence a
non-technical stakeholder can act on rather than a number they have to interpret.

A **floor** is a shippability rule whose threshold is defined elsewhere, in the systems
canon, and which the harness merely *measures compliance with*. The harness does not
get to pick the floor, soften it because a fight is fun, or average it away. Its job is
to compute the quantity the floor is stated in and report pass, fail, or **not
measured** — never a neutral middle value standing in for an absent measurement. An
encounter nobody has simulated is unsimulated, not fair.

The distinction has a mechanical consequence: a floor's number is *read from* the
canonical statement of the rule rather than typed into the checker, so moving the rule
moves the check. A checker that cannot find the number it needs errors loudly; it never
falls back to a built-in default, because a silent default is exactly how a check
outlives the law it was written for.

## Sweeping and solving are different questions

A **sweep** asks *what does the space look like* — vary two levers over a grid, resolve
every cell, render a heat map, and let a human see the cliff. Sweeps are for finding
discontinuities and regions that behave nothing like their neighbours.

A **solve** asks *what value of this one lever hits this target metric* — and it is only
legitimate when the metric is monotonic in the lever and the evaluation is seeded. When
those hold, bisection converges in a dozen or so evaluations and returns a number a
designer can type in. When they do not hold, the honest output is a refusal plus the
sweep, not a converged-looking number.

The two compose: sweep first to confirm monotonicity over the range you intend to solve
in, then solve inside the region where the curve is well behaved. A solver that has never
seen the shape of its own metric is trusting an assumption nobody checked.

## Reviewing a new combatant

Most balance defects enter as a *new* enemy authored in isolation and never compared to
anything. The cheap, high-yield check is a peer band: compute a transparent threat score
for every combatant in a tier and flag the newcomer when it sits far above or far below
its tier's mean (tier-band-peer-outlier-linting). Two design choices make this work.

First, the threat model is **legible over accurate**. A designer must be able to predict
what raising a stat does to the score without reading code, so a small table of
keyword-to-weight contributions beats a fitted model that is right more often and
explicable never. The score is a *screening* instrument; the simulation is the
measurement. Confusing the two — treating a threat score as a verdict — is the standard
misuse.

Second, the linter respects a **minimum population**. A tier with one other member has no
mean worth comparing against, and a linter that speaks anyway trains designers to ignore
it. Below the population floor the correct output is "not enough peers to judge", which
is a different value from "fine".

## The failure modes of the naive reading

- **A second damage model.** Covered above, and it remains the most expensive mistake in
  the subject because its symptoms appear months later and elsewhere.
- **Re-rolling until the answer is nice.** The direct consequence of an unseeded harness.
  Determinism is not a nicety here; it is what stops the tool from being an oracle that
  agrees with whoever runs it last.
- **Reporting the mean.** The mean fight is not the fight that gets a game refunded. Tail
  metrics — one-shot rate, worst-decile time-to-kill, the fraction of runs where a
  participant died before acting — carry most of the shippability signal.
- **Balancing the reference build instead of the population.** The standing cast makes
  results comparable; it does not make them representative. A configuration that is fair
  for the reference player and lethal for an under-geared one has passed the wrong test.
  Run the floors against the *weak* end of the cast deliberately.
- **Iteration counts chosen by feel.** A harness that runs a hundred iterations and
  prints three significant figures is lying in the last two.
- **Quietly simulating a different encounter than the one authored.** When a harness
  cannot resolve a placement — a combatant that was renamed, an ability that no longer
  exists — dropping it and running anyway produces a clean, confident result about a
  fight that does not exist. Every skipped element is a first-class finding on the
  report, at warning severity or higher, naming what was skipped and why.
- **Simulating only the fights someone worried about.** Coverage is part of the verdict.
  An encounter table where a third of the entries were never run is a table with a third
  of its rows unmeasured, and the report must say so rather than showing green for the
  rows that happened to be checked.

Tension curves, beat structure and the plain-language narrative of how a fight *felt*
are a neighbouring concern and are not this subject's output; nor is sensitivity analysis
over economy outcomes, which shares the sweep machinery but not the question. This
subject stops at the number and its trustworthiness.

## The path, in order

1. Extract the resolution kernel so the runtime and the harness are both callers of it,
   with the generator injected.
2. Fix the standing cast and the iteration count; check them in; version them.
3. Make every result a pure function of its identity — per-cell seeds, lazy draws.
4. Report outcome with spread, attribution, and floor compliance — with `not measured`
   as a first-class value.
5. Sweep to learn the shape; solve only where the shape permits it.
6. Lint every new combatant against its tier band before anyone simulates anything.
