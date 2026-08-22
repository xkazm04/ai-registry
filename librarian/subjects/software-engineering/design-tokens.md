---
subject: design-tokens
domain: software-engineering
last_touched: 2026-08-22
touched_by: external-reconcile
dry_streak: 0
---

# design-tokens

First touch: [[2026-08-22-11]], external reconcile against
`style-dictionary/style-dictionary` @ `29f1b25` (5.5.2). Gained
`node--cross-language-token-parity` (uncovered); single-stack debt cleared.
The CTI taxonomy hint was refuted by archaeology: path-position dispatch is
vestigial in v5 - typing migrated to DTCG $type, and the CTI transform
survives as a compatibility surface.

## Open leads (banked, convergence rule applies)

- Compare mirrors BY PATH, never by emitted name - a correct generator
  deliberately renames per platform, so a name-diff parity gate reports 100%
  mismatch and gets disabled.
- Partial generation failure: a generator that degrades per-token must fail
  the build, not the token. (Confirming sighting of absent-guard-is-loud -
  the safe mode log.warnings:'error' ships defaulted to warn.)
- A generated mirror's header is timestamp-free by default, or churn defeats
  diff-based staleness detection.
- token-taxonomy should note the CTI-to-$type migration: path position is now
  naming, not dispatch.

## Cross-subject proposals

- Deterministic-output-enables-diff-as-freshness-gate generalizes beyond
  tokens -> a codegen home.
- outputReferencesTransformed states precisely when preserving a var()
  indirection is wrong -> theme-architecture.
