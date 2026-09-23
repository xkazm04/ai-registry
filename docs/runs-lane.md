# The run log: `usage/runs/`

Versioning says WHICH method a skill is. `usage/<contributor>.json` counts HOW OFTEN it is
invoked. `LESSONS.md` keeps what a run taught, when it taught anything. None of them says
**how each run went**. The run log does: one row per skill run, written by the agent at the
end of the run, so `/librarian skills` can judge a skill from its runs rather than from
anecdote.

```
<project>/.ai/skill-runs.local.jsonl  LOCAL, gitignored, one line per run         - the agent writes
usage/runs/<device>.jsonl             APPEND-ONLY, committed (rkb-run/1)          - runs-backfill pulls into it
usage/runs/<device>.exact.jsonl       SIDECAR keyed by run id (rkb-run-exact/1)   - runs-backfill measures into it
```

**The project writes, the registry pulls.** The shared reflection clause holds that a skill
run grants no permission to edit another repository, and a release install (see
[installations.md](installations.md)) has no registry checkout to write into at all. So a
run only ever appends to its OWN checkout's local file; `runs-backfill.mjs`, run in the
registry on the same machine (the first step of `/librarian skills`), stamps and pulls.

- **Who writes:** every lane skill, through the stamped `skill-reflection` clause (v5,
  "Run log"), on every run that started work - failed and aborted runs included, read-only
  info modes excluded. The registry's own hand-written skills (intake, assay, ...) do not
  log yet.
- **Who reads:** `/librarian skills`, through `scripts/runs-report.mjs`, and
  `build-catalog.mjs` for the per-skill `runs30d` fields. **Never the executing skill**: a
  trace produced while the executor can read its own diagnosis measures the diagnosis
  (agent-memory / diagnosis-withheld-from-the-executor).
- **Per device, committed.** One file per machine (`Fox`, `Wolf` - the `machines` of
  `projects.json`), so two machines never conflict. The files are committed and carry free
  text by operator decision (2026-09-21); the leak floor still refuses filesystem paths and
  email addresses. `/librarian skills` commits them as `chore(runs)` commits.
- **Self-report is weak evidence.** Outcome, difficulty, model and effort are the agent's
  own account; the difficulty anchors exist so different models rate alike. Tokens are an
  estimate in the log and a measurement in the sidecar, and the two are never blended.
- **Contract:** `scripts/lib/runs.mjs` (keys, enums, anchors, limits, identity).
  Unlike `usage/<contributor>.json`, which is a snapshot rewritten on every export, this
  lane only grows.

## Writing a run: `scripts/log-run.mjs`

Every lane skill ends every run that started work with ONE call, from whatever cwd it ran
in (usually a consuming project):

```sh
node <registry>/scripts/log-run.mjs --skill spark --outcome shipped --difficulty 3 \
  --result "one line: what the run produced" --comment "free self-reflection" \
  --provider claude --model claude-opus-5 [--effort high] [--started <ISO>] [--tokens-est <n>]
```

