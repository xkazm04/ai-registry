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
