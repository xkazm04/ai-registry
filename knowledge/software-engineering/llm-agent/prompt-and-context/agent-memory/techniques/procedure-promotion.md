---
layer: technique
type: technique
subject: agent-memory
technique: procedure-promotion
status: forged
laws: [identity-survives-reuse, one-validation-door, creation-names-reaper, count-carries-predicate]
shared_with: []
use_when: [turning a repeated observed workflow into a callable capability, deciding whether a distilled procedure should be recalled or invoked, capturing a task from a demonstration, auditing a library of auto-generated skills]
---

# Procedure promotion

[consolidation](./consolidation.md) distils episodes into durable items, and one
of the kinds it produces is a **procedure** — the agent's belief about how a
recurring task is done. Everything else in this subject then treats that item
the way it treats any other belief: it is scored by the
[value model](./memory-value-model.md), selected by
[recall-injection](./recall-injection.md), and pushed into context as text the
model reads.

For a fact or a preference, that is the right destiny. For a procedure it is a
half-measure, and this technique owns the other half: **the point at which a
remembered procedure stops being something the agent reads and becomes
something the agent runs.**

The distinction is not cosmetic. A recalled procedure is advisory — injected,
reinterpreted, and re-derived every time, with a different result whenever the
context around it differs. A promoted procedure is an artifact: named, invoked
deliberately, versioned, testable, and reviewable by a human who can read it
without reading a transcript. The first is memory. The second is capability,
and a system that only has the first will re-derive its most common work
forever, slightly differently each time.

## What earns promotion

Promotion is a strictly higher bar than consolidation, because the output is
executed rather than considered. Four conditions, all of them:

1. **Recurrence, counted.** The procedure has been observed enough times to be
   a pattern rather than an incident, and the count travels with it
   ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)) —
   *observed N times across M sessions* is the record, "seems common" is not.
2. **Stable shape.** The observed runs vary in their inputs, not in their
   steps. A procedure whose step sequence differs every time has not been
   learned; a variable that changes across runs is a parameter, and
   identifying it correctly is most of the work.
3. **A stateable outcome.** There is a description of what "it worked" means.
   Without one the promoted artifact cannot be tested, and an untestable
   capability is one nobody can safely change later.
4. **Bounded consequence, or a gate.** A procedure that spends, deletes,
   sends, or publishes does not become invocable on the strength of having
   been seen a few times. It gets promoted with a gate attached
   ([hitl-approval](../../../orchestration/hitl-approval/hitl-approval.md)),
   or it does not get promoted.

A procedure that fails any of these stays a memory. That is not a failure
state — it is the correct destination for most of them.

## Capture, and why demonstration is not enough on its own

Two sources feed promotion, and they have opposite weaknesses.

**Observation** — the agent's own [episodic](./episodic-capture.md) record of
having done the task, repeatedly, in the ordinary course of work. High
confidence that the steps are real, because they happened; low confidence
about which parts were essential, because a single trace cannot distinguish the
necessary step from the incidental one. Repetition across varied contexts is
what resolves that, which is why the recurrence bar is a bar and not a
formality.

**Demonstration** — a human performs the task once, deliberately, for the
agent to learn from. High confidence about intent, because someone chose every
step; low confidence about generality, because one demonstration is one path
through a task and shows nothing about its branches, its failure handling, or
which of its constants were arbitrary.

The two are complementary and neither is sufficient alone. A demonstration
proposes the shape; observation across repeats confirms which parts of it were
load-bearing. Promoting from a single demonstration produces a brittle artifact
that encodes the demonstrator's incidental choices — the window that happened
to be open, the record that happened to be first — as though they were the
method.

**Capture carries provenance either way.** A promoted procedure names the
episodes or the demonstration it came from, for the same reason every other
item in this subject does: when it later behaves wrongly, the question is what
it was learned from, and a capability with no trail back to its evidence cannot
be debugged, only deleted.

## What the artifact contains: actions, not facts

The 2026 field measurement of skills in coding harnesses (8,135 controlled
trials across two harnesses and three benchmarks) settled what a promoted
procedure is *for*: in transcript-labelled successful uses, **procedural
anchoring — stabilised setup steps, tool orderings, verification checks,
pitfall avoidance — accounted for 65.7% of the value; explicit knowledge
injection for 4.5%.** Skills usually do not work by supplying missing
facts; they work by stabilising action. Two consequences for what the
promotion door admits:

- **Write the artifact as sequence and checks, not as background.** The
  facts a procedure needs are mostly reachable at run time; the ordering
  that avoids the known trap is not. A promoted procedure padded with
  explanation is paying the injection cost for the 4.5% mechanism.
