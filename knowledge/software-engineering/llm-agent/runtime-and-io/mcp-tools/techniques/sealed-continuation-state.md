---
layer: technique
type: technique
subject: mcp-tools
technique: sealed-continuation-state
status: forged
laws: [gate-sees-target, identity-survives-reuse, record-precedes-effect]
shared_with: []
use_when: [carrying half-finished work across a call boundary without a shared store, a resumable operation that must survive an instance restart or a rolling upgrade, handing intermediate state to an untrusted caller to carry back, deciding whether an opaque token needs signing, a continuation that must be used at most once]
---

# Sealed continuation state

When a protocol removes its own place to keep half-finished work — no
session, no held connection, no store shared between replicas — the work
still has to survive between the round that started it and the round that
finishes it. The remaining carrier is the caller. So the callee seals its
intermediate state into an opaque blob, hands it over, and requires it back
verbatim on the next call.

This looks like the handle pattern and is its opposite, and the difference
decides the whole security argument.

> **A handle is a *reference* to state the server holds. A continuation is a
> *carrier* that IS the state. Forging a reference reaches somebody else's
> data; forging a carrier authors data inside your own execution.**

"Bind every handle to the principal you verified" is necessary for both and
sufficient only for the first. There is nothing to bind a carrier *to* — the
server never stored anything to compare against, because not storing it was
the entire point. The integrity has to travel with the value.

## What a carrier costs

Five obligations, and the ordering matters because each one closes a hole the
previous one leaves open:

1. **Treat it as caller-authored input, always.** It arrived over the wire
   from a party you do not trust, whatever you believe you put in it. Parse
   it defensively and never let its contents skip a check the original
   request would have faced
   ([gate-sees-target](../../../../_laws.md#gate-sees-target)).
2. **Integrity-protect it whenever it influences anything.** Sign or
   authenticate-and-encrypt it, and reject what fails verification. The
   exemption is narrow and worth stating so people can rely on it: you may
   skip this only when tampering can cause nothing worse than the request
   failing. The moment the blob decides an authorization, names a resource,
   or carries a price, it is signed.
3. **Bind the principal inside the protected payload**, and refuse a
   continuation presented by anyone else. Put the identity *in the sealed
   part*, not beside it — a principal in the clear is a hint, not a binding,
   and it also leaks who the caller is to anyone who sees the value.
4. **Bind the operation, not just the identity.** Carry the method and a
   digest of the arguments that mattered, and refuse the blob on a request it
   does not match. Without this, a continuation minted for a cheap operation
   is replayable into an expensive one by the same, correctly authenticated,
   principal.
5. **Expire it.** A carrier that never goes stale is a credential you did not
   mean to issue and cannot revoke, because revocation needs a record and the
   whole design was to avoid keeping one.

## The property sealing cannot buy

All five together bound the replay window and stop cross-principal and
cross-operation reuse. **None of them makes the continuation single-use**, and
this is the honest limit that a design will otherwise discover in production.
At-most-once is a claim about history, history is a record, and a record is
the server-side state the seal exists to avoid. So: if the operation must
happen at most once, the server keeps a record — a consumed-token set, a
sequence number, an idempotency key — and pays the storage it was trying not
to pay. State that explicitly at design time
([record-precedes-effect](../../../../_laws.md#record-precedes-effect)),
because the alternative is a system that is idempotent in testing and
double-charges under a retry storm.

The useful move is to notice that most continuations do *not* need it, and to
name the few that do rather than making every blob single-use by reflex.

## Opacity is a contract in both directions

The caller must not parse, interpret or modify the value, and must not
invent one where none was issued. That is not decoration: the moment a client
reads a field out of the blob, the field's format is a published API, and the
server can no longer change its own internal state shape without breaking
callers who were told not to look. Make the value genuinely opaque —
encrypted, or at minimum encoded so casual inspection yields nothing — so the
prohibition is enforced by the value rather than by the documentation.

Two shapes that fall out of the same design and are easy to miss:

- **A continuation with no question attached is legitimate and useful.** An
  overloaded instance can seal its progress and hand the work back rather
  than failing, letting the next call land anywhere in the fleet. That is
  load-shedding for free, and it only exists if "here is state, no question"
  is a valid reply.
- **Rolling upgrades are the case that justifies the whole design.** Round
  one lands on the old build, round two on the new one. The continuation is
  what stops the new build from re-asking a question the user already
  answered — so the blob's format needs its own version field, and the
  reader needs a rule for a version it does not recognise (reject and restart,
  never best-effort).

## When NOT to use this

If a shared store is already there and already required for something else,
sealing buys little and costs a signing key with rotation. And if the state
is large, the wire cost is paid on every round trip by every caller —
sealing is for the *decision* state (which step, which principal, what was
already answered), not for the payload. A continuation that grows with the
data is a store with extra steps and worse latency.
