---
name: hackathon
description: "Time-boxed, owner-judged hackathon between CLI agent seats (Claude Code, Codex, Grok, Antigravity agy, Muse) on a BROAD track in a real repository. Use when the owner knows the area but not the feature - 'make audio usable for non-musicians' rather than 'build this panel' - and wants several minds to find the projects and race to build them against a wall clock. The host frames the track with the owner and scouts a dossier; a pre-round of seats (default opus-5.5@high + sonnet-5.5@high, any engine:model@effort) each proposes 10 grounded projects; the owner shortlists 2-4 on a blind board; each shortlisted project is built by one seat in its own git worktree of the real repo under a custom clock (default 5 h): a running baseline first, then mastery of design and execution, then features if time is left. Default is one long session per entry; --sprints runs host-paced sprints with snapshots. The owner judges from a demo pack and is always the final word - one winner, or a fusion of entries handed to /spark; a vault keeps the board, the verdict and a per-seat ledger. Sibling of /contest, which builds three variants of one specific idea, scope-bound, judged blind. /hackathon --cloud runs it overnight to 08:00 on a credit API key, handing over to the owner's subscription when the key is spent. Invoke with /hackathon \"<area>\" [--hours 5] [--sprints] [--ideators specs] or /hackathon preflight|init|ideate|board|shortlist|prepare|run|status|collect|verdict|wrap <id>."
category: workflow
memory: vault
version: 1.2.0
tags: hackathon, multi-model, time-boxed, ideation, prototyping, worktree, owner-judged, vault
argument-hint: "\"<area>\" [--cloud] [--hours 5] [--sprints] [--ideators engine:model@effort,...] | preflight|init|ideate|board|shortlist|prepare|run|status|collect|verdict|wrap <id>"
---

# Hackathon - a broad track, a wall clock, an owner who judges

> A contest answers a question the owner already asked: build this thing, three ways. A
> hackathon answers the question before that one: **what is worth building in this area at
> all?** The owner names a track. Several minds from different labs each propose projects
> grounded in the real code. The owner shortlists the few that excite them. Each one is
> raced against a clock by one seat, in a real worktree: baseline first, then mastery.
> The owner opens the running demos and decides. The vault remembers which seat had the
> ideas and which one landed them.

Everything mechanical runs through one file-backed instrument,
`${CLAUDE_SKILL_DIR}/scripts/hackathon.mjs` (Node builtins only;
`node --test ${CLAUDE_SKILL_DIR}/tests/test_hackathon.mjs` pins its pure half). Seats,
engines and envelopes are /contest's (`../contest/scripts/lib/`), so a CLI that works in a
contest works here. Every step is idempotent, so a killed session resumes by re-running
the same command.

## How it differs from /contest

| | /contest | /hackathon |
|---|---|---|
| Input | one specific idea | a broad **track**; the projects are discovered |
| Pre-round | none | every ideator seat proposes 10 projects; the owner shortlists 2-4 |
| Bound by | scope; a ceiling only as a safety net (1-2 h in practice) | **the clock** (custom, default 5 h): baseline, then mastery, then features |
| Where it builds | an isolated workspace, prototypes from disk | a **git worktree of the real repo** per entry |
| Per seat | three variants of the one idea | one project, the one the seat proposed unless reassigned |
| Judged by | blind panel + host visual pass + owner | **the owner alone**, from running demos; the host prepares the pack |

Run a contest instead when the owner can already name the feature. Run neither when the
direction is fixed: build it.

## Roles

- **Host** - the session running this skill. Frames the track with the owner, scouts the
  dossier, runs the instrument, clusters the board, prepares the judging pack, writes the
  vault. The host never builds an entry and never ranks the field unless asked.
- **Ideators** - pre-round seats, `engine:model@effort[#label]`. Default
  `claude:claude-opus-5-5@high,claude:claude-sonnet-5-5@high`. Any engine /contest knows:
  `claude`, `codex`, `grok`, `agy` (Gemini, e.g. `agy:gemini-4-argon@high`), `muse` (Meta,
  e.g. `muse:muse-wonder-1.0@high`). Each reads the code in its own detached worktree and
  writes nothing but its ideas.
