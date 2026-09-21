---
layer: golden-path
type: golden-path
subject: engine-behaviour-profiles
status: draft
use_when: [choosing between vendor families for a task, explaining why two families fail the same task differently, deciding which family runs a task that touches private material, planning a fallback family for a fleet]
techniques:
  - authority-conflict-disposition
  - family-diversity-as-a-control
  - capability-claims-expire
---

# Engine behaviour profiles

Two agent families given the same instruction, the same repository and the same tier do
not produce the same class of mistake. The differences that matter operationally are not
"which is smarter" — that question is unanswerable at fleet scale and obsolete within a
release — but *dispositions*: what the family treats as authoritative when sources
conflict, what it does when a procedure is silent, whether it prefers to act or to report,
and whether it will override a machine-readable rule to satisfy a human-readable
instruction.

A disposition is worth profiling because it is stable across tiers within a family and
predicts the failure you will get, which is exactly what a fleet needs in order to route
work. A capability ranking is worth much less: it changes with every model release, it is
measured on tasks unlike yours, and it says nothing about which family will quietly commit
your private material.

## The dispositions worth measuring

- **Authority conflict.** A task says "commit the output"; the repository's ignore rules
  say that output is not committed. Which wins? This is the single most consequential
  disposition, because one resolution is silently destructive and both look confident.
- **Silence handling.** A procedure covers one branch and omits its opposite. Does the
  family invent the missing branch and proceed, or stop and report that the branch is
  undefined? Neither is wrong; they produce opposite failure modes (unrequested work
  versus no work), and a fleet should know which it is buying.
- **Evidence reach.** When a repository declares its own checks in a machine-readable
  place, does the family go find them, or does it follow the abbreviated list its task
  handed it? This predicts false "all clear" verdicts.
- **Action bias.** Given a discretionary improvement, does the family land it, or park it
  as a proposal? A family that reports rather than commits scores well on prudence and
  produces nothing to merge, which is a legitimate choice only if the operator wanted it.
- **Self-restraint under scale.** As the tier rises and the family finds more to do, does
  its output stay proportionate to the task, or does it expand to fill the ceiling?

## How to profile without producing folklore

Profiles are earned from the same grid that earns configuration recommendations: hold the
task and repository fixed, vary the family, and record mechanical facts — not impressions.
A disposition claim is only worth publishing when it is **reproduced across tiers within
the family** and **contrasted against at least one other family on the identical case**.
One run showing a family doing something careless is an anecdote; the same behaviour at
every tier, against a case where another family did the opposite, is a profile.

Every claim carries its date and the case it was measured on. Disposition is more stable
than capability, but it is not permanent — it comes from the vendor's own alignment and
harness defaults, and those change.

## What a profile is for

- **Routing.** Send tasks that touch private, generated or irreversible material to the
  family whose disposition is to respect declared rules, even if it scores lower on
  polish. Send read-and-report tasks wherever quality is highest.
- **Fallback pairing.** A fleet with a second family available should choose the pair that
  fails *differently*, so a defect in one is visible rather than duplicated. A fallback in
  the same family is capacity insurance, not correctness insurance.
- **Interpreting a single failure.** With a profile, one bad run is triaged in a minute:
  characteristic of the family, or new? Without one, every failure restarts the argument.

## What a profile must never become

A profile is not a ranking, not an endorsement, and not a reason to stop measuring. The
fastest way to turn a useful profile into folklore is to let it outlive its evidence: a
year-old disposition claim, repeated without its date and case, is indistinguishable from
brand preference and will be defended as if it were data.
