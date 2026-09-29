---
layer: application
type: application
subject: recruiter-anchored-model-evaluation
technique: never-judge-a-fallback-as-the-models-work
stack: process
status: forged
verified_on: 2026-09-29
applied: simulation
ab_verdict: not-better
---

# Fallback exclusion in the bench harness

Line numbers re-resolved on 2026-09-29 against kp `origin/main` at `b2c19295b`.

Every bench record carries a `source` field stamped where the output was
produced — `"llm"` for a real generation, otherwise the deterministic fallback
path. The whole exclusion rests on that mark existing at emission time; nothing
in the harness infers provenance from the text.

## The incident

`judge_records` (`pipeline/jobfit/llm/bench/judge.py:174`) records it in its
docstring:

> a record that degraded to the deterministic fallback is the SAME template for
> every model, so judging it measures the fallback, not the model — and it drags
> the model's quality cell down for what is actually a reliability failure
> (already reported as `llmRate`). The 2026-08-05 expanded run hit exactly this:
> `interview_scorecard` fallback stubs were scored ~2 and contaminated three
> models' quality cells.

Three models, one use case, one template scored near the floor. The filter that
followed is one line (judge.py:192):

```python
judgeable = [r for r in records if r.error is None and r.payload is not None and r.source == "llm"]
```

Errored rows, empty payloads and deterministically served rows are left
unscored — not scored low.

## The exclusion propagates to every per-model statistic

`_cell` in `pipeline/jobfit/llm/bench/bake_quality.py:64` re-applies the same
partition when it aggregates, and its docstring names the second reason:

> latency uses LLM rows only so the near-instant fallback can't fake a fast p50.

The resulting cell separates the axes explicitly: `score` and the three
dimension medians run over judged LLM rows; `judges` carries the surviving
count; `llmRate` is "reliability over ALL attempts (errors + fallbacks in the
denominator)"; `p50Ms` is the median over LLM rows only. Since 2026-09-23
(commit `4e0f7777d`) the cell also carries `costPerTaskUsd`, the median spend of
the served LLM rows, with the reason in a comment (bake_quality.py:89-93): a
fallback costs nothing and an errored row may carry a partial spend, so neither
is the price of the model's work, and a cell with no priced row is `null`, never 0.
That is the technique's "every per-model statistic" extension carried to cost. When
no LLM row survives, `_cell` returns `None` and the model simply has no cell for
that op — not a zero.

**Structural validity is a fourth statistic the fallback contaminates.** The
deterministic fallback is contract-valid by construction, so a `validRate` over
all rows cannot fail. `runner.summarize` (`runner.py:310`) once counted it that
way and a target that never once served read as "valid 100%"; commit `b5c9ec702`
(2026-08-22) scoped `validRate` to the rows the model answered (`source == "llm"`,
runner.py:339, 356) and returns 0.0 when it served none. `bake_quality._cell`
takes its majority-valid vote over the same LLM-only set (bake_quality.py:87).

**The two aggregators still scope differently.** In `summarize`, `p50Ms`/`p95Ms`
are taken over every non-errored row and `costPerTaskUsd` divides the summed cost
by `len(ok)` (runner.py:340-341, 359, 364-365), fallbacks included; the baked cell
above uses LLM rows only. Whether that moves any ranking was not measured - a
fallback that follows a failed call carries the failed call's wall time, so it is
not always "near-instant" - but the printed scorecard and the baked scorecard
answer the latency and cost question over different rows.

## Malformed dimension versus missing provenance

The two are handled differently, which is the distinction the technique draws.
`_coerce_dim` (judge.py:149) rescues a numeric string like `"8"`; a genuinely
unparseable dimension (`"8/10"`, `"high"`) becomes `None` and is dropped from
the median by `_med_dim` (bake_quality.py:55). But the cell is kept: the comment
at bake_quality.py:79-84 explains that a missing per-dimension median is imputed
from the overall median rather than voiding the column, "which used to make a
real, working model look like it produced nothing on the committed
model-selection scorecard." An unmarked *provenance*, by contrast, is not
recoverable and the row does not enter quality at all.

## Truncation as the fallback's most common cause

`USE_CASE_MAX_TOKENS` (`pipeline/jobfit/llm/capabilities.py:153`) exists because
of this chain, documented above the table: a structurally large deliverable
truncates at the base 2048-token cap, "the JSON then fails the coercion boundary
and the identical deterministic fallback ships instead. The 2026-08-05 bench hit
exactly this (scorecard/case design stubs judged ~2-3 across three models)." One
model "truncated at exactly the ceiling and shipped the deterministic template
75% of the time"; `jd_ingest` showed "0-25% validity on API adapters" before its
6144 ceiling. Per-use-case budgets sized from the deliverable are the fix.

## Misconfiguration must raise, never degrade

`pipeline/jobfit/llm/capabilities.py:27-35` carries the capability incident. The
`file_input` capability is deliberately withheld from provider rows whose
adapters are text-only, because advertising it once:

