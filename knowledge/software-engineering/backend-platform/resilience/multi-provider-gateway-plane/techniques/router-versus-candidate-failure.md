---
layer: technique
type: technique
subject: multi-provider-gateway-plane
technique: router-versus-candidate-failure
status: forged
laws: [verdict-survives-boundary, failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [one config error burned every candidate in the fallback list, a dashboard blames a provider for a failure the gateway generated, deciding what breaks a failover loop early, a predicate the router could not evaluate was retried against three upstreams]
---

# Router versus candidate failure

A failover loop exists to survive a sick candidate. A defect in the plane itself
— a config the resolver cannot make sense of, a predicate that cannot be
evaluated, a translation that throws on an unexpected shape, a credential handle
that resolves to nothing — reproduces **identically on every candidate**, because
the candidate was never the variable. A loop that cannot tell the two apart
therefore converts one internal defect into a full sweep of the candidate list on
every request: N upstream calls, N sets of latency, N entries in somebody's
reliability ledger, and a final error attributed to whichever candidate happened
to be last.

The technique is making the attribution a **typed value that survives to the
layer that loops**, and it is worth stating why the obvious carrier does not
work.

## The status space cannot carry it

Both failures arrive at the loop as a response with a status, and the two spaces
are the same space. An internal error the plane generated and an internal error a
candidate returned are the same integer; a timeout the plane imposed and a
timeout the upstream reported are the same integer. The loop's configured rule —
usually a list of statuses worth retrying — reads that integer and cannot ask the
one question that matters, which is *whose failure was this*.

Nor can the body carry it, for the reason the enclosing consumer is usually
configuration rather than code: an operator's retry rule is a list of integers,
and a body parser is not available at that layer. So the marker rides **beside**
the status, as a typed field on the synthesized response — a header, an envelope
flag, a sentinel on an internal result type — placed there by the frame that
knows it generated the failure and read by the loop before it decides anything
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
The marker is the classification; the status is still whatever the failure
deserves.

The failure this replaces is the quiet one: a plane that catches its own
exception, wraps it in a plausible upstream-shaped error response, and hands it
to the loop, which cannot distinguish that response from an answer. The
synthesized failure looks like a candidate's answer because it was built to look
like one — failure spelled as an ordinary result
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)),
manufactured by the layer whose job was to report it.

## The loop gets a second break arm

A single-armed loop stops when a candidate succeeds. A correct one stops on
either of two conditions, and they are spelled differently in the record:

- **A candidate answered acceptably.** Continue no further; this is success or a
  non-retryable upstream answer, per the loop's configured rule.
- **The router failed.** Continue no further *because no other candidate can
  help*; the remaining candidates are untried, and the record says so — untried
  is not the same fact as tried-and-failed, and a reliability measurement that
  conflates them punishes candidates that were never called.

The second arm is what pays for the whole technique. Without it the marker is a
label on a report nobody acts on.

## Deciding which side a failure is on

The classification is not always obvious, and the rule is **who made the claim
the failure contradicts**:

- **Router.** Config resolution, predicate evaluation, credential handle
  resolution, request translation, the loop's own bookkeeping, and any exception
  raised in the plane's code before the upstream call was issued. Also: an
  unhandled exception on the *response* path, which is the case most often
  misfiled, because by then a candidate has answered and the instinct is to blame
  it. If the plane threw while translating a response the upstream delivered
  correctly, the plane failed.
- **Candidate.** Connect refused, resolution failure, transport timeout, an error
  status the upstream returned, a stream that dropped mid-flight, a body that
  violates the upstream's own published contract.
- **Neither, and it needs its own name.** The caller disconnected; the request
  was refused by a policy check before any candidate was chosen; the budget was
  exhausted. Folding any of these into either side re-creates the same
  conflation one level over — the N=1 neighbour's
  [abort-versus-unreachable](../../stream-proxy-hop/techniques/abort-versus-unreachable.md)
  owns the first of them, and its rule (a departed caller is not evidence about
  anybody's health) holds unchanged here.

One class deserves an explicit name because it is unrecoverable by construction:
a failure to **decide** at all. When the structure that selects candidates cannot
produce one — an unevaluable predicate, an empty result from a filter, a
reference to a node that does not exist — there is nothing to retry anywhere,
and the loop must not treat it as a candidate that happened to fail. Give it its
own error type at the point it is raised, so the loop's arm is a type check
rather than a string comparison.

## Attribution is a second axis, not a second taxonomy

The retry neighbour already owns a failure taxonomy — transient, permanent,
rate-limited, unknown — and this technique must not grow a parallel one
alongside it. Attribution is **orthogonal**: every failure carries a class *and*
a side, and the two answer different questions. The class answers "is this worth
trying again"; the side answers "is there anywhere else to try it". A router
failure classified transient is still not retried against the next candidate,
because the next candidate is not a different environment for it.

That orthogonality is also the safest way to keep the marker from becoming a
second vocabulary with its own drift: it is one boolean-shaped fact attached to
an existing classified error, not a new set of codes.

## What the operator gets, and what the caller does not

Router failures are counted separately from candidate failures, always, in a
counter whose name says which it is
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). The
two rates behave nothing alike: a candidate failure rate tracks somebody else's
availability and is expected to move; a router failure rate is a defect rate in
this code and should be flat at zero. Buried in one total, a deployment that
starts throwing on a rare response shape is invisible until it is common.

The marker itself is internal. It describes the plane's own topology and its own
defects, so it is stripped at the outer boundary rather than shipped to the
caller — the non-disclosure discipline the N=1 neighbour states in full
([origin-non-disclosure](../../stream-proxy-hop/techniques/origin-non-disclosure.md)).
What the caller gets is the plane's own error vocabulary and a correlation
handle; what an operator gets, from the private side, is the side, the leaf
address, and the exception.

## When not to use it

- **When there is exactly one candidate.** With nothing to fall back to, the
  attribution changes no decision at request time — though it still changes the
  counter, and the cheap half (a distinct error type for the plane's own
  failures) costs nothing and is worth keeping for the day a second candidate
  appears.
- **When the loop is outside your process.** If the retrying party is the
  caller's own client, a marker it does not read is decoration; the fix there is
  the error vocabulary and the retryability flag the N=1 neighbour specifies, not
  an internal attribution field.
- **Never as a way to suppress errors.** The marker's purpose is to stop a
  *sweep*, not to stop a report. A router failure that breaks the loop is still
  a failure, still counted, still returned. A design that uses the break arm to
  return the last partial success instead has converted an outage into a silent
  wrong answer.
