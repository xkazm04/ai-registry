---
layer: application
type: application
subject: recruiter-anchored-model-evaluation
technique: decision-anchored-score-bands
stack: process
status: forged
verified_on: 2026-09-29
---

# Decision-anchored bands in the bench judge prompt

The bench matrix in `pipeline/jobfit/llm/bench/` scores each (use case × model)
cell twice: `runner.py` checks structural contracts deterministically, and
`judge.py` attaches semantic quality from an independent judge. The anchored
scale lives in `_JUDGE_SYSTEM` at `pipeline/jobfit/llm/bench/judge.py:75`, under the incident comment at `judge.py:68`.
Line numbers here were re-resolved on 2026-09-29 against kp `origin/main` at
`b2c19295b`; the rubric text itself is unchanged since the first reading.

## The incident, recorded in the file

The comment block above `_JUDGE_SYSTEM` (judge.py:68-74) documents the round the
rubric was rewritten in:

> The unanchored "1-10, be critical" judge compressed everything into the 5-8
> band — the whole seven-model matrix averaged ~7 with no cell above 8.6, which
> reads as "all models are mediocre" when it is actually the JUDGE refusing the
> tails.

Seven models, one use-case matrix, no cell in the top band. That is the shape
the technique's "suspect the rubric before the models" rule is derived from.

## The bands as written

`judge.py:75` defines every band by the recruiter's next action, not by an
adjective:

| Band | The decision |
| --- | --- |
| 9-10 | ship as-is — a senior recruiter would send/use this without edits |
| 7-8 | ship after a small edit — right substance, one or two specifics to tweak |
| 5-6 | usable as a draft — real rework: missing deliverable, generic filler, or an unsupported claim |
| 3-4 | misleading or badly incomplete — wrong emphasis, contradicts the input, skips a required part |
| 1-2 | unusable — off-task, incoherent, or fabricated |

Five bands, five distinct practitioner responses. The prompt states the anchors
"are decisions, not adjectives" in its own text, which is what keeps later edits
from drifting back toward quality words.

## Range enforcement

The closing paragraph of `_JUDGE_SYSTEM` carries all three range instructions
the technique calls for:

> Use the full range: a flawless output MUST score 9-10 — do not withhold the
> top band on principle — and a broken one MUST score 1-3. Across a matrix of
> models most outputs should NOT land on the same number.

The third clause is the one that names the compression pathology to the judge
directly.

## Judge independence and structural separation

`default_judge_provider` (judge.py:168) pins the judge to the Claude CLI, and the
module docstring gives the reason: "a different engine than the OpenRouter/API
targets, so a target's own family doesn't grade itself." That reason held for
the first grid and does **not** hold for the committed one. The baked scorecard
(`app/_lib/llm-quality-scores.ts`, measured 2026-08-12, n=4 per cell, `judge:
"fable-5"`) lists four targets, and its `targets` block routes two of them,
`claude-sonnet-5` and `claude-opus-5`, through provider `claude_cli` - the same
engine that runs the judge. Two of the four columns are graded by a model from
their own vendor, and only the other two (`gemini-3.6-flash`, `deepseek-v4-flash`)
are graded across families. The board prints the judge's name
(`ModelsQualityOverview.tsx:223`) and nothing flags the shared engine, and the shipped routing recommendation compares all four columns
on one composite. Run over the committed grid on 2026-09-29, that recommendation
names a `claude_cli` model for 8 of its 11 routing use cases (five `claude-opus-5`
and three `claude-sonnet-5`, the remaining three going to `gemini-3.6-flash` and
`deepseek-v4-flash`). Whether the Claude columns are lifted is not measured here; the
point is that the design's independence guarantee was not kept and is not
reported.

The structural verdict is computed
before judging and passed into the prompt as a line (`judge.py:116-120`,
`"Structural contract: PASSED"` or the violations JSON), so the judge reads the
contract result rather than re-deriving it in prose.

## Aggregation

`bake_quality._cell` (`pipeline/jobfit/llm/bench/bake_quality.py:64`) takes the
**median** of judged scores across a cell's scenarios and a **majority** vote on
structural validity, then writes `app/_lib/llm-quality-scores.ts` — generated,
never hand-edited. Medians rather than means is the noise decision the technique
asks for.

## Deviations

**Ten integers over five anchors.** The rubric defines five two-point bands, but
the judge returns integers 1-10 for the overall score and each dimension. The
technique's rule is one band per distinct action and no padding to ten; here the
band is anchored and the digit inside it is not, so a 9 and a 10 are the same
recruiter decision with no sentence separating them. The baked medians are then
reported at one decimal, and the routing code treats a 0.15 composite gap as
meaningful (`NOISE_BAND`, `app/_lib/llm-quality.ts:173`) - a distance well inside
the single "ship as-is" band. That is safe in the direction it is used (a tie
within the band goes to the cheaper model) but it means the resolution shown is
finer than the resolution defined. The judge also returns a free-text `verdict`
sentence rather than naming the band's action back (`judge.py:143-144`), so the
technique's "require the decision to be named back" check is not available to
re-run a row that scored on vibe.

**No practitioner-labelled agreement sample.** The rubric was validated by the
spread of a re-run; no set of outputs a recruiter has placed in a band exists to
measure the judge against. Spread shows the tails are reachable, not that the
judge puts artifacts where a recruiter would (see the technique's added rule,
2026-09-29).

**Planted probes.** The two planted-probe diagnostics the technique recommends — a known-bad and a
hand-written known-excellent artifact seeded into every run to prove both tails
are reachable — are not implemented. The 2026-08-11 re-anchoring was validated
by the spread of the re-run rather than by planted anchors, which detects
compression only after a full matrix has been paid for. The standard stands.
