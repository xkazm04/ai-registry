# Friend exit templates (Phase 6b-6h)

Loaded on demand from `SKILL.md` § Phase 6. Paths are relative to `$VAULT/<vault_subdir>/`
(written `Friend/`) unless they start with `$VAULT/`. Create files lazily with the headers
in `learning.md`.

## 6b - Rejection reasons (optional enrichment, interactive only)

Skipped in headless runs (`--pick`) and whenever nobody is answering; merge learning
(Phase 0b) is the signal that does not depend on it. When a person is present, ask once:

```
For the directions you didn't pick this session, was it:
  [from cycle N] {title}
  [from cycle M] {title}
  ...

Reply per-item ("N: too risky, M: wrong layer") or one overall reason.

Shortcuts:
  skip    - record "no reason given" (still a soft skip, not a hard reject)
  hard <ids>  - mark these as hard rejects in passes.md (e.g. "hard N,M")
  Enter   - same as "skip"   <- default
```

- **Soft skip** (default for unpicked) - may return in a future session; session note only.
- **Hard reject** (`hard <ids>`, or a reason that reads as principled refusal: "wrong
  direction", "we already tried this", "doesn't fit the product") - lands in `passes.md`.

## 6c - Session note

`Friend/sessions/{YYYY-MM-DD}-{slug}.md`:

```markdown
# Friend session: {area} - {YYYY-MM-DD HH:MM}

Worktree: `{worktree_dir}/{slug}/`
Branch: `worktree-{slug}`
Mode: {interactive | headless --pick {N|auto|all|N,M} --cycles {N}}{ - continued on <branch>}
Cycles: {N}
Commits: {first-sha}..{last-sha}

## Evidence loaded

- Deviations in scope: {n} ({subject list}); standards slot: {subject/technique | empty - reason}
- Prior rejections loaded: {n} (filtered from menus: {n})
- Earlier friend branches: {shipped}/{judged} shipped

## Cycles

### Cycle 1 - OK {title} ({sha}) - standard: {subject/technique | none}
- What: {one line}
- Files: {N}, +{a}/-{b}
- Picked by: {person | auto - one-line reason}
- Other proposed (soft-skipped): {titles}

## Hard rejects this session

- [{area}] {title} - {reason} (-> added to passes.md)

## Graduated to /perfect

- {title} - {what} - why big: {reason} - spans: {files/contexts}
  (omit the section if nothing graduated)
```

## 6d - Lessons (shared folder)

If `$VAULT/Lessons/` exists, append to `$VAULT/Lessons/{YYYY-MM-DD}-friend.md`; otherwise
embed the block at the bottom of the session note:

```markdown
## Session: {timestamp} - {area} ({N} cycles)

Accepted: [titles]
Hard-rejected: [titles with reasons]
Soft-skipped: [titles]

### Self-reflection
- Direction shapes that resonated: {pattern}
- Direction shapes that didn't: {pattern}
- Calibration drift: {e.g. "proposed 4 modal-driven flows out of 15; 1 picked"}
- Evidence I should have read earlier: {observation}
```

## 6e - passes.md

For each hard reject, append under the area's section (create it if missing):

```markdown
## {area}

- {short-title} - {one-line What} - pass {date}, session {slug}, reason: {short reason}
```

## 6f - coverage.md

Update or insert the area's row. `Kept/shipped` comes from Phase 0b and is written on
every session, headless included:

```markdown
### {area-slug}

- Last visited: {date}
- Last session: [[Friend/sessions/{date}-{slug}]]
- Cycles last 3 sessions: [3, 5, 2]
- Acceptance density last 3 sessions: [3/8, 5/15, 2/6]   <!-- picked/proposed -->
- Kept/shipped: {shipped}/{judged} as of {date} - shipped: {branches}; soft-rejected: {branches}; pending: {n}
- Notes: {anything noteworthy across sessions}
```

## 6g - Pattern promotion

Read the last 20 `$VAULT/Lessons/*-friend.md`. An observation seen in **3+ sessions** with
close-synonym phrasing is a promotion candidate. Interactive:

```
I've seen this 3+ times across sessions - promote to a permanent preference?

  "{distilled rule}"

Source sessions: [[{session-1}]], [[{session-2}]], [[{session-3}]]

Next? (Enter = 1)
  1. promote to Patterns/friend-preferences.md   <- default
  2. snooze - re-ask after 3 more observations
  3. drop - don't promote, reset the counter
```

Headless: never promote unattended; name the candidate in the exit summary instead.

## 6h - Exit summary

Never auto-merge, never delete the worktree or branch. Print:

```
Session done.
  Branch:    worktree-{slug}
  Worktree:  {worktree_dir}/{slug}/
  Commits:   {count}  ({first-sha}..{last-sha})
  Area:      {area}
  Acceptance: {picked}/{proposed}  ({pct}%)
  Friend branches: {shipped}/{judged} shipped

To merge: from the main checkout,
  git merge --no-ff worktree-{slug}
To inspect first:
  git log --oneline worktree-{slug} ^{base_branch}
  git diff {base_branch}...worktree-{slug}
To discard:
  git worktree remove {worktree_dir}/{slug} && git branch -D worktree-{slug}
{when 0d linked dependencies:}
The worktree's dependency links were removed. To run the app there, re-link them
(Phase 0d) - or merge first and run it from the main checkout.

Files updated:
  + {VAULT}/{vault_subdir}/sessions/{date}-{slug}.md
  + {VAULT}/Lessons/{date}-friend.md              (if Lessons/ exists)
  ~ {VAULT}/{vault_subdir}/coverage.md
  ~ {VAULT}/{vault_subdir}/passes.md              (if any hard rejects)
  ~ {VAULT}/Patterns/friend-preferences.md        (if pattern promoted)
  ~ {active_runs_ledger}                          (entry moved to completed; omit if none)
```
