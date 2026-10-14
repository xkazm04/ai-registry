---
name: cx
description: "Use when a prototype or app already exists and the job is to make its user experience good, or to finish it. Walks the product's user journeys screen by screen with a CX/UX lens: at each stop a short overview of the screen as the user meets it, 3-6 specific improvements graded by impact and effort, each naming its heuristic and the project's design doc, the user's own read and expectation for that stop, then executor subagents that make the accepted changes - verified by gates and a screenshot, committed per stop. `diff [<ref>]` is the daily-sized entry: it maps the routes and components changed since a ref to at most three stops and reads them with no map, overlay or vault; `--no-dispatch` keeps it read-only. In `complete` mode the map is the path to the product's final output, the SEAMS between screens are stops too, and a stop that is absent is designed and built rather than deferred. With `--auto` it walks the whole map unattended: executes every xs-m item under gates and an independent verifier and queues only l/xl items for human triage (`/cx triage`). Resumes across sessions from an Obsidian vault. Pairs with /explorer (code quality) and /architect (structure)."
argument-hint: "[next|diff [<ref>]|map|complete|screen <id>|status|replan|triage] [--auto] [--no-dispatch] [--stops N]"
category: workflow
memory: vault
contexts: tracked
version: 1.6.1
tags: cx, ux, journey, screens, review, dispatch, continuity, completion, autonomous, diff, obsidian
---
# CX

Walk the product the way a user does — one journey, one screen at a time — and at every stop do
four things: **see** the screen as the user meets it, **read** it with a CX/UX practitioner's eye,
**hear** the user's own expectation for it, and **change** it through executor subagents that land
verified, committed work. The journey is planned once and walked across as many sessions as it
takes; the vault remembers where you stopped, what was decided, and what the decisions taught.

The method is **repo-agnostic**: it does not know your screens, your design language or your
tooling. It takes those from the overlay below and from the vault it keeps.

## Project overlay

Everything one product is lives in **`.claude/cx/config.md` in the consuming repo** (tracked). The
walk runs with no overlay — every key has a default — but say so in the Phase 0 opening line, and
never paste one product's overlay into this file.

```yaml
---
product: "<product name>"              # [repo directory name]
surfaces: ["tv", "phone"]              # the screens' hosts, as the user names them  [one: "app"]
vault: ["<abs obsidian root>", ...]    # first existing wins  [<repo>/.cx]
vault_subdir: Cx                       # namespace inside the vault  [Cx]
design_doc: docs/DESIGN.md             # the design philosophy every proposal is judged against  [DESIGN.md and PRODUCT.md, at the root or in docs/, whichever exist - the authority wins over a mirror (Phase 1); else none]
screens_source: docs/SCREENS.md        # where the screen inventory lives  [derived by reading the UI code]
executor: sonnet                       # subagent model for dispatch  [sonnet]
stops_per_session: 3                   # how many stops one run walks before it closes  [3]
commit_format: "cx(S<n>): <screen> - <what changed>"   # the subject shape Phase 6 commits under  [this]
---
```

| Section | What it carries | Default when absent |
|---|---|---|
| `## Journeys` | seed journeys: `persona - scenario - success signal`, one per line | derived in Phase 2 from the screen inventory and confirmed with the user |
| `## Screens` | `id - surface - how to reach it (route, keys, state)` | derived from `screens_source`, else from the UI code |
| `## Run` | how to start the product and how to capture a screen (the command that yields a PNG) | "not runnable here" - proposals are made from code and the inventory, and say so |
| `## Gates` | what an executed change must pass | detected from the toolchain (`tsc --noEmit`, `npm test`, `cargo check`); say what was detected |
| `## Repo law` | the design rules and code conventions a change must honor | "read the repo's CLAUDE.md/AGENTS.md and the design doc first" |
| `## Heuristics` | product-specific checks added to the practitioner's list (10-foot UI, voice, a regulated flow) | the built-in list in `${CLAUDE_SKILL_DIR}/references/cx-heuristics.md` |

