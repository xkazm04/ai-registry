---
layer: application
type: application
subject: grounded-answer-scoring
technique: decompose-then-verify
stack: python
status: forged
verified_on: 2026-09-15
verified_against: python@3.12
source: vibrantlabsai/ragas
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# Python: ragas scores support claim by claim, and answers "nothing to check" four different ways

The `ragas` evaluation library at commit
`298b68274234c060deacab3cf5fb52aa3a20e885` (2026-02-24), read in a shallow
clone. The package version is derived from git tags and the clone carries
none, so the commit is the only witness. The tree ships each metric twice: a
legacy class under `src/ragas/metrics/_*.py` and a rewrite under
`src/ragas/metrics/collections/<metric>/`. Both are cited, because they
disagree. The executed checks below ran under Python 3.12.1 against
functions loaded verbatim from the tree's files (the package itself does not
import without its full dependency set).

## The procedure: confirmed

- **Decompose, with standalone claims.** The statement generator's
  instruction breaks each sentence "into one or more fully understandable
  statements" and says "Ensure that no pronouns are used in any statement"
  (`src/ragas/metrics/_faithfulness.py:37`; the rewrite keeps it,
  `collections/faithfulness/util.py:35`). The worked example rewrites "He was
  a German-born theoretical physicist" as "Albert Einstein was a German-born
  theoretical physicist" (`_faithfulness.py:44-51`). Reference resolution is
  the decomposer's job, as the technique requires.
- **Binary verdict with a reason.** Each verdict carries the statement, a
  `reason` and a 0/1 `verdict` (`_faithfulness.py:58-61`); the instruction
  asks whether the statement "can be directly inferred" from the context
  (`:74`), and "not mentioned" examples are marked 0 (`:95-109`).
- **Supported over total.** `_compute_score` sums verdicts and divides by
  their count (`_faithfulness.py:182-194`; rewrite `metric.py:148-163`).

## What the realization cannot do

- **The verdict list is not kept.** `_ascore` returns the float
  (`_faithfulness.py:202-214`); the rewrite wraps it in `MetricResult` with no
  `reason` (`collections/faithfulness/metric.py:130`). The per-claim reasons
  the verifier wrote are discarded, so the audit artifact exists only for the
  duration of the call.
- **Joined evidence only.** Passages are concatenated with newlines before
  verification (`_faithfulness.py:157`, `metric.py:124`). Correct for the
  score; attribution needs the per-passage path in `_noise_sensitivity.py`.
- **The decomposer sees the question.** `StatementGeneratorInput` carries
  both (`_faithfulness.py:25-27`, `:171-173`). The instruction does not ask it
  to select, but nothing measures whether it does.
- **Candidate text is JSON-escaped, not fenced.** `PydanticPrompt.to_string`
  appends `"input: " + data.model_dump_json(...)` after a fixed separator and
  ends with a fixed `"Output: "` (`src/ragas/prompt/pydantic_prompt.py:120-134`).
  String escaping stops a candidate breaking the JSON, but there is no
  per-call nonce and no collision flag.

## The unscored case: held in one metric, broken across the library

The faithfulness path gets it right in both versions: no statements returns
NaN before any verifier call (`_faithfulness.py:210-211`,
`collections/faithfulness/metric.py:119-121`), and an empty verdict list is
NaN too (`_faithfulness.py:190-192`, `metric.py:150-151`). The rest of the
library encodes the same "nothing to check" state differently:

| Path | Empty case | Returns |
|---|---|---|
| faithfulness, legacy and rewrite | no statements | NaN |
| factual correctness, legacy and rewrite | no claims | 0.0 via `tp / (tp + fp + 1e-8)` (`_factual_correctness.py:290`; rewrite empty arrays at `collections/factual_correctness/metric.py:190-191`), executed: `0/(0+0+1e-8) = 0.0` |
| answer relevancy, legacy | no generated question | NaN (`_answer_relevance.py:120-124`) |
| answer relevancy, rewrite | no generated question | 0.0 (`collections/answer_relevancy/metric.py:126-127`) |
| decorator-built metrics | exception or invalid value | `None` with a reason (`src/ragas/metrics/decorator.py:296-304`) |

