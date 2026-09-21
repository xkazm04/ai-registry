---
layer: application
type: application
subject: codegen
technique: generated-file-hygiene
stack: node
verified_on: 2026-09-07
verified_against: node@22
applied: simulation
ab_verdict: not-better
---

# Where the in-artifact marker cannot go: two allowlists that do not drift

The witness for the version above is the project's own `.nvmrc` (`22`); its
`package.json` states a floor of `>=20.0.0`, and the floor is not the witness.

The seeded-file amendment argues that an exception list kept beside a
generator is a second authority that drifts, and that the ownership bit
belongs inside the artifact. This tree was picked as the seam to test that
claim because it carries 68 files with generated markers and two committed
exception lists. **The test came back not-better, and the reason is the
useful half.**

## The seam

A binding exporter emits one TypeScript file per Rust type carrying an
export derive. A checker, `scripts/check-binding-orphans.mjs`, guards the
correspondence in both directions, and two files hold its exceptions:

| File | What it lists | Size |
|---|---|---|
| `scripts/binding-orphan-allowlist.txt` | committed binding files with no live Rust type behind them | 67 lines |
| `scripts/binding-missing-allowlist.txt` | Rust types carrying the export derive that never had a file written | 20 lines |

## A and B

**A — the tree as it stands.** Exceptions in two lists beside the checker.

**B — the amendment applied.** Each excepted artifact carries an ownership
marker; the checker skips a file that carries one; the lists are deleted.

Three cases were pulled from the tree and walked under both policies.

**Case 1 — an orphan binding, frozen after its Rust type was deleted.** The
file exists, so B can mark it. But the artifact is a generated type mirroring
a Rust type across a process boundary: a contract artifact by the
amendment's own third constraint, which forbids adoption precisely because
it converts a derived guarantee into a hand-maintained claim. B is
disqualified by the technique that proposed it. A holds.

**Case 2 — a type carrying the export derive whose file was never written.**
There is no artifact. **An ownership bit cannot live in a file that does not
exist**, so B cannot express this exception at all — not awkwardly, not at
cost: the mechanism has no place to put the information. Four of the twenty
listed names are this shape. A holds by default.

**Case 3 — a Rust type is renamed, stranding a list entry.** This is the
drift the amendment predicted, and it does not occur here. Both lists are
**two-sided**: the checker fails on an unlisted violation *and* when a listed
name stops being one — the orphan list states the convention in its own
header, "fails when a listed name stops being an orphan… a silent drop is
what a broken matcher looks like, so clearing one costs a deleted line."
A stale entry turns the gate red on the next run. A holds.

## Verdict and what it changed

`not-better`, 0 of 3 cases favouring the amendment — and none of the three
failed for a reason the amendment could fix by being written better. Two
constraints came back into the technique from this seam:

- **The absent-artifact case** (case 2) is new. The amendment did not have
  it, and it is the one situation where the in-artifact marker is not
  merely worse but inapplicable. A generator whose interesting exceptions
  are absences must use a list.
- **A two-sided list does not drift** (case 3). The amendment's argument
  rested on drift as though it were inevitable; it is a property of
  one-sided lists. The technique now says so before making its case, and
  the case is narrower and true.

The technique's rule survives for the artifact class it was written from —
editorial pages that always exist and are meant to be adoptable. This tree
has no such artifact, which is why it produced a boundary rather than an
adoption.

## What this stack cannot show

Nothing here measures the maintenance cost the amendment is really about.
Both mechanisms are gated, so both are correct; the difference is how much
attention a stale exception costs a human before the gate catches it, and
this tree has no instrument that sees that. A project with editorial
generated docs and a history of clobbered hand-edits would be the seam that
could — and the return condition for re-running this test is a fleet project
growing one.
