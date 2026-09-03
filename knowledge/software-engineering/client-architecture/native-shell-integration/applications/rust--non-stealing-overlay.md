---
layer: application
type: application
subject: native-shell-integration
technique: non-stealing-overlay
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@2021
---

# The dictate pill in Voicebox

Witness: the `voicebox` desktop shell, read at commit
`51f49dea198384b4eb6087b72c17057c6eb1c1cd`. The shell is Tauri 2
(`tauri/src-tauri/Cargo.toml:15`) with `macos-private-api` enabled; the crate
pins no toolchain, so the version witness here is the Cargo edition declared at
`Cargo.toml:8` (`edition = "2021"`). The overlay is a second webview window
labelled `DICTATE_WINDOW_LABEL` — a small transparent "pill" that floats over
whatever application the user is dictating into.

## The show path omits focus, deliberately, in writing

`tauri/src-tauri/src/hotkey_monitor.rs:269-274`, on the chord's
start-recording effect:

```rust
#[cfg(not(target_os = "linux"))]
let _ = window.set_ignore_cursor_events(false);
// Deliberately no set_focus() — taking key focus would yank
// it out of whatever app the user was typing in, which is
// the opposite of what a dictation overlay should do.
let _ = window.show();
```

This is the technique's rule verbatim: the omission is commented at the call
site so the next reader does not restore the convenient show-and-focus. The
same pairing — un-suppress hit testing, position, show, no focus — appears in
`main.rs:117-120` for the agent-initiated path.

## The parked-window case is handled on the show side

`main.rs:99-104` resolves the display before positioning and falls back:

```rust
let monitor = window
    .current_monitor().ok().flatten()
    .or_else(|| window.primary_monitor().ok().flatten());
```

with the reason at `:97-98`: "`current_monitor()` returns None when the window
has been parked off any display by the hide path; fall back to the primary."
`hotkey_monitor.rs:252-256` repeats it. Without the fallback the pill stays at
the parked coordinates and the feature looks dead — the exact interaction the
technique warns the two halves have with each other.

## Teardown is three acts, in the order the technique states

`main.rs:1417-1435`, the `dictate:hide` listener:

```rust
#[cfg(not(target_os = "linux"))]
let _ = window.set_ignore_cursor_events(true);
let _ = window.set_position(PhysicalPosition::new(-10_000, -10_000));
let _ = window.hide();
```

The comment above it (`:1416-1424`) is the incident this technique was written
from: "`hide()` alone has been unreliable for transparent always-on-top windows
on macOS — the NSWindow lingers as an invisible click target that steals focus
to the Voicebox app when the user clicks where it used to be. Park the window
off-screen and mark it click-through as well, so even if `hide()` no-ops the
user sees and interacts with nothing."

Suppress, park, hide — in that order, while the window is still addressable.
Every return value is discarded with `let _ =`, which is consistent with the
technique's framing that these are requests rather than effects; the
correctness argument rests on the layering, not on any one call succeeding.

## The unsafe layer is compiled out, not guarded

The click-through call is excluded on the third platform rather than wrapped,
and both sites carry the reason. `main.rs:113-115`: "Skip on Linux: tao's
`CursorIgnoreEvents` handler unwraps the GdkWindow, which is None until the
window is first shown, aborting the process. The click-through toggle is a
macOS workaround and is never set on Linux." `main.rs:1428-1429` and
`hotkey_monitor.rs:267-268` cross-reference it.

This is the technique's compile-out-versus-guard rule met exactly: the failure
is a process abort, not a returned error, so there is nothing a runtime guard
could observe. The teardown degrades to two of three layers on the platform
that never had the defect.

## One idempotent construction path

`main.rs:75-81` (`ensure_dictate_window`) builds only when absent, and
`show_dictate_window` at `:83-97` builds on demand for the same reason — the
comment at `:85-87` names the two entry points ("the hotkey path is the other
place this window gets built, see `enable_hotkey`"). Startup calls
`ensure_dictate_window` at `:1449` so the window exists before the first event,
and the comment at `main.rs:1412-1415` records why it is safe to build up front:
the hidden pill "does not create the global keyboard tap or trigger the macOS
Input Monitoring prompt" — construction is separated from the act that costs a
permission dialog.

## Giving focus back is verified before the destructive step

`focus_capture.rs:270-302` is the deliberate hand-back, and it is the technique's
verdict rule in code:

```rust
let activated: bool = if can_yield_activation() {
    let current: Id = msg_send![class!(NSRunningApplication), currentApplication];
    if !current.is_null() {
        let _: () = msg_send![current, yieldActivationToApplication: target];
    }
    msg_send![target, activate]
} else {
    msg_send![target, activateWithOptions: 2u64]
};
if !activated { return Err(format!("NSRunningApplication activate returned false for PID {} — the target may have quit mid-transcription, Accessibility is no longer trusted, or the system refused cooperative activation.", pid)); }
```

The doc comment at `:266-269` states the ordering rule: "The BOOL return of
both `activate` and `activateWithOptions:` is now propagated — if the system
refuses activation … the caller aborts before clobbering the clipboard." And
`main.rs:1231-1232` calls `focus_capture::activate_pid(focus.pid)?` **before**
`clipboard::save_clipboard()` at `:1234`, so the abort genuinely precedes the
first destructive act.

`can_yield_activation()` (`:309-324`) probes `respondsToSelector:` once into a
`OnceLock`, with the reason at `:306-308`: the answer cannot change over the
process's lifetime and the probe would otherwise repeat "on every paste". That
is the technique's cached-capability-probe rule.

## Where the tree falls short

**The teardown is triggered from the frontend.** `main.rs:1425-1426` listens
for a `dictate:hide` event the pill webview emits when its animation finishes.
If that webview crashes, hangs, or is reloaded mid-cycle, no `dictate:hide`
arrives and the pill stays shown, click-through-disabled, over the user's work.
The construction site names its reaper only in the happy case; a native-side
watchdog bounded by the longest legitimate pill cycle would close it.
