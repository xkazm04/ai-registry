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

The concern: the space between "I sent an instruction" and "the instruction ran and
raised" is not empty. It contains several distinct outcomes, each with a different correct
response, and collapsing them into one error type makes every failure undiagnosable and
every retry policy wrong.

The cost is concrete and it is paid by a human. A client that reports *unreachable* when
the callee answered with a broken body sends an engineer to restart an application that is
already running, while the actual defect — a bug on the callee's side — stays hidden behind
a message that describes a different world.

## The kinds

Classify along two axes: **was the callee reached**, and **where does the fault live**.
That yields the taxonomy below. The names matter less than that the set is closed and each
member is distinguishable in code.

- **Unreachable.** No response at all — connection refused, name resolution failure, socket
  error. The callee is not running or not listening. *Response:* start it. Safe to retry
  once it exists; the instruction provably never ran.
- **Timed out.** The connection was accepted, the instruction was taken, and nothing came
  back inside the bound. *Response:* look at what the callee is doing. **Not** safe to
  retry a non-idempotent instruction — this is the one case where you genuinely do not know
  whether the work ran.
- **Aborted.** Your own side cancelled — the caller's signal, a shutdown, a user
  navigating away. *Response:* none; this is not a failure of anything. Same
  did-it-run ambiguity as a timeout, and it must never be reported as the callee's fault.
- **Malformed body.** The callee answered, with a status, and the body was not the agreed
  envelope. *Response:* fix the callee. Never retry — it will answer identically. Echo a
  bounded snippet of what actually arrived; that snippet is usually the whole diagnosis.
- **Protocol rejection.** The callee answered with an explicit refusal at the envelope
  level: a bad request, a rejected authentication, an unknown operation. *Response:* fix
  the caller. Never retry unchanged.
- **Executed and raised.** The instruction ran on the callee and threw. This one is *not a
  transport failure at all* and its absence of a transport kind is the signal. *Response:*
  fix the instruction or the code it called. The callee is healthy.

## Procedure

**1. Make the kind a field on the failure, not a substring of a message.** A discriminated
result — success, or failure with an optional kind — lets callers pattern-match without
parsing prose. Reserve *no kind* for the last case: an error with no transport kind came
from the callee's own execution, and that absence is the load-bearing distinction between
"fix your script" and "start the application".

**2. Keep the reads outside the send's error handler.** Read the body and parse it in a
separate step from the call itself. When both live inside one catch block, "the callee is
not running", "it never answered", and "it answered with garbage" collapse into one
indistinguishable throw — which is exactly how the taxonomy gets lost in practice, one
convenient try block at a time.

**3. Distinguish your own deadline from the caller's cancel before classifying.** Both
surface as the same abort at the transport layer. Track which fired: a flag set by your
timer, checked before you inspect the caller's signal. Get this wrong and every user
navigation is logged as a callee timeout.

**4. Carry a second, orthogonal bit: was the callee reached at all.** Some consumers only
need "should I go look at the application" and that is exactly the *reached* axis —
unreachable and timed out mean go look; malformed and rejected mean the application
answered and the fault is inside it. Deriving that bit once beats every consumer
re-deriving it from the kind.

**5. Put the identifying detail in the message.** Which operation, which bound was
exceeded, which status arrived, a truncated echo of the body. Bound the echo — a couple of
hundred characters — so a failure cannot flood a log with the callee's output.

**6. Write the retry policy as a function of the kind.** Not a wrapper that retries
everything. Unreachable: retry with backoff. Timed out: retry only if idempotent. Aborted:
never. Malformed or rejected: never. Executed-and-raised: never automatically.

## Decision rules

- If you cannot tell two kinds apart at the point of failure, you cannot report them apart
  later. Classify at the boundary, where the information still exists.
- If a kind would be *unknown*, say unknown. Guessing at a classification is worse than an
  honest gap, because it will be believed.
- If the instruction is not idempotent, a timeout must not be auto-retried; surface it and
  let a human or an idempotency key decide.
- If a message names a cause, that cause must be one you actually observed. The failure
  report is a verdict about a specific call and is bound to what that call returned.
- If the callee is driven through a proxy or several layers, each layer preserves the kind
  rather than flattening it to its own generic error. A taxonomy destroyed at any hop is
  destroyed for everyone above it.

## When not to use this

**Fire-and-forget notifications** where nothing downstream depends on the outcome do not
need six kinds; one "did not send" is enough. The taxonomy earns its cost when a human
will read the failure or a policy will branch on it.

**Callees that already return a structured status** for their own execution errors do not
need a transport kind for those — the point of the taxonomy is precisely to keep the
callee's own error channel unpolluted by transport noise, so that an error arriving through
it means what it says.
