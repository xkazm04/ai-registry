---
layer: golden-path
type: golden-path
subject: machine-paced-delivery
status: forged
use_when: [most changes in a repository are authored by an agent, builds have become the bottleneck on a small team, deciding what credentials an autonomous worker may hold, designing what a failing check tells a machine]
techniques:
  - verification-throughput-as-constraint
  - agent-readable-build-outcomes
  - scoped-delivery-access-for-agents
  - proposal-not-push
  - pre-authorship-verification
---

# Machine-paced delivery

Delivery practice was designed around a rate limit that no longer holds. Every convention in
it — the size of a change, the cadence of review, how long a check may take, what a build
failure is allowed to look like — was calibrated against a person typing. When most changes in
a repository are authored by an agent, the rate limit moves by an order of magnitude and
lands somewhere else entirely. This subject is about where it lands and what has to change
because of it.

The thesis is one sentence:

> When authorship becomes cheap, **verification becomes the product**, and every part of
> delivery that assumed a human author starts failing in a way that looks like slowness.

Two consequences follow, and the second one is the one that gets missed. The first is
capacity: more changes need more verification, and a verification queue that was invisible at
human pace becomes the dominant cost at machine pace. The second is *legibility*: verification
output was designed to be read by a person who already has the context, scrolling a log.
An agent reading the same output has no context, cannot scroll usefully, and pays for every
token of it. A build failure that a person diagnoses in fifteen seconds can cost an agent
several minutes and several attempts, and the difference is entirely in the shape of the
output, not in the difficulty of the bug.

**This subject's floor is lower than it looks.** Most of delivery engineering starts paying at
a team, a fleet, an organization. This one starts at one person, because one person with
agents already generates machine-paced change volume against a delivery setup built for a
single human author. The smallest projects hit this first, and they hit it while having none
of the machinery a large organization would reach for. That inversion is why the subject is
worth writing at all.

## The queue is the constraint, so measure the queue

At human pace, "how long does the build take" is the question, because a person is standing
in front of it and nothing else is waiting. At machine pace it is the wrong question: what
governs throughput is how long work waits before it starts, which is a property of capacity
against arrival rate and not of any single run's duration. A pipeline whose runs take four
minutes and whose queue is forty is a forty-four minute pipeline, and every dashboard showing
the four will report it as healthy.