- **Builders** - one seat per shortlisted project. By default this is the seat that
  proposed it, at the build effort (default `xhigh`; agy clamps it to `high`). The owner
  may reassign any project at shortlist.
- **Owner** - the person. They approve the track, shortlist the ideas, and are always the
  final judge. Their words go into the vault verbatim.

## Invocation

```
/hackathon "<area in the owner's words>" [--hours 5] [--sprints] [--ideators <specs>]
/hackathon --cloud ["<project and aim>"] [--credit-usd N] [--until 08:00]
/hackathon preflight|init|ideate|board|shortlist|prepare|run|status|collect|verdict|wrap <id>
```

The full form walks phases 0-8 with two owner stops (track approval, shortlist) and one
at the end (verdict). Under the hood every step is
`node ${CLAUDE_SKILL_DIR}/scripts/hackathon.mjs <step> --id <slug> [options]`, run from
the consuming repo's root. The arena is `.hackathon/arena/<id>/` there. Keep `.hackathon/`
git-ignored.

## Credit night (`--cloud`)

The owner starts a credit night by hand when time-limited API credits are in surplus. It is the
same hackathon run overnight and funded by a key. The evening sync replaces step 1's questions:
project and aim, walls, the night's cap, seats. The Opus 5.5 and Sonnet 5.5 pre-round runs on the
key, and the owner picks 2-4. Then `run`, launched detached, races the builders until 08:00. The key
lives in **`ANTHROPIC_KEY_LANE_HACKATHON`** and reaches only the claude seats' children. When it is
spent, capped (`--credit-usd`) or refused, the night switches to the owner's subscription once, and
every entry resumes to the same deadline. A key failure never stops an entry. Every session records
its `billing`, and `status` prints the spend. The evening sync, the launch, the machine-awake check,
the morning record in the registry's lane ledger, and the measured handover are in
[references/credit-night.md](references/credit-night.md). "Cloud" names the money: the builders run
on this machine, which must stay awake until the deadline.

## 0. Overlay, vault, inherited state

Read `.claude/hackathon/config.md` (see **Project overlay**). Every key has a default; if
defaults are in force, say so in the opening line. Then:
- `git fetch` and say how far the base is from its remote. **Build from the remote's
  base** (`--base origin/<branch>`) when the local branch is behind. Worktrees fork from a
  ref, so the operator's checkout is never touched.
- Run `git status` in the target repo. Foreign WIP never enters a worktree because
  worktrees fork from a commit. But disk space, ports and the machine's parallel cap are
  shared: count them before you size the field.
- Probe every seat you will use with a one-line prompt before the pre-round. A seat that
  fails its probe is reported and skipped, never silently replaced.
- **Size the machine, not only the field.** Run
  `node <skill>/scripts/hackathon.mjs preflight [--seats <specs>] [--entries N]`. It prints
  free memory against `entries x 3 GB + 4 GB`, warns when this process is a Claude Code child
  whose background shells are reaped under memory pressure, resolves each seat's CLI, and
  shows the effort a seat really runs at (agy runs `xhigh` as `high`). It exits 3 when memory
  is short. Each entry is a seat CLI, a dev server and often a sidecar: 1.5-4 GB. Another
  session's native build on the same box counts too. In the first run, about 12 GB of
  `link.exe` from a sibling session left 5.7 of 63 GB free, and the reaper killed the run
  mid-clock. Stop and ask the owner when preflight says SHORT.
- **Check every seat's allowance and tell the owner.** The instrument cannot read vendor
  quotas, so ask each CLI (its usage or status command) for what is left. A build seat runs
  for hours at `xhigh`. In the first run, a seat that showed 32% of its weekly allowance at
  ideation hit its limit after 2 h 26 min and lost two hours of a five-hour clock.

## 1. Frame the track - with the owner, before any seat runs

The track is the only thing every seat reads, so it is the hackathon's whole design. Help
the owner write `TRACK.md` with one wave of questions (AskUserQuestion, at most four):

1. **The area**, in the owner's words, kept verbatim, plus who it is for.
2. **The surfaces allowed**: headless service, UI, or both. Each project may choose
   within these.
