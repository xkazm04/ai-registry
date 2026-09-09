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

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Project learning.** Put a dated observation in the consuming project's configured
overlay under `## Skill improvement log`, when local edits are within scope. Use the
location in this skill's `## Project overlay` section. If none is configured, use
`.agents/test-before-commit/config.md` for Codex or `.claude/test-before-commit/config.md` for Claude.
If the harness is unknown, propose the note in the response instead of guessing a path.
Use a supplied memory contract only when its destination and writes are authorized.
Keep project details out of the shared method.

**Method learning.** Identify the installation before editing anything. A local
`.ai/registry-installation.local.json` receipt can identify development versus release,
the registry revision, and selected skill versions. Verify any link's actual target;
do not assume a skill directory is a writable registry link.

- For a pinned release, marketplace cache, ordinary copy, or unknown installation,
  keep a proposal in the project overlay or response. Do not edit the installed method
  or silently relink it. Adoption and rollback are explicit installation operations.
- For a development link, edit the registry only when that checkout is already within
  the accepted task scope. Otherwise report a proposal. Authorized changes belong in
  the source checkout, followed by its gates; commit only when the task authorizes it.
- Record an actual lesson in `LESSONS.md` against the version **used**:
  `## <version-used> - <YYYY-MM-DD> - <project-name>` and concise bullets. A proposal
  must be labeled as such; structural checks are not evidence of field effectiveness.
- Applied skill changes require a version bump: patch for wording, minor for a step
  refinement, major for method redesign. A lesson alone needs no bump. Shared stamped
  clauses are edited in the registry's `docs/skill-clauses/` and regenerated with
  `scripts/apply-skill-clauses.mjs`, never patched in individual installed skills.

**Domain learning.** Follow `## Knowledge sync` when present, within the same scope
and privacy boundaries. A method lesson and a domain knowledge lead are different
artifacts; do not fabricate either to fill a reflection quota.
<!-- /clause: skill-reflection -->
