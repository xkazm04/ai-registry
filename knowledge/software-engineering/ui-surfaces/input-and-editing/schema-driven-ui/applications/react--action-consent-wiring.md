---
layer: application
type: application
subject: schema-driven-ui
technique: action-consent-wiring
stack: react
verified_on: 2026-11-16
verified_against: react@19
---

# SurfaceSpec actions — one consent hook, two dialogs, and only one shows the target

*Read 2026-11-16 in the personas tree at HEAD `8d076db46a` (2026-11-08),
through `git show`/`git grep` only; `package.json` pins `react ^19.2.6`.
Read, not run: nothing below was clicked.*

SurfaceSpec lets an agent-composed surface **propose** work. The renderer's
header states the rule: "NOTHING auto-runs from a rendered surface … A
surface can propose, only the operator disposes"
(`src/features/shared/components/surface/SurfaceRenderer.tsx:9-12`). All of
the wiring sits in one hook, `useSurfaceActions` (`:66-141`). Both the full
renderer and the markdown directives
(`editors/RichMarkdown.tsx:142`) use it, so a block rendered inside a
document gets the same consent path as one inside a surface.

## What holds

- **Rendering is inert.** An action becomes a `DecisionAction` whose
  `onClick` only stages a pending request (`:88-100`). The only paths from a
  button to work are the two consent surfaces rendered from `consent`
  (`:119-138`, commented "the ONLY paths from a rendered button to work").
- **The action vocabulary is closed and typed.** `kind` is an enum of
  `dispatch` | `execute_persona` (`surfaceSpec.ts:77`), each field is
  capped, and up to three actions ride on a decision item (`:137`).
- **A missing capability disarms the action rather than hiding it.** With
  no `dispatchTarget`, or no persona and no `onExecutePersona` from the host,
  the button renders disabled with "Unavailable here — this view has no
  project or persona to act on." (`SurfaceRenderer.tsx:78-87`;
  `en.json:24083`). The host hands in what the surface may reach
  (`SurfaceRenderContext`, `:37-47`).
- **The dispatch dialog shows the whole payload.** A `dispatch` action opens
  `DispatchChooserModal`, which puts the full prepared prompt in an editable
  textarea before anything runs
  (`shared/dispatch/DispatchChooser.tsx:45-46, 85, 148-152`), and runs the
  edited text, not the spec's.

## Gaps against the standard (found 2026-11-16, reported, standard kept)

- **The run dialog truncates what it asks consent for.** For
  `execute_persona`, the `ConfirmDialog` body interpolates the prompt cut
  to 400 characters plus an ellipsis (`SurfaceRenderer.tsx:126-131`). On
  confirm, `confirmRun` sends the **whole** prompt (`:110`), and the schema
  allows 20,000 characters (`surfaceSpec.ts:79`). A spec can put a harmless
  first 400 characters ahead of the real instruction, and the user approves
  the harmless part. The truncation dates to 2026-07-30 (`9928ebb2e6`).
- **The run dialog does not name the target.** `persona_id` comes from the
  spec and overrides the run's own persona (`surfaceSpec.ts:80-81`,
  `SurfaceRenderer.tsx:77, 105`). The dialog text is
  "“{label}” will start a persona run with this input: {prompt}"
  (`en.json:24085`), with no persona in it. The persona that will act is
  chosen by the spec and never shown.
- **The parameter is an instruction.** Both action kinds carry `prompt`,
  free text handed to an agent (`surfaceSpec.ts:78-79`). The technique keeps
  instructions out of parameter contracts. Here the product's purpose is to
  hand a prepared task to an agent, so the one control left is that the
  consent shows the instruction whole and editable. The dispatch dialog
  does that; the run dialog does not.

Fix shape: render the run confirmation from the resolved action (the target
persona's name and the full prompt, scrollable, ideally editable as in the
chooser), or route `execute_persona` through the same chooser.

## Contrast: the cockpit's actions

The cockpit's widget actions take the other route. Their parameters are
entity ids only (`personaId`, `approvalId`), the kinds are an enum
re-parsed at render and gated per widget kind
(`sub_cockpit/briefing/actionTypes.ts:11-15, 41-90`), with a backend mirror
(`src-tauri/src/companion/brain/briefing.rs:68-72`), and `rerun`/`pause`
ask for confirmation (`actionTypes.ts:30-31`). With no instruction in the
parameters, the label-versus-payload gap has nowhere to open.
