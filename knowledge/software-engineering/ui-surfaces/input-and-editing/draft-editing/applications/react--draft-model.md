---
layer: application
type: application
subject: draft-editing
technique: draft-model
stack: react
verified_on: 2026-11-16
verified_against: react@19
---

# Draft model — React persona editor

*Anchors re-resolved at the project tree's HEAD `8d076db46a` on 2026-11-16
(first written 2026-08-18; every line number below moved since, and one claim
was corrected — see "Apply").*

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
(`PersonaDraft.ts:184-197`) drives `suppressModelSave` in
`useEditorDraft.ts:35-49` — the debounced autosave for `MODEL_KEYS` is
paused so the reset defaults cannot clobber the still-recoverable raw
JSON, and a banner tells the user to re-select a model to unblock. The
warning comment at `PersonaDraft.ts:138-147` names the failure this
prevents. Since the first read the guard holds on the explicit path too:
`performModelSave` throws while the flag is set (`useEditorSave.ts:198-204`),
so Save & Switch and the leave guard report the tab as failed instead of
writing the reset profile.

## Baseline, patch door, identity

`useEditorDraft.ts:19-22` seeds both copies (`useState(() => buildDraft…)`
plus `baseline`) and exposes the single patch door (`:31-33`):

```ts
const patch = useCallback((updates: Partial<PersonaDraft>) => {
  setDraft((prev) => ({ ...prev, ...clampDraftPatch(updates) }));
}, []);
```

Note it *replaces* the draft object — the value-snapshot precondition the
save-group's in-flight comparison depends on. The `clampDraftPatch` call
arrived on 2026-08-29 (see `react--field-defaults-and-bounds`): the door
now carries bounds as well as the write, which is the attachment-point
argument of the technique realized one consumer later.

The reseed effect (`useEditorDraft.ts:72-92`) is identity-guarded:
`if (selectedPersona.id === prevPersonaIdRef.current) return;`. The
comment documents the incident that earned the guard — the store replaces
the persona object after every autosave round-trip, and an object-keyed
reseed "wiped the undo history (Ctrl+Z dead across autosaves) and
clobbered keystrokes typed since the save snapshot". Switching personas
constructs a fresh draft and clears history; it never rebases the buffer.
Cross-entity bleed is further blocked by `capturePersonaToken` in
`makeUndoEntry` (`useEditorSave.ts:115-170`), which tags undo entries with
the persona id at capture time and re-checks `isStillCurrent()` after every
await.

## Apply as intent-derived payload — a group, not a field diff

Call sites never author payloads. `PersonaOperation`
(`api/agents/personas.ts:346-356`) is a discriminated union of intents —
`UpdateSettings`, `SwitchModel`, … — each carrying only the fields that
intent touches; `operationToPartial` (`:359`) and `buildUpdateInput`
(`:442`) derive the wire payload, and `PersonaUpdatePayload` (`:420-422`)
is the one type in the repo that distinguishes skip-`null` from
clear-`null` (the comment over `PERSONA_NULLABLE_FIELDS`, `:388-401`,
gives the three meanings of a key on the wire). The census measurement (2026-08-15,
`docs/concepts/golden-paths/entity-draft-editing.md` §7 and its sweep
summary): 13 clearable fields, "~39" call sites, **zero** blank-filled-payload
deviations on this surface — while the surfaces that let call sites build
payloads by hand (credentials, triggers) carried all seven data-loss sites.
Two currency notes on those figures: the nullable list now names 14 fields
(`PERSONA_NULLABLE_FIELDS`, `core_profile` added); and the "~39" is the
census's own number, quoted beside its own count of 40 production call
sites across *all* 13 entity-update functions, so it was not re-counted here
as a like-for-like figure.

**Correction (2026-11-16).** The first version of this note filed the editor
under "sends the diff". It does not, at field grain. `buildSettingsOp`
(`useEditorSave.ts:25-38`) builds `UpdateSettings` with all nine Settings
fields on every save, and `buildModelOp` (`:42-81`) sends the whole model
group the same way. The intent layer keeps *other groups' and other
surfaces'* columns out of the payload — that is what the zero-deviation
figure measures — but within a group the editor sends the group's record,
built from the draft, with no version the server checks. A write to a
Settings field from elsewhere, landing after the draft was built, is
reverted by the next Settings save. The one in-editor writer that could
trip this, the header's enable toggle, patches draft **and** baseline after
its own `ToggleEnabled` lands (`components/PersonaEditorHeader.tsx:93-107`),
so it is not reverted — by convention at that call site, not by
construction. This is the technique's amended clause seen from the other
side: the record is safe only under a precondition the server enforces,
and this one has none.

The clean-marking side lives in `useEditorSave.ts:172-213`: each
`perform*Save` advances the baseline only after the IPC call resolves,
only for its own key group (`pickKeys(d, SETTINGS_KEYS)`), and bails
without touching state if the selected persona changed during the await.
Undo and redo are now persistence round-trips too (`:134-161`): moving the
baseline alone had left the database on the post-save value while the
header read "All saved".

## Known gaps (documented, not silently diverged)

- `draftChanged` (`PersonaDraft.ts:111-117`) compares with `!==` — reference
  equality per key. It is correct only because `PersonaDraft` is flat and
  scalar; that precondition is still undocumented at the definition (legacy
  census §8 gap 4).
- Nothing generic exists: `useEditorDraft` is welded to
  `useAgentStore.selectedPersona`, so the other entity drafts in the repo
  re-derive the pattern by hand (the census counted ~18; not re-counted
  on 2026-11-16) — adoption, not invention, is the standing failure mode.
- No version travels with a save (above), so concurrent change underneath
  the draft is last-write-wins at group grain; the census reports the same
  silence for every entity editor it named.
