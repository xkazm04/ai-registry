---
name: cx
description: "Walk a product's user journeys screen by screen with a CX/UX lens. Builds the journey map once, then at each stop gives a short overview of the screen as the user meets it, proposes 3-6 specific improvements graded by impact and effort, takes the user's own read and expectation for that stop, and dispatches executor subagents to make the accepted changes - verified by gates and a screenshot, committed per stop. In `complete` mode the map is the path to the product's final output, the SEAMS between screens are stops too, and a stop that is absent is designed and built rather than deferred - so an unfinished product is walked to completion instead of polished around its holes. Resumes across sessions from an Obsidian vault. Use when a prototype or app already exists and the job is to make its experience good, or to finish it; pairs with /explorer (code quality) and /architect (structure)."
argument-hint: "[map|complete|next|screen <id>|status|replan] [--no-dispatch] [--stops N]"
category: workflow
memory: vault
contexts: tracked
version: 1.3.0
tags: cx, ux, journey, screens, review, dispatch, continuity, completion, obsidian
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
design_doc: docs/DESIGN.md             # the design philosophy every proposal is judged against  [none]
screens_source: docs/SCREENS.md        # where the screen inventory lives  [derived by reading the UI code]
executor: opus                         # subagent model for dispatch  [opus]
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

## Modes

| argument | does |
|---|---|
| *(none)* / `next` | resume: the first stop in `journey.md` not marked done; walk up to `stops_per_session` |
| `map` | build the journey map (first run), or rebuild it after screens changed; confirms with the user before writing |
| `complete` | map the **path to the product's final output** rather than a tour of what exists: every stop carries a state grade, the seams between screens are stops, and an absent stop is designed and built instead of deferred. For an unfinished product |
| `screen <id>` | jump to one stop out of order |
| `status` | print the journey with each stop's state and the last three decisions; change nothing |
| `replan` | keep decisions, re-derive the stop order from the current screens |
| `--no-dispatch` | do everything except Phase 6: write the briefs, dispatch nothing |
| `--stops N` | override `stops_per_session` for this run |

## Constants

- **A stop is one screen in one scenario.** The same screen met in two journeys is two stops,
  because the user arrives with different intent and the read differs.
- **A SEAM is a stop too** (`complete` mode). A seam is the handoff between two consecutive stops:
  what step A produced and step B is supposed to consume. It has no screenshot, because the failure
  is not on either screen — it is that B never reads A's output and the user's work silently stops
  travelling. Read a seam by following the DATA, not the pixels: name the payload, the writer, the
  reader, and which of the three is missing. A product can have every screen built and still be
  broken end to end; the seams are where that hides, and no screen-by-screen walk will find it.
- **Every stop carries a state grade** (`complete` mode), set when the map is built and re-checked
  when the stop is walked:
  | grade | means | what the stop does |
  |---|---|---|
  | `built` | exists and works | read and polish - the ordinary walk |
  | `thin` | exists, but a fraction of its siblings | ask what is missing before proposing polish |
  | `fixture` | renders convincing data it did not compute | honesty first: what would make it real |
  | `absent` | does not exist | design it, and in `complete` mode build it |
  Grade from evidence a reader can recheck - file and line counts against sibling surfaces, which
  fixtures a screen imports, whether anything downstream reads what it writes - never from
  impression. The gradient across a journey is itself a finding: state it in the map.
- **3-6 proposals per stop.** Fewer is a screen that is already right; say so. More is a list, and
  lists are not reviewed.
- **Grade every proposal** by *impact* (`H` the user would notice on first use / `M` on repeat use /
  `L` polish) and *effort* (`xs` minutes / `s` an hour / `m` a session / `l` more), and name the
  heuristic it serves. A proposal without a heuristic is an opinion; keep it out.
- **The user's expectation outranks the read.** When the user's expectation for a stop contradicts
  a proposal, the proposal is withdrawn and the disagreement is recorded, not argued.
- **Done for a stop** = every accepted item landed and verified, or explicitly deferred with a reason;
  the stop note written; `journey.md` updated.

