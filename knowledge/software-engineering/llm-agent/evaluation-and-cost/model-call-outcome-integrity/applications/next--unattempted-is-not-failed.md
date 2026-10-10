---
layer: application
type: application
subject: model-call-outcome-integrity
technique: unattempted-is-not-failed
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16.3.3
applied: code
ab_verdict: better
---

# Next — a cap the retry ladder could not see

A Next.js application with one structured-generation chokepoint and seven provider
adapters (the app's own Gemini provider, plus bring-your-own-key adapters for six vendors) had
everything the technique asks for except its first move. The error vocabulary was typed,
the retry decision read a code rather than a message, and a content-safety refusal was
already its own non-retryable member. What no adapter read was the length member of the
stop vocabulary. Every path parsed the body first.

## What the body-first order did

The bring-your-own-key adapters for one vendor send a fixed output ceiling of 16000 tokens
with thinking enabled (`src/lib/llm/byom/adapters.ts:231`). Thinking spends from that
ceiling. A response cut off there arrives with an empty body or one that ends mid-object,
and the adapters classified it by its body: `malformed_json` when there was text, `empty`
when there was none.

Both codes were in the retryable set (`src/lib/llm/errors.ts:49`), and the wrapper gives a
provider three attempts on a retryable code (`src/lib/llm/index.ts:332`, gate at
`src/lib/llm/index.ts:257`). So a single truncation became three billed calls with the same prompt
and the same ceiling, all ending the same way. The record then said the model had
returned invalid JSON, before the call was finally handed to the next provider.

The suite already pinned the ladder's arithmetic: three calls for a retryable failure
(`test-unit/fault-injection-llm.test.mjs:224`) and exactly one for a non-retryable one
(`test-unit/fault-injection-llm.test.mjs:247-255`). The defect was in what reached that ladder.

## The change

`throwOnStop` (`src/lib/llm/byom/adapters.ts:122`) runs before any body is read, in every
adapter (`src/lib/llm/byom/adapters.ts:203`, `:274`, `:355`, `:431`, `:498`,
`:562`). It holds two
vocabularies:

- the cap stops across vendors (`src/lib/llm/byom/adapters.ts:113`): `max_tokens`,
  `model_context_window_exceeded`, `length`, `MAX_TOKENS`
- the provider-filter stops (`src/lib/llm/byom/adapters.ts:115`): `content_filter` and the Gemini `SAFETY`
  family

A cap stop throws the new member `truncated` (`src/lib/llm/errors.ts:42`), which is left
out of the retryable set and still falls through to the next provider. A filter stop
throws the existing `safety_blocked`. The app's own Gemini provider reads `finishReason`
ahead of `response.text` in the same way (`src/lib/llm/gemini.ts:163`). Before the change
it looked at the stop only when the text came back empty, so a partial body skipped it
entirely.

## The A/B

Thirteen stop-condition fixtures cover six of the seven adapter paths (the local-model
adapter has the change but no fixture), each with a partial body and an empty one where
the case differs, plus two filter stops. A fourteenth fixture is
a normal-stop control (`test-unit/llm-stop-condition.test.mjs`). The fixtures were run
against the tree before the change and after it.

| arm | read as | retryable | provider calls per truncation |
| --- | --- | --- | --- |
| A (body first) | 8 `malformed_json`, 5 `empty` | 13 of 13 | 3, by the pinned ladder |
| B (stop first) | 11 `truncated`, 2 `safety_blocked` | 0 of 13 | 1, then handed on |

The control parsed in both arms. The full unit suite passed after the change (4291 tests),
and `tsc --noEmit` was clean.

## Where it still stops short

- **No spend record for a failure.** `LlmCallError` has no usage field
  (`src/lib/llm/errors.ts:72-76`), so a truncated attempt still records no tokens, though
  its whole ceiling was billed. The change cut three such attempts to one; it did not make
  the one visible. That is the sibling technique spend-precedes-the-error, and it is still
  open here.
- **No name for the ceiling.** The member records that the cap was hit but not its value,
  and not how much of it went to thinking. The message carries the stop's name only.
- **Model refusals are still merged.** The model's own `refusal` and the filters' stops
  share `safety_blocked`. In this seam that costs nothing, because routing is the only
  thing that reads the code and both cases route the same way. It would start to cost
  something if a report began to count them.
