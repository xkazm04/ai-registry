---
name: cloud-dispatch
description: "Spend the Claude Code cloud-session credit as a parallel engine beside local agents. Ships a self-contained brief to a `claude --cloud` session that clones the GitHub origin, works on branch claude/cloud-<id> and returns one pull request with a RESULT.md for local review. Two ways in: explicit dispatch (a plan by default, --go to launch) and overflow - fan-out skills queue cloud_ok briefs before dispatching local workers, and a StopFailure hook ships the still-queued ones when the seat hits its rate limit (capped 6 a day). Ships three ai-registry workload briefs: upstream delta re-scan, lead corroboration, deepen research. Not for a repo ahead of origin or work that needs local GPU, vault, sibling checkouts or fleet application. Invoke with /cloud-dispatch <brief.md> --repo <path> [--go], /cloud-dispatch status, or /cloud-dispatch queue --add|--done|--list."
category: workflow
memory: none
version: 1.1.0
tags: cloud, dispatch, overflow, parallel, credits
argument-hint: "<brief.md> --repo <path> [--go] | status | queue ..."
---

# Cloud dispatch - a second engine that does not share the seat

> Local agents keep dying at the subscription's session limit; the LESSONS of scan-sweep,
> spark, hygiene, deepen, forge, contest and kit all record it. A cloud session started with
> `claude --cloud` runs on Anthropic's machines, bills a separate credit, and does not count
> against the plan's limits while that credit lasts. `/cloud-dispatch` turns it into a worker
> pool: **a brief goes out, a branch and a pull request come back, and adopting it is a local,
> human-reviewed act.** Nothing a cloud session writes reaches the default branch on its own.

Everything runs through three Node scripts (builtins only) under `scripts/`, plus a hook entry;
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
| An API key | API billing |
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
   `refused` with the reason and does not count against the cap. Every other hook event, or
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
