---
subject: diff-comparison
domain: software-engineering
last_touched: 2026-10-31
---
# diff-comparison

## 2026-09-06 — intake sofka-0906

Added `baseline-species-degradation`. The subject's five-species enumeration
states how a baseline is *chosen* and never what happens when the chosen
species does not exist for a whole class of objects — found by interrogating
the enumeration rather than by a slug match, which put the candidate at
`pair-and-baseline-selection` and would have made it an amendment.

The distinguishing point: unavailability is not random. A declared baseline
exists only where some workflow wrote it down, so it is missing for the
population that adopted a different workflow — usually the larger, later one.
The technique covers the ladder, the label carried in the same value as the
content, scope in the label, the empty result carrying it too, and refusal
naming every failed precondition.

Boundary held: absence enters the ladder, malformed must fail fast
(`optional-dependency-degradation#absent-degrades-malformed-fails-fast`). The
source tree gets this wrong in one arm, which is written up in
`applications/rust--baseline-species-degradation.md` as the divergence.

Not landed: nothing. `pair-and-baseline-selection` and `diff-honesty` were
both read in full and neither needed correcting — the new technique cites both
rather than competing with them.

## Architecture review - 2026-10-31

First architecture review, against `a2ac51c1c`. All 17 documents were read in
full. The golden path and seven of the eight techniques hold. Two internal
inconsistencies and one ecosystem overclaim were found. (1) The level ladder in
semantic-level-selection calls a hash-equality pre-check cheap, while
computation-offload argues at length that a hash is the expensive member of the
short-circuit family unless the digest already exists. (2) The rust
pair-and-baseline application says it is cited in the golden path's
`counter_evidence:`, but the golden path has no such field. (3) The rust
baseline-species-degradation application says the declared annotation is absent
for every GitOps-reconciled object. Argo CD's documentation says its default
sync is client-side apply and relies on that annotation. The same application
calls a truncated annotation a symptom of the size limit, but the documentation
describes an oversized resource as failing to fit, not as being truncated.
Applications built on private trees were not reopened and stay `reverify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/diff-comparison",
  "date": "2026-10-31",
  "baseline": "a2ac51c1c",
  "digest": "sha256-b2:8d6a27cb32976f49",
  "disposition": "clarify",
  "coverage": "All 17 documents read in full: the golden path, 8 techniques and 8 applications. Primary sources were opened for the attack-class CVEs, the hardness result, the rename and move-detection parameters, the split/unified eye-tracking study, and the Kubernetes annotation behaviour of two GitOps controllers. Not evaluated: any private project tree the applications cite, any runtime, WCAG text (stable, not re-opened). No verification date was refreshed.",
  "counterexamples": [
    "An Argo CD application on its default client-side sync carries last-applied-configuration, so a declared baseline exists for a GitOps-managed object. The absence is a property of server-side apply (Flux, or Argo CD with ServerSideApply=true), not of GitOps as such.",
    "A content-addressed store that already holds both digests makes a hash-equality short-circuit nearly free. Computing the two digests to compare them reads both inputs to the end, which is slower than a direct compare that exits at the first differing byte.",
    "A small within-subjects eye-tracking study found unified view less visually demanding, with no statistically significant differences, so the side-by-side-for-review default is a preference, not a finding (already disclosed in presentation-modes).",
    "Two surfaces using rename thresholds of 50% and 60% can both be right while showing the same pair as renamed-with-edits and as deleted-plus-added."
  ],
  "sources": [
    {
      "url": "https://trojansource.codes/",
      "result": "Supports the CVE mapping: 'This attack pattern is tracked as CVE-2021-42574' (bidi reordering) and 'This attack variant is tracked as CVE-2021-42694' (homoglyphs). The landing page makes no count of vulnerable viewers, so the 'every surface examined' claim rests on the paper, which was not re-opened."
    },
    {
      "url": "https://arxiv.org/abs/1412.0348",
      "result": "Supports 'conditionally quadratic' for edit distance. Strongly subquadratic edit distance would contradict SETH. The LCS half was not re-opened."
    },
    {
      "url": "https://git-scm.com/docs/git-diff",
      "result": "Supports diff-honesty's move-detection paragraph. 'The default similarity index is 50%'. 'Blocks of moved text of at least 20 alphanumeric characters are detected greedily'. Patch headers carry 'similarity index <number>'."
    },
    {
      "url": "https://repositorio.uc.cl/dspace/items/77683399-b7d4-4e8a-bd06-9b7f13e0dd33",
      "result": "IEEE Access 2023, 12 participants, within-subjects. Unified view showed less visual strain, and the authors 'did not find any statistically significant differences'. This matches presentation-modes' counter-evidence section."
    },
    {
      "url": "https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/",
      "result": "Refutes 'absent for every GitOps-reconciled object'. The default sync 'is a client side operation that relies on the kubectl.kubernetes.io/last-applied-configuration annotation', and server-side apply is opt-in via ServerSideApply=true. An oversized resource is 'too big to fit in 262144 bytes allowed annotation size', which is a fit failure, not truncation."
    },
    {
      "url": "https://github.com/fluxcd/kustomize-controller/pull/527",
      "result": "Supports the narrower claim. Flux's server-side apply removes the kubectl last-applied-configuration annotation, so Flux-managed objects lack the declared rung."
    }
  ],
  "documents": {
    "diff-comparison.md": {
      "disposition": "keep",
      "reason": "Boundaries (computing vs rendering vs reconciling), the three prior decisions and the honesty floor are coherent with every technique. Neighbour links resolve to named subjects."
    },
    "techniques/pair-and-baseline-selection.md": {
      "disposition": "keep",
      "reason": "Species, role naming, the degenerate pairs, the asked-for-versus-resolved rule and aggregate partitioning are consistent and backed by the two applications."
    },
    "techniques/semantic-level-selection.md": {
      "disposition": "clarify",
      "reason": "The Bytes rung says 'hash equality short-circuits everything above' as if it were cheap. That contradicts computation-offload, where a hash pays only when the digest already exists. Align the parenthetical and point to computation-offload."
    },
    "techniques/computation-offload.md": {
      "disposition": "keep",
      "reason": "Primary source supports the conditional hardness claim. Request-keyed answers, the degradation ladder, the strip-plus-slider pair and the short-circuit ordering are sound."
    },
    "techniques/presentation-modes.md": {
      "disposition": "keep",
      "reason": "The counter-evidence section accurately reflects the eye-tracking study (small n, no significant differences). The WCAG level-A criteria are cited correctly. The measured-value 'held' member and the non-finite guard are sound."
    },
    "techniques/drift-against-declared.md": {
      "disposition": "keep",
      "reason": "Two stamps, directional vocabulary, the governed amend verb, clause-plus-entity finding identity and coverage-carrying empty reports are internally consistent."
    },
    "techniques/diff-honesty.md": {
      "disposition": "keep",
      "reason": "Git documentation confirms the move and rename parameters: a 50% default threshold, a 20-alphanumeric-character move floor, and the similarity-index header. The refusal-travels-with-paraphrase rule is sound."
    },
    "techniques/invisible-differences.md": {
      "disposition": "keep",
      "reason": "The CVE mapping is confirmed. The 'every surface examined at once' breadth claim rests on the Trojan Source paper, which was not re-opened this run. The text is phrased as the paper's finding and was not altered."
    },
    "techniques/baseline-species-degradation.md": {
      "disposition": "keep",
      "reason": "The ladder, the label carried in the same value, scoped labels, empty-result labelling and absent-versus-malformed are generic and correct. Its population claim ('the population that adopted a different workflow') is properly hedged."
    },
    "applications/next--pair-and-baseline-selection.md": {
      "disposition": "reverify",
      "reason": "Internally consistent. The asked-for-versus-resolved guard and its stated gaps are coherent. The private tree at 62c252dd was not reopened."
    },
    "applications/next--diff-honesty.md": {
      "disposition": "reverify",
      "reason": "Internally consistent. The no-retry and unscoped-denial deviations are honestly stated. The private tree at 62c252dd was not reopened."
    },
    "applications/react--computation-offload.md": {
      "disposition": "reverify",
      "reason": "Consistent with the semantic-level application (the same duplicated normalization, the set-membership kernel). Citations at a2ef6400e and the replay timings were not re-run."
    },
    "applications/react--semantic-level-selection.md": {
      "disposition": "reverify",
      "reason": "Strong worked examples of the three structural lies and the projection failure. The private tree and the 0-of-73 measurement were not reopened."
    },
    "applications/react--drift-against-declared.md": {
      "disposition": "reverify",
      "reason": "Defects (observation-minted ids, the last-50 cap, no resolved-by-observation transition) match the technique's predictions. The tree was not reopened."
    },
    "applications/react--diff-honesty.md": {
      "disposition": "reverify",
      "reason": "Its limits are stated honestly (kernel-only gate, magnitude unmeasured). The ab_verdict rests on a private test run that was not re-executed."
    },
    "applications/rust--pair-and-baseline-selection.md": {
      "disposition": "clarify",
      "reason": "The closing line says the case is 'Cited in the golden path's counter_evidence:'. The golden path has no counter_evidence field and does not cite it. Drop that clause. The tree itself was not reopened."
    },
    "applications/rust--baseline-species-degradation.md": {
      "disposition": "clarify",
      "reason": "The general Kubernetes claims overreach. (1) Argo CD's default client-side sync writes last-applied-configuration, so the annotation is absent for server-side-apply reconcilers (Flux, Argo CD with ServerSideApply), not 'every object reconciled by a GitOps controller'. (2) Per Argo CD's documentation, an object past the 262144-byte annotation limit fails to fit; nothing there supports truncation as the symptom. Narrow both. The templating-package-manager claim was not checked and is left as written."
    }
  }
}
```