3. **The hard walls**: spend, data, privacy, repo laws, what must not break.
4. **What winning looks like to the owner**: the moment a user should have. Not a
   feature list.

**Keep the track broad.** It names an area, a user and a feeling. It never names a
feature, an example project or a layout. Every example you put in the track will come back
as several seats' first idea. (/contest learned the same thing from its design briefs: a
menu is built back verbatim.) That includes the owner's own words. In the first run, one
sentence the owner typed under "Other" became the anchor of all four seats' strongest ideas.
That is right when the words are the owner's, so keep them verbatim, but never add the host's
own examples. The owner approves the final `TRACK.md` before the pre-round.

Then **scout the dossier**: one read-only scout (or more) over the area, written to
`DOSSIER.md`. It covers what exists **and runs** today (trace UI to a mount point and
services to a caller), what a user experiences end to end, the seams, the material a demo
can use without spending, the repo laws a builder must obey, and the gates. Every claim
gets a `path:line`. End it with "facts a seat must not get wrong". The dossier describes;
it never proposes.

## 2. Init

```
node <skill>/scripts/hackathon.mjs init --id <slug> --title "<title>" --track TRACK.md --dossier DOSSIER.md \
  [--repo <path>] [--base origin/main] [--ideators <specs>] [--ideas 10] [--hours 5] [--sprints] \
  [--build-effort xhigh] [--base-port 3300] [--setup "<cmd>"]... [--gate "<cmd>"]...
```

`--setup` commands run in every entry worktree **before** its clock starts (dependency
install, codegen), so a seat never spends hackathon time on `npm ci`. `--gate` commands
run on every branch at collect. Both default to the overlay's `## Setup` / `## Gates`.

## 3. Pre-round - ideate, board, shortlist

```
node <skill>/scripts/hackathon.mjs ideate --id <slug> [--only <seat>] [--timeout-min 30]
node <skill>/scripts/hackathon.mjs board  --id <slug> [--clusters clusters.json]
```

Every ideator runs concurrently in its own detached worktree at the base, with
`references/ideator-brief.md` rendered as `.hackathon/IDEATOR.md`. Each writes N ideas to
`.hackathon/IDEAS.json`, and an idea missing from the file is recovered from the seat's
final message. The schema asks every idea for a pitch, a user moment, the non-obvious
**insight**, the surface, a **baseline** that fits the first ~35% of the clock, a
**mastery** path, stretch features, **grounding** in named files, and risks. The worktrees
are removed after harvest.

Seat ids look like `claude-claude-opus-5-5_high`. A seat that failed can be hand-fed: run
`ideate --from <dir>` with `<seatId>.json` files in the dir, or `--from <file> --only
<seatId>`. A whole final message works too, because the JSON is recovered from it.

**Before the board, the host reads every idea and clusters near-duplicates** into
`clusters.json` (`{"clusters":[{"name","note","ideas":["A3","C7"]}]}`). Name each
cluster by the bet, not the feature. When two seats proposed one idea, that agreement is
a signal; say it in the cluster's note. Also check the sharpest premises against the code:
an idea whose grounding names a file that doesn't exist, or a feature that already ships,
gets a one-line note. It does not get deleted. Then `board` writes `board.html`, blind:
ideas carry seat letters (`A1`..`A10`) and no seat names.

**Show the owner the board and ask for the shortlist.** Hand over the page path, a
three-line digest per cluster and the host's flagged premises. Recommend only if asked:
the owner's taste is the measurement. They answer with any number of ids, usually 2 to 4,
optionally with a note per pick ("C7, but for developers, not end users") and a
reassignment. Then:

```
node <skill>/scripts/hackathon.mjs shortlist --id <slug> --pick C7,A3,B1 \
  [--assign B1=claude:claude-opus-5-5@xhigh] [--note "<owner words>"]
```

