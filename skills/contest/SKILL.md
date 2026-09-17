---
name: contest
description: "Blind design contest between CLI agent seats (Claude Code, Codex CLI, Grok CLI). Each participant you name - engine:model@effort - builds three genuinely different prototype variants of one idea in its own workspace; a cross-family panel scores every variant blind on six dimensions (wow, clarity at scale, wayfinding, interaction, craft, concept); the host adds a visual pass in a browser; the owner declares the winner; the winner and the design philosophies behind it land in an Obsidian vault whose pattern ledger becomes the bar in the next brief. Built for UI prototypes with a wow factor, usable for any solution design. Invoke with /contest \"<idea>\" --participants <specs> for a full round, or /contest init|run|collect|judge|verdict|status <id> to drive one step."
category: workflow
memory: vault
version: 1.0.0
tags: contest, prototyping, ui, multi-model, blind-judging, vault
argument-hint: "\"<idea>\" --participants engine:model@effort,... | init|run|collect|judge|verdict|status <id>"
---

# Contest - three seats, three ideas each, one blind panel

> One model given one brief returns its first good idea. Three models given the same brief,
> each forced to bring three different answers, return a field - and a blind panel scoring the
> field says which idea was actually best, not which vendor the host prefers. `/contest` runs
> that field: **participants build in isolation, judges score without names, the owner
> decides, the vault remembers why.** Every contest quotes the ledger of what won before, so
> the floor rises.

Everything runs through one file-backed instrument, `scripts/contest.mjs` (Node, builtins
only; `node --test tests/` pins its pure half). Each step is idempotent: a killed session
resumes by re-running the same command.

## Roles

- **Host** - the session running this skill. Frames the brief, stages the data, runs the
  seats, does the visual pass, recommends, writes the vault. The host never builds an entry
  and never scores one it can identify.
- **Participants** - CLI agent seats named as `engine:model@effort[#label]` (`claude:opus@xhigh`,
  `grok:grok-4.6@high`, `codex:gpt-5.6-sol@high`). Each gets its own workspace holding only
  `PARTICIPANT.md` and `data/`, runs headless with the operator's user configuration excluded,
  and must leave exactly N variant directories behind.
- **Judges** - CLI seats reading the blinded copies with the rubric in
  `references/judge-brief.md`. They see code and notes, not pixels; the visual pass is the
  host's.
- **Owner** - the person. The scoreboard is evidence; the winner is their call.

## Invocation

```
/contest "<idea>" --participants claude:opus@xhigh,grok:grok-4.6@high,codex:gpt-5.6-sol@high
/contest init|run|collect|judge|aggregate|verdict|status <id>
```

The full form runs steps 1 to 8 below with a pause before the verdict. The step form drives one
step and is what a resumed session uses. Under the hood every step is:

```
node <skill>/scripts/contest.mjs <step> --id <slug> [options]
```

Run it from the consuming repo's root; the arena defaults to `.contest/arena/<id>/` there.

## 0. Overlay and vault

Read `.claude/contest/config.md` (see **Project overlay**); every key has a default, and say in
the opening line when defaults are in force. Resolve the vault: first existing `vault:`
candidate, else `<repo>/.contest/`; use `<vault>/<vault_subdir>/` (default `Contest`). The vault
is Obsidian-openable and not version-controlled; `references/vault-schema.md` is its shape. Make
sure `.contest/` is git-ignored in the consuming repo before the first run - entries are large
and belong to no commit.

## 1. Frame the brief

A contest is only as good as its brief. Write `BRIEF.md` (a scratch file; `init` copies it)
with, in this order and in plain prose:

