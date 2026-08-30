---
layer: application
type: application
subject: margin-and-unit-economics
technique: cogs-by-construction
stack: python
status: forged
verified_on: 2026-08-30
verified_against: python@3.12
source: BerriAI/litellm
---

# COGS by construction in LiteLLM's proxy spend pipeline

LiteLLM `v1.99.0` (`pyproject.toml:3`), commit `f005afa1460385a218be8ef1fdfa49998bf93523`
(2026-08-22). The proxy meters spend per key/team/user/tag against a price book and has no
billing ingest, so only the **cost term** of margin is in scope — exactly the term this
technique governs. It computes every discriminator the cost sum needs, then loses all of
them in the aggregate.

## Rule 1 — segregate at write time, not at read time

The technique's alternative-to-avoid is "one events store with a `purpose` column and a
`WHERE` clause". LiteLLM implements exactly that, and the column is real: `InternalCallOrigin
= Literal["autorouter_classifier", "shadow_eval_router", "shadow_eval_judge"]`
(`litellm/types/utils.py:2822`) — the quality apparatus, named. It is stamped onto sub-call
metadata at dispatch (`litellm/litellm_core_utils/internal_call_metadata.py:79-81`, `:93-94`),
and the module docstring states the intent in the technique's own vocabulary: those calls
"bill real provider spend that nobody typed a prompt for" (`:4-5`), and the stamp records
"that it is not traffic the caller sent" (`:14-15`).

**Deviation, and the sharpest finding here.** The daily rollup reads that stamp and applies
it to the *counters only*:

```
is_internal_call: Final = bool(_metadata.get(INTERNAL_CALL_ORIGIN_METADATA_KEY))  # :1875
    spend=payload["spend"],                                                       # :1900
    api_requests=0 if is_internal_call else 1,                                    # :1906
