# The standard a sweep grades against

What "good" means for a subject in this registry, stated once so every sweep grades the
same way and so the bar itself can be argued with in one place instead of drifting per
run.

Most of this is measured by [`scripts/librarian-scan.mjs`](../scripts/librarian-scan.mjs).
Where a line here is not machine-checkable, it says so - and stays, because the point of
writing it down is that a reviewer applies it.

## The floor (measured)

A subject is below the floor when any of these hold. Attention points in brackets.

| Clause | Why | Points |
| --- | --- | --- |
| A technique carries no `use_when` | It is the field a consuming agent routes on. Without it a technique is reachable only by a human reading prose - the difference between a bundle that can be consulted and one that can only be read. | 2 each |
| The subject has no application | It has never been reconciled against real code. It is a standard nobody has tested against anything. | 6 |
| Fewer than 4 techniques | The forge designs 4-6 per subject. Below that usually means the subject was cut short, not that it is simple. | 4 |
| One stack across all applications | The transplant claim is untested. Two stacks is where "this is general" stops being an assertion. | 2 |
| An application is past its clock | Worse than a missing claim: it asserts a currency it does not have. | 5 each |
| An application is within 30 days of its clock | Cheap to catch before it expires. | 1 each |
| Never swept by the librarian | Not a defect in the subject - a gap in what we know about it. | 3 |
| A consumer reports citations `gone` | The strongest signal available, because somebody measured it against a real tree. | 6 each |
| A consumer records a deviation | Demand pointing directly at a subject. | 4 each |

The weights live in the scan script, not here, so they cannot disagree with what runs.
This table is the argument for them; that file is the implementation.

## The bar (judged, not measured)

No script decides these. A reviewer does, reading diffs.

- **The upper two layers transplant unchanged.** No repo paths, no file extensions, no
  product, tool, model or company names - including ones the purity denylist does not
  list. The denylist is a floor, and the real test is whether an unrelated team in
  another company could adopt the document as written.
- **Decision rules are stated as rules.** "When X, do Y, because Z." A technique that
  describes a thing without saying when to reach for it has not finished.
- **Numbers carry their measurement.** A figure with no n, no date and no method is
  prose wearing a lab coat. Measured results live in applications with their n; they
  are never laundered upward into a technique as a universal.
- **A correction keeps the file's prior voice.** The corpus reads as one author. A
  patch that reads like a different one is a patch that gets reverted later by someone
  who cannot tell which half is right.
- **`status` means something.** Everything currently says `forged`. `reconciled` and
  `transplant-tested` are real rungs that have never been used, and nothing may
  self-promote into them - see below.
- **Reachable on the path a consumer takes, for the price of one subject.** A consult
  should cost the golden path plus the techniques that apply (about 12K tokens for a
  six-technique subject) and nothing of the index, which is an address book for a
  script, not a document for an agent - the largest bundle's index is over 140K
  tokens. The test is mechanical and a reflection should run it: phrase a query the
  way a technique's `use_when` is phrased and check that the DEFAULT routing path
  ranks that subject first. On 2026-08-23 it ranked third, because the router scored
  slugs only and read `use_when` under an opt-in flag; the index had carried the field
  all along. Fixed in the router and the consult skill the same day, and kept here so
  the next instrument change is measured the same way.

## Two known gaps in the standard itself

Recorded here rather than quietly tolerated, because a bar with unmeasured clauses
should say which ones they are.

**The maturity ladder is unused, and the lane that earns its second rung has run
29 times without claiming it.** The profile defines
`draft -> forged -> reconciled -> transplant-tested`. Every one of the 310 golden paths
says `forged`. The rung names were never given definitions, so here they are, as the
reviewer applies them:

- `reconciled` - a subject with at least one application bound to an EXTERNAL tree at
  a pinned version and commit, written by a worker who did not forge the subject,
  every citation re-checked against the clone, and the reconciliation's hint fates
  (confirmed / refuted / passed over) recorded in the subject's vault note. The
  external-reconcile lane has produced exactly this for 29 software-engineering
  subjects between 2026-08-20 and 2026-08-23; they are the candidates, and flipping
  the field is a reviewer's act done as one mechanical pass after a human agrees to
  the definition above - not something a worker or a sweep does.
- `transplant-tested` - an agent in an unrelated codebase used the upper two layers
  unchanged and recorded that they held. That is a consult with a deviation count, so
  the signals lane is where this rung's evidence will come from. Nothing qualifies yet.

**Demand is witnessed, small, and mostly unrecalled.** The first contributor reported
on 2026-08-23: six connected projects, three consults in thirty days, three bundles
witnessed, four deviations recorded - every consult found the repo short of the
standard somewhere. Against 1,900 techniques that is a supply-to-demand ratio the
corpus cannot justify by content alone, and the cause is measurable: all six projects
declare their bundles in a manifest, and none of their agent guides tells an agent to
consult before deciding. The knowledge is reachable and not recalled. Demand now
outranks every structural clause above for the subjects it names; for the four bundles
no consult has touched, demand is still unknown, not zero.
