---
layer: technique
type: technique
subject: outbound-notifications
technique: destination-guard-integrity
status: forged
laws:
  - gate-sees-target
  - one-validation-door
  - creation-names-reaper
shared_with: []
use_when: [dispatching to an endpoint a user or operator supplied, writing a guard that validates a hostname before a request, a private address range passed a public-address check, a guard mutates a shared client to enforce itself, deciding whether a destination check belongs per call or per client]
---

# Destination guard integrity

Every channel in this subject sends to an address somebody typed in. That is the
subject's premise — you own neither end of the last hop — and it is also an
inbound attack surface pointing the wrong way: a destination field is an
instruction to make a request *from inside the deployment*, to wherever the
value says, carrying whatever credentials the network position implies. The
internal metadata endpoint, the unauthenticated admin port, the database that
trusts its subnet: all of them are reachable from the sender and none of them
are reachable from the person who supplied the address.

So a destination guard sits in front of the dispatcher. The mistake this
technique exists to prevent is not omitting the guard — teams write it — but
believing a guard that has one of two structural defects, both invisible in
review and in tests, because both need concurrency or an adversary to appear.

## The check must be the thing the connection uses

The naive guard resolves the hostname, inspects the addresses, decides the
destination is public, and then hands **the hostname** to the HTTP client. The
client resolves it again. Between those two resolutions sits an interval the
guard does not control, and a name's answer is allowed to change inside it — a
low time-to-live record, a round robin, or an adversary answering with a public
address for the check and a private one for the connection. The check passed on
one address and the request went to another
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The correction is to make the two the same event: **the resolution that decides
accept-or-reject is the resolution the connection is pinned to.** Validate the
addresses, then connect to *those addresses* rather than to the name. Two
details keep that from breaking the request:

- **The name still has to travel.** Certificate validation and virtual hosting
  both key on the hostname, so the connection presents the real name in the
  transport-layer server-name field and the host header while opening the socket
  to the validated address. A guard that connects to an address and also *talks*
  to it as an address breaks certificate checking, which teams then disable,
  which is worse than the bug being fixed.
- **Every hop is a new decision.** A redirect is a fresh destination supplied by
  a party you already decided not to trust. The guard re-validates and re-pins
  per hop, or the first response's location header walks the request to the
  address the first check refused. Redirect following defaults to on in most
  clients, which is what makes this the common escape.

## The pre-flight check is not made redundant by the pinned connection

Reading the rule above as "so delete the up-front validation" is the wrong
lesson, and it opens a different hole. A connect-time guard can only veto what
it is asked to resolve, so the two layers cover **disjoint** sets and a mature
implementation runs both:

- **An address supplied as a literal never reaches the resolver.** There is no
  name to look up, so a resolver-based guard is not consulted at all and the
  request proceeds. This is the single most common destination an attacker
  supplies, and it is invisible to the layer that looks strongest.
- **A scheme that is not the one you meant** — a file, a local socket, a
  legacy protocol — is decided before any resolution happens.
- **A name that resolves differently from where the code runs.** A metadata
  hostname that fails to resolve on a developer machine resolves inside the
  deployment network; a check that only rejects the *resolved* address is
  fine locally and useless in production, whereas a name-level denial holds
  everywhere.
- **A resolution failure needs a verdict.** Fail closed, explicitly. Guards
  built only at connect time inherit whatever the client does with a lookup
  error, which is usually to surface a network error the caller retries.

So the pre-flight validator owns the cases DNS never sees, and the pinned
connection owns the window between the check and the socket plus every redirect
hop. Neither is a substitute for the other, and a design carrying only one of
them should be able to say which set it is not covering.

## An address is not public because the standard library says so

The predicate underneath the guard is a classification of address ranges, and it
is nearly always borrowed from whatever the runtime offers as "is this private".
Those helpers encode the classic private ranges and stop. Carrier-grade address
space — allocated for provider-side translation and now routinely used for
container and cluster networks — is not classified as private by several of
them, so a name resolving into a cluster's own pod network reads as public and
the guard admits it. Link-local, unique-local, mapped and translated forms of
the same addresses are the other recurring gaps, and a name that resolves to
several addresses is admissible only if **every** one of them passes.

Own the range list rather than inheriting it. It is a small, explicit,
commented table, it is the one place a new range gets added
([one-validation-door](../../../../_laws.md#one-validation-door)), and the test
that matters asserts refusal for each range by name — because a range nobody
listed fails open silently, and the deployment where it matters is the one
running inside the network that uses it.

## A guard that borrows the caller's client owns three bugs it did not write

The pinning above has to be installed *somewhere*, and the cheap place is the
client object the caller handed in: swap in a connection adapter for the
duration of the request, then put things back. This works, ships, and passes
review. It also acquires three defects that have nothing to do with destination
validation and everything to do with mutating shared state — and each one is
found later, by someone reading the guard for an unrelated reason:

- **The thing you replaced still exists.** Installing an adapter over an
  existing one usually *drops* the old one rather than closing it, and a dropped
  connection pool is a leak, not a collection. On a multi-hop redirect chain
  that reinstalls per hop, the leak is per hop
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). Tag what
  you install, close what you displace.
- **Two callers sharing one client interleave.** Install-request-restore is a
  three-step sequence on shared state with no atomicity. Two guarded calls on the
  same client from different threads produce a window where one call's request
  runs under the other's pinning and header — which is not a performance bug, it
  is one request being sent to another request's validated address. Serialize
  per client.
- **Restore means the caller's prior value, not the default.** The cleanup step
  is written as "remove the header we set", and that is wrong whenever the
  caller had already set one for their own reasons. Capture the prior state
  before mutating and put *that* back — present as present, absent as absent.
  The bug only fires for callers who configured something, which is to say the
  sophisticated ones.

All three disappear if the guard constructs its own client per request instead
of borrowing. That costs a connection pool and buys the absence of an entire
class; borrow only when a caller's client carries authentication or proxy
configuration the guard genuinely needs, and then accept that the three rules
above are now part of the guard.

## Decision rules

- **Validate and connect in one act.** Any re-resolution between the check and
  the socket reopens the check.
- **Keep the pre-flight check anyway.** A literal address never reaches a
  connect-time resolver, so the layer that looks weaker is the only one
  covering the commonest hostile input.
- **Present the name, connect to the address.** Otherwise certificate validation
  breaks and somebody turns it off.
- **Re-validate every redirect hop.** The location header is attacker-supplied
  by definition.
- **All resolved addresses must pass, not the first one.**
- **Write the range table down; do not inherit "is private".** Carrier-grade and
  cluster ranges are the ones runtimes miss.
- **A guard that mutates a shared client must tag, close, lock, and restore the
  prior value** — or must not borrow the client at all.
- **Test the refusals by range, and test the concurrent case.** A destination
  guard with only happy-path tests has been tested for the behaviour nobody
  attacks.