- **Distill; never promote the trace.** The same study measured promoted,
  compressed procedures against replaying raw successful workflows:
  +6.06 points (CI +0.76 to +11.36), and environment-setup failures fell
  from 5.3% to 0.2% — because a raw trace carries the exploration, failed
  branches and noise of its first run into every future one. This is the
  subject's raw-transcripts-are-not-memory rule holding one layer up, and
  it was measured twice independently in the same year.

## Selection is the scaling failure

The same measurement followed promoted libraries as they grow, and the
degradation is not where the accretion warning below expects it. As pools
grew from 5 to 100 items, offline retrieval sagged (embedding precision
88.3%→76.9%, agent selection 70.0%→63.7%) — but **the precision of what
agents actually invoked during execution collapsed from 29.6% to 3.3%**,
while task success stayed roughly flat, because exact invocation of the
"right" skill proved neither sufficient nor strictly necessary. Confusable
near-duplicate neighbours stressed selection more than pool size itself.
Read together: a growing library fails silently, not loudly — the agent
keeps succeeding *around* the library while using it almost at random, and
aggregate success hides that the promotion investment has stopped paying.

- **Cap the live pool and scope it.** A session gets the procedures its
  declared domain earns, not the whole library; the selection surface is a
  budget like every other injection in this subject.
- **Treat confusable siblings as a merge-or-differentiate signal.** Two
  procedures whose descriptions a selector confuses are one procedure with
  a parameter, or two procedures whose `use_when` boundaries need to name
  each other. Leaving them adjacent taxes every future selection — and the
  cheap standing guard is static: lint the library's descriptions pairwise
  for vocabulary near-collision on every change, so a confusable pair is
  caught at admission rather than discovered in the invocation ledger.
- **Measure actual-use precision, not offline retrieval.** The offline
  number degraded gently and would have passed review; the in-execution
  number is the one that collapsed. The invocation accounting this
  technique already requires is the instrument — record *which* procedure
  the run invoked against which the task needed, per
  [gate-sees-target](../../../../_laws.md#gate-sees-target) logic: audit
  the behaviour, not the index.

The scoping rule has a sharper form than "declared domain". The same 2026
harness study that measured the verified working state found that a skill
store invoked against the *full interaction history* contributed +1.5 to
+2.0 points - within noise - while the same store invoked against a
verified **current task state** contributed to a +25.4 total. Select from
the library by what the working memory says is open now, not by what the
transcript mentions; a promoted procedure retrieved against history is
recalled for a need the task may have already closed.

## One promotion door

Promotion is a mutation of the agent's capability surface, and it gets exactly
one door
([one-validation-door](../../../../_laws.md#one-validation-door)). Whatever
promotes — a scheduled pass over consolidated procedures, an explicit operator
action, a demonstration recorder — arrives at the same validator, which checks
the four conditions, mints the identity, and records the provenance. A second
path that writes a capability directly is a capability nobody reviewed.

The door is also where the **human's role** in this subject applies at its
strongest. The standard already holds that an agent does not get to decide
unilaterally what it believes; it follows immediately that it does not get to
decide unilaterally what it can *do*. Promotion is the natural review point,
and reviewing a named artifact with a stated outcome is a tractable ask in a
way that reviewing a stream of consolidated beliefs is not.

## Identity, versioning, and the memory it came from

A promoted procedure gets its own identity, minted at promotion, never derived
from its name or from the episodes behind it
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). A
name is a label a human will want to change; an identity is what invocation
records, what failures attribute to, and what a later version replaces.

Re-promotion produces a **new version, not a silent overwrite**. The agent
observes the task again, the steps have shifted, and the honest outcome is a
second version with its own evidence — because "the skill changed" and "the
skill was always this" are different facts, and only the first explains a
behaviour change to someone who noticed one.

The source memory is **not** deleted on promotion. The procedure-as-belief and
the procedure-as-capability answer different questions ("how is this done
here?" versus "do it"), and the belief remains the evidence for the
capability's existence.

## Promoted capabilities accumulate, and name their reaper

A library that only grows is the accretion failure this subject already warns
about, relocated
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). Promoted
procedures decay in a specific way: the underlying task changes, the system
they drove moves, and the artifact keeps working in the sense that it runs.

So each carries invocation accounting — when it was last used, how often, and
whether it succeeded — and unused or persistently failing capabilities are
surfaced for retirement rather than left to be discovered by the run that
depended on one. Retirement returns the procedure to its honest state: a
memory of how something used to be done.
