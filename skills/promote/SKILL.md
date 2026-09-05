---
name: promote
description: Promote a specific, already-existing pattern in this repo into the Personas workspace knowledge library - the grounded CLI equivalent of the "New practice" button in Dev Tools -> Workspaces -> Knowledge Library. Unlike /practice-harvest (a broad <=15-item sweep the agent chooses), /promote is targeted at ONE pattern the operator names, reads the real code, and writes the evidence. Emits the same `practice-harvest/runs/<id>/result.json` the app ingests through its one governed door - never touches the database. Invoke with `/promote <what to promote> [--file <path[:line]>] [--kind <kind>] [--topic <area/cluster>]`.
category: ai-native
memory: none
version: 1.1.1
argument-hint: "<what to promote> [--file <path[:line]>] [--kind <kind>] [--topic <area/cluster>]"
---

# Promote — self-insert a pattern into the knowledge library

## What this is for

The operator has just seen a piece of this codebase done *well* and wants it
recorded as a reusable practice, so future sessions (and sibling repos in the
workspace) inherit it instead of re-deriving it.

There are two existing ways to get a practice into the library, and this skill is
the missing third:

| Path | Shape | Grounding |
|---|---|---|
| **"New practice" button** (`KnowledgeLibrary.tsx`) | Human types a form | Whatever the human remembers |
| **`/practice-harvest`** | Agent sweeps a whole repo, proposes ≤15 | Broad, agent picks the subjects |
| **`/promote`** (this skill) | Operator names ONE pattern, agent writes it up | Deep — reads the actual code and quotes it |

The value `/promote` adds over the button is **evidence**: you read the named
code, extract the real class strings / signatures / control flow, and write a
`detail_md` a future session can act on without opening the file. A practice
without evidence is an opinion.

## Hard rule — you never write the database

Per the workspace's D8 doctrine ("agents write files across a validated boundary,
never application state"), this skill writes **only** files under
`practice-harvest/runs/<id>/` in the target repo. The Personas app ingests them
through `dev_tools_workspace_knowledge_ingest`, which caps size, confines the
path to `practice-harvest/runs/`, normalizes the topic against the closed
taxonomy, dedups, and stamps an `ingested.json` marker. Do not attempt to reach
the SQLite file directly, and do not add a Tauri command — the door already exists.

## Invocation

```
/promote <what to promote>  [--file <path>[:<line>]] ...   # one or more evidence sites
                            [--kind pattern|pitfall|decision|howto|fact]
                            [--topic <area/cluster>]
                            [--project-root <path>]        # default: cwd
```

`/promote` with no argument: ask the operator what to promote. If the session has
just finished work that surfaced a clearly good pattern, propose that as the
default and let them confirm or redirect.

## Procedure

### 1. Resolve the target repo and its workspace

Default `--project-root` to the current repo. **Self-insert is the normal case** —
you are promoting a pattern from the repo you are standing in.

Look for `<root>/practice-harvest/snapshot.json`. If present it carries the
workspace name, sibling projects, the closed `taxonomy` block, and — critically —
`existing_practice_titles` and `rejected_dedup_keys`.

**If the snapshot is absent** (nobody has run a harvest from this repo yet), you
are not blocked. In the Personas repo itself the taxonomy's source of truth is
readable directly: `src-tauri/db/src/repos/workspace_taxonomy.rs`
(`TAXONOMY` + `AREA_HINTS`). Read it. In any other repo, proceed without the
dedup lists and say so in the report.

### 2. Read the actual code

Open every `--file` the operator named, plus enough surrounding context to
understand *why* the pattern is good rather than just what it looks like. If they
named a pattern but no file, find its canonical site yourself and confirm it back
to them before writing.

Then answer three questions explicitly, because they determine whether the item
is worth writing at all:

1. **What problem does this solve?** If you can't name the problem, it's a style
   preference, not a practice.
