---
layer: technique
type: technique
subject: codebase-scanning
technique: the-narrowest-view-owns-the-number
status: forged
laws: [count-carries-predicate, gate-sees-target]
shared_with: []
applied: code
ab_verdict: better
use_when: [a coverage figure is computed at ingest and consumed by a judgment made later, the same evidence is restricted more than once before anything reasons over it, a confidence number weights how far a model may move a score, deciding whether a partial-read notice belongs in the prompt or in a log, a presentation window drops material the fetch succeeded at reading, a scope statement is being written about untrusted content]
---

# The narrowest view owns the number

[ingestion-budget](./ingestion-budget.md) establishes the honest denominator: take
the full listing even when almost no contents can be afforded, because the listing
is what lets a sample describe itself. It also names the seam this technique is
about — *"the deterministic detectors and the model are different consumers with
different appetites … Fetch the union, then let each consumer take its own ordered
slice of the snapshot. The snapshot is the shared artifact; the window is a view
onto it."*

That seam is correct and it leaves a figure stranded. A coverage number is computed
once, where the snapshot is built, and it is then read by a judgment formed from a
**view** onto that snapshot — a narrower population the number has no term for.

> **Where the same evidence is restricted more than once, the coverage figure that
> prices a judgment is computed at the LAST restriction — the view the judgment was
> actually formed from. Every earlier figure is true about a population nobody
> reasoned over.**

## Three restrictions, and only one of them bounds the reasoning

A pipeline that reads a repository and asks a model to assess it narrows the same
evidence at least three times, and each narrowing is somebody's deliberate design:

| stage | what it prices | disclosed as |
| --- | --- | --- |
| the fetch | transport success — how many of the chosen files came back | a success rate |
| the byte plan | the ingest budget — which chosen files were displaced before a byte was read | its own term, usually |
| the presentation window | what the reasoning party can hold at once | nothing |

The first two are measured at ingest and are the two that get instrumented,
because they are where failures look like failures. The third is not a failure at
all: every file was chosen, fetched and stored successfully, and then a byte
window on the way into the judgment dropped most of them. Nothing is broken, no
branch was taken, no error was logged — and it is the **only** one of the three
that bounds what the judging party read.

The consequence is not a reporting blemish. Where the coverage figure is used to
weight how far the judgment may move a score — a blend coefficient, a guardband, a
confidence multiplier — the figure is answering *how much did the reasoner see* and
is measured one layer above the reasoner. It licenses the judgment at fetch-scope
confidence while the judgment rests on window-scope evidence.

Measured on a repository-assessment pipeline scanning its own tree: 3,454 files
listed, 31 selected, all 31 fetched, none displaced — a clean ingest, coverage
0.85, the model's weight on every dimension 0.6 × 0.85 = 0.51, and no partial-read
caveat rendered. The presentation window showed the model **14 of those 31 files**.
The 17 it dropped included the container and deployment manifests and the whole
end-to-end test directory, so a dimension whose evidence lived only there was
scored from an empty window by a judgment carrying full-ingest confidence.
Admitting the window's ratio as a fourth term put coverage at 0.38, the weight at
0.23, and tripped the partial-read caveat that had stayed silent. Same repository,
same commit, same fetch: the number moved because it stopped describing a
population the judgment had not used.

## The earlier figures are not wrong, and must not be replaced

A tempting repair is to move the coverage computation into the view and delete the
ingest terms. Do not. The fetch rate diagnoses transport, the plan's displacement
diagnoses the budget, and each is the term an operator needs to act — the remedies
are different and a single blended number cannot be acted on, which is the same
reason [the-tree-is-not-the-population](./the-tree-is-not-the-population.md)
insists an excluded count be broken down by the filter that removed each file.
The window is an additional multiplicative term reported beside them, not a
substitute for them. What changes is only which figure a *consumer of the
judgment* is given: the one measured at the narrowest view.

## The notice is owed to the reasoner, and only when it bites

[context-budgeting](../../../../llm-agent/prompt-and-context/prompt-assembly/techniques/context-budgeting.md)
already settles where a partial-read notice goes — in the prompt, because "the
party that needs to know is the model, which is about to reason over the truncated
corpus", and a log line informs only the operator, who is not the one reasoning.
Two things this technique adds to that, both learned by shipping it:

