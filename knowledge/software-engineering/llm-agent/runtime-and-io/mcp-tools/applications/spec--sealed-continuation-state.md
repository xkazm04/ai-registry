---
layer: application
type: application
subject: mcp-tools
technique: sealed-continuation-state
stack: spec
verified_on: 2026-09-04
applied: simulation
ab_verdict: better
proof: structural-only
---

# What a protocol demands in exchange for holding no state

Witness: the specification repository at commit `e76e9c5`, protocol
revision `2026-07-28` — normative text plus the wire schema it publishes.
No `verified_against` is recorded because a protocol revision is a date,
not a runtime version.

When the Model Context Protocol removed sessions and the initialization
handshake, it created a problem it then had to solve in the same revision: a
server that pauses mid-operation to ask the caller something has nowhere to
keep the half-finished work. The old answer was a held connection and a
pending-request map on the server. The new one is `requestState` — an opaque
server-minted string returned with the pause and echoed back verbatim on the
retry.

This is the technique's carrier case, specified normatively, and the
specification's own obligation list is the most complete statement of the
price I have found anywhere.

## The obligations, as written

The revision requires, for a value the server minted and the client carried:

- Servers **MUST** treat it as attacker-controlled.
- Servers **MUST** integrity-protect it (HMAC or AEAD) and reject verification
  failures **if it influences authorization, resource access, or business
  logic** — with the exemption stated as a rule rather than left to judgement:
  integrity protection *"MAY be omitted only when tampering can cause nothing
  worse than request failure."*
- Servers **SHOULD** bind the authenticated principal inside the protected
  payload and reject state presented by a different principal.
- Servers **SHOULD** carry a short TTL.
- Servers **SHOULD** bind *the originating request* — "the method name and a
  digest of its salient parameters" — and reject the value on a non-matching
  request.

Clients **MUST NOT** inspect, parse or modify it, and **MUST NOT** send one
where the server issued none.

## The sentence that makes this worth citing

Having required all five, the specification then declines to overclaim:

> "These measures bound the replay window and prevent cross-user and
> cross-request reuse, but **do not by themselves guarantee single-use**.
> Servers for which a given `requestState` must be consumed at most once …
> **MUST** enforce that invariant server-side."

That is the technique's honest limit, stated by the party with the strongest
incentive to not state it. At-most-once is a claim about history, history is
a record, and the record is exactly the server-side state the whole design
existed to avoid. The standard hands it back rather than pretending the seal
covers it.

## The structural fact: the carrier is not a special case of the handle

The corpus already held *possession of a handle is not authentication*, and it
would be easy to file `requestState` under that rule and move on. The tree
says otherwise, and the difference is visible in the schema: a handle is an
ordinary argument the model composes and can see; `requestState` sits on the
request beside `arguments`, is forbidden to the client's inspection, and the
server keeps no record to compare it against. **Binding a handle to a
principal works because the server stored the handle. There is nothing stored
to bind a carrier to** — which is why integrity protection is a MUST here and
merely good practice there.

A second consequence falls out of the same fact and is easy to miss: the
specification's own examples include a `requestState` returned with **no
question attached**. That is load-shedding — an overloaded instance seals its
progress and hands the work back so the next call can land anywhere in the
fleet — and it is only expressible because "here is state, no question" is a
valid reply. A design that models continuations purely as "the pause that
accompanies a question" cannot represent it.

## Where the corpus already had this, and why that was the real finding

This registry was not missing `requestState`. It was documented — accurately,
with the HMAC envelope, the 32-byte key floor, the 600-second TTL, the
domain-separated bind tag so the principal never appears in the wire value,
constant-time comparison and opaque failure reasons — inside a **dated
application about one SDK's transport behaviour**, and framed there as "cross-
call state … echoed back as an ordinary argument."

So the gap was placement, not coverage: the corpus held the best available
implementation of a mechanism it had never stated as one, under a technique
about choosing transports, described using the words of the rule it is an
exception to. That is worth recording as a failure mode of this corpus rather
than of the source — **an application can carry a mechanism the subject never
learned**, and nothing in the structure surfaces it, because applications are
read as evidence for techniques rather than as candidates to become them.

## Limits of this record

`structural-only`. The obligations are read off normative text and a schema;
nothing here measures a forged continuation being rejected. No managed
project in the fleet currently mints one — the tool servers are either
single-process or hold no cross-round state — so the behavioural arm has no
seam to run against. Return condition: the first fleet server that pauses a
call for human input across instances.
