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

## Two known gaps in the standard itself

Recorded here rather than quietly tolerated, because a bar with unmeasured clauses
should say which ones they are.

**The maturity ladder is unused.** The profile defines
`draft -> forged -> reconciled -> transplant-tested`. Every one of the 1,508 concept
documents says `forged`. So the registry has no signal for which claims have survived
contact with a second codebase - the exact thing the four-layer design exists to make
visible. Promoting a subject requires evidence a script cannot produce:
`transplant-tested` means an agent in an unrelated codebase used the document unchanged
and it held. Until somebody does that and records it, the rung stays empty and honest.

**Demand is unknown, not zero.** No installation reports to
[`signals/`](../docs/signals-lane.md) yet, so every ranking is structure and decay only.
A sweep must say this out loud rather than ranking as though nobody needs anything. The
day a contributor appears, demand outranks every structural clause above.
