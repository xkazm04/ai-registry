---
name: cloud-dispatch
description: "Spend the Claude Code cloud-session credit as a parallel engine beside local agents. Ships a self-contained brief to a `claude --cloud` session that clones the GitHub origin, works on branch claude/cloud-<id> and returns one pull request with a RESULT.md for local review. Two ways in: explicit dispatch (a plan by default, --go to launch) and overflow - fan-out skills queue cloud_ok briefs before dispatching local workers, and a StopFailure hook ships the still-queued ones when the seat hits its rate limit (capped 6 a day). A second engine, --engine key, spends a lane's time-limited API key on local headless claude -p workers under the same landing contract, with per-lane budget, expiry and concurrency refusals (--lanes). Ships four ai-registry workload briefs: upstream delta re-scan, lead corroboration, deepen research, subject review. Not for a repo ahead of origin or work that needs local GPU, vault, sibling checkouts or fleet application. Invoke with /cloud-dispatch <brief.md> --repo <path> [--engine key --lane <l>] [--go], /cloud-dispatch status, /cloud-dispatch lanes, or /cloud-dispatch queue --add|--done|--list."
category: workflow
memory: none
version: 1.2.0
tags: cloud, dispatch, overflow, parallel, credits
argument-hint: "<brief.md> --repo <path> [--engine key --lane <l>] [--go] | status | lanes | queue ..."
---

# Cloud dispatch - a second engine that does not share the seat

> Local agents keep dying at the subscription's session limit; the LESSONS of scan-sweep,
> spark, hygiene, deepen, forge, contest and kit all record it. A cloud session started with
> `claude --cloud` runs on Anthropic's machines, bills a separate credit, and does not count
> against the plan's limits while that credit lasts. `/cloud-dispatch` turns it into a worker
> pool: **a brief goes out, a branch and a pull request come back, and adopting it is a local,
> human-reviewed act.** Nothing a cloud session writes reaches the default branch on its own.

Everything runs through three Node scripts (builtins only) under `scripts/`, plus a hook entry
and the key lane's worker (section 9);
`node --test skills/cloud-dispatch/tests/*.mjs` pins them (Node 24 refuses a bare directory).
`<registry>` below is the ai-registry checkout the skill lives in; write it as the real path on
your machine and never commit that path.

## 1. What spends the credit

The operator holds a **$250 cloud-session credit** (Max plan promotion, Help Center article
17152539 "Cloud sessions bonus credit promotion"), **expiring 2026-11-04 23:59 PT**. Verified
2026-10-06 on Claude Code 2.1.292:

