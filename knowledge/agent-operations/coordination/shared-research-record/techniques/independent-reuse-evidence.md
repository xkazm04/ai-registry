---
layer: technique
type: technique
subject: shared-research-record
technique: independent-reuse-evidence
status: draft
laws: [the-judge-never-grades-its-own-family]
shared_with: []
use_when: [deciding how a shared record credits a contribution, a participant's score rises from its own follow-ups, a verifier reverses an earlier verdict]
---

# Independent reuse evidence

The concern: a shared record has to say which contributions matter, and every cheap
signal of mattering can be produced by the contributor. Endorsements cost nothing.
Follow-ups on one's own branch cost only the time the contributor was going to spend
anyway. A score built from either rewards volume and self-promotion, and it
concentrates attention on whoever publishes most. **Score a contribution by what other
participants spent their own effort on, and never by what its author did next.**

## The score

A contribution's evidence score is a weighted count of its direct children written by a
different participant. The weight comes from the child's type, as the
[typed-contribution-vocabulary](./typed-contribution-vocabulary.md) defines it:

- **Built on it.** A result, insight or synthesis that names it as a parent. This is
  reuse: another participant bet effort on it being right.
- **Reproduced it.** A verification that re-ran it and confirmed or partially confirmed
  the number. This is the strongest positive signal, and it gets the largest weight.
- **Failed to reproduce it.** A verification that re-ran it and did not get the number.
  This subtracts, and it should subtract about as much as a confirmation adds. Otherwise
  a contested result still nets positive from attention alone.
- **Acknowledged it, or claimed to be working near it.** Zero. Visible for coordination,
  excluded from the score.

Keep a separate descendant count for how much qualifying work sits downstream of a
contribution, excluding zero-weight types and failed verifications. The direct score says
whether others trusted this node. The descendant count says whether it opened a line of
work. They answer different questions, and neither should be folded into the other.

## Verdicts are replaceable, and history is not

A verifier may change its mind. It re-runs on another machine, finds its first run was
spoiled, or learns the target's artifacts were incomplete. When the same verifier posts
a new verdict on the same target, **the newest verdict replaces the older one's effect on
the score, and both stay in the history**. Replacing the effect stops a verifier from
stacking verdicts, and a verifier that confirms twice is still one check. Keeping the
history keeps the reversal auditable. A score that silently changes is indistinguishable
from a tampered one.

## The capture boundary

Self-citation exclusion works at whatever level identity is defined, and that is the
technique's limit. Exclusion by account defeats one account extending itself. It does
nothing against:

- **One operator running many accounts.** The accounts cite each other and every citation
  counts as independent.
- **Many sessions of one model under one brief.** They are separate accounts with a shared
  prior. They reach the same idea for the same reason, find the same argument convincing
  and reproduce each other with the same blind spots. Independence at the account level
  is not independence at the level where the bias lives, which is the same reason a
  verdict is never produced by
  [the agent's own family](../../../_laws.md#the-judge-never-grades-its-own-family)
  alone.

State the level at which the record defines "other", and report scores with that
definition beside them. Where the community is homogeneous (one model family, one brief)
say so, and read cross-account reuse as coordination rather than as independent
corroboration. Where it can be arranged, draw verifiers from a different family than the
author, and let a cross-family confirmation weigh more than a same-family one.

## Independence in lineage, not only in authorship

Two reproductions are independent only if neither is downstream of the other.
A verification that copied another verifier's configuration is one check carried twice.
A synthesis that cites three results derived from one parent has one piece of evidence
behind it, not three. Where the record carries lineage, count distinct upstream roots,
not distinct carriers. This is the same rule a careful reader of sources applies to a
story repeated by relays of one original.

## Decision rules

- **When a contribution's credit comes mostly from its own author's children, report it
  as uncorroborated**, whatever its raw count, because nobody else has bet on it.
- **When a verification carries no artifacts** (target, configuration, evaluator identity,
  reproduced value), **record it as a hint and give it no weight**, because a verdict that
  cannot be re-checked is testimony.
- **When the verification record for a target is all positive over many checks, audit the
  instrument before trusting the tally.** Re-running a deterministic evaluator on the
  same inputs confirms arithmetic, not generality.
- **When the participant population is one family, publish the scores as coordination
  signals and not as independent corroboration.**

## When not to use it

- **A community of one or two.** With too few participants, reuse is sparse and noisy.
  Read the record directly instead of scoring it.
- **As an acceptance test.** The score measures reuse and reproduction by others. Whether
  a result is *correct* is the evaluator's and the controls' job, and a heavily reused
  wrong result is still wrong.
