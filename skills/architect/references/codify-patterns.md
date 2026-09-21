## Phase 7B: Codify strong patterns

Triggered for every strong pattern (new or aging) marked `codify` in Phase 6. Multiple codifications can run in the same session — they're independent and lower-risk than a Phase 7 weak-pattern execution.

### 7B.a. Pick the vehicle

For each pattern marked `codify`, ask:

```
How should "{pattern title}" be codified? Pick one or more:

  1. lint-rule    - write a custom lint rule that flags non-conforming code
  2. docs-arch    - append a section to the architecture digest (loaded by all skills)
  3. docs-rules   - append a convention to the repo's rules file (surfaces in every session)
  4. test-guard   - add a structural test that asserts the pattern (fails if drift introduced)
  5. registry     - contribute it UP to the knowledge registry, so every project inherits it
  6. multiple     - pick a combination (e.g. "1+2" = lint rule + architecture docs)
```

Options 2 and 3 name the files the overlay's `## Docs vehicles` maps; with no overlay, 3 is the repo's rules file and 2 is offered only if a second architecture digest exists.

**Rule of thumb for which vehicle fits:**
- Pattern is a code shape (call site discipline, hook usage, type contract) → `lint-rule` is strongest. Falls back to `docs-arch` if the pattern is too contextual to lint mechanically.
- Pattern is an architectural boundary (module vs plugin, IPC contract, where things live) → `docs-arch` so future skills load it.
- Pattern is a project-wide convention humans need to know (i18n, design tokens, error handling) → `docs-rules` so it is loaded into every session.
- Pattern can be detected by file scan but not in a single file's AST (cross-file invariant, count threshold) → `test-guard` (a vitest test that walks the tree).
- Pattern is **true beyond this repo** — a property of the framework, the platform, or the shape of the problem rather than of this codebase → `registry`. Docs vehicles teach one repo; this one teaches all of them.

If the user picks `multiple`, codify each vehicle in a separate atomic commit.

### 7B.b. Lint rule vehicle

1. Read the linter config and any existing custom-rule directory (the overlay's `## Lint vehicle` names both) to learn the project's custom-rule conventions — rule file shape, naming, registration. If the repo has no custom-rule mechanism at all, say so and fall back to a docs vehicle.
2. Write the new rule where the existing ones live, following their shape — name format, severity, message, fix function if mechanically auto-fixable.
3. Register it in the linter config. Default severity: `warn` (a new rule over existing code is a migration, not a wall). Only use `error` if the user explicitly says "ship blocker."
4. Run the lint gate and capture the new warning count. Compare to baseline. If the new count is enormous (>500 warnings), warn the user — the rule is too noisy and either the pattern isn't actually as load-bearing as thought, or the rule needs scope narrowing. Pause for guidance.
5. Commit: `architect: codify <pattern> as lint rule` — body explains the rule, threshold, and current warning count.

### 7B.c. Docs vehicle (architecture digest or rules file)

1. Read the target file the overlay's `## Docs vehicles` names.
2. Find the right insertion point — for the digest: a "Strong patterns" section or the architecture section it relates to; for the rules file: under its conventions heading, with a subsection.
3. Write the section: name, why it works (the "load-bearing" reasoning from the strong-pattern entry), canonical example with `file:line` reference, anti-shape to avoid, optional pointer to the lint rule if `multiple` was picked.
4. Keep it concise — 10-25 lines. Long convention docs go unread.
5. Commit: `architect: codify <pattern> in <file>` — body quotes the appended section.

### 7B.d. Test guard vehicle

1. Read existing structural tests if any (grep the test tree for `structural` / `invariant` describes).
2. Write the test with the repo's own runner (the overlay's `## Test guard vehicle`, else the runner in `package.json` scripts or the toolchain default), in the location the repo already puts such tests.
3. The test should walk the file tree, grep for the anti-shape, and assert zero violations. Provide a clear failure message that points the offender to the strong-patterns entry and the rule.
4. Run the test gate and confirm the new test passes against current code.
5. Commit: `architect: codify <pattern> as structural test guard`.

