---
layer: golden-path
type: golden-path
subject: state-budget-analysis
status: forged
use_when:
  - publishing a municipality's budget figures for a lay audience
  - building any "is this town's spending normal?" comparison surface
  - choosing which official figure is "the budget" among several candidates
  - connecting a public body's budget to the firms it contracts with
techniques:
  - peer-group-construction
  - per-capita-normalisation
  - median-over-mean-for-peers
  - small-sample-widening
  - consolidated-vs-headline-figures
  - municipal-money-trail
---

# State-budget analysis

A public budget is a large absolute number, and large absolute numbers are
illegible. "This town owes forty million" tells a reader nothing: is that a lot?
For a capital city it is rounding error; for a village of three hundred it is a
generation of debt. The subject of budget analysis is not arithmetic on the
figures — the treasury already did that — it is the manufacture of *legibility*:
turning an absolute figure into a claim a reader can judge, without the analyst's
judgment leaking into the number. The entire discipline reduces to one move
performed carefully: **compare, never assert**. A town's debt is meaningful only
against the debt of towns like it; the craft is in what "like it", "debt", and
"against" each mean, because every one of those words hides a decision that can
silently editorialize.

## Comparison is a manufactured object, and its recipe must be published

The naive comparison — rank all municipalities by spending — is an editorial act
disguised as data: it compares a metropolis to a village and always crowns the
same winners. A defensible comparison is built from three deliberate parts, each
its own technique. First the *population*: a peer group of structurally similar
municipalities, derived from a published, deterministic rule rather than picked
by hand — hand-picked peers are how a consultant makes any town look
thrifty or profligate on demand ([peer-group-construction](techniques/peer-group-construction.md)).
Second the *unit*: figures normalized per resident, because per-capita is the
only unit in which a small town and a large one occupy the same axis
([per-capita-normalisation](techniques/per-capita-normalisation.md)). Third the
*statistic*: the peer group's median, not its mean, because municipal finance
distributions carry extreme outliers — one town with a stadium loan drags a
mean anywhere — and because a median of nothing must be *nothing*, never zero
([median-over-mean-for-peers](techniques/median-over-mean-for-peers.md)).

The recipe itself is part of the product. A reader shown "your town vs. peer
median" is entitled to know exactly how peers were chosen, and the strongest
form of that disclosure is to print the rule verbatim on the surface that uses
it — the same sentences, from the same single definition the code executes. A
comparison whose method is published can be disagreed with; a comparison whose
method is implicit can only be distrusted.

## The honest failure modes of comparison

Every comparison machine has three characteristic ways to lie, and the
discipline is to make each one structurally impossible rather than editorially
avoided.

**Small groups masquerade as populations.** A peer group of two is not a
benchmark; a median over it is an anecdote wearing a statistic's clothes. The
remedy is a published minimum group size with a published widening rule — when
the local group is too small, widen along a declared axis (same size class,
larger geography) rather than quietly comparing against whoever is available.
And because even the widened group can be small — the largest size class in any
country holds a handful of cities — the peer *count* travels with every median,
always rendered, never assumed
([small-sample-widening](techniques/small-sample-widening.md)).

**Missing peers deflate the benchmark.** A municipality with no reported figures
cannot be a peer for the metric it did not report. Including it as zero drags
every median toward zero and makes every covered town look extravagant; this is
the domain's oldest law — missing is not zero — expressed in comparison form.
Membership in the group and contribution to a given median are two different
tests: a town may be a peer for debt and absent for capital spending, and each
median reports the sample it was actually computed from.

**The wrong figure gets compared.** Public accounting publishes several numbers
that all answer to the name "the budget", and they differ by integer factors,
not percent. Gross figures double-count internal transfers between a body's own
funds and organizations; consolidated figures eliminate them. In one measured
case the headline expenditure figure was 2.3× the consolidated one — for the
same town, same year, same official source. Comparing one town's gross figure
to another's consolidated figure is not an approximation, it is a fabrication,
and the choice of which variant is "the" figure must be made once, globally,
and documented ([consolidated-vs-headline-figures](techniques/consolidated-vs-headline-figures.md)).

## From "how much" to "to whom"

Legibility does not stop at magnitude. The second question a reader asks —
*where does the money go?* — is answered by joining the budget to the public
contract record, and that join is the most defamation-adjacent step in the
subject, because its output is sentences of the form "this town paid this
firm". The join must therefore be governed by published clauses, each closing a
specific inference the naive join would happily make: money is attributed to a
municipality only when the municipality itself, under its own registered
identifier, is a party to the record — never inferred upward from a subsidiary
or a founded organization; a documented *payment direction* is asserted only
when the record itself proves it, and everything else is "direction not
stated"; the amount shown is the contract's registered value, never passed off
as money that actually moved; and a partial record is presented as a partial
record, not as the town's complete contracting history
([municipal-money-trail](techniques/municipal-money-trail.md)).

Where the trail further touches *people* — a firm in the town's record that
also has recorded ties to a politician — the frozen aggregates and the live
human-review state must not be conflated. Contract sums can be a generated
batch; the verdict "this tie is verified / pending / rejected" changes with
every review decision and must be read live, so a rejected tie disappears with
the next render, not the next re-ingest. And when the live layer is
unreachable, the surface says "ties cannot be verified right now" — it never
renders the indistinguishable and false "no ties".

## What a principal practitioner holds true

- An absolute budget figure is not information; a figure against a published
  peer benchmark is. The benchmark's recipe — grouping rule, unit, statistic,
  minimum sample, widening rule — is published on the surface, verbatim from
  the one definition the code runs.
- Peer similarity is structural: size class and comparable mandate first,
  geography second. Geography alone manufactures flattering comparisons.
- Per-capita is the comparison unit; the population divisor comes from the same
  reporting period as the numerator, from the same source, and a missing
  divisor makes the metric missing, not zero.
- The peer statistic is the median; an empty sample yields null; every median
  ships its sample size; a peer without a value for a metric is absent from
  that metric's median.
- Consolidated figures are the town's real budget. The choice of variant is a
  single global decision, and mixing variants across towns or years is a
  fabrication, not an error bar.
- Money-trail claims attribute to the exact registered identifier, assert
  direction only when the record proves it, label amounts as contract values,
  and disclose the record's coverage and retrieval date.
- Data defects — an impossible signature year, a broken row — are suppressed
  and disclosed, never repaired and never allowed to take down the surface;
  structural corruption of the analyst's own artifacts, by contrast, fails
  loudly, because a generated file is either exactly right or broken.
- Review state is live; aggregates may be frozen. An unreachable review store
  reads as "cannot verify", never as "nothing found".

Each rule exists because its violation was measured somewhere: a benchmark
deflated by zero-filled absentees, a headline figure 2.3× the real one, a
contract history extending seventeen years into the future. The rules are the
incidents, generalized.
