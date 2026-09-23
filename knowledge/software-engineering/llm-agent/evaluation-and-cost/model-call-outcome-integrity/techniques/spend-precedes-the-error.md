---
layer: technique
type: technique
subject: model-call-outcome-integrity
technique: spend-precedes-the-error
status: forged
laws: [record-precedes-effect, failure-not-empty-success]
shared_with: []
use_when: [a call consumed budget and then failed, deciding the order of the ledger write and the error raise, a budget ceiling can be defeated by failing, reconciling metered spend against a vendor invoice]
---

# Spend precedes the error

A call that failed may still have been billed. The seam writes the ledger entry **before**
it raises, or the cheapest way to spend without accounting is to fail.

## Why the ordering is the whole technique

Spend accounting and failure handling are almost always written by different people at
different times. Failure handling is written first, because it is what makes the feature
work; accounting is added later, on the success path, because that is where the numbers
are. The result is a seam that meters what succeeded and drops what did not.

That is not a rounding error. Several of the most expensive failure modes bill in full:

- a refusal or safety block, where the input was processed and the output suppressed
- an answer that arrived and failed validation
- an attempt stopped by a ceiling, which consumed the entire budget by definition
- a supervising process that was killed mid-call, after the work was done remotely

Each is a case where the money left and the ledger did not move. Worse, each is
*correlated with the conditions the ledger exists to catch*: budgets are exceeded during
incidents, and incidents are when calls fail.

## The rule

On every path out of the seam, in this order:

1. **Extract usage and cost from whatever the response carried**, including a response
   that is about to be rejected. A malformed answer still reports its token counts; a
   refusal still reports what it consumed.
2. **Write the ledger entry**, with the outcome recorded as what it was — void, refused,
   invalid — not as a success.
3. **Then** raise, return, or degrade.

The inversion to watch for is an early return. A guard clause that rejects a response
before the usage extraction has run is the exact shape of this bug, and it is invisible
in review because the guard is obviously correct on its own terms.

## Consequences worth stating

**A budget becomes enforceable.** A ceiling that only counts successes can be exceeded
without limit by a workload that fails, and workloads that fail tend to retry. Ordering
the write before the raise is what makes a spend ceiling a ceiling rather than an
estimate.

**Reconciliation becomes possible.** The gap between a metered total and an invoice is
either sampling error or a systematic omission. If failures are unmetered, it is always
the second, and no amount of investigating the successful calls will find it.

**A failure gains a price.** "This validation error happens twice a day" and "this
validation error costs us this much a day" are different sentences to an operator, and
only the second reliably gets the error fixed.

## Decision rules

- **If the response object exists, meter it.** The question is not whether the call
  succeeded but whether work was performed on the other side.
- **Meter the attempt, not the outcome's usefulness.** A discarded answer is spend.
- **Where the transport reports its own total, prefer it for that call and say so**;
  where it does not, price from usage. Never emit a fabricated figure to fill the column
  — an unknown cost is unknown, and the metering subject owns how that is represented.
- **A killed supervisor is the hard case.** If the seam can be terminated externally,
  size its internal deadline to expire first, so the ledger write always happens inside a
  process that is still alive to perform it.
