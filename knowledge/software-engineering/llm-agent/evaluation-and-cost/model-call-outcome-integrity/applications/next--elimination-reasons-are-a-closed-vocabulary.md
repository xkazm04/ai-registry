---
layer: application
type: application
subject: model-call-outcome-integrity
technique: elimination-reasons-are-a-closed-vocabulary
stack: next
status: forged
verified_on: 2026-09-05
verified_against: next@16.3.3
---

# Next — one descent trail, three destinations

A TypeScript application that routes reasoning turns across a local subscription CLI and a
hosted API implements the technique's three-consumer rule literally, and says so in the
module header before any code runs.

## The vocabulary

`RerouteStep` (`lib/text/types.ts:124-140`) is a provider plus a `why` drawn from a closed
union. The members separate exactly the conditions the technique warns get collapsed:

| member | what it distinguishes |
| --- | --- |
| `unsupported` | the plan named it, the adapter lacks the capability |
| `no-key` | no credential configured |
| `policy-forbidden` | this deployment forbids the transport at all |
| `managed-platform` | the mechanism cannot exist in this environment |
| `not-installed` / `not-logged-in` | the binary is absent, or present and unauthenticated |
| `failed` / `refused` / `rate-limited` | it was called, and it did not answer |

The split that earns its place is `policy-forbidden` / `managed-platform` against `no-key`.
A deliberate seal and a missing credential are the pair the technique's canonical incident
confuses, and here they cannot be: they are different members of one union, so an operator
reading the trail is never sent to provision a key that was never meant to exist.

The second split worth naming is `not-installed` against `not-logged-in`. Both mean "the
local transport is unusable" and they have entirely different fixes.

## The three destinations, asserted in prose and in code

The module header states the contract before the reader reaches an implementation
(`lib/text/router.ts:5-9`):

> every one of them lands in `trail`, which reaches the caller three ways: as the error
> thrown at the end, as `provenance.reroutedFrom` when a later engine served, and as one
> line on the server log either way.

And the declaration repeats it where the array is created (`router.ts:190-195`), calling it
*"the same record twice over"*. The trail is spread into the successful outcome at
`router.ts:305` (`...(trail.length ? { reroutedFrom: [...trail] } : {})`), and rendered
into the log line at `log.ts:162-164` as `provider:why` pairs — under the key `tried` or
`rerouted` depending on whether the call ultimately succeeded.

That last detail is a sharpening the technique does not state. The *same* data is labelled
differently by outcome, because on a success the trail is a descent — someone was tried and
lost — while on a failure it is the exhaustive reason nothing ran. One structure, two
readings, and the label tells a log reader which question the line answers.

## Why this is the strong form

The technique's value claim is that three consumers can never disagree. Most
implementations satisfy it by convention: the log line is built at the throw site, the
caller's field is populated separately, and the two drift the first time someone adds a
member. Here a single mutable array accumulates during the walk and is then *read* by all
three, so a new elimination cause reaches every destination by construction — adding a
union member is the only edit.

## Where it stops short

The trail is honest about the descent and silent about the ceiling. This tree configures
no completion budget anywhere in its reasoning path — only wall-clock timeouts
(`router.ts:110-132`) — so the sibling technique's void outcome has no member here: a
truncated answer would arrive as content and be validated as content. The vocabulary
covers *why an engine was not used*; it does not yet cover *why an engine that was used
did not finish*.

The provenance also reaches the persisted artifact, not just the response — the staged
version carries `{ provider, model, rung, transport, schemaEnforcement, reroutedFrom }`
(`app/api/recalibrate/route.ts:451-465`). That is a fourth destination the technique does
not require and probably should: an artifact that outlives the request carrying the reason
its engine was substituted is the only form of this record that survives log rotation.
