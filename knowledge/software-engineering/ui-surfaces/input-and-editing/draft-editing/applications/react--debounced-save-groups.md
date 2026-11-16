---
layer: application
type: application
subject: draft-editing
technique: debounced-save-groups
stack: react
verified_on: 2026-11-16
verified_against: react@19
---

# Debounced save groups — React persona editor

*Anchors re-resolved at the project tree's HEAD `8d076db46a` on 2026-11-16
(first written 2026-08-18). The race-handling file is byte-stable; the
rest moved, and two claims were brought up to date — the unmount flush and
the drain module's importers.*

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

`useDebouncedSaveGroup.ts` is the whole race-handling story in 60 lines
(unchanged since the first read):

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

Below the group lock, `useDebouncedSave` now serializes its own saves in
schedule order (`hooks/utility/timing/useDebouncedSave.ts:36-53`): unserialized,
"a slow save followed by a fast one landed the OLDER value last (measured
['v2', 'v1'])".

## Flush triggers and failure surfacing

- Entity switch: `usePersonaSwitchGuard.ts:32-62` — `cancelAllDebouncedSaves()`
  then `await saveAllTabs()`; a re-entry ref drops a second click while the
  save runs.
- `saveAll` (`EditorDocument.tsx:140-185`) saves dirty tabs sequentially,
  stops on first failure, and throws `TabSaveError` carrying both
  `failedTabs` and `savedTabs` so the toast reports the exact partial
  state (`usePersonaSwitchGuard.ts:44-53`), and the failed tabs are handed
  to the editor for a Retry affordance (`onSaveFailed`, `:12-15,47`). A
  dirty tab with **no registered save callback throws instead of being
  marked clean** — the comment at `EditorDocument.tsx:153-159` records that
  the previous behaviour "fabricat[ed] an 'all saved' outcome — the user's
  toast was a lie".
- Per-group failure state: `useTabSection` exposes `lastError`; a failed
  save keeps the group dirty (the baseline never advanced) and surfaces
  through `saveError` in the editor header.
- Surface teardown: `useDebouncedSave.ts:94-113` **flushes, not cancels**, a
  pending save on real unmount, from a separate mount-once effect — a
  discrete edit in the last debounce window before the editor closed "was
  otherwise silently lost". Best-effort, as the technique says: the
  component is gone, so a failure reaches the user only as a toast.
- Autosave preconditions as `enabled` guards: `useEditorSave.ts:236,246`
  disables the timer during a pending persona switch, while the name is
  blank, and while the model profile is corrupt (`suppressModelSave`). The
  explicit path refuses the same states by **throwing** rather than
  returning (`performSettingsSave`, `:174-181`), because a resolved save was
  read by `saveAll` as "persisted" and let Save & Switch discard the tab's
  other edits.
- The leave guard keeps its dialog open when the save fails
  (`hooks/utility/interaction/useUnsavedGuard.ts:145-159`): closing it had
  looked exactly like pressing Stay.

## Known gaps (documented, not silently diverged)

- **No window-close drain for the editor.** `useUnsavedGuard`'s
  `beforeunload` (`:75-85`) prompts, it does not save, and the unmount flush
  above does not run on window close (nothing unmounts). Work inside the
  800 ms window at window close is lost — the exact "data loss on a timer"
  case the technique's last-gasp clause exists for (legacy census: zero
  surviving pending writes across six repos). The synchronous drain module
  `src/lib/throttledStorage.ts:25-44` (sync `localStorage` writes on
  `pagehide` + `beforeunload`) is no longer orphaned — three surfaces import
  it now (a rail width, spend alerts, an adoption answer snapshot) — but the
  persona editor is not one of them. Two neighbours in the same tree carry
  the evidence for the technique's amended hook clause: the analytics flush
  and the notepad store both register `pagehide` beside `beforeunload`
  because the desktop webview "tears down on a path where that event does
  not fire" (`src/lib/analytics/index.ts:157-166`,
  `src/features/notepad/notepadStore.ts:855-866`). The editor's save is an
  asynchronous IPC call, so the reachable drain is a synchronous local stash
  of the pending groups on `pagehide`, restored on reopen — not the IPC call
  fired at dismissal.
- Retry is not automatic: a failed group save waits for the next
  keystroke or an explicit flush ("Changes will retry on next edit",
  `useDebouncedSave.ts:122-125`); there is no backoff schedule.
