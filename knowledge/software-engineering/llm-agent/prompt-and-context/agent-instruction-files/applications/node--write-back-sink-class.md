---
layer: application
type: application
subject: agent-instruction-files
technique: write-back-sink-class
stack: node
verified_on: 2026-09-16
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# One contract line, two collectors, and a fleet split on both halves of it

The witness for the version is the runtime that executes both collectors on
the machine every number below was measured on: `node -v` reports `v24.14.0`,
and both scripts are dependency-free single files run directly by it.

The subject is a fleet of thirteen repositories that share one knowledge
registry. Each repository carries an agent-facing directory holding two
append-only logs written by the same sweep skill and named together in one
contract line — *log consults to the first, leads to the second* — under the
same "append-only by contract" rule in the shared configuration.

## The two collectors aggregate differently, and that sets the class

Both logs are drained by operator-side scripts in the registry that resolve
the fleet from a committed project map plus a machine-local root, then read
each repository's log **from the working tree**. They differ in exactly one
respect, and it is the one the technique says decides everything:

- the consult collector folds every repository into one file per
  contributing installation and **sums** rows into per-subject consult and
  deviation counts. There is no key on a row. Its own lane document states
  the rule it is protecting: one file per contributing installation, *so two
  installations cannot claim one file*.
- the lead collector folds every repository into one queue and is
  **idempotent on a minted key** — timestamp plus bundle plus claim — so a
  row it has already seen is not re-appended. Its header says entries are
  never rewritten or removed.

So the consult log is count-aggregated and must stay local; the lead log is
identity-aggregated and should travel. Nothing in the contract line says so.

## What the fleet actually did

Across the nine repositories carrying both files at the time of the read:

| log | shared | local |
| --- | --- | --- |
| consults (count-aggregated — should be local) | 2 | 7 |
| leads (identity-aggregated — should travel) | 6 | 1 |

Three of the nine are on the wrong side, and **the two that share the
consult log had each written down a reason**:

- one carried a dated owner decision to track the whole directory, arguing
  that the registry is consulted from more than one machine and *a lane that
  exists only on the box that generated it cannot be read by the next one*;
- another carried the opposite rule for the same two files — *counts reach
  the aggregate lane; the log itself stays local*.

Neither is drift, and this is the part worth carrying: each reason is true
of one of the two logs and false of the other, and each project applied its
reason to both. The first describes the lead log exactly — an undrained lead
stranded on one machine is precisely that loss. The second describes the
consult log exactly. The contract assigned no class, so each project
generalised from whichever half it thought about first.

## The paired arm

One repository was chosen because it carried the count-aggregated log in the
shared artifact with **no stated reason at all**, so the arm tests the rule
rather than overturning a judgment. The change is one ignore rule plus
removing the file from the index; the file stays on disk in full.

- **Target** — rows a fresh checkout inherits and the collector would there
  count as that installation's own observations: **83 → 0**.
- **Floor** — this installation's own collected output, declared before the
  arm ran and required to hold: **unchanged**. 281 consults across 7 bundles
  before and after, with every per-bundle block byte-identical once the
  generation timestamp is excluded. The collector reads the working tree, so
  the local measurement is untouched by what the index holds.

The floor is the half that makes the change safe to recommend: the fix
costs the owning installation nothing, because the owning installation was
never reading the shared copy. Everything it cost was being paid by a
checkout that does not exist yet, which is why no project could see it.

The registry's own ranking already shows the symptom one level up. Its
worklist prints a duplicate-report warning naming two installations that
filed an identical block for one bundle, calls that *one fleet counted
twice, not two installations that agree*, and ranks demand on the floor of
a range rather than a sum. That is a downstream mitigation for this
upstream fact, and it is coarse: it collapses whole bundle blocks, not the
rows inside them.

## What this cannot do

The paired arm proves the inheritance, not the double count. Measuring the
second half needs a second installation to clone the repository and run the
collector, and this fleet has exactly one machine holding these checkouts.
The 83 is therefore an exact count of what *would* be inherited, and the
re-counting is inferred from the collector's arithmetic rather than
observed. The two remaining misclassified repositories were left alone: one
holds a dated owner decision and live uncommitted work in both files, and
one is on the cheap side of the error — a stranded lead is four rows of lost
work, not a corrupted count.

The enumeration that found the fleet split was manual per repository. The
scripted version over-reported badly on one project whose agent
configuration includes a long historical run journal: prose *about* past
writes is indistinguishable, line by line, from an instruction *to* write.
Any automated form of this audit needs to read instructions only.

## Return condition

Re-verify when a second installation of any of these repositories exists, or
when either collector gains or loses its identity key — the class follows
the collector, so a consult collector that started keying rows would flip
the correct answer for seven repositories at once.
