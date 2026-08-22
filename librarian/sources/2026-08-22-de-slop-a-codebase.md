---
source: youtube
url: https://www.youtube.com/watch?v=3MP8D-mdheA
title: "How To De-Slop A Codebase Ruined By AI (with one skill)"
author: Matt Pocock
kind: practitioner-deep-dive (sub-class: technique demonstration)
mined_on: 2026-08-22
words: 2456
skill_version: 0.5.0
extracted: 6
picked: 1
proposed: 1
already_covered: 1
declined: 0
leads: 0
untriaged: 4
dispatched: 1
---

# De-slopping a codebase, 2026-08-22 - the most foundational gap the loop has found

Fifth run. Same author as [[2026-08-22-skills-v1-2-release]] but a different sub-class:
a **technique demonstration** rather than a release walkthrough - one skill, explained
and then run against a real repository on camera.

The run produced one finding, and it is the largest one the method has surfaced.

## Proposed and dispatched

### A1 - A subject for module design -> [`docs/subject-proposal-module-design.md`](../../docs/subject-proposal-module-design.md)

**A 124-subject software-engineering bundle owns nothing about module boundaries.**
Verified two ways before the proposal was written: every subject slug matched against
`modul|architect|boundar|interface|coupl|refactor|depend` returns only
`client-architecture`'s five subjects, which are about client state, transport and
localisation; and `grep -ril "deep module|ousterhout|philosophy of software design"` over
the whole bundle returns nothing at all.

The adjacent subjects each own a different job. `codebase-scanning` finds defects and
says nothing about what good structure is. `quality-gates` enforces a standard without
supplying one. `test-harness` builds the harness but not the seams that make code
testable. `dead-code` finds what is unreachable, not whether what remains is well
divided. Every subject in `engineering-process` presupposes somebody decided where the
boundaries go, and nothing says how.

Five techniques proposed: `module-depth`, `seams-and-adapters`, `locality-and-leverage`,
`structural-improvement-loop`, `structure-is-not-delegable`. The first three rest on
established literature (Ousterhout, Cockburn, Feathers) and need no web hardening; the
last two are the contemporary half and do.

**Dispatched to a forge worker**, per the operator's decision, rather than resolved here.
The spec names the boundaries the subject must not absorb, three open questions the
drafter must decide rather than discover, and the deliberate tension below.

**The tension is the most interesting content in the proposal.**
`structure-is-not-delegable` argues that an agent finds structural candidates and cannot
choose which are worth having. Run 3's
[`orchestration-to-tool-migration`](../../knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools/techniques/orchestration-to-tool-migration.md)
argues that as capability rises, decisions migrate from orchestration to the agent. Both
are right, and the boundary between them is the finding: that technique governs decisions
with an outcome measurable **inside the run**, this one governs decisions measurable only
**over months**. A decision the harness cannot score is one the migration argument does
not reach. The spec requires the forger to reference it and state the boundary rather
than restate or quietly contradict it.

## Already covered (catch)

### A6 - A shared glossary with the AI

**Fourth independent sighting of the vocabulary thread**, and the first that arrived
after it had been landed. Run 3 proposed it as `canonical-terminology-glossary` inside a
subject proposal; run 4's source argued the cure for verbosity is your own language, and
it landed as
[`house-vocabulary-layer`](../../knowledge/software-engineering/llm-agent/prompt-and-context/prompt-assembly/techniques/house-vocabulary-layer.md);
this source independently added a terminology glossary to its own skill for the same
stated reason ("you can be a lot more precise with what you're asking for").

Worth recording as a property of the method rather than of these sources: a thread seen
four times across three authors and two source classes is as close to convergence as
this loop is going to get, and the technique that resulted was written on the third
sighting rather than the first. That was the right call - the first two sightings named a
symptom and only the third supplied the mechanism.

## Untriaged (extracted, not picked)

| # | Title | Nearest prior art | Anchor |
| --- | --- | --- | --- |
| A2 | The agent finds architecture candidates; it cannot choose which are worth having | folded into the subject proposal as `structure-is-not-delegable` | `[09:24]` |
| A3 | A candidate is grounded in real code on both sides before it is discussed | folded in as part of `structural-improvement-loop` | `[07:15]` |
| A4 | A blanket auto-approval grant breaks a flow whose value IS the human's turn | `hitl-approval / unattended-mode` - **3rd sighting** of this thread | `[05:33]` |
| A5 | Seams are the mechanism that makes agent-driven change safe, not a byproduct | folded in as part of `seams-and-adapters` | `[10:14]` |

`A2`, `A3` and `A5` are absorbed by the dispatched proposal and need no separate
handling. **`A4` is the one still owed a decision.** It is small, it is the third
independent sighting of the unattended-mode thread (run 2 added enumerated-versus-inferred
scope; run 4's source demonstrated auto-approval as a default), and this source supplies a
distinct case neither covered: the operator turns auto mode OFF before running a
human-in-the-loop flow, because a blanket grant does not speed such a flow up - it deletes
the turn the flow exists for. Left untriaged rather than landed.

## Not done, and deliberately

- **No fetches.** Third consecutive run with the corroboration budget untouched, for the
  same reason: a practitioner demonstrating their own tool needs no lane to confirm what
  they did. The budget binds on second-hand surveys only.
- **The subject was not written here.** `XL` is specified, never half-built, and this one
  was additionally dispatched rather than queued - the first time the method has handed
  work to a worker instead of banking it.

## For the next run

- **The technique-demonstration sub-class runs a tool against a real repository on
  camera**, which means its claims are grounded in an artifact rather than in
  recollection. That is a stronger evidentiary position than the release walkthrough and
  it showed: one finding, and it was the biggest one.
- **A gap can be foundational and invisible for the same reason.** Nothing in the corpus
  pointed at the module-design hole, because every subject that would have cited it simply
  assumed it. The instrument found it only because a source arrived speaking a vocabulary
  the corpus does not contain - which suggests a periodic sweep for *vocabulary* the
  corpus lacks, rather than for subjects it lacks.
