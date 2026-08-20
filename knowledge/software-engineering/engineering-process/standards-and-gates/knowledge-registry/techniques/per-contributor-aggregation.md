---
layer: technique
type: technique
subject: knowledge-registry
technique: per-contributor-aggregation
status: forged
laws: [count-carries-predicate, derivation-names-recomputation, one-authority-per-vocabulary]
shared_with: []
---

# Per-contributor aggregation

Some registry content is **contributed** rather than authored: each installation
knows something only it can know — how often it reached for a shared
instruction, which version it runs, when it last synchronized — and the shared
value is the aggregate across all of them.

The obvious shape is one field every contributor updates. In a repository that
fails twice:

- **Lost updates.** Two contributors read the same value, each adds its own
  delta, the second write erases the first. Nothing errors; the number is just
  quietly too low.
- **Conflicts on every sync.** Even when the arithmetic survives, two
  contributors editing the same line is a merge conflict every time both are
  active — for a value nobody is arguing about.

## The shape

**One file per contributor, aggregated at generation time.**

```
usage/<contributor>.json      # written only by <contributor>
```

Each contributor owns exactly one file and never touches another's. There is
nothing to conflict over, because no two writers address the same bytes. The
shared view — a total, a per-item breakdown, a leaderboard — is *derived* from
the lane whenever it is regenerated.

Three properties fall out of the shape rather than being enforced by discipline:

- **Removal is deletion.** A contributor that goes away is removed by deleting
  its file; the aggregate drops it on the next generation with no migration.
- **Provenance is free.** Who reported what is the filename. The aggregate can
  list its contributors without a separate ledger.
- **The aggregate stays honest.** Because it is generated, hand-editing it is
  overwritten on the next run — which is the point
  (`_laws.md#derivation-names-recomputation`). A derived number that can be
  edited in place is a number nobody can trust.

## Identity has to be enforced, not requested

The filename is the identity, and the file's own declaration of who wrote it must
match it. Without that check, two installations can both declare the same
contributor id in different files and be counted twice — the exact
double-counting the shape was chosen to prevent.

Enforce it in the gate, and derive the filename from the *validated* id rather
than from what the caller passed, so an unnormalized id cannot produce a file the
gate will then reject.

Refuse rather than fall back. An id that normalizes to nothing must be an error,
never a default like the tool's own name: a shared default is precisely how two
installations collide on one filename and silently overwrite each other.

## Count locally, publish rarely

Contributed counts should accumulate in the contributor's own store and reach the
registry only when something else is already being committed. A commit whose only
content is a counter is noise in a repository people read, and it turns every
local event into a write to shared infrastructure.

Publishing on the back of an existing commit — a version bump, a new
contribution, a synchronization — costs nothing extra and bounds the write rate
to something a human would recognize as activity. Staleness is fine and should be
stated: a generation timestamp and the window the numbers cover tell a reader
exactly how much to trust them.

## Aggregate only, and enforce it

When the registry is readable beyond the team that writes it, the aggregate is
also a disclosure boundary. Contributed telemetry attracts detail —
per-project breakdowns, paths, identifiers — none of which the shared view needs
and all of which leaks the contributor's internals.

Two mechanisms, and the second is the one that holds:

- **Shape the producer so the detail never exists.** If the query that builds the
  contribution groups only by the shared key, there is no per-project row to
  leak. A rule enforced by the data's shape cannot be forgotten by the next
  person.
- **Reject leaky values at the gate.** Path-shaped, address-shaped and
  URL-shaped values fail validation, and unknown keys are refused outright so
  extra detail cannot be smuggled in as a new field. Privacy in a shared
  repository cannot rest on every contributor remembering the rule; one leaked
  value is permanent in the history.

## Zero contributors is not zero usage

The aggregate of an empty lane is zero, and so is the aggregate of a lane whose
contributors all report nothing. These are different facts — *nobody is
reporting* versus *nobody is using it* — and a single number cannot carry both
(`_laws.md#count-carries-predicate`).

Publish the contributor count beside the total. A zero with no contributors means
the lane has no witness; a zero with contributors means the thing is genuinely
unused, and only the second is evidence for retiring it.
