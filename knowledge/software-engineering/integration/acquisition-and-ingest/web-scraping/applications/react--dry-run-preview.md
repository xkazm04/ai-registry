---
layer: application
type: application
subject: web-scraping
technique: dry-run-preview
stack: react
verified_on: 2026-10-31
verified_against: react@19
---

# React application: the wizard's Preview step

**Where:** `src/features/scraper/ScrapeEditorWizard.tsx` (the five-step rail:
Source → Extract → Preview → Output → Schedule), `EditorSteps.tsx:122-189`
(`PreviewStep`), `PreviewResults.tsx` (rendering), backed by
`scraper_preview_extract` (`src-tauri/src/commands/infrastructure/scraper.rs:128-163`)
→ `preview_extract` (`src-tauri/engine/src/scraper.rs:328-361`).

## The technique, realized

The four load-bearing properties of a dry run, checked against this code:

- **Live page** — `preview_extract` fetches now, HTTP tier, no cache; the UI
  says exactly what it will do: "Fetches {url} and runs your rules. Nothing
  is saved." (`preview_hint`, `src/i18n/locales/en.json:20426`, rendered at
  `EditorSteps.tsx:152`).
- **Edited rules** — `PreviewStep` serializes the *current form state*
  (`fieldsToRuleSet(form.fields)`, `:134`), not the saved config; the flat
  editable form pays off precisely here.
- **Production engine** — the strongest part of this application.
  `preview_extract` and `run_extract` share the identical
  `rules.compile()` + `extract_one` + `fetcher()` path in the same engine
  module across the IPC boundary; the previewer is not an editor-side
  approximation. Gate-sees-target holds at the engine level.
- **No writes** — `preview_extract` never touches `scraper_records`, run
  stamps, or `next_run_at`; the command doc comment states it ("no dataset
  write, no persona").

`PreviewResults.tsx` renders per-field verdicts — each expected field name with
its pulled value, empties flagged "no match" with a warning glyph — plus a
fetched-bytes readout ("· 214 KB fetched"), which is a miniature
collapse-vs-outage discriminator: 0 KB is a fetch problem, 200 KB with all "no
match" is a rules problem. The same component serves the Control Room row test,
so the subject's "one previewer, several surfaces" holds.

## Where the application falls short of the technique (registered deviations)

The registered anchor is **`w3-wizard-flows`** in
the consumer's deviation register:5182`:

- **The gate is advisory, not structural.** `stepComplete(form, 'preview')`
  returns `true` unconditionally — the source's own comment says `// optional
  dry-run` (`EditorSteps.tsx:46`) — and `canSave` (`useScrapeForm.ts:154`)
  never consults preview state. The rail buttons (`ScrapeEditorWizard.tsx:46`)
  and Next (`:103`) jump anywhere unguarded; save is reachable with rules that
  have never been executed against any page ("saved only by the modal's
  terminal re-check", which re-checks *presence*, not verification —
  `ScrapeEditorModal.tsx:28`). The technique's "gate is structural" section
  describes exactly the missing arm: disable save until a dry run of the
  current edit state succeeds, re-disarm on rule edits, or persist as
  save-as-disabled.
- **No preview-vs-saved delta.** Editing an existing scrape previews only the
  edited rules; there is no "fields gained/lost" summary against the saved
  set.
- **First-URL only by default** (`max_urls` defaults to 1,
  `scraper.rs:153`) — reasonable politeness, but multi-URL configs get no
  signal that rule assumptions hold beyond URL #1, and the UI does not say
  which URLs went unprobed.
- **No preview-derived baseline.** Per-field hit results are rendered and
  discarded; nothing seeds the expected-hit baseline that shape-change
  detection would compare future harvests against (that detection layer does
  not exist yet — see the subject report).

Re-checked 2026-10-31 at personas@22260d77: **the first deviation is
resolved; the gate is now structural for an armed scrape.** The
`EditorSteps.tsx:46` and `useScrapeForm.ts:154` citations above describe
the tree as of 2026-08-18. Today `stepComplete(form, 'preview')` returns
`form.previewProven` (`EditorSteps.tsx:46-49`), and `canSave` is
`fieldsComplete && (!enabled || previewProven)` (`useScrapeForm.ts:229-230`).
`previewProven` holds only when a stamp's `previewSignature` (the URL list
plus the serialized rule set, `:76-78`) equals the current one, so any rule
or URL edit disarms it and shows a stale warning (`EditorSteps.tsx:159-167`).
A dry run that extracted nothing does not stamp (`countProductiveRows`,
`useScrapeForm.ts:96-106`, `:206-213`), and a disarmed scrape may always be
saved. That is all three arms the technique names: disable save until a dry
run of the current edit succeeds, re-disarm on rule edits, and allow save
as disabled. The rail and Next still navigate freely, which no longer
matters because save is the gate. The other three deviations still hold:
there is no preview-vs-saved delta, preview still probes one URL (the step
passes `1`, `EditorSteps.tsx:134`), and the productive-row count gates save
but seeds no stored baseline.

## Transplant note

The transplantable spine is the *pairing*: one engine function with a
side-effect-free twin (`run_extract` / `preview_extract`) plus a UI step that
serializes current-edit state into the twin. Any stack can copy that; the
discipline to carry over is refusing a separate "editor evaluator".
