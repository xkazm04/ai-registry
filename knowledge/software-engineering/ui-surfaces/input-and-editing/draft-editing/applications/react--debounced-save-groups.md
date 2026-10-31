---
layer: application
type: application
subject: draft-editing
technique: debounced-save-groups
stack: react
verified_on: 2026-10-31
verified_against: react@19
---

# Debounced save groups — React persona editor

The persona editor saves two independent groups — the Settings tab
(`SETTINGS_KEYS`) and the Model tab (`MODEL_KEYS`) — through a three-layer
stack: `useDebouncedSaveGroup` (the in-flight lock),
`useTabSection`/`useDebouncedSave` (the 800 ms trailing debounce +
`isSaving`/`lastError`), and `EditorDocument`'s DirtyStore (the registry
that `saveAll`/`cancelAll` flush through).

## The unit: key groups doing double duty

`PersonaDraft.ts:84-104` declares the two key groups and — the detail worth
copying — a compile-time exhaustiveness check: a field added to
`PersonaDraft` but to neither group is a type error, so no field can be
silently invisible to dirty detection and save scheduling. The same
arrays drive `draftChanged` (dirtiness), `pickKeys` (baseline advance),
and the debounce deps (`useEditorSave.ts:233,245`) — one region map, four
consumers, no drift.

## The in-flight lock and the sent-payload comparison

`useDebouncedSaveGroup.ts` is the whole race-handling story in 63 lines:

- **One in-flight save per group** — a second `save()` awaits
  `inFlightRef.current` instead of overlapping (`:37-45`).
- **Race 2 handled exactly per the technique**: `inFlightSnapshotRef`
  (`:34`) stores, synchronously, the draft snapshot handed to the running
  `performSave`; after the await, the short-circuit fires only if the
  *live* draft matches **the snapshot that was persisted** —
  `!draftChanged(draftRef.current, snapshotBefore, keys)` (`:44`). The
  comment records the bug the previous version had: comparing against
  `baselineRef` (updated asynchronously) left a window where keystrokes
  arriving during the await were swallowed as "no changes".
- **Ref-based reads** (`draftRef.current` at `:47`) so the trailing save
  persists the last keystroke, not the one that started the timer.

The value-snapshot precondition is real here: the snapshot is taken by
reference, so this works only because `useEditorDraft`'s `patch` replaces
the draft object on every edit. Mutating `PersonaDraft` in place would
make `:44` compare the live object with itself (executed in the legacy
census, `docs/concepts/golden-paths/debounced-autosave.md` §8 gap 4).

## Flush triggers and failure surfacing

- Entity switch: `usePersonaSwitchGuard.ts:32-62` — `cancelAllDebouncedSaves()`
  then `await saveAllTabs()`, the only entity-switch flush in the app.
- `saveAll` (`EditorDocument.tsx:140-184`) saves dirty tabs sequentially,
  stops on first failure, and throws `TabSaveError` carrying both
  `failedTabs` and `savedTabs` so the toast reports the exact partial
  state (`usePersonaSwitchGuard.ts:40-53`). A dirty tab with **no
  registered save callback throws instead of being marked clean** —
  the comment at `EditorDocument.tsx:153-159` records that the previous
  behaviour "fabricat[ed] an 'all saved' outcome — the user's toast was a
  lie".
- Per-group failure state: `useTabSection` exposes `lastError`; a failed
  save keeps the group dirty (the baseline never advanced) and surfaces
  through `saveError` in the editor header.
- Autosave preconditions as `enabled` guards: `useEditorSave.ts:236,246`
  disables the timer during a pending persona switch and while the model
  profile is corrupt (`suppressModelSave`) — and `performSettingsSave`
  refuses to autosave an empty name (`:162-164`), leaving the tab dirty
  rather than persisting a nameless persona.

## Known gaps (documented, not silently diverged)

- **No window-close drain.** The one synchronous `pagehide`/`beforeunload`
  drain in the tree (`src/lib/throttledStorage.ts:25-44`) has zero
  importers; `useUnsavedGuard`'s `beforeunload` prompts, it does not save.
  Work inside the 800 ms window at window close is lost — the exact
  "data loss on a timer" case the technique's last-gasp clause exists for
  (legacy census: zero surviving pending writes across six repos).
- Retry is not automatic: a failed group save waits for the next
  keystroke or an explicit flush; there is no backoff schedule.

## Re-checked 2026-10-31 at personas@22260d77

- **The empty-name refusal moved and got louder.** The autosave path now
  never fires on a blank name, because the Settings `enabled` gate includes
  `draft.name.trim() !== ''` (`useEditorSave.ts:236`). An explicit save
  *rejects* instead of returning (`performSettingsSave`, `:181`). A resolved
  save was being read by `saveAll` as "persisted", so the tab was marked
  clean. The tab still stays dirty. The difference is that Save & Switch now
  reports the failure. The Model group has the same guard on the
  explicit-save path: `performModelSave` throws while the profile is corrupt
  (`:202-204`).
- **`throttledStorage.ts` is no longer importer-less.** Three production
  modules use it (`useAdoptionAnswerSnapshot.ts`, `spendAlerts.ts`,
  `useRailWidth.ts`), and `notepadStore.ts` has its own `pagehide` /
  `beforeunload` drain (`:858-864`). So neither "the one drain in the tree"
  nor "zero importers" holds now. The persona editor still uses neither, and
  `useUnsavedGuard`'s `beforeunload` (`:75-84`) still prompts rather than
  saves, so the window-close gap for this surface stands.
- `useDebouncedSaveGroup.ts` is unchanged: `:34`, `:37-45`, `:44` and `:47`
  hold.
