---
layer: technique
type: technique
subject: generative-artifact-gating
technique: reserve-before-dispatch-stop-latch
status: forged
laws: [a-number-carries-its-unit-and-basis, refuse-rather-than-destroy]
shared_with: []
use_when: [wiring a local spend guard in front of a metered image generator, a quota or rate-limit error arrived mid-batch and the loop kept dispatching, deciding whether an interrupted generator call may be retried, a batch is about to run without a proof image]
---

# Reserve before dispatch, and latch the stop

## The concern

A metered generator is paid per call, and the provider's real allowance is usually
unknown to the line: it sits behind a subscription, a tier, a shared pool or a rolling
window the caller cannot read. A gate on the input
([gate-before-every-credit-spend](./gate-before-every-credit-spend.md)) decides *whether a
call is worth making*. This technique decides *whether the line may make another call at
all*, and it must answer from local state alone, because the only state the line owns is
its own ledger. The failure it closes is the loop that discovers the ceiling by hitting it
repeatedly: one rate-limit error, then forty more dispatches fired by workers that had
already read "ok" a moment earlier.

## What the guard is, and what it is not

The guard is a **local spend guard**. Its cap is a number the owner chose, counted in the
unit the generator bills (images, not tokens, not minutes), per a stated window. It is not
a measurement of the provider's quota and must never be reported as one. Say so in the
ledger itself, next to the cap, and say that earlier usage outside the ledger is *unknown*,
not zero: a guard that implies the account was empty before it started has invented a
baseline ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass) applies to a
quota as to any other measurement). When the real allowance turns out to be lower than the
cap, the latch below is what protects the line, not the cap.

## The procedure

1. **Reserve first, under a lock.** Before any process is started, one critical section
   reads the ledger, checks every refusal condition, increments the reservation and
   appends a durable record. Only after it returns may the call dispatch. A reservation
   taken after dispatch is a log, not a guard, and two workers racing for the last slot
   both win. The lock must be cross-process, not an in-memory mutex, because the workers
   are separate processes.
2. **Check, in this order inside the lock:** the stop latch, the per-slot attempt cap, the
   window cap. Each refuses with a distinct, greppable reason, so a refused dispatch tells
   the operator which rule fired.
3. **Cap attempts per slot across revisions.** The attempt count is keyed on the slot, not
   on the revision identifier. A retry that renames itself `v2` and `v3` must still count
   against the same slot, or the cap is defeated by the retry's own naming.
4. **Latch on the first quota or rate-limit evidence.** The latch is a durable field in
   the ledger, set once, carrying the time and the evidence that tripped it. While it is
   set, every new reservation refuses. Nothing clears it except the owner. Watch for the
   evidence *while the call is in flight*, not only after it returns, so queued work stops
   as soon as the first error is visible.
5. **Charge the uncertain.** A call that timed out, was interrupted, or returned nothing
   decodable may still have been billed. It stays reserved. Do not release the
   reservation, and do not dispatch it again automatically: an unknown outcome is
   resolved by a person reading the provider-side transcript, then closed with a
   revision that is a new, counted attempt. A timeout also latches, because the call's
   cost and the line's state are both unknown.
6. **Prove before the batch.** Before a batch of siblings, one proof image is generated
   and looked at, and its approval is bound to a hash of the batch's inputs and of the
   proof file. If the inputs change, the proof is void. A failed proof stops its batch;
   the absence of a reviewer is not an approval.
7. **A stop still yields a complete report.** Queued jobs refused by the latch return a
   *blocked* record, so the review sheet lists every job with a status. A halted batch
   that silently omits its remainder reads as a smaller batch.

## Decision rules

- **When quota or rate-limit evidence appears, latch; do not back off and continue.** A
  429-class error means a rate window, an exhausted balance or a spend ceiling, and the
  caller cannot tell which. Jittered backoff is the right answer to a rate window and the
  wrong answer to a spent balance, and a generator metered by a ceiling will not produce
  images however politely it is asked. The latch converts an unanswerable question into a
  human decision.
- **Match evidence on error context, not on a bare number.** A status code in a token
  count or a pixel dimension is not an error. Require the number to sit under an error or
  status field, or beside a phrase such as "too many requests"; otherwise the latch trips
  on noise and the line stops for no reason, which teaches operators to clear it casually.
- **When the call count exceeds the contract, latch.** If one job was supposed to make one
  image call and the transcript shows two, the accounting is wrong and further spend waits
  for an audit.
- **Never clear the latch from code.** A reset flag in the driver turns the guard back
  into a suggestion.
- **Raise the cap only by the owner's act, and record who and when.** A cap an agent may
  edit is a number the agent is guarding against itself.

## Measured, simulated, authored

The guard's refusal paths (cap, latch, attempt limit, a concurrent race) are
exercised by tests with a fake generator. What has not been observed is the latch tripping
on a *live* provider error from real exhaustion: the evidence patterns are authored from
documented error shapes, and a provider that words its error differently is a miss. Treat
the pattern list as a hypothesis to extend the first time a real stop is not caught, and
record the transcript when it happens.

## When not to use it

- **A free or local generator.** If a call costs nothing and its output is disposable, a
  reservation ledger is ceremony; the proof image and the attempt cap still help.
- **A provider that exposes an authoritative remaining-quota read.** Read it, and keep
  the local ledger only as a second, stricter bound. Do not replace a measurement with a
  guess.
- **As quota planning.** The cap is a brake, not a forecast of how much the line should
  spend; the expected consumption is a separate estimate and is allowed to sit well below
  the cap.
