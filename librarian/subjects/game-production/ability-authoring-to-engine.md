---
domain: game-production
subject: ability-authoring-to-engine
last_touched: 2026-09-09
touched_by: architecture-review
dry_streak: 0
---

# ability-authoring-to-engine

## Architecture review - 2026-09-09

Read all ten documents. Corrected tag-set semantics, mapping boundaries,
refinement validation and observed code-generation evidence. All three applications
remain reverify work.

Consumer implementation claims and historical measurements remain reverify work.
The digest binds the reviewed working-tree content, not a new runtime witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/ability-authoring-to-engine",
  "date": "2026-09-09",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:7ca2116a0870c5cc",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read and assessed. Source checks are scoped below. No consumer code, engine run, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "With successful extraction, declared={} and referenced={Ability.Strike} gives overlap zero; the same arrays after parser failure are unmeasured.",
    "A Data Table declaration is invisible to a code-only parser but can be valid in the runtime dictionary.",
    "Separator substitution can conflate a literal underscore with a hierarchy separator and make reverse mapping ambiguous.",
    "A positive destination row count can consist entirely of artifacts predating this run.",
    "A callback can claim buildOk=true while missingTags is nonempty; type validation does not observe a successful build.",
    "Applying a validated patch to a pinned base permits full candidate schema checking; whole-object return does not prevent a stale overwrite."
  ],
  "sources": [
    {
      "url": "https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-tags-in-unreal-engine",
      "scope": "Official current tag declaration methods; no verification of the historical consumer UE version or runtime."
    },
    {
      "url": "https://www.unrealengine.com/tech-blog/using-gameplay-tags-to-label-and-organize-your-content-in-ue4",
      "scope": "Official historical explanation of parent matching versus Exact variants; no consumer implementation check."
    },
    {
      "url": "https://www.rfc-editor.org/rfc/rfc6902",
      "scope": "Patch operations, test and error handling; full candidate validation and concurrency control remain application responsibilities."
    },
    {
      "url": "https://slsa.dev/spec/v1.1/provenance",
      "scope": "Versioned provenance model for build inputs, outputs and builder identity; not a certification of local receipts."
    }
  ],
  "documents": {
    "ability-authoring-to-engine.md": {
      "disposition": "clarify",
      "reason": "Qualify orphan severity, patch transport, value preservation and private immutable provenance."
    },
    "techniques/declared-vs-referenced-tag-audit.md": {
      "disposition": "clarify",
      "reason": "Distinguish observed empty sets from extraction failures, effective registry from code-only declarations and unreferenced from dead tags."
    },
    "techniques/few-shot-reference-plus-tag-registry.md": {
      "disposition": "clarify",
      "reason": "Pin retrieved exemplars, validate registry revisions and remove unsupported few-shot count/effect guarantees."
    },
    "techniques/refinement-mode-minimal-diff.md": {
      "disposition": "clarify",
      "reason": "Permit validated patches, enforce pinned-base concurrency and define semantic minimality and authorized change closure."
    },
    "techniques/server-derived-codegen-report.md": {
      "disposition": "clarify",
      "reason": "Bind trusted receipts to run and expected artifacts; distinguish private provenance, replayability and observer control boundaries."
    },
    "techniques/strict-output-schema-with-derived-dependents.md": {
      "disposition": "clarify",
      "reason": "Distinguish schema requests from enforcement and deterministic derivation from judgment-based estimates."
    },
    "techniques/tag-dialect-normalization.md": {
      "disposition": "clarify",
      "reason": "Guard ambiguous and noninvertible mappings; preserve source spelling and refuse silent convention fallback after parser failure."
    },
    "applications/node--declared-vs-referenced-tag-audit.md": {
      "disposition": "reverify",
      "reason": "Reverify empty-result interpretation, declaration-source coverage and identifier mapping."
    },
    "applications/node--server-derived-codegen-report.md": {
      "disposition": "reverify",
      "reason": "Reverify receipt trust, omitted missing-tag gate, expected artifact identity and zero-as-unknown scaffold."
    },
    "applications/process--few-shot-reference-plus-tag-registry.md": {
      "disposition": "reverify",
      "reason": "Reverify prompt extraction and UE integration; scope house rules and validated-patch alternative."
    }
  }
}
```
