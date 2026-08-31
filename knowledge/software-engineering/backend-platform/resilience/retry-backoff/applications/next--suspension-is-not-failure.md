---
layer: application
type: application
subject: retry-backoff
technique: suspension-is-not-failure
stack: next
status: forged
applied: experiment
ab_verdict: better
proof: ab-paired
verified_on: 2026-08-31
verified_against: next@16
---

# A classifier that cannot reach its classes

This stack is the good case for the technique's second half and the bad case
for its first, which is why it is worth writing up: it gets the *hard* part
right by configuration and loses the *easy* part in a predicate nobody
re-read.

## What it already gets right

The fetch layer is configured so that starting and resuming are governed by
different predicates — the asymmetry the technique argues for. The first
attempt is allowed to proceed regardless of connectivity (it may be served
from a local layer), while a *retry* additionally requires the environment to
be able to make the call. So a device that goes offline mid-ladder suspends
rather than spinning, and the retry budget is not consumed by an unreachable
network. The error vocabulary also draws the right line: a dedicated
`NETWORK_OFFLINE` code is minted when the failure is the caller's own
connectivity, distinct from a connection the server refused.

Both halves of the technique's attribution rule are therefore present in the
tree already. What is missing is the wire between them.

## The A/B

**Arm A** — the shipped retry predicate: lower-case the error's `message` and
refuse to retry if it contains `401`, `403` or `404`; otherwise retry up to
the cap.
**Arm B** — the same decision taken from the typed fields the error object
already carries: its code, its category, its status.

Both arms were run over **every one of the 39 error codes the codebase
defines**, using each code's own registered description as the message Arm A
would actually receive. The harness asserts its parse before reporting
(the first version silently parsed zero codes and refused to print a result).

**Arm A correctly refuses 0 of the 17 codes that must never be retried.**
Arm B refuses the great majority, and routes one code — `NETWORK_OFFLINE` —
to a suspend state rather than to a failure at all.

The reason Arm A scores zero is structural rather than a matter of degree.
The strings it scans are user-facing copy — *"Sign in to save your rankings,
share lists, and pick up where you left off."*, *"This feature requires
additional permissions."* — because the message field holds a human
description and the HTTP status lives in a separate typed field the predicate
never reads. **The rule cannot fire**
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Every authentication
failure, every permission denial, every not-found and every validation error
is retried to the cap, on a backoff that reaches 30 seconds.

Arm B's residual misses are against a deliberately coarse ground-truth
predicate written for this experiment, not against the tree; the unambiguous
half of the result is Arm A's zero, which does not depend on where that line
is drawn.

## The structural fact

The classification the retry decision needs **already exists, one module
away, and is never consulted.** This is not an absent capability, it is an
unconnected one: the error layer distinguishes offline from refused, carries
a category and a status on every instance, and the retry predicate reaches
past all of it for a substring scan of prose. A team that had never
classified its errors would have the same retry behaviour as this one.

That is the useful negative for the technique. The technique's claim is that
suspension must be spelled differently from failure; this tree proves the
weaker precondition first — **spelling it differently in the error vocabulary
buys nothing until the retry path reads the spelling.** A vocabulary with no
consumer is the same as no vocabulary, and the failure is invisible because
both arms are green: retries happen, requests eventually stop, no test fails.

## What this realization cannot do

The experiment measures *reachability* — can the classifier's rule fire —
not cost. It cannot say how many retries per session are actually wasted,
because nothing in the tree records retry counts by error class. A permanent
error retried three times on a 1s/2s/4s ladder costs seven seconds and three
requests, and how often that happens is unmeasured here.

It also cannot confirm the offline path end to end. The configuration implies
suspension rather than exhaustion, and the code supports that reading, but no
arm of this experiment took a device offline.

## Return condition

Two, in order of cost. First, route the retry predicate through the existing
error code — a few lines, and it is the whole repair. Second, and the one
that makes the technique's record requirement real: count retries by error
class and by outcome, so that *suspended* is distinguishable from *exhausted*
in something an operator can read. Until the second exists, this application
reports a classifier that cannot fire, not a fleet that is measurably worse
off for it.
