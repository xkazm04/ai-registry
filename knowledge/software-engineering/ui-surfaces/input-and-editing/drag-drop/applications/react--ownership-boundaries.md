---
layer: application
type: application
subject: drag-drop
technique: ownership-boundaries
stack: react
verified_on: 2026-08-18
---

# Ownership boundaries in React — the KanbanBoard postures

How this repo realizes commit / request / display-only on one board
primitive, and where the realization stops short of the standard.

## Display-only lanes, expressed as data

`src/features/shared/components/kanban/KanbanBoard.tsx` encodes the posture
per column, exactly as the technique prescribes ("the posture is data the
surface consumes"):

```ts
export interface KanbanColumn {
  // ...
  /** Status applied when an item is dropped here. Omit to make the column a
   *  display-only (non-drop) lane. */
  targetStatus?: string;
}
```

A column without `targetStatus` — or a board without `onItemMove` — is a
**display-only lane** (`droppable = !!column.targetStatus && !!onItemMove`,
`KanbanBoard.tsx:131`). The docstring names the intended use: "boards whose
status is owned by a backend orchestrator and only *some* transitions are
user-driven." Mixed boards are the norm, and here they cost a prop, not a
fork of the component.

The affordance side holds up too: `onDragOver` returns early for
non-droppable columns (`:96-97`), so a display-only lane never lights as a
target — non-droppability is legible during the drag, not discovered at
release.

## The drop is a statement about identities

The move callback is `onItemMove?: (itemId: string, targetStatus: string)`
(`:40`) — an id and a vocabulary value. **An index cannot be expressed in
this signature**, which is what makes the board safe over filtered and
concurrently-refreshed item arrays. The drop handler (`:108-123`) re-reads
the id from `e.dataTransfer.getData(dragMimeType)` rather than trusting the
local `draggingId` — the payload authorizes the drop — and bails on a
self-drop by checking the item's current bucket.

Payload typing is per-board: `dragMimeType` defaults to
`'application/x-personas-kanban-id'` (`:60`) and `onDragOver` gates on
`e.dataTransfer.types.includes(dragMimeType)` *before* `preventDefault()`
(`:97-98`), so a card from board A is inert over board B and an OS file is
inert over both.

## Where it stops short: the request posture has no pending state

`KanbanBoard.tsx:122` fires the move as `void onItemMove(id, targetStatus)`
— the promise is discarded. Its consumer (`GoalKanban.handleMove`) catches
a failure into a toast, and the card silently stays in its old lane. Under
the technique's taxonomy this wires a *request*-shaped drop (the status
write can fail; an authority answers) as if it were a *commit*: no pending
treatment while the round trip is in flight, no visible return on
rejection — the "silent snap-back" the technique tells you to kill in
review. The fix direction is mechanical: keep the promise, mark the card
provisional (the `renderCard` contract already receives per-card state) and
resolve it on the authority's answer.

## The backend half of the boundary

The persisted-reorder stack under `src-tauri/db/src/repos/dev_tools.rs`
(`reorder_goals` at `:861` and siblings) shows the authority's door built
without atomicity: N per-row `conn.execute` updates, no transaction — a
mid-loop failure persists a sequence that is neither old nor new (executed
proof and the census rule `unatomic-sequence-rewrite` live in
`docs/concepts/golden-paths/drag-reorder.md` §7-A/§9). The one validation
door is only worth having if what is behind it is atomic; a repo adopting
this application should route sequence rewrites through
`Connection::transaction()` or a fractional rank.

---

# A second React realization — `goat`'s commit-posture grid

*Citations below resolved 2026-08-24 against `goat` (Next.js 16 / React 19 /
`@dnd-kit` 6), a different repository from the board above; the KanbanBoard
citations are unchanged and carry the file's earlier date.*

The board above is a **request**-shaped drop wired as commit. This one is the
opposite starting point: a numbered ranking grid the user owns outright, so the
posture is genuinely **commit** — the drop applies immediately and session
persistence follows behind it. That makes the authority a *client-side*
authority, and the interesting question becomes whether "one validation door"
survives when the door is not a network boundary that forces itself on every
caller. Three things this realization adds to the board above.

## The vocabulary of refusal is enumerated and closed

