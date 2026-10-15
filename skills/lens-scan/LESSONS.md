# Lessons - lens-scan

Append-only reflection lane. `## <version used> - <YYYY-MM-DD> - <project>` then `- ` bullets.

## 1.0.0 - 2026-10-12 - pof (aligned with /adopt-bp)
- Phase 1 rewrote app-structure.json from the context map every run, so the first lens-scan on a repo /adopt-bp had onboarded would have replaced its declared product tree with contexts 1:1 and dropped every measurement keyed to its feature slugs. Phase 1 now merges (spec section 11): a declared tree, stages, project lenses and non-metric facet values survive; only the code tree, manifests and metric values refresh.
- testRatioPct counted test FILES while bp's development manifest defines test LINES, and tests outside the feature's directories never counted (pof keeps them under src/__tests__). 1.1 counts lines, includes repo tests named after a source file, caps at 100; the series breaks there.
- Real context maps list directories in file_paths (pof: 53 of them); footprint counted them as missing files. They expand to their tracked files now, and featureFiles reads the structure's own code tree so renamed duplicate contexts resolve.
- The static pattern metrics (secretHits, unsafeSinks, rawLiterals) were "a grep" each run improvised; they are footprint --lens security|design with fixed pattern sets, shared with /adopt-bp's baseline.

## 1.2.0 - 2026-10-13 - bp
- Change (not a field lesson): the blueprint (bp) now starts lens-scan headless as scan jobs, so 1.2.0 adds what that needs. Any lens whose manifest declares `scan: { method: 'judgement', instructions }` is measurable (`structure.mjs lens --id` names the method and the numeric metric fields; development, security and design keep their built-in methods). A feature the lens does not touch gets no reading and a facet `applicable: false` with a reason through the new `structure.mjs facet` command, which edits one facet and writes atomically; a 1:1 re-map now keeps that judgement too.
- Change: `run-start --features a,b,c` records the scope `{"features":[...]}` and refuses an unknown slug before any run row exists; `BP_JOB_ID` makes the run note `bp-job:<id>` (kept by `run-end --note`); `proposals --ids` and `execute --proposals` narrow execution to named approved items; a "Headless (from the blueprint)" section says the agent never stops to ask and fails a run visibly. Unproven in the field: no real headless run has used these yet.

## 1.2.1 - 2026-10-13 - bp

- Field lesson: the first blueprint-spawned scan (claude -p through the user-scope junction ~/.claude/skills/lens-scan) found store.mjs and footprint.mjs silently doing nothing - the run-as-script check compared argv[1] (junction path) with import.meta.url (real path). The agent worked around it with an import wrapper. All three scripts now compare real paths.

## 1.2.2 - 2026-10-13 - pof (dispatched from bp)

- Field lesson: the first blueprint-dispatched execute (p-c3f7d3, p-73edaa on pof, both merged green) removed its worktrees with the node_modules junction still in place and emptied pof's own node_modules; the agent noticed and reinstalled. The rule was in scan-sweep's ab-lane.md, but section 5 restated only two of its rules inline and the run followed the inline list. Section 5 now names the unlink step itself.

## 1.2.3 - 2026-10-14 - bp

- Field lesson (from a flaky bp check, then measured on store.mjs itself): three runs opening a NEW store at once failed 3-9% of the time with `no such table: runs` - the DDL sets user_version before it creates its tables, so a second process read v1 and skipped the DDL. A new file's switch to WAL can also answer SQLITE_BUSY without the busy handler (seen in bp's fake). openStore now retries the WAL switch and runs the DDL in one BEGIN IMMEDIATE that re-reads the version: 5/180 concurrent fresh run-starts failed before, 0/180 after. The blueprint starts up to 3 scans per product, so a first scan of several lenses on a new repo hits this.

## 1.3.0 - 2026-10-14 - bp

