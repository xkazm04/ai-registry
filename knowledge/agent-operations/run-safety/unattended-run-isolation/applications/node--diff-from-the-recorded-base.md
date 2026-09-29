---
layer: application
type: application
subject: unattended-run-isolation
technique: diff-from-the-recorded-base
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@22
---

# A blind diff, a checkpoint commit, and a landing that is a model turn (TypeScript, agent runtime)

Stack version from the tree's `engines` field (`>=22.13.0 <23`); commit `ae87280a`. The
realization is a background-execution feature of an agent runtime: on a schedule, a model
discovers candidate tasks in a project, executes each in an isolated copy, and leaves the
merge into the real project to a human's click. Its isolation design is careful in
several places. Every claim below was **run**, with the tree's real workspace modules
against throwaway repositories, not only read.

## The isolation, as designed

Discovery, workspace, execution, report and apply are five separate agent sessions with
different working directories and permission overrides; the session that executes a plan
runs in the copy, and the only human decision sits at the merge. Every unattended session
runs in a permission mode that auto-allows tool calls, with a small deny list (pushes and
remote changes) that the mode cannot override
(`src/always-on/runtime/DiscoveryFire.ts:71 "`bypassPermissions` because deny rules always win in `PermissionRuntime.decide()`."`).
That last sentence is honest about what the boundary is, and
[os-enforced-run-boundary](../techniques/os-enforced-run-boundary.md) is the technique
that says why a deny list alone is arranged rather than enforced.

## Where the read-back is blind

The diff that the plan view and the apply session are shown stages everything in the
worktree and reads the index against the worktree's own head:
`src/always-on/workspace/WorkspaceApply.ts:80 "workspaceCwd, "` (the argument list is `-C <cwd> diff --cached HEAD`).
The execution session has full shell access and may commit.

| Run | What the agent did | What the diff listed | What the project received from the mechanical apply function |
| --- | --- | --- | --- |
| B | committed an edit to one file, left a second new file uncommitted | the new file only (1 file) | reported `applied: true`; the committed edit was **not** in the project |

The mechanical apply function shares the same staged read, so it is blind in the same
way. Two accuracy notes. First, that function is injected into the service's dependency
bag and never called; the production landing is the model turn below. Second, the apply
prompt names the workspace branch and tells the model to use whichever of merge,
cherry-pick, patch or direct edits fits
(`src/always-on/runtime/discoveryPrompts.ts:276 "  - `git cherry-pick` for individual commits","`),
so a model handed the branch can recover commits the shown diff omitted. The diff a human
reviews before clicking, and the size the model is told to expect, are still the blind
ones.

## Where the base is a live directory

The alternative workspace is a plain copy of the project. Its diff compares the **live**
project with the copy (`src/always-on/workspace/WorkspaceApply.ts:101 "const result = await runProcess("diff", ["`),
with no record of the copy's starting content. Executed: the agent changed one file; the
operator then edited one file and created one, both in the live tree after the copy was
made. The diff reported **three** changed files: the agent's edit, the operator's edit as
a reversal, and the operator's new file as a deletion. A second, smaller finding: the copy
refuses to start when the project exceeds its size cap, and the cap counted an ignored
dependency directory the copy would never have included (a 200 KB ignored directory
against a 100 KB cap).

## The checkpoint

Preparing a worktree on a dirty project stages everything with `add -A` and commits it
onto the operator's own branch (`src/always-on/workspace/GitWorktreeProvider.ts:126 "`chore(always-on): checkpoint before executing ${normalizedTitle}`,"`).
Executed on a project with one uncommitted edit and one untracked local secrets file: the
commit contained both, on the operator's branch, before any agent ran. The tree's prompt
documents this as intended.

## The landing is a model turn

The apply session runs in the project root in the auto-allow mode
(`src/always-on/runtime/DiscoveryFire.ts:264 "permissionMode: "bypassPermissions","`) and
is told to resolve conflicts itself (`src/always-on/runtime/discoveryPrompts.ts:280 "If you encounter conflicts, resolve them intelligently — do not blindly overwrite."`).
The cycle is marked complete when the turn returns without an error event
(`ui/server/discovery-plans.js:145 "status: 'completed',"`), and the workspace is then
disposed. The unused mechanical function, by contrast, was executed against a dirty
project on the same file, a committed conflict, and a deletion of a file the operator had
edited: it refused each time and left the project exactly as it was. The tree has, in
one module, the refusing landing the technique asks for and a production path that does
not use it.

## What this realization cannot say

Whether real execution sessions commit. Their prompt does not tell them to and does not
forbid it, and the tree has no test of the scheduler, the gates or the workspace modules,
so the blind diff is proven against a constructed run, not a recorded one. The
`unapplied` row: a fleet project that runs delegated work in a worktree, with the
three-case test as the instrument.
