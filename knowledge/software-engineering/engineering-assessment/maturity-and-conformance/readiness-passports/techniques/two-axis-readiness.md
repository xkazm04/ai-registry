---
layer: technique
type: technique
subject: readiness-passports
technique: two-axis-readiness
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [designing a readiness fingerprint's axes, someone asks for a single headline score, deciding what an agent may be trusted to do in a project]
---

# Two-axis readiness

A readiness fingerprint carries **two ordinals, not one**: how fit the project
is to run in front of real users, and how much of the work in it can safely be
handed to an autonomous worker. They are computed from overlapping evidence and
they answer different questions, and a reader takes a different action on a
change in each.

## The axis-selection test

Before adding or merging an axis, apply one test: **does a reader do something
different when this axis moves, holding the other fixed?**

- Fitness-to-ship drops → the launch is delayed, or a rollback plan is written.
- Fitness-to-delegate drops → unattended change is restricted; work that was
  going to be handed off gets supervised instead.

Those are different people doing different things on different calendars. Two
axes. Conversely, if a proposed third axis only ever moves in lockstep with an
existing one, it is a sub-dimension of it and belongs in that axis's breakdown,
not in the fingerprint's spine. Every axis costs the reader a column and costs
the schema a version; three is usually the ceiling before the artifact stops
being readable at a glance, which was its purpose.

## Why these two come apart

The evidence overlaps heavily — both axes care about whether checks exist and
whether they run — but the *weighting* of that evidence inverts.

| Situation | Fit to ship | Fit to delegate |
| --- | --- | --- |
| Long-running service, careful team, no automated gate | High | Low |
| New project, strict blocking pipeline, nothing in production | Low | High |
| Good tests, no rollback path | Medium | Low |
| Deployed, observable, zero test coverage | Medium | Low |

The mechanism behind the first row is the one worth internalising: a project
can be production-worthy on the strength of human attention, and human
attention does not delegate. The second axis is asking about the *machinery*
that makes a change survivable when nobody is watching — a gate that can fail,
a way back, a check that observes the real target rather than a proxy — which
is a strictly different property from being good today.

## Build each axis on a ladder, do not invent one

Each axis is an ordinal rung from a named ladder with deniable criteria,
cumulative rungs, and a stated version. That machinery — rung criteria, band
edges, hysteresis, existence versus enforcement, what may not be averaged —
belongs to the maturity-ladder discipline and is used here unchanged. What this
technique adds is only what happens when **two** ladders share one artifact:

1. **Independent computation.** Neither axis may take the other as an input.
   The moment one is a term in the other, they co-vary by construction and the
   pair stops carrying two facts.
2. **Shared evidence, disclosed.** They may read the same underlying signals.
   Say so in the breakdown, because a reader who sees both axes fall together
   should be able to tell whether that is a real correlation or one weak signal
   counted twice.
3. **Independent versions.** Each axis names its own ladder version. A change
   to the delegation criteria must not invalidate stored ship-readiness values.

## The delegation axis wants cumulative predicates, not a score

The fitness-to-delegate axis is unusually well served by a **predicate
cascade** rather than a banded score, because delegation is a permission and
permissions are all-or-nothing at each level. Rung *n* is reached only when
every predicate for rungs 1..*n* holds. A typical shape:

1. Nothing may be changed unattended.
2. Isolated, reversible changes only — no shared state, no release path.
3. Ordinary change permitted, with a blocking gate that observes the real
   target and a demonstrated way back.
4. Change permitted up to and including the release path, with monitoring that
   would detect the failure the gate cannot.

Written this way the axis is auditable without arithmetic: a reader can see
exactly which predicate is unsatisfied, which is also the next action. Note the
asymmetry with a weighted score, and prefer the cascade for this axis
specifically: a blended score lets partial strength on several dimensions carry
a project past a level whose defining safety property is absent, which is
precisely the wrong failure direction for a permission.

## Honesty caps apply per axis

An honesty cap lowers a computed rung because the *evidence* is weak, not
because the criteria say so — coverage below a floor, evidence older than the
project's last significant change, a rung resting only on self-declared
material. The general rules are the ladder subject's. Two are specific to
carrying two axes in one artifact:

- **Caps do not cross axes.** A credential missing for one axis's evidence
  source caps that axis and leaves the other alone. A global cap teaches
  readers that a caveat anywhere means the whole artifact is unreliable, which
  is both false and a reason to stop reading caveats.
- **Every cap renders on the axis it capped**, with what would lift it. A
  capped rung that looks identical to an earned one is a fabricated verdict at
  the exact point of least evidence.

## The pair is the output; there is no headline

Do not average the axes. Do not sum them. Do not derive a single letter grade
from them "for the summary view".

The reason is not aesthetic. The axes are ordinals on different ladders — the
spacing between rungs is unknown and the scales are not commensurable, so their
mean is arithmetic over units that do not exist. Worse, the average is exactly
what gets quoted, so the two facts you paid to separate are destroyed in the
one artifact everyone reads. A headline number also creates a perverse route to
a better score: improve the cheaper axis.

If a single sort key is genuinely required — a portfolio list must be ordered
somehow — sort by one **named** axis with the axis named in the column header,
or sort lexicographically by the pair. Both are honest; the mean is not. A
cardinal figure *within* one axis is also legitimate and often useful: a
weighted blend of that axis's sub-scales gives a fine-grained sort key, with
the ordinal rung as the comparable word beside it. The rule is narrower than
"no numbers" — it is that the number never crosses axes, and that the rung, not
the number, is what gets stored and quoted. Any
count derived from the pair carries its predicate: "9 of 40 at ship-rung 3 or
above *and* delegate-rung 3 or above, assessor v4"
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

The pair is also more useful than either half, because it lets the artifact say
the sentence nobody can say with one number: *capable, but not yet trusted to
run unattended*. That sentence is the reason the second axis exists.

## Missing is a third state on every axis

Each axis has three outcomes, not two: a rung, "not assessed", and "assessed
and unreadable". A project that was never assessed must not render as the
bottom rung — the bottom rung is a measurement, meaning we looked and found
nothing; absence means we did not look
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). In a
portfolio view these are three visually distinct states, and the counts of each
appear beside any aggregate.

## When not to use this

- **A single-purpose fingerprint.** If the artifact serves exactly one decision
  — an admission gate, say — one axis is right and the second is noise the gate
  must ignore anyway.
- **A population where the axes genuinely co-vary.** In some fleets every
  project's delegation posture is set centrally by the platform, so the second
  axis is a property of the platform, not of the project. Measure it once at
  the platform and drop it from the per-project artifact.
- **Before either ladder has deniable criteria.** Two vague axes are worse than
  one sharp one: the reader now has two numbers they cannot argue with, and
  disagreement at the boundaries doubles.
