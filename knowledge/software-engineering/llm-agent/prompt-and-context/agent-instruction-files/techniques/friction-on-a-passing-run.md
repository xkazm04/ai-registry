---
layer: technique
type: technique
subject: agent-instruction-files
technique: friction-on-a-passing-run
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [deciding what an agent must report at the end of a job, an unattended agent finishes and its report says only what it did, a loop improves its environment only from failed runs, the same workaround keeps reappearing across agent sessions, a learnings file keeps growing with notes on how to get around the tooling, choosing what a fixer agent may change without a person]
---

# Friction on a passing run

An agent that meets a slow gate, a flaky test, a missing command or a doc that
disagrees with the code usually finds a way around it and finishes. The job
passes. Nothing failed, so a loop that improves the environment only from
failed runs never hears about it: [capability-before-steering](./capability-before-steering.md)
is that loop's first gate, and a workaround never reaches it. With many agents
the same detour is paid for again in every session, where one person working in
the same code would have fixed it once.

So the end of every job asks a second question beside "what did you do": **what
in this environment cost you time, forced a guess or made you work around it?**

## When to ask, and about what

Ask at the end, after the work is verified, not during it. A mid-run report
competes with the task and invites a wider diff; at the end the agent reads
back its own session and reports what it paid.

Ask about the environment only: commands, gates, checks, paths, docs, the
brief. A defect in the agent's own change is its own work, and a product bug
noticed beside the task is a different lane with a different rule about who
may act on it.

## What a line carries

What happened, how a later agent can reproduce it, the cost (minutes lost, the
workaround used), and what was already looked at. **No guessed root cause:** a
guessed cause sends the fixer to the wrong owner.

## The admission bar, and why an empty report is valid

Admit only what the next agent in the same repository would hit too: durable,
reproducible, with an owner who could fix it. Do not admit a one-off confusion,
a session-specific nit, or anything the next agent could not act on without
this session's context. Both practitioner sources behind this technique set
that recurrence bar independently. If nothing clears it, the report says
`none`, and that is a result, not a skipped step
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

Friction that is cheap, safe and inside the current change is fixed there and
mentioned. The channel is for what is left over.

## A separate channel, never the learnings file

Do not append friction to the notes the next session reads as instructions. A
note that says how to get around a broken command is steering text written
against a capability gap: it cannot close the gap, and it taxes every other
line. One unattended harness did exactly this, appending every session's
learnings to a file fed whole into the next prompt. In its archive, 45 of 523
lines name a build command or tool workaround (a keyword count, so a rough
one), mixed in with codebase facts nobody had filtered.

Friction goes to a record a collector drains:

- **Keyed by cause and deduplicated.** Before adding, search the open records
  and add to a match. Repeats then show up as a count on one record, which is
  the signal that matters: a workaround reported in many sessions is a uniform
  failure in disguise. Report counts with their predicate: lines reported,
  distinct causes, causes seen twice or more, causes fixed, causes parked
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
- **Filed through the one path the collector reads.** In one source's own
  policy, filing by a route that drops the record's marker means the daily
  drain never sees it, and nothing errors. The sink's class and existence are
  [write-back-sink-class](./write-back-sink-class.md)'s audit; this technique
  is the collector that audit says it cannot judge.

## The drain: group by cause, propose few, act within a fence

The drain groups records by cause and turns only repeated causes into fix
proposals, each with its count and the lines behind it, and caps how many it
proposes in one pass. A fix that only teaches agents to avoid the problem is
not a fix; the fix is usually a capability, per
[capability-before-steering](./capability-before-steering.md): a command, a
check, a corrected doc.

The sources split on who acts, and the split has a discriminator:

| Question | Choices seen | Discriminator |
|---|---|---|
| Who fixes | a fixer agent fixes dev contracts and parks product calls; clear-cut file types are fixed automatically and code or guardrail changes become tickets; a person acts on every item | What the fix changes. Development tooling that lands through the project's normal review may be fixed by an agent. A change to the loop's own rules, gates or guardrails takes a person's approval, per [memory-governance](../../agent-memory/techniques/memory-governance.md). A product decision is parked with a recommended fix and not reopened until a person answers |
| Cadence | per job; weekly batch; on demand | Volume. Per job suits a loop with few long jobs; a batch is cheaper in tokens when reports are many and short. Neither cost was measured |
| What is admitted | only what the next agent would hit; every paper cut; everything, ordered by severity | Whether a drain exists. A recurrence bar is what lets an automatic drain run without drowning; a person reading one session's retrospective can take everything |

## Measuring it

Before turning it on, count what already exists: workaround notes in the
learnings files, and detours the loop's own records mention. After several
sessions, count lines reported, distinct causes, causes seen twice or more,
how many of those reached a fix, and re-reports of a cause after its fix. Causes
still open with more than one report is the number a healthy loop drives down.
A loop whose records never reach a fix is a journal, not a lane. If lines are
many and repeated causes are none, the bar is too loose.

## Evidence and limits

Two practitioner channels reached the rule without each other: one public
repository carries it as policy, with a filing bar, a dedupe-before-filing rule,
a park label and a daily sweep; a second practitioner runs a friction log with a
weekly pass that groups notes by cause into at most three proposals. A public
retrospective skill the second cites asks the same environment question on
demand and only suggests. In one fleet, a director-and-builders loop pointed at a
game's development tooling used the agent lanes' own "what blocked" sections as
its evidence and shipped all twelve directions it accepted; that is corroboration
that the reports are worth reading, not a measure of this mechanism. **No source
measured repeat counts before and after.** That number is owed by the first
application.
