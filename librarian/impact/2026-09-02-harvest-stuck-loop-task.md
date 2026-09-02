---
plan: 2026-09-02-harvest-stuck-loop-task
domain: software-engineering
source_run: intake-omc-0902
technique: stuck-loop-detection
subject: session-continuation
mode: task
branch: intake-omc-0902/harvest-stuck-loop
status: first-step-taken
---

# Task: give the registry's own loops a failure-identity stop

The registry's `/harvest loop N` and `/deepen` saturation loop are the fleet's
only managed continuation loops. Their stop rules are a pass cap, a
two-pass "nothing but leads and catches" stagnation rule, and a budget guard.
None of them stops on *failure identity*: a loop whose every pass fails the
same way - the same admission refusal, the same red gate, the same miner error
class - runs to its cap. `session-continuation/stuck-loop-detection` says the
signal is the repeated signature, not the attempt count, and that stagnation
and failure need separate counters.

## Files touched

- `.claude/skills/harvest/SKILL.md` - the stop rule (this branch's first step;
  eight lines, version 0.2.0 -> 0.3.0).
- `.claude/skills/deepen/SKILL.md` - the saturation loop's stop rule (not yet;
  same shape, ~8 lines).
- `librarian/harvest/index.md` - the report shape gains a `halted: <signature>`
  line so a halted loop is legible in the ledger (~4 lines).

## Size

Three files, roughly 20 lines. No script changes: the loops are prose-driven
skills, so the rule lands as text the operator's session reads.

## The measurable, and the gate that sees it

Measurable: passes spent after the first repeated failure signature. Today it
is unbounded up to N; after adoption it is at most three. Read from the harvest
run reports (`librarian/runs/*.md`) - the next `/harvest loop` that meets a
repeated failure records how many passes it spent. Gate: `check-skills.mjs`
(structure and version bump) for the edit itself; the behavioural read is the
run report.

## First step taken

The harvest stop rule, committed on this branch. Continue with the deepen rule
and the ledger line, then merge to main with a pathspec commit.