> green-lit routing `cv_analysis` to a provider whose adapter
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
comment at capabilities.py:32 asks for exactly that discipline ("Re-add
`CAP_FILE_INPUT` to a row ONLY when that provider's adapter actually attaches
files") and now says so outright: "Declared, never probed". One thing changed
since the first reading: the Gemini row earned `file_input` through
`GeminiProvider.complete_document` (the cv_analysis fold-in, 2026-08-30), and the
base `complete_document` (`pipeline/jobfit/llm/base.py:436`) refuses with an
`LLMError` of subtype `missing_capability` rather than dropping the attachment.
That is a fail-loud backstop for a route that bypassed the matrix; it is still not
a probe, and it cannot catch a row that declares a capability its adapter only
half implements. And the fallback count, while present in `llmRate`'s denominator, is
not broken out from hard errors in the baked cell, so a report cannot
distinguish a provider outage from a systematic truncation.

## Second reading of the recorded runs (2026-09-29)

Counted from the local bench record files (37 record sets, 816 rows, none published);
counts only.

### The direction of the contamination

The technique's first wording said contamination flatters unreliable models. The
records hold 13 judged rows whose `source` is not `llm`, all from runs before the
filter existed, and all 13 scored below the median of the same operation's real
answers:

| operation | judged fallback rows | their score | judged real answers, median |
| --- | --- | --- | --- |
| interview_scorecard | 3 | 2 | 8 (n=51) |
| devcase_case_design | 3 | 3 | 8 (n=51) |
| weight_proposal | 3 | 3-4 | 7 (n=56) |
| group_compare | 3 | 6 | 8 (n=50) |
| campaign_pack | 1 | 3 | 8 (n=57) |

Thin stubs punish the models that fell back rather than flattering them. The
technique now states the direction as the sign of the template's score minus the
model's. Thirteen rows over five operations, one round.

### The fallback rows of the committed bake were slow and paid

The committed bake (240 rows, four record sets) has four non-served rows, all
deterministic fallbacks and none errored:

| model | operation | wall time | priced spend |
| --- | --- | --- | --- |
| gemini-3.6-flash | automation_outreach | 15.7 s | $0.0030 |
| deepseek-v4-flash | automation_outreach | 51.4 s | $0.0013 |
| claude-sonnet-5 | automation_offer | 33.1 s | $0.1729 |
| claude-sonnet-5 | weight_proposal | 180.1 s | unpriced |

Each was stamped after a failed generation. The median served-row latency of those
three models was 12.0, 21.5 and 27.8 s, so these were the slow, paid tail: leaving them
in would make the models look slower and dearer, not faster. At this fallback rate
(1.7%) the effect is small (spend +0.5% for gemini, +2% deepseek, +1.5% sonnet; all-rows
p50 within about 4%), and `costPerTaskUsd` carries none of it.

### Where the mark is set, and where it is not

`_generate` (`pipeline/jobfit/automation.py:490`) reports `deterministic` when the
coerced result equals the template (`if result == deterministic()`, line 538), so a
coercion that discards the whole payload no longer ships as the model's (commit
`dcba70388`, after one model's interview-prep cell had been graded on the template).
That is a comparison inside the production path at the moment of coercion, not a text
guess, and it catches a whole payload replaced.

It does not catch a hybrid. `weight_proposal._coerce` (`weight_proposal.py:145-158`)
backfills any candidate the model missed with the deterministic proposal, and a
proposal whose rationale came back empty keeps its weights but takes the
deterministic rationale; the comment records "~85% of rationales empty across every
model" in the 2026-08-11 bench. The caller returns `_coerce(...), "llm"`
(weight_proposal.py:183) with no comparison, so a payload with no usable proposal at all
is marked as the model's. Whether the recorded `weight_proposal` rows contain such
hybrids could not be read: the record files carry no payload.

### The budget binds some arms and not others

The matrix document adds an asymmetry the technique now names: the per-use-case ceiling
binds the API adapters and "CLI targets have no ceiling, which is why the Claude
columns never showed it"; a weak gemini column was for a time gemini's reasoning
tokens eating the cap.

### The mirror of the empty-prompt defect

`CAP_WEB_RESEARCH` (`capabilities.py:18-25`) is "declared only where a door exists that
actually opens the session", because declaring it on a text API "would let that API
answer 'what does the market ask for today' from its training data, a plausible answer
with no sources behind it." A use case that cannot be benchmarked at all, `role_research`,
is listed as unmeasured (`UNMEASURED_USE_CASES` in `app/_lib/llm-quality.ts`), since live
web research has no fixed input a bench could judge.

### Verdict

`applied: simulation`, `ab_verdict: not-better` for the standing sentences on direction
("flattering") and on the instant-and-free premise: three real cases (the judged
fallbacks, the four slow paid rows, `weight_proposal`'s backfill) each contradicted or
went beyond a sentence of the technique, and it gained the conditions. The rule of
excluding fallbacks from quality was not contradicted and stands.
