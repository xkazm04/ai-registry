---
layer: application
type: application
subject: fleet-orchestration
technique: brief-carries-the-session
stack: rust
verified_on: 2026-08-25
verified_against: rust@1.96
---

# What the companion restates for the workers it dispatches (Rust)

A desktop companion that runs its own long-lived conversation and, from
inside it, dispatches fresh coding-harness sessions: dev-mode changes in a
worktree, overnight fleet workers, one-shot guidance answers. Every one of
those runs as a separate CLI process with its own context. The tree has
been built around that fact in three different ways, one per worker class,
and reading them side by side is the technique's inventory written in code.

## The dispatcher's own turns get nothing standing — by design

`src-tauri/src/companion/session/cli.rs` `run_cli` (`:31`) launches the
companion's chat turns with `--system-prompt-file` (fully replacing the
harness identity prompt) and `--exclude-dynamic-system-prompt-sections`,
with the working directory defaulting to the user's home "so a normal
Athena turn doesn't auto-pick up the Personas project's CLAUDE.md"
(`:41-45`). The companion chose to receive *no* standing instruction file
and to own its entire prompt through its assembler
([layered-composition](../../../prompt-and-context/prompt-assembly/techniques/layered-composition.md)).
That is the technique's "choose the worker class by what it loads"
applied to the dispatcher itself: it knows exactly what it loads because
it loads nothing it did not write.

## Three worker classes, three ways of carrying the session

**Dev-mode worker** — `dev_mode.rs` `build_task_prompt` (`:983`) and
`create_dev_worktree` (`:671`). The worker runs in a git worktree under
`.claude/worktrees/athena-dev-<id>`, so the project's standing instruction
file *is* present in its checkout, and the brief leans on it ("aligned
with the conventions in this repo's CLAUDE.md"). But the brief does not
stop there: the invariants that matter — never push, never stash, never
`git add -A`, don't run the full suite, stay in `src/` on frontend runs,
STOP on scope creep — are restated in full in `## Discipline`. The tree
restates what it could have referenced, which is the technique's first
rule, and the reason is visible in the comment on `/exit`: a rule that
lived only in the dispatcher's head cost a ten-minute stall on the first
dispatch.

**Night-shift worker** — `night_shift/planner.rs` `worker_prompt` (`:170`).
A fresh session in a project the companion may never have opened. The
brief carries: the branch discipline (`night/<date>-shift`, never the
default branch, never push), the approval protocol for destructive or
paid actions, the checkpoint and guidance MCP tools, the stop conditions
from the plan item — and a test, `worker_prompt_carries_branch_only_invariant`,
that pins the restated invariants so a refactor cannot drop them. The
test is the interesting artifact: it treats "the brief carries the
invariant" as a contract, which is the technique's structural remedy
(a template whose empty section is visible) in its cheapest form.

**One-shot guidance** — `night_shift/unattended.rs` (`:115-160`). When a
night worker blocks on a question, the companion answers it with a
*separate one-shot call* on the aside tier — a model with no session at
all. The prompt injects `PROJECT MEMORY (constraints/decisions recorded
for this repo)` from `project_memories_block` and `DECISION PRECEDENT
(how the user has decided recently)` from `decisions_block`. That is
"carry settled decisions as decisions" done by a store rather than by
hand: the dispatcher's session state was persisted as records precisely
so a sessionless call could be handed it. The review-resolution prompt
in `athena_reaction.rs` (`:971`) does the same with the team channel's
recent history — the substitute for the conversation the one-shot model
never had.

## What the tree does not do

- **No worker is told what it cannot see.** None of the three briefs
  carries the technique's one-liner ("you have none of the conversation
  that produced this brief; ask rather than infer"). The night worker
  has `athena.request_guidance` as the channel for exactly that, but the
  brief presents it as "if genuinely stuck", not as "if a constraint
  seems missing". Small; worth a line on the next touch.
- **Load-bearing files are carried for dev-mode only.** The context-map
  file list in `build_task_prompt` is the technique's "pointers, not
  contents" rule; the night-shift brief carries an objective and no
  pointers, because the planner proposes work across projects it has
  not read. That is a real limit of planning without reading, not an
  omission in the brief.
- **Nothing here forks.** The companion never uses an inheriting worker;
  every dispatch is fresh-plus-restated. That is the right default for
  isolation-shaped work, and the tree has no continuation-shaped
  dispatch that would want the other choice.

## What this realization cannot show

The tree demonstrates the *inventory* — invariants restated, decisions
carried as records, pointers derived from an authority — but cannot say
what a worker does when the brief is missing something, because nothing
measures that. The dev-op ledger records the user's verdict per
dispatch, not the cause of a rejected one. Until a rejected dispatch is
attributed to "the brief lacked X", this is evidence that the technique
is cheap to follow, not that following it moves the outcome.