**Packs - when the owner picks more ideas than there are builders.** The owner may
shortlist many ideas (the first run picked 12 of 40). **Offer packs as soon as the picks
outnumber the seats.** The instrument refuses a `--pick` list longer than max(4, seats),
because every pick is a concurrent entry (override with `--force`). Packs **fuse the picks
into one entry per seat**. Some packs are *broad*: productize several ideas into one
experience. Others are *deep*: one problem, done properly. The host drafts the packs:
group by the bet, let a broad pack overlap the deep ones on purpose, and write a fusion
brief per pack. That brief names the baseline, what mastery means here, and what the pack
is judged on (one product, not ideas wired). Then propose a seat for each pack, with a
reason the owner can overrule. Fit the integration load to the strongest generalist and
give each deep pack to the seat whose idea anchors it. Then:

```
node <skill>/scripts/hackathon.mjs shortlist --id <slug> --packs packs.json [--note "<owner words>"]
```

`packs.json` is `{"packs":[{"title","focus":"broad|deep","ideas":["A1","B2"],"builder":"<spec>","brief":"<markdown>","note"?}]}`.
Each pack's `IDEA.md` carries the brief plus every fused card in full. The ledger counts a
shortlisted idea once per seat, even when it appears in two packs.

This reveals the seats on `board-revealed.html`, makes one entry per pick or pack and writes the
per-seat ledger (proposed and shortlisted). Size the field before you go on. N entries
mean N concurrent seats for the whole clock, N worktrees with installed dependencies, and
N dev-server ports.

## 4. Prepare

```
node <skill>/scripts/hackathon.mjs prepare --id <slug> [--only e1] [--skip-setup]
```

Each entry gets a worktree at `<worktrees_root>/<entry>` on branch
`hackathon/<id>/<entry>`, forked from the base, plus a port (`base_port + n`). Its
`.hackathon/` folder holds the track, the dossier and the idea card, and is listed in
`info/exclude`, so it is never committed. Then the setup runs. **Read every setup log
before starting the clock:** an entry whose install failed would spend its hackathon
repairing the environment.

## 5. Run - the clock

```
node <skill>/scripts/hackathon.mjs run --id <slug> [--only e1] [--sprints] [--dry-run]
```

This blocks for the whole clock. **Launch it out of the reaper's reach:** detached
(`Start-Process`, `nohup`, `setsid`), or from a Claude Code session started with
`CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP=1`. A plain background shell is killed with
everything under it when the machine runs short. `run` checks free memory for the entries it
is about to start and exits 3 when it is short; `--ignore-ram` overrides that. `--dry-run`
first prints the preflight line, each entry's planned session and its argv, and spawns
nothing. Before every session the instrument renders `references/builder-brief.md` as
`.hackathon/BUILDER.md` with the real times. That brief sets the rule this skill exists
for: **baseline by `started + 35%`, running end to end on real code paths, committed as
`baseline:`; then master it; features only when the core feels finished; measure the time
with `date`; commit often, because the hard stop kills the process.** Each entry keeps
`.hackathon/HACKLOG.md` (decisions, as they happen) and `.hackathon/DEMO.md` (run it,
show me, real vs stubbed).

Two modes, one loop. The session planner is a pure function, and the tests pin it.

- **Long (default)** - one session runs to the deadline. If a seat stops early, a
  **continuation** session starts with the time left and the HACKLOG. If a session crashes
  or the host dies, re-running `run` starts a **resume** session to the same deadline.
  Long mode measures a seat's own pacing.
- **`--sprints`** - the host paces. Sprint 1 is the **baseline** sprint and ends at
  `started + baseline_frac x clock`. Each later sprint is `sprint_min` long (default 60),
  clamped to the deadline. Every sprint is a fresh session that reads its HACKLOG.
  Sprints measure a seat's discipline under checkpoints, and they survive compaction
  better.

A per-entry `run.lock` (holding the pid) refuses a second `run` on the same entry. The
state file has its own lock (`hackathon.json.lock`), so a `run --only e4` beside the main
run loses no writes. Two sessions in a row that error within 2 minutes stop the entry. A
host that dies can leave the seat CLI, and any dev server or sidecar the seat started,
running. The next `run` marks that session `interrupted` and resumes. It cannot kill the
orphans, so before you re-run, kill whatever still holds the entry ports (`base_port + n`)
and the seat processes. The first run's reaped host left `next dev` and two Python
sidecars behind.

