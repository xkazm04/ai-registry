---
subject: schema-driven-ui
domain: software-engineering
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# schema-driven-ui

## Architecture review - 2026-10-31

First architecture review, against `19d8436ae`. All nine documents read in full; every
relative link resolves. Two internal inconsistencies found in the techniques: the
newer-version rule in node-vocabulary-design says to salvage a spec from a newer
vocabulary, while the envelope pass in spec-validation-and-repair rejects any version it
does not know. The golden path also says an unknown kind "is not rendered", but
node-vocabulary-design permits a per-node placeholder on operator surfaces. Adaptive
Cards takes the opposite position on newer versions: when the card's version is higher
than the client supports, it renders `fallbackText` for the whole card. That supports
scoping salvage to a newer minor version of a known major. Both react applications were
re-checked against the consumer tree at its current HEAD. The spec-validation citations
mostly hold with line drift. The registry-mapping citations are stale: files moved, the
row-span function is gone, and a parity test and per-widget error boundary now exist.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/schema-driven-ui",
  "date": "2026-10-31",
  "baseline": "19d8436ae",
  "digest": "sha256-b2:3a801e8a0fefc717",
  "disposition": "clarify",
  "coverage": "All 9 documents (golden path, 6 techniques, 2 react applications) read in full; relative links to structured-output, hitl-approval, consent-gates and prompt-assembly's capability-documentation resolve. Three primary sources opened. Both applications' citations re-checked by reading the consumer source at its current HEAD; no consumer tests were executed.",
  "counterexamples": [
    "Adaptive Cards renders a card's fallbackText, not a salvage of its known elements, when the card's version is higher than the client supports: a whole-document fallback for a newer version is a legitimate policy when the format does not promise additive-only minors.",
    "Adaptive Cards lets each element declare its own fallback (an alternate element or \"drop\"): an author-declared per-node fallback is a fourth unknown-kind policy beyond the three node-vocabulary-design lists. It is only safe when the fallback itself passes the same closed-vocabulary validation.",
    "Adaptive Cards' refresh runs an Action.Execute automatically when the card is displayed (trigger 'automatic'). Execute-on-display exists in a mainstream format, but it is a read back to the card's own trusted originator that returns a replacement card, not an allowlisted side effect proposed by an untrusted emitter.",
    "A per-collection cap enforced as schema rejection (a table with 201 rows) drops the whole node as one count, so the disclosure says '1 left out' for a table of 201 rows. That is the count-without-predicate failure the technique warns about, produced by a cap that rejects instead of truncating."
  ],
  "sources": [
    {
      "url": "https://learn.microsoft.com/en-us/adaptive-cards/schema-explorer/adaptive-card",
      "result": "version: 'Schema version that this card requires. If a client is lower than this version, the fallbackText will be rendered.' fallbackText: 'Text shown when the client doesn't support the version specified'. Supports the display-channel fallback; refutes newer-version salvage as a universal rule."
    },
    {
      "url": "https://learn.microsoft.com/en-us/adaptive-cards/authoring-cards/universal-action-model",
      "result": "fallback: '<action object>, \"drop\"' - 'Describes what to do when Action.Execute is unsupported'; requires: 'When a feature is missing or of insufficient version, fallback is triggered.' refresh embeds an Action.Execute; the invoke carries trigger 'automatic | manual'. Basis for the per-node-fallback and execute-on-display counterexamples."
    },
    {
      "url": "https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/",
      "result": "'Treat the model as any other user, adopting a zero-trust approach'; 'apply proper input validation on responses coming from the model to backend functions.' Supports the golden path's 'the spec is untrusted input, including your own model's'."
    },
    {
      "source": "Consumer tree (react applications), current HEAD",
      "result": "SurfaceSpec door: parseSurfaceSpec still at surfaceSpec.ts:231-266, slice(0, 12) at :242 and overflow at :247; disclosure moved to SurfaceRenderer.tsx:162-166, re-exports to :352-353; the corrupt-spec error state moved to panel/useCockpitSource.ts:112-121 and :161-162. tableBlockSchema rows .max(200) rejects the whole block. Cockpit: CockpitWidgetCell moved to panel/CockpitGrid.tsx:32-48 inside a per-widget WidgetBoundary; cockpitRowSpan replaced by WIDGET_DEFAULT_SPAN column defaults (widgetRegistry.ts:79-93); registry at :96; parseWidgetActions moved to briefing/actionTypes.ts:36 and silently drops invalid actions; widgetKindParity.test.ts (2026-10-19) checks five emitter-side kind lists against the registry in one direction; compose_cockpit in dispatcher/dispatch.rs:968-988 still validates no kinds, while explain_in_cockpit drops unknown kinds with a warning (:1020)."
    }
  ],
  "documents": {
    "schema-driven-ui.md": {
      "disposition": "clarify",
      "reason": "'A kind the renderer does not know is not rendered' contradicts node-vocabulary-design's permitted per-node placeholder on operator surfaces. Should say it is never rendered as content."
    },
    "techniques/node-vocabulary-design.md": {
      "disposition": "clarify",
      "reason": "The newer-version rule (salvage as unknown kinds) conflicts with spec-validation-and-repair's envelope rejection of unknown versions, and Adaptive Cards shows whole-document fallback is the other legitimate policy. Scope salvage to a newer minor of a known major; an unknown major fails the envelope and falls back to the display channel."
    },
    "techniques/registry-mapping.md": {
      "disposition": "keep",
      "reason": "Registration shape, lookup dispatch, per-node containment and one-edit-site growth are coherent and consistent with the vocabulary and repair techniques."
    },
    "techniques/spec-validation-and-repair.md": {
      "disposition": "clarify",
      "reason": "Envelope pass says 'version present and known (or downlevelable)', which reads as rejecting a newer minor that node-vocabulary-design says to salvage. Align it to 'a major version the renderer knows'."
    },
    "techniques/action-consent-wiring.md": {
      "disposition": "keep",
      "reason": "References-not-code, disarm-by-default and consent derived from the resolved action hold. Adaptive Cards' automatic refresh is recorded as a counterexample in scope: a trusted-originator read, not an untrusted proposal."
    },
    "techniques/host-capability-injection.md": {
      "disposition": "keep",
      "reason": "Store-free renderer, capabilities as a closed vocabulary, per-node degradation and disposal at the interface are coherent; the consumer's pure surfaceSpec module is consistent with it."
    },
    "techniques/emitter-registry-sync.md": {
      "disposition": "keep",
      "reason": "Derived emitter docs, dispatch-time validation through the same door, and compare-and-swap with id-preserving recomposition are sound; the consumer's explain-versus-compose split is exactly the dispatch-validation contrast it describes."
    },
    "applications/react--registry-mapping.md": {
      "disposition": "clarify",
      "reason": "Citations are stale against current HEAD: CockpitWidgetCell moved to panel/CockpitGrid.tsx, cockpitRowSpan no longer exists (WIDGET_DEFAULT_SPAN column defaults), parseWidgetActions moved, dispatcher.rs became dispatcher/dispatch.rs, SurfaceRenderer lines drifted. Missing: the per-widget WidgetBoundary (per-node containment now holds), the one-direction widgetKindParity test (qualifies the hand-synced gap), and parseWidgetActions' silent drop of invalid actions (a new gap against disarm-by-default)."
    },
    "applications/react--spec-validation-and-repair.md": {
      "disposition": "clarify",
      "reason": "surfaceSpec.ts citations hold. SurfaceRenderer disclosure and re-export lines drifted, and the corrupt-spec error state moved from CockpitPanel.tsx to panel/useCockpitSource.ts. Missing gap: the 200-row table cap rejects the whole block, so one drop count stands for an entire table."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied all five clarify items from the record above. The two technique edits are
internal-consistency fixes. Salvage now applies to a newer minor of a known major; an
unknown major fails the envelope and falls back to the display channel. Both
applications were re-pointed at the consumer source as read this run, and their
`verified_on` moved to 2026-10-31. Two new gaps were recorded without re-registering
them in the consumer: silent action drops and a row cap that rejects. Nothing was
executed in the consumer tree.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/schema-driven-ui",
  "date": "2026-10-31",
  "baseline": "19d8436ae",
  "digest": "sha256-b2:8b4c6ad0c4b2a3db",
  "disposition": "keep",
  "coverage": "All 9 documents decided. The five clarify items of the earlier 2026-10-31 record were applied and the edited passages re-read; the four keep documents are byte-unchanged. Application citations were re-checked line by line against the consumer source at its current HEAD; no consumer tests or runtime were executed.",
  "counterexamples": [
    "Adaptive Cards renders a card's fallbackText, not a salvage of its known elements, when the card's version is higher than the client supports: a whole-document fallback for a newer version is a legitimate policy when the format does not promise additive-only minors.",
    "Adaptive Cards lets each element declare its own fallback (an alternate element or \"drop\"): an author-declared per-node fallback is a fourth unknown-kind policy beyond the three node-vocabulary-design lists. It is only safe when the fallback itself passes the same closed-vocabulary validation.",
    "Adaptive Cards' refresh runs an Action.Execute automatically when the card is displayed (trigger 'automatic'). Execute-on-display exists in a mainstream format, but it is a read back to the card's own trusted originator that returns a replacement card, not an allowlisted side effect proposed by an untrusted emitter.",
    "A per-collection cap enforced as schema rejection (a table with 201 rows) drops the whole node as one count, so the disclosure says '1 left out' for a table of 201 rows."
  ],
  "sources": [
    {
      "url": "https://learn.microsoft.com/en-us/adaptive-cards/schema-explorer/adaptive-card",
      "result": "version: 'If a client is lower than this version, the fallbackText will be rendered.' Basis for scoping newer-version salvage to a newer minor of a known major."
    },
    {
      "url": "https://learn.microsoft.com/en-us/adaptive-cards/authoring-cards/universal-action-model",
      "result": "Per-element fallback ('<action object>, \"drop\"'), requires-triggered fallback, and refresh with trigger 'automatic | manual'. Counterexamples only; no document edit relies on it."
    },
    {
      "url": "https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/",
      "result": "'Treat the model as any other user, adopting a zero-trust approach.' Supports the golden path's trust posture; unchanged."
    },
    {
      "source": "Consumer tree (react applications), current HEAD",
      "result": "Every citation in both applications re-read this run; paths and line ranges now match the source as read. See the earlier 2026-10-31 record for the specific moves."
    }
  ],
  "documents": {
    "schema-driven-ui.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'is not rendered' now reads 'is never rendered as content', consistent with the operator-surface placeholder that node-vocabulary-design permits."
    },
    "techniques/node-vocabulary-design.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: newer-version salvage scoped to a newer minor of a known major (safe because minors are additive); an unknown major fails the envelope and falls back to the display channel."
    },
    "techniques/registry-mapping.md": {
      "disposition": "keep",
      "reason": "Registration shape, lookup dispatch, per-node containment and one-edit-site growth are coherent and consistent with the vocabulary and repair techniques."
    },
    "techniques/spec-validation-and-repair.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the envelope pass now asks for a major the renderer knows or can downlevel, and says a newer minor passes with its unknown kinds dropped per node."
    },
    "techniques/action-consent-wiring.md": {
      "disposition": "keep",
      "reason": "References-not-code, disarm-by-default and consent derived from the resolved action hold. Adaptive Cards' automatic refresh is recorded as a counterexample in scope: a trusted-originator read, not an untrusted proposal."
    },
    "techniques/host-capability-injection.md": {
      "disposition": "keep",
      "reason": "Store-free renderer, capabilities as a closed vocabulary, per-node degradation and disposal at the interface are coherent; the consumer's pure surfaceSpec module is consistent with it."
    },
    "techniques/emitter-registry-sync.md": {
      "disposition": "keep",
      "reason": "Derived emitter docs, dispatch-time validation through the same door, and compare-and-swap with id-preserving recomposition are sound; the consumer's explain-versus-compose split is exactly the dispatch-validation contrast it describes."
    },
    "applications/react--registry-mapping.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: citations re-pointed (registry :96-204, 30 kinds; WIDGET_DEFAULT_SPAN replaces cockpitRowSpan; CockpitWidgetCell in panel/CockpitGrid.tsx:32-48; parseWidgetActions in briefing/actionTypes.ts; dispatcher/dispatch.rs:968-988 and :1020; SurfaceRenderer :193-306 and :300-305); added the per-widget WidgetBoundary, the one-direction widgetKindParity test qualifying the hand-synced gap, and the silent action drop as a new gap; verified_on 2026-10-31."
    },
    "applications/react--spec-validation-and-repair.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: SurfaceRenderer disclosure :162-166 and re-exports :352-353; corrupt-spec error state cited at panel/useCockpitSource.ts:112-121 and :161-162; added the 200-row cap that rejects a whole table as a gap; verified_on 2026-10-31."
    }
  }
}
```
