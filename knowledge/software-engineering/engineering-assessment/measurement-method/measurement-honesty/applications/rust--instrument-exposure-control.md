---
layer: application
type: application
subject: measurement-honesty
technique: instrument-exposure-control
stack: rust
status: forged
verified_on: 2026-08-31
verified_against: rust@1.96
applied: experiment
ab_verdict: better
proof: structural-only
---

# An eval service that models every kind of comparability except the one that expires

A self-hosted Rust workspace runs LLM-as-judge scoring and benchmark runs: it
stores datasets of cases, replays them against target models, scores the
outputs with a judge model, and publishes the results to a leaderboard. It is
in the business of saying that two numbers are comparable, which makes it the
sharpest possible test of state 7.

## What the tree already does well, because that is what makes the gap legible

This codebase reasons about reproducibility more carefully than most. It
carries a `Determinism` stamp on every outcome with three values — exact,
best-effort, sampled — and folds a set of runs to its **weakest** member, on
the stated ground that "a set of runs is only as reproducible as its least
reproducible run", with an unrecorded run absorbing to `None` because it
"cannot vouch for the rest". It distinguishes reproducible *by contract* (a
seed the provider honours) from reproducible *by convention* (temperature
pinned, no seed exposed). It refuses to fold an exactly-reproducible dimension
into an agreement statistic, because doing so "would drag every rubric's
agreement toward 1.0 and hide the judge's disagreement".

That is a real lattice, conservatively folded, honestly stamped. Every axis in
it describes **the harness's own stochasticity**.

## The census

Two numbers, because the first one is not the measurement.

A grep for comparability and reproducibility vocabulary across `crates/` and
`docs/` returns **88 matches in 44 files**. Hand-classifying them, **8** are
claims that two *runs* are comparable; the other **80** are within-run
determinism. Of those 8, the number that condition on whether the models under
test have been exposed to the cases is **0**.

A second probe closes it. The tree contains no occurrence of contamination,
memorization, training data, or model knowledge cutoff, in either `crates/` or
`docs/`. Every `cutoff` in the codebase is a data-*retention* cutoff; every
`leak` is about PII or dev-mode credentials. The variable this technique is
about is not modelled anywhere.

## The claim the tree makes, and the half of it that is true

Three sites asserted that freezing a dataset makes runs comparable — the type's
own doc comment in `crates/core/src/dataset.rs`, the module header in
`crates/api/src/datasets.rs`, and the tool description a model reads in
`crates/mcp/src/write.rs`. The immutability is real and the guarantee is half
of one: freezing fixes the **input**. It cannot fix the subject, and the
subject is a model whose exposure to public material grows monotonically
between any two runs.

So the system's strongest comparability promise — recorded in its own harness
notes as "re-run it, get what you published" — is exactly the promise that
[instrument-exposure-control](../techniques/instrument-exposure-control.md)
says a frozen public dataset cannot keep.

## The structural fact nobody designed

The tree already records the variable that decides this, and records it for a
different reason. `Dataset` carries `source: Option<String>` documented as
`events:recent | manual | import`, and `DatasetItem` carries
`source_event_id` naming the real event a case was sampled from, beside an
`anonymization` audit field.

That distinction was built for privacy — sample production traffic, anonymize
it, freeze it. It happens to be the exact partition state 7 needs. A dataset
sampled from this installation's own traffic **cannot** have been in any
model's training material; an imported one carries no such guarantee. The
project's privacy design is also its contamination defence, and nothing in the
tree says so. This is the shape worth reporting: the correct behaviour was
already there, for an unrelated reason, undocumented as a validity property.

## A and B

- **A** — a dataset is frozen, therefore two runs of it are comparable, and a
  rise between them is an improvement in the target.
- **B** — a dataset is frozen *and* the subject's exposure to it was constant,
  therefore the runs are comparable.

The arms diverge on exactly one population: a frozen dataset whose `source` is
`import`, replayed months apart against successive model generations. Under A
that comparison is sound and its trend is a capability trend. Under B it is
uninterpretable without a twin, because the later generation has had longer to
absorb whatever public material the import came from.

The measured difference between the arms is the census above: **0 of 8**
cross-run comparability claims survive B as written.

## What shipped

A docs-only correction at the three sites, naming what freezing does and does
not guarantee and pointing at the `events:recent` versus `import` distinction
the tree already carries. No type changed, no behaviour changed, and the
workspace compiles on both sides of every crate boundary the change crosses —
which is what made it shippable in one commit rather than a schema migration.

## What this realization cannot do

It cannot detect the condition, only refuse to overclaim about it. Detecting
it needs the technique's paired-population probe: a twin drawn from the same
sources at a later date, scored on the same harness. This service could run
that — it has datasets, targets and a runner — and does not, because nothing
in the data model expresses "these two datasets are twins differing only in
exposure".

The honest boundary is therefore narrower than the technique: this stack now
*states* the limit where it previously asserted a guarantee, which is a
disclosure improvement and not a detection capability. The instrument that
would upgrade it is a twin-dataset relation plus a run comparison that reads
the gap rather than the levels; naming it is the return condition for the next
pass.
