---
layer: application
type: application
subject: recruiter-anchored-model-evaluation
technique: never-judge-a-fallback-as-the-models-work
stack: process
status: forged
---

# Fallback exclusion in the bench harness

Every bench record carries a `source` field stamped where the output was
produced — `"llm"` for a real generation, otherwise the deterministic fallback
path. The whole exclusion rests on that mark existing at emission time; nothing
in the harness infers provenance from the text.

## The incident

`judge_records` (`pipeline/jobfit/llm/bench/judge.py:175`) records it in its
docstring:

> a record that degraded to the deterministic fallback is the SAME template for
> every model, so judging it measures the fallback, not the model — and it drags
> the model's quality cell down for what is actually a reliability failure
> (already reported as `llmRate`). The 2026-08-05 expanded run hit exactly this:
> `interview_scorecard` fallback stubs were scored ~2 and contaminated three
> models' quality cells.

Three models, one use case, one template scored near the floor. The filter that
followed is one line (judge.py:193):

```python
judgeable = [r for r in records if r.error is None and r.payload is not None and r.source == "llm"]
```

Errored rows, empty payloads and deterministically served rows are left
unscored — not scored low.

## The exclusion propagates to every per-model statistic

`_cell` in `pipeline/jobfit/llm/bench/bake_quality.py:55` re-applies the same
partition when it aggregates, and its docstring names the second reason:

> latency uses LLM rows only so the near-instant fallback can't fake a fast p50.

The resulting cell separates the axes explicitly: `score` and the three
dimension medians run over judged LLM rows; `judges` carries the surviving
count; `llmRate` is "reliability over ALL attempts (errors + fallbacks in the
denominator)"; `p50Ms` is the median over LLM rows only. When no LLM row
survives, `_cell` returns `None` and the model simply has no cell for that op —
not a zero.

## Malformed dimension versus missing provenance

The two are handled differently, which is the distinction the technique draws.
`_coerce_dim` (judge.py:150) rescues a numeric string like `"8"`; a genuinely
unparseable dimension (`"8/10"`, `"high"`) becomes `None` and is dropped from
the median by `_med_dim` (bake_quality.py:46). But the cell is kept: the comment
at bake_quality.py:70-74 explains that a missing per-dimension median is imputed
from the overall median rather than voiding the column, "which used to make a
real, working model look like it produced nothing on the committed
model-selection scorecard." An unmarked *provenance*, by contrast, is not
recoverable and the row does not enter quality at all.

## Truncation as the fallback's most common cause

`USE_CASE_MAX_TOKENS` (`pipeline/jobfit/llm/capabilities.py:100`) exists because
of this chain, documented above the table: a structurally large deliverable
truncates at the base 2048-token cap, "the JSON then fails the coercion boundary
and the identical deterministic fallback ships instead. The 2026-08-05 bench hit
exactly this (scorecard/case design stubs judged ~2-3 across three models)." One
model "truncated at exactly the ceiling and shipped the deterministic template
75% of the time"; `jd_ingest` showed "0-25% validity on API adapters" before its
6144 ceiling. Per-use-case budgets sized from the deliverable are the fix.

## Misconfiguration must raise, never degrade

`pipeline/jobfit/llm/capabilities.py:16` carries the capability incident. The
`file_input` capability is deliberately withheld from provider rows whose
adapters are text-only, because advertising it once:

> green-lit routing `cv_analysis`/`profile_extract` to a provider whose adapter
> silently drops the attachment and analyzes an empty prompt

A candidate's document analysed as an empty prompt — a person evaluated on
nothing, returning a clean, well-formed, content-free artifact that no
reliability check based on errors would catch. The module docstring states the
resulting rule directly: the registry validates routing at resolve time, "so a
wildcard config entry can't silently route `cv_analysis` to a text-only provider
(it raises instead, and the caller's deterministic fallback takes over only for
*runtime* failures, never for misconfiguration)."

## Deviations

The harness has no positive **capability probe** — a request whose correct
handling is impossible without the declared capability, run per route before a
matrix. The current defence is a hand-maintained matrix plus the resolve-time
raise, which is only as accurate as the last person to edit the table; the
comment at capabilities.py:22 asks for exactly that discipline ("Re-add
`CAP_FILE_INPUT` to a row ONLY when that provider's `_call` actually attaches
files"). And the fallback count, while present in `llmRate`'s denominator, is
not broken out from hard errors in the baked cell, so a report cannot
distinguish a provider outage from a systematic truncation.
