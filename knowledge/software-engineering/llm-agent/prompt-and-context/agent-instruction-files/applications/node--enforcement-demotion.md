---
layer: application
type: application
subject: agent-instruction-files
technique: enforcement-demotion
stack: node
status: forged
verified_on: 2026-09-05
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A condition-observed Stop hook against an every-prompt banner, replayed over recorded sessions (Node)

Two projects in one fleet run the same shape of hook: a Node script registered
on the harness's `Stop` event that reads the session transcript, collects the
files the last turn edited, matches them against a rule map of source globs to
feature documents, and — only when a mapped source changed and its document did
not — writes a ~110-word reminder to stderr and exits 2, which the harness feeds
back to the model. On every other turn it exits 0 and says nothing. The
decision is a pure exported function over the edited-path set, so it can be
replayed offline.

This is the technique's "name the gate" form: the program decides *when* the
line is spoken, and the line itself is prose the model weighs.

## The two arms

- **A** — the every-prompt form observed in a skill-extraction tool the same
  day: a 176-word reminder printed unconditionally on each human prompt.
- **B** — the fleet's form: the reminder printed only when the hook's own
  predicate fires.

Same inputs on both arms: every recorded transcript of the smaller project and
the 400 most recently modified transcripts of the larger one, split into human
turns with the hook's own turn-boundary function (a tool result is not a turn),
each turn's edited set evaluated with the project's live rule map.

## What was read

| project | sessions | human turns | turns with an edit | B fired | fire rate | A words injected | B words injected |
| --- | --- | --- | --- | --- | --- | --- | --- |
| smaller | 26 | 487 | 95 | 50 | 10.3% | 85,712 | 5,500 |
| larger | 394 | 1,144 | 131 | 72 | 6.3% | 201,344 | 7,920 |

Across both: 122 fires on 1,631 turns (7.5%). Arm A would have spoken on 1,405
turns that edited nothing (86%). The word ratio is 15.6x and 25.4x.

**Verdict: `better` for B**, on the measurable the technique names — words of
advisory text paid per session for one rule. The verdict is about cost; the
arms are identical on what the model is told when the condition holds.

## What this cannot show, and the falsifier

The replay measures the cost of unconditional delivery, not its benefit. Arm
A's authors claim it raises activation of a judgment-call rule; no arm here can
see compliance, because the doc-sync rule is machine-observable and the
skill-extraction rule is not. The falsifier for the amendment this supports is
a paired run of one judgment-call line delivered once per session against the
same line delivered per prompt, scored on whether the model acted on it. The
fleet has no such instrument today; the return condition is a project that
adopts a per-prompt prose hook and can count what it changed.

## The structural fact

Three copies of this hook exist in the fleet at 185, 204 and 320 lines
(re-read 2026-09-05: unchanged; the two 185- and 204-line carriers pin node 24
in `engines` and CI, the 320-line carrier's CI pins node 20), and
the longest one's header records that an earlier version "silently detected
nothing for its entire life" over 1,136 edit calls because its turn-boundary
check stopped on tool results. A condition-observed hook can be dead and look
green — the technique's "a claimed gate must actually fire" clause — and the
fix the tree records is a third exit code for *could not check*. An
unconditional banner cannot fail this way, which is the one honest thing to
say for it, and it is the wrong fix: the cure for a silent gate is a loud
gate, not a gate that never observes anything.