- Change (not a field lesson; unproven in the field - no real run has used any of it yet): steps scans (`scan.method: 'steps'`, 1-8 `script` / `skill: conform` / `judgement` steps in one run; `steps.mjs run` records a script's rows as static measurements with the manifest field's unit, refuses a metric the step does not yield, skips a `{registry}` step when no registry checkout exists); business, operations and quality are measured by their scan block like any project lens (they never had a built-in method); `structure.mjs lens` prints every lens's metric fields with their units, the one source of a measurement's unit.
- Change: `/lens-scan onboard` takes over the blueprint's onboarding contract (references/lens-onboarding.md) and extends it to permanent reverse-DNS lenses, composed steps and a free 16x16 path icon whose glyph+line no enabled lens draws; `structure.mjs lens-add` checks and appends atomically, refusing a duplicate id.
- Change: the generic `## Harness` form and `harness.py` (Python Playwright): light + dark captures, `minTextPx`, `consoleErrors`, and "unscreenable: <why>" instead of a fake shot. Execute builds `target: registry` items in the registry checkout and refuses while it is dirty.
- Field lesson (bp validation run, PayPal): the Opus security/development/design judgements were skipped as 'scan-sweep unavailable' (no scan-sweep beside the user-scope link at the time) yet the run ended done, so bp showed the previous day's Haiku zeros as the latest findings. A skipped judgement now writes an error activity and a run that measured nothing else ends failed.

## 1.4.0 - 2026-10-14 - bp

- Change (unproven in the field until the registry-lens runs on paypal and athena-portable): a headless caller's door. `scripts/drive.mjs status|cover|execute` drives one lens with no blueprint server: `status` is `store.mjs gaps` (per feature: unmeasured / unmeasurable / stale metrics, the lens's backlog); `cover` measures only the features with gaps, chunked to a conform step's budget, then proposes; `execute` builds approved items in batches of 50, approving `proposed` ones only on the caller's `--approve-proposed --by <kind:name>`, recorded by `store.mjs decide`. Proposal status moves are now compare-and-set, so the blueprint and a headless caller never both build one item (before, two executors that read `approved` both wrote `executing`). A conform step with a feature scope spends its budget on the scoped features with no judged pair first (it judged product-wide pairs before, so a scoped re-run could not fill a feature's `conformantPct`). A registry-target execute is no longer refused for untracked files in the registry checkout.

## 1.4.1 - 2026-10-14 - bp (the first real drive runs)

- Field lesson: the first real `drive.mjs cover` on paypal turned 0 stale readings into 90, all from the run that had just measured them. `gaps` dated staleness by the app-structure's `generated_at`, and lens-scan rewrites the structure after every measure phase. Staleness now dates from `provenance.context_map_generated_at`, which moves only when the file lists the readings were taken over change.

## 1.4.2 - 2026-10-14 - bp (the first real headless execute)

- Field lesson: the first `drive.mjs execute` on paypal (9 registry items, two waves) passed drive's 90-minute timeout with 3 items done and 4 merged on main. The kill left the run `running` and 6 items `executing` that no path could finish: execute took only `approved` items, and nothing may move an item back. drive now closes a run whose session died as `aborted`; the default timeout is 30 min per item (at least 90); execute takes a cut-off item (`executing`, no running execute run names it) and reconciles it from what landed (`git log --grep <id>`, the run's worktrees) before building anything.

## 1.4.3 - 2026-10-14 - bp (the paypal headless execute's result)

- Field lesson: 9 registry items executed headless on paypal. 3 moved their metric; 6 landed real, gate-green fixes (constant-time token compare, pin expiry, audit sanitizing...) and still read `deviations` unchanged, because each fixed ONE shortfall of a pair whose verdict names several (authorization: the compare was fixed, refusal causes still missing). The proposals claimed `-1` on a pair-grain count for a technique-grain fix. Propose now requires an item's delta at the metric's grain: a pair item lists every shortfall the verdict names, or the fix is folded into the pair's item. The execute recorded those 6 `failed` but kept the merges (the doctrine says revert); that call is the operator's, not the skill's.

## 1.4.4 - 2026-10-14 - bp (the athena-portable headless execute)

- Field lesson: the athena execute (12 registry items, 5 builder worktrees, parallel conform judges) ended its `claude -p` turn with "waiting on the remaining judges". In print mode that ends the process: the judges died, drive closed the run `aborted`, and 11 items were cut off (4 merged, 7 never built). Headless now says never end the turn while agents run. The same run showed every one of its single-technique items failing to flip its pair (the 1.4.3 grain lesson again, at proposal time). So execute now re-checks each item against Propose as it reads today, and records an item that cannot meet it `failed` with `re-propose: <why>` instead of building it.

