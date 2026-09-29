---
layer: application
type: application
subject: unattended-run-isolation
technique: diff-from-the-recorded-base
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A delegate's worktree read back against the commit it started from (TypeScript scripts)

The version is the one the tree's Node type declarations pin (`@types/node ^24`); the
tree has no `engines` field or runtime pin, so this is the weakest witness the
frontmatter allows. The realization is a dispatcher that hands a task to an external
coding agent in a linked worktree of the project, then reads the result back and lands
it into the shared checkout. The technique's blind diff was in both the read-back and
the landing.

## What the dispatcher did

The worktree is created from `HEAD`
(`scripts/codex/dispatch.ts:96 "base = git(cwd, 'rev-parse', 'HEAD').stdout.trim() || undefined;"`
is the line the fix added beside it) and, before the fix, nothing recorded which commit
that was. The read-back and the landing both staged everything in the worktree and asked
for the staged diff against the worktree's own head. The agent runs in a mode that
permits commits, so the head it compared against was the agent's latest commit.

## The paired proof

The real dispatcher, type-stripped and run against a throwaway repository, with the
worktree made by the dispatcher's own command and its state file written by hand (the
`run` step needs the external agent, which was not invoked):

| Scenario | Files the agent changed | Arm A: read back / landed | Arm B: read back / landed |
| --- | --- | --- | --- |
| S1: committed everything | 2 | 0 ("nothing to land") | 2 |
| S2: committed one, left the rest | 3 | 2 (the committed file lost) | 3 |
| S3: committed nothing (floor) | 2 | 2 | 2 |
| S0: fresh worktree, no change | 0 | 0 | 0 |

**Floor:** S3 and S0 were byte-identical between arms in the diff output, the landing
output and the files applied, and a state file with no recorded base behaves as arm A in
all four scenarios and does not crash. The fix is small: record the base at creation and
read `git diff --cached <base>` after the same staging
(`scripts/codex/dispatch.ts:59 "return base ? ['diff', '--cached', base] : ['diff', '--cached'];"`).
Nothing is ever committed inside the worktree.

## The neighbouring checkpoint, read for the second half of the technique

The tree also captures a dirty project before a run, in a separate module. It does the
capture on a dedicated harness branch rather than on the operator's branch: it switches
the operator's checkout onto that branch, stages everything and commits it as the
baseline (`src/lib/harness/checkpoint.ts:252 "await runGit(['add', '-A'], projectPath);"`).
The comment above explains the reason well: a bare `HEAD` is a state the working tree
never matched, and a rollback would reset away the operator's uncommitted work. That
keeps the operator's branch history clean, which is the technique's aim, and it still
moves the operator's checkout and stages untracked files that no ignore rule covers, so
the secret-file check the technique names is not present.

## Left as found

The dispatcher's `report()` still uses a status listing for "worktree changes", so it
prints "(none)" for a run that committed everything, and can now disagree with the
corrected diff beside it. Not changed; it is a display. The landing step here applies the
patch mechanically to the shared tree, which is the shape the technique asks for; no
model turn is involved.
