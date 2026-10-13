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
