# Phase 7: Execute (architect reference)

Loaded when triage marked a finding `execute now` (Phase 6) or a resume picked a decision (Phase 9d). Read it in full before the first edit. § Coordination below applies only when the overlay names an `active_runs_ledger`, and also covers a Phase 7B codification.

## Coordination — Active-Runs Ledger

**Only when the overlay names an `active_runs_ledger`.** With no ledger declared, `git status` is the whole coordination surface: note foreign uncommitted work, never sweep it into your commits, and skip the rest of this section.

Before materially editing the working tree (which `/architect` always does in Phase 7 — Execute), register this session in the ledger, following the format conventions at the top of the ledger file itself. Read its `## Active` section first; if any `started`-status entry overlaps your area-mode scope and is <2h old, surface the conflict to the user before proceeding. Overlap on the ledger file itself is expected and is not a conflict.

**Ledger edits are a single bash invocation** (read + append/move in one command) — parallel sessions rewrite the file between an Edit-tool read and its write, so multi-step edits lose entries. Always edit the ledger in the **main checkout**, even when the code work happens in a worktree.

**Declared paths for `/architect`:**
- Vault: `Architect/scans/<run>.md`, `Architect/decisions/<adr>.md`, `Architect/backlog.md`, `Architect/strong-patterns.md`, `Architect/weak-patterns.md`, `Lessons/{date}-architect.md`
- Working tree (varies by area mode): the area's file paths as the context source lists them
- Always: the ledger itself

**At session end** (Phase 7 commit lands, the user closes without execute, or the run aborts): move your entry to the top of `## Recently completed`. Update `Status` to `completed (commit: <sha>)` or `aborted (<reason>)`. Trim entries older than 14 days while you're there.

---

## Phase 7: Execute (one decision, this session)

This is the high-rigor execution path, with full validation. Isolation follows the repo law's parallel-safety rules where it declares any, not ad-hoc branching.

### 7a. Isolation: worktree by default

Multi-file work MUST NOT happen on the base branch next to other sessions. Architect rollouts are almost always multi-file, so the default is a dedicated worktree under the overlay's `worktree_root` (default `.claude/worktrees`):

```
Isolation for this decision:

  1. worktree {worktree_root}/architect-{slug}   <- default (mandatory for multi-file rollouts)
  2. commit on current checkout                  <- only if the rollout touches a single file

Pick 1 or 2 (Enter = 1).
```

**Test the worktree before committing to it.** A fresh worktree has no installed dependencies, so the gates that make a high-rigor rollout *high-rigor* may not run there at all. Decide with evidence, not by default:

1. Create it, then run ONE cheap gate (the typecheck) inside it.
2. If it fails for want of dependencies, try the cheap share first — a junction/symlink of `node_modules` from the main checkout. This is usually enough for `tsc`, the linter and the unit runner.
3. **Re-test EVERY gate class you will rely on, not just a cheap one and a slow one.** The link that satisfies one runner routinely fails another, and which one breaks is not predictable from cost: a shared `node_modules` can satisfy the type gate and still break the bundler (Turbopack: *"Symlink [project]/node_modules is invalid, it points out of the filesystem root"*) — or satisfy the type gate and break the TEST runner instead (observed separately: 106 failures across 21 files, all route-handler imports resolving to `undefined`, with the local env ruled out as the cause). Run one of each class — typecheck, lint, unit, build — before trusting the worktree. Discovering this at Phase 7e means the final gate never ran.
4. If a gate cannot run in the worktree, say which one, and choose deliberately: run that gate from the main checkout after merge, or work on the main checkout from the start. **Never report a gate as passing that you could not run** — and never read an exit code through a pipe (`… | tail`), which reports the exit status of `tail` and will happily show `0` for a build that died.

Isolation that costs verification is a bad trade when the repo law already mandates pathspec-only staging. Record the choice and its reason in the ADR.

If option 1:
```bash
git worktree add {worktree_root}/architect-{slug} -b worktree-architect-{slug}
cd {worktree_root}/architect-{slug}
```
Work and commit inside the worktree; vault writes and ledger edits still target the main checkout/vault paths. After the branch is merged into `{base_branch}` and confirmed in `git log {base_branch}`, clean up (Phase 12 ritual): `git worktree remove {worktree_root}/architect-{slug}` then `git branch -D worktree-architect-{slug}`.

