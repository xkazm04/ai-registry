---
name: contest
description: "Blind design contest between CLI agent seats (Claude Code, Codex CLI, Grok CLI). Each participant you name - engine:model@effort - builds three genuinely different prototype variants of one idea in its own workspace; a cross-family panel scores every variant blind on seven dimensions (wow, clarity at scale, wayfinding, interaction, craft, concept, utility); the host adds a visual pass in a browser; an optional reveal round lets every seat see the whole field, keep one of its own variants and master it with a comparison matrix; a router page links every blinded variant across the vault's contests; the owner declares the winner or sends a shortlist into a refinement round with their review; the winner and the design philosophies behind it land in an Obsidian vault whose pattern ledger becomes the bar in the next brief. Built for UI prototypes with a wow factor, usable for any solution design. Invoke with /contest \"<idea>\" --participants <specs> for a full round, or /contest init|run|collect|judge|reveal|router|verdict|refine|status <id> to drive one step."
category: workflow
memory: vault
version: 1.7.0
tags: contest, prototyping, ui, multi-model, blind-judging, vault
argument-hint: "\"<idea>\" --participants engine:model@effort,... | init|run|collect|judge|reveal|router|verdict|refine|status <id>"
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
- **Owner** - the person. The scoreboard is evidence; the winner is their call, and their review
  outranks the panel. On the first contest the owner filed the panel's unanimous first place under
  "not practical" and shortlisted three variants the panel had ranked fourth to sixth.

## Invocation

```
/contest "<idea>" --participants claude:opus@xhigh,grok:grok-4.6@high,codex:gpt-5.6-sol@high
/contest init|run|collect|judge|aggregate|reveal|router|verdict|refine|status <id>
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

### Design contests - when the variants are reports

A backend or architecture brief runs the same instrument; a variant is a design report that opens
in a browser. What changes is host work, all of it outside the instrument:

- **Stage the real system**, not a dataset: spec, source, schema, numbers read off the machine,
  and a `data/SCHEMA.md` carrying the honesty rules (which table is empty, which identity does not
  exist, which snapshot is stale). Never stage personal content; stage its shape.
- **Give the brief no menu.** Listing example bets made eight of nine variants build exactly those;
  name the axes a bet may differ on instead.
- **Append the owner's report bar**: the `## The bar for the report itself` section of
  `references/design-report-craft.md`, plus the repo's design Taste, to the brief. After `init`,
  replace the rendered template's UI-only lines (the runtime data example, "load the real data")
  identically in every `PARTICIPANT.md`.
- **Use a separate vault subdir** (`--vault-subdir Backend`) so the UI pattern ledger is not quoted
  at an architecture seat.
- **Weight verified claims over totals.** On a design brief the host's visual pass measures
  legibility, not soundness; before recommending, check the sharpest defects a code-reading judge
  names against `data/`.
- The owner may skip the panel and decide on the reveal alone.

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

**A host that queues its own agents** (Personas runs seats as fleet sessions, so they share the
machine's parallel cap and show up in its monitor) calls `plan` instead of `run`:

```
node <skill>/scripts/contest.mjs plan --id <slug> [--kind participants|judges] [--judges <specs>] [--only <id>]
```

It prints the seats as JSON (`id, spec, engine, model, effort, cwd, log_dir, prompt`) and spawns
nothing; `--kind judges` also writes each `JUDGE-<id>.md` and records the panel, which is the half of
`judge` that is not spawning. The host runs each seat headless in `cwd` with `prompt`, using the
isolation flags `engineCommand` lists, and leaves behind what `run` would: `log_dir/record.json`
(the same fields) and `log_dir/final.md`. `collect`, `aggregate` (which recovers a judge's verdict from
its `final.md`), `verdict` and `refine` then work unchanged.

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
participant that signed its work told the panel who it was) - except compound identifiers the
staged `data/` itself contains (`anthropic/opus@xhigh` in a brief about judge identity), which are
evidence and are kept and counted separately; a bare vendor word is always redacted - and writes `gallery.html`: the
unblinded index for the host. Read the collect output before judging; a seat with zero variants
is a rerun candidate, not an entry - and a seat that reports `completed` with zero variants is an
infrastructure failure, so read its `stderr.log` before anything else.