## Interaction conventions

Built for parallel CLI control — every user prompt is single-keystroke answerable.

- **Every prompt is a numbered menu.** Numeric input picks; **Enter** takes the default; option
  `1. other -> ...` is the deviation lane (free text).
- **Every phase output ends with a `Next?` block** of 2-5 numbered actions.
- **One stop, one exchange.** The run never asks two things about the same screen in a row: it
  shows the read, takes the user's turn once, then acts.
- Long free text is welcome everywhere — the user's expectation at a stop is *meant* to be prose.
- **Under `--auto` there are no prompts at all** until the run ends: every menu takes its default,
  Phase 5 is replaced by auto-triage, and the only thing waiting for a human is the triage queue.

## Modes

| argument | does |
|---|---|
| *(none)* / `next` | resume: the first stop in `journey.md` not marked done; walk up to `stops_per_session` |
| `diff [<ref>]` | the daily-sized entry: the routes and components touched since `<ref>`, read as at most 3 stops, with no map, overlay or vault needed. See **Diff mode** |
| `map` | build the journey map (first run), or rebuild it after screens changed; confirms with the user before writing |
| `complete` | map the **path to the product's final output** rather than a tour of what exists: every stop carries a state grade, the seams between screens are stops, and an absent stop is designed and built instead of deferred. For an unfinished product. **Read `${CLAUDE_SKILL_DIR}/references/complete-mode.md` before its map** |
| `screen <id>` | jump to one stop out of order |
| `status` | print the journey with each stop's state and the last three decisions; change nothing |
| `replan` | keep decisions, re-derive the stop order from the current screens |
| `triage` | walk the human triage queue (`Cx/triage.md`) that `--auto` filled: one menu per item, accepted items dispatched and committed against their stop |
| `--auto` | walk unattended: every stop in the map, in order, each read, auto-triaged, built, verified and committed before the next. Only l/xl items and the gated classes wait for a human. See **Auto mode**. Combines with `next`, `complete`, `map`/`replan` (map written without confirmation) and `--stops N` |
| `--no-dispatch` | do everything except Phase 6: write the briefs, dispatch nothing. With `diff` it also writes nothing: proposals only, in the response |
| `--stops N` | override `stops_per_session` for this run |

## Constants

- **A stop is one screen in one scenario.** The same screen met in two journeys is two stops,
  because the user arrives with different intent and the read differs.
- **`complete` mode adds two units**: the **seam** (the handoff between two stops, read by
  following the data, not the pixels) and the **state grade** (`built` / `thin` / `fixture` /
  `absent`, from evidence that answers "does this step do its job"). Both are defined in
  `references/complete-mode.md`. A grade set from the map is a hypothesis until its stop is walked.
- **3-6 proposals per stop.** Fewer is a screen that is already right; say so. More is a list, and
  lists are not reviewed.
- **Grade every proposal** by *impact* (`H` the user would notice on first use / `M` on repeat use /
  `L` polish) and *effort* (`xs` minutes, one file / `s` an hour, a few files / `m` a session, a
  component or a flow / `l` several sessions, a cross-cutting change, or a design decision / `xl` a
  new module, a new data model or a redesign), and name the heuristic it serves. Grade effort by what
  the change touches, not by how fast an executor types: `l` and `xl` are where a human decides, so
  the grade is a routing decision and is never shaded down. A proposal without a heuristic is an
  opinion; keep it out.
- **The user's expectation outranks the read.** When the user's expectation for a stop contradicts
  a proposal, the proposal is withdrawn and the disagreement is recorded, not argued.
- **Done for a stop** = every accepted item landed and verified, or explicitly deferred with a reason;
  the stop note written; `journey.md` updated.

---

## Phase 0: Read the overlay, resolve the vault

