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

A harness with one hook at the turn boundary soon has twenty: a plan-drift
guard, a write-freshness gate, a tool allowlist, a secrets scanner, a
continuation enforcer. Each can block a stop or a tool call; each can throw;
each can hang. The question this technique answers is what each one does when
it cannot decide — and the answer is **derived from a declared risk class**,
not chosen per handler by whoever wrote it last.

## Two costs, and the question that separates them

security's failure-direction technique is unambiguous: every degraded state on
an authorization path resolves to refusal, because a fail-open interval is a
disclosure — invisible, unbounded, and impossible to undo. That rule is right
for its path and wrong when imported wholesale into the turn boundary. The
discriminating question is: **what does the wrong direction cost, and can it
be undone?** For an authorization decision the fail-open interval leaks
something that cannot be un-leaked. For an advisory guard — one whose job is
to keep the model on plan, to nudge it back to a task, to warn about a stale
read — the fail-closed interval is a *stuck operator*: a session that refuses
to end because a drift checker could not parse a message, a tool call blocked
because a registry lookup timed out. That cost is bounded, visible, and
recoverable, but it lands on the person who has the least ability to fix it
from inside the session, and a turn-boundary hook cannot know enough about
the situation to do better than pass. So the advisory class fails open.

## Every interceptor declares its class

The registry of hooks — the one place that lists what runs at each event —
carries, per entry, a **risk class** from which the fail mode is derived:

- **advisory**: fails open. A parse failure, a timeout, an exception in the
  checker, an input outside its model, all pass, each with a diagnostic.
- **protective**: fails closed. Reserved for the guards whose fail-open
  interval is irreversible — a destructive-command block, a secret-exfiltration
  gate — and their number is small.

The fail-closed set is **enumerable from the registry**, which is the property
that makes the design reviewable: a reader can list which hooks can trap the
operator without reading each handler, and a new hook that wants to block on
uncertainty has to say so in the one place a reviewer looks. A harness where
that set can only be discovered by reading twenty handlers has no fail-mode
policy, only twenty opinions.

The registry is **derived from the installed registration**, not maintained
beside it. The class is assigned by convention from the entrypoint's identity
— a short, explicit map of the hard-risk entrypoints, with everything not in
the map advisory — and the fail mode is a function of the class, so there is
no second table that can drift from what is actually installed. A drift guard
compares the derived registry against the installed registration on every
build and reports an unknown event, an unparseable command or a missing
timeout as a finding. When a protective guard does fail closed, the chain
stops there: later hooks on the same event do not run, because a decision
that has already refused must not be overridden by an advisory pass further
down the order.

## Anything that blocks is a total function with an accept grammar

A guard that can block at the turn boundary must be a **total function of the
current message**: for every possible input it returns pass or block, never
an exception, never a wait on state it may not have. Its accept condition is
an **enumerated grammar** — the specific syntaxes it recognises as a violation
— and everything outside that grammar passes. Unlisted syntax passes.
Malformed input passes. An uncertain boundary — the message may or may not be
the one the guard is about — passes. Ambiguity is a pass, not a block, because
a block on ambiguity is a block on the operator with no explanation the
operator can act on. The grammar is closed so that its false-positive surface
is knowable: the guard can be tested against every accepted form and against
a sample of everything else, and the second test is the one that finds the
deadlock.

A guard that reads more than the current message — a file, a session record,
the transcript — is reaching for state that may be absent or stale at the
boundary, and its failure on that read is exactly the instrument failure the
next section governs.

## Bounded handlers, and timers that cannot hold the process

Every handler runs under a **declared timeout**, and the timeout is enforced
by the registry, not trusted to the handler. The timer that enforces it must
not itself keep the process alive: an unreferenced timer, or one cleared on
completion, so that a hook whose await never resolves is abandoned at the
deadline rather than pinning the session open. A harness that has shipped a
hook with an unbounded await knows the symptom — a session that will not exit
its turn, no error, no output — and the fix is structural at the registry,
never a per-handler discipline.

## Instrument failure is loud

Fail open is not fail silent. When the checker itself throws — the parser
crashes, the registry lookup fails, the timeout fires — the guard passes *and
emits a structured diagnostic* naming which guard failed, on which event, with
which error. The two outcomes "the guard ran and found nothing" and "the
guard could not run" are spelled differently in every channel the harness
writes, because a session whose drift guard has been crashing for a week
looks, from the pass channel alone, like a session that never drifted
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The diagnostic goes where the operator and the harness's own health surface
can see it; it does not go only into the transcript, which is the one place
the model reads and the operator does not.

## Decision rules

- Give every registered interceptor a risk class; derive its fail mode from
  the class; keep the fail-closed set enumerable from the registry.
- Fail open for advisory guards; fail closed only where the wrong interval is
  irreversible. Ask what the wrong direction costs and whether it can be
  undone.
- Make every blocking guard a total function of the current message with an
  enumerated accept grammar; unlisted, malformed and uncertain input passes.
- Bound every handler by a registry-enforced timeout whose timer cannot hold
  the process open.
- On instrument failure, pass with a structured diagnostic; never pass
  silently.

## When not to use this

Do not classify a guard as advisory to make it stop bothering people. The
class is a statement about the cost of the wrong interval, and a
destructive-command block reclassified as advisory because its grammar was
too broad has had its false positives fixed by removing its purpose. Narrow
the grammar; keep the class.
