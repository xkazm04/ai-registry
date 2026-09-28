---
subject: drag-drop
domain: software-engineering
last_touched: 2026-09-26
dry_streak: 0
---

# drag-drop

First subject note, written by `/deepen` run dp-dnd-0926. The Curator lane dispatched
this single-subject run on the scan finding "single stack (react)". Registry HEAD at
dispatch was 55c6bce2, but the primary checkout's main was 91 commits behind origin. The
run therefore worked from origin/main in a detached worktree. The consumer trees were read
at personas 900b8f0b4 and goat 4d33ac2. Host crates were read at the versions personas
pins, from the local cargo registry: tauri 2.11.2, tauri-runtime-wry 2.11.2, tauri-utils
2.9.2 and wry 0.55.1.

## 2026-09-26 - the host boundary, a false keyboard affordance, four absolutes conditioned

**Single stack cleared.** The second stack is `rust`, and it is not a transplant. The
decision it records lives in the desktop host, below the page both `react` applications
describe. Scan points 5 -> 3; "never swept" is what remains.

**Depth rung:** L2 primary. Everything rests on source read at a pin: the host crates,
the drag library installed in goat, and the two trees. Nothing was observed at runtime.
The one runtime instrument that decides the headline claim, a real OS drag on the desktop
build, was not available to an unattended session. The applications say so.

**Lanes:**
- Primary source at the pin (this session).
- Counter-evidence (web, unconstrained, a subagent).
- Training-data-only (blind, a subagent, no tools).
- Tree reads of personas and goat.

**Landed** in 3052f94c (content), bc65ad7b (generated) and 8f32ef10 (verdicts, plus the
condition the simulation earned):
- NEW `rust--cross-surface-handoff` (personas). The host's drag-drop switch defaults on.
  On Windows it revokes the browser's drop target and installs a files-only one. On macOS
  its handler never hands a drag back to the web view. Linux passes non-file drags
  through. The tree's four file zones read the DOM file list, which the active branch
  never fills. Its six in-page reorder surfaces use HTML5 drag, which the same branch
  swallows on Windows and macOS. The project's own filesystem audit had found the first
  half and classed the second as harmless.
- NEW `react--keyboard-alternatives` (goat, the subject's first second-tree
  application). The dnd-kit items carry the library's button role, tab stop and
  instructions. No context registers a keyboard sensor, so every item is the false
  affordance the technique bans. The one surface that wrote its own instructions resolves
  drops by pointer containment, so adding the sensor alone would not fix it.
- **Flipped (three lanes converged):** `cross-surface-handoff` gains "the host is a
  surface too". The golden path's Crossing surfaces section carries it.
- **Refuted (counter lane, primary spec):** the grab and drop-effect attributes the
  technique implied have been deprecated since ARIA 1.1, with no replacement. The grab
  state is now carried as the grab control's pressed state, the shape the installed
  library ships.
- **Conditioned:**
  - A single-pointer path is owed alongside the keyboard (SC 2.5.7), with its two
    exemptions.
  - Its own simulation then came back `not-better`, which added "judge the operation,
    not the surface".
  - The keyboard claim is now "no browser" entry point; a screen reader's own drag
    commands are the exception.
  - Copy is the cross-boundary default, and link is only a modifier. No source backs link
    as a default.
- **Verified and left untouched:** the native HTML5 machinery has no browser keyboard
  entry point (the counter lane found the long-open browser bug and no implementation).
  Move within a container and copy across one is the platform convention (Apple HIG;
  Windows Explorer by volume).

**Impact:** 0 stale verdicts. The subject joins 12 contexts in 4 projects, all unjudged:
goat 8, kp 2, personas 1, athena-everywhere 1. Map rebuilds: goat, kp and
athena-everywhere were written. personas' map was already dirty from another session and
was left alone, so its rebuild is owed.

**Declined:**
- "dragstart and dragend still fire under the Windows handler": it follows from the
  mechanism, but no source observed it. The application says "not observed".
- Electron's path bridge on a recent macOS reportedly returns empty paths: one issue
  report, no fleet tree ships Electron. Not landed.

## Leads (banked, with return conditions)

- **The runtime witness for the host claim.** Drive a real OS drag on the personas
  Windows desktop build: one board card, one file onto the ingest zone. Return: a
  session that can drive OS input with the operator's consent. Until then, both host
  verdicts are simulations.
- **personas owes a branch decision.** Either set `dragDropEnabled: false` or keep it on
  and move the in-page drags to pointer events plus the host's drop event. This is a
  product decision about host paths versus bytes, not a registry edit. Return: the
  operator picks a branch, or someone reports a dead board.
- **goat's keyboard path.** Register a keyboard sensor on the two list surfaces that
  resolve by nearest center. The match grid needs a collision strategy that serves both
  inputs first. Return: a goat session touching the drag surfaces. Whether goat has any
  single-pointer non-drag route was not established.
- **Upstream watch:** the macOS pass-through fix in the webview crate was unmerged on
  2026-09-16. When it merges, the macOS clause in the rust application needs a version
  condition.
