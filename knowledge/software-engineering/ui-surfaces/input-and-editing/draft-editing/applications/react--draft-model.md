---
layer: application
type: application
subject: draft-editing
technique: draft-model
stack: react
verified_on: 2026-10-31
verified_against: react@19
---

# Draft model — React persona editor

The reference manifestation is the persona editor's draft stack:
`src/features/agents/sub_editor/libs/PersonaDraft.ts` (the buffer type and
its field semantics), `hooks/useEditorDraft.ts` (construction, patch door,
lifecycle), and `src/api/agents/personas.ts` (the apply side's operation
union). It is the surface the legacy census called "the only surface in
the repo that gets all five halves right" — and the one that had the
incidents; the fix comments are still in place.

## Construction as explicit projection

`buildDraft(persona)` (`PersonaDraft.ts:119-172`) is the projection
function: it fills defaults (`persona.timeout_ms ?? DEFAULT_PERSONA_TIMEOUT_MS`,
`persona.color || DEFAULT_PERSONA_COLOR`), migrates the storage shape into
the edit shape (the persisted `model_profile` JSON blob is parsed into
flat editable fields — `selectedModel`, `baseUrl`, `promptCachePolicy`),
and returns a flat, scalar `PersonaDraft` deliberately unlike the wire
type. Edit shape ≠ storage shape, held apart on purpose.

The corrupt-source rule is implemented exactly as the technique
prescribes: when `model_profile` fails to parse, `buildDraft` falls back
to defaults for display, and `checkModelProfileIntegrity`
(`PersonaDraft.ts:184-198`) drives `suppressModelSave` in
`useEditorDraft.ts:35-49` — the debounced autosave for `MODEL_KEYS` is
paused so the reset defaults cannot clobber the still-recoverable raw
JSON, and a banner tells the user to re-select a model to unblock. The
warning comment at `PersonaDraft.ts:138-147` names the failure this
prevents.

## Baseline, patch door, identity

`useEditorDraft.ts:19-33` seeds both copies (`useState(() => buildDraft…)`
plus `baseline`) and exposes the single patch door:

```ts
const patch = useCallback((updates: Partial<PersonaDraft>) => {
  setDraft((prev) => ({ ...prev, ...updates }));
}, []);
```

Note it *replaces* the draft object — the value-snapshot precondition the
save-group's in-flight comparison depends on.

The reseed effect (`useEditorDraft.ts:71-92`) is identity-guarded:
`if (selectedPersona.id === prevPersonaIdRef.current) return;`. The
comment documents the incident that earned the guard — the store replaces
the persona object after every autosave round-trip, and an object-keyed
reseed "wiped the undo history (Ctrl+Z dead across autosaves) and
clobbered keystrokes typed since the save snapshot". Switching personas
constructs a fresh draft and clears history; it never rebases the buffer.
Cross-entity bleed is further blocked by `capturePersonaToken` in
`useEditorSave.ts:115-170`, which tags undo entries with the persona id
at capture time and re-checks `isStillCurrent()` after every await.

## Apply as intent-derived diff

Call sites never author payloads. `PersonaOperation`
(`api/agents/personas.ts:349-359`) is a discriminated union of intents —
`UpdateSettings`, `SwitchModel`, … — each carrying only the fields that
intent touches; `operationToPartial` (`:362`) and `buildUpdateInput`
(`:445`) derive the wire payload, and `PersonaUpdatePayload` (`:391-425`)
is the one type in the repo that distinguishes skip-`null` from
clear-`null`. The result, measured by the legacy census: 13 clearable
fields, ~39 call sites, **zero** blank-filled-payload deviations on this
surface — while the surfaces that let call sites build payloads by hand
(credentials, triggers) carried all seven data-loss sites
(`docs/concepts/golden-paths/entity-draft-editing.md` §7).

The clean-marking side lives in `useEditorSave.ts:172-213`: each
`perform*Save` advances the baseline only after the IPC call resolves,
only for its own key group (`pickKeys(d, SETTINGS_KEYS)`), and bails
without touching state if the selected persona changed during the await.

## Known gaps (documented, not silently diverged)

- `draftChanged` (`PersonaDraft.ts:111-117`) compares with `!==` — reference
  equality per key. It is correct only because `PersonaDraft` is flat and
  scalar; that precondition is undocumented at the definition (legacy
  census §8 gap 4).
- Nothing generic exists: `useEditorDraft` is welded to
  `useAgentStore.selectedPersona`, so the other ~18 entity drafts in the
  repo re-derive the pattern by hand — adoption, not invention, is the
  standing failure mode.

## Re-checked 2026-10-31 at personas@22260d77

- **The patch door now clamps.** The quoted line now reads
  `setDraft((prev) => ({ ...prev, ...clampDraftPatch(updates) }))`
  (`useEditorDraft.ts:31-33`). `clampDraftPatch` (`PersonaDraft.ts:41-54`)
  bounds `maxConcurrent` and `timeout` at the one door; see
  [field-defaults-and-bounds](react--field-defaults-and-bounds.md). It still
  *replaces* the draft object, so the value-snapshot precondition holds.
- **The reseed effect also closes the delete-confirm dialog** on a persona
  switch (`useEditorDraft.ts:85-89`), because `handleDelete` resolves its
  target lazily. The identity guard at `:79` is unchanged.
- **Undo is now a persistence round-trip.** The undo entry's `applyState`
  awaits `applyPersonaOp` before it moves the baseline (`useEditorSave.ts:134-161`).
  On failure it rethrows, so the history keeps the entry. The persona-token
  re-check after the await (`:141,:159`) is as described.
- `PersonaUpdatePayload` is now a mapped type over a `PERSONA_NULLABLE_FIELDS`
  list (`Omit<…> & Partial<Pick<…>>`, `:412-425`). The skip-`null` /
  clear-`null` distinction is the same, now stated as key omission.
