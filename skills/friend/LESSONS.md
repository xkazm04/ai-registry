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

## 1.2.1 - 2026-09-04 - ai-registry (overlay-ization)

- **The skill declared itself project-specific and behaved like it.** The body opened with "one area of the personas codebase", hardcoded an absolute Obsidian vault path (a tracked machine path, against the registry's privacy rule), carried an 8-row area table of one repo's `src/features/*` and `src-tauri/*` paths, and pinned that repo's gate commands, lint-rule names and generated-binding tree. Per `docs/skills-lane.md` that is a project skill, not a lane skill - except every byte of it was *configuration*, not method. Overlay-izing it was the whole fix: the method survived unchanged and got shorter.
- **A `## Project overlay` section is cheaper to write against a precedent than from scratch.** `skills/perfect/SKILL.md` had already settled the shape - YAML scalars for single values, `##` sections for lists and prose, a table of section -> what it carries -> default when absent - and copying that shape meant every removed project byte had an obvious destination and an obvious default. The keys that fell out: `product`, `stack`, `vault`/`vault_subdir`, `base_branch`, `worktree_dir`, `active_runs_ledger`, `context_taxonomy`, `context_outbox`, `verify_url`, `locale_count`, `commit_types`; the sections: `## Areas`, `## Gates`, `## Repo law`, `## Codegen`, `## Docs`, `## Verified mode`, `## Context sources`, `## Direction taste`, `## Skill improvement log`.
- **Every default has to be executable, or the skill is still project-bound.** The test applied to each key was "what does a cycle do in a repo that declares nothing" - areas derive from top-level source dirs, gates detect from the build manifest, the vault falls back to `<repo>/.friend/`, and the two features that genuinely cannot be faked (verified mode, per-context coverage) SKIP with one honest line rather than pretending. A default of "ask the user" would have been a hidden requirement.
- **The line count went DOWN (774 -> 768) while the section was added.** Concrete config is verbose: an 8-row path table, a 15-line component import list and a locale pipeline collapsed to four generic sentences plus overlay pointers. Overlay-ization is not a size trade.
- **Grep is the acceptance test, not reading.** Sweeping the body for `personas`, `src-tauri`, `src/features`, `Obsidian`, `C:/`, `cargo`, `custom/no-` found leftovers in places a read had passed over - the `Files:` example in the Phase 2 direction template, `^master` in the exit summary's inspect command, `Obsidian/personas/...` in the files-updated block. Run the grep against the body with the stamped clause blocks stripped, since a clause legitimately names paths the body may not.

## 1.3.1 - 2026-09-09 - ai-registry

- Architecture review: the shared reflection clause assumed a writable registry link in every installation. Replaced that assumption with installation-aware scope and explicit adoption. This records an instruction audit, not a field effectiveness result.

## 1.6.0 - 2026-10-14 - personas

- Headless field run (`/friend agents --pick auto --cycles 1`) landed one feature commit with no prompt: offline connector probes shown as "couldn't reach" instead of a red failure, 38 files, tsc clean, 53 vitest pass, hooks passed. Verified by checks only, since the app was not launched (no `--verify`). The Evidence header showed 29 deviations, a standard slot from a deviation pair, and 6 directions filtered as prior rejections or in-flight subjects.
- `git worktree add -b <branch>` without a start point branched from whatever the main checkout had checked out, not the base branch. 0d now names `<base_branch>` explicitly.
- Ranking deviations before filtering them lets rejected pairs crowd the top 5. The order is now: filter by the rejection set, then rank and keep 5. Pairs carry no technique field, so the technique is chosen from the subject's `use_when`.
- Gitignored evidence (the scan-sweep backlog digest) exists only in the main checkout; a fresh worktree reads it as absent. Evidence reads and the consults/run logs now go to the main checkout.
- tsc failed until the i18n type generator ran after the string catalogue changed; Phase 4 now runs codegen on any catalogue change, falling back to the generators the typecheck depends on.

## 1.6.1 - 2026-10-14 - firetv
- First adoption in firetv (linked, overlay written). Math area, one menu: the operator answered "execute all". The method had no multi-pick lane, so the five directions ran as five sequential cycles, each delegated to one subagent in the shared worktree (they shared rules files, so parallel was out); 14 commits, gate green. 1.7.0 adds the `all` / list choice and `--pick all|N,M`.
- The operator then asked to run again "on top of the current branch"; 0d could only cut a fresh worktree from the base branch. 1.7.0 adds the continue prompt and `--on <branch>`.
- The baseline gate was red until a second dependency directory (a tools package beside the app) was linked; 0d names one. The repo's backlog was a richer evidence source than the registry map (0 deviations), but four of its open rows had already landed - probe a row before proposing it.
