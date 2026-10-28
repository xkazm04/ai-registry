---
layer: technique
type: technique
subject: earned-autonomy-tiers
technique: demotion-attribution-integrity
status: forged
stage: team
laws: [claimant-does-not-adjudicate, identity-survives-reuse, failure-not-empty-success]
shared_with: []
use_when: [wiring a tripwire to decide which agent and class lose standing, a revert or reopen arrives with metadata naming who caused it, one agent's change undoes another agent's]
---

# Demotion attribution integrity

A tripwire is only as good as its answer to one question: whose standing does this event lower?
The naive answer reads it off the event — the commit trailer that names the agent and class, the
label on the change, the author field of the revert. Every one of those was written by a party
with an interest in the answer, and most of them can be edited after the fact. A tripwire that
trusts them demotes whoever the metadata says, which is the agent's choice.

## Read the gate's record, not the action's claim

When the gate decided the action, it minted an identity for it and recorded the (agent, class)
pair it gated the action under. That record is the only attribution source a tripwire reads. Per
[claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate), the class to
demote is the class the gate decided, not the class a trailer names: an agent that labels a risky
schema change as a dependency bump, and later has it reverted, must lose standing in the class
the gate actually applied — which, if the gate classified from the trailer, is itself the defect
to fix first. The trailer matters most after the fact: it can be edited once the change has
merged, so a tripwire reading it at demotion time reads a value the agent chose knowing the
demotion was coming.

The join from the event back to the gate record runs on an identity that survives what changes go
through — rebases, squashes, cherry-picks, a revert of a revert. Per
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse), a commit hash does not
survive a squash and a title does not survive an edit; mint an action identity at the gate and
carry it into the change through a channel the gate checks on arrival, and keep the gate's own
mapping from that identity to the commits it covers.

## Three attribution traps

**The carrier's link is itself a claim.** A revert names the change it undoes in text its
author wrote. When the revert arrives through a second agent's change, that link was written by
an agent with every reason to want a rival demoted, and an agent that can fabricate a revert of
another agent's work can lower that agent's standing at will. So a revert carried by a different
agent than the one whose work it undoes demotes **nobody** automatically — not the original
agent, whose demotion would rest on a competitor's word, and not the carrier, who did nothing a
tripwire can call wrong. It is surfaced for a person to attribute. A revert performed by a
person counts, because the person is not a party to the standing; so does an agent's revert of
its own work, because a claim against oneself has nobody to favour. The naive reading — "the
revert's author is only the messenger" — misses that the message is the evidence.

**The reverted change may not be an agent's.** A person's change reverted by an agent, or a
person's change reverted by a person, has no gate record in any agent class. It demotes nobody,
and it must not fall through to a default class.

**Partial overlap.** A revert that undoes part of an agent's change, or a fix that touches the
lines of three earlier changes, has no single cause. Attribute only where the gate record makes
the link exact — the reverted change is one gated action — and report the rest for a person to
attribute. An automatic demotion that guesses has the same cost as one that reads a trailer.

## The event scan is complete or it fails

The tripwire sees events through a query — changes updated since a time, commits on a branch
since a time — and the agent controls part of what that query returns. An agent that opens enough
new changes pushes its own reverted or reopened one off the first page of results, and a tripwire
that reads one page never sees it. Read every page of the lookback; if the result exceeds what the
scan can hold, fail the sweep loudly rather than process a prefix, per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success). A sweep that found
nothing and a sweep that could not see everything must not look alike.

## Unattributed is a result

Every event the tripwire sees resolves to one of three outcomes: attributed to an (agent, class)
pair, not an agent action, or **unattributed** — an agent action probably, but not tied to a gate
record. Per [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value), unattributed is
not silently dropped and not assigned to a guess. It is surfaced with the event so a person can
attribute it, and a rising unattributed count is itself a defect in the identity channel.

## Check the attribution rule with negative cases

Attribution is easy to get right on the happy path and easy to break in a refactor. Keep fixtures
for each trap — a revert of one agent's change carried by another (expected: nobody), a person's
revert of an agent's change (expected: that agent), a person's change reverted (expected: nobody),
a trailer that names a class different from the gate's (expected: the gate's), a squashed change
— and assert the demotion each one should produce. A rule that has only ever been tested on events it should
attribute has never been shown to decline.

## When not to use it

With a single agent and no person reverting anything on the branches it touches, attribution is
trivial and the identity channel is overhead. The rules start paying when more than one agent
works the same branches, or when people and agents revert each other.