1. **The idea** in two or three sentences - what is being prototyped and for whom.
2. **The material** - what the prototype must handle, with the real scale ("471 subjects,
   3,200 techniques in a three-level hierarchy", not "a lot of data").
3. **The wow** - what a stranger should feel in the first three seconds, and the one thing that
   must never break (readability, latency, a legal constraint).
4. **Freedoms** - what the participant may choose (framework or none, artifact type, palette).
5. **Hard constraints** - opens from disk, no build step, offline-capable, size cap, licence.

Stage the material under a directory the host owns (`--data <dir>`): the real data in a form a
static page can load (`data/<name>.js` setting a global, plus the same as `.json`) and a
`data/SCHEMA.md` that names every field. A prototype scored on invented data scores as empty,
so staging is not optional when data exists.

## 2. Init

```
node <skill>/scripts/contest.mjs init --id <slug> --title "<title>" --brief BRIEF.md \
  --participants <specs> [--variants 3] [--data <dir>] [--timeout-min 60] [--vault <root>]
```

`init` writes `contest.json`, the participants' workspaces, and each `PARTICIPANT.md` from
`references/participant-brief.md` - the idea, the deliverable contract, the rubric, and **What
has won before**: the top of the vault's `Patterns.md`, quoted as the floor with an explicit
instruction not to copy it. Read one rendered `PARTICIPANT.md` before running: if a sentence in
it would surprise the owner, fix the brief and re-init with `--force`.

## 3. Run

```
node <skill>/scripts/contest.mjs run --id <slug> [--only <participant-id>] [--force]
```

All seats run concurrently, each in its workspace, each under the wall-clock ceiling. Isolation
is parity with a benchmark run: Claude with `--setting-sources project,local --strict-mcp-config
--no-session-persistence`, Codex with `--ignore-user-config --ignore-rules --ephemeral`, Grok
with memory and the dashboard off. A seat's record lands in `runs/<id>/record.json` with outcome,
wall, turns and the CLI's reported cost.

Three outcomes are not scores: `seat-limit` (the subscription is exhausted - rerun that seat
after the reset with `--only`), `timed-out` (collect scores what exists; say so), `errored`
(read `runs/<id>/stderr.log` before rerunning - a refusal is a finding about the brief, not a
zero). Never rerun a completed seat to get a better draw; that is selection, not measurement.

## 4. Collect

```
node <skill>/scripts/contest.mjs collect --id <slug>
```

Validates every workspace (variants present, notes present, stray files named), assigns blind
letters by a hash of the contest id, copies each variant under `judging/entries/<letter>/` with
every vendor, model and participant name **redacted** (leaks are counted and reported - a
participant that signed its work told the panel who it was), and writes `gallery.html`: the
unblinded index for the host. Read the collect output before judging; a seat with zero variants
is a rerun candidate, not an entry.

## 5. Judge

```
node <skill>/scripts/contest.mjs judge --id <slug> --judges <specs> [--timeout-min 30]
```

Choose the panel by the rule benchmark judging uses: **no judge shares a family with every
participant, and two judges never share one family with each other.** When all three families
compete, the rule cannot be met; use two judges from different families, blind them anyway, and
disclose in the report that self-preference is possible. Judges write `verdict-<id>.json` (schema
in `references/judge-brief.md`); the instrument validates each verdict, recovers one a judge left
in its final message, and aggregates into `judging/scoreboard.md`: mean and spread per variant,
the six dimension means, per-judge totals, and the patterns and anti-patterns the panel named.

A spread of 3 or more on one variant is not noise to average away: read both verdicts and say
what they disagreed about. A variant marked `broken` by any judge sinks below every intact one.

## 6. The host's visual pass

Run this pass **before** launching the judges when the machine is shared, or after they finish:
a headless browser and two judge seats loading the same 2 MB page at once produced one false
'broken' on the first contest. Judges read code. The owner will look at pixels. So the host looks at **every** variant at two
window widths - through the harness's browser tool when one is attached, otherwise headless:

```
python <skill>/scripts/visual-pass.py .contest/arena/<id> [--widths 1280x800,1920x1080]
```

which needs Playwright for Python and writes, per blinded variant and width, a load screenshot,
a screenshot after one neutral probe (centre hover, one zoom tick, one click, a typed query) and
`runs/visual/report.json` with page errors and structural counts - under `runs/`, not `judging/`,
because a judge working in `judging/` must never see the host's eyes. The host reads the images
and writes its own verdict on the panel's schema to `runs/verdict-host-visual.json` -
`judge: "host-visual"`, `broken: true` for anything that does not render, the screenshot name in
`strengths`. The host knows who made what, so it scores **before** reading the panel's verdicts
and says so. Then:

```
node <skill>/scripts/contest.mjs aggregate --id <slug>
```

## 7. Decide

Present the scoreboard to the owner with a recommendation: the top variant, the runner-up,
where the panel and the visual pass disagreed, and which entry brought three ideas versus one.
The owner names the winner. Then:

```
node <skill>/scripts/contest.mjs verdict --id <slug> --winner B/2 [--runner-up A/1] \
  --note "<why, in the owner's words>" [--pattern "slug|statement|evidence"]...
```

`verdict` unblinds, writes `contests/<id>.md`, upserts the `Contests.md` index, and updates
`Patterns.md`: a pattern the winner carried gains a **win**, every pattern a judge named gains a
**sighting**. Curate with `--pattern` - the panel's tally is evidence, the host's statement of
*why the winner won, phrased so it transfers to a different dataset* is the ledger's value. Three
strong patterns beat ten restatements of the rubric.

## 8. Report

Say, in this order: the winner and its concept; the runner-up; the scoreboard; the seats' wall
time and reported cost (the CLI's figure, never an invoice); which seats did not complete and
why; the panel's composition and the self-preference disclosure when it applies; the patterns
written to the ledger; and the path of the winning artefact. A winner is promoted into a product
by a separate, reviewed change - never by copying it out of the arena inside this run.

## Project overlay

Everything one repository is lives in **`.claude/contest/config.md`** (tracked). The contest
runs with no overlay at all; say when defaults are in force. YAML frontmatter for scalars,
`##` sections for prose. Keys (default in brackets):

```yaml
---
vault: ["<abs obsidian root>", ...]   # candidate roots, first existing wins  [<repo>/.contest]
vault_subdir: Contest                 # namespace inside the vault; "" = the root itself  [Contest]
arena: .contest/arena                 # where contests and entries live, git-ignored  [.contest/arena]
participants: ""                      # default seats when the call names none  [none - the call must name them]
judges: ""                            # default panel  [none - the call must name them]
variants: 3                           # per participant  [3]
timeout_min: 60                       # per seat  [60]
---
```

| Section | What it carries | Default when absent |
|---|---|---|
| `## Engines` | where a CLI lives when it is not on PATH: `CONTEST_CLAUDE_BIN`, `CONTEST_CODEX_BIN`, `CONTEST_GROK_BIN` values, and any seat-specific env | PATH lookup, then `~/.local/bin/claude`, `~/.grok/bin/grok`; an npm shim resolves to its entry script |
| `## Data` | how this repo stages material for a brief (which script builds the snapshot, what it must include) | none - the host stages by hand and says how |
| `## Taste` | what the owner wants judged harder here (motion, accessibility, density, print) - appended to every brief | none |
| `## Skill improvement log` | dated lines from the reflection clause | empty |

<!-- clause: skill-reflection v4 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

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
