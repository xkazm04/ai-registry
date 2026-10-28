---
layer: technique
type: technique
subject: earned-autonomy-tiers
technique: recomputable-promotion-trial
status: forged
stage: team
laws: [derivation-names-recomputation, count-carries-predicate, claimant-does-not-adjudicate]
shared_with: []
use_when: [writing the bar an agent must clear to be promoted, a reviewer is asked to approve a promotion on a reported success rate, the figure behind a standing cannot be rederived]
---

# Recomputable promotion trial

A promotion is approved on a number, and the reviewer approving it has to be able to produce the
same number. The trial is the procedure that makes that possible: a record built only from facts
outside the agent, a bar that states every term it depends on, and a deterministic computation
from one to the other that anyone can run and get the same answer.

## The record

The record is an append-only list of outcomes, one per gated action in the (agent, class) pair,
each written from a source the agent does not control:

- the gate's own decision for the action, with the action identity it minted;
- the proof verdict, as recomputed by the job that does not trust the agent's claims;
- the merge, as recorded by the hosting system;
- any later revert, reopen or guardrail block attributed to that action.

Only actions the gate decided enter it. A change that reached the branch through another door —
merged by hand, pushed under a different identity, landed before the gate existed — may be fine
work, but it says nothing about what the gate's rung lets through, and counting it lets a record
be padded with outputs nobody gated. Nothing the agent reports enters the record either: not its
confidence, not its own summary of the change, not a test count it printed. Per
[claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate), a party whose
standing the record decides supplies no input the record reads. Rows are never edited; a
correction is a new row that supersedes, so a reviewer can see what the figure was and why it
changed.

## The bar

The bar is a policy statement, versioned beside the ladder, and it names five things — each one a
place an unstated assumption turns a figure into a claim, per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate):

1. **The window.** Which actions count — the last N, or those since a date, or since the agent
   last changed. A window that silently extends back to before a material change measures the
   old agent.
2. **The minimum count.** Below it, no promotion whatever the rate. Small samples are where a
   perfect record is cheapest.
3. **The success predicate.** What makes one action count as good: proof passed, merged **as the
   agent wrote it**, not reverted within a settling period, no reopen. "Merged" alone is too
   generous at the supervised rung, where a person who fixed the change before approving it
   leaves a merge in the record that the agent did not earn; the share merged without a person's
   edit is the figure that predicts hands-off. An action still inside its settling period is
   neither good nor bad; it is excluded and the exclusion is reported.
4. **The statistic.** Apply the threshold to a **lower confidence bound** on the success rate,
   not to the raw rate. Twelve clean of twelve is a raw rate of one and a lower bound well short
   of what twelve hundred clean actions would support; the bound is what makes the minimum count
   and the threshold work together instead of being tuned against each other. A bar written as
   plain counts — "fifteen accepted, zero reverts" — is a bound too, and its implication should
   be written beside it: zero failures in N bounds the failure rate at roughly three in N at
   ninety-five percent confidence, so fifteen clean actions say the true rate is below one in
   five, which may be far looser than the policy author believed.
5. **The disqualifiers.** Events that block promotion inside the window regardless of the rate —
   any breach-class tripwire, any fabricated proof.

## The computation

The figure is produced by a deterministic procedure over the record — no model, no sampling, no
dependence on when it runs except through the window. It is invokable on its own, outside the
service that uses it, per [derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation),
so a reviewer can rerun it against the record at the commit the proposal names. The promotion
proposal carries the figure, the bar version, the record's position (its last row identity) and
the command that reproduces the result. A reviewer who reruns and gets a different number has
found a defect, not a disagreement.

The record grows while the proposal waits, so "rerun it" needs a fixed cut. Make the record a
hash chain and have the proposal state the sequence number it was computed through and the hash
at that position; the reviewer verifies the chain from its start, cuts it at the stated sequence,
checks the hash matches, and recomputes. A chain that fails to verify states nothing, and a hash
that does not match means the reviewer is holding a different record from the one the proposal
describes — both are reported as such, never as a lower figure. The procedure should also say
which facts the record alone cannot state, so a reviewer who recomputes from it alone knows why
their count of resolved actions may be lower than the proposal's.

Every place the figure is shown — the proposal, a screen, a drafting job — reads it through one
function, so the screen and the job cannot disagree about whether the bar is met. Show the count
against the bar, never a forecast of when it will be met: an estimated promotion date turns a
safety threshold into a deadline, and people start working to the deadline.

Store the figure, if it is stored at all, as a cache with its inputs named. The standing never
reads the cached figure; it reads the policy, which a person changed after reading the figure.

## Deciding the threshold

The threshold is a statement about the class's cost of an escape, not about the agent. A class
whose escapes are cheap to undo (a formatting fix) can promote on a lower bound well below the
threshold for a class whose escape reaches a deployed environment. Set the threshold per class,
and when a class's blast radius changes, change its threshold before promoting anyone into it.
Mark the thresholds as what they are — policy numbers chosen by a person, not measurements — so
nobody later reads the bar as evidence that the risk was quantified.

## When not to use it

A promotion that nobody approves on a figure — a one-off grant for a demonstration, a sandbox
with no shared consequences — needs no trial; mark it as such in the policy with an expiry. The
trial is for any standing that lets work land in a place other people depend on.
