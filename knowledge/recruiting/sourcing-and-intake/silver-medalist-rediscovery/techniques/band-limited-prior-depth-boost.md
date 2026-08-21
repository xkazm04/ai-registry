---
layer: technique
type: technique
subject: silver-medalist-rediscovery
technique: band-limited-prior-depth-boost
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, a-verdict-is-bound-to-what-it-judged, inference-must-look-like-inference]
shared_with: []
use_when: [ranking re-surfaced candidates against a new opening, deciding how much weight prior interview depth deserves, auditing whether a pool keeps recommending the same people]
---

# Band-limited prior-depth boost

How far someone got last time is real information. A person who reached a
final panel has been assessed by humans against a bar, which is more than can
be said for a document score. The technique is about spending that information
without letting it take over the ranking — and the entire rule fits in one
sentence: **a prior-depth boost is bounded to roughly half a fit tier, so
re-surfacing reorders within a band and never vaults a stronger fit.**

## Why the bound is the whole technique

Without a bound, familiarity compounds. Known people rank higher, so they are
contacted, so they accrue more history, so they rank higher next time. Within
a few hiring cycles the pool has collapsed onto the people you saw first — and
if that early population was not representative, you have built a machine that
narrows it further each quarter while producing a defensible-looking score at
every step.

That is the precise inversion of what a talent pool is for. A pool exists to
widen the set of people considered; a ranking that systematically prefers the
already-seen turns it into a rolodex. And the drift is invisible in the only
place anyone looks: individual result lists always seem reasonable, because
every name on them does have relevant history.

The bound also encodes an evidential truth. Prior depth is a strong claim
about how someone performed against a *different* opening, under a bar set by
a different hiring team, possibly a year ago
([a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
It is genuinely weaker evidence about the current role than the current fit
assessment — so it must not be able to outweigh it. Half a band expresses
exactly that: enough to say "of these comparable people, start with the one
you already know", never enough to say "the one you know is the better fit".

## Constructing the bound

1. **Establish the fit bands.** Whatever your fit scale, it resolves into
   ordinal tiers a recruiter reasons in — strong, promising, marginal. The
   band width is the distance between tier boundaries on the raw scale.
2. **Cap the total boost at about half that width.** Not half per factor —
   half in total, across every familiarity input combined. The cap is enforced
   after summation, because three "small" boosts are how an unbounded one gets
   built by accident.
3. **Distribute inside the cap by depth, monotonically.** Reached an offer
   stage above reached a panel above reached a first interview above assessed
   but not interviewed. The steps should be visibly unequal in the direction
   that matches evidential strength, and the whole ladder still fits under the
   cap.
4. **Verify the property arithmetically, not by inspection.** A property test
   worth owning: for any two candidates whose raw fit differs by more than the
   cap, the boost never reverses their order. This is one assertion and it is
   the only thing standing between you and the ratchet, because nobody detects
   the drift by reading lists.

Age the depth signal rather than deleting it: a final-round performance from
three months ago carries more than one from three years ago, and both stay
under the cap. How much an old assessment is worth in the first place — and
how much to discount evidence produced under a superseded rubric — belongs to
evidence provenance weighting; this technique consumes that weight and clamps
its influence.

## What never receives a boost

- **A currently-active candidate.** Someone in process for another opening
  right now is being assessed live; adding a familiarity bonus double-counts
  the same relationship and pushes them up a list they should not be on at
  all. Active status suppresses the boost, and usually suppresses the match.
- **A never-assessed record.** No assessment happened, so there is no depth,
  and inferring depth from stage residence manufactures the claim.
- **A person carrying a terminal outcome.** They were excluded before ranking;
  if a boost can reach them, the gate is in the wrong place.
- **Volume of prior contact.** How many times you emailed someone is a fact
  about your outreach, not about them. Counting it is how a ranking learns to
  prefer whoever the team already likes.

## Admission first, ordering second

The boost applies only to the already-admitted set. Admission runs on the
honest, unadjusted fit against the current role
([fit-floor-for-readmission](./fit-floor-for-readmission.md)); the boost then
reorders those who cleared it. If the boost participates in the threshold test,
the floor has been silently lowered for known people, and the two techniques
have been merged into one that does neither job.

One place the two interact and must be reasoned about explicitly: the display
cap. When only the top twenty are shown, the boost can move someone across the
cut — a deeper prior just below it displaces a shallower one just above. That
is acceptable exactly because the band holds: the person displaced is never
more than half a tier stronger, so the cut never drops someone a real tier
better in favour of someone you happen to know. State this property when you
document the ranking, because it is the first thing a sceptical hiring manager
will find, and "the band bounds it" is the only answer that satisfies.

This ordering has a pleasant audit property. Every name on the list can be
explained twice: it is here because its raw fit cleared the floor, and it is
*at this position* because of a named, bounded familiarity adjustment. Both
halves should be inspectable
([a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## Show the boost, and show it as inference

A recruiter reading a re-surfaced list should be able to see that a
familiarity adjustment was applied and what it was based on — "ranked slightly
higher: reached final round for an adjacent role last spring" — rather than a
single blended number that quietly contains it
([inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference)).
This is not only transparency for its own sake. The adjustment is exactly the
part a human is well placed to overrule, because they may know the prior
process was unrepresentative, and a blended score gives them nothing to
overrule.

## When not to use it

Skip the boost entirely when the prior assessments were produced under a
process you no longer trust — a rubric since retired for bias, an interview
loop that was found inconsistent. A bounded weight on discredited evidence is
still a weight on discredited evidence, and the honest move is zero.

Skip it too when the result list is short enough to read whole. Ordering
matters when attention runs out partway down; for eight names it is decoration
with a fairness risk attached.
