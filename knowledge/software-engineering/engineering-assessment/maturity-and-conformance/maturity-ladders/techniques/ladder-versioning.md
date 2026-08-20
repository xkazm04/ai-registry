---
layer: technique
type: technique
subject: maturity-ladders
technique: ladder-versioning
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation, gate-sees-target]
shared_with: []
use_when: [editing rung criteria, adding or renaming a rung, cached assessments look stale, reviewing a ladder change]
---

# Ladder versioning

A ladder becomes an interface the first time a rung is written down somewhere
that outlives the run. From then on, every edit is either a rung-moving change —
which invalidates stored values, caches, and comparisons — or a cosmetic one. The
whole technique is making that call *deliberately, in the same change as the
edit*, because the failure mode is not a wrong decision but an unmade one.

## What counts as a rung-moving change

Enumerate this list in the ladder's own declaration, so a reviewer reads it while
reviewing the diff:

**Rung-moving (bump the version):**

- adding, removing, reordering or renaming a rung;
- changing any criterion's predicate, threshold, or population;
- changing a criterion's evidence class (reference-level accepted where content
  was previously required, or the reverse);
- moving a band edge, or changing the hysteresis margins that decide the
  published rung;
- adding, removing or re-tuning an honesty cap;
- changing cumulativity — making a lower rung's criterion optional at a higher
  rung, or vice versa;
- changing the input set the assessment reads, in a way that can change which
  criteria are satisfiable.

**Cosmetic (no bump):**

- rewording a description without changing what it asserts;
- taglines, colours, icons, ordering of display;
- performance work, refactors, logging;
- adding an explanation of an existing criterion.

The boundary case that decides the culture: *"we only made the wording clearer".*
If the clearer wording would cause any subject in the current cohort to be
assessed differently, it is a rung-moving change. Test it against the cohort
rather than against intuition.

## A bump asserts non-comparability, not incorrectness

The most common reason a bump gets skipped is that the author is confident the
change does not move any rung — a prompt instruction that only constrains
punctuation, an input added that no criterion reads today. That confidence is
usually right and still beside the point. **A stored assessment carries the
definition that produced it; if the definition is not that definition, the two
are not comparable, whatever the numbers do.** Bumping is not an admission that
the old values were wrong. It says: everything computed before this line was
computed under different inputs, so do not splice the two series and do not serve
a cached result from before it as current.

Adopting this framing settles nearly every borderline case, because the question
stops being "did the answer change?" (unknowable in advance) and becomes "did the
inputs change?" (readable in the diff).

## The version is a property of the declaration, not the deployment

Put the version literal beside the criteria, in the same artifact, so that no
criteria edit can ship without the reviewer's eye passing over the line that
must change. A version derived from a release tag, a build number, or a
timestamp is not a ladder version — it moves when the ladder does not, and it
fails to move when the ladder does. One authoritative declaration, every consumer
reading the version from it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)); a
second copy in the reporting layer is a drift with a delay fuse.

## Fold the version into the cache key

Assessment results are expensive and therefore cached — in a store, a memo, a
materialised summary. Every one of those caches is a population of values
computed under a specific ladder, and a bump must invalidate all of them
**atomically**. The reliable mechanism is not an invalidation sweep — sweeps miss
caches added later — but composing the version *into the key itself*: the key
includes the ladder version, so a bump makes every old entry unreachable by
construction, and the old entries age out on their own schedule.

This has a second benefit: because old entries remain readable under their old
key, a bump is trivially reversible. A version rollback restores the previous
population of results instead of forcing a recompute storm.

Any cached derived value states how it is recomputed
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation));
for a ladder, "recompute" means "re-run the assessment under version X", and the
key is what makes that statement checkable.

## Force the decision into the diff

Reviewers do not reliably notice a missing version bump — the diff shows a
criteria edit and looks correct in isolation. Make the omission fail loudly:

- **Pin the criteria.** Keep a test that hashes the normalised criteria set
  (rung names, predicates, thresholds, evidence classes, edges, caps) and
  compares it to a checked-in expected value declared next to the version. Any
  substantive edit fails the test; the fix is to update *both* the hash and the
  version, in the same commit, which is exactly the decision you wanted forced.
  Normalise before hashing so whitespace and comment churn do not fire it — a
  pin that cries wolf gets its expected value updated reflexively, which
  destroys it.
- **Point the pin at the real thing.** The hash must be computed over the
  criteria the assessment actually executes, not over a documentation copy of
  them ([gate-sees-target](../../../../_laws.md#gate-sees-target)). A pin over a
  parallel description passes precisely when the two have diverged.
- **Enumerate the pin's blind spot, at the pin.** A hash can only cover what it
  can reach. Detector thresholds, calibration tables, and prompt fragments that
  live outside the hashed surface still move rungs, and the pin will stay green
  while they change. Write the exclusions down next to the pin as a standing
  instruction — "these also require a bump, and this test cannot see them" —
  because the alternative is a team that trusts a green pin as proof no bump was
  needed, which is strictly worse than having no pin at all.
- **Diff the cohort.** A ladder change's review evidence is the label diff over
  the current population: who moves up, who moves down, how many. Attach it to
  the change. If the author cannot produce it, the change has not been
  understood.

## Version numbering, and what a bump obliges

A single monotonic integer is sufficient and preferable to semantic versioning
here, because every rung-moving change is breaking by definition — there is no
"backwards-compatible criteria edit". What a bump obliges:

1. a mapping entry from the previous version's rungs to the new ones, including
   the honest `unmappable` outcome where no equivalent exists
   ([migrate-on-read](./migrate-on-read.md));
2. a changelog line stating what moved and why, in the ladder's own artifact —
   this is what makes a two-year-old stored rung interpretable;
3. re-verification of any fixtures by a person, since fixtures encode the *old*
   policy by construction and updating them without reading is the pinning test
   approving its own change.

## When not to use this

A ladder used inside one run and never persisted needs no version — versioning
exists to keep *stored* values interpretable. Similarly, during a ladder's design
phase, before any assessment is retained, bumping on every edit is noise; declare
the ladder unstable, retain nothing, and start versioning at the first stored
assessment. The transition point is publication, not perfection.
