---
name: kit
description: "Revitalize and unify the design of a web app: measure style divergence per module, gate a foundation (type scale, muting, colour roles) with the owner, stop new slips with ratchets and agent law, run a contest for a COMPOSITION KIT (the shared building blocks one level above buttons), port the finalists onto one real page so the owner chooses on the product, promote the winner at 0 measured deviations, then rebuild the app module by module in owner-gated feature batches across sessions, with a coverage ledger as memory. Use when an app's modules each look like a different app, shared components are overlooked, or a design system exists on paper but not in the code. Invoke with /kit (resume), /kit init (setup track), /kit batch [next|<feature>], /kit grow, /kit status, /kit reflect."
category: workflow
memory: vault
version: 0.2.0
tags: design-system, ui, typography, composition-kit, refactor, contest, batches, vault
argument-hint: "[init | batch [next|<feature>] | grow | gate <batch> | status | reflect]"
---

# Kit - one vocabulary, composed, gated by the owner's eyes

> An app whose modules were each styled locally reads as many apps. The cure is not a token pass
> and not a restyle per module - both were tried and judged degradations or near-nothing by the
> owner who has to live with the result. The cure is a **composition kit** the owner chose from a
> contest and saw on a real page, and then **every surface composed from it**, in batches the owner
> gates by looking. `/kit` runs that campaign end to end and remembers where it stopped.

The method was forged on one real campaign (five module gates, a kit contest, two ports, one
promotion). Its evidence is in `LESSONS.md`; the rules it earned are in
`${CLAUDE_SKILL_DIR}/references/doctrine-seed.md`, which every builder brief carries.

## Roles

- **Director** - this session. Owns measurement, targeting, briefs, diff review, every decision
  shown to the owner, the ledger and the doctrine. Never delegates a judgment the owner must see.
- **Scouts** - read-only subagents: current state with `file:line` evidence, counts with the
  command that produced them.
- **Builders** - one per module or kit part, briefed from a scratch FILE
  (`${CLAUDE_SKILL_DIR}/references/builder-brief.md`), on disjoint files, returning a structured
  report; they counter-propose with evidence instead of guessing.
- **Owner** - the person. Gates are visual: screenshot pairs and a numbered decision list. The
  owner's words at a gate are law for every later brief, quoted verbatim.

## Invocation

| Call | Does |
|---|---|
| `/kit` | Resume: read the overlay and memory, re-derive the inventory, report where the campaign stands and propose the next step. |
| `/kit init` | The **setup track** (below) for a project with no kit yet. Resumable per step. |
| `/kit batch [next\|<feature>]` | One **feature batch**: select, look, build, review, gate, close. |
| `/kit grow` | A **kit batch**: build the kit parts builders proposed, before the next feature batch. |
| `/kit gate <batch>` | Re-present a batch's gate (the owner was away, or asked to see it again). |
| `/kit status` | The coverage table and the next batch candidates; changes nothing. |
| `/kit reflect` | The retro only (see Skill Reflection). |

## Project overlay

Everything one repository is lives in `.claude/kit/config.md` (tracked). Every key has a default;
say in the opening line which defaults are in force. YAML frontmatter for scalars, `##` sections
for prose.

```yaml
---
product: ""                    # brief header                       [repo directory name]
vault: []                      # candidate memory roots, first existing wins  [<repo>/.kit]
vault_subdir: Kit              # namespace inside the vault         [Kit]
features_root: src/features    # where modules live                 [src/features]
entry: src/main.tsx            # the renderer entry for reachability [auto: main.tsx|index.tsx|index.html]
aliases: "@=src"               # import aliases for reachability    [tsconfig paths]
kit_path: ""                   # the promoted kit, once it exists   [none -> setup track]
doctrine: ""                   # the project's style doctrine file  [none -> setup track]
batch_builders: 5              # parallel builders per batch        [5]
contest_seats: ""              # engine:model@effort list for the kit contest [ask]
---
```

| Section | Carries | Default |
|---|---|---|
| `## Gates` | the exact commands a builder and the Director run (typecheck, lint, tests, ratchets, i18n) | the manifest's typecheck/lint/test; else say none found |
| `## Instruments` | how to shoot an integrated page (the harness command), the divergence config path, the family-image command | `${CLAUDE_SKILL_DIR}/scripts/*` defaults; no harness -> build one in setup S1 |
| `## Repo law` | the convention digest pasted into every builder brief (commit ritual, strings, components, file size) | read CLAUDE.md / AGENTS.md; reuse before building |
| `## Visibility order` | module prefixes in the order the owner uses them daily | ask once, at setup S1 |
| `## Rituals` | host commands at named phases (session ledgers, decision capture, translation pipeline) | none |
| `## Taste` | learned: what the owner protects, what he calls a degradation | empty; written at every gate |
| `## Skill improvement log` | dated lines from the reflection clause | created on first retro |

## Memory

`<vault>/<vault_subdir>/`, Obsidian-openable, never inside this skill's directory:

```
Kit.md               # HOME: phase (setup step or batching), kit_path, doctrine, gate table
coverage.json        # the ledger - written ONLY through scripts/coverage.mjs
gates.md             # every owner verdict VERBATIM, dated, with what it changed (the taste record)
batches/<id>.md      # one per batch: modules, briefs, reports digest, pairs paths, verdict
setup/<step>.md      # setup track records (S1 scouts digest, S2 specimen verdict, S5 contest)
```