| Surface | Pool it draws |
| --- | --- |
| Cloud session from claude.ai/code | the cloud credit |
| Code tab in the mobile app | the cloud credit |
| Desktop app in Cloud mode | the cloud credit |
| `claude --cloud "<prompt>"` from a terminal | the cloud credit (this skill's path) |
| Routines (scheduled cloud agents) and Projects | the Max plan's limits, not the credit |
| Remote Control | the Max plan's limits - the session runs on the local machine |
| Local CLI or desktop sessions | the Max plan's limits |
| An API key | API billing - the key lane, section 9 |
| Agent tool `isolation: "remote"` | ran on the LOCAL machine when tested - do not use it for this |

Two facts shape the scripts. `claude --cloud` refuses without an interactive terminal, so the
launcher opens a new console window (Windows only; elsewhere run `claude --cloud` yourself).
And the cloud **clones GitHub origin only** - an unpushed commit does not exist there.

## 2. When to use it, and when not

Use it for work that is self-contained against what origin already holds: a research lane, a
corroboration pass, a re-scan, a drafted landing the Director will diff-review anyway. It is
worth most when the local seat is saturated or about to be.

Do not use it when:

- **The repo is ahead of origin and the brief needs those commits.** The sync gate refuses
  (exit 1); push first. `--allow-ahead` is for the other case only (section 3).
- **The work needs this machine**: a local GPU or Ollama, the Obsidian vault, sibling
  checkouts under the fleet root, `.machine.local.json`, or fleet application (intake
  Phase 7.5 and Phase 8, deepen step 4). The cloud has none of them.
- **The output must not appear on a public branch.** The session pushes `claude/cloud-<id>` to
  origin, and every fleet repo except one is public, so the branch is publication before any
  review. Private evidence, credentials and machine paths stay local.
- **The brief needs an answer from a human mid-run.** A cloud session cannot ask the operator;
  every escalation becomes a line in RESULT.md, and a question-heavy task wastes the run.

## 3. Explicit dispatch

```
node <registry>/skills/cloud-dispatch/scripts/dispatch.mjs --brief <file> --repo <path> [--model <m>] [--label <s>] [--from <skill>] [--allow-ahead] [--go]
node <registry>/skills/cloud-dispatch/scripts/dispatch.mjs --status [--json]
```

- **Without `--go` it only plans**: it runs the sync gate, composes the prompt, prints the id,
  branch, model and prompt size, and spawns nothing. Read the plan, then add `--go`.
- **Default model `opus`.** The id is `YYMMDD-<6 hex>` and names the branch `claude/cloud-<id>`.
- **The sync gate** (plan and `--go` alike): the origin must be GitHub (anything else is
  refused); the script fetches origin and refuses when the default branch is ahead of it; a
  dirty tree only warns - and a dirty tree means the brief may name an edit the cloud will not
  see. A composed prompt over **24000 characters** is refused.
- **`--allow-ahead`** turns the ahead refusal into a warning that lists the unpushed commits
  the cloud will not see, and the ledger row records `allow_ahead`. It is legitimate only
  when the brief depends on nothing but what origin already holds and the local-ahead commits
  are unrelated to it - read the listed commits before you pass it. The default stays refuse.
- **`--go`** writes the prompt file, opens a new console window that runs
  `claude --model <m> --cloud <prompt>`, appends one ledger row and prints the `--status`
  command. The window closes itself once the cloud session exists; on a failure it stays open
  for 60 seconds so a human can read the error.
- **Exit codes**: 0 ok, 1 refused, 2 usage or fatal.

## 4. The landing contract

Every prompt ends with a fixed contract the session must follow:

1. Work on a new branch `claude/cloud-<id>` from the default branch.
2. Never push to the default branch, never force-push, never merge.
3. Write `.cloud-runs/<id>/RESULT.md` - what was done, files changed, open questions, and a
   **Handoff** section for anything a local session must do - and commit it on the branch.
4. Push the branch and open **one** pull request titled `cloud(<id>): <label>`.
5. If the task cannot be done, still push RESULT.md saying why.

**Collect** with `dispatch.mjs --status`. Each ledger row is joined with the remote:
`launching` (no status file yet), `failed(<exit>)` (the launcher failed), `running` (launched,
no branch yet), `branch` (pushed, no PR), `pr#<n> <state>`. A row that cannot reach `gh` or
origin reads `unknown`; that is the instrument, not the run.

**Adopt locally, by hand.** A cloud PR is a worker's diff, and the rule every fan-out skill
here already applies holds: the Director reviews the actual diff, never the RESULT.md
summary. `git fetch origin claude/cloud-<id>`, read RESULT.md, then read
`git diff origin/<default>...origin/claude/cloud-<id>` file by file. Then merge or close the
PR - never both halves of a choice. On a generated-file conflict (index, rules, catalog,
marketplace) regenerate with the generator; never hand-merge generated content. The
Handoff section is local work owed now: run it, or bank it with a return condition.

- **Two cloud PRs on one bundle conflict on its generated files.** Merge the first; on the
  second's branch merge the default branch in, commit the merge (taking either side of the
  generated file), THEN regenerate index, rules and catalog and commit them - the index
  stamps `changedAt` from history, so a regeneration before the merge commit is stale.
  Run `build-index --check` on the default branch after the last merge.
- **Re-read the PR head before merging a branch you just pushed.** GitHub kept PR #16's old
  head for about a minute after the push and refused the merge as conflicting against it;
  `gh api repos/<o>/<r>/pulls/<n> --jq .head.sha` must equal the sha you pushed.
- **Ledger rows in RESULT.md are appended verbatim** by the Director after the merge (a
  script that lifts each fenced row beats retyping), then `upstream-check.mjs --ledger`.

## 5. Queue and overflow

A seat limit blocks every session on the seat at once, so overflow cannot be a decision a
session makes when it hits the wall - it has to be prepared beforehand and fired by the
harness. A fan-out skill (deepen batch, a librarian lead drain, a sweep) does this:

```
node <registry>/skills/cloud-dispatch/scripts/queue.mjs --add <brief> --repo <path> --from <skill> [--allow-ahead]
node <registry>/skills/cloud-dispatch/scripts/queue.mjs --done <id>
node <registry>/skills/cloud-dispatch/scripts/queue.mjs --list [--json]
node <registry>/skills/cloud-dispatch/scripts/overflow.mjs      # StopFailure hook; reads stdin JSON
```