- **Stamped, never typed:** `schema`, `ts` (now, UTC), `device` and `contributor` (the
  registry's `.machine.local.json`), `project` (the fleet checkout containing the cwd, else
  the cwd's `.ai/manifest.yaml` `repo.name`, else the directory name; `--project` overrides),
  and `id` = `<device>-<YYYYMMDDTHHMMSSZ>-<skill>`.
- **`--version` is optional.** The harness strips frontmatter when it loads a skill, so the
  agent often cannot see its own version; the writer takes the checkout's
  `.ai/registry-installation.local.json` version, else `skills/<skill>/SKILL.md`, else
  `.claude/skills/<skill>/SKILL.md`, and exits 1 with "pass --version" if none has one. An
  explicit `--version` wins.
- **`--skill` accepts scoped names** (`ai-registry:spark`, `spark:spark`); the bare name after
  the last `:` is logged.
- **`--json <file>`** supplies the same fields under their row key names (for long comments);
  flags override it. Keys the writer stamps are refused.
- `--dry-run` prints the row and the target and writes nothing. `--help` prints the outcome,
  provider and difficulty anchors.

The row is built in `RUN_KEYS` order and validated **before** anything touches disk. Any
problem (bad enum, difficulty outside 1-5, text over its limit, a filesystem path or email
in `result`/`comment`) prints every problem by field name and exits 1 with nothing
written; an append-only file cannot take a bad line back. Exit 2 means it could not run
(unknown flag, unreadable `--json`).

**Local file.** log-run always appends to `<checkout root>/.ai/skill-runs.local.jsonl`
(the nearest ancestor holding `.ai/manifest.yaml` or `.git`) and never writes `usage/runs/`.
`--pending` was removed (exit 2). An agent without the script writes one JSON line itself
with at least `ts` (ISO, `Z`), `skill`, `outcome`, `difficulty`, `result`, `comment`,
`provider`, `model` (`validateLocal`); unknown keys are refused. With no machine identity,
log-run writes `device`, `contributor` and `id` as null and the drain stamps them.

## The row

| key | meaning |
|---|---|
| `outcome` | `shipped` / `partial` / `no-op` / `parked` / `failed` / `aborted` |
| `difficulty` | 1 trivial, 2 routine, 3 demanding, 4 hard, 5 at the edge (self-rated; anchors in `runs.mjs`) |
| `result` | one line, at most 240 chars |
| `comment` | self-reflection, at most 2000 chars; URLs fine, paths and emails refused |
| `provider` / `model` / `effort` | self-reported; the sidecar carries the observed values |
| `tokensEst` | the agent's estimate; measured tokens live only in `<device>.exact.jsonl` |

## The gate: `scripts/check-runs.mjs`

Runs in `gate.mjs` (usage lane and `--all`, right after `check-usage`) and in the
`usage` job of `knowledge.yml`. It first asserts the leak scanner fires on its own controls
(exit 2 if not), then requires: only `<device>.jsonl` and `<device>.exact.jsonl` in
`usage/runs/`; each stem a machine declared in `projects.json` `machines`; every log row's
`device` equal to its stem and passing `validateRun`; every sidecar row passing
`validateExact` with an id present in its device's log; no duplicate ids; no unparseable
lines; no path or email anywhere in a raw line. Failures print as `file:line`. An absent or
empty lane passes.

`REGISTRY_RUNS_ROOT` (tests only) redirects check-runs' `usage/runs/`. log-run has no hook;
`scripts/tests/runs.test.mjs` runs it with cwd in a temp checkout.

## Backfill, sidecar, report and catalog fields

### `scripts/runs-backfill.mjs` - per device, for that device's own log

Run on the machine that produced the runs (`node scripts/runs-backfill.mjs [--dry-run]`).
Device = `loadFleet(root).machine`; no identity is FATAL (exit 2). Two passes:

1. **Drain.** Looks for `.ai/skill-runs.local.jsonl` at the registry root, every fleet
   checkout that exists here, and every `.claude/worktrees/*` under either. Each row passes
   `validateLocal`, then is stamped (`stampRow`): device and contributor are always this
   machine's; project = the row's, else the fleet slug of the checkout holding the file;
   version = the row's, else the checkout's installation receipt, else the lane
   frontmatter; `id = runId(row)`. It is then held to `validateRun` and appended to
   `usage/runs/<device>.jsonl`. Only after the append succeeds is the local file rewritten,
   keeping rows that failed (reported) plus anything appended while the drain ran. A row
   whose id is already in the log is dropped, not appended twice. A row with no resolvable
   version, or whose `device` names another machine, stays in place and is reported.
2. **Measure.** For each `provider: "claude"` row whose id is not yet in
   `<device>.exact.jsonl`, find its Claude Code session and write ONE sidecar row.
   Transcripts live in `~/.claude/projects/<encoded>/`, where `<encoded>` is the checkout's
   absolute path with every non-alphanumeric character replaced by `-`
   (`C:\Users\x\dolla\ai-registry` -> `C--Users-x-dolla-ai-registry`); worktree sessions
   get their own `<encoded>--claude-worktrees-<name>` folder, which is searched too.
   Project `ai-registry` resolves to the registry root. A session is a candidate when its
   lines span the row's `ts` (2 min slack). Window end = `ts`; window start = `started` if
   given, else the latest `Skill` tool_use naming the skill (bare or `plugin:skill`), else
   the latest `<command-name>/skill</command-name>` user line. `matched` records the
   strongest evidence the session ran the skill: `skill-call`, `command-tag`, or `window`
   (only `started`, no anchor). No `started` and no anchor = **unmatched, reported, never
   estimated**. Several qualifying sessions: the one that ran `log-run` near `ts` wins;
   otherwise the row is reported ambiguous.

Usage is summed over assistant lines in the window **once per `message.id`** (one API
message spans several lines carrying the same usage) across the session file and
`<session>/subagents/*.jsonl`. `model` = most frequent `message.model` in the main session
(`<synthetic>` ignored); `effort` = most frequent top-level `effort` field. Idempotent: a
second run writes nothing. The log itself is never rewritten.

### Sidecar row (`rkb-run-exact/1`)

`{schema, id, session, model, effort, input, cacheWrite, cacheRead, output, matched}` -
input/cacheWrite/cacheRead/output are `input_tokens` / `cache_creation_input_tokens` /
`cache_read_input_tokens` / `output_tokens`. Fresh tokens = input + cacheWrite + output;
cacheRead is reported apart.

### `scripts/runs-report.mjs` - the librarian's view

`node scripts/runs-report.mjs [--since 30d] [--skill <n>] [--device <d>] [--json]` reads
every device's log and sidecar. Per `skill@version`: runs, outcome counts, mean difficulty
(1 dp), `medianExact` (n = `exactCount`), `medianEst` (n = `estCount`), the headline
`tokens` with `tokensBasis`, `medianCacheRead` (measured only), models/projects/devices,
first/last ts, and every run's `{ts, project, outcome, difficulty, result, comment}`.
`--json` emits `{schema: 'rkb-runs-report/1', since, generatedAt, lane, skills}`. An
empty lane prints that it is empty and exits 0.

Skill names fold through `identity-aliases.json` (`skills`) in the report and the catalog,
so a renamed skill keeps its history; an unknown name keeps its logged name.

### Token basis rules

Estimate and measurement are never blended into one number. `tokens` is the exact median
when measured rows are at least half of the group's runs, else the estimate median, else
null; `tokensBasis` is `exact` / `estimate` / null accordingly. Both medians are always
reported with their counts.

### Catalog fields

`build-catalog.mjs` adds per skill (all versions folded, via the same
`lib/runs-aggregate.mjs` the report uses): `runs30d`, `outcomes30d` (non-zero keys only),
`difficulty30d`, `tokensMedian30d`, `tokensBasis30d` - zero / `{}` / null when a skill
has no runs. The 30-day window ends at the **newest row in the lane**, not the wall clock,
so `--check` stays a pure function of the tree; for "as of today" use runs-report.
