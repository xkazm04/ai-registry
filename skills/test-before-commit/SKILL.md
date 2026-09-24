---
name: test-before-commit
description: "Prove a change works before it is committed by writing or extending a test that fails first and then passes. Use whenever you change behaviour, fix a bug, or accept AI-generated code."
category: testing
memory: project
listing: on
version: 2.5.1
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
3. the module's existing tests pass - or
   every failure among them was proved to
   fail at HEAD without your change        yes / no
4. test and change are in the same commit  yes / no
5. the repo's format and lint gates pass
   on the changed files                    yes / no
6. no existing test was edited to keep it
   green - or the report names the
   behaviour change it accommodates        yes / no
```

Six yeses, or it is not ready.

**A pre-existing failure is proved, not asserted.** "It looks unrelated" and "it passed on a
re-run" are not proofs. Stash your change, or check HEAD out into a scratch worktree, run the
*same* command, and quote both results - the failure at HEAD and the identical failure with your
change beside it. Without that pair, it is your failure.

**Line 5 is the repo's own gates, not your judgement of the diff** - the format check as well as
the linter. A file that reads fine and that `format --check` rejects is a commit CI will bounce.

**Line 6 is disclosure, not permission.** Editing an existing test or fixture is sometimes right;
doing it silently never is. When one is edited, the report and the commit body name the behaviour
change it accommodates and why the new behaviour is correct. An edit whose only effect is turning
a red test green is the regression, ratified.

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

<!-- clause: skill-reflection v5 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Run log.** Unlike a lesson, this is written on every run that started work - failed and
aborted runs included; skip read-only info modes and runs cancelled before any work. Append
ONE line to `.ai/skill-runs.local.jsonl` at the root of the checkout you worked in: local,
gitignored run output inside the task's own repository, never a write into the registry.
The registry pulls it later (`/librarian skills` on the same machine). When a registry
checkout is reachable (`registry.local` in `.ai/manifest.yaml`), prefer its writer, which
stamps project, device and version for you:

```sh
node <registry>/scripts/log-run.mjs --skill test-before-commit --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"test-before-commit","outcome":…,
"difficulty":…,"provider":…,"model":…,"effort":…|null,"tokensEst":…|null,"result":…,"comment":…}`.

- `outcome`: `shipped` (the goal landed) / `partial` / `no-op` (ran correctly, nothing to
  do) / `parked` (designed or staged, deliberately not landed) / `failed` / `aborted`.
- `difficulty` rates the task as this run met it: 1 trivial - mechanical; 2 routine - the
  method as written; 3 demanding - real judgment calls or one detour; 4 hard - dead ends,
  rework or an operator course-correction; 5 at the edge - partial or failed on the merits.
- `model`/`effort` as your harness states them (`null` effort when you cannot see it).
  `tokensEst` is the drop in the harness's remaining-token counter since this skill was
  invoked, or `null`; exact figures are measured later from transcripts - never guess one.
- `result` is one line (max 240 chars). `comment` (max 2000) is the self-reflection a
  reviewer reads: what worked, what the method made harder, where its instructions were
  wrong, missing or ignored. No filesystem paths or email addresses.
- Never read run logs during a run. They are evidence ABOUT this skill for its reviewer;
  an executor that reads its own diagnosis contaminates the next measurement.

**Project learning.** Only when this run produced an observation that would change how a
future run behaves. A run that went as the method describes writes nothing: an entry that
restates the procedure, records "no issues", or repeats the task is a defect, not a
deliverable. When there is such an observation and local edits are within scope, put one
dated line in the overlay this skill's `## Project overlay` section names, under
`## Skill improvement log`. **Write only into an overlay that already exists.** If the
project has none, put the observation in the response instead - creating a new tracked
file for a reflection is scope the task did not ask for, and a reader who never asked for
the skill has to review it. If the overlay is a structured config (YAML, TOML, JSON),
record the note as comments so the file keeps parsing, or use the response.
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
