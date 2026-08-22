---
layer: technique
type: technique
subject: hash-pinned-translation-pipeline
technique: translation-fan-out-sizing
status: forged
stage: team
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [budgeting a re-translation run before starting it, an open-ended translation job that cannot be scheduled or resumed, deciding which locales a finite review capacity should cover]
---

# Translation fan-out sizing

Before a re-translation run begins, a **read-only audit** states exactly how
much work exists: per locale, per verdict, in units the work is actually billed
in. The audit is separately invokable, changes nothing, and its output is the
run's plan, its budget and — because verdicts are recomputed rather than
stored — its resume ledger.

The alternative is the open-ended run: start the pipeline, watch it work, find
out how big the job was by how long it took. That is affordable exactly once,
on a small corpus, with nobody waiting. Past that it fails in three specific
ways at once — it cannot be scheduled (nobody knows when it ends), it cannot be
sized against a rate limit or a spend cap, and it cannot be reviewed, because
review capacity is a human commitment that must be booked in advance of the
prose arriving.

## The audit is not a flag on the run

State this as a rule because the shortcut is so tempting: **an audit you can
only obtain by starting the work is not an audit.** A dry-run flag on the
translation command is close and not close enough — it shares the run's code
path, its startup cost, its credentials and often its side effects, and it is
the first thing to rot because nobody exercises it. The audit is its own
entry point, cheap enough to run casually, safe enough to run on a branch, and
usable by somebody who has no ability to start a translation run at all. That
last property is what gets it run: the person who wants the number is
frequently not the person who owns the pipeline.

## One total is the least useful shape of the number

"Four hundred units need work" is nearly content-free. The same four hundred
across fourteen locales has two completely different shapes with two different
plans:

- **Concentrated** — three hundred and eighty in one locale, two each in the
  rest. This is one focused pass with one reviewer, and the other thirteen
  locales are a rounding error that can ride along.
- **Even** — twenty-eight in each. This is a broad sweep, fourteen reviewers or
  fourteen scheduling conversations, and a completely different calendar.

So the audit reports **per locale, and per verdict within locale**, and the
totals are a footer rather than the headline. Locale is the axis work is
assigned along, so it is the axis the audit is organized along — the same
ordering rule the drift report follows, for the same reason.

## Size in the unit the work is billed in

A count of units does not predict cost or time within an order of magnitude,
because a unit is forty words or four thousand. The audit therefore carries
**both**: the count, which predicts scheduling and review overhead — every unit
costs a handoff, a check and a merge regardless of size — and the **source
volume** (characters, words, or tokens of the content that will actually be
handed over), which predicts machine cost, latency and the reviewer's reading
hours. A budget built on counts alone is wrong by whatever the size
distribution happens to be, and content corpora have famously long tails.

Where the pipeline pays per call rather than per volume, the audit should also
carry the **batch shape** it implies — how many units per request, how many
requests per locale — because that is the number that meets a rate limit.

## Every number states its predicate

[A count carries its predicate](../../../_laws.md#count-carries-predicate), and
an audit exists to produce numbers that travel: into a planning document, a
budget request, a status update, a decision to defer a locale. Each figure
names its population, its scope and its instrument — *"twelve units stale in
this locale, under the title-plus-body digest scope, measured against the
current source tree at this revision"* — because six weeks later somebody will
quote it, and the difference between "we translated 300 units" and "300 units
were stale under the old scope" is the difference between a report and a
misunderstanding.

## Zero is a result, and so is having read nothing

An audit that finds no work must be distinguishable from an audit that found no
corpus
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)). The
failure mode is mundane and common: a path moved, a locale directory was
renamed, a glob stopped matching, and the audit prints a clean zero. The team
concludes the corpus is current and schedules nothing. Assert the instrument
first — source units found and non-empty, every expected locale present, every
provenance artifact parsed — and report the assertion alongside the result, so
that "zero stale across fourteen locales, 1,240 units examined" is the shape of
a clean report and "zero" on its own never is.

## The audit is the resume ledger

Because drift verdicts are **recomputed from state on every run** rather than
tracked in a queue, an interrupted fan-out needs no reconciliation. The run
processed some units, wrote their translations and their pins, and stopped. Re-
running the audit produces a correctly smaller work list, derived from the tree
as it now stands. There is no partial-job record to repair, no lock to clear,
no risk of double-translating a unit that succeeded, and no risk of skipping one
whose bookkeeping was lost.

That property is worth protecting explicitly, because the obvious optimization
destroys it: a run that caches its work list at the start and follows the cache
to the end will happily re-translate units a concurrent commit already fixed
and will miss units that arrived mid-run. **Re-derive; do not remember.** For a
long run, the practical form is to re-audit between batches — cheap, since the
audit is a hash comparison over a tree already in cache.

## The audit is where prioritization is applied

Finite review capacity and fourteen locales means somebody chooses an order.
The audit is the artifact that choice is applied to, because it is the only
place the whole shape is visible at once: audience size per locale, the
concentration of stale units, which locales are contractually committed and
which are best-effort. Prioritization belongs here rather than inside the
detector — the detector states facts about drift, and it has no business
knowing which languages matter more than others.

## When the audit costs more than the run

Below a few hundred units and a handful of locales, a full re-translation is
minutes and the audit is ceremony. Skip it, and re-run the whole corpus. The
audit starts paying at the point where somebody would have to *ask* how long a
run takes — which is a much lower threshold than it sounds, and arrives the
first time a run happens during business hours.
