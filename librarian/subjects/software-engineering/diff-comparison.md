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
