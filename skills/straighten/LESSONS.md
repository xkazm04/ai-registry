# Lessons - straighten

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-09-06 - ai-registry

- **Born from a gap, not a run.** `/conform` judged one repo at a time and wrote `evaluatedAgainst` beside each verdict; `build-registry-map.mjs` marked the pair `stale` when the subject's digest moved. Nothing walked the fleet, so a bundle landing left every project behind until somebody happened to open it. The first version is the smallest loop that closes that: rebuild, one table, drain in order, pathspec commits, stop at the commit.
- **The table ranks by `contexts x revisionsBehind`, and a null `revisionsBehind` ranks after known ones.** Verdicts written before subjects carried a `revision` cannot be measured; treating them as zero would bury them, treating them as infinite would let unmeasured debt outrank measured debt. After-but-not-below is the honest slot.

## 1.0.0 - 2026-09-09 - ai-registry

- Architecture review: the shared reflection clause assumed a writable registry link in every installation. Replaced that assumption with installation-aware scope and explicit adoption. This records an instruction audit, not a field effectiveness result.
