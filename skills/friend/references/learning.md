# Friend learning artifacts

Loaded on demand from `SKILL.md`: at the first vault write (lazy bootstrap) and when a
user asks how the loop learns. Paths are relative to `$VAULT/<vault_subdir>/` (written
`Friend/` for the default subdir) unless they start with `$VAULT/`.

## What learns, from what

| Artifact | Written | Read | What it does |
| --- | --- | --- | --- |
| `Friend/coverage.md` | Phase 6f, every session that ran a cycle | Phase 0 auto-pick, Phase 1a | Last visit, acceptance density, and **kept/shipped** per area. Kept/shipped is derived from git (Phase 0b), so it is written even when nobody answers a question. |
| `Friend/passes.md` | Phase 6e, on hard reject (6b answered, interactive only) | Phase 1a rejection set | Title-level fingerprint per area of directions a person refused on principle. Delegated and headless runs never write it - which is why merge learning exists. |
| `$VAULT/Patterns/friend-preferences.md` | Phase 6g, after 3+ observations, a person confirms | Phase 1a, hard constraint in Phase 2 | Distilled rules ("prefer X over Y in this codebase"). One promotion per session at most. |
| `$VAULT/Lessons/{date}-friend.md` | Phase 6d, every session | last 3 at Phase 1a | Per-session self-reflection; the source signal for promotion. |
| `Friend/sessions/{date}-{slug}.md` | Phase 6c | Phase 0b (branch + commit range) | The canonical session record; merge learning reads its `Branch:` and `Commits:` lines after a branch is deleted. |

Evidence the loop reads but never writes: the registry map's deviation pairs, the
directions ledger, `/explorer`'s passes, `/scan-sweep`'s backlog digest and sweep history,
`/perfect`'s rejected directions. Those belong to their owners.

Never block on any of these being missing. The first sessions over a new area run on
scan + registry evidence alone, and that is fine.

## Lazy bootstrap

Phase 0 only resolves `$VAULT`. Create a directory or file the moment something is first
written to it, never before - a session that runs no cycle leaves the vault untouched.
Create `Friend/` and `Friend/sessions/` as needed, and each file with its header:

`Friend/coverage.md`:
```markdown
# Friend Coverage

Heatmap of areas visited by `/friend`. Used by Phase 0 auto-pick to favor stale, high-yield areas.
Kept/shipped is derived from git: a friend branch merged into the base branch is shipped,
one unmerged for 14+ days or deleted unmerged is a soft reject.

## Areas
```

`Friend/passes.md`:
```markdown
# Friend Passes

Per-area record of directions that were proposed and **hard-rejected** in past sessions.
Future Phase 2 proposals over the same area filter against these. Soft skips (user picked
a different option) are NOT recorded here - only hard rejects (explicit "no", refresh of
the whole menu with a reason, or "other" with a rejection note).

## Areas
```

`$VAULT/Patterns/friend-preferences.md` (create `$VAULT/Patterns/` if missing):
```markdown
# Friend Preferences (distilled from /friend sessions)

> Rules upgraded from `Lessons/` after 3+ observations. Loaded by Phase 1; biases Phase 2.
```

Do NOT create `$VAULT/Lessons/` - that folder is shared with `/explorer` and `/research`,
and they bootstrap it. Until it exists, embed the lesson block in the session note.

## Pacing (so "smarter over time" is not read as "smarter on cycle 2")

- **Session 1 over an area:** no patterns, no passes - but registry deviations, the
  directions ledger and sibling passes already seed the menu, and earlier friend branches
  already say what shipped.
- **Sessions 2-3:** Lesson notes influence proposal *shape*; kept/shipped starts to
  separate shapes that merge from shapes that rot on a branch.
- **Sessions 3-4:** typically the first pattern promotion (Phase 6g).
- **Session 5+:** promoted preferences filter shapes a person has refused; coverage routes
  auto-pick to fresher areas.

Surface this in the exit summary on early sessions ("first pattern promotion typically
happens around session 3-4") so the slow loop does not read as a missing feature.
