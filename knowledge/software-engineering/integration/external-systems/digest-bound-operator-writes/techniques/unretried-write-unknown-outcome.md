---
layer: technique
type: technique
subject: digest-bound-operator-writes
technique: unretried-write-unknown-outcome
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [a write timed out or the connection dropped after sending, deciding whether a write client may retry, wording the result a person reads after a write]
---

# Unretried write, unknown outcome

A write that was sent and got no answer did not fail. Its outcome is unknown, and the
tool says so in its status, not only in an error message. The write client never
retries it on its own; only the person can decide to send it again, after reading the
remote state.

## Three outcomes, not two

Every write ends in one of three classes, and the classification happens at the
lowest layer that can see the transport:

- **Refused.** The remote answered with a refusal: a permission error, a validation
  error, a precondition mismatch, a conflict. The write did not land. Status:
  `failed`, with the remote's reason.
- **Not sent.** The request provably never left: the executable would not start, the
  name did not resolve, the connection was refused before any byte of the request
  went out. Status: `failed`, and the tool may say it is safe to try again.
- **Unknown.** The request was, or may have been, sent, and no answer arrived: a
  read timeout, a reset after send, a process killed mid-call, an answer the client
  could not parse after a success status, or the tool's own record failing to
  finish after the send. Status: `unknown`, a distinct value, with the instruction
  to read the remote before sending again.

## Procedure

1. **Classify at the transport.** The write client maps each failure to a typed
   error that carries the class. A timeout whose kill came after the request was
   handed to the network is unknown, whatever the generic error kind would say.
2. **Carry the class to the response status.** The confirm's answer is `done`,
   `failed`, or `unknown`; a screen branches on the status, not on text. An error
   message that says "outcome unknown" inside a response whose status is `failed`
   is still a `failed` to every caller that reads the status, including the
   journal that decides whether the plan may run again.
3. **Do not retry writes.** Reads may back off and retry; writes are sent once. A
   retry of a non-idempotent write after an unknown outcome is a duplicate with
   probability equal to the chance the first one landed, which on a slow remote is
   most of the time.
4. **Keep the button closed and point at the remote.** The person's next action is
   to look (the branch, the request, the file) or to ask the tool to recall and
   re-plan, never to resend the same preview blind.

## Decision rules

- When the remote supports a precondition token or an idempotency key, a retry can
  be made safe, and the tool may offer it, as a new confirm, not an automatic loop.
- When a later step of the plan is skipped because an earlier one is unknown, the
  later steps are `not run`, not failed; the rows show exactly where the sequence
  stopped.
- When the tool cannot tell refused from unknown (the transport collapses both into
  one exit code), classify as unknown. The cost of wrongly saying unknown is one
  read of the remote by a person; the cost of wrongly saying failed is a duplicate
  or a stale overwrite.
- When counting outcomes on a dashboard, count unknown separately. Folding it into
  failures inflates the failure rate and hides the duplicate risk; folding it into
  successes is [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
  in reverse.

## The naive reading and why it fails

"A timeout is an error, errors are failures" is true of reads and false of writes.
The write's effect is decided at the remote when the request arrives, not at the
client when the answer does; the client's timeout is a fact about the client. Per
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value), the
laundering point is the boundary where the transport's three-valued truth meets a
two-valued status field, and that field is where the third value must be added.

## When not to use it

A write the remote guarantees is idempotent under a key the client sent may be
retried by the client, and its unknown collapses back to known once the retry
answers. A write to the tool's own transactional store has no unknown: the
transaction committed or it did not.
