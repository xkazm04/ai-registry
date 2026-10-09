---
status: EXECUTED (2026-10-09, intake-1009-dbga; worker made no overrides)
source: librarian/sources/2026-10-09-debug-agent.md
run_id: intake-1009-dbga
bundle: software-engineering
category: engineering-process/codebase-stewardship
subject: live-defect-debugging
resolved_path: knowledge/software-engineering/engineering-process/codebase-stewardship/live-defect-debugging/
category_count: 8 subjects now, 9 after (cap 10, V1 clear). llm-agent/orchestration and llm-agent/runtime-and-io are both AT the cap and were rejected for that reason.
---

# Spec: live-defect-debugging

## Why this is XL and why it is proposed rather than written

Six candidates from one small repository share one home and none has one today. A
prior-art agent opened the closest neighbours (grounding-over-deliberation,
oracle-frozen-during-repair, stuck-loop-detection, failure-attribution,
failure-diagnosis, negative-control-tests) and found: M2-M5 NO HOME, M1 and M6 boundary
cases of techniques whose subjects are about something else (a chain step; a committed
repair oracle). No subject's stated job is "an agent working a live defect". Three or
more candidates with one home-if-new fires the XL trigger mechanically. The evidence is
one practitioner tool (n=1), which is why this is a forge with a worker and a director
review, and why every technique must be argued from first principles and the neighbours,
not from the tool.

## The subject's job (golden path opening must say this and name boundaries)

An agent (or person) is handed a defect it cannot see: a behaviour report, no failing
check, code that reads correct. The subject owns the loop that turns that into a proven
root cause and a fix that is known to work: reproduce, hypothesise, instrument, read the
evidence, fix, verify on the same instrument, clean up.

It must NOT absorb: constraints on what a fixer may write to once a failing check exists
(quality-gates/oracle-frozen-during-repair owns that and this subject starts BEFORE a
check exists); verifying a claim inside an agent chain (agent-chaining/grounding-over-
deliberation); halting a repeating failure loop (session-continuation/stuck-loop-
detection); offline suite triage (eval-harness/failure-attribution); the runtime sink
architecture of a product (observability-telemetry); dead production code
(dead-code). Say in the golden path where each boundary sits, in prose, no cross-bundle
links.

## Proposed techniques (decision rule each must carry)

1. `evidence-gated-fix` - A fix is applied only when evidence captured from the running
   system confirms exactly one hypothesis; reading code alone, however convincing, is not
   evidence, and an agent's confidence is not a substitute. Include the discriminator:
   when a hypothesis can be settled by a pure read (a type, a constant) that IS evidence
   from the artifact, state where the line sits. Expected failure rate of first fixes is
   high; the rule is that iteration is cheap and an unproven fix is not.
2. `hypothesis-mapped-probes` - Enumerate 3-5 hypotheses before touching code; every probe
   is tagged with the hypothesis ids it can discriminate; the probe count is the minimum
   that confirms or rejects ALL hypotheses (a ceiling around ten, narrow the hypotheses
   before exceeding it); each hypothesis ends in a closed three-state verdict with the
   evidence lines cited. If all are rejected, the next round draws hypotheses from a
   different subsystem, not a variation. Open question for the drafter: why 3-5 and not
   1-2; the answer is about probe cost versus rounds, say it.
3. `revert-rejected-fixes` - When evidence rejects a hypothesis, the code changed on its
   behalf is reverted before the next round; only probes and proven fixes survive.
   Speculative guards otherwise accumulate and mask the next defect. Boundary: an
   `auto-rollback` is a runtime healer; this is the author's own edit discipline.
4. `marked-temporary-probes` - Every added probe sits inside a start/end marker the
   editor can fold and a search can find, so removal is deterministic: search, delete
   block to block, search again for zero, review the diff for strays. Probes stay
   through the fix and its verification and leave only after the verification run proves
   success and the owner confirms. Probes never carry secrets or personal data.
   Boundary versus a build-time instrumentation gate (agent-addressable-ui): that keeps
   dev tooling out of production builds; this governs probes an agent adds by hand.
5. `run-scoped-evidence` - Each run starts from an empty sink that belongs to this
   debugging session; runs are labelled (before-fix, after-fix) so the comparison cites
   lines from two labelled runs; a session never clears or edits a sink it did not create
   (several sessions can share one machine). Clearing the sink is not removing probes.
6. `reproduction-ladder` - Prefer, in order: an existing failing check; a reproduction the
   agent writes and runs itself (cheap, deterministic); a human performing numbered steps
   when neither is reachable. Once a path is confirmed, every later iteration reuses it
   without re-asking. Say what makes rung two unsafe (state it mutates, production data).

## Applications

Source-tree applications are owed (the source's own clone is an opened tree, stack
`node`): one each for `marked-temporary-probes`, `run-scoped-evidence` and
`evidence-gated-fix`, citing the source's skill file and server file by
`path:line "quote"` anchors verified with `node scripts/check-anchors.mjs <doc> --root
C:/t/intake-1009-dbga`. `verified_against` names the engines/CI pin the tree witnesses.
Each opens by saying what the realization CANNOT do: the skill enforces every rule by
prose to a model, nothing in the server checks that a probe has a marker or a
hypothesis id.

## Open questions the drafter decides

- Is hypothesis-mapped-probes one technique or two (generation versus verdict)?
- Where does "a hypothesis settled by reading" end and "code-only reasoning" begin?
- Does the three-state verdict need a fourth (the evidence is absent because the probe
  never fired)? The source's own rule for an empty log is "reproduction may have failed";
  decide whether that is a verdict or a precondition.

## Instances that exist in a tree you can open

C:/t/intake-1009-dbga (read-only clone, commit 295af90b): packages/debug-agent/skill/
SKILL.md (the loop, the markers, the cleanup), packages/debug-agent/src/server.ts (per-
session sink, DELETE clears one session), .agents/skills/debug-agent/SKILL.md (an earlier
revision, the diff is the history of the daemon change).
