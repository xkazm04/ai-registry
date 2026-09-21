---
name: test-before-commit
description: "Prove a change works before it is committed by writing or extending a test that fails first and then passes. Use whenever you change behaviour, fix a bug, or accept AI-generated code."
category: testing
memory: project
version: 2.3.0
tags: verification, regression, red-green, review
argument-hint: "[change description]"
---

# Test before commit

The single habit that makes AI-generated code safe to merge: **a change is not done until
something automated would have caught it being wrong.**

## The loop

1. **Name the behaviour.** One sentence, in the caller's words, not the code's:
   "an expired token is rejected with 401", not "checkAuth returns false".
2. **Write the failing test first.** Run it. It must fail, and it must fail for the reason you
   expect. A test that passes before the fix proves nothing - it is testing the wrong thing.
3. **Make it pass.** The smallest change that turns it green.
4. **Run the neighbours.** The whole file's suite, then the module's. A green new test beside
   two freshly-red old ones is a regression, not a feature.
5. **Commit test and change together.** They are one unit of meaning. A commit that adds the fix
   and defers the test is a commit whose test never gets written.

## What to test

Test the behaviour at the boundary a caller actually uses.

- **Do** test: the contract (inputs to outputs), the error paths, the edge that caused the bug,
  the invariant that must never break.
- **Do not** test: private helpers a second time through their public wrapper, framework
  behaviour, or a mock's ability to return what you told it to return.

For a bug fix, the test is the bug report, executable. Write it from the reproduction steps
before reading the buggy code, so the test describes the requirement and not the implementation.

## Working with generated code

Generated code is confident, plausible, and unverified. Treat it as a proposal:

- Write the test yourself, or read the generated test line by line before trusting it. A pass
  that wrote the bug will happily write a test that asserts the bug.
- Check that the generated test would fail against the previous version of the code. If it
  passes on both, it is asserting nothing.
- Watch for tests that assert only on mocks (`expect(mockSave).toHaveBeenCalled()`) with no
  assertion about the observable result. That is a test of your own wiring.

## Before the commit

```
1. the new test fails without the change   yes / no
2. the new test passes with the change     yes / no
3. the module's existing tests pass        yes / no
4. test and change are in the same commit  yes / no
```

Four yeses, or it is not ready.

## Rules

- **Never** commit with `.skip`, `.only`, or a commented-out assertion. `.only` in particular
  turns a whole suite green by running one test.
- **Never** change an assertion to match new output without first deciding whether the new
  output is correct. That is how a regression gets ratified.
- If a change is genuinely untestable (a config value, a copy string), say so in one line of the
  commit body. The exception should be visible and rare.

## Related

- `ci-gate-check` - runs the full suite before the push.
- Practice `test-discipline` (D2).

---

<!-- clause: skill-reflection v4 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Lane 0 is written on EVERY run; lanes 1-3 are not. Be honest about volume: most runs produce nothing in lanes 1-3. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 0 - RUN LOG** (every run that started work, including failed and aborted ones; skip read-only info modes such as a status peek, and runs cancelled before any work). Append one row to the registry's run log with one command - identity (project, device) and the skill's version are resolved by the script, never typed (`<registry>` resolves as in lane 2 step 4):

```sh
node <registry>/scripts/log-run.mjs --skill test-before-commit --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence: what this run produced>" --comment "<free text>"
```

- `--outcome`: `shipped` (the goal landed) / `partial` / `no-op` (ran correctly, nothing to do) / `parked` (designed or staged, deliberately not landed) / `failed` / `aborted` (stopped by the operator or the harness).
- `--difficulty`: 1 trivial - mechanical, no judgment needed; 2 routine - the method applied as written; 3 demanding - real judgment calls, or one detour; 4 hard - several dead ends, rework, or an operator course-correction; 5 at the edge - partial or failed on the merits, not on tooling. Rate the TASK as this run met it, not the effort you spent.
- `--model` / `--effort`: what you are running as, as your harness states it; omit `--effort` when you cannot see it. `--tokens-est`: the drop in the harness's remaining-token counter from just before this skill was invoked to now; omit it when your harness shows no counter. Exact figures are measured later from the transcript and stored apart - never guess one.
- `--comment` is the self-reflection a reviewer will read: what went well, what the method made harder, where the skill's instructions were wrong, missing or ignored. Specific over polite; no filesystem paths or email addresses (the writer rejects them).
- If the command fails on validation, fix the named field and rerun. If the registry is unreachable, add `--pending` (the row waits in the project's `.ai/`). Never read the run log during a run: it is evidence ABOUT this skill for `/librarian skills`, and an executor that reads its own diagnosis contaminates the next measurement.

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). If this skill carries no `## Project overlay` section, or its overlay section names no location, write that dated one-liner to `.claude/test-before-commit/config.md` in the consuming repo under `## Skill improvement log`, creating the file and the heading if they are absent - so the instruction is executable in every skill. When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - test-before-commit` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/test-before-commit` in a consuming repo is a symlink to `<registry>/skills/test-before-commit` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/test-before-commit` and `git -C <registry> commit -m "skill(test-before-commit): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/test-before-commit/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/test-before-commit` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
