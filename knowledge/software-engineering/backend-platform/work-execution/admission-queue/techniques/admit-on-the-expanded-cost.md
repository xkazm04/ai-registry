---
layer: technique
type: technique
subject: admission-queue
technique: admit-on-the-expanded-cost
status: forged
laws: [gate-sees-target, limits-are-derived, unknown-is-not-a-value]
shared_with: []
applied: code
ab_verdict: better
use_when: [a payload is compressed, encoded or nested and something downstream expands it, sizing a cap for a decoder or a parser rather than for a transfer, a byte ceiling is the only thing standing in front of an expensive load, the budget the work is judged against is measured after the work has been done, a request supplies the dimensions its own cost is computed from]
---

# Admit on the expanded cost

A door that bounds transferred bytes has bounded the transfer. Whether it has bounded
anything else depends on a ratio nobody wrote down: how much of the expensive resource
one transferred byte becomes. When a payload is delivered in one representation and
consumed in another — compressed to decoded, encoded to parsed, declared to
materialised — the transfer unit and the cost unit are different units, and a ceiling
spelled in the first is a claim about the second that the door never checks.

[resource-denominated-bounds](./resource-denominated-bounds.md) already names the unit
as a choice and answers expansion with a multiplier: divide the ceiling by the
amplification factor once, at derivation time, and charge each arrival its plain
measured size. That is right while the multiplier is a property of the system. It
inverts the moment the multiplier is a property of the *arrival* — because then the
sender picks it, and no fraction of the budget is small enough.

## The ratio is not a constant, and a sender who chooses it has no ceiling

Two readings, both cheap, settle whether a multiplier can carry the bound.

- **Measure the ratio across the real corpus first.** Across sixty stored deliveries of
  one asset class, transferred bytes per unit of downstream cost ranged over a factor of
  thirty-four, and byte size did not even *order* the deliveries by the cost they
  imposed: one delivery five times smaller than another carried six times more of the
  resource the consumer spends. A single multiplier fitted to that distribution is
  either useless or wrong, and the byte ceiling in front of it admitted a hundred and
  thirty-five times the largest budget anything downstream would grade against.
- **Then ask what the ratio's upper bound is, not its observed range.** The observed
  spread is a measurement of honest traffic. Where the expansion is driven by a field
  the sender supplies — a declared extent, a repetition count, a nesting depth — the
  ratio has no upper bound at all, and the door's arithmetic is the only thing between a
  few hundred transferred bytes and an allocation of arbitrary size. An observed
  distribution cannot bound an adversarial one, and a multiplier derived from the first
  is presented as if it governed the second.

## There is a third state between measurable and unmeasurable at the door

The choice is usually written as two: either the exact cost is knowable at the door and
is charged, or it is not and the door keeps counting something cheaper and says so. A
third state sits between them and is where most expanding payloads actually live — **the
cost is not measurable at the door, but it is *declared* there.** Containers carry their
own inventory: element counts in a header, extents in a leading descriptor, a manifest
ahead of the payload it describes. Reading that costs a bounded prefix, not the
expansion.

Three disciplines make the reading safe, and each one is a failure that happens without
it.

- **Bound the prefix by what has already been admitted, never by what it claims.** The
  descriptor states its own length, and that statement is a hint exactly as the declared
  transfer size was a hint: a length longer than the bytes in hand is a refusal, not a
  read.
- **Compare a running total; never complete one.** Counts come from the request, so
  summing every declaration and comparing afterwards gives the arrival control of an
  intermediate value that the comparison then reads. Stop at the first total that passes
  the budget. A count that is not a legible non-negative integer aborts the read rather
  than being coerced to one.
- **Derive the budget from the number the consumer is actually judged by**
  ([limits-are-derived](../../../../_laws.md#limits-are-derived)), with the headroom
  stated separately. A second copy of that number at the door is a copy that will drift,
  and the drift is invisible — the door keeps admitting deliveries the grader behind it
  has started refusing.

## A declaration is a hint, so the door reports it rather than certifying it

A container declares what it contains, and nothing at the door can confirm the
declaration without paying the expansion it exists to avoid. That is not a reason to
skip the check — a bound on the declaration still refuses everything that admits to
being too large, which is every accident and every unsophisticated abuse. It is a reason
to be exact about what the check bought: it bounds the *claim*, and the claim can
understate.

So the door carries the declared figure forward with the admitted work, and the stage
that materialises the payload compares what it actually got against what was promised.
That comparison is the real enforcement, and it is the reason the claim is worth reading
at all. **Every step that changes the cost re-checks it against the remaining budget,**
not just the first: an expansion that happens in stages — decode, then transform, then
transform again — has a cost that grows after admission, and a budget consulted only at
the door is a budget for the arrival rather than for the work. A step that cannot
re-check is a step that must not run inside the budget.

## The comparison must not be able to overflow into permission

Where the cost is computed from several dimensions the request supplies, the *shape of
the arithmetic* is part of the guard. A product of request-controlled factors, evaluated
in fixed-width arithmetic, wraps — and a wrapped product is small, so the check returns
true and admits precisely what it exists to refuse. Measured on two dimension pairs
whose true cost was two hundred and fifty-six times the budget: the product form admitted
both; the same numbers in a wider type refused both, which is what proves the difference
was the wrap and not the policy.

Write the comparison so no product is ever formed. Divide the budget down by each
factor in turn and compare the remainder against the last — division shrinks, so nothing
can grow into the headroom the budget was meant to withhold. A checked or saturating
multiply is the same fix wearing different clothes and is equally correct; what is not
correct is a plain product, a widening cast that is one dimension short, or a guard whose
safety depends on the dimensions being small, since bounding the dimensions is what the
guard was for.

## Unmeasured is not compliant, and it is not a refusal either

Some deliveries are simply not readable at the door: a variant of the format the parser
does not know, a legitimate alternative encoding, a body that is what it says it is but
not what this reader was written for. A door that treats an unreadable declaration as
zero has turned silence into compliance
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)); a door that
treats it as infinite refuses honest traffic to no purpose.

The third answer is to admit it on the ceilings that still apply, record *unmeasured* as
its own state, and let the downstream measurement be the enforcement for that path.
The rate of unmeasured admissions is then a number worth watching: rising, it means
either the format has moved or somebody has found the reader's blind spot, and both are
answered by extending the reader rather than by widening the budget.

## Where the transfer unit is still the right one

- **The expansion ratio is bounded by the format** and the bound is small. A fixed-width
  encoding, a length-prefixed record, a representation that cannot exceed a stated
  multiple of its input — here the multiplier is a property of the system, the byte cap
  carries the bound, and a second gate is cost with no benefit.
- **The transfer itself is the expense.** Where the resource being protected is the
  bandwidth or the buffer, bytes are not a proxy for the cost, they are the cost, and the
  door belongs exactly where
  [resource-denominated-bounds](./resource-denominated-bounds.md) puts it.
- **No declaration exists and the prefix cannot be read cheaply.** A stream with no
  inventory ahead of its payload leaves nothing to check at the door. The honest design
  then puts the whole budget on the incremental measurement, aborts mid-expansion when
  the running total crosses it, and accepts that the refusal is a receipt rather than a
  defence ([gate-sees-target](../../../../_laws.md#gate-sees-target)) — which is worth
  saying out loud, because it is the case where the bound costs real work to enforce.