Read `.claude/cx/config.md` if it exists. Resolve `VAULT` = the first `vault` candidate that exists;
if none does, fall back to `<repo>/.cx/` and **create it**. A missing vault is never a reason to abort.
The one exception is `diff`: it never creates a vault, and with none the read goes in the response.

```bash
VAULT=""
for c in "${VAULT_CANDIDATES[@]}"; do [ -d "$c" ] && { VAULT="$c"; break; }; done
[ -n "$VAULT" ] || { VAULT="$PWD/.cx"; mkdir -p "$VAULT"; echo "No configured vault found - using fallback $VAULT"; }
```

Open with one line: which vault won, whether an overlay was found, which mode is running.

### Bootstrap (one-time per vault)

Create whatever is missing, with the headers in `${CLAUDE_SKILL_DIR}/references/vault-formats.md`:
`$VAULT/Cx/`, `$VAULT/Cx/stops/`, `Cx/journey.md`, `Cx/state.md` and `$VAULT/Patterns/cx-preferences.md`.
Don't create `Lessons/` (shared with the other vault skills).

## Phase 1: Load memory and context

Read, in order, and say in one line what was and was not found:

1. `$VAULT/Cx/state.md`, then `$VAULT/Cx/journey.md` — where the walk is.
2. The last two stop notes in `$VAULT/Cx/stops/` — the recent decisions, so a proposal the user
   declined at the previous screen is not made again at this one in different words.
3. `$VAULT/Patterns/cx-preferences.md` — the promoted rules; treat them as the user's standing law.
4. The overlay's `design_doc` — every proposal is judged against it, never against taste. When one
   design file declares another the authority, or is a generated mirror of it, judge and cite
   against the authority. Citations are always repo-relative (`docs/DESIGN.md:<line>`).
5. The overlay's `screens_source`, else the UI code — the inventory of what exists.
6. `${CLAUDE_SKILL_DIR}/references/cx-heuristics.md` — the practitioner's list.

If `journey.md` has no stops, the mode is `map` regardless of what was asked — except `diff`, which
never builds a map.

## Phase 2: Map the journey (`map`, or a cold vault)

Derive the journeys from the overlay's `## Journeys` if present, else from the screen inventory:
for each persona the product names, the scenarios they arrive with, and the screens each scenario
crosses in order. Then present the map as a numbered menu and take one answer:

```
Journey map - <product>  (<n> journeys, <m> stops)

J1  <persona> - <scenario> - success: <signal>
    1. <screen> (<surface>)  2. <screen>  3. <screen> ...
J2  ...

1. other -> edit (add / remove / reorder in free text)
2. Accept and start walking            [default]
3. Accept, walk J<k> first
4. Rebuild from the code, ignore the seed
```

A seed line that names two screens with a slash (`about / trust`, `inbox / thread`) is **two stops,
not one** — the skill's own unit says so, and bundling them costs more than a line: the read spends
its proposals across two surfaces, and one word from the user about either can withdraw half of them.
Split at map time.

Write `journey.md`: one stop per line, `[ ] S<n> · J<k>.<i> · <screen> (<surface>) · <what the user
is trying to do here>`. Stop ids are stable for the life of the vault; a `replan` reorders lines and
never renumbers.

**In `complete` mode** the map is the path to the final output: name the ending first, grade every
stop, insert and grade the seams, give absent stops a line, and present the grades before asking
where to start — all as `references/complete-mode.md` says.

## Phase 3: Arrive at a stop

For the next `[ ]` stop (or the one named), **reach the screen** using the overlay's `## Run`:
start the product if it is not running, drive it to the screen in the scenario's state, and capture
a PNG into `$VAULT/Cx/stops/<id>-before.png`. When the product cannot be run here, say so and read
the screen from its code and inventory instead — a proposal made from code is marked `(from code)`.

