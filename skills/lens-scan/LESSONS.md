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
