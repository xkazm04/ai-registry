# Lessons - lens-scan

Append-only reflection lane. `## <version used> - <YYYY-MM-DD> - <project>` then `- ` bullets.

## 1.0.0 - 2026-10-12 - pof (aligned with /adopt-bp)
- Phase 1 rewrote app-structure.json from the context map every run, so the first lens-scan on a repo /adopt-bp had onboarded would have replaced its declared product tree with contexts 1:1 and dropped every measurement keyed to its feature slugs. Phase 1 now merges (spec section 11): a declared tree, stages, project lenses and non-metric facet values survive; only the code tree, manifests and metric values refresh.
- testRatioPct counted test FILES while bp's development manifest defines test LINES, and tests outside the feature's directories never counted (pof keeps them under src/__tests__). 1.1 counts lines, includes repo tests named after a source file, caps at 100; the series breaks there.
- Real context maps list directories in file_paths (pof: 53 of them); footprint counted them as missing files. They expand to their tracked files now, and featureFiles reads the structure's own code tree so renamed duplicate contexts resolve.
- The static pattern metrics (secretHits, unsafeSinks, rawLiterals) were "a grep" each run improvised; they are footprint --lens security|design with fixed pattern sets, shared with /adopt-bp's baseline.