**Capture every surface the stop names.** A scenario that crosses two hosts (a big screen and the
phone that drives it) is captured on both (`<id>-before-<surface>.png`) and read on both, each with
its own heuristics. A second surface mentioned in one line of the read is a surface nobody reviewed,
and the user finds it impossible to operate after the first one was accepted.

**Two things make a capture worse than none, and both are silent.** A page that reveals its content
on scroll photographs as a column of empty blocks: the full-page shot is taken before the observers
fire, so the read is made against bands that rendered nothing. Scroll the page through in steps,
return to the top, and only then capture — and take the fold separately, unscrolled, because the
fold is what the user actually meets. And a screen reached by a deep link may render without the
state the steps before it write; assert the capture arrived (a title, a test id, a known string)
before reading it.

**The user may decline capture outright**, and that is a legal mode, not a degraded one: some owners
review the live product themselves and want the walk's attention on the read. Record it as a standing
preference, mark the proposals `(from code)`, and never spend a turn re-asking. A seam or an `absent`
stop has nothing to photograph; capture what the user meets instead (`references/complete-mode.md`).

Then write the **overview**, six lines, in the user's words not the system's:

```
S<n> · <screen> · <surface>                J<k> <persona>: <scenario>
Arrives from   <previous stop>, wanting <the intent>
Path           <what makes that arrival real: the upstream step that wrote this state>
Sees           <the one thing the screen leads with>
Does           <the primary action, and how many inputs it costs>
Leaves to      <the next stop>, having <the outcome>
Risk           <the one way this stop most plausibly fails the user>
```

**Challenge the path before reading the screen**, in every mode. If the only way to this screen is
a seeded fixture, a deep link, or state that nothing upstream writes, the path does not exist yet:
the `Path` line says so, and it is the read's first finding at `H` (`the payload crosses`), not a
polish item. In the default modes it goes to the user as a question — walk this journey in
`complete` mode, or polish knowingly — and is never polished around in silence.

## Phase 4: The read

