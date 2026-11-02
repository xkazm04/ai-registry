---
layer: technique
type: technique
subject: giveaway-eligibility-and-weighting
technique: cohort-caps-checked-after-derivation
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [limiting how many winners may come from one group, such as moderators, a loyalty tier or linked accounts, a multi-winner draw has fairness rules about the result, deciding where a winners' cap is enforced]
---

# Cohort caps checked after derivation

A cohort cap is a rule about the result: at most one winner from the moderator team, at
most half the winners from the top tier, one prize per linked account. Because it is about
the result, it can only be enforced on the result. Shaping the list beforehand — removing
some moderators, down-weighting a tier — leaves the cap to luck and silently edits
everyone's odds.

## The procedure

1. **Declare caps before the freeze.** Each cap names a cohort (by a verified attribute)
   and a limit, and is written into the frozen rules beside the list. A cap added after
   the randomness is known is a choice of winner.
2. **Turn shares into whole numbers by rounding down.** "At most a third of five winners"
   is one, not two. A cap that rounds up allows more than it states; a cap of zero after
   rounding is a cap the streamer should see on the configuration screen before freezing.
3. **Apply the cap during the pick sequence, by skip.** The derivation produces picks in
   order. When a pick would breach a cap, it is recorded as skipped with the cap that
   skipped it, and the next pick is taken from the same derivation. The skip rule is part
   of the draw's specification, so a verifier replays it.
4. **Validate the final set before it can be stored.** Whatever path produced the
   winners, the record step checks every cap against them and refuses a set that breaches
   one. The check runs after derivation, on the actual winners — not on the list, and not
   only inside the sampler.
5. **Say when a cap could not be satisfied.** If too few eligible entrants remain outside
   a capped cohort to fill every prize, the draw names fewer winners and says so; it does
   not relax the cap. Check this at the freeze, where the counts are known, and show it
   before the streamer commits.
6. **Refuse a cap whose cohort cannot be read.** Membership comes from verified data. When
   the tool has no evidence for the cohort — the attribute is not supplied on this path,
   the read failed — the cap would count zero members and bind nobody. A missing privilege
   is safe; a missing limit is a promise the room hears and the draw does not keep. Refuse
   the freeze, naming the cap.

## Why the validator alone is not the technique

A final-set validator is the backstop, and it must exist. But if the derivation does not
apply caps itself, a breach is discovered only after the randomness is out, as a refused
result. On a draw built to allow exactly one attempt, that refusal is a void draw on air,
and the only remedies — re-running, or adjusting the list — are the choice points the draw
was built to remove. So a validator with no skip rule upstream is a deviation, not a
design: either the skip rule is in the derivation's specification, where a verifier can
replay it, or the streamer is offered only exclusions, which the freeze can apply before
any randomness exists.

## Decision rules

- **When a cap could be implemented by excluding a cohort entirely**, and that is what the
  streamer means, it is an eligibility rule, not a cap: exclude at the freeze.
- **When caps overlap**, every cap applies to every pick; a pick that breaches any is
  skipped.
- **When the verifier cannot replay a skip**, the draw is not verifiable; fix the
  specification, not the verifier.

## When not to use it

A single-winner draw rarely needs a cap — an exclusion does the same job more plainly. And a
cap is not a fairness substitute for a bad curve: if one tier wins too often, flatten its
weights rather than capping its wins.
