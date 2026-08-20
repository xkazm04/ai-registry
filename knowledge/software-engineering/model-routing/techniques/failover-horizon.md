---
layer: technique
type: technique
subject: model-routing
technique: failover-horizon
status: forged
laws:
  - failure-not-empty-success
  - one-authority-per-vocabulary
shared_with: []
---

# The failover horizon

Substituting one candidate for another is only free while the caller has
received nothing. The instant the first byte of an answer is released, the
caller holds a partial response in one model's voice, formatting, and
half-finished sentence — and a substitution after that point is not a retry, it
is a seam. The **failover horizon** is that boundary, and this technique is
about treating it as an explicit state the routing layer tracks, plus the class
of failures that can only be caught while it is still open.

Two subjects meet here and the seam between them is clean.
[Retry-backoff](../../retry-backoff/retry-backoff.md) owns whether a *failure*
is worth attempting again — the transport and status taxonomy, the ladder, the
breaker. This technique owns what the routing layer may still *change* when it
does, and it adds the failure class that a transport taxonomy structurally
cannot see: the call that succeeded.

## Before the horizon, after the horizon

- **Before**: any candidate may be substituted, silently, with the caller none
  the wiser. Everything the routing layer knows — policy, floors, ranking,
  group membership — is still in play. This is the only region where automatic
  failover delivers what it promises.
- **After**: the choices collapse to two, and both are visible. Finish on the
  chosen candidate however badly it is going, or abort with a stated, honest
  truncation. **There is no third option**, and a system that resumes a
  half-delivered answer on a different model has shipped a response written by
  two authors and told the caller it was one.

Because the horizon closes on a timer nobody controls, its position is a
routing parameter, not an accident:

- **A first-byte grace budget** is an explicit deadline. A candidate that has
  produced nothing by then has not started; abandoning it there keeps the
  horizon open, whereas waiting keeps a doomed candidate holding the only
  substitution window the call will ever have.
- **Detection that must run before the horizon closes must hold the first
  frame.** Any check on the *content* of the answer costs the latency of not
  streaming it yet. That is a real price, chosen deliberately and stated —
  not a hidden one, and not a reason to skip the check.
- **A mitigation that consumes tokens is charged against the budget already
  checked.** Anything the layer injects to make a substitution coherent must be
  added to the estimate *before* the candidate is selected, or the routing layer
  approves a call against a window and a quota that its own repair then
  overruns.

## The unusable success

A transport-shaped taxonomy classifies what the protocol reports. It therefore
cannot see the failure mode most specific to this subject: the request
succeeded, the status was clean, and the answer cannot serve the caller. The
recurring forms:

- an empty completion — a well-formed response containing nothing;
- a structured format was requested and prose came back, with no valid
  structure recoverable from it;
- structure that began correctly and was cut off at the output cap, mid-value;
- a tool invocation whose arguments violate the schema the caller declared;
- a tool invocation emitted as prose in a dialect no parser accepts;
- a stream that stalled indefinitely, or ended between one token and the close
  of the object being built.

Every one of these is a **routing signal, not an application error** — another
candidate usually serves the same request correctly — and every one is caught
before the horizon closes, which is what makes recovery invisible. Left
unclassified, they surface to the caller as a successful empty answer, which is
the exact shape law failure-not-empty-success exists to forbid: the failure and
the vacuous success are spelled the same.

They must also join **one taxonomy, not a second one** (law:
one-authority-per-vocabulary). A parallel "content problems" vocabulary beside
the transport classes gives the retry loop two sources of truth about the same
attempt, and they will disagree about whether the attempt counted.

## Reproducible failures do not deserve a second attempt

The retry taxonomy answers "is this worth trying again". This technique demands
the second question: **worth trying again *where*.** A refusal from a shared
quota or a sick endpoint says nothing about the model, so a sibling credential
or a sibling group member is a genuinely fresh attempt. A schema violation, a
truncation at the output cap, or an unparseable tool dialect is **deterministic
in the model** — the same weights behind a different credential will produce it
again, exactly. Retrying there spends a hop, spends latency inside a closing
window, and learns nothing.

The rule: a failure eliminates the narrowest scope its evidence actually
implicates — the credential, the endpoint, the group member, or the model — and
the routing layer keeps a per-call exclusion set so the next candidate is drawn
from what remains. A failure class that cannot say which scope it implicates is
under-specified and defaults to the narrowest, because a too-wide exclusion
silently removes healthy capacity for the rest of the call.

## Decision rules

- **The horizon is state, and the record carries it.** Every substitution is
  logged as pre-horizon (invisible) or post-horizon (a seam the caller saw).
  Without the flag, a rising seam rate is indistinguishable from healthy
  failover working hard.
- **A serial substitution chain has no time bound of its own.** Hop count times
  per-attempt deadline is the worst case, and it is much larger than anyone
  guesses. Bound the whole call by wall clock, check the budget *before*
  starting each hop so a slow attempt is never killed mid-flight, and let the
  first attempt always run.
- **Exhaustion is an outcome, not an error to paper over.** When every
  candidate is eliminated, the failure names the chain — what was tried, what
  eliminated each one — and renders the *honest* reason. A chain that ended in
  a universal capability rejection is a bad request, not a capacity problem,
  and reporting it as the latter sends the caller to retry forever.
- **A client that disconnects is not evidence.** A vanished caller must be
  spelled differently from a slow candidate, or every abandoned request is
  charged to a provider's reliability and the ranking degrades the healthiest
  endpoints under load.
- **Detect after the horizon, still record.** A content failure caught too late
  to act on is worthless to this call and valuable to the next one: it is the
  measurement that fixes the grace budget or eliminates the candidate.
