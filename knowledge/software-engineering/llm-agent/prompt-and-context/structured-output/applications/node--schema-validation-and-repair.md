---
layer: application
type: application
subject: structured-output
technique: schema-validation-and-repair
stack: node
verified_on: 2026-08-22
---

# The object door in the Vercel AI SDK, and the second one next to it

How `generateObject` / `streamObject` realize the validation-and-repair
technique. Citations are against `ai` 7.0.77, `vercel/ai` commit `ed857f5`
(2026-08-22), package `packages/ai/`. This is a reconciliation against an
external, world-class tree — not the consumer repo the sibling applications
cite — so the pin lives here in prose rather than in `verified_against`, whose
contract is a stack runtime version.

## 1. The door is a function with a name, and both entrances use it

`parseAndValidateObjectResult` (`src/generate-object/parse-and-validate-object-result.ts:21-64`)
is the whole door: `safeParseJSON` first, then
`outputStrategy.validateFinalResult`, and each failure throws
`NoObjectGeneratedError` with a distinct message — `could not parse the
response` at `:34` versus `did not match schema` at `:54`. Parse failure and
schema failure are separate verdicts from the first line of code.

The set of callers is enumerable and is exactly two: the blocking path
(`generate-object.ts:470-479`) and the streaming path
(`stream-object.ts:817-826`). Streaming does **not** get a relaxed variant —
when the stream finishes, the accumulated text goes through the identical
door, so the technique's "vary by caller is a second door wearing the first
one's name" is respected between these two.

Validation is a second line of defence, not the only one: the request already
carries `responseFormat: { type: 'json', schema: jsonSchema, … }`
(`generate-object.ts:400-405`), so the provider is asked to constrain
generation and the door then checks the result anyway.

## 2. The repair budget is one, and it is enforced structurally

`parseAndValidateObjectResultWithRepair` (`:77-111`) wraps the door in a
`try`. The catch is narrow by construction — it only fires when the thrown
error is a `NoObjectGeneratedError` whose `cause` is a `JSONParseError` or a
`TypeValidationError` (`:90-95`) — so an unrelated failure can never be
mistaken for a near-miss and spent on a repair turn.

The budget is one attempt, and it is not a counter that could drift: the
retry at `:103-107` calls the **non-repairing** inner function, so a repaired
text that still fails cannot recurse. `repairText` returning `null` is a
first-class give-up that rethrows the original error (`:100-102`) rather than
inventing anything. There is no default repairer — absent the hook, the
budget is zero, chosen rather than merely unstated.

Give-up is a typed outcome, not an exception with a string:
`NoObjectGeneratedError` (`src/error/no-object-generated-error.ts:21-72`)
carries the final candidate `text`, the `cause`, the `response` metadata, the
`usage`, and the `finishReason`. Nothing anywhere in this path returns a
default-constructed object; `streamObject` rejects the `object` promise
(`self._object.reject(e)`, `stream-object.ts:830`), so a consumer
that awaits the artifact cannot proceed on a fabricated one.

## 3. One authority per vocabulary, visible in the enum strategy

`enumOutputStrategy` (`output-strategy.ts:310`) renders the JSON schema
from `enumValues` (`:323`) and gates the final result with
`enumValues.includes(result)` (`:346`) — the prompt-side contract and the
door-side check read the same array. The array strategy wraps items in an
`{ elements: [...] }` envelope with `additionalProperties: false` (`:162`)
because "most LLMs will not be able to generate an array directly" (`:139`) —
a stated shape policy, not an ad-hoc unwrap.

## 4. Partial acceptance exists, is declared, and is scoped to streaming

The array strategy's `validatePartialResult` (`:166-234`) validates each
element independently and deliberately skips the last one — "ignore parse or
validation failures, since they indicate that the last element is incomplete"
(`:190-196`) — but only while `isFinalDelta` is false. `validateFinalResult`
(`:236-263`) then validates every element with no exemption and fails the
whole artifact on the first bad one. Item-wise tolerance is exactly the
schema-declared collection exception the technique allows, and it expires at
the settled record.

## Deviations, kept against the standard

1. **There is a second door.** `Output.object` — the structured-output path of
   `generateText`/`streamText` — reimplements the same two checks inline in
   `src/generate-text/output.ts:122-160`, with the same two error messages,
   and has **no repair hook at all**. Same vocabulary, duplicated logic, and a
   capability that silently exists on one entrance and not the other. Any
   future change to the door has two homes to be applied to.
2. **Repairs are never counted, and the trace is lost.** No telemetry field,
   event, or result property records that a repair ran (`structured-output-events.ts:186`
   carries `error` but nothing about repair). If the second attempt also
   fails, the thrown error's `text` is the *repaired* candidate, not the
   original — so the attempt count and the pre-repair candidate are both
   unrecoverable. The technique's "watch the artifact-size delta across repair
   turns" is unmeasurable here by design.
3. **The door can be a no-op.** `safeValidateTypes`
   (`packages/provider-utils/src/validate-types.ts:67-69`) returns
   `{ success: true }` unchanged when the schema carries no `validate`
   function — the case for a hand-written `jsonSchema()` with no validator.
   Total strictness degrades to a cast, silently, with no warning.
4. **Repair feedback is the caller's problem.** `RepairTextFunction`
   (`repair-text.ts:9-12`) receives only `{ text, error }`. Path-addressed
   errors survive only inside `TypeValidationError.cause` (the underlying
   Standard Schema issues, `packages/provider-utils/src/schema.ts:178-189`);
   the SDK's own `TypeValidationContext.field` path slot
   (`packages/provider/src/errors/type-validation-error.ts:8-23`) is never
   populated by the object strategies, which call
   `safeValidateTypes({ value, schema })` with no context (`output-strategy.ts:123`).

## Reconciliation summary

Confirmed: one named door with an enumerable caller set; parse-failure and
schema-failure as distinct verdicts; a repair budget of one enforced by
construction rather than by a counter; narrow near-miss classification; a
typed give-up outcome carrying the candidate and never a default-constructed
artifact; single-authority enum vocabulary; declared item-wise partial
acceptance that expires at the settled record. Deviations: a duplicated door
in `generate-text/output.ts` without the repair hook; no counting or tracing
of repair attempts and loss of the pre-repair candidate; validation silently
degrading to a pass-through for validator-less schemas; repair feedback
carrying no SDK-populated field path. Not present by scope: references and
cross-field invariants (§ the door's depth 3 and 4) — a library validating
against a caller-supplied schema has no entity scope to resolve ids in, so
those layers land on the SDK's consumer; likewise coverage gating, which the
SDK leaves entirely to the caller.
