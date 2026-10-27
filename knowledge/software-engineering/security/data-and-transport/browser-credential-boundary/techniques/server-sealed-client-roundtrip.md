---
layer: technique
type: technique
subject: browser-credential-boundary
technique: server-sealed-client-roundtrip
status: forged
laws: [claimant-does-not-adjudicate, failure-not-empty-success]
shared_with: []
use_when: [the server computes a result the browser carries back on a later request, a save step trusts check results a client submits, deciding between sealing a value and keeping it in server state, a multi-step wizard streams results to the page and acts on them later]
---

# Server-sealed client round-trip

A multi-step flow often produces a fact on the server, hands it to the
browser, and later receives it back as the basis for an action. A checklist
streams one check per request and the final save arrives with every result; a
quote is computed, displayed, and accepted; an eligibility verdict is shown
and then relied on. In each the browser is a **courier** for a value the server
made, and the later request treats what the courier brings as the server's own
earlier finding.

It is not. Whatever arrives in a request body was written by the party sending
it. A client that wants the save to succeed can hand in "check passed" for a
check that failed or never ran, and the save step that believes it has let the
party whose work is being judged decide the verdict
([claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate)).
The naive defence — validate the result's *shape* on the way back in — checks
that a forgery is well-formed.

## The rule: seal what you produced, keep only what still seals

When the server produces a result the client will return, it attaches a
**seal**: a keyed message authentication code over a canonical encoding of the
result, under a key that never leaves the server. On the way back, the server
recomputes the seal over what arrived and keeps only results whose seal holds.
The client can still carry, reorder, drop or display results; it can no longer
manufacture one.

Four details carry the property, and each is a known way to lose it:

- **Canonical encoding.** Serialize with keys sorted at every level (or a
  standard canonical form), so the same result always seals the same and a
  client that merely re-serialized the object in another key order is not
  refused. Sealing the raw bytes the server happened to emit turns every
  harmless transformation into a false rejection — which teams then "fix" by
  loosening the check.
- **Bind the context.** Mix into the seal what the result is *about* — the
  subject it was computed for, the step, the tenant. A result sealed for one
  repository, project or user must not verify for another, or a genuine pass
  from an easy target is replayed onto a hard one.
- **Constant-time comparison after a format check.** Reject a seal of the
  wrong length or alphabet before comparing, then compare in constant time.
- **Drop, count and say so.** An unsealed result is not an error that aborts
  the step and not a silent omission; it is excluded, and the answer reports
  how many were excluded so the interface can re-run them
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
  A save that quietly dropped half its evidence and reported success has
  lied in the other direction.

## The key's lifetime is the seal's lifetime

The simplest key is random bytes generated at process start and held only in
memory. Then **a restart voids every seal**, and that is a feature: no key to
store, rotate or leak, and stale results cannot outlive the process that
vouched for them. The flow must treat a voided seal as "check again", which is
cheap when the checks are cheap and the person is present. Two consequences:

- When the runtime may load one module several times (per route bundle, per
  worker), the key must live in one process-wide place, or the producing route
  and the consuming route hold different keys and nothing ever verifies.
- When there are several server instances, an in-memory key is per instance;
  either pin the session, or derive the key from managed secret material — and
  then the seal needs an expiry inside its payload, because the restart no
  longer bounds it.

## Seal or keep it server-side

A seal is the right tool when the server would otherwise have to store
per-flow state it has no other reason to keep, and the value is small and
self-describing. Keep the value server-side instead, and hand the client only
an opaque identifier, when the value is large, secret (a seal authenticates,
it does not hide — the client reads every field), must be revocable before it
expires, or must be used **at most once**. A seal proves "I made this"; it does
not prove "this has not been used". Where replay within the key's lifetime
matters, add a nonce the server records on first use, at which point the
server-side record was the simpler design.

## When not to use it

When the client is the authority — its own preferences, its own input — there
is nothing to seal; validate it as input. When the later step can cheaply
re-derive the fact itself, re-derive it, because a re-run check is fresher than
any sealed one. And never seal something so the client can be trusted to
choose among sealed values that should not all be available to it: a seal
carries provenance, not authorization.