1. **Before dispatching each local worker**, write its brief as a cloud-eligible file
   (section 6) with `cloud_ok: true` and `queue.mjs --add` it. `--add` refuses a brief
   without `cloud_ok: true`. `--allow-ahead` stores `allow_ahead: true` on the item and the
   hook passes it through to the dispatch; the same rule as section 3 decides whether to use it.
2. **When the local worker returns**, `queue.mjs --done <id>`. A done item never ships.
3. **When the seat hits its limit**, Claude Code fires `StopFailure` with
   `error: "rate_limit"`; `overflow.mjs` ships the still-`queued` items FIFO through the same
   dispatch path, at most **6 per local calendar day per machine** (counted from the
   ledger's overflow rows). A refused item (its repo went ahead of origin) is marked
   `refused` with the reason and does not count against the cap. An item whose
   `git fetch origin` failed (network, remote) stays `queued` and is listed as `deferred` in
   the decision line: the next stop retries it. Every other hook event, or
   any other error, does nothing. The hook always exits 0.
4. **After the limit resets**, `queue.mjs --list` before resuming. An item marked
   `dispatched` belongs to the cloud now: discard its local worker's partial output and wait
   for the PR, or two versions of one worker come back. An item still `queued` (the cap held
   it) resumes locally.

The queue is machine-wide, not per session: the hook ships whatever any session queued.

**Install the hook in USER scope** - `~/.claude/settings.json`, merged into any `hooks` block
already there. It is not installed automatically; the operator adds it:

```json
{ "hooks": { "StopFailure": [ { "hooks": [ { "type": "command",
  "command": "node <registry>/skills/cloud-dispatch/scripts/overflow.mjs" } ] } ] } }
```

**One checkout, one state.** The ledger and the queue live in the checkout the script
resolves to (`AI_REGISTRY_DIR`, else the directory the real script file sits in):
`<registry>/.ai/cloud-dispatch.local.jsonl` and `<registry>/.ai/cloud-queue/` (items, prompt
and status files, `overflow.log.jsonl`), both gitignored. Call `queue.mjs` through the same
`<registry>` path the hook names. Queued from a registry worktree, an item lands in that
worktree's `.ai/` and the hook never sees it.

Keep a queued brief's file on disk until its item is `done` or `dispatched`; the queue stores
its absolute path, not its text.

## 6. Writing a cloud-eligible brief

The session starts with zero context: no conversation, no memory, no vault, no machine.

- **Self-contained.** State the task, the inputs, the method by reference to files in the
  repo, and the outputs - as if to a contractor who has only the clone.
- **Repo-relative paths only.** No machine paths, no vault paths, no sibling checkouts. An
  input must exist on origin's default branch; a local edit is invisible.
- **Name the output files** and what RESULT.md must report.
- **Respect the repo's law**: tell the session to read `AGENTS.md` (or `CLAUDE.md`) first.
  The landing contract is appended for you; do not restate it.
- **Frontmatter**, simple `key: value` lines, stripped before the prompt is sent:

  ```
  ---
  cloud_ok: true          # required for queue --add; the author's claim this brief can run blind
  label: <short text>     # the PR title suffix; --label overrides
  repo: <path>            # optional local default for --repo; never reaches the cloud
  from: <skill>           # which skill wrote it; --from overrides
  ---
  ```

`briefs/` holds the workload templates below: copy one to scratch, fill every `<...>` slot,
delete the slot hints, and dispatch or queue the copy.

## 7. Budget

- **The ledger is the spend record.** One row per launch, `mode: explicit|overflow`.
  `dispatch.mjs --status` is the count; explicit dispatches have no script cap, so count them
  against what remains.
- **Measured cost: about $16-17 per Opus upstream-delta run** (2026-10-06: two runs of
  ~18-19 minutes each, 194 and 740 upstream commits, each fanning out four read-only workers
  inside the session, cost $33 together; a one-minute smoke run did not visibly charge).
  Size of the delta barely moved the price - the method's reading budget did. $250 is about
  fifteen such runs; the upstream lane's 6-a-month cap cannot spend it alone, so give the
  remainder to lead-corroboration and deepen-research briefs. Re-measure when a brief type
  or model changes, and record it in LESSONS.md.
- **The key lane's measured cost is unknown until its first run.** `--max-budget-usd` caps one
  worker at the lane's `perRunUsd`, and the worker records `total_cost_usd` in its status
  file, so `--lanes` shows real spend. Re-measure on the first run and record it in
  LESSONS.md, per brief type, before raising `maxConcurrent` or `perRunUsd`.
- **The credit expires 2026-11-04 23:59 PT.** After that, cloud sessions draw the plan like
  any other session, so overflow no longer adds capacity. From 2026-11-05 say so, remove or
  disable the hook, and recommend neither overflow nor explicit dispatch unless the operator
  re-confirms.

## 8. Workload briefs

Each is written to the cloud session and targets ai-registry:

- [`briefs/upstream-delta.md`](briefs/upstream-delta.md) - one delta re-scan the local
  Director found due with `node scripts/upstream-check.mjs --due`; lands in the registry,
  hands fleet application back.
- [`briefs/lead-corroboration.md`](briefs/lead-corroboration.md) - one bundle's inbox leads,
  corroborated or refuted with verbatim evidence; lands only what the rules allow.
- [`briefs/deepen-research.md`](briefs/deepen-research.md) - one deepen batch-mode worker,
  run in the cloud and returned as a PR for the Director's diff review.
- [`briefs/subject-review.md`](briefs/subject-review.md) - one pending or stale subject
  re-judged under `docs/semantic-review.md`; writes only its note in `librarian/subjects/`
  and reports `review-coverage.mjs`.

The briefs address a cloud session; under the key engine its landing contract tells the
worker to read "cloud session" and `claude/cloud-<id>` as its worktree and `claude/key-<id>`.

## 9. Key lane: spend an API key on local workers

The operator holds Anthropic API keys whose credits expire. The key engine spends one on a
**local headless `claude -p` worker** that drains a backlog with the briefs above and the
same landing contract - own branch `claude/key-<id>`, RESULT.md, one pull request titled
`key(<id>): <label>`, never merge - but on this machine, beside the Max plan, billed to the key.

```
node <registry>/skills/cloud-dispatch/scripts/dispatch.mjs --lanes-init
node <registry>/skills/cloud-dispatch/scripts/dispatch.mjs --lanes [--json]
node <registry>/skills/cloud-dispatch/scripts/dispatch.mjs --record --lane <lane> --cost <usd> --label <s>
node <registry>/skills/cloud-dispatch/scripts/dispatch.mjs --brief <file> --repo <path> --engine key --lane <lane> [--model <m>] [--effort <e>] [--label <s>] [--from <skill>] [--allow-ahead] [--go]
```

**Lanes** live in `<registry>/.ai/credit-lanes.local.json` (gitignored), one entry per lane:

```json
{"lanes":{"registry":{"keyEnv":"ANTHROPIC_KEY_LANE_REGISTRY","budgetUsd":0,"expires":"2026-11-12",
  "perRunUsd":15,"maxConcurrent":3,"model":"claude-opus-5-5","effort":"high"}}}
```

- `--lanes-init` writes lanes `registry`, `cloud` and `overlord` with `budgetUsd` 0 and
  `expires` "" and refuses when the file exists. Fill in both before a run: budget 0 refuses
  every run. A lane absent from the file, or no file, refuses with "lane <x> not configured in
  .ai/credit-lanes.local.json". A malformed field is refused, never defaulted.
- `--lanes` prints per lane: spent, budgetUsd, remaining, expires, running and
  `keyEnv: set|unset`. Spent sums `cost_usd` over the lane's key rows (from each worker's
  status file) and manual rows; ledger rows without `engine` are pre-1.2.0 cloud launches
  and never count. No output, log, item or ledger row carries a key value.
