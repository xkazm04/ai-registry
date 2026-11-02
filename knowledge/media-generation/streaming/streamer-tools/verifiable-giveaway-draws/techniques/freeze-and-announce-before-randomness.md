---
layer: technique
type: technique
subject: verifiable-giveaway-draws
technique: freeze-and-announce-before-randomness
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [designing the steps of an on-air draw, deciding when the entry list closes, deciding what to say on stream before the result]
---

# Freeze and announce before the randomness exists

Every input the operator controls is fixed, digested and made public **before** the value
that selects the winners exists; the value is then fixed and public before anyone could act
on it. The technique is an ordering rule, and the ordering is the whole proof: the same
steps in another order prove nothing.

## The sequence

1. **Close entry.** No entry is added, removed or re-weighted after this point, for any
   reason, including kind ones.
2. **Freeze.** Serialise the entry list canonically — a stated sort order, a stated text
   encoding, a stated representation of each weight — and compute a cryptographic digest
   over those exact bytes. The frozen list is the input; the digest names it.
   Each entrant is identified by the platform's stable account identifier, not a display
   name: names change between freeze and claim, and two viewers can look alike.
3. **Bind the parameters.** The number of winners, the algorithm version, the freeze time
   (to the whole second), the margin, and the randomness source — the beacon chain's
   identifier, or an operator commitment — go inside the digested bytes. The round itself
   is then *derived*, as the first scheduled round strictly after freeze time plus margin,
   so it is never a free parameter a record could change. A winner count left open after
   freeze is a choice point: "three winners" becomes "actually, four" when the fourth pick
   is the friend.
4. **Announce publicly.** Say the digest (or a short prefix of it), the round and the
   winner count on air, post them where the room can scroll back to them, and render them
   on the overlay. The announcement is a commitment only if the operator cannot revise it
   afterwards; a commitment that lives in the operator's own database is not one.
5. **Wait** for the named round to be published.
6. **Derive and publish.** Fetch, verify, derive, and publish the full record: the
   frozen list bytes, the digest, the round, the beacon value and signature, the algorithm
   version, the winners in pick order.

## Decision rules

- When a viewer asks to be added after close, the answer is no, said warmly and
  explained once. A late addition is indistinguishable, from outside, from a late
  addition made because the operator already knew where the pick would land.
- When the list contains personal data the room should not see, publish a digest per
  entry (a salted hash of the entrant's handle, with the salt revealed per entrant on
  request) rather than skipping the list. An unpublished list cannot be checked for
  completeness by anyone.
- When the frozen list and the published list differ by a single byte, the draw is
  void. Do not "fix" the published list to match: the digest is the authority, and a
  tool that edits the evidence to agree with the result has inverted the proof.
- When the tool restarts between freeze and derivation, it reloads the frozen bytes and
  re-checks them against the announced digest before continuing. Never re-freeze from
  live state; live state has had time to change.
- Write the freeze to durable storage before the frozen value can be used for anything.
  A freeze that exists only in memory can be quietly dropped and redone; a durable line
  cannot, and the derivation step refuses to run against a store that does not hold it.
- Check the clock against the derived round's scheduled time twice: before publishing
  the announcement and again after the publication returns. Publishing is real work —
  storage, events, rendering — and it eats margin; an announcement that completed after
  its round was due is refused, and the attempt is consumed rather than re-announced.
- Keep the announcement's witness — the stream recording, the chat line, the overlay
  capture — with the published record. The record cannot prove its own timing, and it
  cannot prove that no earlier attempt was discarded; only the witness can.

## The naive version

The common design announces nothing: the operator clicks "draw", the tool fetches a random
value, and the result appears. Every step happened, in the right order, inside one
machine — and the room has no evidence the order was what the code says. Ordering is only
proof when each boundary between steps is witnessed by someone outside the operator.

A second, subtler version freezes but announces after the round is out, because the
announcement felt like ceremony and the draw was running late. Freeze-then-announce is
not enough; announce-then-randomness is the property, and the clock decides it.

## What the room needs to see

The announcement is the one moment in the draw where the room's attention is the
instrument. A digest spoken aloud is meaningless to most viewers, and that is fine: a
handful of sceptics need it, and the rest need to see that it was said before the
result. Show the round's countdown on the overlay; the countdown makes the order visible
to everybody, which is the point of saying it at all. Never show winners, a progress bar
that implies a winner is being chosen, or any animation that suggests the operator is
selecting — until the round exists, nobody can know the winner, and the overlay must not
pretend otherwise.

## When not to use it

A draw nobody disputes — a private test, a prize of no value, a pick among teammates —
does not need a public commitment, and staging one is ceremony. But a tool that offers
both modes must label the uncommitted mode plainly on screen; an unlabelled casual draw
borrows the trust the committed one earned.
