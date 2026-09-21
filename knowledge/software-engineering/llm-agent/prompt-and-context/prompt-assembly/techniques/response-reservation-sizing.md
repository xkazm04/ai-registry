---
layer: technique
type: technique
subject: prompt-assembly
technique: response-reservation-sizing
status: forged
laws: [limits-are-derived, count-carries-predicate]
shared_with: []
use_when: [deciding how much of the window to reserve for the response, a platform default sets the output ceiling and nobody chose it, usable input context is short and the prompt is already trimmed, an output ceiling is raised for a capability and never lowered again, the observed output length is recorded but never feeds the ceiling]
---

# Response-reservation sizing

[context-budgeting](./context-budgeting.md) derives the global budget as the
window minus the room reserved for the response minus a margin, and names the
failure at one end: an answer squeezed to nothing. This technique is about the
other end of the same subtraction, which that arithmetic treats as a constant
handed down from somewhere.

It is not a constant. It is a number somebody chose, it is **charged on every
call whether or not it is used**, and on most platforms it is left at a default
that was sized for the longest answer the model could plausibly give rather
than for the answers this system actually gets.

## The reservation is a purchase, not a limit

The word "limit" is what hides this. A limit sounds like something that only
costs you when you hit it — a guard rail, free until it fires. A response
reservation is the opposite: it is subtracted from usable input at request
time, every time, and the calls that stay far below it pay exactly the same as
the call that touches it.

So the reservation has a price with two terms, and they pull in opposite
directions:

- **Set it high** and you pay the difference on every call, in input context
  you cannot use — the history that gets compacted earlier, the retrieved
  material that does not fit, the examples the elastic sections drop.
- **Set it low** and you pay on the tail: the responses that would have
  exceeded it are cut off, and a truncated response is not an error — it ends
  mid-structure and validates
  ([output-budget-signal](../../structured-output/techniques/output-budget-signal.md)).

The asymmetry that decides the shape: **the high setting's cost is certain and
recurring; the low setting's cost is occasional and detectable.** A reservation
you can retry past is cheaper than a reservation you pay for forever.

## Derive it from the distribution, escalate on the cut

Per [limits-are-derived](../../../../_laws.md#limits-are-derived), the number
is computed from a measured property and the derivation lives beside it:

1. **Record the response length on every call**, not only on the truncated
   ones. This is the measurement the sizing needs, and it is usually already
   arriving — the usage figures come back on success too.
2. **Set the reservation near a high percentile of that distribution**, not at
   the platform default and not at the model's ceiling. The percentile is the
   declared input to the derivation; write it beside the constant.
3. **Escalate on the cut, not on a forecast.** When a response comes back
   truncated, retry that call at the high ceiling. The tail is paid for once,
   by the calls that are actually in it.
4. **Report the escalation rate.** It is the number that says whether the
   percentile was chosen well; a rate climbing toward the tail fraction you
   budgeted for means the distribution moved.

The retry is what makes the tight default safe. Without it, sizing down is a
bet that the tail does not exist, and the tail always exists.

## The measurement is usually already there, one function away

The common failure is not that nobody measures the output length. It is that
the measurement is read **only on the failure path**. A system that inspects
the usage figures when a response was cut off, and stores them on every other
response for accounting, already holds the whole distribution — and still
sizes the ceiling from a constant, because nothing joins the two.

That is the disguise [limits-are-derived](../../../../_laws.md#limits-are-derived)
warns about in its last clause: the derivation is *written* — a comment above
the constant explaining what it is for, usually a correct one — and never
*computed*. The comment is what makes it look settled.

Ask of any output ceiling: **which observation would change this number, and
does anything read it?** If the answer is a percentile nobody computes, the
ceiling is a preference.

## Escalate per call, and do not latch the escalation

Where a capability genuinely needs a large ceiling — a mode whose intermediate
reasoning is billed against the same cap as the answer — the escalation is a
property of *that call*, keyed on what the call asked for. Two rules keep it
from becoming the new default:

- **A ceiling raised for a capability is scoped to calls using that
  capability.** A constant raised globally because one path needed it charges
  every other path for a mode they never enter.
- **A raised ceiling is still derived.** The large number gets the same
  treatment as the small one — a stated input, and a measurement that can
  contradict it. "The vendor's guidance says this level needs at least N" is a
  floor supplied by somebody else, and a floor is not a derivation; it bounds
  the answer without choosing it.

## Where the recurring cost is actually zero

The whole technique is conditional on a precondition worth stating plainly,
because it is often false: **the reservation only costs you where input
competes with it.** A call whose prompt is a few thousand tokens against a
large window has headroom nobody is using, and a generous ceiling there is
free. The reservation binds when the input side is under pressure — long
histories, large retrieved sets, a compaction ladder that is already dropping
material.

The diagnostic is the ratio, not the reservation: reserved room over the
window is meaningless; reserved room over *the room the input wanted and did
not get* is the finding. A system whose elastic sections never degrade is not
paying for its reservation, whatever its size.

## Decision rules

- Treat the response reservation as an allocated line item with an owner, not
  as a platform default that arrived with the client.
- Derive it from the observed response-length distribution at a declared
  percentile; write the percentile beside the constant and compute it, per
  [limits-are-derived](../../../../_laws.md#limits-are-derived).
- Record response length on success, not only on truncation. A distribution
  read only at its cut is not a distribution.
- Retry the truncated call at a high ceiling rather than reserving for the tail
  on every call.
- Report the escalation rate beside the reservation; per
  [count-carries-predicate](../../../../_laws.md#count-carries-predicate) it
  carries which percentile it was sized against.
- Scope a capability's raised ceiling to the calls that use the capability.
- Before spending any of this, check whether the input side is under pressure.
  Where nothing degrades, the reservation is free and this is not your problem.

## When not to use it

A system whose prompts are small relative to the window is not paying for its
reservation, and tightening it buys nothing while adding a retry path to
maintain — the precondition above, failing. Nor does it apply where the
platform bills the reservation rather than charging it against the window: if
the reserved-but-unused room is neither billed nor subtracted from input, the
number is a true guard rail and belongs to
[output-budget-signal](../../structured-output/techniques/output-budget-signal.md),
which measures approach to the ceiling for a different purpose — deciding
whether the *call* is too big, rather than whether the *reservation* is.

The two techniques read the same measurement and ask opposite questions. That
one records it and this one sizes from it is the reason a system can hold the
first and still leave the second to a default.