Collect also writes the **router**: `<arena>/<id>/router.html` for this contest, and
`<vault>/<subdir>/router.html` over every contest registered in that vault (`router.json` beside
it). It links only the blinded copies - never the gallery or the scoreboard, which name the seats -
so it is the page to hand the owner for review. `router --id <slug>` rebuilds both; `reveal`,
its collect and `verdict` refresh them.

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

Judges work in a staged copy outside the arena (`<tmp>/contest-judging/<id>-<judge>-<rand>/`,
recorded in `contest.json` as `judge_workspaces`), holding only the redacted `entries/` and the
judge's own brief - no `runs/`, no `manifest.json`, no blind map - so the panel cannot unblind
itself even with its permissions bypassed. `plan --kind judges` returns that copy as each seat's
`cwd`; `aggregate` harvests every `verdict-<id>.json` back into `judging/` and deletes the copy
(`--keep-workspaces` keeps it).

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

## 6b. Reveal - each seat keeps one variant, knowing the field

Optional, after collect and before the verdict. It turns three ideas per seat into one argued
choice per seat, and it is the round where a seat can close a defect the field exposed.

```
node <skill>/scripts/contest.mjs reveal  --id <slug> [--timeout-min 60]
node <skill>/scripts/contest.mjs run     --id <slug>-reveal
node <skill>/scripts/contest.mjs collect --id <slug>-reveal
```

