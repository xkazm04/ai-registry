---
layer: technique
type: technique
subject: session-continuation
technique: advisory-guard-fail-mode
status: forged
laws: [failure-not-empty-success]
shared_with: []
use_when: [a boundary hook blocks the operator on input it could not parse, choosing whether a new interceptor fails open or closed, a checker that throws is silently letting everything through, a hook handler holds the session open past its timeout]
---

# Advisory guard fail mode

Declare each installed hook's role, event and response to instrument failure.
An advisory check that cannot decide should report that failure and release its
own block. A protective check may refuse the protected action. Distinguish
permission to execute an action from permission to stop the agent: refusing an
unsafe write must not force the operator to keep the session running.

## Classification is explicit

Derive fail mode from a reviewed risk class attached to the installed registration
or a validated identity map. Require every entry to be covered. Do not silently
classify a new or renamed entrypoint as advisory because it is absent from a
protective allowlist. Validate event, command, class and timeout metadata before
activation, and make the protective set enumerable.

Once a protected action is refused, a later advisory pass cannot override that
refusal. Diagnostics and cleanup may still run if they cannot execute the denied
action. The actual event contract determines whether the chain stops immediately.

## Parse failures follow the class

A stateless advisory grammar can pass unrecognized or ambiguous messages, with
instrument failures distinguished from an ordinary no-finding result. That is
one implementation, not a rule that every hook reads only the current message.
Stateful continuation and authorization guards legitimately consult durable state;
their missing or stale inputs need declared handling.

Protective checks do not inherit an advisory grammar's fail-open rule. Report
parse failure, exception and timeout as incomplete checks; do not label them
passing evidence. This is [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success).

## Waiting, termination and late writes

A registry-enforced deadline can bound how long the dispatcher waits for a
cooperative asynchronous handler. A promise race does not terminate its loser,
and a timer on the same blocked event loop cannot interrupt synchronous work.
Use cooperative cancellation or process/worker isolation where required, and
reject late writes using the invocation's state/version token.

Clear deadline timers on completion. Unreferencing a timer prevents that timer
alone from keeping a process alive; it does not guarantee the timeout callback
runs or release resources held by the handler. Decide which process must stay
alive long enough to deliver the required verdict.

For a flush or policy decision whose abandonment is unsafe, document the pending
state, external supervision deadline and recovery/escalation path. An exemption
from one hook deadline is not permission to hang indefinitely. See
[honest-hook-registry](../../../runtime-and-io/agent-runtime-assembly/techniques/honest-hook-registry.md)
for the related lifecycle contract.

## Checks

Exercise malformed input, unavailable state, exceptions, asynchronous timeout,
synchronous blocking in an isolated fixture, late completion and hook rename.
Assert the correct action/yield result and a visible diagnostic naming the failed
instrument. Do not reclassify a protective guard just to suppress false positives;
repair its recognition and applicability conditions.
