---
layer: application
type: application
subject: schema-driven-ui
technique: spec-validation-and-repair
stack: react
verified_on: 2026-11-16
verified_against: react@19
---

# SurfaceSpec — the repo's validation door, with honest repair

*Re-resolved 2026-11-16 against the personas tree at HEAD `8d076db46a`
(2026-11-08), read through `git show`/`git grep` only; `package.json` pins
`react ^19.2.6` and `zod ^4.3.6`. `surfaceSpec.ts` has not changed since
this was forged on 2026-08-18, so every anchor into it still holds; the
renderer's anchors moved, and a second entry to the door landed on
2026-09-22.*

The SurfaceSpec pipeline is the repo's cleanest realization of the technique:
`src/features/shared/components/surface/surfaceSpec.ts` (a deliberately pure
module — "no React, no store, no IPC", `:11`) is the door, and
`SurfaceRenderer.tsx` renders whatever survives, plus the disclosure.

## The door

`parseSurfaceSpec` (`surfaceSpec.ts:231-266`) is the whole pass:

1. **Strict parse first** — `surfaceSpecSchema.safeParse` (`:232-233`); a clean
   spec exits with `dropped: 0`.
2. **Envelope check** — `looksLikeSpec` (`:214-222`) requires the version
   marker (`surface: "v1"`, `SURFACE_VERSION` at `:189` — the version literal
   doubles as the detection marker) plus a `blocks` array. No envelope →
   `{ ok: false, error: 'not a v1 surface envelope' }`, and callers fall back
   to the ordinary markdown/JSON views (SPEC.md "Where it lands") — invalid is
   never rendered as empty.
3. **Per-node salvage** — each block re-parsed individually against the
   discriminated union (`surfaceBlockSchema`, `:171-179`); valid blocks are
   kept, each failure increments `dropped` (`:242-246`). A hallucinated block
   type never takes down an otherwise sound surface.
4. **Caps counted into the ledger** — the 12-block cap is enforced by
   `slice(0, 12)` and the overflow is *added to `dropped`*
   (`:242`, `:247`), so truncation is disclosed like invalidity (but see the
   first gap: it is also *labelled* as invalidity).
5. **Minimal-drop retry** — a bad `title`/`summary` retries with them
   stripped rather than failing the envelope (`:259-264`).
6. **Nothing survived** → `{ ok: false, error: 'no valid blocks survived
   repair' }` (`:249-251`) — failure spelled as failure, distinct from a
   valid-but-empty document (which the schema forbids anyway, `min(1)` at
   `:195`).

## The normalization tier, per field

The schema builders at `:32-57` are the "forgiving in, bounded out" tier:
`text(max)` coerces numbers/booleans to strings, refuses empty, and truncates
at the cap; `optionalText` folds null/absent/blank into one "not given";
`percent` coerces numeric strings and **clamps to 0–100 instead of
rejecting** (`:52-55`). Every cap is declared next to the field (`label:
text(40)`, `rows ≤ 200`, `blocks ≤ 12`) — deterministic transforms toward the
contract, never guesses. There is no misspelled-kind correction anywhere.

## The disclosure

`SurfaceRenderer` receives `dropped` and renders the line only when nonzero
(`SurfaceRenderer.tsx:162-166`; it was `:122-126`): a calm caption
(`data-testid="surface-dropped-note"`) from the translated `dropped_blocks`
key with the count interpolated. The English string reads "{count} invalid
block(s) were left out of this surface." (`src/i18n/locales/en.json:24082`,
unchanged since 2026-07-30; the 2026-08-18 text paraphrased it as "N blocks
left out"). The prop is documented as "Blocks removed by the repair pass —
surfaced honestly, never hidden" (`:51`).

## A second entry to the same schema

Since 2026-09-22 (`0d8b788c2b`), authored markdown can carry SurfaceSpec
blocks as directives (`:::stats`, `:::table`, `::gauge`, …).
`editors/richBlocks.ts:37-43` validates each tag body with the **same**
`surfaceBlockSchema`, and `editors/RichMarkdown.tsx` renders it through the
exported `SurfaceBlockView` and the shared consent hook (`:142`), so the
vocabulary and its contracts cannot fork. Its repair policy is different,
and deliberately so: "Nothing is dropped. An unknown tag, or a block whose
body fails its schema, is shown as written with the reason beside it"
(`RichMarkdown.tsx:12-13`, `Unreadable` at `:55-61`). In a document a person
or agent wrote, the source is the content, so showing it with the reason is
the honest drop. It also means the door is now the block schema, with two
entry functions. The 12-block cap and the `dropped` count belong only to
`parseSurfaceSpec`.

## Where the door sits relative to structured-output

`extractSurfaceSpec` (`surfaceSpec.ts:299-324`) is the upstream extraction
half — finding the candidate inside raw execution output (whole JSON,
embedded `surface` key, or one NDJSON line) — which is structured-output's
territory; it funnels every candidate through the same `parseSurfaceSpec`
door. The two exports are re-exported as the single import site at
`SurfaceRenderer.tsx:352`.

## Gaps against the standard (reported, standard kept)

- **The count does not carry its predicate** (found 2026-11-16). `dropped`
  adds the blocks past the cap (`surfaceSpec.ts:247`) to the blocks that
  failed their schema, and the line calls all of them "invalid". A
  15-block spec of valid blocks tells the user that 3 invalid blocks were
  left out. Either the line says "left out" with no reason, or the ledger
  keeps the two reasons apart.
- **The ledger is a count, not a ledger.** `dropped` is an integer; no
  per-drop reason, node identity, or kind is recorded, and nothing feeds
  telemetry — so the emitter-improvement loop the technique describes has no
  data here. The type comment even calls these blocks "silently removed"
  (`surfaceSpec.ts:208`), against the renderer's "never hidden".
- **The `markdown` block is a sub-language with request-on-render.** It
  renders through `MarkdownRenderer`, whose `img` override passes any `src`
  through (`editors/MarkdownRenderer.tsx:350`); links do go through
  `sanitizeExternalUrl` (`:340-343`). The module header's "injection-free by
  construction" (`surfaceSpec.ts:8-9`) holds for markup but not for fetches:
  an emitted image URL is requested at render. On the desktop build, the
  webview CSP's `img-src` allowlist (`src-tauri/tauri.conf.json:43`) blocks
  outside origins, so the host policy is the only net. That allowlist admits
  `http://127.0.0.1:*`, so an image can still make a GET request to any
  local port.
- **The cockpit sibling has no door at dispatch.** The other spec pipeline
  (`compose_cockpit` → the cockpit grid) stores widget specs without
  validating kinds at dispatch (`src-tauri/src/companion/dispatcher/dispatch.rs:968-989`)
  — registered under the `w4-prompt-assembly` deferred-fix anchor. The
  render side still keeps a corrupt persisted spec apart from a
  never-composed one (`sub_cockpit/panel/useCockpitSource.ts:112-121,161-162`:
  a parse failure is the error phase, never the empty CTA). That half of the
  discipline holds alone.
