---
layer: technique
type: technique
subject: browser-credential-boundary
technique: opaque-upstream-errors
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [a broker route must report an upstream failure, choosing status codes a client will branch on, an error body is about to be relayed verbatim]
---

# Opaque upstream errors

A broker that relays failures faithfully has published your topology. Upstream
hostnames appear in error messages, upstream status text names the product,
upstream error bodies carry request identifiers, internal paths, and sometimes
the very header the route attached. None of it helps the caller — the browser
cannot act on an upstream's internal state — and all of it helps someone
mapping what sits behind your origin.

So the boundary is total: **nothing from the upstream crosses back except a
value from a vocabulary you defined.** The caller learns what it must do next
and nothing about who refused.

## Define the vocabulary before you write the handler

The failures a caller can *act* on are few, and they are the same few across
almost every brokered upstream:

- **You are not signed in** — re-authenticate, then retry.
- **You may not do this** — do not retry; this identity will keep being
  refused.
- **Your request is malformed** — do not retry unchanged; fix the shape.
- **Not right now** — the dependency is unavailable or throttled; back off and
  retry later.
- **Not configured here** — this deployment has no upstream wired at all. A
  distinct member, and worth the seat: it is not a fault, not retryable, and
  the fix is a deployment change rather than anything the caller or the
  upstream can do. Collapsing it into "not right now" sends every client of a
  half-provisioned environment into a retry loop against a dependency that was
  never there, and hides the one condition an operator could fix in a minute.
- **We failed** — an unclassified fault on our side; report it, do not loop.

One more outcome sits outside the vocabulary because it is not an outcome:
**the caller withdrew**. A request the browser aborted — navigation, an
unmounted view, a cancelled search — must be distinguishable from an upstream
failure at the route, or the error rate of a healthy system tracks how fast
users click. Detect the abort before classifying, and report it as a fault of
nothing.

That is the closed set, and it is closed in the strong sense
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)):
one definition of the terms, one mapping onto status codes, every caller
branching on the same values. A route that invents a sixth outcome inline is
how two clients end up disagreeing about what a given code means, and the
disagreement surfaces as a retry loop against a permanent refusal.

Map the vocabulary onto standard status codes rather than a bespoke field —
callers, caches, and client libraries already branch on status, and a
correct status with an opaque body is more actionable than a rich body behind
a blanket server-error code.

## Derive the outgoing status; do not pass it through

The reflex — return whatever the upstream returned — leaks in both directions.
It leaks upstream detail outward, and it imports upstream semantics your
callers will start depending on, which welds their retry behaviour to a
service they cannot see.

Instead, **clamp**: map each upstream status into your vocabulary, and state
the derivation next to the mapping so the next reader knows why an upstream
refusal became the code it became. Two decisions in that mapping are worth
making deliberately, because both are commonly wrong:

- **An upstream authorization failure is your server error, not the caller's.**
  If the upstream rejects the credential the route attached, the caller did
  nothing wrong and can do nothing about it. Reporting that as "you may not do
  this" sends the client into a re-authentication loop for a problem in your
  configuration, and tells the caller that some credential of theirs was
  refused — a fact about your infrastructure they should not receive.
- **Upstream throttling is throttling.** Preserve the *class* — retryable,
  later — because collapsing it into a generic server error costs callers the
  one behaviour that would have helped, and turns a recoverable dip into a
  stampede.

Anything unmapped falls to the generic server fault. Unmapped defaulting
outward to a rich upstream message is the failure this technique exists to
prevent.

## Failure and empty success are different words

An upstream that answers "no results" and a route that could not reach the
upstream must not produce the same response
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)). The
temptation is strong at a broker, because an empty list is a valid response and
a fetch that threw is easy to turn into one — the UI renders "nothing here" and
nobody sees red. That is the most expensive kind of quiet: the caller stops
retrying, the operator sees no error rate, and a dependency that has been down
for six hours looks exactly like a quiet afternoon.

The rule extends to the identity case. "Not signed in" and "signed in, allowed,
zero rows" are different responses; collapsing them puts a sign-in prompt in
front of users with empty accounts and hides genuine session expiry behind an
empty state.

## Opacity is only as strong as the fact's cheapest publication

The rule that catches teams out: a route can refuse to name the upstream in
every error it returns while the upstream's address sits in the shipped bundle
under the public prefix, because the client-side code was written first and the
address looked like configuration rather than a disclosure. The error handling
is then a ritual — anyone curious reads the bundle instead.

So the check is not "does the error leak the host". It is **"is the host
already published somewhere cheaper"** — the bundle, a health endpoint, a
cross-origin policy header, a certificate transparency entry, a redirect. If it
is, either accept that the topology is public and stop paying for opacity you
do not have, or move the address to the server side in the same change that
hardens the errors. Half a boundary costs the same as a whole one and protects
nothing.

## The other half: what the server keeps

Opaque to the caller is not opaque to you. Everything stripped from the
response is logged server-side with a correlation identifier, and the response
carries that identifier so a support conversation can join the two. This is
what makes the opacity affordable: the information still exists, in the place
where the person who can act on it can read it, and the caller carries only a
token that means nothing to anyone who intercepts it.

Two disciplines keep that half honest. The correlation identifier is **opaque
and minted here** — not the upstream's request identifier, which is a detail
about the upstream. And the log line is written as though a screenshot of it
will end up in a ticket, because it will: no credentials, no full request
bodies from calls that carry user content.

## When not to be opaque

**Within a trust boundary you own on both sides.** Service-to-service calls
inside one deployment, where both ends are yours and neither is reachable from
a browser, are better off with detailed propagated errors; opacity there costs
debugging and buys nothing.

**For the caller's own validation failures.** If the route itself rejects a
request — a path segment not on the allowlist, a body that fails schema
validation — say precisely what was wrong. That is your own boundary reporting
on your own contract, and vagueness there is not security, it is a support
burden. The opacity rule is about the *upstream*, not about hiding your own
route's rules from the client that must satisfy them.

**In development, deliberately and behind a switch.** A local mode that
surfaces upstream detail is legitimate; a production path that does so because
the switch defaults the wrong way is the incident. Default to opaque, and make
the verbose mode impossible to enable by accident.
