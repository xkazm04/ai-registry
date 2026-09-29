---
layer: application
type: application
subject: model-routing
technique: turn-classification
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@22
---

# An inferred class that abstains toward the cheap tier (TypeScript, agent runtime)

Stack version from the tree's `engines` field; commit `ae87280a`. The technique's hard
case is a system with no call site to assert a class, so the class is inferred from
content, and its condition for accepting that is an **asymmetric error that points at the
expensive tier**. This tree infers the class with a judge model, states the
continuation rule in the judge's prompt, and gets the direction of the failure default
right in one place and wrong in another. Every row below was executed against the real
router with a stubbed judge.

## What the judge sees and what it costs

The judge is shown the last user message plus the previous turn's tier, capped at a short
output (`src/router/tokenSaver/classifyAndRoute.ts:55 "const userMessage = extractLastUserMessage(input.messages);"`
and `src/router/tokenSaver/classifyAndRoute.ts:75 "maxOutputTokens: 256,"`); the prompt
was inspected on a 100,000-token history and carried none of it. The class is then
pinned for the turn's tool loop through a sticky record
(`src/router/RouterRuntime.ts:390 "const mainSticky = sessionStore.get(input.sessionId, false);"`),
the technique's "decided once per turn and pinned" rule. The judge's prompt ends with the
right abstention sentence for its own uncertainty ("Default tier when uncertain:
complex"), and tells it that a short acknowledgement continues the previous task.

## Where the direction goes wrong

The judge's reply is reduced to a tier by scanning the text for the configured tier
names in configuration order
(`src/router/tokenSaver/parseTier.ts:13 "for (const tier of knownTiers) {"`), so prose with
no recognised tag resolves to the **first-declared tier, which is the cheapest in the
default configuration**, and a tag naming an unknown tier falls through to the same scan.
Executed:

| Judge output | Parsed tier |
| --- | --- |
| `<tier>complex</tier>` | complex |
| "This is not simple, it is complex." | **simple** |
| "complex or simple? I'd say complex" | **simple** |
| `<tier>hard</tier> (simple would be wrong)` | **simple** |
| the prompt echoed back | **simple** |
| two tags | the first |
| empty text | undefined, retried up to three times (`src/router/tokenSaver/classifyAndRoute.ts:81 "const maxAttempts = 3;"`) |
| prose naming no tier | undefined: retried, then the default tier |

A negation, a quotation of the prompt and a refusal to answer all read as the cheap
class, so the classifier's confusion lands where the technique says it must not. When the
judge call itself fails, the fallback is a configured default tier
(`src/router/config/schema.ts:130 "DEFAULT_TIER_NAME"`), which is a deliberate choice of
direction and a good one to have named; the parse step behind it is the same choice made
implicitly, in the other direction.

## The rest of the decision record

The technique wants the decision record to say the class was inferred, not asserted; this
tree records `resolvedFrom: tokenSaver` and a fallback marker on every decision. The
technique wants an inferred-cheap turn whose call fails to be retried once on the
expensive tier; this tree retries a failed call on a per-scenario fallback chain, and
executed with a fake provider chain it moved a self-correctable error (bad tool
arguments) to another model, which the technique's scoping rule ("a malformed request is
not a failure a different tier could fix") says buys a second bill and the same answer.

## Cannot say

Whether a real judge model emits any of the first three replies above at a rate that
matters. The judge sees a short message; a tagged reply is the common case and the prompt
asks for exactly one tag. The parse defect is real and cheap to fix (prefer the tagged
value, and treat an untagged reply as a failure with the named default), and its
frequency is unmeasured.
