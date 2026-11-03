---
layer: application
type: application
subject: probe-confirmed-model-proposals
technique: isolated-proposer-call
stack: python
status: forged
verified_on: 2026-11-03
verified_against: python@3.12
applied: code
ab_verdict: better
proof: ab-paired
---

# Python: a proposer that must read the tree, and the door its read-only stance left open

Source tree: `kp`, the fleet's recruiting platform, public
([xkazm04/kp](https://github.com/xkazm04/kp)). This document covers the repository
dossier its App-master intake is composed from, read on 2026-11-03 at `1c3a999fa` on
`main`. The stack witness is the continuous-integration pin, Python 3.12
(`.github/workflows/ci.yml:45`). The change recorded below is `1c3a999fa`, pushed to
the project's `main` through its pre-push gate.

This is the subject's second stack, and it is useful because it does **not** follow
[isolated-proposer-call](../techniques/isolated-proposer-call.md). It takes the
technique's own "When not to use this" branch on purpose, and it shows what that branch
still owes.

## Why the proposer runs inside the target here

The dossier is persisted belief about someone else's codebase: what is risky, why a
file churns, which objectives the role should own. Half of it is computed and half of
it cannot be. `pipeline/jobfit/repo_scan.py:7` "The heuristic walker always runs first."
`pipeline/jobfit/repo_scan.py:13` "The LLM path refines that dossier" and the model is
asked only for what a walk cannot produce: risk areas, a reason on each hot spot,
candidate objectives, a maintainer-load estimate. A reason for churn is a reading of
code, so the refinement runs as an agent in the checkout with read tools. The
neighbouring adapters cannot, and the module says so instead of pretending parity:
`pipeline/jobfit/repo_scan.py:1262` "Only the local Claude CLI can actually *run in* a repository".

So the fact pack is not the whole evidence, and two runs are not comparable line for
line. That is the cost the technique's fallback branch names. What kp keeps from the
subject is everything downstream of the call.

## What kp keeps: counted facts are out of the model's reach

The deterministic walk is the fact pack, and the model may not restate it.
`pipeline/jobfit/repo_scan.py:1078` "`contexts` and `declaredGates` are COUNTED facts, and letting a model restate a"
count is how a dossier acquires a number nobody measured. The merge reads only an
allowlist of refinable keys (`pipeline/jobfit/repo_scan.py:1080`) and logs every other
key it dropped.

Hot spots are the one judgment line with a real referent, and they get the subject's
treatment. The walker's churn list is observed before the call, the model may only
attach a reason to an entry in it, and an entry it invented is discarded with its
reason: `pipeline/jobfit/repo_scan.py:1228` "invented path — dropped with its rationale".
The stored ref is the walker's, the model's text contributes only the note. That is
[found-not-hinted](../techniques/found-not-hinted.md) realised as an intersection
against values observed in advance, the move the golden path describes for facts that
exist in no file.

Every field carries provenance (`heuristic`, `llm` or `unknown`), and
`pipeline/jobfit/repo_scan.py:32` "A hole must read as a hole."

## What it does not probe

Three judgment lines are saved on the model's word, with an `llm` provenance label as
the only guard:

- **Risk-area refs.** The prompt asks for a path, module or command per risk; unlike hot
  spots, nothing checks that the ref exists.
- **Numeric baselines.** The prompt rule is right,
  `pipeline/jobfit/repo_scan.py:1121` "`baseline` MUST be null unless you found an actual reading in the repo."
  The coercer enforces only the type. Its docstring says `0` for an unread baseline
  "must not produce a float" (`pipeline/jobfit/repo_scan.py:1148-1149`); run on
  2026-11-03, it returned `0.0` for `0` and `40.0` for `40`, and the project's own test
  accepts `120` as a reading. A number with no pointer to where it was read is the line
  [probe-per-proposed-line](../techniques/probe-per-proposed-line.md) says nobody can
  test, so it is the line a model invents.
- **Existing KPIs** the model names as already measured.

These are open, not refuted. The honest probe for a baseline is a citation the model
must return and a lookup that checks the cited file holds the number, and kp has not
built it.

## The door the read-only stance left open, measured

kp's read-only guarantee is real and enforced in code: a tool allowlist, a write
denylist and the CLI's plan mode, set only through one door that raises on a write
tool or a bare shell grant. The technique's warning is that none of those governs what
the runtime **loads from its working directory**, and here the working directory is the
target. kp ran the session with default setting sources, so the scanned repository's
settings file and instruction file loaded.

Measured on 2026-11-03 against the agent CLI at 2.1.317, n=2 per arm, on a scratch
repository whose settings declared session-start and stop hooks that append to a
marker file, and whose instruction file told the model to end every answer with a
fixed word. Same argv as kp's scan (plan mode, the read allowlist, the write denylist,
the secret-file deny settings), same one-line prompt:

| arm | working directory | setting sources | target's hooks ran | instruction steered the answer |
|---|---|---|---|---|
| A (kp before) | target | default | 2/2 | 2/2 |
| B (isolated) | empty scratch | default | 0/1 | 0/1 |
| C (kp after) | target | user only | 0/2 | 0/2 |

Two more single runs closed the obvious objections to arm C. Asked to read the
instruction file, the session read it and quoted its last word, so the tree stays
readable as **data**. Asked to read a `.env` holding a canary, both A and C answered
that the read was denied, so the secret-file deny rules passed through the settings
flag still hold when the project source is off.

The vendor's own pages, fetched raw on 2026-11-03, state both halves. The headless
page says "Without `--bare`, a `-p` session runs the hooks in a project's
`.claude/settings.json` and connects the servers in its `.mcp.json`, even in a folder
you've never trusted"
([headless](https://code.claude.com/docs/en/headless)). The permissions page gives the
switch kp adopted: "Pass `--setting-sources user` ... so Claude Code reads neither the
project's settings files nor its `.mcp.json`"
([permissions](https://code.claude.com/docs/en/permissions)). So the fix also closes the
target's MCP server declarations, which the experiment did not exercise. Neither page
says that a read-only permission mode leaves hooks running. That half rests on the
measurement.

This is not theoretical for kp's targets. Two fleet repositories it scans declare
project hooks: one runs a documentation check on stop, the other runs a guard on every
file read, which in a scan would decide what evidence the proposer is allowed to see.
The fix keeps the user source on, for authentication and behaviour parity with the old
default, and drops project and local. The comment carries the measurement beside the
flag: `pipeline/jobfit/claude_cli.py:675-688` "The SCANNED repository's own configuration is not ours to load."
and `pipeline/jobfit/claude_cli.py:679` "stance (allowlist, denylist, plan mode) governs TOOLS, not that."
The repository's agent docs still reach the model, as quoted excerpts in the prompt.

## What this adds to the technique

The technique's fallback says: when the proposal needs interaction, use an agent with a
sandbox and a recorded trajectory. kp shows a third case between a sealed call and an
interactive agent: the proposal needs **reading** the tree, not running it. The working
directory then has to be the target, the scratch-directory defence is unavailable, and
the door has to be closed at the runtime's configuration source instead. A read-only
permission mode is not that closure; on this runtime it did not stop a target-declared
hook from executing a command.

## Verdict

`applied: code`, `ab_verdict: better`: arm A against arm C on the same argv, prompt and
target, 2/2 hooks executed and 2/2 answers steered before, 0/2 and 0/2 after, with tree
reads and the secret deny unchanged. The project's argv pins and docs moved with the
change, and its 154 affected Python tests pass. The unprobed lines above are banked with
the return condition "when kp grows a cited-baseline probe".
