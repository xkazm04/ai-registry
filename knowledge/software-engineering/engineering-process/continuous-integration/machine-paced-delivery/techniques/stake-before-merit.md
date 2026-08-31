---
layer: technique
type: technique
subject: machine-paced-delivery
technique: stake-before-merit
status: forged
stage: solo
laws: [absent-guard-is-loud, gate-sees-target]
shared_with: []
use_when: [the changes arriving at the gate are authored by people who do not own it, a maintainer is drowning in well-intentioned contributions, writing a contribution policy for agent-assisted submitters, deciding what may be judged before a change is read]
---

# Stake before merit

The demand levers available to a review gate all assume the same thing: that the party feeling
the overload is the party generating the arrival. Send fewer changes, make each verdict cheaper,
narrow what needs a verdict, publish a service level — every one is a decision the receiving team
makes about its own output. That assumption holds for a team dispatching agents at its own
repository, and it fails completely the moment the gate faces outward.

An open contribution surface, a platform team's shared repository, any queue fed by people who do
not carry its cost: there the arrival rate is set by a population the gate has no authority over,
and none of the four levers reaches it. This technique is about the lever that does.

## The filter that disappeared without being removed

Contribution surfaces were never actually open. They were rationed by an accident nobody
designed: producing a plausible change was expensive, so the act of submitting one carried
evidence of investment. A person who had written the patch had read the code, hit the problem,
and had a reason to see it land. That correlation did the admission work, and because it was
never written down as a rule, nothing announced its removal.

Machine authorship removed it. The cost of producing a change that *looks* like the product of
investment fell by orders of magnitude; the cost of evaluating one did not move at all. The two
costs were never coupled by anything but circumstance, and the ratio between them is now the
dominant fact about the queue.

This is the shape [absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) forbids: a
guard either holds on its own or its absence is loud. An economic guard that was never articulated
cannot be loud when it goes, and the gate's first evidence is a rising arrival rate of
well-formed, superficially reasonable, unmotivated work.

## Triage is the resource being rationed

The move that suggests itself is a merit filter: read the changes, admit the good ones. It does
not work, and the reason is structural rather than a matter of degree.

**Assessing a change's merit requires the resource the admission rule exists to protect.** A
verdict on whether something is worth reviewing is reached by reviewing it. Any admission rule
whose predicate is a property of the diff has already spent the budget by the time it can
decide — and it spends it on exactly the population it wanted to reject, because a competent
generator produces work that survives skimming. The cheap tells that once separated serious
submissions from casual ones — a coherent description, tests present, conventions followed,
tone — are the tells machine assistance supplies for free. They are proxies that agreed with the
target only while producing them was expensive, and per
[gate-sees-target](../../../../_laws.md#gate-sees-target) a proxy fails precisely in the case the
gate was built for.

So the admission predicate must be evaluable **before the change is read**. That constraint is
severe, and it leaves a small set of things to look at: who is submitting, why, and what they have
committed to afterwards.

## Stake is the predicate

The one property that is both cheap to establish and actually predictive is whether the submitter
has a personal stake in the outcome — they hit the defect in their own work, they need the
capability and will use it, they carry experience the change encodes. Stake is asked for, not
inferred, and it is asked for *before* the change is written rather than after it arrives.

What makes stake the right predicate is not that staked contributions are better on average. It
is that stake predicts the expensive half: whether the submitter stays through review. The cost of
a contribution is not the first read — it is the review round trips, the follow-up questions, the
rework, and the decision at the end. A submitter with a stake absorbs a share of that cost and
answers the questions that unblock it. One without a stake leaves a proposal behind and the entire
remaining cost with the reviewer, which is why a small, correct, unmotivated change can still be
net negative.

State it as a policy with three parts, all checkable without reading a diff:

- **A named reason the submitter cares**, in the specific rather than the general. "I hit this in
  my own project" qualifies; "I wanted to help out" and "this looked easy" do not, and naming the
  disqualifying phrases explicitly is what makes the policy operable by someone who is not the
  maintainer.
- **A commitment to carry it through review**, engaging on the underlying problem rather than
  submitting and departing.
- **The discussion before the code.** Where stake is uncertain, the cheap instrument is a question
  in the issue rather than a change in the queue — it costs the reviewer a paragraph instead of a
  review, and it converts a rejected contribution into a shaped one.

Machine assistance is not what the policy restricts, and saying so plainly matters: an agent
helping a staked contributor write, polish, and iterate a change is the arrangement working as
intended, and a policy read as anti-tooling gets routed around by exactly the contributors worth
keeping. What is refused is the *unattended* submission — nobody accountable, nobody answering
review, the cost transferred whole. The distinction is authorship of the accountability, not
authorship of the text.

## Publishing the policy is most of the mechanism

This gate has no enforcement point. It cannot be a check, because its predicate is not in the
tree; it cannot be automated, because the fact it needs is about a person's intent. What it has
instead is a stated position that the submitter — increasingly, the submitter's agent — reads
before spending effort.

That is a weaker mechanism than a gate and a stronger one than it looks, because it acts before
the cost is incurred rather than after. A policy discovered at rejection has already been paid for
twice; a policy discovered at the outset redirects the effort. Write it where the work starts: in
the contribution guide for people, and in the repository's agent-facing instructions for agents,
with the same rule in both and the agent-facing copy carrying the extra instruction to surface the
policy and stop rather than to produce the change and let a human find out later.

The honest framing to publish alongside it is the cost, stated as a quantity: what a thorough
review actually takes, and how much of it exists. A maintainer who says review is the project's
scarcest resource has explained the policy; one who says contributions are unwelcome has not, and
will be read as the second no matter what they meant.

## What this does not buy

Stake bounds arrival; it does not size the gate. A surface with a well-published policy and a
staked contributor population can still exceed one person's capacity, and the measures that reveal
that — arrival, dwell, backlog age, post-merge repair — are
[human-gate-capacity](./human-gate-capacity.md)'s, unchanged. This technique only makes the first
of its levers reachable when the arrival is not yours to reduce.

Nor is stake a quality signal. A staked contribution can be wrong, and the review still decides;
admission and verdict are different questions and the policy must not be cited as evidence about
the change. Conversely, a rejected unstaked contribution may have been correct — the policy is a
statement about cost allocation, not about the diff, and a maintainer who defends it as a quality
filter will lose the argument on the merits of some particular good patch and abandon a rule that
was never about that.

## Decision rules

- When arrival is generated by a population the gate does not control, the demand levers that
  assume self-generated arrival are unavailable; do not report them as remedies.
- Never make admission a function of the diff — assessing merit spends the resource admission
  exists to ration.
- Admit on stake: a specific named reason the submitter cares, and a commitment to carry the
  change through review.
- Ask for stake before the change is written; route uncertain cases to a question rather than a
  submission.
- Restrict unattended submission, never tool assistance; state the distinction explicitly or the
  policy will be read as the wrong one.
- Publish the policy where effort starts, in both the human-facing and agent-facing entry points,
  and have the agent-facing copy surface it and stop.
- Publish the review cost as a quantity beside the policy; a policy without its cost reads as
  hostility.
- Keep admission and verdict separate — stake is not evidence about the change.
