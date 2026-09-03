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
use_when: [deciding whether a candidate can still be swapped silently, a clean status whose answer cannot serve the caller, the same failure recurring behind a different credential]
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
[Retry-backoff](../../../../backend-platform/resilience/retry-backoff/retry-backoff.md) owns whether a *failure*
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

Those checks also have a **cadence**, and it is not the same on both sides of
the call. A check on the *request* — a policy scan, a safety classifier, a
validation of what the caller sent — is a property of the request, so it returns
the identical verdict against every candidate; running it per attempt multiplies
its cost by the fan-out of the substitution chain and learns nothing new, which
is decisive when the check is a paid call to somebody else's scanner. So input
checks run once, before the first candidate is drawn, and their verdict rides
the call across every substitution: spend tracks requests admitted, not attempts
made. A check on the *answer* is a property of this attempt and must re-run per
attempt — a new candidate is a new answer, and a verdict carried forward would
be a verdict about a response nobody received. That asymmetry then forces one
consequence: when an output check's verdict sends the call back for another
attempt, it **is** a retry and draws on the same budget a transport failure
would, per
[storm-control](../../../../backend-platform/resilience/retry-backoff/techniques/storm-control.md)
— an outer layer that legitimately re-attempts does not get a second ladder
hidden underneath it. A separate quality-retry allowance beside the transport
one reads as modest in each document and multiplies in production, and the worst
case is then the sum nobody wrote down. Note which cost argument decides which
half: the *scanner-spend* argument decides the cadence, and the *amplification*
argument decides the budget. They are different arguments, and using the first
on the second is how a team concludes that a cheap check deserves its own
allowance.

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

Every form on that list is detectable by **shape**: something is empty, malformed,
truncated, or violates a declared schema. There is a seventh form the list does
not contain, and it is the one the shape tests are structurally unable to reach —
a response that parses, validates, targets an available tool, fills every required
field, and is **wrong**. A stale value returned as current, an argument that is
plausible and incorrect, a tool selected that is semantically inappropriate for
the request. Nothing about its form distinguishes it from a good answer, so no
check on the response alone can find it.

That is why the seventh form needs a different instrument rather than a longer
list, and why it costs more than every check above it. The only portable one is
**agreement across repeated draws**: issue the same request more than once and
require the responses to agree on the parts that matter — the tool's identity and
its arguments after canonicalization — treating disagreement as the signal.
Measured on tool-selection, that check reaches near-perfect precision at useful
recall, and it needs no access to model internals, which is what makes it
available against a hosted candidate at all. Approaches that read the model's own
internal state do exist and score worse; so does asking the model how confident it
is, which on genuinely agentic work discriminates barely better than a coin flip
and publishes no bound on how often it is confidently wrong.

Its price is the honest part: **n draws cost n times the tokens and n times the
latency**, paid before the horizon closes, on a check that a single response can
never justify. That is a different order of expense from the parse-shaped checks
above, and it is why this form is usually left undetected rather than because
nobody noticed it. Spend it where a wrong answer costs more than n draws — an
irreversible action, a figure that will be reported, a tool call that writes —
and accept the exposure elsewhere, deliberately and in writing.

One thing the check must preserve: **a detector that reports only "something is
wrong" cannot route.** This subject already rules that a failure class unable to
name the scope it implicates is under-specified and defaults to the narrowest.
A disagreement signal that does not say whether the draws diverged on the tool,
the arguments, or the answer defaults to the narrowest scope forever, which is
the same as not routing on it.

**Repeated draws are the portable instrument, not the only one.** Where the
request already carries a typed artifact the response can be bound *into* — a
table the caller also holds, a query result, an id from a prior step, a
computed figure — the check is a lookup rather than a redraw: extract the
response's asserted values and match them against that artifact exactly. One
such verifier ran at a fraction of the cost of a frontier call per claim, well
under the price of even one extra draw.

The two are not substitutes, and the choice is made by the request's evidence
shape rather than by budget:

- **Typed evidence co-present with the request** → bind. Cheap per check, and
  it catches the stale or transposed value that redraws may reproduce
  identically, because a model is perfectly capable of being consistently
  wrong.
- **No external ground truth** — a semantic tool choice, a judgment, an
  open-ended answer → resample. It is the only thing left.

Two conditions on the binding path. Its price is **fixed rather than marginal**:
the same verifier needed a hand-built library of domain formulas, a labelled
training set for the part that could not be bound exactly, and it lost several
points when pointed at a generator it was not tuned against — so it is cheap
per query and expensive to stand up, which is the opposite profile to
resampling and changes who should pay for it. And a claim it can only *score*
rather than *look up* is back in similarity territory, so publish the split:
what fraction of the response was bound by value, and what fraction merely
scored. In the measured case that split was roughly even, and the scored half
inherited the error rate of the model doing the scoring.

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
