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

## Three known gaps in the standard itself

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

**Demand is witnessed, uneven, and no longer small.** Two installations report as of
2026-08-27. The picture changed sharply between them and the earlier version of this
paragraph - written when one contributor had reported three consults - is superseded:

| | |
| --- | --- |
| Contributors | 2 (2026-08-23, 2026-08-25) |
| Bundles witnessed | 7 of 8; only `localization` is unwitnessed |
| Consults in window | 87 |
| Deviations | 6 |

One installation consulted **46 distinct `software-engineering` subjects 83 times in
thirty days**. That is the recall problem being solved somewhere, and it retires the
supply-to-demand argument this paragraph used to make against the whole corpus - for
that bundle. It does not generalize: the other contributor recorded three consults, and
five bundles have never been consulted by anybody who reports.

Two readings of that installation's **zero deviations across 83 consults**, and the
standard does not pick one: either the tree genuinely conforms, or the deviation path
was never exercised. The other contributor's three consults produced four deviations
using the same collector, which is the reason not to assume the first reading. Unknown
is not zero, and it is not conformance either.

**Under the same gap: `demandKnown` is a boolean over three states, and it merges two
of them.** The scan asks only whether any installation named a bundle. That yields:

- **Unknown** - no installation names it. `localization`, today.
- **Witnessed and silent** - an installation names it and reported no consults at all.
  Four bundles today: `llm-observability`, `media-generation`, `grant-funding`,
  `civic-intelligence`.
- **Demand** - a consult count. Three bundles.

The middle state is the informative one and the instrument cannot express it: it is an
installation that has the bundle wired and reaches for nothing in it. `media-generation`
is the sharpest case - the supply side moved 39 techniques in six days while the demand
side stayed at zero. A sweep should say which of the three it is ranking on, in words,
until the scan can.

Demand outranks every structural clause above for the subjects it names.

**Currency is instrumented for a tenth of the corpus, and drift is unranked.** Measured
2026-08-27:

| | |
| --- | --- |
| Applications | 934 |
| Runtime-bearing (non-`process`) | 704 |
| Carrying `verified_against` | 73 - **10%** |
| Of those, drifted against a reported fleet major | 18 - **25% of what is measurable** |
| Bundles with zero version witnesses | 4 (`civic-intelligence`, `grant-funding`, `localization`, `recruiting` - 294 applications) |

Two distinct failures sit under one heading.

*The coverage half.* A runtime-bearing application without `verified_against` cannot
drift, because nothing can compute that it has. `check-currency.mjs` says this about
itself in a comment - "a fact about our instrumentation, not about the document" - and
it is right, which is why `0 expired · 0 at risk` must never be read as a health
statement. It is a statement about 10% of the runtime corpus. For four bundles it is a
statement about nothing at all.

*The ranking half.* Where drift IS computable it scores zero attention points, because
the scan's weights have no drift term. A quarter of everything measurable has drifted
and no sweep would ever surface it.

**Why this is recorded as a gap and not added to the floor above.** A clause worth
points has to exist in `librarian-scan.mjs` or this table disagrees with what runs, and
the obvious clause - *a runtime-bearing application carries no version witness* - would
flag 631 documents at once. That is not a worklist, it is a flood, and it would bury
the six real items a sweep actually found. The defect is systemic and the remedy is
systematic: one backfill pass that stamps witnesses from each consumer's declared
manifest, after which a floor clause becomes affordable and honest. Until somebody runs
that pass, the sweep reports the coverage figure in words and does not rank on it.

What every run can do meanwhile, and what this one did: **everything newly landed
carries a version witness.** The gap stops growing even while nobody is closing it.
