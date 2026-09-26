---
layer: application
type: application
subject: drag-drop
technique: cross-surface-handoff
stack: rust
verified_on: 2026-09-26
verified_against: rust@1.96.1
---

# Cross-surface handoff at the host boundary — Tauri v2's either/or

The two `react` applications describe drops *inside* the page. This one is
about the surface nobody drew on the board: the desktop host the page runs in.
In a Tauri v2 app the operating system hands a drag to the Rust host first, and
one per-window switch decides whether the DOM ever sees it. Pinned versions read
at `900b8f0b4`: `tauri` 2.11.2, `tauri-runtime-wry` 2.11.2, `tauri-utils` 2.9.2,
`wry` 0.55.1, toolchain 1.96.1 (`rust-toolchain.toml`).

## The switch, and its default

`WindowConfig::drag_drop_enabled` defaults to `true`
(`tauri-utils/src/config.rs:1946`, `#[serde(default = "default_true")]`). The
vendor's own doc comment on that field (`:1945`) and on
`WebviewWindowBuilder::disable_drag_drop_handler` (`tauri/src/webview/webview_window.rs:1029`)
say the same thing: *disabling it is required to use HTML5 drag and drop on the
frontend on Windows.* When the flag is on, `tauri-runtime-wry` installs a wry
drag-drop handler (`lib.rs:4861`) and forwards its events as `tauri://drag-drop`
(enter / over / drop / leave, carrying **host paths** and a position).

What the handler does on Windows is the reason the doc comment exists
(`wry/src/webview2/mod.rs:150-157`, `webview2/drag_drop.rs:45-75,159-245`):

- it calls `SetAllowExternalDrop(false)` on the WebView2 controller;
- it walks the WebView2 child windows, `RevokeDragDrop`s the browser's own OLE
  drop target on each, and `RegisterDragDrop`s its own in its place;
- its `DragEnter` only recognizes `CF_HDROP` (files). For anything else it
  returns early, `DragOver` reports no drop effect, and `Drop` forwards nothing
  to the page. Nothing is chained back to the browser's original target.

So on Windows the branch is total, in both directions. With the flag **on**, an
OS file drop reaches Rust as paths and never reaches the DOM as
`dataTransfer.files`, and an in-page drag between two DOM elements has no path
to the page's `dragover`/`drop` at all. With it **off**, the DOM gets
browser-native drops (in-page drags work; OS files arrive as `File` bytes with
no host path) and the Tauri event never fires. No configuration gives a window
both.

## What this tree does with it

`src-tauri/tauri.conf.json` declares one window and does not set
`dragDropEnabled`, so it is `true`. None of the three Rust-built windows
(`commands/infrastructure/auth.rs:444,573`, `browser_bridge/webview/mod.rs:114`)
calls `disable_drag_drop_handler`. The frontend subscribes to
`onDragDropEvent` / `tauri://drag-drop` **zero** times.

The page has ten DOM drop handlers (an eleventh `onDrop=` is a prop that
discards a queued prompt), and they are written for the other branch:

- **Four OS-file zones read `dataTransfer.files`:**
  `shared/components/forms/DesignInput.tsx:155`,
  `templates/sub_n8n/steps/upload/useFileUpload.ts:182`,
  `vault/shared/vector/ingest/IngestDropZone.tsx:52` (which also casts `File` to
  `{ path?: string }`, a v1/Electron API), and the Drive finder's external drop
  (`plugins/drive/finder/useExternalDrop.ts:61`, mounted at `FinderMain.tsx:75`).
  The project's own
  `docs/concepts/golden-paths/filesystem-boundary.md` §I already records these as
  dead on desktop.
- **Six in-page reorder/move surfaces use HTML5 drag with a private MIME:**
  `shared/components/kanban/KanbanBoard.tsx:106,155,206`,
  `fleet/monitor/grid/board/queue/RunwayBoard.tsx:79-92`,
  `plugins/dev-tools/sub_overview/ProjectOverviewPage.tsx:53`, and the Finder's
  `TreeNode`, `TagsSection` and `FinderBreadcrumb`. The project's audit classed
  these as "intra-app, no filesystem trust" and moved on. By the source above,
  they are the half the host setting disables on Windows (and on macOS, below).
  No target's `dragover` runs, so nothing lights, and the drop never comes.
  Which source-side events (`dragstart`, `dragend`) still fire was not observed.

Framer's `Reorder` (`QueueReorderList.tsx`) is pointer-event based and does not
use the HTML5 drag machinery, so it is unaffected by the switch. It is the one
reorder in the tree that survives either branch.

## What the witness is, and is not

This is a **source reading at pinned versions**, not a runtime observation. The
behavior was not driven through a real OS drag on the desktop build. The tree
cannot settle it either way today:

- the repo's drag tests (12 `fireEvent.dragStart` / `fireEvent.drop` lines in
  `KanbanBoard.test.tsx` and `GoalKanban.test.tsx`) dispatch events straight
  into jsdom's DOM. They never cross the host's drop
  target, so they pass under either branch and certify nothing here;
- the `react--drop-affordances` measurement ("measured in Chromium") and the
  2026-09 browser-driven queue fixes ran on the dev server, which is the
  browser-native branch.

A real OS drag on the desktop build is the only instrument that decides this.

## Not only Windows

The doc comment names Windows. The pinned source shows a wider reach:

- **macOS:** wry hands a drag back to WKWebView only when the handler returns
  `false` (`wry/src/wkwebview/drag_drop.rs:45-47,90-92`). Tauri's handler
  returns `true` for every event (`tauri-runtime-wry/src/lib.rs:4894`), so
  in-page drags are swallowed there too. Upstream tracks this as a
  documentation gap (tauri-apps/tauri#14373, open), and the macOS-only
  pass-through fix (tauri-apps/wry#1829) was still unmerged on 2026-09-16.
- **Linux:** the WebKitGTK `drag-motion` handler returns `false`
  (`wry/src/webkitgtk/drag_drop.rs:94-101`), which passes non-file drags through
  to WebKit, so in-page HTML5 drag survives.

A fix that only touches the Windows build is half a fix.

## The decision this tree owes

Choose the branch per window, write it into `tauri.conf.json` **even where it
equals the default**, and serve only that branch:

- **`dragDropEnabled: false`.** Every HTML5 surface above works as written, and
  file zones get bytes. The one zone that ships host paths to Rust
  (`IngestDropZone` → `kbIngestFiles`) must then take bytes, or send the user
  to a file picker for paths.
- **Keep `true`.** File zones subscribe to `getCurrentWebview().onDragDropEvent`
  and treat the absolute paths as caller-supplied (filesystem-boundary step 5).
  Every in-page drag moves off HTML5 to pointer events, the shape `Reorder`
  already uses.

A config assertion (a test that reads `tauri.conf.json` and fails when a
`dataTransfer.files` reader and an enabled host handler coexist) is the cheap
witness. Nothing in the current gates reads this setting.
