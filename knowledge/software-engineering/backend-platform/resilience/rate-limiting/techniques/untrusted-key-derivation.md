---
layer: technique
type: technique
subject: rate-limiting
technique: untrusted-key-derivation
status: forged
laws:
  - gate-sees-target
shared_with: []
use_when: [deriving a limit key from an unauthenticated request, deciding which forwarded headers to believe, a limiter reporting green while one caller floods it]
---

# Untrusted key derivation

Key design begins with a key and asks what it should be made of. This technique
is the step before that one: **obtaining a value worth keying on, from a request
whose every identifying field was written by the caller.** A request is a
document the caller composed. The fields that look infrastructural — the ones
whose names suggest a proxy wrote them — are bytes in that document like any
other, and whether a proxy actually wrote them is a fact about the deployment,
never a fact about the field. So the question is never "which field carries the
client's address" but "what stands between the caller and this code, and what
does it overwrite?" A limiter keyed on a field because of its name is a gate
watching a proxy for the thing it gates (law: gate-sees-target), and it passes
exactly when the proxy diverges from the target — which here is the instant an
attacker decides to set the field.

## The ladder is ordered, and every rung states its warrant

Write the derivation as an ordered ladder, evaluated top down, first hit wins,
with each rung carrying at the site the sentence that says why it is believable.
Four rungs recur:

1. **A verified principal.** An identifier this system minted and then verified
   *this* request against — a session, a credential, an account row. It is
   trustworthy because verification happened, not because a field was present.
   Where it exists, nothing below it is consulted.
2. **The runtime's own connection fact.** The transport peer as the runtime
   reports it, which is not a header and not part of the caller's document. The
   caller cannot choose it; it is nonetheless the address of the *nearest* hop,
   so what it means depends on what that hop is.
3. **The hosting platform's own forwarding field**, admitted only under a
   witness that this code is actually running on that platform.
4. **The conventional proxy fields**, admitted only under an explicit operator
   opt-in that also states its depth.

Below the last rung there is no trusted source at all, and what to do there is
the neighbouring concern — see unattributable-client-bucketing, which is the
only correct destination for a ladder that has run out.

Order the rungs by warrant rather than by convenience, and evaluate them in that
order. A ladder that consults a caller-writable field before the connection fact
has inverted its own trust model and will do so silently, because both rungs
return something that looks exactly like an address.

## A vendor field trusted by name is a bucket-minting lever

The most expensive rung is the third, because it is the one that looks safe. A
hosting platform genuinely does overwrite its own forwarding field at its edge,
so on that platform the field is as good as the connection fact. Trust it by
name — without asking whether you are on that platform — and the same line of
code becomes the opposite of a limit everywhere else: in a preview deployment, a
self-hosted copy, a local runtime, or any path that reaches the origin around
the edge, nothing overwrites the field and the caller writes it freely.

The consequence is not a wrong address. It is that the field sits *above* the
connection fact in the ladder, so its presence overrides the one value the
caller could not choose. A caller who sends a fresh value on every request gets
a fresh bucket on every request, and no bucket's count ever reaches two. The
limiter is then switched off for precisely the caller attacking it and left on
for every honest caller, who sets no such field and shares the fallback — an
inversion of the control, not a degradation of it. And it reports green while it
happens: buckets exist, counts rise, refusals are zero, the dashboard looks
healthy. **A limiter that a request can turn off is worse than no limiter,
because the absence of a limiter is at least legible.**

The gate must therefore be a fact about the runtime, not about the request: an
environment witness the platform sets, a network position, an edge-signed token
— something the caller does not get to author. Where no such witness exists, the
rung does not exist either. Deleting a rung you cannot gate is the correct
outcome; keeping it against a future deployment leaves the lever installed today.

## The conventional fields are an operator's declaration

One field, two deployments, two opposite truths: behind a reverse proxy that
overwrites it, it is the most accurate value available; in front of one, it is
a free-text field. Nothing in the request distinguishes those two worlds, and no
amount of parsing will. So the rung is admitted by configuration — an operator
asserting a fact about their own topology — and the default is off, because the
default is the deployment nobody configured, which is the one running exposed.

Two properties of that opt-in are load-bearing. It belongs to a **deployment,
not to an environment's name**: a preview build or a self-hosted copy that
inherits a production configuration inherits the flag without inheriting the
proxy. And it carries a **depth** — how many hops the operator actually owns. A
chain field is a list the caller starts and each hop appends to, so the trusted
entry is the one that many positions from the *end*; the leftmost entry is the
caller's own claim, and reading it is the worst available choice, because it is
the single value the attacker definitely wrote. An opt-in with no depth trusts
everything appended before it, which on a two-hop deployment means trusting the
caller.

## Canonicalize inside the ladder, before the value is a key

A value that passed the ladder is still text, and text has more spellings than
the thing it names: case, surrounding whitespace, a port suffix, the two
notations for one address family, a trailing separator. Each spelling is a
distinct map key and therefore a distinct allowance, so a caller who cycles
spellings mints buckets even from a rung you were right to trust. Parse the
value, reject what does not parse, render exactly one form, and cap its length
before it reaches any map — an accepted field is as long as the caller cares to
make it, and it is about to become a key in a structure you are keeping.

This is not key design's rule that one derivation serves every door; that rule
is about doors disagreeing. This is the same discipline inside a single
derivation: one spelling, or the minting lever is back with an extra space in it.

## The verdict carries its rung

Return the rung alongside the value rather than a bare string. Provenance cannot
be recovered downstream and the decisions downstream differ by it: a
calendar-horizon quota should decline to charge a key that came from the bottom
of the ladder (key design's horizon rule), abuse tooling must never act on one,
and an operator reading a refusal spike needs to know whether they are looking
at addresses or at guesses. A prefix that names the rung inside the key itself
is a cheap realization and has the pleasant side effect that the two kinds
cannot be confused in a log — but a returned pair is better, because a prefix is
something a later helper can strip and a field is not.

## Testing a ladder

The tests that hold are negative and adversarial, because the defect this
technique prevents is a rung quietly becoming ungated.

- The load-bearing test: a request carrying *every* field the ladder knows, on a
  deployment where no rung is gated in, derives the same key as a request
  carrying none. Assert that the submitted value is **not** what came back —
  a positive assertion about the fallback would still pass if a rung reopened.
- One test per gated rung: absent its witness, the rung does not fire; present,
  it does.
- One test that the connection fact outranks every field.
- Where a rung was opened by an incident, name the incident in the test's title.
  A ladder is refactored by people who never read the comment above it, and the
  title is the part that survives.

## Decision rules

- **Gate on the runtime, never on the name.** A field is trustworthy because of
  what runs in front of it. The admission condition is a fact you can check that
  the caller cannot write.
- **Default the conventional rungs off, and give the opt-in a depth.** Trusting
  a chain without saying how much of it you own is trusting the caller.
- **Delete a rung you cannot gate.** An ungatable rung is not defence in depth;
  it is a bucket-minting lever kept for a deployment that has not happened.
- **Read chains from the far end.** The leftmost entry is the caller's claim.
  Count hops backwards from the hop you own.
- **Canonicalize and cap before the value becomes a key.** One spelling per
  actor, bounded length, malformed values rejected rather than keyed.
- **Return the rung with the value.** Every consumer that treats an inference
  and a verified identifier alike will eventually charge one for the other.
- **Pin the ladder with negative tests.** The assertion that matters is that a
  supplied value did *not* become the key.