- `--record` appends `{engine:"manual", lane, cost_usd, label, ts}` for spend this script
  did not launch - an overlord session or a cloud-lane run billed to a key.

**The plan and its refusals.** Without `--go` it spawns nothing and prints the lane, keyEnv
set/unset, budget, spent, remaining, running and every refusal. The sync gate of section 3
applies unchanged, because the worker branches from origin. Each refusal exits 1:

- the lane's `keyEnv` variable is unset or empty;
- `expires` is set and earlier than the local date (the expiry day itself still runs);
- remaining is below `perRunUsd` - and each running worker holds `perRunUsd` of the
  remaining budget, so concurrent runs cannot overspend it;
- running workers (key rows with no status file yet) reach `maxConcurrent`.

**The worker.** `--go` writes the prompt and a `<id>.key.json` item (it names the key's
variable, not its value) to `.ai/cloud-queue/`, opens `keyworker.mjs` in a new console window
the way section 3 opens the launcher, so it outlives the agent session, and appends a ledger
row with `engine: "key"` and `lane`. The worker fetches origin, adds the worktree
`C:/t/cd-<id>` on `claude/key-<id>` from `origin/<default>` without upstream tracking (a bare
`git push` cannot reach the default branch), copies `.machine.local.json` in when the repo
has one, and runs `claude -p --model <m> --effort <e> --max-budget-usd <perRunUsd>
--output-format json --permission-mode bypassPermissions` without a shell, the prompt on
stdin. It writes `{exit, error, cost_usd, session_id, ended}` to the status file, then removes
the worktree through `scripts/remove-worktree.mjs` (never `git worktree remove` on Windows).
The branch stays. A dirty worktree is kept and its status file says why (`cleanup_error`).
On a failure the window stays open 60 seconds. `--status` lists key rows with `engine key`,
the lane and the cost, joined on `claude/key-<id>`: `running`, `ended`, `failed(...)`,
`branch`, `pr#<n> <state>`.

