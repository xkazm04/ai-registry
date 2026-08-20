---
layer: golden-path
type: golden-path
subject: remediation-handoff
status: forged
use_when:
  - packaging assessment findings into work for a coding agent you do not run
  - deciding when a claimed fix may be marked resolved without a human confirming
  - designing a machine-readable resolution marker that travels back through the code
  - shaping how many findings go into one autonomous session
techniques:
  - batch-shaping-for-one-session
  - single-artifact-prompt-construction
  - resolution-trailers
  - evidence-based-auto-close
  - claim-carry-forward-rules
  - handoff-tenancy-and-idempotence
---

# Remediation handoff

An analysis system that finds things is only half a system. The other half is
the question of what happens next, and the honest answer for most findings is
that *someone else, somewhere you cannot see, does the work*. The engineer
who will fix the gap does not work inside your product. They work in a
terminal next to the codebase, with an autonomous coding agent that has
filesystem access you do not have, on a branch you cannot read, under a
network you cannot reach. Remediation handoff is the discipline of
**packaging findings into work that agent can execute without you, and then
detecting completion from the codebase rather than from anyone reporting
it**.

Two properties define the subject and neither is optional. The first is
*externalization*: whatever you hand over must survive the trip, because
after the handoff you get no further chance to clarify. There is no callback,
no session log, no tool-call trace, no place to answer the agent's question.
The artifact is the entire interface. The second is *return without a
callback*: the work happens outside your trust boundary, so completion must
come back as evidence you can independently observe — most cheaply, as a mark
the agent leaves in the codebase's own history — rather than as a human
clicking a button that means "trust me".

Get either wrong and the loop fails in a characteristic way. Get the artifact
wrong and the agent does something plausible and unrelated. Get the return
path wrong and the finding stays open forever after the fix has landed, until
someone closes it by hand — at which point you have not built a loop, you
have built a list with extra steps.

## Where this sits among its neighbours

The seams matter here more than usual, because four adjacent subjects all
touch "a finding becomes work".

The **ordered ledger** of findings — its ordering policy, its item identity
under refresh, the verdict controls, and the write-back of a human verdict to
the system of record — belongs to
[triage-queues](../../../operations/service-operations/triage-queues/triage-queues.md), and is assumed here. This
subject begins at the moment an operator selects rows from that ledger and
ends when a later observation of the codebase closes them.

**Deriving and ranking the items themselves** — turning an assessment into a
prioritized remediation plan, projecting what each fix is worth, sequencing
dependencies — is the [`remediation-roadmaps`](../../../engineering-assessment/reporting-and-remediation/remediation-roadmaps/remediation-roadmaps.md) subject. You begin where it
stops: the roadmap says *which items and in what order*; you decide *which of
them fit in one session, what the executing agent must be told, and how you
will learn it is done*.

The **human gate** — a person authorizing a consequential action before it
runs — is [hitl-approval](../hitl-approval/hitl-approval.md). A handoff is
not a gate. Nothing of yours is suspended waiting for it; the operator is
starting work elsewhere, not unblocking work here.

**Orchestrating agents you control** — spawning them, passing context between
steps, retrying, reading their output — is
[agent-chaining](../agent-chaining/agent-chaining.md). This subject is the
exact complement: **you never see the agent run.** Every technique here
exists because the ordinary orchestration affordances are absent. If you can
read the agent's transcript, you do not have a handoff problem; you have a
chaining problem, and the chaining subject's tools are better.

## The loop

The whole subject is one cycle, and it is worth stating as a cycle because
each part only makes sense as a consumer of the previous one:

**assess → ledger of open findings → select a batch → one self-contained
artifact → an agent you do not watch → a marker in the commit history → the
next assessment reads the history and the code → resolved, or still open.**

The cycle's crucial property is that the *closing* observation is the same
mechanism as the *opening* one. You do not build a completion-reporting
channel; you re-run the analysis you already run, and let it discover both
new findings and the evidence that old ones are gone. A separate reporting
channel would be a second source of truth about the codebase, and the
codebase would win every disagreement anyway.

