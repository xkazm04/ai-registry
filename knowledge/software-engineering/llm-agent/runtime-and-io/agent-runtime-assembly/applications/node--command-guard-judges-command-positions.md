---
layer: application
type: application
subject: agent-runtime-assembly
technique: command-guard-judges-command-positions
stack: node
status: forged
verified_on: 2026-11-18
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Node: a worker guard replayed over 1,509 recorded commands

The tree is `xkazm04/mage-arena` (public) at `579737e`, guard last changed at `4f14727`. Its
pre-tool guard decides every shell call a headless coding worker makes, because the worker
cannot prompt: allow by default, deny git history changes, force and hook bypass, recursive
deletes and secret reads. No `verified_against`: the tree pins no runtime version for the
guard; the replay ran on node v24.22.1.

## What the guard judges

The command rules match the whole command string:

- `tools/agy-guard.mjs:13` "const gitMutation = new RegExp" - a git verb anywhere in the
  text, after optional global options.
- `tools/agy-guard.mjs:17` "rm\b[^\n;|&]*" - the recursive-delete spellings, again over
  the whole string.
- `tools/agy-guard.test.mjs:22` "const deny = [" - 25 deny and 12 allow cases, the floor.

## The A/B

Both arms are the guard's own regular expressions, loaded from its source text rather than
copied, and checked against the real guard process on 203 sampled commands (0
disagreements). Arm A applies the command rules to the whole string, as shipped. Arm B
applies the same rules to command positions only: quoted arguments, heredoc bodies and
comments are data, except a nested shell's body and a command substitution inside double
quotes, which are judged as commands. The secret rules are unchanged in both arms, so the
command rules are the one variable. The corpus is every Bash and PowerShell command recorded
in this project's agent sessions and its worktrees' sessions: 56 transcripts, 1,609 calls,
1,509 distinct commands.

| | Arm A (whole text) | Arm B (command positions) |
|---|---|---|
| Denied | 189 (127 git, 9 delete, 53 secret) | 188 |
| Denied by A only | 1 | - |
| Denied by B only | - | 0 |
| Own test cases held | 25/25 deny, 12/12 allow | 25/25 deny, 12/12 allow |

Target (refusals of data that names a guarded command): 1 to 0. Floor (the guard's own cases
and every other refusal): held. Verdict **better**, and small: the class is one refusal in
189 here. The one row was a read-only search across three scripts whose quoted alternation
named a recursive delete.

## What the replay found besides

Two more refusals were false and are a different class: an echo whose substituted commands
ran `git merge-base` and `git rev-list`. The verb rule ends at a regex word boundary, so the
mutating verb `merge` matches the read-only `merge-base`. Position-aware judging does not fix
that (the substitution executes, so it is rightly judged); a token-boundary verb rule does.
That is step 4 of the technique, and it came from this seam, not from the source.

## What it would change here (recorded, not made)

The run did not edit this repository. The change it measured is a tokenizer in front of the
three command rules (quote-aware segments, data positions skipped, nested bodies and
substitutions recursed), the verb rule ending at a token boundary, and the two read-only
rows added to the allow cases first. Its test is the replay itself, kept as a script beside
the guard.

## What this realization cannot do

It sees only commands that reached the guard's input. A worker that never tries a command
because an earlier refusal taught it to avoid the subject leaves no row, so the replay
undercounts the cost of false refusals.
