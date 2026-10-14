# Lessons - straighten

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-09-06 - ai-registry

- **Born from a gap, not a run.** `/conform` judged one repo at a time and wrote `evaluatedAgainst` beside each verdict; `build-registry-map.mjs` marked the pair `stale` when the subject's digest moved. Nothing walked the fleet, so a bundle landing left every project behind until somebody happened to open it. The first version is the smallest loop that closes that: rebuild, one table, drain in order, pathspec commits, stop at the commit.
- **The table ranks by `contexts x revisionsBehind`, and a null `revisionsBehind` ranks after known ones.** Verdicts written before subjects carried a `revision` cannot be measured; treating them as zero would bury them, treating them as infinite would let unmeasured debt outrank measured debt. After-but-not-below is the honest slot.

## 1.0.0 - 2026-09-09 - ai-registry

- Architecture review: the shared reflection clause assumed a writable registry link in every installation. Replaced that assumption with installation-aware scope and explicit adoption. This records an instruction audit, not a field effectiveness result.

## 1.3.0 - 2026-10-14 - pumper

- **First field run (`--project pumper --wave 2`) passed all five criteria.** The map was modified on disk and classified `generator-dirty`: the builder exited 0, only generator-owned fields differed, and the header said 6 stale verdicts while a fresh build said 15. Commit 1 named only the map (+1427/-1314) and kept LF endings. The wave dealt 2 workers x 6 pairs, merged once with `--only`, and `verify-merge` passed 12/12. Commit 2 named the map, `conform-detail.json` and the two archived run files. Stale rows went from 15 to 3. No verdict state changed: 7 deviations were reconfirmed, 4 not-applicable held, and 1 conformant got a corrected anchor.
- **The header goes stale after a merge.** `merge-conform-runs.mjs` writes rows, never `stats`. The map still said `staleVerdicts: 15` against 3 real rows, so `converge.mjs --only report` printed "pumper stale 15" and `librarian/fleet-coverage.md` was wrong. Fixed in the method: rebuild with `build-registry-map.mjs --project <slug>` before the commit (it carries every merged verdict field), count `stale: true` rows by hand, and build the after table from rows.
- **A wave was interrupted and resumed by hand.** Worker w1 hit a session limit after writing a complete run file but before its reply. The tester resumed it by hand. The method now resumes from disk: a complete file is kept and has all its anchors spot-checked, a missing or partial one is re-spawned under the same id and slice, and a complete one is never re-spawned.
- **Proposal (merge-conform-runs.mjs, not applied - outside this skill): technique detail is replaced wholesale.** The merge overwrote each pair's technique list in `conform-detail.json` with the worker's (12 -> 1 and 11 -> 1; 431 lines deleted). It should merge by technique slug, keeping the older entries a run did not re-judge and marking them stale against the new digest. For now the worker brief asks for at least half the subject's techniques per verdict.
- **Proposal (merge-conform-runs.mjs, not applied): reaffirming a verdict the same day never clears `stale`.** Around line 316 the merge counts the same state, evidence and date as `unchanged` and skips the row, so its `stale` flag and old digest stay. `verify-merge` would then fail a same-day re-run whose judging was fine. The merge should re-stamp `evaluatedAgainst`, `evaluatedRevision` and clear `stale` on an `unchanged` row whose digest is behind the index. Documented as a hazard in references/wave.md section 6 until then.

## 1.3.1 - 2026-10-14 - ai-registry
- Both merge-conform-runs.mjs proposals above were applied in the registry the same day: a same-day reaffirmation of a stale row is re-stamped and counted `reaffirmed`, and technique lists merge by slug with older entries kept as `carriedFrom`. references/wave.md now describes the fixed behaviour.
