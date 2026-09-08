---
domain: software-engineering
subject: device-pairing
last_touched: 2026-09-04
touched_by: intake
dry_streak: 0
---

# device-pairing

First note. Touched 2026-09-04 by `/intake` from
[[../../sources/2026-09-04-wigolo]]: one reciprocal paragraph appended to
`token-binding-and-transport`. No new techniques, no correction — the file was
right about everything it claimed.

## The finding was a side, not a gap

`token-binding-and-transport` is complete from the **granting** side: born
bound, constraints attach at mint, fingerprint-only storage, the channel-leakage
ranking, show-once display. Every sentence assumes you chose the binding and can
therefore verify it.

A retrieval engine surfaced the mirror problem. Holding a credential that
someone *else* minted, bound to a fingerprint they observed and never disclosed,
inverts the organizing rule: a credential you issued is safe to hold loosely
because the verifier enforces the binding for you, while one you merely received
is refused from the wrong place in a way indistinguishable from expiry. The
holder's obligation is to reconstruct the binding from what it can observe at
harvest and refuse its own reuse on a mismatch.

That mechanism is not a boundary case of this technique — it is a mechanism the
technique never had — so it landed as a technique in
[[contested-acquisition]] rather than as an amendment here, and this file gained
one paragraph naming the side and pointing at it. The v2 rule that decided it:
an amendment is for the boundary case of a mechanism the corpus already models;
a mechanism it does not model gets a technique.
