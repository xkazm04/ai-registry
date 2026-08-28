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

**Demand is witnessed, volatile, and this section may not quote it.** Written
2026-08-27, corrected 2026-08-28 after one day made every figure in it wrong.

The correction is the lesson, so it goes first. The 2026-08-27 version of this paragraph
carried a table: two contributors, seven of eight bundles witnessed, 87 consults, six
deviations, and an argument built on four bundles being *witnessed and silent*. One day
later a contributor's collector re-ran and the reading was three bundles witnessed, 43
consults, **63 deviations**, and not one witnessed-silent bundle. Nothing was wrong with
either measurement. The signals lane is a 30-day rolling window over installations that
regenerate on their own schedule, so **a reading of it has a shelf life of about a day.**

**A standard is a bar, not a dashboard.** Numbers belong in the instrument, run fresh;
this file holds what is true regardless of the reading. Run
[`check-currency.mjs`](../scripts/check-currency.mjs) and
[`librarian-scan.mjs`](../scripts/librarian-scan.mjs) for the reading, and treat any
figure quoted here as a dated illustration that has probably already moved.

What is structurally true, and was true under both readings:

- **Demand is real, concentrated, and does not generalize.** One installation does the
  overwhelming majority of the consulting, and it consults one bundle. Several bundles
  have never been consulted by anybody who reports, under any reading so far.
- **A consult that finds nothing wrong and a consult that was never made are different
  facts, and the collector cannot always tell you which you have.** Whichever way the
  deviation count moves between runs, ask whether the tree changed or the collection did
  before reading it as conformance.
- **Demand outranks every structural clause above for the subjects it names** - but only
  for the run that read it. Do not carry a demand ranking forward.

**Under the same gap: `demandKnown` is a boolean over three states, and it merges two of
them.** The scan asks only whether any installation named a bundle. That yields:

- **Unknown** - no installation names it.
- **Witnessed and silent** - an installation names it and reported no consults at all.
- **Demand** - a consult count.

The middle state is the informative one and the instrument cannot express it: an
installation that has a bundle wired and reaches for nothing in it. It is also the state
that evaporates fastest - the four bundles that held it on 2026-08-27 had dropped to
*unknown* by the next morning, which is the difference between "nobody needed this" and
"nobody told us", collapsing into one boolean twice in two days. Until the scan can say
which, **a sweep states in words which of the three it is ranking on, and on what date.**


**Most of the corpus cannot be checked for drift, and nothing ranks the part that can.**
Written 2026-08-27; its proposed remedy corrected 2026-08-28, because the remedy was
forbidden by the format spec. Run
[`check-currency.mjs`](../scripts/check-currency.mjs) for the reading - as of 2026-08-28
it was roughly nine in ten runtime-bearing applications, with three bundles at all of
them, but per the gap above that figure is an illustration and not a constant.

Two distinct failures sit under one heading.

*The coverage half, and it is worse than a blind spot.* A runtime-bearing application
without `verified_against` cannot drift, because nothing can compute that it has. It
therefore does not report as UNKNOWN anywhere - it reads as **not drifted**, which is
the one wrong answer of the three. This is why `0 expired · 0 at risk` must never be
read as a health statement: it is a statement about the witnessed slice only.

**This is demonstrated, not theorised.** On 2026-08-27 a worker sent to clear the single
drifted application in `media-generation` found the folder's OTHER application rotted
identically against the same source file - eight citations moved by the same refactor -
and it had escaped every gate the registry runs because it carried no witness at all.
One folder, two rotted documents, one of them uncounted. **Any drift count is a lower
bound over the witnessed slice, never a count over the corpus.**

*The ranking half.* Where drift IS computable it scores zero attention points, because
the scan's weights have no drift term. A sweep would never surface it.

**The remedy is NOT a backfill, and saying so was this section's own error.** The
2026-08-27 version proposed "one backfill pass that stamps witnesses from each
consumer's declared manifest". That is forbidden, in terms, by
[`docs/rkb-profile.md`](../docs/rkb-profile.md) §3.1:

> `verified_against` is written going forward, never backfilled. Only something that has
> actually read the cited tree can state it truthfully.

And it is forbidden for the right reason. Stamping a version read out of a consumer's
`package.json` would assert that a document's citations *were checked at* that version,
when nothing checked them at all - laundering a runtime fact into a verification claim,
which is [unmeasured-is-not-pass](../knowledge/media-generation/_laws.md#unmeasured-is-not-pass)
wearing a maintenance hat. `check-currency.mjs` had carried a comment saying exactly this since
before the gap was written; the gap was drafted without reading it. **The instrument
disagreeing with the standard is worth more than either agreeing quietly.**

The only honest closure is **re-verification**: something reads the cited tree, resolves
the citations, and writes the witness as a by-product. That is a worker per subject, not
a script over the corpus - which makes the gap expensive to close, not cheap, and that
is the true statement about it.

**Why it is still not a floor clause.** A clause worth points must exist in
`librarian-scan.mjs` or this table disagrees with what runs, and *a runtime-bearing
application carries no version witness* would flag hundreds of documents at once. That
is a flood, not a worklist, and it would bury the handful of real items a sweep finds.
So the sweep **reports the coverage in words and does not rank on it.**

What every run can do meanwhile, and what these runs did: **everything newly landed or
re-verified carries a witness**, so the gap stops growing while nobody is closing it.
And on 2026-08-28 `check-currency.mjs` was taught to report the uncomputable population
as its own line - it had been saying "backfilling would be inventing data" only in the
case where NOTHING carried a witness, which went quiet at the first one and stayed quiet
through the next six hundred, exactly when a reader most needs the denominator.
