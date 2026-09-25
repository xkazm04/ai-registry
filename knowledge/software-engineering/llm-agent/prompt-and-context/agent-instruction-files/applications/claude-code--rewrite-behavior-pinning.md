---
layer: application
type: application
subject: agent-instruction-files
technique: rewrite-behavior-pinning
stack: claude-code
verified_on: 2026-09-24
verified_against: claude-code@2.1.281
applied: code
ab_verdict: better
proof: ab-paired
---

# Pins before a 59% cut of an always-loaded guide (Claude Code)

The version witness is the CLI's own `--version` output on the machine that ran every
arm. The tree is the public `systedo-case` repository, commit `ec3ebe66`.

## The file and why a trim was a rewrite

The repository's canonical guide, `AGENTS.md`, reaches every Claude Code session through
a one-line `@AGENTS.md` import in `CLAUDE.md`. At 1,049 lines it was the largest
always-loaded file in a twelve-repository fleet. Its own guidance budget
(`.github/guidance-budget.json`) already drew the right boundary: a paragraph belongs in
the read-first surface only if it changes what a run does *before its first edit*.
Everything else is a lookup, routed from a task index. Reading it against that test, most
of the file failed: the bulk was the reasoning behind each rule - a gate's history, the
incident that motivated it, what it cannot see, how its pins move. A run needs that when
it argues with a gate, not on every session.

That made the cut a bulk rewrite, the case the technique is written for. No single line
was withheld and tested. Hundreds of lines moved at once, and the risk was the one the
technique names: that a condensed rule loses the hedge carrying its strength, or that a
command disappears with the paragraph around it.

## The pins, written and run before the edit

Eighteen questions, each answerable only from the file, asked in one headless session with
every tool disallowed, one numbered line per answer, graded by a pattern per question
("not in my instructions" is a miss). They covered the prohibitions (push, pathspec-only
commits, arming live ad writes, reformatting), the commands (the inner loop, the CI
chain, the checkpoint read), the seams (the LLM chokepoint and its call-site tag), the
two-line-diff rules (an exception with its ceiling, `Ack:` for a deleted test), and three
facts reached only through a paragraph's middle (the three responses to a flaky test, the
cost record for a new AI operation, the decision trailer).

| arm | runs | pins | first request (tokens) |
| --- | --- | --- | --- |
| A - the file as it stood | Sonnet x2, Opus x1 | 18/18 each | 55,868 (Sonnet) |
| B - the trimmed file | Sonnet x3, Opus x1 | 18/18 each | 39,977 (Sonnet) |

The trim moved the reasoning **verbatim** to a lookup (`docs/agent-guide/conventions.md`,
routed from the task index) rather than rewriting it. The canonical file kept each rule
in the form a run needs - headline, imperative, command - plus the constraint table, the
unattended green/amber/red list, the architecture lines and every command, one line each.
1,049 lines became 430, and the first request fell by 15,891 tokens (28%).

## The repository's own pins did half the work

The tree carries structural pins the technique does not mention, and they are the
cheapest kind: 57 sentences that its registries (`constraint-map.json`,
`agent-permissions.json`) quote from the guide, each checked by a unit test. A script
listed every quoted sentence and required each to survive the rewrite, whitespace-normalised,
before the file was written. It caught one that behavioural pins could not have: a quote
that began with a lowercase word, which the condensed version had capitalised.

The full unit suite (4,147 tests) then caught one more: a test requires the stricter
typecheck command inside the fenced Commands block specifically, and the draft had moved
it into a prose list of instruments. Behavioural pins would have passed that draft, since
the command was still named. So the three instruments are complements, not substitutes:
quoted-sentence pins guard wording that other files depend on, the repository's tests guard
structure, and behavioural pins guard what a reader actually concludes.

## What this application cannot say

- The behavioural pins lean on prohibitions and commands. They pin the permissive branch
  only through the unattended list, which moved unchanged, so they could not have caught a
  hedge hardening into a mandate anywhere else. The technique's warning stands.
- n is small and the grader is a pattern: a right answer phrased unusually is a false miss,
  and a wrong answer that contains the keyword is a false pass. One run per arm was read by
  hand: no false pass or miss, and one answer thinned. Asked what CI runs, arm A named the
  timed variant of the chain as the one CI actually executes; arm B named the untimed chain
  only, although the trimmed file still says it. A pattern-graded pin cannot see a lost
  detail inside a right answer, and that is the size of loss a trim like this produces.
- Nothing here measures whether a real task goes better with the lighter file. The claim is
  narrower: the same answers, from 28% fewer tokens.