Run the heuristics list against the screen **in this scenario** — not the screen in general. For
each proposal record `heuristic`, `evidence` (what on the screen or in the flow triggered it — a
pixel, a count, a missing state), `change` (one sentence a builder can act on), `doc` (the design
doc's line it is judged against, cited `<file>:<line>`, or `doc: silent`), `impact`, `effort`.
Then present:

```
Read of S<n> - <screen>

#  Impact  Effort  Heuristic                 Proposal
1  H       s       primary action            ... (DESIGN.md:<line>)
2  M       xs      orientation               ... (doc: silent)
...

Withheld:   <proposals considered and dropped, with the one-word reason - "design doc says",
            "declined at S3", "needs data">
Left alone: <what this stop already gets right, and why - one line each, up to four>
```

A screen with nothing worth changing gets a read of zero proposals and one sentence saying why it
is right. That is a legitimate and valuable outcome; do not invent items to fill the table.

**Left alone, and why** is part of every read. A read that only subtracts teaches its reader that
nothing in the product was earned, so the reader starts discounting it; and an unnamed strength is
the thing a later stop will "improve". A pattern that is right here but was a defect at a sibling
stop belongs in it most of all — the contrast is a distinction the table alone cannot carry.

On an `absent` stop or a seam the read takes the design / smallest proof / pieces shape in
`references/complete-mode.md`.

## Phase 5: The user's turn

Under `--auto` this phase is replaced by **A5 · Auto-triage** (see **Auto mode**).

One prompt, then act. The user's answer is expected to be prose: their reaction to the screen and
their **expectation** for it — what it should make the user feel, know, or do.

```
Your read and expectation for S<n>? (free text)
Then triage: e.g. "1 2 4" accepts those, "3-" declines, "5~" adjusts (say how)

1. other -> free text (read, expectation, triage in any order)
2. Accept all                                            [default]
3. Accept H-impact only
4. Skip this stop
```

Reconcile: a proposal the expectation contradicts is withdrawn (recorded as `withdrawn - user`);
an expectation that names something no proposal covers becomes a new item, graded, marked
`(user)`. Confirm the final list in one line. Never re-argue a decline.

## Phase 6: Dispatch

For every accepted item, write an **execution brief** into the stop note, then dispatch executor
subagents (the `Agent` tool, model from the overlay's `executor`, default `sonnet`) — one per
independent item, in parallel; bundled when items touch the same files. Each brief carries:

- the stop's overview and the user's expectation, verbatim
- the change, the heuristic and the evidence
- the design doc's relevant rules and the overlay's `## Repo law`, quoted, not referenced
- **provenance on every claim**: each quoted rule and each piece of evidence tagged
  `[VERIFIED <date>]` (measured or read this session) or `[INHERITED]` (a code comment, an earlier
  note, a previous stop's finding). Executors treat quoted law as binding, which is exactly what
  makes an inherited falsehood dangerous; the tag turns *obey* into *confirm* where it matters
- acceptance: what the after-screenshot must show; which gates must pass
- the constraint: **change only what the brief names**; no drive-by refactors; report every file touched
- the invitation: **report any claim found false, and challenge the brief's framing too** — an item
  filed under the wrong heading, an acceptance word the evidence does not support. Ask what a thing
  DOES, not where it SITS

When the subagents return: run the gates yourself, and **diff the touched files yourself and check
each factual claim in the report** — executor reports are evidence-shaped and partly wrong, and the
wrong claims arrive in the same register as the right ones. Re-capture the screen to
`$VAULT/Cx/stops/<id>-after.png`; compare before/after against the acceptance line. An item that
fails acceptance is not landed — it is `deferred - failed acceptance` with the failure described.

**On a red gate, establish whose change made it red before acting**: compare against the run's
baseline and `git log` since the run began. In a repo with concurrent sessions the answer is often
nobody in this run; an executor that refuses to re-baseline a gate it did not break is right.

Commit landed items **per stop, pathspec-scoped** (`git add <paths>` then `git diff --cached
--stat` in the same invocation and check the list is only yours), message from the overlay's `commit_format` (default `cx(S<n>): <screen> - <what changed, in the
user's words>`). **Check the repo's commit gate before the first commit of a run** — a repository
that validates subjects usually validates the TYPE against a closed list, and `cx` is in nobody's
list, so the skill's own default is rejected by exactly the repos that check. Read the gate, pick a
type it accepts, and write the result into the overlay's `commit_format` so the next run does not
rediscover it.

With `--no-dispatch`, stop after the briefs are written and say plainly that nothing was built.

## Phase 7: Close the stop

Write `$VAULT/Cx/stops/<id>.md` in the stop-note shape of `references/vault-formats.md`: the overview,
the read with each decision, the left-alone block, the user's words verbatim, what landed (commit
sha, subject, what the after-shot shows), what was deferred, declined or withdrawn and why.

**A stop often has a second round, and it is the good case.** An owner who reviews the built screen
comes back with what only the built thing could reveal — a line that wraps, art that wants to be
larger, a word that reads wrong. Keep the stop `[~]`, add the new items to the same stop note under a
dated round-2 heading with the user's request verbatim, dispatch, and commit them against the same
`S<n>`. A second round is not rework; it is the first time the user has seen the screen with the
first round's changes in it.

**Before closing, ask: did this stop change the map?** Walking a stop, and building it most of all,
can show a missing upstream step, a neighbour whose arrival is fixture-only, or a grade that was
wrong. A found stop gets a new line with the next free id (ids never renumber). A corrected grade is
marked on its journey line, `<new>, regraded from <old> at S<m>: <evidence>`, and never silently
edited: the visible correction is how the next reader learns the map was a hypothesis.

Update `journey.md` (`[x]` done, `[~]` items open, `[-]` skipped) and rewrite `state.md`. Then:

```
Next?
1. Walk S<n+1> - <screen>                                 [default]
2. Stop here; status is saved
3. Re-read S<n> after the changes
4. status
```

Continue until `stops_per_session` stops are closed or the user stops.

## Phase 8: Close the session

**8a. Self-reflection.** For every declined or withdrawn item, one line on *why* — the design doc,
the user's expectation, or a heuristic that did not fit this product. Append to
`$VAULT/Lessons/<date>-cx.md` in the session-lesson shape of `references/vault-formats.md`: the run's
counts, what the declines taught, and what the user's expectations kept saying.

**8b. Pattern promotion.** A theme that appears in 3+ stop notes or lessons becomes a rule in
`$VAULT/Patterns/cx-preferences.md`, stated as the user would state it, with the stops that
earned it linked. Promoted rules are read in Phase 1 and pre-empt proposals — that is how the
walk gets shorter as it goes.

**8c. Status.** End with the journey line-map: done / open / remaining, and the next stop by name.

## Diff mode (`diff [<ref>]`)

**Read `${CLAUDE_SKILL_DIR}/references/diff-mode.md` before a `diff` run.** It holds the opening
line, the ref and change-set rules, how files map to stops without a map, the ranking, the labels
and the read-only rules. The contract in brief:

- **The daily-sized entry.** It reads only what changed since `<ref>` (default: the merge-base with
  the default branch, else `HEAD~10`) and needs no map, overlay or vault. Uncommitted edits are
  listed apart and read only on request - they may be another session's work.
- **Files to stops by import statements**, at most two hops from a route; comments and strings do
  not count. A data writer is never a stop: it goes in the `Path` line of the stop that reads it.
- **At most 3 stops**, ranked by screens reached x whether the change alters what the user sees or
  can do, labelled `D<n> · <route>`. The design doc and the heuristics list always load, and every
  proposal still names its heuristic and cites the authority design doc.
- **Writes** go to the vault only if one exists. `--no-dispatch` is read-only: reads from code
  unless the overlay has `## Run`, no Phase 5, path questions in `Next?`, no vault write, no commit,
  no run-log line.

## Auto mode (`--auto`)

**Read `${CLAUDE_SKILL_DIR}/references/auto-mode.md` before the first stop of an `--auto` or `triage`
run.** It holds the loop, the routing table, the verifier, the triage queue format, the stop
conditions and the report. In brief: the same method minus two roles — auto-triage (A5) replaces
the user's turn and an independent verifier (A6) replaces the user looking at the after-shot. Stops
run strictly one at a time, each closed and committed before the next, so the walk resumes after
any interruption. Nothing is invented: the standing law (promoted patterns, earlier expectations
and declines, the overlay's law, the design doc, the host's memory) withdraws what it contradicts.
Effort `xs`/`s`/`m` is built; `l`/`xl` and the gated classes go to `Cx/triage.md` with their full
brief, and an `l` is never split to dodge the queue. It never pushes. **`/cx triage`** walks the
queue one prompt per item; an accepted item is built and committed against its stop, and a decline
becomes standing law.

## Vault layout

`Cx/journey.md`, `Cx/state.md`, `Cx/triage.md`, `Cx/stops/S<n>.md` with its captures, and the
shared `Patterns/cx-preferences.md` and `Lessons/<date>-cx.md`. Shapes and the full tree are in
`references/vault-formats.md`.

## What this skill is not

Not a code sweep — `/explorer` finds defects; this finds friction. Not a redesign — proposals live
inside the design doc, and a proposal that needs the design doc changed is raised as a question to
the user, never enacted. Not a feature list **in the default modes** — there, a stop that needs a
new capability records it as `deferred - new feature` and moves on, because the job is the
experience of what exists; `complete` mode inverts exactly this one rule and nothing else
(`references/complete-mode.md`). And not a lecture: the read is a table and six lines, the user's
turn is one prompt, and the run's opinion never outranks the user's expectation.

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
node <registry>/scripts/log-run.mjs --skill cx --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"cx","outcome":…,
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