2. **What would a session do differently having read it?** If nothing, don't write it.
3. **Could a sibling project plausibly adopt it?** If it only makes sense inside
   this one file, it belongs in a code comment, not the library.

**Say no when the answer is no.** Proposing nothing is a valid outcome and a much
better one than padding a shared library with a preference. Tell the operator
which of the three questions failed.

### 3. Check for duplicates

Compare against `existing_practice_titles`. If the library already holds this
practice, **do not write a near-duplicate** — instead report the existing title
and offer to (a) leave it, or (b) write an item that genuinely extends it, with
the delta stated in the statement. Also check `rejected_dedup_keys`: if the
workspace already rejected this, surface that fact and ask before re-proposing.

### 4. Classify

- **`kind`** — `pattern` (a shape to repeat) · `pitfall` (a trap to avoid) ·
  `decision` (a choice made, with its rationale) · `howto` (a procedure) ·
  `fact` (a durable truth about the system).
- **`topic`** — EXACTLY two segments, `area/cluster`, from the closed taxonomy.
  Areas are **precedence-ordered**: walk the list top to bottom and take the
  first that *genuinely governs* — if the practice would be meaningless without
  that concern, it governs. `architecture` sits near the end deliberately; it
  means the codebase's own skeleton, so reach for it only when no subsystem area
  applies. You may name a new *cluster* under a listed area; **never invent an
  area** (unrecognized areas are quarantined on an `unsorted/` shelf).
  `topic` answers **where** the practice lives — not what shape it is. That is `ftype`.
- **`abstraction`** — `macro` | `meso` | `micro`. Prefer meso/macro. If it's
  micro, ask whether it belongs in the linter or `CLAUDE.md` instead of here.
- **`ftype`** — `architecture` | `module-boundary` | `data-flow` | `extensibility` |
  `api-design` | `state-mgmt` | `error-strategy` | `concurrency-reliability` |
  `perf-strategy` | `micro-technique`.
- **`durability`** — `durable` | `situational` | `mechanical`. **`mechanical`
  means it belongs in the linter, not the library** — if you land there, stop and
  tell the operator rather than writing it.

The library's own history is the argument for taking this seriously: free-form
topics once produced **154 distinct topics for 177 items**, and a third of the
corpus fell into `architecture` because `topic` and `ftype` both encoded shape.

### 5. Write the run

Write `<root>/practice-harvest/runs/<YYYY-MM-DD-HHmm>/result.json`:

```json
{
  "items": [
    {
      "kind": "pattern",
      "title": "Short imperative claim",
      "statement": "The distilled practice a session should act on.",
      "detail_md": "## Evidence\n\nReal code from THIS repo, quoted, with file:line...",
      "topic": "frontend/components",
      "abstraction": "meso",
      "ftype": "api-design",
      "durability": "durable",
      "evidence_count": 3,
      "applicability": { "layers": ["ui"], "languages": ["TypeScript"], "frameworks": ["React"] },
      "dedup_key": "promote:<stable-slug>",
      "confidence": 0.8
    }
  ]
}
```

Field discipline:
- **`title`** — an imperative claim, not a noun phrase. "Wrap section surfaces in
  the gradient container" beats "Gradient containers".
- **`statement`** — what a session should *do*. One or two sentences. This is the
  line that shows in the library list; make it standalone.
- **`detail_md`** — the evidence. Quote the actual code with `file:line`
  references, include the exact class strings / signatures, and state the *why*.
  This is the field that makes `/promote` worth more than the button — do not
  skip it.
- **`dedup_key`** — prefix `promote:` plus a stable slug of the title.
- **`confidence`** — be honest. A pattern used in one place with an unproven
  rationale is not 0.9.

Also write a short `report.md` in the same directory: what was promoted, from
which sites, and anything you declined to promote with the reason.

**Accumulating across a session:** if an un-ingested run directory from this
session already exists (a `runs/<id>/` with `result.json` and **no**
`ingested.json`), APPEND your item to its `items[]` rather than creating a
second run. The ingest door takes one run at a time; several `/promote` calls in
one working session should arrive together.