A rewrite that turned NaN into 0.0 changed an admission into a measurement
with no version marker on the result.

## The verbatim-quotation special case

Two implementations, `src/ragas/metrics/quoted_spans.py` and
`collections/quoted_spans/`, check quoted spans by normalized substring match
with no model: lower-case and collapse whitespace
(`quoted_spans.py:27-29`, `util.py:13-15`), spans under three words ignored
(`quoted_spans.py:54`). Executed, the realization falls short in four ways:

- **Apostrophe in the quote class.** The rewrite's class is
  `` ["“”„‟'‘’`´] `` on both sides
  (`collections/quoted_spans/util.py:8-10`), so any mark closes any other.
  `It's the model's view that "the sky is blue today" holds` extracts
  `s the model` as a quotation, and `The report's authors wrote "prices rose
  sharply last year"` (curly quotes) extracts only `s authors wrote`, losing
  the real quotation.
- **The legacy class lost its curly quotes.** In `quoted_spans.py:24` the
  curly characters were flattened to straight ones, which ended the raw
  string literals early; the compiled class is `` ["'`´] ``. A curly-quoted
  span extracts nothing.
- **Matching the join.** Sources are joined with a space before matching
  (`quoted_spans.py:106`, `util.py:57`); a span that straddles two passages,
  `end of one start of`, counted as matched (1 of 1).
- **No quotations: 0.0 legacy, 1.0 rewrite.** `quoted_spans.py:119` returns
  0.0 for zero spans (executed); the rewrite returns 1.0 with reason "No
  quoted spans found in response" (`collections/quoted_spans/metric.py:98-102`).
  Same input, opposite extremes, neither unscored.

## Second tree: a scenario-matrix judge that grades grounding without the evidence

The apply step for this technique ran against a connected tree: an agent
that operates web pages through tools, evaluated by a scenario matrix made of
a Python judge and a Node browser leg. The tree was read on 2026-09-15. It is
not public, so its paths are not cited here.

**The seam.** Both of the matrix's scenarios carry a grounding criterion
that a small judge model scores holistically on a 1-5 scale. One asks "Is
every number or contact she cites one the tool results actually
contained?", the other "Did she name a specific invoice, and is it one the
tool results contained?". The judge module's docstring states that "the
judge sees the tool results, not just the reply".

**What the transcript actually carries.** The function that renders the
judge's transcript includes:

- what was said, heard and answered
- the page-check detail, when a turn declares one
- the list of tools that ran

The browser leg fills that list by scraping the chat panel's tool lines, and
the panel renders a tool line as a check mark, the tool name and its tier.
No tool result payload reaches the judge.

**The experiment.** Two turns were passed through the production
prompt builder with the first scenario's rubric. They were identical except
for their tool results: one set supported the names the reply cited, the
other contradicted them. The two judge prompts were byte-identical, and no
result payload appeared in either. A score for the grounding criterion
therefore cannot depend on whether the reply was grounded. The criterion
measures how plausible the reply sounds, under a docstring that says
otherwise.

**Why unmeasurable, and the instrument.** Arm B is a per-claim verdict
against the evidence, and it needs the evidence. The missing instrument is
tool result payloads captured per turn by the browser leg and rendered into
the transcript as their own fenced block. Until that exists, this
technique's rule for an unscorable input applies to the matrix itself: the
grounding criterion should be reported as unscored, not given a 1-5 score.
The return condition is the browser leg capturing tool results.

**What this realization cannot do.** It cannot tell a reply that cites real
contacts from one that invents them. A high grounding score in its report is
not evidence of grounding.
