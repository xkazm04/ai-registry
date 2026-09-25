# Setup track - from "many apps" to a promoted composition kit

Run once per project, step by step; each step writes `setup/<step>.md` in memory and updates `Kit.md`'s
phase, so a killed session resumes at the step it stopped in. The owner gates S2 and S6; everything else
is Director work with builders.

## S0 - Instruments (before any question)

1. **Divergence ranking** - `node ${CLAUDE_SKILL_DIR}/scripts/style-divergence.mjs --repo . --out <memory>/inventory`
   (config via `--config <json>`: features root, grouping rule, metric regexes and weights). Calibrate it:
   run it on the surfaces the owner calls good; if a good surface ranks badly, the weights are wrong
   (a stylesheet that sets prose typography on purpose is not divergence - CSS weight defaults to 0).
2. **Reachability** - `node ${CLAUDE_SKILL_DIR}/scripts/reachability.mjs --entry <entry> --alias @=src --json`.
   Modules with zero reachable files are dead: a routing or deletion question for the owner, never a target.
3. **Join** - `node ${CLAUDE_SKILL_DIR}/scripts/join.mjs` -> the inventory the ledger is seeded from
   (`scripts/coverage.mjs init`).
4. **The integrated-page shooter.** Screenshots of the REAL page inside the REAL shell, on a recorded data
   tape, at 1280x800, 1920x1080 and one tall view (1440x3200), dark and light, with a pair mode that
   composes before | after with a changed-pixel count. OS-level window grabs of a desktop webview fail
   silently (black bitmaps, the wrong window); a dev-server harness entry that mounts one page with its
   IPC/fetch stubbed from a tape, driven by a headless browser, works. Before and after must use the SAME
   tape so a pixel delta is code, not data. A first shot can differ by a few anti-aliased pixels: take a
   discarded warm-up render. Fail loud on console errors and empty mounts.

## S1 - Four scouts, in parallel (read-only, file:line, every count with its command)

Read the governing registry subjects first (design tokens, UI controls, async UI states, client fetch cache,
app shell lazy loading, agent instruction files, quality gates, module design) and put their technique rules
INTO the scout briefs - reading them yourself does not arm the scouts.

- **Shared system + tokens:** token layers (is the type file unlayered? which tokens own colour?), undefined
  token names in use, adoption ratios primitive : hand-rolled per control (detect by temptation signature, not
  by name), which rules enforce anything (warn vs error; is there a warning cap anywhere?), zero-consumer
  primitives, feature-local look-alikes.
- **Per-module divergence + reachability:** the instrument's ranking, the recent-vs-older cohort (new code may
  be cleaner on class names but style itself in module stylesheets and inline style objects - parallel design
  systems), what the top modules look like, which are divergent by design (canvas, reader, chart art).
- **Client performance:** eager first-load bytes, blank lazy-chunk fallbacks, hover/idle prefetch, table row
  memoization, warm-return cascades, cache helper sprawl, whether a nav-timing harness has ever run.
- **Instruction surface:** what is always loaded, where the design law sits in it, whether any rule loads when a
  UI file is edited, which skills' builder briefs mention the design law, whether other harnesses (AGENTS.md)
  read any of it, whether the registry map links UI contexts to the design subjects at all.

Open the dialog with the verdicts, then ask only what the code cannot answer (foundation scope, enforcement
strength against any earlier de-enforcement decision, performance scope, the owner's visibility order).

## S2 - Gate 0: the foundation specimen

A specimen page served by the app's own dev server with the app's real stylesheet: every type token current
beside proposed, the muting forms side by side then ONE level, meaning-named accent roles bound in every
theme with computed contrast AND distinctness, font truth, three real compositions rendered both ways, a text
scale switch. Plus the migration map (old -> new, counts, the dry-run of what a codemod would delete) and a
draft doctrine. Present one question per concern (type scale as a keep-list, muting, fonts, colour roles), the
specimen URL and shot paths inside each question. Expect the owner to keep the brand tint; fix what the tint
breaks (dead overrides), not the tint.

## S3 - Enforcement and agent law

Ratchets per temptation signature (arbitrary text size, raw palette colour, bare radius, opacity-dimmed text,
raw button element, literal type/colour in feature stylesheets), each with a seeded failing fixture, a
precision spot-check and a baseline measured on a clean export of HEAD (never the shared working tree). An
extinct condition (zero matches) belongs in a zero-tolerance check with an allow-list derived at run time,
not in a ratchet that reads zero as a broken matcher. An edit-time hook (tool-use hook on file edits) that
prints the findings on the lines just written, each naming the replacement, never blocking, under 1.5 s. One
path-scoped UI rule file (<= 60 lines, gates named not restated), a thin AGENTS.md for other harnesses, and the
always-loaded file's styling section cut to a pointer. Re-measure every count you write into an instruction
file and date it.

## S4 - Foundation apply

Codemod (reusable later) that deletes only overrides a probe proves dead in EVERY theme and text scale; skip
files dirty in the working tree and list them; then the cascade-layer move; then the approved changes one
commit each. After the layer move, pairs must be pixel-identical; after the last step, only intended deltas.

## S5 - The kit contest

Stage the app's compiled stylesheet (fetch it from the dev server) and the shooter's tapes as data, with a
schema file carrying the honesty rules (which rows are synthetic, which text is filler). The brief: the eight
compositions, a specimen plus four real surfaces recomposed only from the kit, dark and light, every owner
quote so far as law, tokens only, and a portable API sketch per composition (the winner is ported from it).
Check the rendered participant brief for stale template lines before running. Rerun a seat that errored on a
usage limit; never rerun a completed seat for a better draw. Visual pass on every variant; the owner reviews
the router himself unless he asks for a panel.

## S6 - Port the finalists, promote the winner

Commit a contract first (the page's real state and handlers as one props type, a dev-only switch reading a URL
parameter or local storage, stubs for each finalist) so the port builders share no file. Each builder ports its
kit into a prototype folder and composes the page, measured with a computed-style contract (8-20 roles) until 0
deviations or each remaining one explained (shell width, contest-page chrome, a product change made after the
contest). Compose a three-way image current | A | B at every size and theme, and let the owner flip the switch
live. Promotion: move the winner's kit into the shared components (history-preserving move), make the page
render it for everyone, delete the loser and the switch, write the doctrine's kit section (what each part is
for, when to use which, one-line APIs, "a local duplicate of a kit part is a finding"), and point the UI rule
file at the kit. Register a **kit specimen** view in the shooter (every part in every state, dark and light):
feature-batch builders read it to know what the kit offers, and each kit batch extends it. Pairs of the promoted page against the port must be pixel-identical except the removed switch.
