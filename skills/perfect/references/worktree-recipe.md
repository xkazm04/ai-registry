# Wave worktree — the ONE-worktree recipe and its traps

The wave lives in the main checkout by default. Only when `git status`, the active-runs ledger or an
in-flight agent shows a live sibling in that checkout does the wave move to **ONE** worktree — never
one per builder; same branch, same shared-resource protocol. (A branch switch is a whole-tree mutation
and obeys the same sibling-safety rule as `git add -A`; the alternative to a worktree is committing onto
the current branch with `git commit --only <paths>` scoping.)

## Create (Windows; PowerShell)

```powershell
git worktree add .claude/worktrees/perfect-wave -b perfect/<YYYY-MM-DD> <base_branch>
$root = "<abs repo root>"; $link = "$root\.claude\worktrees\perfect-wave\node_modules"
if (Test-Path $link) { Remove-Item $link -Force -Recurse -Confirm:$false }
New-Item -ItemType Junction -Path $link -Target "$root\node_modules" | Out-Null
Test-Path "$link\.bin\tsc"    # MUST print True before you brief anyone
```

**Do NOT use `cmd //c mklink //J … "..\..\..\node_modules"`.** `mklink` resolves a RELATIVE target
against the **current** directory, not the link's — from the repo root it silently creates
`C:\Users\node_modules` and still prints "Junction created", and the failure only surfaces as a builder
that cannot find `tsc`. **"Junction created" is not evidence — the `Test-Path …\.bin\tsc` assertion is.**

Agent-tool worktree isolation is not a substitute: those worktrees lack `node_modules`. Prepare the
worktree yourself. A Python toolchain needs no per-worktree install; run its gates from the worktree
root.

## Use

- **Never run the dev server inside the worktree** — some bundlers (Turbopack) reject the junctioned
  `node_modules`, and most stacks allow only ONE dev server per machine (dev-lock). Builders verify at
  lib/test level (`npx tsc --noEmit` + targeted unit tests) and report what needs a live check; only the
  Director drives live flows, from the main checkout.
- Build caches can go stale across worktrees; a check that passes against a stale artifact while the
  test fails is a known shape — re-run the test, not the check.

## Teardown (order matters)

```powershell
cmd /c rmdir "<abs repo root>\.claude\worktrees\perfect-wave\node_modules"   # the junction FIRST
git worktree remove .claude/worktrees/perfect-wave
Test-Path "<abs repo root>\node_modules\.bin\tsc"    # the main checkout's real node_modules is intact
```

Removing the worktree before the junction deletes the real `node_modules` through the link. Delete the
wave branch only after its commits are on the base branch.

## Why this is the exception, not the shape

Rounds 1–4 of the original loop gave each builder its own worktree and branch. The bill: 3 worktree
setups + 3 junctions, single compiles of **24m05s and 28m29s** because three *different source paths*
thrashed one shared `CARGO_TARGET_DIR`, a stale core artifact that let `cargo check` pass while
`cargo test` failed, siblings clobbering the shared test exe twice, N cherry-picks with union-merge
hazards that turned master red for two picks, a whole extra cross-builder integration phase, and
junction-ordered teardown. All of it bought protection against a collision that correct write-set
grouping prevents for free.
