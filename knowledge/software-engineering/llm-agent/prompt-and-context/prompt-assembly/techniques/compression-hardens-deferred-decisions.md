---
layer: technique
type: technique
subject: prompt-assembly
technique: compression-hardens-deferred-decisions
status: forged
laws: [silent-state-is-ungoverned, gate-sees-target]
shared_with: []
use_when: [a standing layer is about to be rewritten smaller, an automated loop is proposing a shorter version of a prompt, a shortened prompt shipped and behaviour changed in a way nobody predicted, deciding what a test over prompt text should assert, a rewrite made the instruction shorter and the agent more cautious]
---

# Compression hardens deferred decisions

[context-budgeting](./context-budgeting.md) authorizes shrinking a standing
layer with arithmetic: a one-time authoring cost against a per-inclusion
saving, adjusted for cache state, producing a break-even in inclusions. That
is the whole cost side, and it is modelled carefully. The risk side is
modelled nowhere, and it is not symmetric with the cost side — the cost of a
shrink is bounded by the authoring effort, and the cost of the wrong shrink
is bounded by nothing.

The failure is specific enough to design against. **Compression does not
shorten a prompt in a random direction. It preferentially deletes the parts
that carry no local justification, and in an instruction those are the
hedges** — the conditionals, the qualifications, the *usually*, the *consider
whether*, the enumerated exception. Every one of them looks like filler when
read alone, because that is what a hedge is: a phrase that adds no assertion.
Deleting it does not make the rule shorter. It makes the rule **stronger**,
and the resulting prompt is both smaller and more categorical than the one it
replaced.

## A hedge is where authorship declined to decide

The reason the deletion is dangerous is not stylistic. A hedged instruction is
a **deferral**: the author faced a choice, judged that the right answer
depends on the call, and delegated it to the model at runtime. The hedge is
the delegation's only representation in the artifact. Remove it and the
decision has not been removed — it has been **made**, at authoring time, by a
process that was optimizing token count and did not know a decision was
present.

The direction is predictable, which is what makes it worth a technique. A
deferral collapses toward the restrictive branch, because the restrictive
branch is the one that can be stated as a rule. "Prefer running these in
parallel where they are independent, and weigh the side effects" is a
delegation; the shortest faithful-sounding rewrite of it is a scheduling
policy, and a scheduling policy is a cage. This is
[restraint-amplifier-balance](../../agent-instruction-files/techniques/restraint-amplifier-balance.md)
arriving through a door that technique does not watch: it audits the ratio of
restraints to amplifiers in a file somebody wrote, and a compression pass
manufactures restraints out of amplifiers without adding a line.

The field instance is worth carrying with its outcome. A meta-prompting loop —
the model iteratively rewriting its own standing guidance — halved one tool's
prompt. Cautious parallelism guidance came back as a hard scheduling policy,
and independent sub-agents began running one after another. Offline evaluation
did not catch it; the online experiment did, and the experiment was stopped.

## The fix that worked was shorter *and weaker*

The eventual replacement was a single sentence in place of an explicit
allowlist and denylist, and its important property is not its length:

> *Independent units can run in parallel; consider side effects.*

It is shorter than what it replaced **and less restrictive**, because it
returns the decision to the model rather than encoding one. That is the shape
a safe compression takes. The distinction is the technique's decision rule:

- **Compression that transfers a decision to the model is safe.** It removes
  the enumeration and keeps the delegation. It is usually a large saving,
  because enumerations are where standing layers get fat.
- **Compression that resolves a decision the hedge was deferring is a behaviour
  change wearing a token saving.** It may still be right — but it is a product
  edit, reviewed at that layer's stakes, not a hygiene pass.

Before accepting any shortened candidate, read the diff for phrases that
*conditioned* an instruction and are now absent, and for each one say which
branch the new text picked. If the answer is "it does not pick one, the model
still decides", the deletion was free. If a branch got picked, somebody just
made a product decision by deleting words.

## The behaviour is untested exactly where it is most compressible

The two halves of this technique are the same fact seen twice. A hedged
instruction has no crisp assertion, so it is the hardest kind of line to write
a test against — and it is the first kind a compressor deletes. **The most
compressible lines are the least tested lines**, by construction, and a
compression pass therefore walks straight down the untested column.

So: **prompt behaviour needs tests, or a shorter prompt removes a behaviour and
nothing notices.** Nothing is the operative word. The loss is not a failing
assertion or a raised error; it is an action that stops being taken, which
leaves no artifact to inspect
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).
A cost benchmark and a task-success rate both go on looking fine, because the
serialized work still completes — slower, and the benchmark was not timing it.
A suite that measures cost and success is a proxy for behaviour, and a gate
reading it has not seen its target
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

A behavioural test over prompt text asserts that a *stated behaviour still
happens* under a scenario that exercises it — the sub-units did run
concurrently, the tool was reached for, the alternative was surfaced — and it
is the only instrument that can fail when a line is deleted. Write the ones
the shrink is meant to preserve **before** commissioning the shrink; they are
the specification the rewrite is being held to, and a rewrite with no such
specification is not a compression, it is a redraft.

## The suite is grown from regressions, not designed

No up-front test set covers a standing layer's behaviours, and pretending
otherwise is how the first regression is treated as bad luck. The discipline
that works is a ratchet, and it has an ordering that is the whole point:

> When a shrink regresses a behaviour in production, **write the test for that
> behaviour before changing the prompt again.**

Not after the fix, and not alongside it. The tempting move is to correct the
text immediately — the diagnosis is obvious once the symptom is seen, the fix
is one sentence, and the cost is accruing. Take the fix first and the suite
still cannot see the behaviour, so the next compression pass is free to delete
it again, and the recurrence will read as a new incident.

This also repairs an asymmetry in the offline/empirical ladder. The ladder is
one-directional by default — the cheap level gates the expensive one
([certification-levels](../../../evaluation-and-cost/eval-harness/techniques/certification-levels.md))
— and nothing in it says what an empirical catch owes the theoretical level.
It owes a test. A behaviour that only the expensive instrument can see is a
behaviour the cheap instrument is now **known blind to**, and the catch is the
one moment the blind spot has a name, a reproduction and somebody's attention.
Spend it there.

## Decision rules

- Read a shortened candidate for deleted conditionals, not for deleted words.
  For each, name the branch the new text picked; if it picked one, route it as
  a product edit rather than a hygiene pass.
- Prefer the rewrite that returns the decision to the model over the rewrite
  that encodes it. It is usually also the shorter one.
- Write the behavioural tests the shrink must preserve before commissioning
  the shrink, not after reviewing it.
- Treat a cost-and-success suite as blind to behaviour loss. It is, and it
  will stay green.
- When a shipped shrink regresses, stop, write the regression test for the
  exposed behaviour, and only then change the text again.
- Run the restraint/amplifier census after any automated compression pass, not
  only after a human rules pass — a compressor produces restraints out of
  amplifiers with no line added and no diff a census would otherwise be
  pointed at.

## Where it fails

- **A layer with no deferrals in it.** Reference material, capability
  descriptions, generated inventories — these carry facts, not delegations, and
  compressing them is the pure arithmetic problem
  [context-budgeting](./context-budgeting.md) already owns. This technique
  begins where a layer contains instruction.
- **Treating every hedge as load-bearing.** Some hedges are genuinely
  authorial throat-clearing, and a rule that never allows their removal makes
  standing layers immortal. The check is not "is this word a hedge" but "does
  removing it decide something" — and most of the time nothing was ever
  deferred.