After every session the instrument snapshots: it commits the worktree if dirty, records
the sha, and copies HACKLOG and DEMO into the arena. A `seat-limit` stops that entry and
is reported, never retried in a loop. After the vendor's reset, `run --only <e>
--resume-limited` gives it one resume to the same deadline. An entry ends when:
- fewer than 10 minutes are left;
- `max_sessions` is reached, counting only the seat's own sessions (`interrupted` and
  `seat-limit` sessions don't count, because the host or the vendor ended them);
- the builder wrote `.hackathon/DONE` with a one-line reason (the brief tells it how);
- two sessions in a row completed within 5 minutes each. In the first run, a seat that said
  it was done burned four 1-4 minute continuations before this rule existed.

`run --only <e> --reopen` gives a finished entry another session to the same deadline. It
also sets aside the DONE marker. Use it only when the owner asks for more of that entry.

The first run's baselines landed 13-35 minutes in, against the 1 h 45 min that 35% of a
5 h clock allows. A smaller `baseline_frac` is a fair choice for a long clock.

**While the clock runs**, check `status --id <slug>` at a pace that matches the clock
(about every 45-60 min on a 5 h run). It shows commits since base, the last commit, and
the HACKLOG tail. Report one line per entry to the owner. Don't steer the seats:
intervening turns a hackathon into pair programming and voids the comparison. The
exceptions are a seat that has touched the operator's real store, spent money, or is
writing outside its worktree. Stop that entry (kill its seat) and tell the owner.

## 6. Collect and the judging pack

```
node <skill>/scripts/hackathon.mjs collect --id <slug> [--skip-gates]
```

Per entry: diff stats against the base, the gates run on its worktree, DEMO and HACKLOG,
the session table (kinds, walls, outcomes) and any screenshots under
`<arena>/visual/<entry>-*.png`. All of it goes into `judging.html`.

**The host's demo pass (before the owner looks).** For each entry, follow its DEMO.md
"Run it" verbatim on its port, in a fresh shell, against throwaway data. Then walk "Show
me" through the harness's browser tool, or headless Playwright. Save the screenshots as
`<arena>/visual/<entry>-<n>-<what>.png` and re-run `collect`. Record what did not run, as
evidence: a DEMO step that fails in a fresh shell is a finding the owner must see before
they open the entry. It is not something the host repairs.

How to run the pass so it is fair and leaves nothing behind:
- **One entry's server at a time. Stop it right after that entry's screenshots, and kill it
  by port.** Idle background shells are reaped under memory pressure, and a reaped shell's
  `next dev` survives as an orphan. In the first run, three servers left running while the
  owner judged held about 4 GB until the host found them.
- **Drive by role and name from a dump of the page's controls,** and fill the exact field
  the DEMO names. A host script that typed into the wrong box made one entry's step fail,
  and that was the host's error, not the entry's. When the host's tool fails a step, say
  so in the pack.
- **Result panels often live in an inner scroll container,** which a full-page screenshot
  misses. Scroll that element, or screenshot it directly.
- **Leave the trees as the seats left them.** Dev servers rewrite tracked files (Next
  rewrites `tsconfig.json`). Run `git status` in each worktree after the pass and restore
  what the pass changed.
- Gate failures need a second look before they reach the owner. Re-run a failing test
  file alone (load flakes pass), and run it on the base commit too. A test that fails
  identically on every branch and on the base was inherited from the base.

**Name the mechanism behind each headline claim, checked in the code.** Is the behaviour
the track asked for done by a model call, a rule table, or a fixture? Write it into the
entry's lines in the pack. In the first run, the owner fused a follow-up around "e1: the LLM
takes vague directions". The demo pass had shown that a sentence became chips, but never
said that a 150-row keyword table did it and no LLM was wired. /spark's scout found that out
after the verdict, and the owner's chosen architecture changed.

Also check each entry for **baseline discipline**: did a `baseline:` commit land before
`baseline_by`, and how much of the clock went to mastery and how much to features? That
is the hackathon's own dimension, and only the git history shows it.

## 7. Verdict - the owner decides

Before you wait on the owner, check that nothing from the demo pass still holds an entry
port. Then present each entry in a few lines: the project, the builder seat, what runs (from
the demo pass), gates, baseline time, and the 2-3 things that stand out. Give a
recommendation only if the owner asks. They open the demos and decide. The decision takes one
of three shapes:

```
node <skill>/scripts/hackathon.mjs verdict --id <slug> --winner e2 [--runner-up e1] --note "<owner words>"
node <skill>/scripts/hackathon.mjs verdict --id <slug> --fuse "e1=base,e2=absorb,e3=defer,e4=drop" \
  [--followup "spark <slug>"] --note "<owner words>"