- **A killed window never writes its status file.** For six hours its row counts as running
  and holds budget and a concurrency slot; after that it reads `lost`, frees the slot and is
  charged its full perRunUsd (the most it could have spent). Once you know the window is gone,
  writing the status file by hand ends it sooner:
  `{"exit":null,"error":"worker window closed","ended":"<ISO>"}`.
- **`bypassPermissions` on this machine is not a cloud sandbox.** The contract fences the
  worker inside its worktree, but that is an instruction the worker reads, not a wall.
  Dispatch only `cloud_ok: true` briefs a cloud session could run blind.

**Why the key lives in `ANTHROPIC_KEY_LANE_<LANE>` and never in `ANTHROPIC_API_KEY`.** The fleet
strips `ANTHROPIC_API_KEY` almost everywhere to stay on the subscription. An exported key
silently moves the registry's contest seats (`seat.mjs` passes the parent env), and the
pumper and pof judge scripts, onto API billing. The lane variable is read by nothing else;
the worker's child env drops every `ANTHROPIC_KEY_LANE_*` and every name in `KEY_CHILD_STRIP`
(the other Anthropic credentials, `CLAUDE_CODE_OAUTH_TOKEN`, the `CLAUDE_CODE_USE_*` provider
switches, `NODE_TEST_CONTEXT`) and sets `ANTHROPIC_API_KEY` to the lane's key for that one
process - one list, so a new credential name is added once. On the first run, confirm in the Console that the spend landed on the
key and not on the plan.

**Credits are per organization, not per key.** One key per lane separates attribution - the
Console's usage by key, and this ledger - not balances: every key in an organization draws
the same credit grant. A lane's `budgetUsd` is the operator's share of one pool, and the lane
budgets together must not exceed it.

**Review is the bottleneck, not spend.** Every worker returns a pull request the Director
must diff-review (section 4). `maxConcurrent` bounds the PR flow; raise it only when reviews
keep up.

## 10. Managed Agents lane: a nightly sweep that opens one PR

A second cloud engine beside `claude --cloud`: a Claude Managed Agents **scheduled deployment**
that spends an API key's time-limited credit instead of the plan. Each night it fires one
session against one repository, sweeps one context in scan-sweep STABILIZE style (bug, UI
correctness, performance), proves at most one fix with a test that fails on the base and passes
on the branch, and opens at most one pull request. It never pushes the default branch and never
merges; adoption stays the local, human-reviewed act of section 4.

**Templates.** [`managed/`](managed/README.md) holds repo-agnostic `ant apply` files under
`managed/agents/sweep/`: `agent.md` (Opus 5.5 at effort high, the night method as system prompt),
`environment.yaml` (cloud, `limited` egress), `vault.yaml` (container only),
`memory_store-ledger.yaml` (the coverage ledger, seeded from `data/coverage.jsonl`) and
`deployment.template.yaml` (cron `0 1 * * *` Europe/Prague, a $15 budget per session, the
repository and ledger resources, and a `user.define_outcome` with a seven-criterion rubric). The
repository is a parameter; the first instance is `xkazm04/paypal`.

