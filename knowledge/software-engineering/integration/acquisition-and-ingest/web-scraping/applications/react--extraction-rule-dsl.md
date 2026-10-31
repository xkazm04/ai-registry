---
layer: application
type: application
subject: web-scraping
technique: extraction-rule-dsl
stack: react
verified_on: 2026-10-31
verified_against: react@19
---

# React application: the field-rule DSL held flat, serialized at the edges

**Where:** `src/features/scraper/useScrapeForm.ts` (the form spine), consumed by
`EditorSteps.tsx` / `FieldRuleRows.tsx` (editing), `EditorSteps.tsx:134`
(`fieldsToRuleSet` → preview), and `LlmRuleBuilder.tsx` → `setFieldsFromRuleSet`
(model-generated rules entering the same shape). Wire types come from
`@/api/scraper` (`ScrapeRule`, `ScrapeRuleSet`); the extraction engine is
`pumper_core::extract` behind `src-tauri/engine/src/scraper.rs`.

## The technique, realized

The wire form is a keyed object (`ScrapeRuleSet = { [field]: ScrapeRule }`) with
a per-kind discriminated union. The editor never touches it. Instead
`useScrapeForm.ts:11-23` declares the flat editable row:

```ts
export type RuleType = 'css' | 'regex' | 'json';
export interface RuleField {
  id: string; name: string; type: RuleType;
  selector: string; attr: string; all: boolean;   // css
  pattern: string; group: number;                  // regex
  pointer: string;                                 // json
}
```

Three locator kinds — structural selector (`css`), text pattern (`regex`),
structural pointer (`json`) — exactly the technique's taxonomy, and the kind is
an explicit per-row choice (`type`). The row is deliberately *denormalized*: it
carries every kind's parameters at once, so switching a row's `type` in the
editor loses nothing — a flat-form affordance a wire-shaped union cannot give.

The two edge conversions are single, named functions:

- `fieldsFromRuleSet` (`:51-54`) — wire → flat, on modal open;
- `fieldsToRuleSet` (`:62-68`) — flat → wire, called only by `toInput()` (save)
  and the preview step. `fieldToRule` (`:56-60`) narrows each row back to only
  its kind's parameters.

Everything between the edges — row editing (`updateField` patches by minted row
`id`, `:192-193`), the LLM builder's merge (`:195-202`), the summary chips
(`ruleSummary`, `:109-113`) — operates on `RuleField[]`. One in-memory shape,
serialization at exactly two doors: the technique's core discipline, verbatim,
and the file's own header comment states it as intent ("converted to/from the
wire `ScrapeRuleSet` at the edges").

## Where the application falls short of the technique (registered deviations)

- **No failure semantics.** `RuleField` has no required/optional/default
  member; a missed rule yields an empty value flagged only in the preview UI
  (`PreviewResults.tsx` "no match"). Nothing marks a field load-bearing, so
  the run layer cannot tell collapse from a sparse page — the gap cascades
  into the missing shape-change detection (see the subject's final report;
  run-status honesty is the `config_run` "ok — …" string in
  `src-tauri/engine/src/scraper.rs:637-645`).
- **Silent last-wins on duplicate names.** `fieldsToRuleSet` writes
  `out[f.name.trim()]` per row (`:62-68`); two rows named `price` collapse to
  the later one with no conflict surfaced, and unnamed rows are dropped
  without a trace. The technique wants fail-on-conflict or an explicit
  policy.
- **No validation door on the editor side.** `canSave` (`:154`) checks
  presence (name, dataset, URL, ≥1 named field) but never that a selector
  parses, a regex compiles, or a pointer is well-formed; the first
  syntax check happens in the engine's `rules.compile()` at preview/run
  time. Cardinality (`all`) exists only for the css kind.

Re-checked 2026-10-31 at personas@22260d77: the flat row, both edge
converters and the last-wins write (`:62-68`) are unchanged. Two things
moved around them. `fieldsToRuleSet` now has a third caller,
`previewSignature` (`:76-78`), which serializes the current rows to decide
whether a dry run still matches them; it reads the wire form for
comparison only, so the two-door discipline holds. `canSave` (`:229-230`)
is still a presence check on the editor side, but an enabled scrape now
also needs a dry run that produced a record for exactly the current rules
(`previewProven`). The engine's `rules.compile()` therefore stands between
an armed scrape and save, which narrows the validation-door deviation for
armed scrapes only. A disarmed save still reaches the store with
uncompiled rules. `countProductiveRows` (`:96-106`) counts rows where any
named field matched, which is still not per-field required/optional
semantics, so the failure-semantics deviation stands.

## Transplant note

The pattern (denormalized flat row + two edge converters + minted row ids) is
framework-independent — any form layer can hold `RuleField[]` and any engine
can own the wire union. The part worth copying most is the *denormalized* row:
it is what makes kind-switching lossless in the editor.