## What the artifact must be

An agent working somewhere you cannot see receives exactly one thing. That
constrains it sharply:

- **One artifact, self-contained.** Everything needed to act — the findings,
  their identifiers, why each matters, the working rules, and the return
  contract — is in the text. A link back to your system is not a substitute:
  the agent may not be able to reach it, may not be authorized, and may
  hallucinate what is behind it.
- **One codebase per artifact.** A prompt is for one repository, because an
  agent session has one working tree, one set of conventions, and one branch.
  A batch that spans several codebases becomes several artifacts, or one
  artifact with an explicit "work one at a time" instruction and per-codebase
  sections — never an undifferentiated list.
- **The finding in the assessment's own words.** Do not re-summarize the
  finding for the prompt. Re-summarizing invents a second wording of the same
  item, which will not match the wording the next assessment produces, which
  quietly breaks the title-based half of the resolution rule.
- **Stable identifiers, verbatim.** Each item carries the identifier the
  ledger holds, exactly, because that identifier is what comes back.
- **Working rules, not just findings.** Branch first. Smallest real change.
  Read the codebase's own contribution guidance before changing anything.
  Skip what does not apply and say why. Do not edit files merely to satisfy
  a checker.
- **Deterministic construction.** Same items in, same text out. A prompt that
  varies run to run cannot be diffed, cached, or tested, and its failures
  cannot be reproduced.

The construction rules are [single-artifact-prompt-construction](./techniques/single-artifact-prompt-construction.md);
how many items belong in one is [batch-shaping-for-one-session](./techniques/batch-shaping-for-one-session.md).

## What comes back

The return channel is the constraint that shapes everything else. You cannot
poll the agent. You cannot receive a webhook from a terminal. What you *can*
do is observe the codebase later — and if your analysis already reads recent
commit messages for any reason, a marker written there costs the agent one
line and costs you nothing.

This is the subject's central design move: **a resolution marker in the
commit message, keyed to the item identifier**, is a positive, deterministic,
zero-infrastructure completion signal. It is deterministic because it is an
exact key match, not an inference. It is positive because its presence means
something definite; its absence means only "no claim was made", never
"unresolved" — a distinction with real consequences, and the reason a second
rule is needed at all. The marker's grammar, parsing tolerance and failure
modes are [resolution-trailers](./techniques/resolution-trailers.md).

The second rule is the inferential one: if the fresh assessment simply *does
not raise the finding again*, the work is evidently done, whether or not
anyone said so. This is weaker than a marker and stronger than a human's
word, and it is only safe under conditions the naive version ignores — see
[evidence-based-auto-close](./techniques/evidence-based-auto-close.md).

## The hard part: honouring an unconfirmed claim

The genuinely difficult rule in this subject is what to do with an item
someone claimed, when the next assessment neither carries its marker nor
restates it. The tempting answer is "keep it open until proven fixed". The
correct answer, in a system whose findings are regenerated from scratch each
run, is the opposite: **an item that was claimed is carried forward only by
its own title; if the new assessment does not say it again, the claim is
honoured as resolved.**

The reason is subtle and is the most expensive lesson in the subject.
Matching old findings to new ones is usually done in tiers of decreasing
confidence — exact title, normalized title, and then some structural fallback
such as "this is the only unmatched item in its category on both sides, so
they are probably the same". That last tier is right for *unclaimed* items:
it prevents a trivially reworded finding from resurfacing as new. It is
catastrophically wrong for a *claimed* item, in any system whose analysis
always produces at least one finding per weak category. The fixed gap
disappears; the category produces its next-worst gap; the loose tier pairs
them; and the claim rides forward onto work nobody ever took on. The result
is an item marked "in progress" that no human is progressing, and it is
invisible because it looks exactly like a legitimate carry-forward.

