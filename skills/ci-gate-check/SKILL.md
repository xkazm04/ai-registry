---
name: ci-gate-check
description: "Run the exact checks CI enforces before you push, so a red pipeline is never how you find out. Use before every push, before opening a PR, and after an agent finishes a batch of edits."
category: ci-cd
memory: project
version: 1.7.0
tags: pre-push, gate, lint, typecheck, tests
argument-hint: "[--fix]"
---

# CI gate check

CI is the slowest possible place to learn that a change is broken. This skill runs the same
checks locally, in the same order, and reports one verdict: **safe to push** or **not yet**.

## When to use

- Before `git push`, always.
- After an agent has made more than one file's worth of edits.
- Before marking a PR ready for review.

## The gate

**The repo's own gate outranks the table below.** Read its declared commands first, in order of
preference:

1. The repository's own gate script (`scripts/gates.sh`, `make ci`, a `justfile` `ci` recipe).
   If one exists, run **that** - it IS the list of checks, and every stage in it is a stage here.
2. `.ai/manifest.yaml` -> `capabilities`. Every capability it declares is a stage, whatever its
   name - secret scans, dependency and policy audits, conformance - not only the five below.
3. `package.json` scripts, `Makefile` targets, `justfile` recipes, `pyproject.toml` tool config
4. The CI workflow itself (`.github/workflows/*.yml`) - whatever it runs IS the gate, and any job
   CI marks **required** is a stage even when no table row names it.

The table below is the default ordering for a repo that declares nothing - not a ceiling. Five
green stages while a required secret-scan or audit job is red is not a gate; it is a push into a
red pipeline.

Never invent a command. If a stage has no command in this repo, report it as **not configured**
and move on; a fabricated command that "passes" is worse than a missing one.

**Environment step first.** Where the repo declares a dependency/sync/install step, run it before
the stages that need it - that is what CI does. `build` is an artifact stage only where its
command produces artifacts: a manifest whose `build` is `uv sync --extra dev` or `npm ci` is the
environment step, and running it last makes every other stage fail in a fresh checkout.

Run the stages in this order and stop at the first hard failure:

| Stage | Why it is here | Typical command |
| --- | --- | --- |
| format | cheapest, removes noise before it reaches review | `npm run format:check`, `ruff format --check .`, `gofmt -l .` |
| lint | catches the class of bug a type checker will not | `npm run lint`, `ruff check .`, `golangci-lint run` |
| typecheck | the highest signal per second on typed codebases | `npx tsc --noEmit`, `mypy .`, `go vet ./...` |
| test | behaviour, the only stage that proves intent | `npm test`, `pytest -q`, `go test ./...`, `cargo test` |
| build | catches boundary breaks a type check cannot see | `npm run build`, `cargo build --release` |

The `build` stage matters more than it looks: a project can typecheck clean and still fail to
build (a server-only import pulled into a client module, a missing asset, a bad path alias).
If the repo has a build command, it is part of the gate.

## Three outcomes per stage, not two

- **ok** - the check ran and passed.
- **FAIL** - the check ran and the code did not pass.
- **could not run** - the command exists but its toolchain does not: dependencies not installed,
  the tool not on PATH, a checker resolved outside the repo's lockfile, a required environment
  variable unset.

Before calling anything FAIL, confirm the tool is the one CI installs. If a stage could not run,
run the repo's setup/sync step and retry it once. A gate still carrying a "could not run" stage
yields `not yet - <stage> unverified` - never "safe to push", and never "do not push" either:
setup breakage is not code health, and reporting it as one is how a green pipeline gets blocked.

## Reporting

Print one line per stage and one verdict. Do not paste whole logs.

```
format     ok      0.8s
lint       ok      4.1s
typecheck  FAIL    9.2s   src/api/user.ts:41  Type 'string | null' is not assignable to 'string'
test       -       not run (earlier stage failed)
build      -       not run

VERDICT: do not push. 1 failing stage, first error above. Stages test, build were not run and are unverified.
```

The last line is a **required literal**, not an example: `VERDICT: ` then one of `safe to push`,
`not yet - <stage> unverified`, or `do not push`, then the reason. Unadorned plain text on its own
line - no markdown emphasis, no bullet, no wrapping, no prose paraphrase.

**A stopped gate is not a full gate.** Stopping at the first hard failure is the rule, so the
verdict must name what is left unproven: "Stages X, Y were not run and are unverified". Only a run
in which every stage reported `ok` may say `safe to push`.

On failure: fix the first error, then re-run the gate from the top. Do not fix errors in bulk
across stages - a lint fix routinely changes what the type checker sees.

## Rules

- **Never** push with a failing stage because "CI will catch it". CI catching it is the failure.
- **Never** disable a check to make the gate green. If a rule is wrong, change the rule in its
  config file, in its own commit, with a reason.
- A flaky test is a failing test until it is quarantined deliberately and tracked.
- **A gate run is a read.** Record `git status` before the first stage and restore what the gates
  wrote - regenerated files, line-ending churn, caches. If a stage cannot run without modifying
  the tree, name the touched files in the verdict.
- Timebox: if the full suite takes longer than a few minutes, run the affected subset locally
  and say so in the verdict (`test  ok (subset: src/api)`), so the reader knows what was proven.

## Related

- `test-before-commit` - the tighter inner loop this skill backstops.
- Practice `ci-gates` (D3) - the CI side of the same contract.

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
node <registry>/scripts/log-run.mjs --skill ci-gate-check --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"ci-gate-check","outcome":…,
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
