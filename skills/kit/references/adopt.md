# Adopt track - a repo that already has a kit

`/kit adopt` is the entry for a project whose shared composition layer already exists: built outside
the skill, printed by hand from a contest the owner already decided, or left by a campaign that
entered the setup track midway. The setup track's contest (S5) and port (S6) exist to CHOOSE a kit;
re-running them over a kit the owner already chose spends his attention on a settled question.

**Goal:** the first `/kit batch` opens in the same session as the adoption, ideally within 30 minutes.
Everything below is sized to that; what does not fit is recorded as `owed`, never silently dropped.

**Adopt or init?** Adopt when the repo has a kit-shaped directory (three or more parts that compose
surfaces one level above buttons: section, panel, list row, stat tile, key-value, toolbar...) AND at
least one consumer outside it. A `ui/` folder of buttons and inputs alone is a primitive layer, not a
kit: that is `/kit init`. When in doubt, say which evidence decided it in the opening line.

## A1 - Overlay

- `.claude/kit/config.md` exists: read it, fill ONLY the missing keys, name each one you filled. A
  missing `gate_mode` in an existing overlay means `per-batch` was in force: offer the switch in the
  opening question, do not flip it silently.
- Absent: write it. `kit_path` = the existing kit directory; `doctrine` = an existing design document
  only when it actually describes the kit's parts (else `""` and A5 drafts one); `features_root`,
  `entry`, `aliases` from the repo's layout (tsconfig paths; an app-router repo has many entries, see
  the traps); `batch_builders: 3` for the first run; `gate_mode: key-decisions`; `summary_every: 3`.
  `vault`: when sibling overlays (`.claude/*/config.md` of other skills) share one memory root, reuse
  it so the owner keeps one vault; otherwise the default `<repo>/.kit`.
  Sections: `## Gates` from the manifest (the minimal set a builder runs on changed files, plus the
  build when the framework splits server and client), `## Repo law` as pointers into CLAUDE.md /
  AGENTS.md (commit ritual, strings, file-size caps), `## Visibility order` (from the nav; provisional
  until the owner confirms it, and say so), `## Taste` only from owner words the repo already carries
  (design docs, contest notes, decision ledgers), each with its source.
- **One opening question**, holding only what the code cannot answer: the visibility order (proposed,
  to confirm or reorder), the gate mode when an existing overlay lacks it, and any key decision
  already visible (a part the owner may want declined, a surface the kit clearly cannot compose).
  Do not wait on the answer to run A2-A4; the batch selection in A5 is what needs it.

## A2 - S0, configured to this repo

Run the setup track's S0 (`setup.md`) with ONE config file for this repo's layout, kept at
`.claude/kit/s0.json` (tracked, beside the overlay, named in `## Instruments`; every instrument
takes it as `--config`). The ledger and the instruments' outputs live in the vault, never in the skill
and never in the repo.

- `featuresRoot` / `grouping`: where the modules really live. A route tree (`src/app`) groups by
  `depth:1` or `depth:2`; a feature tree keeps `sub`.
- `systemPrefix`: a LIST - the kit AND every shared component folder (e.g.
  `["_components/kit", "_components", "features/shared"]`), so they are measured as the system
  layer. System modules never rank in the inventory and never appear as NEXT (`--all` overrides).
- `sharedImport`: the kit's import prefix as the code writes it (e.g. `@/app/_components/kit`). The
  default is derived from `featuresRoot` and `systemPrefix`; when it matches nothing, divergence prints
  a WARNING and `sharedPer100` is meaningless - fix it before reading that column.
- Reachability: a single-page app has one entry (`index.html` / `main.tsx`). **An app router has no
  single entry:** list every page|layout|error|loading|not-found|template file (and the metadata image
  routes: opengraph-image, twitter-image, icon, apple-icon) in `entry`, or set `entryGlob: "next-app"`
  (any glob works; a glob that matches nothing is an error). Exit 2 means the resolver walked too
  little: fix the config, never lower `--floor`.
- Then `join.mjs --order visibility --visible <the visibility order>` -> `coverage.mjs init --inventory`.
  The ledger's NEXT follows the inventory's order; a join left on the default debt order offers the
  noisiest module, not the one the owner opens daily.
- **Shooter.** Reuse what the repo has (an end-to-end browser config, a screenshot or visual-test
  script, a design-system route). If nothing exists, build the minimal one the first batch needs: the
  real route in the real shell from the dev server, the standard sizes, each theme, failing loud on
  console errors and empty mounts. In `key-decisions` mode the pairs are the Director's own review
  instrument: no pairs, no Director approval.

## A3 - Register the kit

