# Lessons - friend

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.1.0 - 2026-09-01 - kp (Fable vs Opus bake-off, Hiring Pipeline)
- The skill is personas-specific in six places (vault path, `.claude/codebase-context.md`, the 8-area menu, the area->path table, Tauri verified mode on :17320, 13 locales); both runs had to substitute kp's `context-map.json` groups, `.claude/CLAUDE.md`, and the sibling overlays' gates. Both wrote a `.claude/friend/config.md` overlay for kp. The overlay contract its siblings use is the fix; until then the substitutions are documented in kp's overlay.
- The knowledge-sync clause says "read before you propose" but sits ~650 lines below Phase 1a's read list; the Opus run followed the layout and read the bundle last, then found two deviations it would have put on the menu. The Fable run read it first and its pick came from it. Phase 1a should name the governing subjects as read item 4.
- In a fresh worktree every file carries the checkout mtime, so Phase 1b step 6 (sort by mtime) is noise; `git log --since` carried the whole recency signal.
- Phase 6b's rejection-reason prompt is the only writer of `passes.md`; a delegated run defaults to `skip`, so autonomous cycles never populate one of the four learning artifacts. Say so in the artifacts table.
- kp's `commit-msg` hook rejected a subject that ends on a continuation word; read the hook before the first commit.
- Pick: Fable (role-keyed thresholds, the registry technique's own recommendation); Opus's tooltip threading is the next cycle.

## 1.1.0 - 2026-09-01 - kp (model bake-off)

- Context: Hiring Pipeline.
- `model: fable`. Run head-to-head with identical inputs, Fable read the registry subject before proposing and shipped the direction it named (role-keyed aging thresholds, one group boundary crossed and declared); Opus stayed strictly in-area, shipped the editor + tooltip half, and deferred the role-keyed change as its next direction. The operator picked Fable's cycle. Opus's method notes were folded in: the knowledge-sync read is a Phase 1 input (not a closing ritual), the recency signal in a fresh worktree comes from `git log --since`, never from mtime, and Phase 6b can only write `passes.md` in an interactive session. See LESSONS.md.

## 1.2.1 - 2026-09-04 - ai-registry

- The dated `## Model choice (bake-off 2026-09-01, ...)` section moved out of the SKILL.md body into the block above. The lane spec (`docs/skills-lane.md`, "The body is generic") says a body may carry no project name, and this one named kp; a dated finding about a run is what `LESSONS.md` owns. Content preserved verbatim; nothing else in the body changed, so a patch bump.
