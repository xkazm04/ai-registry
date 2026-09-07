---
layer: technique
type: technique
subject: subscription-billing-periods
technique: boundary-stitch-on-timezone-change
status: forged
laws: [limits-are-derived, unknown-is-not-a-value]
shared_with: []
use_when: [a subscriber's timezone or region can be edited, opening a period whose predecessor exists, usage appears billed twice or not at all around a boundary]
stage: team
---

# Boundary stitch on timezone change

When a period's **frame of reference is mutable**, a boundary recomputed under
the new frame will not equal the boundary the previous period recorded under the
old one. The gap between them is real usage: either usage that no window covers,
or usage that two windows cover. This technique makes the *recorded* end
authoritative, stitches the next period onto it, and refuses the stitch when the
disagreement exceeds a bound derived from the physics of the domain.

## The two failure shapes

Consider an open period recorded as ending on a date resolved through frame A.
Mid-period, the subscriber's zone is edited to frame B. The next pass recomputes
the boundary through B.

- **B is east of A.** The recomputed start is *later* than the recorded end. The
  hours between are inside no period. Usage there is aggregated by nothing,
  invoiced on nothing, and lost. Nobody complains, because nobody is billed.
- **B is west of A.** The recomputed start is *earlier* than the recorded end.
  The hours between are inside two periods. Every event in them is counted twice
  and charged twice. Somebody does complain, and they are right, and the invoice
  is evidence.

Both come from the same edit. Neither is visible by inspecting either period on
its own — each period is internally consistent and correct under its own frame.
The defect exists only in the *relationship* between consecutive periods, which
is why it survives review of both.

## The rule: the record is the authority, the recomputation is a candidate

At period open, do not accept the computed start. Compute it, then compare it
against the previous period's **recorded** end. If they agree, nothing happened.
If they disagree, the new period starts at the recorded end plus the smallest
representable unit of the boundary domain — a stitch — and the disagreement is
noted on the period.

This inverts the instinct, which is to trust fresh arithmetic over stored data.
The instinct is wrong here for a specific reason: the stored end is not a stale
computation, it is a **statement already made to the customer.** The previous
invoice covered up to that end. Recomputing over it does not correct the past;
it contradicts it.

The same shape applies to any mutable frame of reference, and it is worth
recognizing outside timezones: a fiscal calendar that is re-declared, a rate-card
version that changes what a period means, a business entity re-registered under
a different jurisdiction. Whenever the function from "period n" to "a range of
instants" can change between two evaluations, continuity must be asserted
against what the previous evaluation recorded.

## The bound is a physical constant, not a knob

A stitch that will bridge any gap is not a guard, it is a rubber stamp. If the
recorded end and the recomputed start disagree by a month, the cause is not a
zone edit — it is a corrupted anchor, a mis-joined subscription, a hand-edited
row, a restored backup. Stitching there fabricates a window nobody transacted
in, and the fabrication is invisible because a stitched period looks exactly
like a normal one.

So the stitch carries a maximum. The correct maximum is **derived from the
world**: the spread between the easternmost and westernmost civil offsets in use
is a little over a day, so no legitimate frame change can move a boundary by
more than that. A disagreement larger than the maximum possible offset spread is
by construction not an offset change.

The value being a physical constant is what makes it durable
([limits are derived](../../../../_laws.md#limits-are-derived)). A number chosen
by feel gets raised by feel, one incident at a time, until it stops refusing
anything — and each raise is argued locally by whoever is looking at one broken
subscription. A number written beside the sentence "this is the maximum time
difference between two places on earth" cannot be argued up, because raising it
requires disputing a fact about the planet. Write the derivation next to the
constant, not just the constant.

Beyond the bound, the system does not know what the window is. It must say so
and stop, rather than [rendering the unknown as a definite range](../../../../_laws.md#unknown-is-not-a-value)
by picking whichever candidate looks nicer.

## Procedure

1. **Assert at period open, not at period close.** The closing period's end has
   already been used; the opening period's start is the only end still free to
   move. Asserting at close means proposing to change a boundary a customer has
   been shown.
2. **Gate the stitch on a detected frame change, not on any disagreement.**
   Compare the zone recorded on the previous period against the zone that
   resolves for this subscriber now. Equal: do not stitch at all, even if the
   boundaries disagree — a disagreement with no frame change has a different
   cause and stitching would hide it. This is why the previous technique
   insists the record carries its zone: without that column there is no way to
   tell a frame change from a defect, and the stitch degrades into a blanket
   "trust the stored value" that papers over drifting anchors.
3. **Read the previous period's recorded end** from the period record — the row
   that says what was billed — not from a recomputation of the previous period.
4. **Compare against the recomputed start.** Equal, within the boundary domain's
   resolution: proceed unstitched.
5. **If unequal and within the derived bound**, set the start to the recorded end
   plus one unit, and mark the period as stitched with both candidates recorded.
6. **If unequal and beyond the bound**, refuse to open the period. Raise it as a
   data-integrity condition against that subscription, not as a scheduling
   error, and let the pass continue with every other subscription. Falling back
   to the recomputed candidate is the tempting alternative and it is wrong: it
   is the branch that only executes when something is already broken, so it is
   the branch nobody has ever seen run, and its output is an invoice.
7. **Floor every candidate at the subscription's own start.** Whatever the
   stitch produces, a period may never begin before the agreement did. This
   also disposes of the first-period case: a subscription with no predecessor
   has nothing to stitch to, its start is the anchor, and a stitch attempt
   there means the predecessor lookup is returning another subscription's row.
8. **Test both directions.** Move a fixture subscriber's zone east mid-period and
   assert no gap; move one west and assert no overlap; move one beyond the bound
   and assert the refusal.

## Decision rules

- **When stitched, the period is longer or shorter than nominal, and that is
  correct.** Do not "fix" the length. The tiling guarantee outranks the
  regularity guarantee, always: a customer will accept a period that was 24
  hours long and 5 hours short of a month; they will not accept being billed
  twice for the same afternoon.
- **When a stitch happens, tell whatever computes proration.** A period whose
  start moved has a different length, and any amount derived from its length is
  computed downstream from the stitched value, never from the nominal one.
- **When the frame change is known in advance** — an operator editing a zone, an
  entity re-registration with an effective date — prefer closing the current
  period at the edit and opening the next under the new frame. A planned
  transition is cleaner than a detected one, and the stitch remains as the guard
  for the unplanned case.
- **When the previous period's end is missing** (a subscription whose history was
  imported, a restored partial backup), that is an unknown, not a zero. Refuse
  and surface it; a stitch to a null end silently anchors the period at the
  epoch.
- **When the same subscription stitches repeatedly**, the zone field is being
  written by something automatic. Chase the writer; a boundary that stitches
  every period is not being guarded, it is being papered over.

## When not to use it

- **When the frame is immutable by construction.** If the zone is captured at
  subscription creation and can never be edited, there is nothing to stitch and
  the guard is dead weight. But confirm the immutability is enforced, not
  assumed: an editable field with a convention against editing it is mutable.
- **When periods are not required to tile.** Some products bill on discrete
  events with deliberate gaps between them. Continuity assertion presumes a
  continuous meter.
- **As a general fix for boundary disagreement.** A stitch covers a *frame*
  change. If the disagreement comes from a chained anchor drifting, stitching
  hides the drift and makes it permanent — fix the derivation instead.

## Smells

- A period start computed and written with no read of its predecessor.
- A tolerance constant near a boundary computation with no stated derivation.
- A stitch bound expressed in a configuration file where it can be tuned per
  environment.
- A period whose start and its predecessor's end differ by exactly the smallest
  unit in some rows and by more in others.
- Support tickets about double charges clustered around subscribers who
  recently changed country.