node <skill>/scripts/hackathon.mjs verdict --id <slug> --close "<reason>" --note "<owner words>"
```

**A fusion is a real outcome.** The first run's owner picked no single entry. They kept one
as the base, folded a second one's backend into it, deferred a third to a later package,
and left the fourth out. Then they handed the composed scope to /spark. Record that with
one disposition per entry:
- `base`: the follow-up builds on it; the ledger credits it as the win.
- `absorb`: parts of it fold into the base.
- `defer`: kept for a later package; its branch is enough.
- `drop`

Name every entry. When the owner left one out, ask, or record it as `drop`. Then hand the
composed scope to /spark (or the repo's design loop), with the owner's words and the
arena's judging pack as its sources. Don't start the follow-up's design inside this run.
(Git Bash rewrites a leading `/` in an argument into a Windows path, so write
`--followup "spark <slug>"`, not `"/spark <slug>"`.)

The verdict writes `hackathons/<id>.md`, upserts `Hackathons.md`, and adds the built/won
counts to `Seats.md`, the per-seat ledger of ideas proposed, shortlisted, built and won.
Over several hackathons that ledger shows which seat brings ideas and which one lands them.
Those can be different seats. **Record the verdict in the same turn the owner gives it.**
A winner named only in conversation does not exist for the next session.

**The winner is a branch, not a merge.** Landing it goes through the repo's normal review:
a PR, or a spark/forge pass that reads the diff against the repo's laws. Never merge it
inside this run. When a UI winner will be rebuilt rather than merged, /contest's
promotion contract (`references/promotion.md`, `port-quality.md`) applies.

## 8. Wrap

```
node <skill>/scripts/hackathon.mjs wrap --id <slug>            # dry run
node <skill>/scripts/hackathon.mjs wrap --id <slug> --apply [--release-kept]
```

This removes the worktrees no follow-up builds from, with the junction-safe removal (never
a bare `git worktree remove` on Windows: it follows `node_modules` links into the primary
checkout). It keeps the winner's worktree, or a fusion's `base` and `absorb` worktrees, until
`--release-kept` (`--release-winner` is the 1.0.0 name). Branches are never deleted: they are
the audit record, and they cost nothing. The arena keeps the briefs, records, logs, board and
judging pack. Wrap refuses to run until a winner, a fusion or a close is recorded. When a
follow-up still reads an entry's tree, wrap after the follow-up has read it.

## Project overlay

`.claude/hackathon/config.md` in the consuming repo (tracked); the skill runs without it. Its keys (vault, arena, ideators, hours, build_effort, ports, baseline_frac, sprint_min, max_sessions) and its sections (`## Setup`, `## Gates`, `## Repo law`, `## Taste`, `## Skill improvement log`), with defaults, are in [references/overlay.md](references/overlay.md).

## Invariants

- The owner's track is kept verbatim. The host frames and scouts but never narrows it
  into a feature.
- No seat sees another seat's ideas or code during the hackathon. The board is blind
  until the shortlist.
- Every entry builds in its own worktree from one base commit. Seats never push, never
  switch branches, never touch the operator's store or checkout.
- The clock is measured by the host's planner, never by a seat's reckoning, and the
  deadline is the same for every session of an entry.
- The owner's verdict is the only verdict. The host's demo pass is evidence for it.
- The machine is shared. Size the field to free memory and to the seats' allowances before
  the clock, and leave no server running after a step that started it.

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
node <registry>/scripts/log-run.mjs --skill hackathon --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"hackathon","outcome":…,
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
