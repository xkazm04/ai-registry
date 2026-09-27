---
layer: technique
type: technique
subject: engine-behaviour-profiles
technique: capability-claims-expire
status: draft
laws: [measure-the-tree-not-the-summary]
shared_with: []
use_when: [writing down a finding about a model family, reviewing an inherited configuration default, deciding how long a benchmark result may be quoted]
---

# Capability claims expire

The concern: a measured statement about a model family is true of a *release*, on *these
tasks*, at *that date*, and it will be quoted later as a statement about the family. The
quote outlives the release, the tasks change, and a defensible measurement decomposes into
brand preference that a team will defend with unearned confidence. **Every published claim
carries the three qualifiers that make it falsifiable, and the fleet re-derives rather than
inherits.**

## The discipline

- **Stamp every claim** with the release identifier, the tier, the harness and its
  version, the cases it was measured on, the number of runs per cell, and the date. A claim missing any of these is not
  quotable outside the document it lives in.
- **Separate disposition from capability, and do not give either a longer shelf life.**
  Disposition claims (what a family treats as authoritative, whether it acts or reports)
  were long assumed to age slowly and transfer across releases; the record says
  otherwise. Shortcut-taking, sycophancy and cooperation with misuse have each moved
  sharply between adjacent releases of one vendor, sibling models released together have
  landed on opposite sides of the same measure, and a vendor's system-prompt edit has
  moved a disposition with no model change. Mark which kind a finding is, because they
  fail differently - a stale capability claim misranks, a stale disposition claim
  misroutes - but stamp and re-derive both on the same triggers.
- **Re-derive on a trigger, not a calendar.** The triggers are: a new release in either
  family, a new version of the harness either family runs in, a change to the task's
  wording, a change to how runs are measured, and a change to the repositories being run
  against. Any one invalidates the comparison; a calendar review misses all five and fires
  when nothing has changed. The harness trigger is the easiest to miss, because it updates
  itself and ships per-model prompt templates that change the instructions without
  changing the model.
- **Keep the raw grid**, not only the conclusion. A conclusion cannot be re-derived under a
  corrected measurement; a stored grid can, and a fleet that fixes its measurement will
  need to re-score everything it already published.
- **Prefer conditional phrasing that survives.** "On tasks that commit to a repository,
  prefer the family that defers to declared rules" outlives "prefer family X" and is
  actionable without naming anything.

## Decision rules

- **A claim without its date and cases is deleted, not corrected.** Leaving it in place
  with a caveat preserves the quote and loses the caveat.
- **An inherited default is re-qualified before it is defended.** When someone asks why the
  fleet uses a configuration, the answer is a grid with a date. If the grid is older than
  the newest release in either family, the honest answer is "we do not currently know".
- **A superseded claim is archived with what replaced it**, so the corpus records that the
  measurement moved and why — which is also the only way a reader can tell a stale claim
  from a stable one.