## Architecture review - 2026-10-31 (clarify applied)

Applied the three clarify items the earlier 2026-10-31 record named. The edits
are minimal and in each document's own voice. The private-tree applications were
not touched and keep `reverify`, which is now the overall disposition. Still
owed: the Trojan Source paper's 'every surface examined' breadth claim, the LCS
half of the hardness claim, and whether a templating package manager never
writes the declared annotation. Each needs its primary source opened.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/diff-comparison",
  "date": "2026-10-31",
  "baseline": "a2ac51c1c",
  "digest": "sha256-b2:5524257483b9bba3",
  "disposition": "reverify",
  "coverage": "All 17 documents decided. The three clarify items in the earlier 2026-10-31 record were applied and the edited passages re-read: one internal inconsistency in semantic-level-selection, a dangling cross-reference in rust--pair-and-baseline-selection, and the Kubernetes overclaims in rust--baseline-species-degradation, the last checked against Argo CD and Flux sources opened this run. The other 14 documents are byte-unchanged and keep their dispositions. No private tree or runtime was reopened, and no verification date was refreshed.",
  "counterexamples": [
    "An Argo CD application on its default client-side sync carries last-applied-configuration, so a declared baseline exists for a GitOps-managed object. The absence is a property of server-side apply (Flux, or Argo CD with ServerSideApply=true), not of GitOps as such.",
    "A content-addressed store that already holds both digests makes a hash-equality short-circuit nearly free. Computing the two digests to compare them reads both inputs to the end, which is slower than a direct compare that exits at the first differing byte.",
    "A small within-subjects eye-tracking study found unified view less visually demanding, with no statistically significant differences, so the side-by-side-for-review default is a preference, not a finding (already disclosed in presentation-modes).",
    "Two surfaces using rename thresholds of 50% and 60% can both be right while showing the same pair as renamed-with-edits and as deleted-plus-added."
  ],
  "sources": [
    {
      "url": "https://trojansource.codes/",
      "result": "Supports the CVE mapping: 'This attack pattern is tracked as CVE-2021-42574' (bidi reordering) and 'This attack variant is tracked as CVE-2021-42694' (homoglyphs). The landing page makes no count of vulnerable viewers, so the 'every surface examined' claim rests on the paper, which was not re-opened."
    },
    {
      "url": "https://arxiv.org/abs/1412.0348",
      "result": "Supports 'conditionally quadratic' for edit distance. Strongly subquadratic edit distance would contradict SETH. The LCS half was not re-opened."
    },
    {
      "url": "https://git-scm.com/docs/git-diff",
      "result": "Supports diff-honesty's move-detection paragraph. 'The default similarity index is 50%'. 'Blocks of moved text of at least 20 alphanumeric characters are detected greedily'. Patch headers carry 'similarity index <number>'."
    },
    {
      "url": "https://repositorio.uc.cl/dspace/items/77683399-b7d4-4e8a-bd06-9b7f13e0dd33",
      "result": "IEEE Access 2023, 12 participants, within-subjects. Unified view showed less visual strain, and the authors 'did not find any statistically significant differences'. This matches presentation-modes' counter-evidence section."
    },
    {
      "url": "https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/",
      "result": "Refutes 'absent for every GitOps-reconciled object'. The default sync 'is a client side operation that relies on the kubectl.kubernetes.io/last-applied-configuration annotation', and server-side apply is opt-in via ServerSideApply=true. An oversized resource is 'too big to fit in 262144 bytes allowed annotation size', which is a fit failure, not truncation."
    },
    {
      "url": "https://github.com/fluxcd/kustomize-controller/pull/527",
      "result": "Supports the narrower claim. Flux's server-side apply removes the kubectl last-applied-configuration annotation, so Flux-managed objects lack the declared rung."
    }
  ],
  "documents": {
    "diff-comparison.md": {
      "disposition": "keep",
      "reason": "Boundaries (computing vs rendering vs reconciling), the three prior decisions and the honesty floor are coherent with every technique. Neighbour links resolve to named subjects."
    },
    "techniques/pair-and-baseline-selection.md": {
      "disposition": "keep",
      "reason": "Species, role naming, the degenerate pairs, the asked-for-versus-resolved rule and aggregate partitioning are consistent and backed by the two applications."
    },
    "techniques/semantic-level-selection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the Bytes rung's 'hash equality short-circuits everything above' now names identity, length or an already-existing digest as the cheap pre-checks, says computing a digest is not cheap, and links computation-offload."
    },
    "techniques/computation-offload.md": {
      "disposition": "keep",
      "reason": "Primary source supports the conditional hardness claim. Request-keyed answers, the degradation ladder, the strip-plus-slider pair and the short-circuit ordering are sound."
    },
    "techniques/presentation-modes.md": {
      "disposition": "keep",
      "reason": "The counter-evidence section accurately reflects the eye-tracking study (small n, no significant differences). The WCAG level-A criteria are cited correctly. The measured-value 'held' member and the non-finite guard are sound."
    },
    "techniques/drift-against-declared.md": {
      "disposition": "keep",
      "reason": "Two stamps, directional vocabulary, the governed amend verb, clause-plus-entity finding identity and coverage-carrying empty reports are internally consistent."
    },
    "techniques/diff-honesty.md": {
      "disposition": "keep",
      "reason": "Git documentation confirms the move and rename parameters: a 50% default threshold, a 20-alphanumeric-character move floor, and the similarity-index header. The refusal-travels-with-paraphrase rule is sound."
    },
    "techniques/invisible-differences.md": {
      "disposition": "keep",
      "reason": "The CVE mapping is confirmed. The 'every surface examined at once' breadth claim rests on the Trojan Source paper, which was not re-opened this run. The text is phrased as the paper's finding and was not altered."
    },
    "techniques/baseline-species-degradation.md": {
      "disposition": "keep",
      "reason": "The ladder, the label carried in the same value, scoped labels, empty-result labelling and absent-versus-malformed are generic and correct. Its population claim ('the population that adopted a different workflow') is properly hedged."
    },
    "applications/next--pair-and-baseline-selection.md": {
      "disposition": "reverify",
      "reason": "Internally consistent. The asked-for-versus-resolved guard and its stated gaps are coherent. The private tree at 62c252dd was not reopened."
    },
    "applications/next--diff-honesty.md": {
      "disposition": "reverify",
      "reason": "Internally consistent. The no-retry and unscoped-denial deviations are honestly stated. The private tree at 62c252dd was not reopened."
    },
    "applications/react--computation-offload.md": {
      "disposition": "reverify",
      "reason": "Consistent with the semantic-level application (the same duplicated normalization, the set-membership kernel). Citations at a2ef6400e and the replay timings were not re-run."
    },
    "applications/react--semantic-level-selection.md": {
      "disposition": "reverify",
      "reason": "Strong worked examples of the three structural lies and the projection failure. The private tree and the 0-of-73 measurement were not reopened."
    },
    "applications/react--drift-against-declared.md": {
      "disposition": "reverify",
      "reason": "Defects (observation-minted ids, the last-50 cap, no resolved-by-observation transition) match the technique's predictions. The tree was not reopened."
    },
    "applications/react--diff-honesty.md": {
      "disposition": "reverify",
      "reason": "Its limits are stated honestly (kernel-only gate, magnitude unmeasured). The ab_verdict rests on a private test run that was not re-executed."
    },
    "applications/rust--pair-and-baseline-selection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: dropped the claim that the case is cited in the golden path's counter_evidence:, which does not exist. The private tree remains unreopened; the remaining citations are as dated."
    },
    "applications/rust--baseline-species-degradation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the annotation is now absent for server-side-apply reconcilers, with a note that a GitOps controller whose default sync is client-side does write it (Argo CD docs, Flux PR #527). The truncation-from-size-limit causal claim was replaced: an oversized object fails to apply. The templating-package-manager claim is still unchecked, and the private tree at fdb58c0d was not reopened."
    }
  }
}
```

## Re-verification - 2026-10-31

This record follows a re-verification of the four React applications against the personas tree, at the pinned `a2ef6400e` / `bf2a1e249` and at HEAD `61029d7ae0`. It changes no technique. Three verdicts in the applications are now resolved in that tree, and one is reversed: the execution-comparison worker shares its kernel with the fallback, its caches evict, and `jsonDiff` no longer tells the three structural lies, while the drift findings now have no reader. Each change is a dated paragraph in its document.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/diff-comparison",
  "date": "2026-10-31",
  "baseline": "df3f1c1d7",
  "digest": "sha256-b2:9411e6efa1fff5db",
  "disposition": "reverify",
  "coverage": "Re-verification only: the four React applications (computation-offload, semantic-level-selection, drift-against-declared, diff-honesty) were checked citation by citation against the personas tree at their pinned commits and at HEAD 61029d7ae0. The jsonDiff and memory-diff kernels were replayed with Node's type stripping, outside the project's suite (JSON parser stubbed for jsonDiff). The census rule was run for its one rule. Not run: vitest and tsc (no installed dependencies in that checkout). The golden path, the eight techniques and the four non-React applications carry the prior record's decisions unchanged.",
  "counterexamples": [
    "A worker that computes the whole result and then posts it in chunks spreads the render but not the computation. 'Streaming' in the message protocol does not mean the first rows paint before the tail is computed.",
    "A comparison kernel with no budget can still be bounded at its input. Each side of the terminal diff is fetched at 500 lines and the cap is disclosed, which is a different mechanism from a degradation ladder and answers a different failure.",
    "A drift detector can be correct and still useless: once its only surface was deleted as orphaned, findings were computed and persisted on every run with no reader, so the identity defects stopped costing attention and only cost storage.",
    "Content-multiset alignment fixes the id-disjointness lie, but a read capped at 200 rows per run reintroduces an over-claim in the same panel: the counts are correct for the page and silent about the rest."
  ],
  "sources": [
    {
      "source": "personas tree at a2ef6400e and HEAD 61029d7ae0 (read, kernels replayed)",
      "result": "Worker and fallback both call comparisonDiffCore diffLines(splitLogLines(...)) since 2026-10-19. Caches are an LRU capped at 24 since 2026-08-30. The worker slices a finished result into chunks. jsonDiff walks to leaf paths with (absent) distinct from null since 2026-10-31; replay of the three table inputs gave [], one change at input.topic, and one at b. PromptDiffModal.tsx was deleted 2026-09-24. useDriftEventsForPersona and the DesignTab wiring were deleted 2026-09-04, and nothing outside the store and middleware reads designDriftEvents. The census rule stringify-decided-equality is at 4 sites in 4 files."
    },
    {
      "source": "personas tree at bf2a1e249 and HEAD 61029d7ae0 (memoryDiff replayed)",
      "result": "id alignment at bf2a1e249 gave 2 added and 2 removed for the same learnings under fresh ids. Content-multiset alignment at HEAD gave 0 and 0, and 1 removed for two-against-one. get_by_run caps a run's read at 200 since 2026-09-17, with no limit passed by RunDiffView or the timeline hook. The 'manual' bucket was filtered out of the run list 2026-10-19."
    }
  ],
  "documents": {
    "applications/next--diff-honesty.md": {
      "disposition": "reverify",
      "reason": "Internally consistent. The no-retry and unscoped-denial deviations are honestly stated. The private tree at 62c252dd was not reopened."
    },
    "applications/next--pair-and-baseline-selection.md": {
      "disposition": "reverify",
      "reason": "Internally consistent. The asked-for-versus-resolved guard and its stated gaps are coherent. The private tree at 62c252dd was not reopened."
    },
    "applications/react--computation-offload.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31 at personas@61029d7ae0; verified_on moved. Every anchor in the worked example moved to HEAD. A dated paragraph records two resolved departures (caches now an LRU capped at 24; the fallback calls the same core kernel as the worker), the narrower streaming claim (chunks follow a finished computation), the disclosed 500-line input cap, and the deletion of PromptDiffModal. The quadratic append, the unvirtualized render and the missing kernel budget still hold. The replay timings are the tree doc's measurements (version-diff-view.md §7) and stand as measured."
    },
    "applications/react--diff-honesty.md": {
      "disposition": "keep",
      "reason": "Re-checked 2026-10-31 at personas@61029d7ae0. B is what the tree runs (content-multiset alignment, shared with the timeline hook), and the A/B kernel result was replayed on both files. A dated paragraph adds the fixed 'manual'-bucket defect and an open one: a 200-row per-run read cap, undisclosed. verified_on stays 2026-08-29, because the vitest and tsc results it reports were not re-run."
    },
    "applications/react--drift-against-declared.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31 at personas@61029d7ae0; verified_on moved. The detector, its thresholds and all four identity defects hold, with every anchor moved to HEAD. Reversed: the surface that read the findings was deleted 2026-09-04, so findings are written and never shown. That is stated in the dated paragraph and marked inline at the deleted hook. Also recorded: the streak count's off-by-one fix and an unpriced cost carried as null."
    },
    "applications/react--semantic-level-selection.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31 at personas@61029d7ae0; verified_on moved. The prose LCS, the composed lab levels and the projection failure hold, with their anchors moved to HEAD (getSectionSummary :142, label keying :150). A dated paragraph records that all three jsonDiff structural lies are fixed (replayed), that the normalization policies are down to two, the census at 4/4, and the tauriInvoke canonicalizer that the earlier note missed. The table stays as the a2ef6400e measurement. 0 of 73 resolves to the tree doc."
    },
    "applications/rust--baseline-species-degradation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the annotation is now absent for server-side-apply reconcilers, with a note that a GitOps controller whose default sync is client-side does write it (Argo CD docs, Flux PR #527). The truncation-from-size-limit causal claim was replaced: an oversized object fails to apply. The templating-package-manager claim is still unchecked, and the private tree at fdb58c0d was not reopened."
    },
    "applications/rust--pair-and-baseline-selection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: dropped the claim that the case is cited in the golden path's counter_evidence:, which does not exist. The private tree remains unreopened; the remaining citations are as dated."
    },
    "diff-comparison.md": {
      "disposition": "keep",
      "reason": "Boundaries (computing vs rendering vs reconciling), the three prior decisions and the honesty floor are coherent with every technique. Neighbour links resolve to named subjects."
    },
    "techniques/baseline-species-degradation.md": {
      "disposition": "keep",
      "reason": "The ladder, the label carried in the same value, scoped labels, empty-result labelling and absent-versus-malformed are generic and correct. Its population claim ('the population that adopted a different workflow') is properly hedged."
    },
    "techniques/computation-offload.md": {
      "disposition": "keep",
      "reason": "Primary source supports the conditional hardness claim. Request-keyed answers, the degradation ladder, the strip-plus-slider pair and the short-circuit ordering are sound."
    },
    "techniques/diff-honesty.md": {
      "disposition": "keep",
      "reason": "Git documentation confirms the move and rename parameters: a 50% default threshold, a 20-alphanumeric-character move floor, and the similarity-index header. The refusal-travels-with-paraphrase rule is sound."
    },
    "techniques/drift-against-declared.md": {
      "disposition": "keep",
      "reason": "Two stamps, directional vocabulary, the governed amend verb, clause-plus-entity finding identity and coverage-carrying empty reports are internally consistent."
    },
    "techniques/invisible-differences.md": {
      "disposition": "keep",
      "reason": "The CVE mapping is confirmed. The 'every surface examined at once' breadth claim rests on the Trojan Source paper, which was not re-opened this run. The text is phrased as the paper's finding and was not altered."
    },
    "techniques/pair-and-baseline-selection.md": {
      "disposition": "keep",
      "reason": "Species, role naming, the degenerate pairs, the asked-for-versus-resolved rule and aggregate partitioning are consistent and backed by the two applications."
    },
    "techniques/presentation-modes.md": {
      "disposition": "keep",
      "reason": "The counter-evidence section accurately reflects the eye-tracking study (small n, no significant differences). The WCAG level-A criteria are cited correctly. The measured-value 'held' member and the non-finite guard are sound."
    },
    "techniques/semantic-level-selection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the Bytes rung's 'hash equality short-circuits everything above' now names identity, length or an already-existing digest as the cheap pre-checks, says computing a digest is not cheap, and links computation-offload."
    }
  }
}
```