The standard is to measure wait separately from run, publish both, and treat sustained wait as
the capacity signal it is — the same admission-and-wait discipline
[admission-queue](../../../backend-platform/work-execution/admission-queue/admission-queue.md)
applies to work queues generally, arriving in delivery. Any figure that travels carries its
window and its denominator, per
[count-carries-predicate](../../../_laws.md#count-carries-predicate); a median build time with
no arrival rate beside it is decoration. What to measure, how to separate the two, and the
prioritization rule that matters most when capacity is short — human-authored work outranks
machine-authored work, always — are
[verification-throughput-as-constraint](./techniques/verification-throughput-as-constraint.md).

## A failure is a structured result, not a log

A verification run produces a verdict, and the verdict has a consumer that is increasingly not
a person. Designing for that consumer is cheap and almost nobody does it: name what failed,
where, and why, in a form that can be read without reading everything else. Not a replacement
for the log — an addition in front of it.

Three properties do nearly all the work: the **first real error** is extractable without
scrolling, the output is **bounded** so that consuming it has a known cost, and *nothing
ran* is spelled differently from *nothing failed*, per
[failure-not-empty-success](../../../_laws.md#failure-not-empty-success). Repositories that
get this right are noticeably cheaper to work in for humans too, which is the usual sign that
a constraint was well chosen. The output contract, the bounding rules, and the failure-shape
vocabulary are
[agent-readable-build-outcomes](./techniques/agent-readable-build-outcomes.md).

## An agent gets read access to delivery, and almost never write

The useful thing an agent does with a delivery system is *read* it: which run failed, which
step, what the error was, what changed since the last green. That is a genuine capability and
it is worth wiring properly, through a declared tool surface —
[mcp-tools](../../../llm-agent/runtime-and-io/mcp-tools/mcp-tools.md) owns the shape of such a
surface, and [credential-vault](../../../security/credential-vault/credential-vault.md) owns
where the credential lives.

What this subject owns is the boundary. Read scopes and write scopes are different grants and
must be issued separately; a token that can trigger a deployment is not a debugging
credential no matter how convenient it is that the same token does both. Every autonomous
action is recorded against the identity that took it, the grant is revocable while work is in
flight, and the grant names its own expiry at issue per
[creation-names-reaper](../../../_laws.md#creation-names-reaper). The scope ladder, the audit
requirement, and the standing rule that an agent never holds a credential capable of changing
a shared environment are
[scoped-delivery-access-for-agents](./techniques/scoped-delivery-access-for-agents.md).

## Autonomous work lands as a proposal

An agent that diagnoses a failure and produces a fix should produce it the way a colleague
would: on a branch, as a proposal, with the reasoning attached. The merge decision stays
human. This is not distrust of the fix — the fix is often right — it is that the merge gate is
the last place a human sees the change at all, and machine pace is precisely the condition
under which that last place matters most.

The failure mode this guards against has a name in this bundle already:
[deletion-is-not-repair](../../../_laws.md#deletion-is-not-repair). An agent optimizing for a
green result has a shorter path than fixing the defect — remove the assertion, widen the type,
skip the test, relax the rule — and every one of those produces exactly the signal it was asked
for. The countermeasure is structural rather than exhortative: certain classes of change are
not the agent's to make unilaterally, and the gate configuration is one of them. The proposal
contract, the classes of change that require a human author, and the review cues that make a
machine-authored change reviewable at volume are
[proposal-not-push](./techniques/proposal-not-push.md).

## Verify before the change exists

The cheapest verification is the one that happens before a commit does. When the author is an
agent in a loop, the round trip through a delivery system is not merely slower — it is a
different kind of expensive, because the agent must hold context across the wait and often
loses it. Running the same checks the gate runs, locally, in the agent's own loop, converts
most failures from a remote round trip into an immediate correction.

The rule that keeps this honest is
[gate-sees-target](../../../_laws.md#gate-sees-target): the local run must be the *same*
checks, in the same order, from the repository's own declared commands — never an invented
approximation. A local gate that passes on a command nobody else runs has produced a false
green, and the whole arrangement then costs trust rather than time. The remote gate stays as
the backstop for what genuinely needs a clean environment, per the ladder in
[quality-gates](../../standards-and-gates/quality-gates/quality-gates.md). The command
discovery rule, the never-invent rule, and the timeboxing that keeps the local gate from being
skipped are
[pre-authorship-verification](./techniques/pre-authorship-verification.md).

## What this subject does not own

The pipeline's structure, including how an agent-generated plan is produced, belongs to
[pipeline-authoring](../pipeline-authoring/pipeline-authoring.md). The suite's own economics —
partitioning, isolation, flake lifecycle — belong to
[test-harness](../../build-and-release/test-harness/test-harness.md). Approval mechanics belong
to [hitl-approval](../../../llm-agent/orchestration/hitl-approval/hitl-approval.md), and the
handoff from a detected problem to a working fix belongs to
[remediation-handoff](../../../llm-agent/orchestration/remediation-handoff/remediation-handoff.md).
What is here is the delivery system's obligations *to* a machine author, and its obligations to
the humans who remain accountable for what that author produces.

## The techniques

- [verification-throughput-as-constraint](./techniques/verification-throughput-as-constraint.md)
  — wait measured apart from run, capacity against arrival rate, human work first.
- [agent-readable-build-outcomes](./techniques/agent-readable-build-outcomes.md) — the
  extractable first error, bounded output, and a distinguishable did-not-run.
- [scoped-delivery-access-for-agents](./techniques/scoped-delivery-access-for-agents.md) —
  read and write as separate grants, per-action audit, revocation, expiry at issue.
- [proposal-not-push](./techniques/proposal-not-push.md) — autonomous work as a reviewable
  proposal, the changes an agent may not author, and reviewability at volume.
- [pre-authorship-verification](./techniques/pre-authorship-verification.md) — the gate run
  before the commit, from declared commands only, timeboxed.
