---
layer: technique
type: technique
subject: subsystem-review-doctrine
technique: ground-truth-pass-before-proposals
status: forged
laws: [no-gate-self-certifies, refuse-rather-than-destroy]
shared_with: []
use_when: [starting a review of unfamiliar code, designing an automated review prompt, a reviewer keeps citing members that do not exist]
---

# Ground-truth pass before proposals

## The concern

A reviewer — human or machine — will produce a fluent review of a subsystem it did not read.
For a human this happens through pattern-matching on a familiar architecture: they have seen
six of these, they know how it goes, they review the one in their head. For a model it
happens the same way and far more readily, because fluency is the thing it is best at and
because its picture of common interfaces is a blurred average across versions and codebases.
The result is identical: a review naming a parent that is not the parent, a member that was
renamed, a pattern already removed. Nothing in the output's form distinguishes it from a
grounded review. It must be prevented at the input, because it cannot be detected at the
output.

The pass that prevents it is not "read the code first". That instruction is unfalsifiable and
therefore inert. It is a **pass with a required output and a refusal branch**.

## The procedure

Before any finding, any recommendation, any proposal, the reviewer produces a grounding
statement. For every entity the review intends to discuss:

1. **Identity.** Name the entity's declared parent or base, and the file that declares it.
   Not "it presumably extends the base character type" — the actual declaration site.
2. **Members.** Name the specific declared members the review depends on: the fields, the
   engine-registered properties, the callable entry points. Naming the class is not enough;
   the findings will be about members.
3. **One observable runtime behaviour.** For each entity, name a single behaviour that could
   be observed at runtime — what visibly changes, what is broadcast, what the player sees.
   This is the anti-fabrication check and it carries most of the pass's weight. A plausible
   parent and plausible members can be confabulated from priors. A *specific* observable
   behaviour is a much narrower target, and an attempt to fake one is conspicuous.
4. **Verdict.** Either all three are confirmed for every entity, or the pass refuses.

## The refusal branch

> If you cannot confirm identity, members and one observable behaviour from the actual
> source, **do not propose changes**. Request a read-only inventory of what is missing, and
> stop.

This is the single most valuable line in a review specification, and it is the one most often
softened into a hedge. Do not soften it. The failure it prevents costs a triager an hour per
fabricated finding and — worse — teaches the team that this reviewer's output is
approximately-true, after which the real findings stop being read too.

The refusal must be a *result*, reported as such, not an error and not silence. "Two of the
four entities could not be confirmed; inventory requested for these two" is a complete and
useful outcome of a review pass. An empty finding list with no refusal recorded reads as
"clean", which is the opposite of what happened.

## Decision rules

- **When the review touches an entity, that entity must appear in the grounding statement.**
  Not the subsystem — each entity. Scope creep during later passes is a re-grounding trigger,
  not a licence.
- **When grounding is partial, refuse for the ungrounded part and proceed for the grounded
  part** — but only if the two parts are separable. When the ungrounded entity is one the
  grounded findings depend on, the whole review refuses.
- **When the reviewer produced the code under review, its own account of what it built is
  an input, never the grounding.** The grounding statement is read from the source. A
  producer certifying its own output is the failure this rule exists to block.
- **When a finding's confidence would need to be hedged because a premise is unconfirmed,
  drop the finding and record the missing premise instead.** A hedged fabrication is still a
  fabrication in the triage queue.
- **When re-reviewing after a change, re-ground.** Grounding is bound to the state of the code
  it read; a grounding statement from a prior run is evidence about the past.

## Cost and where it pays

The pass costs one extra read of the subsystem's declaration sites and a short structured
output — routinely under a tenth of the review's total effort. It pays in two places. The
obvious one is fabricated findings that never enter triage. The less obvious one, and the
larger, is that the grounding statement *itself* contains findings: the members a subsystem
depends on that no longer exist, the entity with no observable behaviour anyone can name, the
class two other classes both claim to own. Making grounding explicit surfaces those without
looking for them.

## When not to use it

- **Not for a review confined to a file the reviewer has open and quoted in full.** Grounding
  is about entities the review references but has not read; when the entire object of review
  is in front of the reviewer verbatim, the pass is already satisfied.
- **Not as a substitute for the structural pass.** Grounding confirms that things exist and
  do something. It says nothing about whether the arrangement is right, and a reviewer that
  stops after grounding has confirmed a floor, not reached a verdict.
- **Not for pure-design review** of a document or a proposal where there is no implementation
  to be grounded against. There the analogous discipline is naming which stated constraint
  each comment rests on.
