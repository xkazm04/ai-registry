---
layer: technique
type: technique
subject: optional-dependency-degradation
technique: capability-honest-refusal
status: forged
laws:
  - failure-not-empty-success
  - one-authority-per-vocabulary
shared_with: []
use_when: [a route is backed by a dependency this deployment lacks, choosing a status code for "not configured", a batch write half succeeded]
---

# Capability-honest refusal

An unconfigured surface still receives requests. Someone opens the page, a
client retries a stored action, a crawler follows a link, an automated check
sweeps every route. The answer it gives is a contract with three audiences at
once — the calling code, the human reading the screen, and the operator reading
the dashboard — and three of the four available answers are wrong in a way that
costs somebody real time.

- **A generic server error** claims a bug. It invites retries, pages whoever
  owns the error rate, and buries the actual defects under a condition that is
  working as designed.
- **A not-found** claims the resource does not exist. It is false, and it sends
  the investigation to routing.
- **A success with an empty payload** is a fabrication, and the most expensive
  of the three, because nothing downstream can tell it from a genuine empty
  result ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
- **A distinct, retry-shaped refusal with a stable code** is the answer: this
  deployment does not have this capability, here is the machine-readable name
  for that condition.

## The shape of the refusal

**The status** is the transport's "the service cannot handle this right now"
signal — service-unavailable, not internal-error, not not-found. It is
retry-shaped by convention, which is right for the temporary case and needs a
correction for the permanent one, below.

**The code** is a short, stable token from a closed union, carried in the body
beside a human-readable message. It is the field clients branch on, dashboards
group by, and support scripts match. Which makes the discipline absolute: the
union is defined in one place and every producer and consumer derives from it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
a new condition gets a new member rather than being folded into a nearby one,
and **a code is never reworded**. Rewording a code is a silent breaking change
to every consumer that matched it, and it is committed casually because the
change looks like a copy edit. Say so at the definition, in a comment, next to
the union.

**The message** is copy and may change freely. It states the capability, not the
cause, and it never names the variable that would fix it — that belongs in the
server log and the boot summary, where an operator reads it and a stranger does
not. "Waitlist storage is not configured on this deployment" is a message; the
name of the key is a disclosure.

## Permanent and temporary are not the same refusal

A capability that this deployment will never have and a dependency that is down
for ninety seconds can share a status, but must not share a code, because the
client's correct behaviour differs completely. Temporary invites a retry with
backoff. Permanent invites nothing — retrying a deployment-level configuration
gap is a loop that ends only when a human edits an environment. The permanent
refusal's code says "not configured", the client stops, and the surface tells
the user to contact whoever runs the instance rather than offering a retry
button that can only fail.

## Unconfigured is not unauthorized

A gate whose credential is absent has two ways to refuse and only one of them is
true. An endpoint that exists to check a token, given no token to check against,
must refuse as **not configured** — not as an authorization failure. The
distinction is the difference between "this capability does not exist on this
deployment" and "you presented the wrong credential", and collapsing them sends
an operator to hunt for a credential that was never meant to exist while a
prober learns the endpoint is live and merely locked. The ordering in the
handler follows: the configuration check runs first and refuses with the
not-configured code; only if the capability exists does the authorization check
run and refuse with an authorization code. That ordering is also the security
posture — an unconfigured authenticating endpoint is closed, never open.

## Never fabricate, and never round the truth

The rules that keep a refusal honest extend past the not-configured case into
every partial outcome the surface can produce:

- **A read that could not reach its store returns a refusal, never an empty
  collection.** Empty means "we looked and there was nothing".
- **A write that did not land returns a failure, never an identifier the code
  invented** so the client has something to hold.
- **A partial batch reports per item.** When some rows landed and some did not,
  the response carries the succeeded count *and* the failed count, and the
  failed count is the real number — reporting zero failures because the failures
  were caught and logged is the empty-success lie at batch scale, and it is
  usually written by a loop whose `catch` increments nothing.
- **Distinguish a rejection from a fault.** A duplicate entry, a validation
  failure, a constraint violation are the caller's problem and get a
  caller-facing code. An unreachable store, a denied grant, a timeout are the
  deployment's problem and get a different one. A single "could not save"
  covering both makes the support conversation start from zero every time.

## The surface's half

A refusal that only exists at the transport layer produces a button that always
fails. Where the client can know in advance that a capability is unavailable —
because the server told it once, or because a value it can read is empty — the
affordance is hidden or disabled with a stated reason rather than rendered and
left to fail. The minimal instance of this is a link whose destination is
unset: the convention that an absent value resolves to an empty string and every
consumer tests it before rendering removes an entire genre of half-configured
page for one line of code.

Hiding is not the same as lying. A hidden affordance is accompanied, somewhere
an operator can see, by the fact that it is hidden and why — the boot summary,
the configuration document, an operator-only diagnostic. A capability that
vanishes from the interface with no trace anywhere is indistinguishable from a
regression.

## Decision rules

- **One status, one code, per condition** — and the code comes from the closed
  union, never invented at the call site.
- **Never reword a code.** Write that sentence next to the union.
- **The variable name goes to the log; the capability name goes to the user.**
- **A permanent gap and a transient outage carry different codes** even when
  they carry the same status.
- **Failed counts are reported, not zeroed.**
- **A refusal is not an error-rate event.** Route it to its own counter, or the
  first correctly-degraded deployment sets off the alarms.
- **Test the refusal, not just the happy path.** With the dependency
  unconfigured, assert the status, the exact code string, and the absence of the
  variable name in the body. The code-string assertion is what makes the
  never-reword rule enforceable rather than aspirational.
