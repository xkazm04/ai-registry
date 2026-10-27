---
layer: technique
type: technique
subject: earned-autonomy-tiers
technique: asymmetric-promotion-and-demotion
status: forged
stage: team
laws: [record-precedes-effect, claimant-does-not-adjudicate]
shared_with: []
use_when: [deciding who may raise an agent's standing and how, wiring a revert or reopened finding to an automatic consequence, an agent's tier changes without a reviewable trace]
---

# Asymmetric promotion and demotion

Standing moves in two directions, and the two moves have nothing in common but the state they
edit. Promotion removes a person from a path, so it is slow, single-step and human. Demotion puts
a person back, so it is fast, mechanical and automatic. A design that treats both as one
adjustable number — a score that drifts up on good outcomes and down on bad ones — makes the
consequential direction automatic and the protective direction a matter of degree.

## Promotion: one rung, a person, a reviewed change

Promotion is a change to versioned policy, reviewed like any other change to the gate's
configuration, and it has four properties.

**It is proposed with its evidence.** The proposal carries the recomputed record, the bar it was
measured against, and the procedure that produced the figure, so the reviewer can rerun it rather
than trust it. A proposal without the recomputation is a request.

**It is approved by someone other than the claimant.** The agent, or the service running it, may
compute that the bar is cleared and draft the change. It may not approve or apply it, per
[claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate). The same holds
for the team whose throughput the promotion improves when they also wrote the agent; a second
reviewer is worth more on promotions than anywhere else in the policy. Enforce it in the hosting
system's own settings — the standing file owned by named reviewers, the change's author unable to
approve it — and have the drafting tool check those settings and say which are missing, because a
promotion rule that depends on a repository setting nobody verified is the guard
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) warns about.

**It moves one rung.** Assisted to hands-off in one change skips the rung that produces the
evidence hands-off needs: at supervised a person approves each action, and that stream of
approvals is the record. Skipping it means the hands-off standing rests on evidence from a rung
two steps removed.

**It does not happen by itself.** No timer, no threshold-crossing job, no "auto-promote when the
bar is met". The bar being cleared is a reason for a person to look. When the cleared-bar signal
is ignored the cost is review effort; when it is acted on automatically the cost is that nobody
decided to remove themselves from the path.

## Demotion: a tripwire, immediately, by a fixed amount

A tripwire is a rule over an observable event that lowers standing the moment the event is seen.
Its design has four rules.

**It is model-free.** The trigger is a fact a deterministic check can read: the change was
reverted on the target branch, the finding the change closed reopened on rescan, a guardrail
check blocked an action in the class, the proof the change carried failed on recomputation. No
model judges whether the event "really" reflected on the agent. A tripwire that can be argued
with is one the agent's own explanation can talk past.

**The amount is set per event severity in policy.** A practical schedule: an ordinary regression
(a revert, a reopen) costs one rung; a breach (a guardrail block at high severity, a proof found
fabricated, an action outside the class's envelope) goes straight to quarantine. The schedule is
written beside the ladder, not inside the tripwire's code, so the policy owner reads both in one
place.

**It fires before anything else.** The demotion is written before the next action in the class
is gated, per [record-precedes-effect](../../../../_laws.md#record-precedes-effect); a tripwire
queued behind a nightly job leaves a window in which the class keeps landing changes at a standing
it has lost. If the demotion cannot be written, the gate for that class closes until it can. There
is one legitimate reason to run the tripwire on a schedule rather than inline: the credential
that writes the standing should live nowhere the agent's own pipeline can reach, so the writer
runs elsewhere and sweeps. Then the window equals the sweep period, and the period is a policy
number to be stated and kept short — minutes, not a night.

**It is idempotent and does not overwrite.** A sweep sees the same event on every pass until the
lookback moves past it, so each event carries an identity and a demotion already recorded for it
is not applied twice. The write is conditional on the state being the version the tripwire read;
a demotion computed against a standing that a person has since changed is recomputed, never
landed over the newer state.

**It starts a cooldown.** The demoted standing carries a date before which no promotion may be
proposed. Without it, a class knocked down on Monday is promoted back on Tuesday on the very record
that preceded the regression, and the tripwire becomes a speed bump.

**It is a recorded change to the same state.** The demotion lands in the same history as
promotions, with the event that caused it, so a reader of the standing sees one ledger of every
move and why. A demotion kept only in an event log, while the policy file still says hands-off,
is two sources of truth about one standing.

## Leaving quarantine

Quarantine is off the ladder, so the promotion rule does not apply to it and no record climbs out.
Release is a person's decision with a written reason — the defect found, the fix made, the class
boundary redrawn — and it returns the class to the bottom rung, not to where it was. The record
from before quarantine stays readable but restarts for promotion purposes; the evidence that
supported the old standing is the evidence the breach falsified.

## Why the rates differ

The two errors have different prices. A demotion that was unnecessary costs some review until a
person re-promotes, which takes one reviewed change. A promotion that was premature, or a demotion
that was late, lands changes nobody read, and the cost of that is bounded by nothing but the class's
blast radius. When the costs are that lopsided, the mechanism should err in one direction on
purpose — and should make the cheap correction (re-promotion) easy rather than making the
expensive mistake rare by making demotion hesitant.

## When not to use it

When every action is reviewed by a person regardless of tier — the ladder is advisory, used to
prioritise a review queue — the tripwire still earns its place but the promotion ceremony does
not; a dashboard is enough. The full asymmetry is for systems where some rung actually lets a
change land unread.
