---
layer: application
type: application
subject: engine-behaviour-profiles
technique: harness-crossed-attribution
stack: process
status: forged
verified_on: 2026-09-27
applied: experiment
ab_verdict: better
---

# Process: the deferring family force-added four times

Measured 2026-09-27 by reading two vendor agents' shipped instructions and one operator
machine's session transcripts. No new runs; the field record was already there.

## What the two harnesses tell the model

The skill benchmark behind the authority-conflict application ran the GPT family
only through the Codex CLI and the Claude family only through Claude Code. The two
harnesses do not state the same precedence:

| | Codex CLI (`openai/codex`, `main`, read 2026-09-27) | Claude Code (vendor docs, read 2026-09-27) |
|---|---|---|
| Repository instruction file | AGENTS.md, injected with role `user` (`core/src/context/user_instructions.rs`) | CLAUDE.md, "delivered as a user message after the system prompt, not as part of the system prompt itself" |
| Stated precedence | "Direct system/developer/user instructions (as part of a prompt) take precedence over AGENTS.md instructions." (`base_instructions/default.md`) | "there's no guarantee of strict compliance, especially for vague or conflicting instructions"; the wrapper seen in-session says the file's instructions "OVERRIDE any default behavior" |
| Commit rule | "Do not `git commit` your changes or create new git branches unless explicitly requested." | commit only when the user asks |
| Ignore rules, `add -f` | not mentioned | not mentioned |

The Codex default prompt even claims AGENTS.md is "included with the developer message",
while the code injects it as `user`. The shipped prompt and the shipped behaviour disagree
inside one harness, so reading the harness means reading its code as well as its prose. The fleet's opencode
checkout (January 2026) picks a system prompt by model id: `gpt-5*` gets a copy of the
Codex prompt, older GPT ids a prompt that says "You are NEVER allowed to stage and commit
files automatically", Claude ids a prompt with no git rule at all.

The effect of the harness on score is public. Terminal-Bench 2.0 (arXiv 2601.11868,
Table 2) lists GPT-5 at 49.6% under Codex CLI and 35.2% under the neutral Terminus 2, and
GPT-5.2 at 62.9% against 54.0% - on the identical task set.

## The field experiment

- **Arm A, family attribution:** the published profile says the Claude family resolves
  instruction-versus-ignore conflicts in the repository's favour, 0 of 4 cells. It
  predicts that the engine's own traffic holds no force-add of an ignored path.
- **Arm B, engine attribution:** the same resolution belongs to the engine and the
  instruction's wording. It predicts force-adds wherever an instruction says to commit
  something a repository ignores.

**Instrument.** A scan of every Claude Code transcript on the operator machine: 13,920
session files, 1,965 of them with a `git add`, 8,965 add calls in total. The regex was
checked on seven hand-written commands (force and not-force, commit-message decoys). The
matched rows were then read one by one: 47 regex hits collapsed to four sessions. The
rest were search commands, heredoc prose and a fixture.

| Date | Repository | Path the ignore rule excludes | Engine | Still tracked |
|---|---|---|---|---|
| 2026-08-28 | kp | `/.claude/ship-loop/` | claude-opus-5, Claude Code | yes |
| 2026-08-29 | systedo-case | `/uat/runs/` ("dated run dirs") | claude-opus-5, Claude Code | yes |
| 2026-09-03 | personas | `docs/plans/` | claude-opus-5, Claude Code | removed by a later commit |
| 2026-09-22 | personas | `.claude/*` allowlist | claude-opus-5, Claude Code | yes |

The Codex CLI side of the same machine is 389 session files, 8 of them with a `git add`,
16 add calls and 0 force-adds. That denominator is too small to say anything about GPT.

**Verdict: better.** Arm A's prediction failed four times in three repositories: the engine
the benchmark recorded as deferring overrode declared ignore rules when the task said to
commit. Arm B predicted exactly that. The benchmark's 0-of-4 is a fact about one wording
through one harness version, which is what the technique says to call it.

## The seam it changes

personas runs a maintenance lane on the Codex CLI (`codex exec
--dangerously-bypass-approvals-and-sandbox`, model pinned by id). By source read of its
`master` on 2026-09-27:

- The dispatcher writes the brief, so the precedence is the platform's to state. The brief
  does not say what to do with a path the repository excludes.
- The owner's merge path runs the declared gates. It has no check for committed paths the
  repository excludes.
- The Claude lanes share that merge path, and the field record shows they need the check
  as much.

The finding is recorded as a lead against the platform, not patched from here.

## Caveats

One operator machine, one harness version per engine, transcripts as they happened (no
constructed conflict). The four overrides were deliberate rather than careless: each sat
inside a hand-built commit the run was making on purpose, beside paths it staged normally. The finding says the resolution follows the
wording; it does not say the Claude family prefers to override.
