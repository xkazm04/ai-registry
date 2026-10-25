# Lessons - adopt-bp

Append-only reflection lane. `## <version used> - <YYYY-MM-DD> - <project>` then `- ` bullets.

## 0.1.0 - 2026-10-12 - pof (bench: codex gpt-6.1-sol, claude sonnet-5.5, grok 4.7, all @high)
- Counts lie, verification does not: Sonnet produced 4x the proposals and coverage rows of Codex, but a blind 54-claim check found Codex 12/12 proposals true vs Sonnet 9/12 and Grok 8/12 (1 false). Score seats on a verified sample, not on volume.
- "Absent = unmeasured" was read as "omit clean results": Codex left findings* empty on clean features, so clean security read as unmeasured. A judged-clean lens gets explicit zeros; absent is only "not looked at".
- A calibration example ("70-85") became a ceiling: Codex never scored above 85. State what a score means, not a typical range.
- Without a granularity rule, Sonnet made UI atoms and stores into features (101 vs 68). Roadmap-sized features with shared foundations folded into one ops feature per domain.
- ~25 of 36 sampled proposals were accurate but targeted a legacy tree the repo's own salvage doc schedules for deletion. Deprecated features get security-only judgement and removal-or-security proposals.
- API-only features were called live when their only callers sat in the deprecated shell; stage now follows the calling surface.
- Real repos ship context maps with duplicate context names and directory entries in file_paths (pof: 2 and 53). seed renames duplicates by group and expand() walks directories; check reports both.
- The bp canvas folded deprecated features into "promised"; only a real product with many deprecated features showed it (fixed in bp 29509c2). Smoke every adoption on the canvas, not just the validator.

## 1.0.0 - 2026-10-12 - pof (aligned with /lens-scan)
- Two skills wrote one store with two writers, two metric definitions and two standardsPct methods. adopt-bp now writes nothing itself: store.mjs for every row, footprint.mjs for static metrics, structure.mjs (merge mode) for facets. Onboarding is the first point of lens-scan's series, not a parallel one.
- standardsPct was a judged number here and a coverage-derived ratio in lens-scan. It is derived now, from coverage rows against registry techniques the batch lists per feature (via .ai/registry-map.json); no standard, no number.
- Proposals follow lens-scan's contract (catalog metric + expected delta, five-section body, no re-proposing an open or declined item), so the review UI and /lens-scan execute take onboarding proposals without translation.

## 1.1.0 - 2026-10-12 - pof (judgement-only rerun)
- promote deleted the target's .ai/lens-scan before copying; a running bp held scan.db open, Windows refused the delete halfway (map and events gone, store left), and a chained clean then deleted the seat worktree - the only copy of a $27 judgement run. promote now never deletes: it overwrites files one by one, merges the seat's new runs into the store in one SQLite transaction (safe beside a reader), and validates; clean refuses until a promotion validated. Never chain clean after promote with `;`.
- A judgement-only seat (bench run --phase judgement) is the provider-offload shape: it starts from the target's adopted state and copies only inventory and product tree from work/, so a previous seat's scripts and notes cannot leak in.

## 1.2.1 - 2026-10-14 - athena-portable (bp validation run)

- Field lesson: `adopt.mjs measure` passed the feature COUNT as `scope.features`, but the lens-scan store (since 1.2.0) wants the list of feature slugs and checks them against the map, so the first adoption after lens-scan 1.2.0 crashed at the static baseline. It now passes the slugs and the known set. The headless run patched a temp copy to finish; this is the real fix.
- Field lesson: a context map kept from before a burst of commits can miss whole folders (athena-portable: 111 of 257 desktop source files covered, the depth scenes absent), and adopt then reads those features as having no UI. Counting dead paths (27 of 831) hid it; check coverage of tracked source, not just dead entries, before trusting an old map.

## 1.2.2 - 2026-10-18 - personas-web (design lens, full app)
- The curated context map was Vibeman-shaped (groups[].contexts[], camelCase filePaths); seed refused it and the run needed a fs.readFileSync preload shim to project it as v2. 1.3.0 reads it through lens-scan's flattenContextMap, so lens-scan phase 1 reads the same shape too.
- judge had no path for the design manifest's status/a11y/specDrift or for proposal tier/risk_class: the agent wrote a post-judge script (facets into the map, store.mjs rank per proposal). judge now takes every non-derived enum/boolean manifest field and passes triage to propose.
- register appended .ai/lens-scan/ to a clean .gitignore although .git/info/exclude already ignored it; the agent reverted it by hand. register now asks git check-ignore first.

## 1.3.0 - 2026-10-25 - afterlife (operator asked for every BP lens)
- check passed a context map that listed 1,266 of 1,939 tracked source files: context-map-fresh counts dead paths only, and the map predated seven whole screens and the runner. The run hand-built a 35-context supplement by nearest-owner assignment. 1.4.0 adds context-map-coverage to check and a supplement command that drafts it (UNNAMED contexts stay a model job).
- judge took only development, security and design, while bp ships seven lenses and business, operations and quality carry judgement scan blocks. The run wrote those through store.mjs with a side script before judge so refreshFacets merged them. 1.4.0 judges every lens lensMethod() calls judgement, and batches carry each one's instructions; performance stays probe-only and is reported unmeasured.
- report ordered Top proposals by risk, the change's risk, so a tier 3 rename outranked a tier 1 authz hole. It orders by tier now.
- A shared brief file plus one subagent per 5-feature batch (7 in parallel) judged 34 features on six lenses in ~17 min wall, 130-200k tokens a batch.