`reveal` makes a child contest `<slug>-reveal` with one seat per participant that delivered (same
engine, model and effort, labelled `#reveal`). Each workspace holds `own/` (that seat's variants,
unredacted), `others/<letter>/` (every other seat's variants, blinded) and `data/`, under
`references/reveal-brief.md`: keep one of your own, master it, deliver it as `variant-<n>/` under
its original number, and add a section `id="reveal"` titled **Why this design** with a comparison
matrix against at least three competing variants from two other seats, where another variant is
better, what was taken from the field (credited by label), and why the other own variants were cut.

The reveal keeps the parent's letters, so B/2 is B/2 in both rounds. After its collect, the router
marks each seat's cut variants **eliminated** - struck through, still clickable until the verdict -
and links the mastered version beside the kept one. A seat whose reveal delivered nothing keeps all
its variants open. Judge the reveal with the panel when the owner wants a second opinion; the
owner's verdict can name a mastered variant or a first-round one.

Do not share the panel's scores with reveal seats: the round measures each seat's own judgement of
the field, and a scoreboard in the workspace would turn it into chasing the judges.

## 7. Decide

Present the scoreboard to the owner with a recommendation: the top variant, the runner-up,
where the panel and the visual pass disagreed, and which entry brought three ideas versus one.
The owner names the winner. Then:

```
node <skill>/scripts/contest.mjs verdict --id <slug> --winner B/2 [--runner-up A/1] \
  --note "<why, in the owner's words>" [--pattern "slug|statement|evidence"]... [--design <file>]
```

`--design` links the design doc the decision produced - the artefact the next session builds
from - in both routers. Two other decisions are first-class:

- `--combine A/2,B/3,D/3 --design <doc>` - no single winner; one design fuses several variants that
  answer different parts of the problem. The router marks them *in the combined design* and closes
  the contest.
- `--shortlist A/1,C/3` with a note - the decision waits on something outside the contest (a
  business consult, a measurement). The contest stays open, the router shows *shortlisted, decision
  pending* and links the note, and eliminated variants stay clickable.

A verdict does not need a panel: an owner deciding on the reveal reports alone is a valid contest.

`verdict` unblinds, writes `contests/<id>.md`, upserts the `Contests.md` index, and updates
`Patterns.md`: a pattern the winner carried gains a **win**, every pattern a judge named gains a
**sighting**. Curate with `--pattern` - the panel's tally is evidence, the host's statement of
*why the winner won, phrased so it transfers to a different dataset* is the ledger's value. Three
strong patterns beat ten restatements of the rubric.

## 7b. Another round - when the owner shortlists instead of choosing

The owner opens the variants themselves and may answer with a sorting rather than a winner:
failures, readable-but-impractical, and a shortlist with a sentence or two on each. That answer is
worth more than the scoreboard; act on it in this order.

1. **Delete what the owner called a failure**, after listing it, and re-run `collect` so the
   manifest and gallery match the disk. Keep the run records; they are the cost history.
2. **Write the owner's review to a file**: `## All` for what they said about the field, then one
   `## <letter>/<n>` section per shortlisted variant. Quote the owner verbatim first; add your
   reading of what the words ask for beneath, marked as yours. A participant must be able to tell
   the owner's sentence from the host's interpretation.
3. **Record the shortlist** - the ledger gains sightings, no wins, and the note says a round is pending:

```
node <skill>/scripts/contest.mjs verdict --id <slug> --shortlist A/2,C/1 --note <review-file> \
  [--pattern "slug|statement|evidence"]... [--force]
```

   Curate the patterns from the owner's words, not the panel's: what they praised and what they
   rejected is the taste the next brief must quote.

4. **Create the round**:

```
node <skill>/scripts/contest.mjs refine --id <slug> --shortlist A/2,C/1 --feedback <review-file> [--round 2]
```

   `refine` makes a child contest `<slug>-r<round>` with **one seat per shortlisted variant** - the
   same engine, model and effort that built it, labelled `#v<n>` - so two variants by one seat each
   get a full time budget. Each workspace holds the variant as the owner saw it (also kept under
   `seed/` for a before/after), the owner's section of the review, the panel's weaknesses for that
   variant as a defect list, and redacted copies of the other shortlisted variants under
   `reference/` so a seat can borrow what the owner praised elsewhere. The brief
   (`references/refine-brief.md`) says the owner outranks the panel and sets the practical bar:
   type-size floors, levels instead of one layer, heavy content on its own surface.
5. `run`, `collect`, the visual pass and `verdict` work on the child id unchanged. Judge the
   round with the panel only if the owner wants a second opinion; a refinement round is decided
   by the person who wrote the review.

## 8. Report

Say, in this order: the winner and its concept; the runner-up; the scoreboard; the seats' wall
time and reported cost (the CLI's figure, never an invoice); which seats did not complete and
why; the panel's composition and the self-preference disclosure when it applies; the patterns
written to the ledger; and the path of the winning artefact. A winner is promoted into a product
by a separate, reviewed change - never by copying it out of the arena inside this run.

## 9. Promote - hold the port to the winner

**A winner is chosen from pixels and ported from memory, and the port is where the win is lost.**
The first promotion measured under this method passed every gate its product had - typecheck,
lint, tests, a 205-rule census, a production build - and carried 69 computed-style deviations
from the winner, including all three properties the owner had named as the reason for choosing
it. No product gate reads a computed style or drives an interaction; this step does. The full
procedure, and the drifts it has already caught, are in **`references/promotion.md`**. In short:

1. Turn each *why* in the owner's verdict into a **role** and capture the winner's contract:
   `python <skill>/scripts/style-contract.py capture <winner> roles.json contract.json`.
2. Render the **real** product component with the **real** stylesheet and data in a harness served
   by the product's own dev server (a git-ignored folder), and port the look in the form the winner
   expressed it - a stylesheet when it is gradients and pseudo-elements, not the nearest tokens.
3. `style-contract.py check <harness> roles.json contract.json` until **0 deviations**. A structural
   deviation is fixed in the selector and said out loud; a tolerance is never widened to pass.
4. **Drive every interaction the owner named** in a browser and assert on what the product writes.
   A still frame cannot tell a selected row from one with a caret in it.
5. `scripts/side-by-side.py` for the eyes, then the **live product**, whose containers impose
   widths no harness has.

When the owner names an existing product surface as the style reference, extract it into shared
components, migrate that surface onto them, and prove the migration with the same instrument.
Report the before/after deviation counts; "it compiles and the tests pass" is not a promotion.

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
node <registry>/scripts/log-run.mjs --skill contest --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"contest","outcome":…,
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