### 6. Tell the operator how to land it

Files on disk are not yet in the library. Close the loop explicitly:

> Written to `practice-harvest/runs/<id>/result.json`.
> To ingest: **Dev Tools → Workspaces → \<workspace\> → Knowledge → Extract menu →
> Import** on this project. It lands as `observed`, for your review — adopt or
> reject it there.

Never claim the practice is "in the library". It is proposed, pending one gated
import and one human verdict.

## Hard rules

- Write **only** under `practice-harvest/runs/<id>/`. Touch nothing else in the repo.
- Never `git add`, `git commit`, or `git stash` — the run directory is the deliverable.
- Ground every claim in code you actually read in this repo. No generic advice.
- One `/promote` invocation = one practice, unless the operator explicitly names several.
- Items land `observed`. You are proposing, not adopting — say so.
- If it fails the three questions in step 2, or classifies as `mechanical`,
  **decline and explain**. A library that can't refuse becomes a junk drawer.

---

<!-- clause: knowledge-sync v1 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/knowledge-sync.md; edit the template, then re-stamp -->
## Knowledge sync

This skill proposes and executes backlog items. Every item it proposes is judged against the standard this repo subscribes to, so a run moves the codebase toward the registry's golden paths and sends back what it learned - not toward a private notion of "better" that the next skill will undo.

**Subscription** - read once at the start of the run; degrade honestly, never invent a standard:
- `.ai/manifest.yaml` -> `registry.local` (default `../ai-registry`; `$AI_REGISTRY_DIR` wins) and `knowledge.domains` (the bundles this repo consumes - `software-engineering` for code, plus whatever else it declares). No registry declared -> skip this section and say `registry: none` in the run header.
- `.ai/registry-map.json` - the join between this repo's contexts and the bundle's subjects, with a per-pair state (`unknown` / `conformant` / `deviation` / `not-applicable`) that `/conform` fills in over time. Missing while `context-map.json` exists -> build it once, `node <registry>/scripts/build-registry-map.mjs --project <slug>`, and commit it: the map is the repo's subscription to the paths, and it is how a path improved for another project reaches this one. Missing both -> resolve through `<registry>/knowledge/<domain>/index.json` and say `registry: declared, unmapped`.
- The always-on rules `.claude/rules/ai-registry-*.md` carry the subject map. They orient; they do not replace the read below.

**Read before you propose.** For each context in scope, take its subjects from the map and read the golden path (`subjects[<slug>].file`, verbatim from the index - never a path built from a slug; bundles are nested) plus the techniques whose `use_when` matches what you are about to decide. Then every backlog item you emit names the technique it serves or violates - `standard: <subject>/<technique>` - or `standard: none` when nothing governs it. A pair the map already marks `deviation` is a pre-approved item with its fix described; a pair marked `conformant` is a regression guard on anything you change there. A deviation is a finding: never lower the standard to fit the code, and never present a technique's number as a rule - the technique carries the rule, the application carries the measurement.

**Log the read** - one line per context, append-only, gitignored, to `.ai/consults.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}`, where `deviations` counts the items this run raised that a technique explicitly names. Bare slugs, never paths. The registry's `signals-collect.mjs` folds these into `signals/` as counts only; it is the only way the corpus learns which paths are load-bearing and which are decoration.

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"promote@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
<!-- /clause: knowledge-sync -->

<!-- clause: skill-reflection v3 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). If this skill carries no `## Project overlay` section, or its overlay section names no location, write that dated one-liner to `.claude/promote/config.md` in the consuming repo under `## Skill improvement log`, creating the file and the heading if they are absent - so the instruction is executable in every skill. When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - promote` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/promote` in a consuming repo is a symlink to `<registry>/skills/promote` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/promote` and `git -C <registry> commit -m "skill(promote): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/promote/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/promote` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
