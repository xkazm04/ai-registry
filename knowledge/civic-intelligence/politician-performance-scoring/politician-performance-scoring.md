---
layer: golden-path
type: golden-path
subject: politician-performance-scoring
status: forged
use_when: [building an effort or contribution index over elected officials, publishing a ranking derived from public registry data, correcting a published score methodology, adding reader-adjustable weights to an official metric]
techniques:
  - weighted-component-index
  - saturation-caps
  - formula-lineage-stamping
  - structural-low-score-corrections
  - participatory-reweighting
  - comparison-fairness
---

# Politician performance scoring

Scoring elected officials means publishing a number that claims to measure how much
real work a person does with a public mandate — and then defending that number
against every party press office, every rival campaign, and every methodologist who
reads it. The subject is not "compute an index"; it is **publishing a defensible
claim about named individuals**, from whole-population registry data, with the
method itself as much a part of the product as the ranking it produces.

A principal practitioner starts from what the field has already learned the hard
way. Parliamentary monitoring organizations have produced activity scorecards for
two decades, and the standing critique is consistent: raw activity counts measure
visibility, not effectiveness; they reward the gameable (mass-filed trivial
questions, one-minute floor appearances) and miss the invisible (negotiation,
committee drafting, constituency work); and they systematically punish members
whose *role* removes them from countable activity — a cabinet member, a chamber
officer, a committee chair whose work happens off the floor. Legislators reject
these scorecards not because they fear measurement but because a count of hours
in the chamber is genuinely not a measure of contribution. A scoring product that
ignores this critique republishes it as its own bug list.

The honest response is not to abandon measurement. It is to **narrow the claim**:
the index measures *floor activity* — observable, registry-attested effort above
the minimum of holding a seat — and says so. It is a screen that separates the
demonstrably engaged from the demonstrably absent, and a lead-generator for human
review, never a verdict on quality or effectiveness. Every design decision below
follows from keeping that narrowed claim true.

## What a principal practitioner holds true

**Counts come from deterministic code, never from a model.** A language model may
summarize a score, flag it hollow, or draft the prose around it — it never authors
a figure. Every component of the index is a reviewable function from registry rows
to a number, covered by fixture tests. This is not a style preference: the moment
one number in the ranking cannot be re-derived by an outsider, the whole product's
claim to checkability collapses.

**The population is everyone or no one.** A scorecard over a shortlist is an
editorial act wearing a methodology costume. The index covers the whole chamber,
computes identically across all parties, and surfaces good news (the quiet
workhorse whose output is committee drafting rather than floor speeches) with the
same prominence as bad. Symmetry is what distinguishes an accountability
instrument from an attack tool.

**Rows are filing conventions; identities are the facts.** Registries encode one
underlying fact in whatever row shape their clerks adopted — a leadership post
filed as two membership rows, a body listed under two organ records. A scorer that
counts rows lets a filing convention move a rank. Every count is defined over a
deduplicated identity (distinct bodies, distinct instruments, distinct sitting
days), and a row whose identity cannot be established is counted alone rather
than merged on a guess.

**Missing is not zero.** An official whose speech data was never ingested did not
give zero speeches; the metric is *absent*, and absence must survive all the way
to the rendered surface as "not measured", excluded from medians and comparisons.
Backfilling absence with zero fabricates the most damaging possible claim — total
silence — about exactly the people the pipeline failed.

**The formula is part of the published output.** Weights, caps, rounding
precision, tie-break order, and the rejection accounting of every floor all render
on the methodology surface, sourced from the same definitions the scorer computes
with — never restated as literals that will drift. A reader must be able to
disagree with the method rather than the data.

**A changed formula is a versioning event, not an edit.** The stored scores and
the code that claims to have produced them can diverge silently — the code ships,
the recompute lags, and every surface serves a ranking the current formula would
not produce. The fix is lineage: every write stamps the formula's identity, every
read compares, and a mismatch renders as "stale", loudly, until a recompute
closes it. Stale-and-labeled is honest; wrong-in-silence is the product lying
about its own method.

**Corrections are published, not absorbed.** When a scoring defect is found — a
double-counted body, a mislabeled component — the correction ships with its
measurement: what changed, how many people moved, by how much. An index that
silently rewrites its own history teaches readers that today's ranking is equally
provisional.

## The shape of the index

The composite is a **weighted sum of independent components**, each normalized to
its own honest denominator, with count-based components **saturated** at a named
cap so that industrial-scale filing of one activity type cannot buy the whole
index (`weighted-component-index`, `saturation-caps`). The weights are few, round,
and published; sub-scores are exposed beside the composite so any reader can audit
which component carried a rank.

Around that core sit the disciplines that make the number defensible.
`formula-lineage-stamping` binds stored scores to the exact formula that produced
them, guards writes against silently overwriting a newer correction, and turns
formula drift from an invisible failure into a labeled state.
`structural-low-score-corrections` annotates the bottom of the ranking — where
structural artifacts (executive office, late seating, a relinquished mandate)
masquerade as disengagement — with a closed vocabulary of honest reasons that
never touch the score itself. `comparison-fairness` governs every surface that
puts two people side by side: ties are ties, printed precision is the comparison
precision, missing loses nothing, and unverified data classes are excluded by
name. `participatory-reweighting` lets readers contest the weighting itself —
recomputing under their own parameters as a clearly-labeled second artifact that
never blends with the official number, with an anonymity floor on any aggregate
of reader preferences.

## Failure modes of the naive reading

*"Add up the activity counts and rank."* Unnormalized counts make the index a
proxy for tenure and role, not effort; ungated sums make it gameable by whichever
activity is cheapest to file. Both are documented, predictable, and fatal to
credibility.

*"Low score means lazy."* The bottom decile of any floor-activity index is
dominated by structure: ministers, late replacements, dual mandates, people who
never took the oath. Publishing the raw tail without correction labels defames a
predictable set of named individuals — and the product, not the registry, owns
that defamation.

*"The formula is in the code, that's transparent enough."* Transparency that
requires reading source is not transparency; and code-level truth says nothing
about whether the *stored* scores were produced by the code currently deployed.
Disclosure without lineage is a methodology page that can lie.

*"More precision is more rigor."* Precision beyond what the inputs carry
manufactures distinctions between people that the data does not support. Publish
to a stated precision, compare at that precision, and let genuine ties be ties.

*"Let users build their own index" as a free feature.* Reader reweighting without
a hard boundary produces hybrid surfaces — official ranks beside custom scores —
that assert a methodology nobody published. The lens is legitimate only as a
fully-separated recomputation.

The subject's one-sentence summary: **a performance index is a published argument
— every number in it must be re-derivable, every absence labeled, every
correction measured, and every comparison honest at the precision the reader can
see.**
