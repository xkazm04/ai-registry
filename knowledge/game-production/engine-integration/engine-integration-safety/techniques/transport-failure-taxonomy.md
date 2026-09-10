---
layer: technique
type: technique
subject: engine-integration-safety
technique: transport-failure-taxonomy
status: forged
laws: [unmeasured-is-not-a-pass, a-verdict-is-bound-to-its-content]
shared_with: []
use_when: [designing the error type of a client that drives another process, a failure message sent someone to fix the wrong thing, deciding when a failed call may be retried]
---

# Transport failure taxonomy

Classify the observed communication failure separately from what is known about remote
execution. A missing response does not prove that an instruction never ran. The same
timeout can occur before transmission, during execution, or after successful execution
while the response is lost.

## Two independent axes

Use an explicit failure kind: connection failure, deadline, caller cancellation,
malformed response, protocol rejection, execution error or unknown. Also carry execution
certainty: known not started, started with outcome unknown, completed with an observed
outcome, or unknown. Evidence for one axis must not invent evidence for the other.

- **Connection failure:** resolution or connection refusal before any transmission can
  establish that this attempt did not start. A socket failure after transmission cannot.
- **Deadline:** the caller stopped waiting. This alone proves neither acceptance nor
  cancellation of work on the other side.
- **Caller cancellation:** record who cancelled and when. Cancellation of the wait does
  not establish rollback or remote termination.
- **Malformed response:** some responding component returned an invalid envelope.
  It may be an intermediary; neither remote health nor execution outcome follows from
  that fact. Preserve a bounded, audience-appropriate, redacted diagnostic.
- **Protocol rejection:** record the actual status and declared semantics. Invalid
  credentials or an unsupported operation usually require correction. Temporary
  rejection can justify a later attempt only under the execution and retry contract.
- **Execution error:** a trusted execution envelope reports failure. Side effects may
  have occurred before the error, and the report does not prove general application
  health. Use an explicit execution discriminator, not an unexplained missing kind.
- **Unknown:** retain the gap when the available observations cannot distinguish cases.

## Procedure

1. Classify at the boundary while transmission, response and cancellation details are
   available. Preserve operation and attempt identities through every intermediary.
2. Separate sending, reading and envelope validation so one catch-all does not turn
   every response error into an unreachable application.
3. Record whether the caller's signal or the local deadline fired first, and preserve
   uncertainty when their ordering is unavailable.
4. Derive execution certainty only from observed protocol guarantees. If a consumer
   needs a reached field, give it an unknown state and define whether it means a proxy,
   the target transport endpoint or the instruction executor.
5. Include the elapsed bound, response status and actionable context in diagnostics.
   Truncation limits size; redaction separately limits sensitive disclosure.
6. Select retry behavior from failure kind, execution certainty and operation semantics.

## Retry rules

An operation known not to have started can be retried after its precondition is repaired.
For an uncertain outcome, use an idempotent operation or a durable deduplication contract
that covers the original attempt and its side effects. Merely generating a fresh request
identifier does not provide that contract. Otherwise inspect or reconcile the outcome
before another attempt.

Apply bounded backoff only where the failure is plausibly transient. Do not retry a
user-cancelled operation automatically. A malformed body is not guaranteed to recur
identically, and an execution error is not guaranteed safe to replay. Both require the
same side-effect analysis as a timeout.

## When not to use the full taxonomy

A notification may need fewer categories when no downstream policy uses the distinction.
It must still avoid claiming known non-delivery when delivery is uncertain. A structured
remote error channel complements transport classification; it does not remove failures
while sending or decoding that channel.