---

## Phase 0: Read the overlay, resolve the vault

Read `.claude/cx/config.md` if it exists. Resolve `VAULT` = the first `vault` candidate that exists;
if none does, fall back to `<repo>/.cx/` and **create it**. A missing vault is never a reason to abort.

```bash
VAULT=""
for c in "${VAULT_CANDIDATES[@]}"; do [ -d "$c" ] && { VAULT="$c"; break; }; done
[ -n "$VAULT" ] || { VAULT="$PWD/.cx"; mkdir -p "$VAULT"; echo "No configured vault found - using fallback $VAULT"; }
```

Open with one line: which vault won, whether an overlay was found, which mode is running.

### Bootstrap (one-time per vault)

Create whatever is missing:

- `$VAULT/Cx/` and `$VAULT/Cx/stops/`
- `$VAULT/Cx/journey.md` — header only (Phase 2 fills it):
  ```markdown
  # Journey - <product>

  The ordered stops. One line per stop; state is the first character.
  [ ] not walked   [~] walked, items open   [x] done   [-] skipped, reason in the note

  ## Journeys
  ```
- `$VAULT/Cx/state.md` — header only:
  ```markdown
  # CX State

  Where the walk is. Rewritten at the end of every stop.

  - journey: none yet
  - last stop: none
  - next stop: none
  - stops walked: 0
  - items landed / deferred / declined: 0 / 0 / 0
  ```
- `$VAULT/Patterns/cx-preferences.md` — header only:
  ```markdown
  # CX Preferences (distilled from /cx runs)

  > Rules upgraded from `Lessons/` after 3+ observations. Loaded by Phase 1.

  _No patterns yet._
  ```

Don't create `Lessons/` (shared with the other vault skills).

## Phase 1: Load memory and context

Read, in order, and say in one line what was and was not found:

1. `$VAULT/Cx/state.md`, then `$VAULT/Cx/journey.md` — where the walk is.
2. The last two stop notes in `$VAULT/Cx/stops/` — the recent decisions, so a proposal the user
   declined at the previous screen is not made again at this one in different words.
3. `$VAULT/Patterns/cx-preferences.md` — the promoted rules; treat them as the user's standing law.
4. The overlay's `design_doc` — every proposal is judged against it, never against taste.
5. The overlay's `screens_source`, else the UI code — the inventory of what exists.
6. `${CLAUDE_SKILL_DIR}/references/cx-heuristics.md` — the practitioner's list.

If `journey.md` has no stops, the mode is `map` regardless of what was asked.

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

### In `complete` mode

The map is **the path to the product's final output**, not a tour of what happens to exist. Build it
in this order, and do the measuring before the drawing:

