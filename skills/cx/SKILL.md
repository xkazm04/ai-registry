---
name: cx
description: "Walk a product's user journeys screen by screen with a CX/UX lens. Builds the journey map once, then at each stop gives a short overview of the screen as the user meets it, proposes 3-6 specific improvements graded by impact and effort, takes the user's own read and expectation for that stop, and dispatches executor subagents to make the accepted changes - verified by gates and a screenshot, committed per stop. Resumes across sessions from an Obsidian vault. Use when a prototype or app already exists and the job is to make its experience good rather than to add features; pairs with /explorer (code quality) and /architect (structure)."
argument-hint: "[map|next|screen <id>|status|replan] [--no-dispatch] [--stops N]"
category: workflow
memory: vault
contexts: tracked
version: 1.0.0
tags: cx, ux, journey, screens, review, dispatch, obsidian
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
| `screen <id>` | jump to one stop out of order |
| `status` | print the journey with each stop's state and the last three decisions; change nothing |
| `replan` | keep decisions, re-derive the stop order from the current screens |
| `--no-dispatch` | do everything except Phase 6: write the briefs, dispatch nothing |
| `--stops N` | override `stops_per_session` for this run |

## Constants

- **A stop is one screen in one scenario.** The same screen met in two journeys is two stops,
  because the user arrives with different intent and the read differs.
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

Write `journey.md`: one stop per line, `[ ] S<n> · J<k>.<i> · <screen> (<surface>) · <what the user
is trying to do here>`. Stop ids are stable for the life of the vault; a `replan` reorders lines and
never renumbers.

## Phase 3: Arrive at a stop

For the next `[ ]` stop (or the one named), **reach the screen** using the overlay's `## Run`:
start the product if it is not running, drive it to the screen in the scenario's state, and capture
a PNG into `$VAULT/Cx/stops/<id>-before.png`. When the product cannot be run here, say so and read
the screen from its code and inventory instead — a proposal made from code is marked `(from code)`.

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
--stat` in the same invocation and check the list is only yours), message
`cx(S<n>): <screen> - <what changed, in the user's words>`.

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
the user, never enacted. Not a feature list — a stop that needs a new capability records it as
`deferred - new feature` and moves on. And not a lecture: the read is a table and five lines, the
user's turn is one prompt, and the run's opinion never outranks the user's expectation.

---

<!-- clause: skill-reflection v3 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). If this skill carries no `## Project overlay` section, or its overlay section names no location, write that dated one-liner to `.claude/cx/config.md` in the consuming repo under `## Skill improvement log`, creating the file and the heading if they are absent - so the instruction is executable in every skill. When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - cx` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/cx` in a consuming repo is a symlink to `<registry>/skills/cx` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/cx` and `git -C <registry> commit -m "skill(cx): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/cx/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/cx` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