```

(`litellm/proxy/db/db_spend_update_writer.py`; `successful_requests`/`failed_requests` on
`:1907-1908` are gated the same way). The discriminator is in hand on 1875 and spent on 1906; line
1900 carries the judge's dollars through untouched. The in-code justification is volume-only —
counting internal calls "inflates request-volume readers" (`:1901-1905`), echoed at
`spend_tracking/savings.py:514-518`. The tree concluded that apparatus calls corrupt the traffic
metric and did not extend that to the money metric.

**Aggregation then destroys the discriminator, permanently.** `LiteLLM_DailyUserSpend`
(`schema.prisma:740-765`) has one money column, `spend Float @default(0.0)` (`:758`), under a
unique key of `[user_id, date, api_key, model, custom_llm_provider, mcp_namespaced_tool_name,
endpoint]` (`:765`) — no origin dimension. Once a judge call and a customer call share a day,
key and model, their dollars are one float.

This sharpens the technique's own argument. Its stated risk is that someone forgets the filter;
LiteLLM never forgets — it applies it on the line after computing it. The stronger risk is that
**a rollup is a lossy write**: a read-time predicate has a shelf life of one aggregation pass.

**The tag dimension is the tree's other construction, and it is also holed.**
`LiteLLM_DailyTagSpend` (`schema.prisma:914`, unique key at `:940`) keys on `tag`, so a
caller-declared tag *does* survive aggregation, and an operator who tags eval traffic gets a
subtractable total. Two holes. Tags come from request metadata
(`litellm/proxy/hooks/proxy_track_cost_callback.py:516-518`), and `forwarded_internal_call_metadata`
copies the parent's whole metadata dict
(`internal_call_metadata.py:79-81`), so an auto-router classifier inherits the production tag of
the request it was classifying; conversely `sanitized_forwardable_call_metadata` keeps only
`FORWARDABLE_IDENTITY_METADATA_KEYS` (`:30-41`, `:93`), which excludes `tags`, so shadow-eval
judge spend lands untagged. Neither path yields a subtractable tag.

## Rule 2 — sum only priced cost, and disclose the unpriced

LiteLLM produces the required null and discards it one layer later. `_response_cost_calculator`
returns `None` on a pricing failure and records a debug object
(`litellm/litellm_core_utils/litellm_logging.py:1666-1669`). The payload builder coerces:
`llm_response_cost: Final[float] = raw_response_cost or 0.0` (`:5756`), and
`StandardLoggingPayload.response_cost` is typed `float`, not `float | None`
(`litellm/types/utils.py:3194`); `SpendLogs.spend` is likewise non-nullable `Float
@default(0.0)` (`schema.prisma:615`). Zero is the only representation available, and it collides
with a real zero — a cache hit is also 0.0 (`litellm/cost_calculator.py:1789-1790`).

The disclosure never reaches the store. `response_cost_failure_debug_info` is a field of the
logging payload (`litellm/types/utils.py:3197`); `SpendLogsMetadata`
(`litellm/proxy/_types.py:3504-3540`) has no field for it. Grep-scoped: `grep -rn
"response_cost_failure" litellm/proxy/spend_tracking/ litellm/proxy/db/` → no matches. And
`grep -rn "internal_call_origin\|INTERNAL_CALL_ORIGIN" litellm/proxy/spend_tracking/` → four
hits, all inert (a docstring at `spend_management_endpoints.py:2670`, a `None` initializer at
`spend_tracking_utils.py:128`, and an import plus one use in `savings.py` gating savings).

### Executed evidence — Python 3.12.1, clone on `sys.path`, no network

`litellm.completion_cost` over a synthetic `ModelResponse` with `prompt_tokens=1000, completion_tokens=100` (n=1 per case), plus one end-to-end `litellm.completion(mock_response=...)` with a `CustomLogger` capturing the payload:

| case | result |
| --- | --- |
| known model `gpt-4o-mini` | `0.00020999999999999998` (float) |
| unknown model, provider not inferable | raises `BadRequestError` |
| unknown model, `custom_llm_provider="openai"` | raises `Exception("This model isn't mapped yet")` |
| map entry with **no** token-price fields | **`0.0`** — no null, no exception |
| map entry priced per image, called with chat usage | **`0.0`** |
| map entry with `input_cost_per_token` only | `0.001` — the priced half, output free |
| end-to-end unmapped model, payload as consumers see it | `response_cost=0.0` (float), failure-debug set, while `kwargs["response_cost"]` is `None` |

The last row is the finding in one line: the honest null exists inside the logging object and is
gone from the object every consumer reads. Rows four and five are worse than the raising path — a
model *present* in the book but priced in the wrong units returns a clean `0.0` with no debug info
at all, so nothing downstream can know it happened.

## An adjacent hazard the technique does not name: markup inside the cost column

`_apply_cost_margin` (`litellm/cost_calculator.py:994-1057`) adds a configured percentage and/or
fixed amount to provider cost and returns the sum as `final_cost` (`:1046`) — the value that
becomes `SpendLogs.spend`. With `litellm.cost_margin_config` set, the cost column carries COGS
**plus a revenue term**. The pre-markup figure survives as `CostBreakdown.original_cost`
(`litellm/types/utils.py:3150`) in spend-log metadata JSON (`spend_tracking/spend_tracking_utils.py:162`,
`proxy/_types.py:3538`) — and, like the origin stamp, dies in the daily aggregate.

## Rule 3 (dual-use) — confirmed independently

`llm_as_a_judge` is a guardrail that can block the response
(`litellm/proxy/guardrails/guardrail_hooks/llm_as_a_judge/__init__.py:203-205`) — the
technique's dual-use case, where the production role dominates and the pass is COGS. It and
shadow-eval share one helper, `judge_acompletion` (`litellm/litellm_core_utils/llm_judge.py:66-87`),
and differ exactly as the rule predicts: shadow-eval passes `metadata=judge_metadata` stamped
`SHADOW_EVAL_JUDGE_CALL_ORIGIN` (`litellm/integrations/shadow_eval_logger.py:905`, `:921`); the
guardrail judge passes none (`llm_as_a_judge/__init__.py:134-140`).

## Verdict

Rule 3 confirmed. Rule 1 realized as the read-time predicate the technique warns against, then voided
by a lossy rollup. Rule 2 violated at the store boundary while the correct null is produced upstream.
Code deviating from the technique, not the technique needing repair — except that the technique's
*reason* for preferring write-time segregation is understated, and this tree supplies the better one.