**A scope statement about untrusted material is first-party, and must sit outside
the fence.** Where repository content is delivered inside an explicit boundary that
strips it of authority, the obvious place for the scope line is the label on the
evidence block — which is inside the fence. Put it there and the sentence the
reasoner most needs to obey arrives as quoted material it has just been told to
evaluate rather than follow. The statement about what a scan read is a claim by the
scan, not by the repository, and it belongs before the boundary opens. Only the
omitted *paths* are repo-authored, and they are sanitised like any other borrowed
string.

**The figure is always computed; the notice is emitted only when the view
narrowed.** These pull in opposite directions and both are required. A zero-omission
banner on every call changes a budgeted, cache-keyed artifact forever and carries no
information; a discount applied on every call moves the calibrated full-view path
and makes the number mean something new. So: compute the ratio unconditionally, let
it be exactly 1 when everything fit, and assert that a body that fits produces a
**byte-identical** artifact and an identical figure. The paired assertion —
*separate when the view narrows, agree when it does not* — is what stops the repair
becoming a tax, and a single assertion in either direction is passed by the wrong
change.

## A sample and a proxy are not the same restriction

A view can narrow along extent (a byte prefix), along membership (the files that
fit), or along **channel** — a different modality standing in for the one that was
wanted, as when a judgment about visual content is formed from a transcript because
the visual index is not on the automation surface. The first two are countable and
reducible: the ratio is meaningful, and a consumer told "14 of 31" can ask for the
rest. A channel substitution is neither. Its honest disclosure is not a ratio but a
**refusal class** — the kinds of claim this view cannot support at any volume —
because no quantity of the substitute approaches the absent channel, and "1 of 1
channels read" is a number that makes the gap invisible while appearing to price
it. Substituting a producer or a channel has its own discipline in
[substituted-result-attribution](../../../../llm-agent/runtime-and-io/agent-runtime-assembly/techniques/substituted-result-attribution.md);
what this technique owes it is the boundary: do not fold a proxy into a coverage
ratio.

## What this does not say

It does not say the narrowed slice is the risky slice. That inference is bounded
one subject over, where the no-oracle remainder was measured and found to be
repaired *less* often than the covered slice — the reason to publish a scope is
that a verdict must state its own, never that the remainder is where harm hides.
And it does not say a scope statement makes a judgment sound: a figure that
correctly prices a 45% view still licenses a judgment formed from 45% of the
evidence. The count carries its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)); it does
not improve it.

Nor is the mechanism visible from the outside. A pipeline whose coverage figure is
measured at the fetch reports identically to one measured at the view, which is why
the question has to be asked of the code rather than the output
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## The diagnostic

One question against any pipeline that reads a body and asks something to judge it:
**between the figure that prices the judgment and the judgment itself, is there a
step that drops evidence?** A presentation window, a prompt budget, a per-consumer
slice, a paging limit on a review surface. If there is, the figure is about the
population before that step, and every consumer weighting the judgment by it is
over-licensed by exactly the step's drop.

## Decision rules

- Compute the coverage figure at the narrowest view any judgment is formed from,
  not at the stage where the material was gathered.
- Keep the earlier restrictions as their own terms beside it; one blended number
  cannot be acted on, because each remedy is stage-specific.
- Report the view's ratio as shown against the view's own input, with the omitted
  members named — never as a difference the reader must compute.
- Count as shown only what survived the final cut, not what an admission loop
  accepted; a trimmed entry is not evidence the reasoner can read.
- State the scope to the party that reasons, in the artifact it reads, and place a
  first-party scope statement outside any boundary that voids the authority of the
  material it describes.
- Emit the notice only when the view narrowed, and pin the no-narrowing case as
  byte-identical and figure-identical, so the disclosure cannot become a tax.
- Build the view's coverage and the view itself from one routine; a second
  implementation of "what fits" agrees with the artifact until the day the rule
  changes.
- Disclose a channel substitution as a refusal class, never as a coverage ratio.