### 7B.d2. Registry vehicle

Use when the insight is a property of the framework, platform, or problem shape rather than of this codebase — the test is whether a sibling project on the same stack would hit it.

1. **Find the home.** Resolve the governing subject (Phase 1b step 0). A finding almost always belongs to an existing subject: add a **technique** if it is a new mechanic the subject lacks, or an **application** (`applications/<stack>--<technique>.md`) if it is how one stack realizes an existing technique. Inventing a new subject is rare and needs the registry's own contribution rules — read `CONTRIBUTING.md` before doing it.
2. **Match the shape of its neighbours** — read a sibling file in the same directory for frontmatter keys (`layer`, `type`, `subject`, `technique`, `stack`, `verified_on`), heading rhythm, and how evidence is cited.
3. **Write from evidence, not from theory.** Quote the real source, name the version, and date the observation with `verified_on`. An application note whose claims cannot be traced to a file is worth less than no note.
4. **Say what the standard did not.** State plainly which existing technique this extends and what it adds — that framing is what makes it reviewable rather than duplicative.
5. **The registry is a different repository.** It may hold other people's uncommitted work: stage only your file, never `git add -A`, and commit there separately from the consuming repo's commits.

Two things this vehicle changes about the run, both worth stating in the scan note:

- A finding measured against a registry standard is a **deviation**, and deviations are cheaper to defend at triage than opinions.
- If the registry contradicts a strong-pattern candidate, the registry wins by default and the candidate is dropped, not noted — codifying a documented anti-pattern is the most expensive possible outcome of a scan.

### 7B.e. Update the strong-patterns entry

In `$VAULT/Architect/strong-patterns.md`, update the entry:
- `Codification status: lint-rule-added | docs-written | test-guard-added` (or combination — list all that were added)
- Add `Codified: {date}` line.
- Add `Codification ADR: [[Architect/decisions/{date}-codify-{slug}]]` (see 7B.f).
- If a docs vehicle was used, link to the file: `Docs at: <file>#<anchor>`.
- If a lint vehicle was used: `Lint rule: <rule file path>`.

### 7B.f. Mini-ADR

Codification is a real decision with rollback considerations. Write a small ADR at `$VAULT/Architect/decisions/{YYYY-MM-DD}-codify-{slug}.md`:

```markdown
---
date: 2026-05-01
slug: codify-{slug}
status: shipped
type: codification
vehicle: lint-rule | docs-stack | docs-claude | test-guard | combination
parent_strong_pattern: [[Architect/strong-patterns#{title}]]
related_scan: [[Architect/scans/{date}-{theme}]]
commits: [<sha>]
---

# Codify: {pattern title}

## Why now
{reason - typically "noted N days ago, surfaced as aging" or "identified this run, smell-strength enough to enforce"}

## Vehicle and rationale
{which vehicle picked, why this one fits}

## Rollback
{how to undo if the codification turns out wrong - e.g. "drop the lint rule, the underlying pattern remains noted in strong-patterns.md"}
```

### 7B.g. For aging patterns marked `snooze`

No codification work — just update the entry in `strong-patterns.md`:
- Add or update `Last reviewed: {today}`.
- Bump the `Snoozed until: {today + 30 days}` field (create if missing).

This commit is optional — if it's the only change of the run, commit `architect: snooze {pattern} for 30d`. Otherwise bundle into the run's regular activity.

### 7B.h. For aging patterns marked `drop`

Remove the entry from `strong-patterns.md` entirely. Add a one-line entry to `Lessons/{date}-architect.md`:
```
- Dropped strong pattern "{title}" - original date {date}, reason: {user reason}.
```

This is the cleanup path. Don't keep zombie entries.

---

