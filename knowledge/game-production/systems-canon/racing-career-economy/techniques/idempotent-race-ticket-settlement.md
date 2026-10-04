---
layer: technique
type: technique
subject: racing-career-economy
technique: idempotent-race-ticket-settlement
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a race result writes money to a save, a retry or a restore could pay a race twice, writing the receipt a player reads after a race]
---

# Settling a race once: monotonic ticket, receipt, identity

The named concern: **a race result changes the player's balance exactly one time, however
many times the settlement is attempted.** Retries, restores from a save, crashes between the
balance write and the progress write, and a duplicated end-of-race event all attempt it again.

## The shape

- **A ticket is issued when the race starts.** It is a strictly increasing integer owned by
  the profile, never reused and never decreased. It identifies the race, not the result.
- **Settlement is keyed by the ticket.** The profile records the highest settled ticket, or the
  set of settled tickets, and refuses a ticket it has seen: a second settle returns the stored
  receipt and writes nothing.
- **The receipt is written with the balance.** Gross, repair service cost, repair paid,
  insured remainder, net and the ticket are written in one step. A balance without a receipt
  and a receipt without a balance are both corrupt states.
- **The receipt satisfies an identity.** Gross minus repair paid equals net, and service minus
  paid equals the insured remainder. A check that recomputes both from the stored fields
  catches the class of bug where the displayed number and the credited number come from two
  code paths. Run it on load as well as on write: a save whose receipt violates the identity is
  a corrupt save and is refused.
- **Net and banked are different lines when the wallet has a cap.** Net is what the race
  earned; banked is what fit under the cap. The balance moves by banked, the receipt carries
  both, and banked never exceeds net. Without the second line, a capped player's winnings
  vanish silently.
- **The ticket is bounded on both sides.** A ticket at or below the last settled one is a
  replay; a ticket above the number of races ever started was never issued. Both are refused.
  The refusal may be the stored receipt or an explicit "not settled" signal, but it must be
  distinguishable from a successful settlement and it must change nothing.

## Why monotonic

A random identifier proves a settlement is unique, not that it is fresh. A monotonic ticket
adds ordering: a ticket older than the last settled one is a stale replay, and a ticket far
ahead of the last issued one is corruption. The player's balance is then a deterministic
function of the sequence of settled tickets, which is what makes a save reproducible and a
simulated career comparable run to run.

## Procedure

1. Issue the ticket at race start and persist it before the race can end.
2. At race end, build the receipt from the race result and the damage state. Gross, repair and
   net must not depend on the balance; only the banked line may, and only through the cap.
3. Apply the receipt and the ticket as one atomic write.
4. On a second settle of the same ticket, change nothing and say so. When career progress and
   money settle through two entry points, put the ticket check ahead of both writes, and keep
   one gate authoritative: the second check is a guard, not a second opinion.
5. Test it three ways: settle twice and compare balances; settle, serialise, restore, settle
   again; interrupt after the receipt is built but before the write and replay.

## Decision rules

- **When the end-of-race event can fire twice, the settlement is the guard, not the event.**
  Fixing the event source and leaving the settlement non-idempotent moves the bug.
- **When a receipt line has no consumer, still write it.** The identity needs every line, and a
  later screen will read it.
- **When tickets would be reused after a profile reset, reset the settled record with them.**
  A fresh profile with a stale settled record refuses its own first race.
- **A receipt is a public statement.** Everything on it is a number the player can verify
  against their own balance; do not put an estimate on it.

## Evidence grade

Idempotence and the identity are testable exactly and are measured by property tests. How a
player feels about a receipt is not measured.

## When not to use this

- **When the balance is always recomputed as the sum of stored receipts.** Replay is then
  already harmless; the ticket is an index, not a guard.
- **When there is a server of record.** Then the server's idempotency key is the authority
  and a local ticket is a cache of it; two authorities are a defect.
