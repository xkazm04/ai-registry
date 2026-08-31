---
layer: application
type: application
subject: judge-calibration-and-drift
technique: repeatability-floor
stack: node
verified_on: 2026-08-31
verified_against: node@24
applied: simulation
ab_verdict: better
proof: structural-only
---

# A 142-verdict judged corpus with no two verdicts on the same thing

## The seam

A desktop agent-orchestration app runs a conformance pipeline: LLM workers
read the project's code against a knowledge bundle's techniques and emit a
verdict per (context, subject, technique) — `conformant`, `deviation`,
`not-applicable`, `unknown` — with a file-and-line evidence string. The
results land in `.ai/conform-detail.json` and are merged from twelve
per-worker files under `.ai/conform-runs/merged/`.

This is a judge pipeline in every sense this subject means: a model scoring
another system's output, producing verdicts that are counted, ranked, and
used to decide where effort goes.

## The structural fact

Counted over the shipped `conform-detail.json`:

| | |
| --- | --- |
| judged pairs | 142 |
| workers | 12 (`p-1` … `p-12`, 8–16 pairs each) |
| verdicts | 113 `deviation`, 21 `not-applicable`, 7 `conformant`, 1 `unknown` |
| **(subject, technique) keys judged by more than one worker** | **0** |

Not one technique in the corpus was ever judged twice.

Nobody decided against measuring judge repeatability here. The pipeline
partitions work across twelve workers *for coverage* — each worker takes a
disjoint slice, which is the correct design for getting 142 pairs judged
once — and that partition makes a repeatability floor **structurally
unobtainable from the output**, permanently and after the fact. The design
that maximizes throughput is exactly the design that destroys the
measurement, and the two look identical from outside.

The base rate makes it bite. 113 of 142 verdicts are `deviation` — 79.6%. A
worker that answered `deviation` to everything would agree with the observed
distribution four times in five while carrying no information, which is the
inverted form of the class-imbalance failure this subject already names for
raw agreement rates. With no overlap anywhere in the corpus, there is no way
to tell that worker from a discriminating one.

## Three cases, walked under both policies

Policy **A** is the pipeline as it stands: partition for coverage, judge
once, count deviations. Policy **B** adds the technique's cheapest
instrument: overlap ~5% of pairs so a handful are judged by two workers.

**Case 1 — `fleet-orchestration`, 8 pairs, the top-ranked attention
subject.** Under A its eight deviation verdicts are a count, and the count
drives it to the front of the work queue. Under B, if the overlapping pairs
show two workers agreeing, the count is a measurement and the ranking is
earned. If they disagree on a third of pairs, the count is a draw and the
subject's position is unattributable. *Falsified if* the overlap shows
near-perfect agreement, in which case A was right all along and the 5% was
cheap insurance.

**Case 2 — the 7 `conformant` verdicts.** These are the rarest and most
consequential outputs in the corpus: they are the ones that close a
question. Under A, each rests on one draw from a judge whose self-agreement
is unmeasured, against a base rate that makes `conformant` the unusual
answer. Under B, a `conformant` verdict that survives a second worker is
worth what it claims; one that flips is a `deviation` that got lucky.
*Falsified if* re-judging reproduces all seven.

**Case 3 — the evidence strings.** A verdict here carries prose evidence
(`registry.rs:727 — state is mutated by ~12 sibling methods…`). Under A this
reads as a fact. Under B it is visible as one dimension of a rubric, and —
per the technique's per-dimension rule — the near-mechanical part (does
line 727 exist and do those methods write state) should repeat far better
than the judgment part (is that a deviation from the technique). Splitting
them is what tells the team which half of a verdict to trust. *Falsified if*
both halves repeat at the same rate.

## What the tree says about the standard

The technique claims the floor is the cheapest thing in the subject because
it needs no human labels — only repeated calls over a slice already owned.
This tree prices that claim precisely: the corrective is a change to how
work is assigned, not a new instrument, a new dataset, or an annotator.
Overlapping 5% of 142 pairs costs about seven extra pair-judgements out of
142, and it is the only way this corpus can ever produce a floor, because
the fact cannot be recovered from output that was never duplicated.

The negative form is the stronger evidence. A pipeline that had been
designed to prove anything about judge reliability would have overlapped
something. This one was designed to cover ground, it succeeded, and the
resulting corpus can support a ranking it cannot support the reading of.

## What this realization cannot do

The mode is simulation and the ceiling is honest: re-running twelve LLM
workers over a duplicated slice was outside this run's budget, so the floor
for this pipeline is still unmeasured. What is measured is the structural
fact — 0 overlapping pairs out of 142 — computed from the shipped file, and
that fact is what makes the floor unobtainable rather than merely unknown.

The three cases predict what an overlap would show; none of them is evidence
that the workers *do* disagree. If the pipeline's verdicts turn out to be
highly repeatable, the technique still holds and the finding becomes a cheap
green light rather than a correction — which is the point of measuring
rather than assuming, and is why the return condition names an instrument
instead of a suspicion.

## The proposed change

Not committed — the project tree was read, not edited. Assign ~5% of pairs
in the next conform run to two workers, and report inter-worker agreement
beside the deviation counts, split by verdict half (evidence-locating vs.
judgment). Until that number exists, deviation counts are leads and not
measurements, which is what this bundle already says an uncalibrated judge
produces.
