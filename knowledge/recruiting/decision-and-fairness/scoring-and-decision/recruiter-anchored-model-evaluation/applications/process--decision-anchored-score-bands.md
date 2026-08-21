---
layer: application
type: application
subject: recruiter-anchored-model-evaluation
technique: decision-anchored-score-bands
stack: process
status: forged
verified_on: 2026-08-20
---

# Decision-anchored bands in the bench judge prompt

The bench matrix in `pipeline/jobfit/llm/bench/` scores each (use case × model)
cell twice: `runner.py` checks structural contracts deterministically, and
`judge.py` attaches semantic quality from an independent judge. The anchored
scale lives in `_JUDGE_SYSTEM` at `pipeline/jobfit/llm/bench/judge.py:76`, under the incident comment at `judge.py:69`.

## The incident, recorded in the file

The comment block above `_JUDGE_SYSTEM` (judge.py:69-75) documents the round the
rubric was rewritten in:

> The unanchored "1-10, be critical" judge compressed everything into the 5-8
> band — the whole seven-model matrix averaged ~7 with no cell above 8.6, which
> reads as "all models are mediocre" when it is actually the JUDGE refusing the
> tails.

Seven models, one use-case matrix, no cell in the top band. That is the shape
the technique's "suspect the rubric before the models" rule is derived from.

## The bands as written

`judge.py:76` defines every band by the recruiter's next action, not by an
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

`default_judge_provider` (judge.py:169) pins the judge to the Claude CLI while
the bench targets run through the OpenRouter/API adapters — the module docstring
states the reason: "a different engine than the OpenRouter/API targets, so a
target's own family doesn't grade itself." The structural verdict is computed
before judging and passed into the prompt as a line (`judge.py:117-120`,
`"Structural contract: PASSED"` or the violations JSON), so the judge reads the
contract result rather than re-deriving it in prose.

## Aggregation

`bake_quality._cell` (`pipeline/jobfit/llm/bench/bake_quality.py:55`) takes the
**median** of judged scores across a cell's scenarios and a **majority** vote on
structural validity, then writes `app/_lib/llm-quality-scores.ts` — generated,
never hand-edited. Medians rather than means is the noise decision the technique
asks for.

## Deviation

The two planted-probe diagnostics the technique recommends — a known-bad and a
hand-written known-excellent artifact seeded into every run to prove both tails
are reachable — are not implemented. The 2026-08-11 re-anchoring was validated
by the spread of the re-run rather than by planted anchors, which detects
compression only after a full matrix has been paid for. The standard stands.