1. Enumerate the parts from the kit's index (or each file in `kit_path`). For each: the exported name,
   a ONE-line API read from its props type (not invented), and what it composes. Write the list to a
   scratch file as `[{ "name": "...", "api": "...", "why": "..." }]`.
2. Record the adoption, then the parts, in one go each:

   ```sh
   node ${CLAUDE_SKILL_DIR}/scripts/coverage.mjs adopt --ledger <memory>/coverage.json --id adopt-0 \
     --text "<where the kit came from, which commit, why it is adopted rather than rebuilt>"
   node ${CLAUDE_SKILL_DIR}/scripts/coverage.mjs add-kit-part --ledger <memory>/coverage.json \
     --batch adopt-0 --parts <scratch>/kit-parts.json
   ```

   The bulk write is all or nothing: one malformed row refuses the whole file, naming the row index and
   the missing JSON key.
3. A part the owner already decided against (his notes, an earlier gate, the opening answer):
   `add-kit-part --name <Name> --declined --why "<his words>"`. It stops showing as KIT-GAP, and a
   builder who proposes it again is refused until new owner words arrive (`--replace`).
4. Modules already composed from the kit and approved by the owner before the ledger existed:
   `coverage.mjs mark --module <m> --status done-outside --note "done-outside: <gate or decision, sha>"`.
   They leave NEXT; the note is the evidence (refused without one). A later batch can still reopen
   them (`done-outside -> in-batch`).
5. Kit specimen: a page that renders every part (a design-system or showcase route) becomes the
   family image's reference page; name it in `## Instruments`. No specimen -> `owed`, built by the
   first kit batch.
6. `coverage.mjs status` must now print `kitParts=<n>` with the count you enumerated. A different
   number means a row was lost; read the rows, not just the count.

## A4 - The setup table in `Kit.md`

One row per setup step. Every row carries its reason; a row with an empty reason is not written.

```markdown
| step | state | reason / evidence / return condition |
|---|---|---|
| S0 instruments | done | adopt session <date>: divergence, reachability, join, ledger; shooter <path> |
| S1 scouts | skipped | the kit already exists; scouting the shared system is A3's enumeration |
| S2 foundation gate | done-outside | tokens in <file> since <sha>; owner chose them in <where> |
| S3 ratchets + agent law | owed | until the first summary gate; return when a batch measures a new raw value |
| S4 foundation apply | skipped | no token rewrite planned; the owner's look is already applied |
| S5 kit contest | skipped | look chosen in <contest id / design doc>; re-running it re-asks a settled question |
| S6 port + promote | done-outside | kit at <kit_path> since <sha>, consumers <n> |
```

`done-outside` only with evidence you opened in this session (a commit, a file, a contest record). A
memory or an overlay line saying it happened is a pointer, not evidence. Copy the table's digest into
`setup/adopt.md` with the parts list and the opening question's answer.

## A5 - Doctrine and the first batch

- No doctrine file: draft the kit section from A3's list (what each part is for, when to use which,
  the one-line APIs, "a local duplicate of a kit part is a finding") into `setup/adopt.md`; builders
  read it from there. Moving it into the repo is a later commit, recorded as `owed`.
- `Kit.md` phase -> `batching`; commit the overlay per the repo's commit ritual (on the current branch;
  never push a branch that has diverged from its remote).
- Run `/kit batch next` now. Adopt never edits the kit: changing a part is `/kit grow`.

## Traps

- **An app-router repo is not a feature tree.** Every `page` and `layout` file is an entry, API routes
  are not; grouping by `sub` collapses the route tree into one module.
- **The kit ranks as the worst module** when `systemPrefix` does not cover it: the instrument then
  proposes rebuilding the kit itself. Fix the config before `init`.
- **Ledger rows outlive a wrong config.** If S0 ran with the wrong grouping, the modules seeded from it
  stay in the ledger; mark them `dead` with a note after the corrected `init` lists them as stale.
- **The dev server can write into the tree.** `shoot --server dev` on Next rewrites `next-env.d.ts`
  (field run: it destroyed another session's uncommitted edit). Check `git status` for that file
  first; when it carries foreign WIP, use `--server start` on a fresh build or `--base-url` against
  a server that is already running. The same holds for any framework that writes generated types on
  start.
- **A view behind client state** (a tab, a drawer, a filter) needs a scripted interaction in the
  shooter, or it is recorded as unshootable in the batch note - never shot in its default state and
  called covered. Dev overlays and docks (framework indicators, devtools) covering the page are a
  capture defect: hide them or note them, never let them reach a pair.
- **A diverged default branch.** Commit locally on the current branch; never push, never rebase or
  reset another session's work to "clean up" before adopting.
