---
layer: technique
type: technique
subject: convergence-loop-and-requeue
technique: error-policy-as-a-separate-function
status: forged
laws: [verdict-survives-boundary, failure-not-empty-success]
shared_with: []
use_when: [a convergence pass is growing its own retry delays inside every branch, deciding what happens after a failed pass, retry cadence cannot be tested without running the side effects]
---

# Error policy as a separate function

A convergence pass returns one of two things: a next-look decision, or its
error. It never decides what to do about its own error. That decision belongs to
a second function — given the record, the typed error and the shared context, it
returns the same kind of next-look decision the successful path returns — and
the loop calls it whenever the pass fails.

The split reads as ceremony until the alternative is written out. Folded
together, the retry decision lives inside the pass, which means it lives in
every early-return branch of the pass, which means each branch invents its own
delay, and nobody can enumerate the system's retry behaviour without reading the
whole reconciler. Split apart, retry behaviour is one pure function of a typed
error: a page long, side-effect free, and testable by handing it every error the
pass can raise.

## What each side is allowed to know

The pass knows how to converge. It reads state, computes a difference, applies
it, and returns. When something fails it **returns the failure with its type
intact** — the classification the boundary computed, the status the dependency
returned, the stated recovery time if the dependency offered one. An error
flattened into a string or a generic wrapper at the point of failure has already
destroyed the only input the policy has
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)),
and the policy is then reduced to a constant delay pretending to be a decision.
This is the single most common way the split is implemented and rendered
worthless: the seam exists, and nothing survives it.

The policy knows nothing about convergence. It receives the record — so it can
consult attempt counts or conditions recorded on it — the error, and whatever
shared context the loop carries, and it returns a next-look decision. It
performs no work, calls nothing remote, and has no failure mode of its own,
because a policy that can itself fail turns a failed pass into an unhandled
failure at the worst possible moment.

The loop knows only that a failure produced a decision, and treats it exactly
like a successful pass's decision: it enters the same queue, subject to the same
deduplication and the same earliest-wins rule. A retry that gets a private path
to the executor escapes every guarantee the queue provides, and it is the retry
path — not the success path — where that matters most, because a failing key is
usually a key with other triggers arriving.

## What the policy decides with

The policy is where this subject's borrowed material lands, and it should
borrow rather than restate.
[error-classification-for-retry](../../../../backend-platform/resilience/retry-backoff/techniques/error-classification-for-retry.md)
supplies the classes: a permanent rejection is not retried at all, a
rate-limited response is retried at the time the dependency stated, an unknown
is retried with suspicion and counted separately.
[backoff-design](../../../../backend-platform/resilience/retry-backoff/techniques/backoff-design.md)
supplies the ladder and the jitter, which matter more here than in a
point-to-point client: a converger that fails on a shared dependency fails for
every key at once, and an unjittered ladder converts one dependency blip into a
synchronised wave of passes at every rung.
[storm-control](../../../../backend-platform/resilience/retry-backoff/techniques/storm-control.md)
supplies the budget, and the amplification it bounds is real here — the loop
already re-runs every key on a period, so a retry ladder stacked on top of the
periodic sweep is two independent sources of the same load.

Two rules are this subject's own:

- **The next-look interval after a failure is measured from the pass's
  completion**, not from when it started. A pass that fails after a long timeout
  has already spent that time; adding a full backoff on top double-counts the
  wait, and the effective retry interval becomes the timeout plus the ladder,
  which is not the number anyone configured.
- **The policy must be allowed to give up.** Returning "wait for a change" from
  the policy is the loop's version of a terminal state: this key will not be
  retried on a clock, only when something about it changes. It is the right
  answer for a permanently invalid record — one whose declared state cannot be
  satisfied at all — because retrying it forever burns capacity on work that
  cannot succeed and buries the real failures in the log. Giving up must be
  *visible*: the record carries the reason it stopped being retried, or the
  system has silently lost a key
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## The default policy is the one that matters

Most loops configure one policy for every key, and it is therefore a fleet-wide
default in the sense
[storm-control](../../../../backend-platform/resilience/retry-backoff/techniques/storm-control.md)
means: whatever it says is what the system does under a broad outage. Two
defaults are commonly typed and both are wrong. A fixed short interval turns a
dependency outage into a fixed-rate flood proportional to the number of keys. A
policy that panics or aborts on any error — occasionally written as a
placeholder and never revisited — converts one bad record into a crashed loop
that stops converging every other key. The defensible default is a jittered
exponential ladder keyed on the record's recorded attempt count, with a
permanent-class error short-circuiting straight to giving up.

## The rejected alternative: retry inside the pass

Retrying in place — the pass catches its own failure, sleeps, and tries again —
is the shape this technique refuses, and it has one genuine advantage worth
naming: it keeps in-memory context across the attempt, so a pass that has
already done expensive work does not have to redo it. That advantage is exactly
what makes it wrong here. Holding context across a sleep means holding an
execution slot across a sleep — the key stays in flight, its exclusion is held,
other triggers for it park behind a task that is doing nothing, and the global
cap is consumed by sleeping work. A loop with a cap of eight and three keys
sleeping through a backoff is a loop with five slots. Returning instead frees the
slot, and the re-read on the next pass is the price of a system whose capacity
means what it says.

The narrow exception is a retry *inside one indivisible step* — a single call
whose partial completion cannot be observed and whose second attempt is
guaranteed cheap. Even then the bound is tight enough to hold the slot honestly:
a few attempts over a second or two, never a ladder. Anything longer belongs to
the policy.

## Boundary

Failure classification, the delay mathematics, the breaker and the budget are
[retry-backoff](../../../../backend-platform/resilience/retry-backoff/retry-backoff.md)'s
subject and are not restated here. What this technique owns is the *shape of the
seam* — that the decision is a separate pure function, that its input is a typed
error, and that its output re-enters the same queue as everything else. The
durable side of retries, where the attempt count and the next-attempt time must
survive a restart, is
[durable-retries](../../../../backend-platform/resilience/retry-backoff/techniques/durable-retries.md)'
ground and mostly does not apply: a converger's ladder is in memory and resets
on restart, which is acceptable only because the periodic re-check will find the
key again anyway. Where the ladder must survive — because attempts are
expensive, or because a give-up decision must not be forgotten — the attempt
count belongs on the record, not in the loop.
