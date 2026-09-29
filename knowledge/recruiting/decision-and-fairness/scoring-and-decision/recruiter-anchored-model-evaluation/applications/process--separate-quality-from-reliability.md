---
layer: application
type: application
subject: recruiter-anchored-model-evaluation
technique: separate-quality-from-reliability
stack: process
status: forged
verified_on: 2026-09-29
---

# Two axes carried all the way to the model pick

The bench harness in `pipeline/jobfit/llm/bench/` measures a (use case x model)
cell on separate axes, and the product then reads the baked cells to recommend a
model per use case. This reading follows the axes from the bake to the
recommendation. Lines resolved on 2026-09-29 against kp `origin/main` at
`b2c19295b`.

## The axes stay separate in the baked cell

Each baked cell (`bake_quality.py:64`) carries quality as `score` plus the three
dimension medians over the judged LLM rows, the surviving count as `judges`,
and reliability as `llmRate`: LLM rows over ALL attempts, errors and fallbacks in
the denominator (bake_quality.py:105). Structural validity is a majority vote
over the LLM rows only (bake_quality.py:87, 102). The fallback exclusion behind
that split is recorded under
[never-judge-a-fallback-as-the-models-work](./process--never-judge-a-fallback-as-the-models-work.md).

## Reliability is a gate, quality is compared inside it

`recommendForUseCase` (`app/_lib/llm-quality.ts:422`) never blends the axes. It
first drops every model whose worst-op `llmRate` is below `RELIABILITY_FLOOR`
(0.9, llm-quality.ts:177; the filter at :436), and only then ranks the survivors
by quality. If nobody clears the floor the result says so
(`no_reliable_candidate`) and still names the top scorer, with the reason
attached, instead of quietly promoting it. That is the technique's rule that
quality cannot buy back an artifact that never arrived, written as control flow.

Quality is then compared with a stated noise allowance rather than as a
leaderboard: a model within `NOISE_BAND` of the best composite counts as tied,
and the tie goes to the cheapest priced model. The band is 0.15 composite points
when both sides rest on at least four judged scenarios in every op and 0.3
otherwise (llm-quality.ts:173). Its comment says it was "fixed BEFORE the
recommendation was built" and is pinned by a test, "do not tune it to a result".
The pick carries the `judges` and `llmRate` behind it (`UseCaseAggregate`), so
the sample size travels with the recommendation. This is the technique's
"quality gate sits below full marks because judged scores carry noise" in
executable form.

## Deviations

**A composite where the technique says never average.** `qualityComposite`
weights the three dimensions 0.4 correctness, 0.35 adherence, 0.25 relevance
(`QUALITY_WEIGHTS`, llm-quality.ts:161) so that a pick can be made at all. The
weights were chosen by decision cost ("a fluent but invented answer is worse than
an honest gap") and the per-dimension medians remain in every baked cell, so the
diagnosis the technique protects is recoverable from the data - but the
Models board does not display them (its component never reads the dimensions),
so a reader of the board sees only the composite. The observation
for the technique: a routing decision needs one ordering, and the defensible
version is a weighted composite whose weights are fixed before the result and
stated beside it, with the dimensions still reported. What it must not be is the
headline that replaces them.

**The floor is looser than the technique's bar, and at this sample size it does
not behave as written.** The technique sets the reliability bar by what happens to
the affected person, and treats a five-percent failure rate as material on a
candidate-facing path. A 0.9 floor tolerates ten percent. The committed grid has
`limit: 4` scenarios per cell, so `llmRate` can only take the values 0, 0.25,
0.5, 0.75 and 1.0, and a floor of 0.9 admits exactly one of them: at n=4 the
gate is all-or-nothing, and it would first admit a single failed attempt only at ten or
more scenarios per cell. The stated bar and the working bar differ by the sample size,
and nothing in the board says which one applies.

Measured on 2026-09-29 by running the shipped `recommendForUseCase` over the
committed grid (type-stripped under Node 24 with a stub `median`; the only edit was
the floor constant): of 60 baked cells, 56 have `llmRate` 1.0 and 4 have 0.75, each
one failed attempt in four, spread over three of the four models. With the floor at
0.9 the picks for 11 routing use cases differ from those at a floor of 0.75 in one:
`automation`, where 0.9 leaves `claude-opus-5` as the only candidate and 0.75 picks
`claude-sonnet-5` as cheapest in band. So the floor is not idle, one failed attempt
in four decides one pick in eleven, and nothing in the data says whether that
attempt was a truncation, an outage or the model.

**The noise band is declared, not measured.** No judge-repeat variance sits behind
0.15 and 0.3; the source says only that it is "the ruler's swing at the bake's
sample size", fixed in advance. A challenge-round report in the repo records the
band being applied ("inside the 0.15 noise band"), not derived. The discipline of
fixing it before the result is sound; the value is an assumption until a repeat
run measures the judge's own spread.

**Quality over a sample too small to rank is reported, not withheld.** The
technique says to report quality as inconclusive when reliability leaves too few
survivors. The bake keeps any cell with at least one judged row and records `judges`
beside it; the routing code widens the noise band instead of withholding the
number. Both
are visible, but no cell is ever labelled inconclusive.

## Second reading (2026-09-29)

**The floor at n=4 is not separable from a perfect cell.** The simulation above holds; the
interval view adds why. At four attempts a cell reading 4 of 4 has a Wilson 95% interval of
0.51-1.00 and 3 of 4 has 0.30-0.95, so the two overlap almost entirely; pooled over the five
`automation` operations (20 attempts) gemini, deepseek and sonnet each served 19 of 20 (interval 0.76-0.99) against opus
20 of 20. The four non-served rows of the committed bake were all
deterministic fallbacks, none errored, so the floor was tripped by fallbacks alone. One row per
rival model fixed the routing of `automation`.

**The composite multiplies validity in.** `qualityComposite` (`app/_lib/llm-quality.ts:187`)
takes the weighted dimension mean and multiplies it by `INVALID_FACTOR = 0.7` (line 182) when
the cell's majority validity is false, on the reasoning that an invalid output is coerced to the
fallback in production. That blends a reliability fact into the quality number while the same
cell's `llmRate` also feeds the floor, so it would count one failure twice. No served row in the
committed bake was structurally invalid, so the factor never fired.

**The band is tighter than the noise the same document states.** The matrix document gives n=4
cells "about ±0.3-0.5 noise" and calls differences within 0.3 ties, while `NOISE_BAND.narrow`
is 0.15 at four judged scenarios. Multi-operation use cases average over operations, which
shrinks the noise; `match_reasoning` and the other single-operation use cases do not, and
`match_reasoning`'s pick of gemini over opus (a 0.1 gap, 68 times cheaper) rests on the narrow
band. A published measurement puts the single-judge noise floor at 0.41-1.24 points on a 0-5
scale ([arXiv 2609.27787](https://arxiv.org/abs/2609.27787), abstract); not measured on this
tree's judge.

**A fallback is a degraded delivery.** The floor counts a fallback as a reliability miss, yet
the pipeline ships a labelled deterministic answer in that case and the candidate's process did
not stall. The technique now separates the two bars.