So the rule is asymmetric by design: **loose matching for open items, strict
matching for claimed ones.** Asymmetry is not an inconsistency to be tidied
away later; it is the design. The full rule set, including what happens to
the newly produced finding that took the old one's place, is
[claim-carry-forward-rules](./techniques/claim-carry-forward-rules.md).

## The ledger of known gaps

Every implementation of this loop has holes, and the mature practice is to
write them down next to the design rather than discover them in support
tickets. Three are near-universal:

1. **A fix that lands without a marker and leaves the wording restatable
   stays claimed.** Both closing rules miss it. The artifact asks for the
   marker precisely because of this hole, and the surface must keep a manual
   resolve control for exactly the fixes the analysis cannot see.
2. **The artifact carries the assessor's words, not the codebase's
   evidence.** It states the finding and its rationale, not the file excerpts
   that produced it. This is a real limitation: the agent must rediscover the
   evidence. Grounding the artifact in stored evidence is the obvious
   improvement, and naming it as absent is more honest than implying the
   prompt is grounded.
3. **Resolution is defined at the branch you assess.** If only the default
   branch is assessed as authoritative, then "resolved" means *merged and
   reassessed*, not *committed somewhere*. Say so in the artifact, so the
   operator is not surprised when a completed session does not close
   anything yet.

Publishing this ledger is craft, not weakness. A loop whose gaps are
enumerated is a loop people trust with the parts that do work; a loop that
claims to close everything is one they stop believing after the first
counterexample.

## Failure modes of the naive reading

- **Treating the artifact as a ticket.** Assignees, due dates, sprint
  fields, initiative rollups: quarter-sized planning machinery around work
  that is one session long. It is not wrong so much as inert — nobody
  maintains it, and it pushes the actual executable content off the surface.
- **A completion button.** Any "mark done" control that is not backed by an
  observation of the codebase converts an evidence loop into an honour
  system. Keep a manual control for the cases evidence cannot cover, and be
  clear in the record which mechanism closed each item.
- **Per-finding tickets for a fleet-wide gap.** When the same weakness
  appears across most of the estate, opening one item per codebase is the
  wrong batch shape entirely; it is one practice decision with many
  applications, and it should be handed off as such.
- **Silent status inference.** Every automatic close writes a record saying
  *which* mechanism closed it — marker, or no longer raised — because when a
  user disputes a closure, "the system decided" is not an answer.
- **A shared handoff endpoint without ownership checks.** The batch names
  identifiers; identifiers from another tenant must fail the whole request,
  never be skipped, or the endpoint becomes an oracle for guessing which
  foreign identifiers exist ([handoff-tenancy-and-idempotence](./techniques/handoff-tenancy-and-idempotence.md)).

## The techniques

- [batch-shaping-for-one-session](./techniques/batch-shaping-for-one-session.md) —
  sizing a batch to one autonomous session; per-codebase splitting; the
  fleet-wide gap that is one practice, not many tickets.
- [single-artifact-prompt-construction](./techniques/single-artifact-prompt-construction.md) —
  the self-contained document: sections, ordering, identifiers, rules block,
  return contract, determinism.
- [resolution-trailers](./techniques/resolution-trailers.md) — a machine-readable
  resolution marker in the commit message; its grammar, parsing tolerance,
  and why presence is a signal but absence is not.
- [evidence-based-auto-close](./techniques/evidence-based-auto-close.md) —
  closing an item from what the codebase shows rather than from a report;
  the two admissible signals and their preconditions.
- [claim-carry-forward-rules](./techniques/claim-carry-forward-rules.md) — the
  asymmetric matching rule for claimed items; why the loosest tier is
  excluded; what happens to the replacement finding.
- [handoff-tenancy-and-idempotence](./techniques/handoff-tenancy-and-idempotence.md) —
  the claim write itself: ownership over every identifier, bounded batches,
  re-send safety, and refusing to reopen closed items.