**Memory records what was DONE and DECIDED, never what was computed.** Divergence scores,
reachability and census counts are re-derived at every resume; a number that outlives its tree is
a proxy that already diverged. Re-read `Kit.md` and `coverage.json` immediately before every
write; never patch from a stale copy. Vault notes are not version-controlled: never overwrite a
note you did not create this session; suffix `-2` on collision.

## The setup track (`/kit init`) - once per project

Full procedure, briefs and the traps each step already hit: `${CLAUDE_SKILL_DIR}/references/setup.md`.

- **S0 Instruments.** Divergence ranking (`scripts/style-divergence.mjs`), reachability walk
  (`scripts/reachability.mjs`), their join (`scripts/join.mjs`), and an **integrated-page shooter**:
  the real page inside the real shell, on recorded data, at two sizes plus one tall view, dark and
  light, with before/after pairs from the SAME data. No shooter, no gates: build it first.
- **S1 Four scouts, in parallel:** the shared system and tokens; per-module divergence WITH
  reachability (a module the app cannot reach is a routing question, never a target); client
  performance; the instruction surface and why agents slip. Read the governing registry subjects
  before the scouts and arm them with the techniques.
- **S2 Gate 0 - the foundation specimen.** Type scale, one muting level, meaning-named colour roles,
  font truth (which fonts actually render), shown current beside proposed on a specimen page in
  every theme. The owner keeps or rejects each item; expect him to protect the brand tint.
- **S3 Enforcement and agent law.** Ratchets that fail a new raw value at push (never a warn-level
  rule a headless agent never sees), an edit-time hook that shows findings on the lines just
  written, one path-scoped UI rule file, and a thin AGENTS.md so every harness reads the same law.
  The always-loaded instruction file shrinks.
- **S4 Foundation apply, in the safe order:** delete overrides that are dead today, THEN move the
  token file into its cascade layer, THEN apply the approved changes. Prove "unchanged except the
  intended" with a computed-style probe over every theme and scale, and pixel-identical pairs after
  the layer move.
- **S5 The kit contest** (the `contest` skill, three seats x three variants): the eight
  compositions (section, list row, stat tile, key-value, chip row, toolbar, setting row, data
  table) rendered as a specimen AND as four real surfaces recomposed only from the kit, on the
  app's real stylesheet and real-shaped data, with every owner quote so far as law. The owner
  reviews the field himself.
- **S6 Port the finalists, then promote.** When the owner shortlists, port EACH finalist onto one
  real content page behind a dev-only switch, from the same data, measured against its variant
  with a computed-style contract; show a three-way image (current | A | B). The owner picks on the
  product. Promote the winner into the shared components at 0 deviations; write the doctrine's kit
  section; point the agent law at it. Record `kit_path` and `doctrine` in the overlay.

**Do not restyle modules before S6.** The campaign that forged this skill gated three local module
restyles first: two were judged degradations and one near-nothing, and the owner's diagnosis was
"there is nothing ... which would try to achieve standardized component composition". The first
module built FROM the chosen kit passed first time.

## The batch track (`/kit batch`) - repeated across sessions

Full protocol: `${CLAUDE_SKILL_DIR}/references/batch.md`. Gate presentation:
`${CLAUDE_SKILL_DIR}/references/gate-kit.md`.

1. **Resume.** Overlay, memory, `git fetch` and the base's distance from its remote, the working
   tree's foreign WIP, the gates' state on arrival. Re-run the instruments; `coverage.mjs init`
   folds new modules in without touching recorded statuses.
2. **Select.** Only reachable modules; the owner's visibility order; one feature group per batch,
   split into at most `batch_builders` modules. **Trace each module's mount point from the router
   before it is chosen.** If `coverage.json` holds proposed kit parts, run `/kit grow` first.
3. **Look before touching.** Register every view in the shooter and take BEFORE shots of all of
   them before any source edit - a view added later cannot get a before shot. Write each module's
   visible-defect list: overflow, wrapping, dead space, crammed cells, redundant labels, rhythm
   breaks, unstyled light theme, hand-rolled look-alikes of kit parts.
4. **Build.** One builder per module (brief template), composing ONLY from the kit, fixing visible
   defects first, token hygiene as the floor, proposing kit gaps instead of hand-rolling them.
5. **Review.** The Director opens the pairs, checks each against the doctrine and the owner's
   quotes, attributes every ratchet move per file against the batch base, and composes the batch's
   **family image** (each module after | a kit reference page).
6. **Gate.** One question per batch with the paths inside it (pairs, family image, decision list);
   per-module verdicts allowed. Capture the owner's words verbatim in `gates.md`; a correction is
   also a taste line in the overlay.
7. **Close.** `coverage.mjs close-batch` with the verbatim verdict and commits; send-backs become
   the next batch's first modules; ratchet the census on a clean tree after tracing each drop;
   promote any rule seen twice into the doctrine and the builder brief.

## Invariants

- The owner's eyes are the gate; numbers are the Director's instruments, not the gate's content.
- A surface only exists if it renders. Reachability before selection, every time.
- Compose from the kit; a local duplicate of a kit part is a finding; a missing part is a kit
  batch, not a workaround.
- Port from measurement, never from memory: a chosen design is held to a computed-style contract.
- One human selection per batch. A standing approval over this flow deletes its only input (the
  owner's knowledge of where the product is going); the flow would keep producing output and stop
  producing decisions.
- Never widen a tolerance, never re-baseline a rise, never stash or sweep another session's work.

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

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"kit@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
<!-- /clause: knowledge-sync -->

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
node <registry>/scripts/log-run.mjs --skill kit --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"kit","outcome":…,
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