Option 2 is legitimate only for genuinely single-file changes. If the user insists on the main checkout for a multi-file rollout, warn once (citing the repo law's isolation rule if it has one), then honor it — the ADR is what gives the change its identity either way.

### 7b. Write the ADR first

Before any code change, write `$VAULT/Architect/decisions/{YYYY-MM-DD}-{slug}.md`:

```markdown
---
date: 2026-05-01
slug: {slug}
status: in-progress
type: weak-pattern | structural-bug-class | tech-swap | enforcement-gap
reach: "{concrete count}"
reach_cmd: "{the exact command that produced the count - status and resume re-run it}"
risk: {1-5}
effort: {s/m/l/xl}
payoff: {1-5}
branch: worktree-architect-{slug} | "(committed on main checkout)"
related_scan: [[Architect/scans/{date}-{theme}-{mode}]]
---

# {Title}

## Context
{What's the codebase reality today, with file:line examples. ~1 paragraph.}

## Decision
{What we're going to do. ~1 paragraph. Be specific about scope.}

## Consequences
### Positive
- {what we gain}
### Negative / risks
- {what we lose or risk}
### Mitigations
- {pre-flight checks, rollback plan}

## Rollout
{Numbered list of atomic commits planned. Each one is independently shippable.}
{If this decision TURNS ON AN ENFORCEMENT - a validator, a constraint, a lint rule at
error, a stricter parser - step 0 is ALWAYS a counted dry run. See 7c step 4.}
1. {step 1} - {validation: cargo check / tsc / lint / tests}
2. {step 2} - {validation}
3. ...

## Acceptance criteria
- {observable criterion 1}
- {observable criterion 2}
- {observable criterion 3}

## Regression checklist
- [ ] {area 1 still works} - verified by: {how}
- [ ] {area 2 still works} - verified by: {how}
- ...
```

### 7c. Pre-flight checks

In a fresh worktree (7a option 1) the tree starts clean — skip straight to step 3 (baselines). On the main checkout (option 2), **do NOT require a clean working tree.** Concurrent CLIs run on the same tree; assuming a clean baseline is wrong, and acting on that assumption (stash, reset, checkout) destroys other people's work. Instead, **inspect, classify, and coexist**:

1. **Inspect the tree:**
   ```bash
   git status --short
   ```
   Read every modified or untracked path.

2. **Classify each path** as one of:
   - **In-flight by someone else** — paths that have nothing to do with this architect decision. Leave them strictly alone for the rest of the run.
   - **Pre-existing in your touch zone** — paths the decision will edit that already have uncommitted changes. Surface to the user:
     ```
     File X already has uncommitted changes. The architect decision wants to edit it.
     Options:
       1. commit those changes first (you do it; I'll re-inspect after)
       2. let me commit on top of them (your changes stay; mine layer on)
       3. abort - pick a different decision
     ```
     Default to option 2 if the user doesn't pick — commit-on-top is the principle.
   - **Yours from this session** — paths only this session has authored. Normal.

3. **Capture validation baselines** — run the overlay's `## Gates` → `baseline:` commands (with no overlay, the detected typecheck / lint / test / compile commands; print what you detected). Record the numbers **and each command's exit status** in the ADR's `## Pre-flight baseline` section — read the status from the command itself, never through a pipe; a baseline read from `… | tail` can hide a gate that was already red, which you will later attribute to yourself. Subsequent commits compare to this baseline — a lint count going from 10086 → 10089 warnings is a regression caused by *you*, not the in-flight other-author work (whose net contribution to the baseline is captured in the snapshot you just took). In a repo with a large pre-existing warning baseline the metric is **delta on the files this diff touched**, never an absolute count.

4. **If the decision turns on an enforcement, measure what already violates it — BEFORE wiring it.** Any change shaped "switch on a check" (a schema validator, a database constraint, a lint rule at `error`, a stricter parser, a required field) has a second baseline that the gate commands above do not capture: **how much existing data or code fails the new rule.** That number decides whether the change is additive or an outage, and it is not inferable — measure it with a throwaway read-only script against production-shaped data, and record the count in the ADR beside the gate numbers.

   Two traps this catches, both observed:
   - **Fixtures are not evidence about live data.** A seeded corpus validating 100% is a false all-clear; it is precisely the data that never drifted. One run's seeds passed 66/66 while the live table failed 50 of 121 — enforcing as planned would have silently dropped 41% of a user-facing list.
   - **Live data is not evidence about the full range of legal shapes.** A live corpus passing 100% still says nothing about shapes the application deliberately tolerates but rarely stores — legacy records, partial payloads, fixtures the code is written to accept. Check what the *consumers and their tests* treat as valid, not only what the producer currently emits. The same run's live data passed 121/121 and enforcement still broke a test asserting that a deliberately thin payload stays readable.

   When the violation count is non-zero and the violators are legitimate, the honest outcome is usually **not** enforcement but a recorded, counted observation mode — the check runs and reports, the value still flows — which keeps the drift measurable without manufacturing an outage. Say so in the ADR rather than treating it as a failed decision: a dry run that stops an enforcement is the step working, and the violations it surfaces are frequently the run's most valuable finding.

   When the violators are real but too many for one session, pin them as a **shrink-only ratchet** (deliverable contract (d)): the dry-run list IS the allowlist, a new offender fails, a converted site must delist itself, and the list may only shrink. That is a one-session gate that does not pretend the migration happened.

**Forbidden during pre-flight (and at every later phase):**
- `git stash` — never. Not even with `--keep-index`.
- `git reset --hard`, `git reset --merge`, `git restore`, `git checkout --` on any path.
- `git clean -f`, `git clean -fdx`.
- `git add -A`, `git add .`, `git add -u` — always specify exact paths so you don't accidentally claim someone else's work.

If the working tree contains a path that conflicts with your edits and the user doesn't want to commit it first, abort the decision and queue it back to the backlog with a `blocked: working-tree-conflict` note. Re-attempting later (when the conflict has cleared) is fine.

### 7d. Atomic commits per rollout step

For each step in the ADR's Rollout section:

1. Apply the changes for that step.
2. Run the validation listed for that step.
3. **Compare to baseline** — TS errors must not increase, lint warnings must not exceed baseline + small rounding (5 max), tests must pass at the baseline rate. Note: if the baseline already had non-zero errors/warnings from in-flight other-author work, those propagate forward — that's fine; the metric is *delta*, not absolute.
4. If validation regresses → fix inline. Do NOT stack failing commits. Do NOT use `--no-verify` or `--amend`.
5. Stage **only the paths this step touched** — `git add path/one path/two`. Never `git add -A`, `git add .`, or `git add -u` — those would sweep up in-flight work from other CLIs or the user's editor. If you can't enumerate the paths, you don't know what you changed; stop and re-inspect with `git status --short` and `git diff --name-only`.
6. **Verify the staged index before committing:** compare `git diff --cached --name-only` against the list of paths you just `git add`-ed — names, not the summary line's count (a `git rm` pre-stages a deletion that a glance at `--stat | tail -1` reads as fine). Any extra name is foreign or pre-staged — `git restore --staged <path>` each unrelated file first. Never trust the index; even worktrees can carry foreign pre-staged content. **Then check line endings** (on Windows always): compare `git diff --cached --stat` with `git diff --cached --ignore-cr-at-eol --stat`; a file whose changed-line count is far above its content change was rewritten whole by an editor's line-ending conversion. Restore the file's original endings (`git ls-files --eol <path>` shows them) before committing — a whole-file rewrite hands every concurrent session a conflict on lines it never touched.
7. **Commit in the repo's own convention.** Read the `commit-msg` hook, the contributing guide or `git log --oneline -20` first and use the type/scope shape it accepts; `architect: <step title>` only where the repo has no convention. Attribution goes in the body: an `Architect-decision: [[<ADR>]]` trailer plus any Co-Authored-By footer. A hook that rejects the message is repo law — read the hook and comply; **never `--no-verify`**, which is itself the violation.
8. Record the commit SHA in the ADR's Rollout section as you go.

### 7e. Final regression sweep

After the last step:

1. Run the overlay's `## Gates` → `final:` commands in full (default: the same set the baseline snapshotted). Long gates go `run_in_background` and their output is read before the next state-changing action.
2. Walk through the ADR's regression checklist. For each item, verify it works — run the actual code path if the overlay's `## Smoke` says how.
3. **If any checklist item is unverified, do not mark the ADR as `shipped`.** Mark `in-progress` with a "needs verification" note and queue the verification as a follow-up.

### 7f. Update ADR status

When all rollout steps are committed and regression checklist passes:
- Update ADR frontmatter: `status: shipped`, add `commits: [<sha>, ...]`.
- Move the entry in `Architect/backlog.md` from Pending to Shipped.

If only some steps shipped, status stays `in-progress` and the ADR records which steps remain.

### 7g. Repo law — non-negotiable

Every commit honors the overlay's `## Repo law` in full: its i18n contract (which locale files a new string must land in, and by which pipeline), its design-token and shared-component rules, its error-handling and IPC discipline, its out-of-scope walls. With no overlay, read the repo's rules file and follow what it states; where it states nothing, match the shape of the surrounding code rather than inventing one.

If a rollout step cannot honor the repo law, do not ship it half-converted — split that step out and record it in the ADR as remaining.

### 7h. Visual verification

For UI-affecting decisions: follow the overlay's `## Smoke` to run the app, exercise the affected surface, confirm. With no `## Smoke`, state explicitly that you have NOT visually verified — never claim "looks good" from code review alone.