1. **Name the final output first** — the artefact the user leaves with, in their words ("a cut they
   would show someone", "a filed return", "a booked trip"). Everything else is judged by whether it
   carries the work toward that. If the product cannot yet produce it, THE ENDING is stop one of the
   backlog, not a footnote.
2. **Grade every existing stop** from recheckable evidence (see Constants), and put the grade in the
   line. The gradient is usually the story: a front half at `built` and a back half at `fixture` is a
   product that was demoed, not finished.
3. **Insert the seams** between consecutive stops and grade each one too. For every seam, follow the
   data: does B read what A wrote? Name the payload and the reader. A seam nobody reads is `absent`
   however good both screens look.
4. **Absent stops get a line like any other**, with `✗` for their grade and a one-line statement of
   what the user gets instead today (an empty screen, a fixture, a dead end, nothing at all).

Present the map with the grades visible and say plainly how much of the path is real. Then take the
user's answer as usual — the user picks where to start, and starting at the break rather than at the
front is often the right call, because polish upstream of a severed seam is spent twice.

Seam lines are written `[ ] S<n> · J<k>.<i> · seam <a>→<b> · <the payload that should cross>`.

## Phase 3: Arrive at a stop

For the next `[ ]` stop (or the one named), **reach the screen** using the overlay's `## Run`:
start the product if it is not running, drive it to the screen in the scenario's state, and capture
a PNG into `$VAULT/Cx/stops/<id>-before.png`. When the product cannot be run here, say so and read
the screen from its code and inventory instead — a proposal made from code is marked `(from code)`.

**Two things make a capture worse than none, and both are silent.** A page that reveals its content
on scroll photographs as a column of empty blocks: the full-page shot is taken before the observers
fire, so the read is made against bands that rendered nothing. Scroll the page through in steps,
return to the top, and only then capture — and take the fold separately, unscrolled, because the
fold is what the user actually meets. And a screen reached by a deep link may render without the
state the steps before it write; assert the capture arrived (a title, a test id, a known string)
before reading it.

**The user may decline capture outright**, and that is a legal mode, not a degraded one: some owners
review the live product themselves and want the walk's attention on the read. Record it as a standing
preference, mark the proposals `(from code)`, and never spend a turn re-asking.

**A seam or an `absent` stop has nothing to photograph, and that is the finding.** Capture what the
user meets *instead* — the screen that shows a fixture, the dead end, the step that starts empty —
into `<id>-before.png`, and say in one line what a working stop would have shown there. For a seam,
capture BOTH screens it fails to connect (`<id>-before-a.png` / `-before-b.png`): the two side by
side are the evidence that the user's work stopped travelling. Then read the data path in code and
name the payload, its writer, its reader, and which of the three is missing.

Then write the **overview**, five lines, in the user's words not the system's:

```
S<n> · <screen> · <surface>                J<k> <persona>: <scenario>
Arrives from   <previous stop>, wanting <the intent>
Sees           <the one thing the screen leads with>
Does           <the primary action, and how many inputs it costs>
Leaves to      <the next stop>, having <the outcome>
Risk           <the one way this stop most plausibly fails the user>
```

## Phase 4: The read

Run the heuristics list against the screen **in this scenario** — not the screen in general. For
each proposal record `heuristic`, `evidence` (what on the screen or in the flow triggered it — a
pixel, a count, a missing state), `change` (one sentence a builder can act on), `impact`, `effort`.
Then present:

```
Read of S<n> - <screen>

#  Impact  Effort  Heuristic                 Proposal
1  H       s       primary action            ...
2  M       xs      orientation               ...
...

Withheld: <proposals considered and dropped, with the one-word reason - "design doc says",
          "declined at S3", "needs data">
```

A screen with nothing worth changing gets a read of zero proposals and one sentence saying why it
is right. That is a legitimate and valuable outcome; do not invent items to fill the table.

**On an `absent` stop or a seam the read has a different shape**, because there is no screen to run
heuristics against. Give instead: (a) **the design** — what this stop should be, in five lines, and
what it must carry from upstream and hand downstream; (b) **the smallest thing that proves the
chain** — the end-to-end path real data would take, which is what gets built first; (c) **the
proposals**, graded as always, but now they are the pieces of that build. Heuristics still apply and
are still named — `the thread between steps`, `honesty`, `orientation` — because a new surface obeys
the same list as an old one. What is forbidden is designing the whole feature: the stop builds the
path to the final output and stops there.

## Phase 5: The user's turn

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
subagents (the `Agent` tool, model from the overlay's `executor`, default `opus`) — one per
independent item, in parallel; bundled when items touch the same files. Each brief carries:

- the stop's overview and the user's expectation, verbatim
- the change, the heuristic and the evidence
- the design doc's relevant rules and the overlay's `## Repo law`, quoted, not referenced
- acceptance: what the after-screenshot must show; which gates must pass
- the constraint: **change only what the brief names**; no drive-by refactors; report every file touched

When the subagents return: run the gates yourself; re-capture the screen to
`$VAULT/Cx/stops/<id>-after.png`; compare before/after against the acceptance line. An item that
fails acceptance is not landed — it is `deferred - failed acceptance` with the failure described.
Commit landed items **per stop, pathspec-scoped** (`git add <paths>` then `git diff --cached
--stat` in the same invocation and check the list is only yours), message from the overlay's `commit_format` (default `cx(S<n>): <screen> - <what changed, in the
user's words>`). **Check the repo's commit gate before the first commit of a run** — a repository
that validates subjects usually validates the TYPE against a closed list, and `cx` is in nobody's
list, so the skill's own default is rejected by exactly the repos that check. Read the gate, pick a
type it accepts, and write the result into the overlay's `commit_format` so the next run does not
rediscover it.

With `--no-dispatch`, stop after the briefs are written and say plainly that nothing was built.

## Phase 7: Close the stop

Write `$VAULT/Cx/stops/<id>.md`:

```markdown
# S<n> · <screen> · <surface> - <date>

J<k> <persona>: <scenario>
Before: ![[<id>-before.png]]   After: ![[<id>-after.png]]

## Overview
<the five lines>

## Read
| # | impact | effort | heuristic | proposal | decision |
...

## The user's read and expectation
<verbatim>

## Landed
- <item> -> <commit sha> `<subject>` - <what the after-shot shows>

## Deferred / declined / withdrawn
- <item> - <reason>

## Cross-references
- previous stop [[S<n-1>]] · next [[S<n+1>]] · design doc rule invoked: <rule>
```

**A stop often has a second round, and it is the good case.** An owner who reviews the built screen
comes back with what only the built thing could reveal — a line that wraps, art that wants to be
larger, a word that reads wrong. Keep the stop `[~]`, add the new items to the same stop note under a
dated round-2 heading with the user's request verbatim, dispatch, and commit them against the same
`S<n>`. A second round is not rework; it is the first time the user has seen the screen with the
first round's changes in it.

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
`$VAULT/Lessons/<date>-cx.md`:

```markdown
## Run: <timestamp> - <journey> S<a>..S<b>
- stops walked: <n> · proposals: <p> · landed: <l> · deferred: <d> · declined/withdrawn: <w>
### What the declines taught
- <one line each>
### What the user's expectations kept saying
- <a recurring theme, if any>
```

**8b. Pattern promotion.** A theme that appears in 3+ stop notes or lessons becomes a rule in
`$VAULT/Patterns/cx-preferences.md`, stated as the user would state it, with the stops that
earned it linked. Promoted rules are read in Phase 1 and pre-empt proposals — that is how the
walk gets shorter as it goes.

**8c. Status.** End with the journey line-map: done / open / remaining, and the next stop by name.

## Vault layout

```
$VAULT/
  Cx/journey.md              the ordered stops and their state
  Cx/state.md                where the walk is - rewritten per stop
  Cx/stops/S<n>.md           one note per stop: overview, read, decisions, landed, before/after
  Cx/stops/S<n>-before.png   and -after.png
  Patterns/cx-preferences.md promoted rules (shared Patterns/ folder)
  Lessons/<date>-cx.md       per-run reflection (shared Lessons/ folder)
```

## What this skill is not

Not a code sweep — `/explorer` finds defects; this finds friction. Not a redesign — proposals live
inside the design doc, and a proposal that needs the design doc changed is raised as a question to
the user, never enacted. Not a feature list **in the default modes** — there, a stop that
needs a new capability records it as `deferred - new feature` and moves on, because the job is the
experience of what exists. **`complete` mode inverts exactly this one rule and nothing else:** the
product is unfinished, the absent stops ARE the work, and deferring them would defer the whole
point. Everything else holds in both modes — the heuristics, the user's expectation outranking the
read, the gates, one commit per stop. A `complete` run that starts inventing capability nobody asked
for has stopped being this skill; the map is the contract, and a capability that is not on the path
to the product's stated final output is still `deferred - new feature`. And not a lecture: the read is a table and five lines, the
user's turn is one prompt, and the run's opinion never outranks the user's expectation.

---

<!-- clause: skill-reflection v4 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Project learning.** Put a dated observation in the consuming project's configured
overlay under `## Skill improvement log`, when local edits are within scope. Use the
location in this skill's `## Project overlay` section. If none is configured, use
`.agents/cx/config.md` for Codex or `.claude/cx/config.md` for Claude.
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