`src/lib/validation/validation-authority.ts:30-39` declares nine error codes as
a closed union — `SOURCE_NOT_FOUND`, `SOURCE_ALREADY_USED`,
`TARGET_POSITION_INVALID`, `TARGET_POSITION_OCCUPIED`, `TARGET_OUT_OF_BOUNDS`,
`GRID_NOT_INITIALIZED`, `ITEM_LOCKED`, `SAME_POSITION`, `UNKNOWN_ERROR` — and
every refusal the door produces carries one, plus a `debugInfo` payload naming
the values that failed (`:44-53`). `getValidationNotification` (`:474-543`)
maps each code to a title, a sentence the user can act on, and a severity, so
`TARGET_POSITION_OCCUPIED` surfaces as an *info* ("Drop on an empty slot, or
drag directly onto another item to swap") while `SOURCE_NOT_FOUND` surfaces as
an *error*. The codes reach a dedicated store,
`src/stores/validation-notification-store.ts`, which owns the notification list
and the auto-dismiss timers, and the router emits into it on every refusal
(`src/lib/dnd/operations/DragOperationRouter.ts:370-372`).

This is what kills the *silent snap-back* the board above still has: the
refusal is a typed value from the door to the surface, not a caught exception
that becomes a toast at one call site. Where the board discards its promise,
this grid can tell the user which of nine things went wrong.

## The deprecation shim is the migration, made visible

`src/lib/grid/transfer-validator.ts` is what a "one door" refactor looks like
mid-flight in a live codebase: the whole file is a `@deprecated` back-compat
layer (`:1-10`) whose three validation functions now delegate to the authority
(`validateSourceItem` `:68-78`, `validateTargetPosition` `:84-91`,
`validateTransfer` `:97-118`) and whose notification and logging helpers
re-export the authority's (`:128-134`, `:144-149`). Old call sites keep
compiling against the old names while the implementation has already moved,
which is how the door gets to be single before every caller has been rewritten.

The shim also shows the half of that pattern nobody plans for: **retiring it**.
Today it has no consumers at all — `src/lib/grid/index.ts:37-49` re-exports it
and nothing imports those names — so it is deletable, and it has not been
deleted. Meanwhile the old type name survives elsewhere by a different route:
four modules each write `export type { ValidationErrorCode as
TransferValidationErrorCode }` for back-compat (`src/stores/grid-store.ts:46`,
`match-store.ts:16`, `validation-notification-store.ts:25`,
`src/lib/match/orchestrator.ts:26`). A shim with an end date collapses to one
deletion; a shim without one sheds aliases into four other files.

## Lock before validate, not after

`AssignOperation` (`src/lib/dnd/operations/AssignOperation.ts`) closes a race
the pure validate-then-mutate shape leaves open: two rapid drags of one item
both validate against a world where it is unused, and both assign it. The fix
is a module-scope lock set (`:29`) with `acquireItemLock`/`releaseItemLock`
(`:35-48`), acquired **before** the authority is consulted (`:71-78`) and
released on every exit — validation refusal (`:102`), a post-validation missing
item (`:132`), the thrown-error path (`:183`), and success, immediately after
the assign-and-mark pair (`:159-163`). The lock is also fed back *into* the
door: the operation passes `isItemLocked: (id) => itemsBeingAssigned.has(id) &&
id !== source.itemId` (`:96`), so a *different* item's in-flight assignment is
visible to the authority as `ITEM_LOCKED` (`:383-390`) rather than as a
mysterious success.

That ordering is the transplantable part. The technique says the door judges
against current state rather than the gesture's snapshot; a lock taken after
the judgement means the judgement was of a state the second drag was already
changing.

## Where it stops short

- **`validate()` has a side effect, and the contract does not say so.** The
  lock is acquired inside `validate` and released inside `execute`. It holds
  today only because `DragOperationRouter.route` is the single caller and runs
  both synchronously (`:360`, `:385`). The technique's own gesture-time
  courtesy tier is the obvious next caller — a drop affordance asking "would
  this be accepted?" — and that call would latch the lock and then refuse the
  user's real drop.
- **The lock's self-collision reports the wrong code.** A second drag of the
  same item fails `acquireItemLock` and returns `SOURCE_ALREADY_USED`
  (`:72-77`), whose user-facing text is "This item is already on your grid.
  Remove it first to reposition" (`validation-authority.ts:487-492`).
  `ITEM_LOCKED` — "This item is currently being moved. Please wait." — exists
  in the vocabulary for exactly this and is used for the *other*-item case one
  line below. A closed vocabulary mis-mapped at one site is a sentence the user
  reads and acts on wrongly.
- **The door's fallthrough is allow.** `canTransfer` ends with a bare
  `return { isValid: true }` (`:282`) for any source/target combination it does
  not enumerate. The one validation door defaults open.
- **One authority, two operation paths, two lock registries.**
  `src/stores/grid-store.ts:90-109` declares a second `itemsBeingAssigned` set
  with its own `acquireItemLock`/`releaseItemLock`, used by the store's own
  full copy of the assign path (`:580` onward, lock at `:631`, the same
  authority at `:640`). The two sets cannot see each other. That path is
  currently unreachable — nothing calls `handleDragEnd` on the store, and the
  file header still directs readers to `useMatchGridState().handleDragEnd`
  (`:13`), a hook that does not exist — but it is the shape to watch for: the
  validation moved behind one door and the *mutation path the door was
  protecting* was duplicated instead of deleted.
