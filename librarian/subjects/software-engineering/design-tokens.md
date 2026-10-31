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

## 2026-09-24 - intake: the vocabulary as escape hatch

Source [[2026-09-24-shadcn-lint-tailwind-design-system]]. token-enforcement gained a section:
an allow-list gate reads an authority the gated author may legitimately write, so minting the
wanted token is a silent fourth exit, and the primary's own drift runs show enforced projects ending
with more variants. Applied to the fleet's copy baselines as the nearest same-class instrument:
unmeasurable (no membership gate at error level over an agent-writable vocabulary exists here).
The seam hunt shipped a recall fix in personas `f9e257bcd` (variant-prefixed white classes escaped a
whitespace-anchored rule, 15 of 25 uses) and added it to `react--token-enforcement`. Banked with a
number: the generated-scale laundering case (`p-[13px]` -> `p-3.25`), 0.05% off-ladder in personas.
Boundary with ui-controls: a token-legal restyle is that subject's, not this one's.

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

## Architecture review - 2026-10-31

First architecture review, against `5a08b4610`. All eleven documents read in
full. Three primary sources were opened for the load-bearing unstable claims:
the CSS Transitions spec (motion-tokens' zero-duration rule holds), ESLint's
rule-configuration page (token-enforcement's "later block replaces the rule's
arguments" holds only when the later block supplies options; a severity-only
block keeps them), and the design-system linter's `docs/evals.md` at the
commit the 2026-09-24 intake pinned. That last one corrects two phrasings in
token-enforcement: not every run reached zero findings (all but two, both
traced to linter bugs fixed the same day), and the usual repair was a new
component variant, with a declared brand token appearing in the worked
example rather than as the common case. The current README of that linter
now lists five models; the technique's "three models" is right for the
pinned commit. Style Dictionary's defaults at `29f1b25` were re-read and
match the node application.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/design-tokens",
  "date": "2026-10-31",
  "baseline": "5a08b4610",
  "digest": "sha256-b2:165125b7a54d0de3",
  "disposition": "clarify",
  "coverage": "All 11 current documents read in full; law anchors and cross-subject links resolve. Primary sources opened for the zero-duration transition rule, ESLint rule-option merging, the linter evaluation cited by token-enforcement, and four Style Dictionary defaults plus the transform-failure fallback. Not evaluated: the private consumer trees behind the three react applications, Style Dictionary line anchors beyond the files re-read, Tailwind's utility emission order.",
  "counterexamples": [
    "A later ESLint config block that sets only a severity string keeps the earlier block's options, so a law carried as rule options survives a severity-only override and is lost only to a block that restates options.",
    "Collapsing a reduced-motion duration to exactly 0s means no transition starts and no transitionend fires; a consumer awaiting that event hangs, which is why near-zero, not zero, is the rule.",
    "A theme product with exactly one binding set has no theme-varying values; readback buys nothing there and generation is the right strategy even for color.",
    "An allow-list gate over an agent-writable vocabulary can end at zero findings with a larger vocabulary than it started with; green says the consumers agree with the vocabulary, not that the vocabulary is right."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/css-transitions-1/",
      "result": "A transition starts only if 'the combined duration is greater than 0s'; 'The transitionend event occurs at the completion of the transition.' Supports motion-tokens' near-zero rule."
    },
    {
      "url": "https://eslint.org/docs/latest/use/configure/rules",
      "result": "'When more than one configuration object specifies the same rule, the rule configuration is merged' with the later object taking precedence; a severity-only later entry keeps earlier options ([\"error\",\"never\"] then \"warn\" gives [\"warn\",\"never\"]); a later entry with options replaces them. Supports token-enforcement's disarm mechanism with one exception it does not state."
    },
    {
      "url": "https://github.com/shadcn-ui/lint/blob/a89d04792f340bcea26af2d539a9eec7285fcc77/docs/evals.md",
      "result": "Three models, one family. 'The count after feedback is zero on all but two, and those two were linter bugs fixed the same day.' 'No model ever used an eslint-disable comment, an inline style, or a <style> element.' 'The fix usually lands where you would want it, as a variant on the component', worked example 'a declared brand token, a brand variant on Button'. Drift: 'The enforced project ends at zero every time, with more variants than it started with'; unenforced 'ends with 18 to 23 findings and a vocabulary that never grew'. Red-team: minting a new theme token escaped; 'a new theme token is on-system by definition'. Refutes 'every run reached zero findings' and 'most common repair was a new brand token plus a new component variant' as worded."
    },
    {
      "url": "https://github.com/style-dictionary/style-dictionary/tree/29f1b25/lib",
      "result": "StyleDictionary.js: default log { warnings: warn, errors: { brokenReferences: throw } }; broken references throw; transform errors throw only when log.warnings === 'error'. fileHeader.js: fileHeaderTimestamp false, header 'Do not edit directly, this file was auto-generated.' transform/token.js: on throw, returns the token's existing attributes/name/value by type. Confirms the node application's central claims."
    }
  ],
  "documents": {
    "design-tokens.md": {
      "disposition": "keep",
      "reason": "Two layers, closed axes, one authority, theming as rebinding, contrast floor in the contract, error-or-ratchet enforcement and token-change-as-migration are coherent with every technique; links resolve."
    },
    "techniques/token-taxonomy.md": {
      "disposition": "clarify",
      "reason": "'A owner-answerable definition' should read 'An owner-answerable definition'. Banked lead (CTI-to-$type migration) remains a lead, not owed text."
    },
    "techniques/theme-architecture.md": {
      "disposition": "keep",
      "reason": "Per-state completeness, pre-paint stamping, stored seed plus algorithm version, derived themes through the same gates; consistent with the golden path."
    },
    "techniques/cross-language-token-parity.md": {
      "disposition": "keep",
      "reason": "Ranking with the two deciding questions (does a binding set rebind it, can the runtime observe the live binding) and set-equality parity hold; the node application confirms strategy 1's guarantees and limits."
    },
    "techniques/token-enforcement.md": {
      "disposition": "clarify",
      "reason": "(1) The linter-evaluation paragraph overstates its source: 'every run reached zero findings' should be all but two (linter bugs fixed the same day), and 'the most common repair was a new brand token plus a new component variant' should be the usual repair was a component variant, a declared brand token appearing in the worked example. (2) 'a later block naming the same rule generally replaces that rule's arguments' should state that this holds when the later block supplies options; a severity-only entry keeps them."
    },
    "techniques/motion-tokens.md": {
      "disposition": "keep",
      "reason": "Zero-duration claim supported by the spec's 'combined duration is greater than 0s' start condition; allow-list polarity for reduced motion is consistent with token-enforcement."
    },
    "techniques/density-and-scale-axes.md": {
      "disposition": "keep",
      "reason": "Disjoint role ownership per axis, the pixel-filter trap and floors bounding axis ranges are sound and match the react theme application's measured specimen."
    },
    "applications/react--theme-architecture.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with react--token-enforcement (same filter, same 0.82 light default, same pre-filter gate blindness). The private tree and its audit documents were not reopened."
    },
    "applications/react--token-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Counts, contrast ratios and the Tailwind emission-order claim rest on a private tree at 62c252dd that was not reopened; emission order not checked against Tailwind's source."
    },
    "applications/react--token-enforcement.md": {
      "disposition": "reverify",
      "reason": "Arithmetic consistent (11 themes x 3 brightness x 2 contrast = 66 configurations; 130/307 = 42.3%). Adoption percentages and line anchors rest on a private tree not reopened."
    },
    "applications/node--cross-language-token-parity.md": {
      "disposition": "keep",
      "reason": "Pinned public source re-read for the load-bearing defaults and the silent transform fallback; all confirmed. Remaining line anchors not exhaustively rerun, so verified_on is unchanged."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied both clarify items the record above named, against `5a08b4610`: one
grammar fix in token-taxonomy and two source-backed corrections in
token-enforcement (the linter evaluation and ESLint's severity-only
exception). The three react applications keep `reverify`, which is now the
overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/design-tokens",
  "date": "2026-10-31",
  "baseline": "5a08b4610",
  "digest": "sha256-b2:0736bafd92a6dca9",
  "disposition": "reverify",
  "coverage": "All 11 current documents decided. The two clarify items owed by the earlier 2026-10-31 record (token-taxonomy, token-enforcement) were applied from sources opened this run and the edited passages re-read. Other documents are byte-unchanged and keep their dispositions. No private tree was reopened and no verification date was refreshed.",
  "counterexamples": [
    "A later ESLint config block that sets only a severity string keeps the earlier block's options, so a law carried as rule options survives a severity-only override and is lost only to a block that restates options.",
    "Collapsing a reduced-motion duration to exactly 0s means no transition starts and no transitionend fires; a consumer awaiting that event hangs, which is why near-zero, not zero, is the rule.",
    "A theme product with exactly one binding set has no theme-varying values; readback buys nothing there and generation is the right strategy even for color.",
    "An allow-list gate over an agent-writable vocabulary can end at zero findings with a larger vocabulary than it started with; green says the consumers agree with the vocabulary, not that the vocabulary is right."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/css-transitions-1/",
      "result": "A transition starts only if 'the combined duration is greater than 0s'; 'The transitionend event occurs at the completion of the transition.' Supports motion-tokens' near-zero rule."
    },
    {
      "url": "https://eslint.org/docs/latest/use/configure/rules",
      "result": "'When more than one configuration object specifies the same rule, the rule configuration is merged' with the later object taking precedence; a severity-only later entry keeps earlier options ([\"error\",\"never\"] then \"warn\" gives [\"warn\",\"never\"]); a later entry with options replaces them. Supports token-enforcement's disarm mechanism with one exception it does not state."
    },
    {
      "url": "https://github.com/shadcn-ui/lint/blob/a89d04792f340bcea26af2d539a9eec7285fcc77/docs/evals.md",
      "result": "Three models, one family. 'The count after feedback is zero on all but two, and those two were linter bugs fixed the same day.' 'No model ever used an eslint-disable comment, an inline style, or a <style> element.' 'The fix usually lands where you would want it, as a variant on the component', worked example 'a declared brand token, a brand variant on Button'. Drift: 'The enforced project ends at zero every time, with more variants than it started with'; unenforced 'ends with 18 to 23 findings and a vocabulary that never grew'. Red-team: minting a new theme token escaped; 'a new theme token is on-system by definition'. Refutes 'every run reached zero findings' and 'most common repair was a new brand token plus a new component variant' as worded."
    },
    {
      "url": "https://github.com/style-dictionary/style-dictionary/tree/29f1b25/lib",
      "result": "StyleDictionary.js: default log { warnings: warn, errors: { brokenReferences: throw } }; broken references throw; transform errors throw only when log.warnings === 'error'. fileHeader.js: fileHeaderTimestamp false, header 'Do not edit directly, this file was auto-generated.' transform/token.js: on throw, returns the token's existing attributes/name/value by type. Confirms the node application's central claims."
    }
  ],
  "documents": {
    "design-tokens.md": {
      "disposition": "keep",
      "reason": "Two layers, closed axes, one authority, theming as rebinding, contrast floor in the contract, error-or-ratchet enforcement and token-change-as-migration are coherent with every technique; links resolve."
    },
    "techniques/token-taxonomy.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'A owner-answerable definition' now reads 'An owner-answerable definition'. Banked CTI-to-$type lead remains a lead."
    },
    "techniques/theme-architecture.md": {
      "disposition": "keep",
      "reason": "Per-state completeness, pre-paint stamping, stored seed plus algorithm version, derived themes through the same gates; consistent with the golden path."
    },
    "techniques/cross-language-token-parity.md": {
      "disposition": "keep",
      "reason": "Ranking with the two deciding questions (does a binding set rebind it, can the runtime observe the live binding) and set-equality parity hold; the node application confirms strategy 1's guarantees and limits."
    },
    "techniques/token-enforcement.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the linter-evaluation paragraph now says every run but two reached zero findings (both linter bugs, fixed the same day) and that the usual repair was a component variant, a declared brand token plus a brand variant in the worked example; the config-block paragraph now scopes replacement to a later block with arguments of its own and notes a severity-only restatement usually keeps them."
    },
    "techniques/motion-tokens.md": {
      "disposition": "keep",
      "reason": "Zero-duration claim supported by the spec's 'combined duration is greater than 0s' start condition; allow-list polarity for reduced motion is consistent with token-enforcement."
    },
    "techniques/density-and-scale-axes.md": {
      "disposition": "keep",
      "reason": "Disjoint role ownership per axis, the pixel-filter trap and floors bounding axis ranges are sound and match the react theme application's measured specimen."
    },
    "applications/react--theme-architecture.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with react--token-enforcement (same filter, same 0.82 light default, same pre-filter gate blindness). The private tree and its audit documents were not reopened."
    },
    "applications/react--token-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Counts, contrast ratios and the Tailwind emission-order claim rest on a private tree at 62c252dd that was not reopened; emission order not checked against Tailwind's source."
    },
    "applications/react--token-enforcement.md": {
      "disposition": "reverify",
      "reason": "Arithmetic consistent (11 themes x 3 brightness x 2 contrast = 66 configurations; 130/307 = 42.3%). Adoption percentages and line anchors rest on a private tree not reopened."
    },
    "applications/node--cross-language-token-parity.md": {
      "disposition": "keep",
      "reason": "Pinned public source re-read for the load-bearing defaults and the silent transform fallback; all confirmed. Remaining line anchors not exhaustively rerun, so verified_on is unchanged."
    }
  }
}
```
