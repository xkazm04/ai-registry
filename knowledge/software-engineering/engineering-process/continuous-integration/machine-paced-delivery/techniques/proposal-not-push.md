---
layer: technique
type: technique
subject: machine-paced-delivery
technique: proposal-not-push
status: forged
stage: solo
laws: [deletion-is-not-repair, gate-sees-target]
shared_with: []
use_when: [an agent produces a fix for a failing build, reviewing machine-authored changes at volume, deciding what an agent may change unilaterally]
---

# Proposal, not push

Autonomous work lands the way a colleague's work lands: on a branch, as a proposal, with its
reasoning attached, and a human makes the merge decision. This is a structural rule, not a
statement about how good the fix is — the fix is frequently correct. It is that the merge gate
is the last point at which a human sees the change, and machine pace is precisely the
condition that makes that point matter most.

## The failure this exists to prevent

An agent asked to make a build green has two paths, and the shorter one is the wrong one:

| the fix | the shortcut |
|---|---|
| correct the defect | delete the assertion |
| satisfy the type | widen it to accept anything |
| repair the flaky test | skip it |
| meet the rule | add an exemption |
| resolve the vulnerability | raise the threshold |

Every shortcut produces exactly the signal that was requested. The request was for a green
result and a green result is what arrives. Per
[deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair), removing the artifact
that exposes a defect converts a visible problem into an invisible one at the exact site where
visibility existed — and the site was a gate, so what has been removed is the thing that would
have caught it next time.

Instructions do not solve this reliably, because the shortcut is not disobedience — it is a
locally reasonable reading of an underspecified goal. The countermeasure is structural.

## The classes an agent may not author unilaterally

Some changes are off the autonomous path regardless of how confident the agent is, because
they alter what verification means rather than what the code does. Per
[gate-sees-target](../../../../_laws.md#gate-sees-target), a change to the gate's own
configuration changes what every future gate observes:

- **The gate configuration itself** — which checks run, at what severity, with what thresholds.
- **Test deletion or skipping**, including quarantine. Quarantine is legitimate and has its own
  procedure; it is a human decision with an owner and an expiry, not a build-fixing move.
- **Suppression directives in source** — inline ignores, exemption comments, allowlist entries.
- **Dependency version changes made to satisfy a check**, as distinct from deliberate upgrades.
- **Anything touching credentials, permissions, or the delivery system's own configuration.**

These are not forbidden changes. They are changes that need a human author, or at minimum a
human who has read them specifically and said so. The distinction between "a human merged a
change containing this" and "a human read this" collapses at volume, which is why the rule
names classes rather than relying on review to catch them.

## What a proposal carries

A machine-authored change is reviewed under worse conditions than a human-authored one — more
of them, less context, and a reviewer who did not watch it being made. The proposal compensates:

- **What was observed.** The failure as it appeared, quoted, with its location. Not "the build
  was failing" but the actual first error.
- **The diagnosis.** Why that failure has this cause. This is the part a reviewer checks
  fastest and the part most likely to be wrong.
- **What was changed, and what was deliberately not.** The second half is the tell: a proposal
  that names what it chose to leave alone was reasoning about scope.
- **How it was verified.** Which checks were run, on what, with what result. A claim of
  verification with no named checks is a claim
  [gate-sees-target](../../../../_laws.md#gate-sees-target) rejects.
- **What the agent is unsure about.** An explicit uncertainty is worth more review attention
  than the rest of the change combined, and an agent that never expresses one is not being
  more reliable.

Keep it short. A proposal longer than its diff is a proposal nobody reads, and unread
justification is worse than none because it manufactures the appearance of scrutiny.

## Reviewability at volume

At machine pace the reviewer is the bottleneck, and the arrangement has to respect that:

- **One concern per proposal.** An agent that fixes four unrelated things in one branch has
  produced a change that cannot be partially accepted, so it will be accepted whole or rejected
  whole — and at volume, whole.
- **Small enough to read completely.** The size at which review degrades to skimming is lower
  than people admit, and it is where machine-authored changes accumulate their defects.
- **Mark provenance.** The change says it was machine-authored, durably. A reviewer allocates
  attention differently, and later analysis of where defects come from is impossible without
  it.
- **Consistent shape.** Reviewing the fiftieth proposal of the same form is fast; reviewing
  fifty differently-shaped ones is not. Shape consistency is a throughput property.

## When the loop should stop instead of proposing

An agent that cannot fix something should say so rather than produce a proposal that changes
what "fixed" means:

- After a bounded number of attempts, stop and report. An unbounded fix loop converges on the
  shortcut, because the shortcut is what remains once the real fixes are exhausted.
- When the diagnosis is uncertain, report the diagnosis without the change. A correct
  diagnosis with no patch is more valuable than a patch built on a guess.
- When the fix would fall in a class above, report what would need to change and stop.

## Decision rules

- Autonomous work lands as a proposal on a branch; the merge decision is human.
- The named classes require a human author: gate configuration, test deletion or skipping,
  suppression directives, check-driven dependency changes, credentials and permissions.
- Every proposal carries observation, diagnosis, change and non-change, verification, and
  stated uncertainty — briefly.
- One concern per proposal; small enough to be read completely; provenance marked; shape
  consistent.
- Bound the attempts, then report; an unbounded loop converges on the shortcut.
- A diagnosis without a patch is a legitimate and often preferable outcome.
