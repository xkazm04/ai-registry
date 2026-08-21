---
layer: technique
type: technique
subject: selection-score-calibration
technique: deterministic-holdout-clean-arm
status: forged
laws: [a-predictor-cannot-grade-its-own-labels, uncertainty-resolves-toward-the-candidate, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [designing a screening gate that will need validating, breaking the circularity in a calibration surface, reviewing how a holdout is sampled]
---

# Deterministic holdout clean arm

A screening gate that rejects everyone below a floor destroys the evidence that
would tell you whether the floor is right. The only structural fix is to let a
small, stable fraction of below-floor candidates through to human review anyway
— an arm of the population the score would have acted on but did not — and to
read the calibration curve from that arm.

Everything interesting in this technique is in the word **deterministic**.

## Why membership must be a fixed function of the candidate

The obvious implementation is a random draw at gate time. It fails in three ways,
each of which was learned the expensive way somewhere:

- **A re-roll voids a sealed approval.** Bulk adverse action requires a human to
  approve the exact set they reviewed, with the set re-derived at commit and
  refused if it moved. If holdout membership is redrawn on each evaluation, the
  set at commit is not the set at preview, and every approval token over it is
  meaningless. Determinism is what makes the preview and the commit the same
  object.
- **A moving membership turns the threshold control into a re-roll button.** If
  the draw depends on the threshold, or is recomputed when the threshold moves,
  then nudging the slider reshuffles who was spared. Someone who wants a
  specific person spared can drag until it happens, and nothing in the audit
  record distinguishes that from an ordinary policy change. Membership must
  depend on candidate identity and the holdout rate alone — never on the score,
  never on the threshold, never on the clock.
- **A drifting membership breaks the monitor.** Comparing this quarter's clean
  arm to last quarter's is only meaningful if the arms were constituted the same
  way. A re-rolled arm makes every period-over-period comparison a comparison of
  two different sampling schemes.

The construction that satisfies all three: hash a stable candidate-scoped
identifier, map it into a fixed range, and compare against the configured rate.
The same candidate is in or out forever, the answer is recomputable by any
component without shared state, and no amount of slider-dragging changes it.

## Procedure

1. **Pick the identifier, and decide its scope deliberately.** Key the hash on
   the pairing of candidate and opening rather than on the candidate alone. It is
   tempting to key on the person so that re-application cannot re-roll them, but
   that choice permanently fixes one individual in — or, far worse, permanently
   out of — the sparing pool everywhere in the organisation, forever. Per-opening
   keying spreads membership across roles, keeps each individual decision stable,
   and still cannot be steered. Whichever scope you choose, write down why: this
   is the one place in the technique where two defensible answers exist.
2. **Hash it with the rate as the only other input.** Not the score, not the
   threshold, not the date — and explicitly **not the policy version**, or every
   edit to the screening rules re-rolls the arm and reintroduces exactly the
   defect determinism was for.
3. **Use a small, well-mixed, fast hash and say what it is for.** It needs stable
   spread, not resistance to an adversary who has the source. Keep the function
   pure and dependency-free so it is trivially testable and so any component can
   recompute membership without shared state.
4. **Route holdout members past the gate, not around the process.** They reach
   the same human review everyone else reaches. A holdout that leads to a
   different, lighter review measures that review, not the gate.
5. **Keep the clean arm's inclusion rule byte-identical to the contaminated
   one's.** The only difference between the two curves must be *which candidates
   are eligible* — same label contract, same exclusions, same bins. The moment
   the arms are computed by different rules, the comparison that justifies the
   whole exercise stops being a comparison.
6. **Spare before the approval set is sealed, not after.** The sparing must
   happen upstream of the signature so the human approves exactly the reduced
   set, and a commit re-derives it identically. Sparing after the seal means the
   approved set and the executed set differ, which is the failure the seal exists
   to prevent.
7. **Put the *rate* in the sealed policy version even though membership is not
   keyed on it.** These are not in tension: the rate is a policy input the
   approval must attest to, so changing it forces a fresh preview and approval
   rather than a stale rubber-stamp; membership stays unkeyed on it so an edit
   elsewhere in the rules does not re-roll anybody.
8. **Mark the outcome with its arm** so the taxonomy can classify it later. A
   holdout whose outcomes are indistinguishable from ordinary ones in storage is
   a holdout that will be silently blended back in.
9. **Recompute membership as sparing-minus-subsequent-rejection.** Being in the
   arm is not a permanent badge earned once. A candidate spared by one wave can
   be automatically rejected by a later one — the rate was lowered, the cutoff
   moved, a new wave ran — and at that moment their rejection is score-caused
   again and they must leave the clean arm. Derive the arm as the set of sparings
   minus the set of automated rejections, so membership survives only while the
   sparing still stands. An arm computed once and cached quietly readmits
   contaminated outcomes.
10. **Keep the reviewer as score-blind as the architecture allows,** and record
   honestly which it is. Policy-blind is not architecture-blind, and the
   distinction belongs on the claim.

## Setting and defending the rate

The rate trades statistical power against the cost of the reviews. A few percent
of below-floor volume is the usual landing zone; a handful of resolved outcomes
per month is not an arm, it is an anecdote. Work backwards: decide the smallest
effect the surface must detect, compute the outcomes needed, divide by monthly
below-floor volume, and set the rate from that — then state the rate and the
resulting monthly yield on the surface itself.

Three configuration rules that are not optional:

- **Zero is a legal value and it means something specific.** Disabling the
  holdout is allowed — some organisations cannot absorb the reviews — but the
  consequence is that calibration stays permanently circular, and the surface
  must say exactly that rather than degrading quietly to a curve with no
  disclaimer.
- **Malformed configuration fails closed to zero, never to a default.** A rate
  that is missing, non-numeric, non-finite or negative resolves to "spare nobody"
  — because the alternative is that a corrupt value silently spares an unbounded
  share of a rejection wave, advancing candidates the organisation never decided
  to advance. Note the direction: failing closed here means *fewer* people
  spared, which under-claims the arm rather than over-claiming it. Clamp the top
  of the range too, and treat a full-rate configuration as a legitimate,
  explicit "spare everyone" rather than as an error.
- **A rate change is a policy act with an actor.** It changes who gets human
  review. Record who changed it and when, and treat the periods before and after
  as separate arms in any trend.

## Decision rules

- **When below-floor volume is too small for any workable rate,** do not fake the
  arm. Declare that no clean arm exists, keep the surface on internal-consistency
  footing, and revisit when volume grows.
- **When a holdout candidate is later rejected by the human,** that is a valid
  negative outcome and the most informative datum the system produces. Do not
  suppress it because it looks like the gate was right.
- **When someone proposes stratifying the holdout by score band** to get coverage
  across the range, accept it only if the stratification is itself deterministic
  and the strata are recorded — a stratified arm with unrecorded strata cannot be
  reweighted and is worse than an unstratified one.

## When not to use it

Do not run a holdout where the spared candidate is not actually given a real
chance. A holdout that advances people into a queue nobody works is an experiment
run on candidates for the organisation's benefit with no benefit to them, and it
is worse than having no clean arm. The arm is ethical precisely because being in
it is *favourable*: it converts a rejection into a human review.

Do not use a holdout to justify keeping an automatic rejection gate. The clean
arm measures the gate; it does not license it. Whether a machine may reject at
all is settled elsewhere, and in most defensible designs the answer is that the
machine may only recommend.
