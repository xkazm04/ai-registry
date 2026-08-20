---
layer: technique
type: technique
subject: adoption-measurement
technique: mentor-learner-pairing
status: forged
laws: [count-carries-predicate, one-authority-per-vocabulary]
shared_with: []
use_when: [turning an adoption distribution into an enablement action, proposing who should teach whom, deciding whether a gap is large enough to be worth a pairing]
---

# Mentor/learner pairing

## The concern

An adoption distribution's most actionable output is not the rate — it is the
observation that within one population, on one practice, some units have gone
deep and others have not started. Naming a pair across that gap converts a
measurement into the only intervention an adoption number can justify without
any causal claim: a conversation between two parties, on a named topic, where
one demonstrably has practice the other lacks.

The technique is small and the ways to get it wrong are not. A pairing
proposal is a public statement about relative competence, and a bad one
insults both parties: it tells a strong unit to teach something it is only
nominally better at, and tells a weak one it is behind on a metric that
measured noise.

## The boundary that governs this technique

**Every rule about whether an identifiable human may be named, ranked, shown
to a manager, or surfaced as an example belongs to the people-analytics-ethics
subject, and is not restated here.** Population floors before anyone may be
named, the framing test that decides whether a metric can carry a name at
all, producer-side suppression, and the split between a person's own view and
their organization's view of them are that subject's rules and this technique
treats them as preconditions. Two consequences follow:

- Ask that subject's gate *before* pairing logic runs, at the producer. If
  the population is below its floor, the producer returns **no pairings at
  all**, and the empty result is itself the enforcement — no renderer
  re-checks, because a floor re-implemented at each call site is a floor
  missing from the surface added next quarter.
- Prefer to pair *units of work* — teams, services, repositories — over
  individuals wherever the practice permits. A unit-level pairing carries the
  same enablement value at a fraction of the personal exposure, and unit
  labels can still name a person by proxy when the unit is one or two people,
  which is exactly why the floor applies to units too.

## The procedure

1. **Pick one practice, one dimension.** A pairing is on a named capability,
   never on an overall score. "They are better than you" is not an
   invitation; "they run this specific practice routinely and you have not
   started" is.
2. **Apply absolute floors on both sides, then the gap.** This is the rule
   most implementations miss. A gap alone will always find a pair — the top
   and bottom of any list differ — so a purely relative rule cheerfully pairs
   the least-bad unit in a uniformly weak field as a mentor. Require that the
   mentor clears a *strong* threshold in absolute terms **and** the learner
   falls below a *weak* one, **and** that the distance between them exceeds a
   stated minimum gap. All three, or no pairing.
3. **Hold the thresholds in one place.** Gap and floors are a single owned
   vocabulary (`one-authority-per-vocabulary`); when a second surface
   re-declares its own copy, the surfaces drift and the same two units are
   paired on one screen and not on another.
4. **Require a minimum volume on the learner side.** A unit with almost no
   activity in the practice's domain is not a learner, it is unmeasured —
   pairing it wastes the mentor's time and inflates the enablement backlog
   with units that would show zero regardless.
5. **Emit at most a handful, ranked by gap, one per dimension.** A full
   matrix of every possible pairing is a leaderboard, which is the framing
   this technique exists to avoid. A short list of the largest learnable gaps
   reads as a suggestion; an exhaustive ranking reads as an assessment of
   everyone.
6. **Carry the evidence with the proposal** (`count-carries-predicate`): the
   dimension, both sides' values, the gap, the window, and the provenance
   tier of the underlying signals. A pairing proposed on allocated- or
   declared-tier data must say so — you are about to ask two teams to spend
   real time on the strength of a number that may be an apportionment.

## Decision rules

- If the gap is below the minimum, emit nothing. Not a weak pairing, not a
  "closest available match" — nothing. The absence is the honest output.
- If no unit clears the strong floor, emit nothing and report it: the finding
  is that the organization has no internal mentor for this practice, which is
  a different and more useful conclusion than a manufactured pair.
- If the mentor and learner are the same unit under different names, or the
  learner is the mentor's own sub-unit, drop the pair — self-pairing is a
  data-shape artifact and it discredits the whole list.
- If a pairing would be the *only* content of a per-person view, do not build
  the view; route the invitation through whatever channel the people-ethics
  subject sanctions.
- If a unit appears as a learner on several dimensions at once, propose one,
  not all. A list that tells a team it is behind on six things is a
  performance review, not enablement.

## When not to use this

- **Not on a practice whose depth is not measurable.** If the strong floor
  cannot be evidenced, the "mentor" is a guess with a name attached.
- **Not as a routing or assignment mechanism.** Pairings are invitations that
  either side may decline without explanation; the moment they become work
  items assigned by a system, the underlying adoption metric becomes a target
  and stops measuring anything.
- **Not across organizations or business units** whose eligibility
  predicates, cadences or band cutoffs differ. The gap will be mostly
  definitional.
- **Not when the practice is disputed.** If the standard is still being
  argued about, a pairing proposal takes a side in the argument using the
  authority of a measurement it does not have.
