---
subject: public-claim-provenance
domain: software-engineering
last_touched: 2026-08-22
dry_streak: 0
---

# public-claim-provenance

First touch: [[2026-08-22-4]] — the 2026-08-22 harvest wave. Class: NEW.

## State

6 techniques, 2 react applications. Golden path 291 lines, the longest of the wave.

## Open leads (banked, with return conditions)

- **a claim's provenance travels with the claim** (proposed, DECLINED as a law this wave — see Declines). Kept here because the underlying observation is sound and may earn a different expression.
- The forger sharpened the scout's framing: the seed-under-a-live-badge finding is a substitution (a floor), not an addition, so the technique generalised to any operation a reader cannot separate from a derived value.

## Declines

- Declined to widen the `count-carries-predicate` law from counts to claims. The statement change is defensible; the anchor NAME would then be narrower than its scope, and that anchor is cited by 282 files. Renaming a 282-citation anchor is not a wave-end edit. Re-propose as a deliberate, standalone change with the rename planned.

## Architecture review - 2026-10-31

First architecture review, against `dab21ccac`. All 12 documents read in full;
law anchors and sibling-subject links resolve. Three primary sources were opened
for the load-bearing browser/framework claims. The empty-denominator passage
overstates one outcome: a non-numeric inline width is an illegal CSS value the
browser drops, so the fill falls back to whatever width its stylesheet gives it,
which is zero only for some layouts and full for a block-level fill. ARIA's own
answer for "nothing to measure" (omit `aria-valuenow`) strengthens the guard
advice and is not yet cited. One application's preset arithmetic does not add
up. No verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/public-claim-provenance",
  "date": "2026-10-31",
  "baseline": "dab21ccac",
  "digest": "sha256-b2:60eb54ef03f44a69",
  "disposition": "clarify",
  "coverage": "All 12 current documents (golden path, 7 techniques, 4 react applications) read in full. Law anchors in _laws.md and the three sibling-subject links resolve; check-bundles reports integrity OK. Primary sources opened: CSS 2.2 illegal-value handling, WAI-ARIA 1.2 progressbar, the Next.js server/client components guide, React's NaN-attribute behaviour. Not evaluated: the private trees the applications cite (no line anchor re-opened, nothing re-executed). No verification date refreshed.",
  "counterexamples": [
    "A progress fill that is a block-level element with no other width rule renders at FULL width when its inline width is 'NaN%', because the illegal declaration is dropped; the empty-denominator defect then reads as a completed bar, not as zero progress.",
    "React does emit a development-console warning for a NaN attribute value, so 'no signal' holds for production readers but not for a developer watching the console.",
    "A build-time count over a catalog whose entries are added at request time (per-tenant) is a snapshot, not a derivation; the technique already routes this to the runtime rules.",
    "A provenance lint rule satisfied file-wide passes a file whose only SourceNote cites a different figure than the one rendered; the technique states this limit."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/CSS22/syndata.html",
      "result": "Section 4.2: 'User agents must ignore a declaration with an illegal value.' Refutes the unconditional 'collapses to zero width': the fill falls back to its cascaded or auto width."
    },
    {
      "url": "https://www.w3.org/TR/wai-aria-1.2/#progressbar",
      "result": "progressbar: authors set aria-valuenow 'unless the value is indeterminate, in which case the author SHOULD omit the aria-valuenow attribute.' Supports rendering absence rather than a value in the empty case."
    },
    {
      "url": "https://nextjs.org/docs/app/getting-started/server-and-client-components",
      "result": "'if you try to import the module into a Client Component, there will be a build-time error' (server-only), and Server Components passed as children 'are not imported into the Client Component's module graph'. Supports the build-time technique's marker advice and the build-time application's slot fix as framework behaviour."
    },
    {
      "url": "https://github.com/facebook/react/pull/10509",
      "result": "'NaN, Symbols, functions, and objects should be converted to strings, and should warn.' Supports 'receives the garbage verbatim' for aria attributes; qualifies 'no signal' (a dev-only warning exists)."
    }
  ],
  "documents": {
    "public-claim-provenance.md": {
      "disposition": "clarify",
      "reason": "Sound and well-bounded against measurement-honesty, data-viz and maturity-ladders. The empty-denominator paragraph says the visual 'survives' because a zero-width bar looks like zero progress; per CSS 2.2 the illegal width is dropped and the fill takes its stylesheet width, zero or full. Qualify."
    },
    "techniques/derived-numerator-authored-denominator.md": {
      "disposition": "keep",
      "reason": "The per-value sorting question, catalog-of-record rule and forbidden inversion are internally consistent and match the golden path."
    },
    "techniques/no-data-source-labelled-inline.md": {
      "disposition": "keep",
      "reason": "Reason-not-status label, adjacency, and the prose-count exception are clear and falsifiable; no unstable external claim."
    },
    "techniques/build-time-derivation-off-the-client-bundle.md": {
      "disposition": "keep",
      "reason": "The tooling-marker advice matches the Next.js docs (server-only import into a client component is a build-time error). Proxy and cached-file rules hold."
    },
    "techniques/presentation-invariants-on-derived-values.md": {
      "disposition": "clarify",
      "reason": "Three changes: (1) 'a bar of non-numeric width collapses to zero width' is layout-dependent per CSS 2.2; (2) 'no error and no signal' should allow React's dev-only warning; (3) cite ARIA's rule that an indeterminate progressbar omits aria-valuenow as the concrete form of 'render absence'."
    },
    "techniques/promise-only-what-ships.md": {
      "disposition": "keep",
      "reason": "Mechanism-or-delete, human pipelines counting at their real latency, and the negative test are coherent; no external claim to verify."
    },
    "techniques/degraded-never-claims-live.md": {
      "disposition": "keep",
      "reason": "Closed four-state vocabulary derived from fetch outcome, seed-drops-badge, and the no-blend generalisation are consistent with the golden path and the react application."
    },
    "techniques/provenance-as-a-build-gate.md": {
      "disposition": "clarify",
      "reason": "Sound. The cross-subject reference 'quality-gates' treatment of false-positive economics' is unlinked although that technique exists; link it."
    },
    "applications/react--build-time-derivation-off-the-client-bundle.md": {
      "disposition": "reverify",
      "reason": "Framework behaviour (marker fails the build; a slot keeps a server component out of the client graph) confirmed by Next.js docs. The private tree, its probe arms and build outputs were not reopened."
    },
    "applications/react--degraded-never-claims-live.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (three-state vocabulary, partial-as-live and quiet-to-team deviations, floor-as-replacement). Line anchors in the private tree not reopened."
    },
    "applications/react--derived-numerator-authored-denominator.md": {
      "disposition": "clarify",
      "reason": "Deviation 1 says the 15+ sentence claims more than 'the catalog four lines of derivation away in the same file', but the same paragraph places LANGUAGES in i18nStore.ts; the same-file derivation is of phases. Reword. Anchors otherwise not reopened (reverify)."
    },
    "applications/react--provenance-as-a-build-gate.md": {
      "disposition": "clarify",
      "reason": "Preset arithmetic does not add up: recommended is 'five portable rules at error, two ... at warn' and strict 'adds the two doctrine rules', i.e. nine, while the package 'ships eight'. Also the off zone is cited as both ':99-106' and ':99-107'. Which figure is wrong needs the private tree; anchors not reopened."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied five of the six clarify items the record above named, against
`a5a09a30c`. The sources were opened in this run: CSS 2.2, WAI-ARIA 1.2, and
React's NaN-attribute change. The cross-subject link target exists, and the
build-time application's file placement was checked against its own text. The
preset-count item in the build-gate application stays owed: the private tree
would have to say which figure is wrong. Applications keep `reverify`, and no
`verified_on` moved.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/public-claim-provenance",
  "date": "2026-10-31",
  "baseline": "a5a09a30c",
  "digest": "sha256-b2:da096d7120c8e8e6",
  "disposition": "clarify",
  "coverage": "All 12 current documents decided. Four were edited, and their edited passages were re-read: the golden path, presentation-invariants-on-derived-values, provenance-as-a-build-gate and react--derived-numerator-authored-denominator. The other eight are byte-unchanged since the record above and keep its dispositions. No private tree was reopened and no verification date was refreshed.",
  "counterexamples": [
    "A progress fill that is a block-level element with no other width rule renders at FULL width when its inline width is 'NaN%', because the illegal declaration is dropped; the empty-denominator defect then reads as a completed bar, not as zero progress.",
    "React does emit a development-console warning for a NaN attribute value, so 'no signal' holds for production readers but not for a developer watching the console.",
    "A build-time count over a catalog whose entries are added at request time (per-tenant) is a snapshot, not a derivation; the technique already routes this to the runtime rules.",
    "A provenance lint rule satisfied file-wide passes a file whose only SourceNote cites a different figure than the one rendered; the technique states this limit."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/CSS22/syndata.html",
      "result": "Section 4.2: 'User agents must ignore a declaration with an illegal value.' Basis for the width fall-back wording."
    },
    {
      "url": "https://www.w3.org/TR/wai-aria-1.2/#progressbar",
      "result": "'unless the value is indeterminate, in which case the author SHOULD omit the aria-valuenow attribute.' Basis for the added accessibility-semantics sentence."
    },
    {
      "url": "https://github.com/facebook/react/pull/10509",
      "result": "'NaN, Symbols, functions, and objects should be converted to strings, and should warn.' Basis for the dev-console qualification."
    },
    {
      "url": "https://nextjs.org/docs/app/getting-started/server-and-client-components",
      "result": "server-only import into a Client Component is 'a build-time error'; supports the build-time technique and application unchanged."
    }
  ],
  "documents": {
    "public-claim-provenance.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the empty-denominator paragraph now says the browser drops the non-numeric width and the bar falls back to its stylesheet width (zero-looking, or full for a block-level fill); 'no screenshot review will ever catch it' became 'rarely'."
    },
    "techniques/derived-numerator-authored-denominator.md": {
      "disposition": "keep",
      "reason": "The per-value sorting question, catalog-of-record rule and forbidden inversion are internally consistent and match the golden path."
    },
    "techniques/no-data-source-labelled-inline.md": {
      "disposition": "keep",
      "reason": "Reason-not-status label, adjacency, and the prose-count exception are clear and falsifiable; no unstable external claim."
    },
    "techniques/build-time-derivation-off-the-client-bundle.md": {
      "disposition": "keep",
      "reason": "The tooling-marker advice matches the Next.js docs (server-only import into a client component is a build-time error). Proxy and cached-file rules hold."
    },
    "techniques/presentation-invariants-on-derived-values.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'no error and no signal' now allows a development-console warning; 'collapses to zero width' now says the illegal width is ignored and the fill takes its stylesheet width, typically zero, full for a block-level fill; added that an indeterminate progress bar omits its current-value attribute."
    },
    "techniques/promise-only-what-ships.md": {
      "disposition": "keep",
      "reason": "Mechanism-or-delete, human pipelines counting at their real latency, and the negative test are coherent; no external claim to verify."
    },
    "techniques/degraded-never-claims-live.md": {
      "disposition": "keep",
      "reason": "Closed four-state vocabulary derived from fetch outcome, seed-drops-badge, and the no-blend generalisation are consistent with the golden path and the react application."
    },
    "techniques/provenance-as-a-build-gate.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the quality-gates reference now links its false-positive-economics technique."
    },
    "applications/react--build-time-derivation-off-the-client-bundle.md": {
      "disposition": "reverify",
      "reason": "Framework behaviour (marker fails the build; a slot keeps a server component out of the client graph) confirmed by Next.js docs. The private tree, its probe arms and build outputs were not reopened."
    },
    "applications/react--degraded-never-claims-live.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (three-state vocabulary, partial-as-live and quiet-to-team deviations, floor-as-replacement). Line anchors in the private tree not reopened."
    },
    "applications/react--derived-numerator-authored-denominator.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: deviation 1 no longer places the language catalog in the phases file. The private-tree anchors were not reopened, so the document keeps reverify."
    },
    "applications/react--provenance-as-a-build-gate.md": {
      "disposition": "clarify",
      "reason": "Still owed. The preset counts do not add up: recommended has five rules at error and two at warn, and strict adds two, which makes nine, but the package 'ships eight'. The off zone is also cited as both ':99-106' and ':99-107'. Settling either needs the private tree, and its anchors were not reopened."
    }
  }
}
```