**Instancing.** Copy `managed/agents/sweep/` to the gitignored
`.ai/cloud-dispatch/managed/<repo>/agents/sweep/`, fill the placeholders (`<REPO_SLUG>`,
`<REPO_URL>`, `<REPO_SETUP>`, then `<VAULT_ID>` and `<MEMORY_STORE_ID>` from `claude-lock.json`,
and `<GITHUB_PAT>` last, typed by the operator), and apply in the order the README gives:
agent, environment, vault and store; seed the ledger; the operator adds the GitHub MCP
credential; the deployment, applied and paused in one command. A deployment is live from
creation, so it is never applied without the pause beside it.

**Keys.** The lane's key lives in `ANTHROPIC_KEY_LANE_CLOUD` and reaches `ANTHROPIC_API_KEY` only
inside the README's `ant-cloud` wrapper. The GitHub PAT is fine-grained, on the one repository,
with Contents and Pull requests read and write and Metadata read. It reaches Anthropic twice: as
the repository resource's `authorization_token` (the git proxy injects it; the sandbox never
sees it) and as a `static_bearer` vault credential for `https://api.githubcopilot.com/mcp/`. No
Claude API key ever enters the sandbox, the vault, a memory or a file under version control.

**What the agent may touch.** Built-in tools default off; `bash`, `write`, `edit` run on `auto`,
`read`, `glob`, `grep` on `always_allow`, web tools off. The GitHub MCP is an allowlist:
`list_pull_requests`, `pull_request_read` and `create_pull_request`, all on `auto` - the last
departs from the security guide's `always_ask` for MCP writes because no client answers a paused
call at 01:00 and a PR is undone by closing it. Merge and edit tools stay disabled.

**Before the schedule.** One manual run of the paused deployment (`ant beta:deployments run`)
is the smoke test: toolchain installed, gates run, one PR or a reasoned no-finding, one new
ledger line, `RESULT.md` in the session outputs. Check `upcoming_runs_at`, then unpause - the
operator's call. The tool names, the PAT-as-bearer for GitHub's MCP and the sandbox's toolchain
are unverified until that run; fix the template from what it shows.

**Each morning.** Read the newest deployment run; review the PR's diff, not its summary; record
the session's `usage.list_cost` (cents) in the spend ledger:
`node skills/cloud-dispatch/scripts/dispatch.mjs --record --lane cloud --cost <usd> --label night-<repo>-<yyyymmdd>`.
A failed run carries an `error.type`; a session at `budget_reached` stays idle until the cap
is changed on purpose. Pause is reversible; archive ends the schedule for good.

**When not to use it.** A repository whose writers you do not trust (its `.claude/skills`,
AGENTS.md and CLAUDE.md load as instructions); work that needs local state, a GPU or sibling
checkouts; a repo whose gates cannot run on Linux. After the API credit is spent, pause the
deployment rather than let it bill.

---

<!-- clause: skill-reflection v6 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Run log.** Unlike a lesson, this is written on every run that started work - failed and
aborted runs included; skip read-only info modes and runs cancelled before any work. Append
ONE line to `.ai/skill-runs.local.jsonl` at the root of the task's MAIN checkout: local,
gitignored run output inside the task's own repository, never a write into the registry.
A run that worked in a linked worktree logs in the main checkout that worktree belongs to
(`git rev-parse --git-common-dir`, minus `/.git`) - a disposable worktree takes the line
with it when it is removed. `log-run.mjs` resolves this on its own.
The registry pulls it later (`/librarian skills` on the same machine). When a registry
checkout is reachable (`registry.local` in `.ai/manifest.yaml`), prefer its writer, which
stamps project, device and version for you:

```sh
node <registry>/scripts/log-run.mjs --skill cloud-dispatch --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"cloud-dispatch","outcome":…,
"difficulty":…,"provider":…,"model":…,"effort":…|null,"tokensEst":…|null,"result":…,"comment":…}`.

- `outcome`: `shipped` (the goal landed) / `partial` / `no-op` (ran correctly, nothing to
  do) / `parked` (designed or staged, deliberately not landed) / `failed` / `aborted`.
- `difficulty` rates the task as this run met it: 1 trivial - mechanical; 2 routine - the
  method as written; 3 demanding - real judgment calls or one detour; 4 hard - dead ends,
  rework or an operator course-correction; 5 at the edge - partial or failed on the merits.
- `model`/`effort` as your harness states them (`null` effort when you cannot see it).
  `tokensEst` is the drop in the harness's remaining-token counter since this skill was
  invoked, or `null` (with `log-run.mjs`, omit `--tokens-est`); exact figures are measured
  later from transcripts - never guess one.
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