## 1.5.0 - 2026-10-15 - bp

- Change, from the 2026-10-14 field runs: execute merged each item into main as it went, and the doctrine's answer to a miss was a revert on main. The runs left 6 failed-but-merged items on PayPal main (gate-green fixes that did not move their pair-grain metric, kept by the operator's call) and 8 reverts on Athena main. 1.5.0 builds a pack instead: one branch `pack/<short>-<n>` cut from the release base, one squashed commit per item with `Lens-Item:`/`Lens-Pack:` trailers, before/after readings linked to the item and its commit. The pack never merges into main, so main stays clean and nothing is ever reverted there; a person triages each item (accept, rework with a note, descope) and `/lens-scan release` cherry-picks the accepted ones into one PR. Unproven in the field: no real pack or release has run yet.

## 1.5.2 - 2026-10-15 - the skill's own tests leaked temp dirs

- Every test file under `tests/` made its store or repo fixture with `mkdtempSync` and never
  removed it: one run of the seven files left 44 `lens-scan-*` dirs in the OS temp dir, and the
  machine-wide disk sweep that day counted about 1,000 of them. Each file now routes `mkdtempSync`
  through a tracker and removes the dirs in one file-level `after()`. One test also left two
  SQLite stores open, which on Windows makes the removal fail with EPERM; it closes them now.
  No assertion changed; with the three registry script tests fixed the same way, the ten files
  pass 90/90 before and after and leave nothing behind (81 dirs before).

## 1.5.3 - 2026-10-15 - bp (athena design pack k-des-2)
- Another session's `pnpm dev` held Athena's harness port (1431) and served the main checkout. `vite --strictPort` died quietly, the ready poll was answered by that server, and k-des-1's backfilled before/after shots all showed main: identical pairs that read as "the item changed nothing visible". 1.5.4: harness.py refuses when the url answers before its command starts, and `--port` serves a worktree elsewhere.
- harness.py's `steps` form always loaded `/` first; Athena's preview answers 404 there, so a topic page plus a click needed a one-off script. A `steps` feature that opens with `goto /path` now starts there.

## 1.5.2 - 2026-10-15 - bp (athena design pack k-des-1)
- The first design pack built 6 items that each moved `undesignedStates` and took no screenshots: the shot rule said "a metric the harness measures", and a judged metric is not one. The person triaging design looks at screens, so 1.5.3 shoots every design item's feature whenever the harness can render it.
- The first performance measure read frameP95Ms 16.8 ms on every scene: a headless browser's frame interval is the display's, so a smooth page sits at the floor and no fix can show. 1.5.2 added blockingMs, jankFrames and idleWakeups (per-pass totals with headroom).

## 1.5.4 - 2026-10-15 - bp
- Change (not a field lesson; unproven in the field): the blueprint's findings ledger ports a release manager whose triage has an undo (U), and nothing in the store could move an item back from `accepted`, `rework` or `descoped`. store.mjs is the one owner of transitions, so the undo lives here, not in bp: 1.6.0 adds store v3 (`proposals.triaged_from`, an additive migration on open; a v1 file goes straight to v3), every triage records the status it left, and `triage --decision reopen` puts it back, one step deep. Refused `in-release` once the release left draft (the same rule as leaving a release), `rebuilt` for a rework whose rebuild exists, `pack-closed`, and `no-prior-status` for a call made before v3. An item back at done|failed reopens its triaged pack.

## 1.6.0 - 2026-10-15 - bp (release-ledger, the Kettle sample train)
- A pack closed on tag only when every item was released, descoped or declined, so a pack holding a `rework` item never closed: the item stays `rework` for good, and its rebuild ships from a later pack. bp's sample sim (WP3) hit it. 1.6.1 counts a rework item as settled once its rebuild (attempt_of = it) is, down the chain, and the tag looks at the packs of the reworked items too, so the old pack closes with the release that ships its rebuild.
