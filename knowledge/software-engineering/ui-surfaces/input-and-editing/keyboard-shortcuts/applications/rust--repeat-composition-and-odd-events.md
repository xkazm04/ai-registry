---
layer: application
type: application
subject: keyboard-shortcuts
technique: repeat-composition-and-odd-events
stack: rust
status: forged
verified_on: 2026-11-03
verified_against: rust@1
---

# Rust: a global hotkey's event stream is press and release, not repeat

The `personas` desktop app (https://github.com/xkazm04/personas) was read at
`origin/master`, commit `3cb920506a`. Its OS-level push-to-talk accelerator
(see [rust--shortcut-collision-rules](./rust--shortcut-collision-rules.md)) is
heard through `tauri-plugin-global-shortcut` 2.3.2 over `global-hotkey` 0.8.0.
The crate source was read from the local cargo registry at exactly the versions
the tree's `Cargo.lock` pins.

This application traces
[repeat-composition-and-odd-events](../techniques/repeat-composition-and-odd-events.md)
outside the browser. The event shape is different here. A global hotkey does not
report a repeat flag. It reports a state, pressed or released, and how that state
is produced differs by platform.

## What the stream carries

- **Repeats are suppressed by the operating system, on one platform.** On Windows
  the crate always adds `MOD_NOREPEAT`
  (`global-hotkey` 0.8.0, `src/platform_impl/windows/mod.rs` line 78, `let mut mods = MOD_NOREPEAT;`).
  Microsoft documents what the flag does: it "Changes the hotkey behavior so that
  the keyboard auto-repeat does not yield multiple hotkey notifications"
  ([Microsoft Learn, RegisterHotKey](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-registerhotkey)).
  So a held chord fires once there. That is the technique's non-repeatable
  default, and here the platform API supplies it rather than the dispatch point.
- **Release is synthesized, not reported.** After a press, the Windows backend
  starts a thread that polls the key's state every 50 ms and sends `Released`
  when the key reads up
  (`global-hotkey` 0.8.0, `src/platform_impl/windows/mod.rs` line 158, `GetAsyncKeyState`).
  The macOS backend maps the system's own pressed and released hotkey events
  (`src/platform_impl/macos/mod.rs` lines 324 and 329). Release timing therefore
  differs by platform. On Windows it can lag the real key-up by up to one poll
  interval.
- **The handler fires on press only.** The tree drops the release explicitly,
  `src-tauri/src/commands/companion/voice_hotkey.rs:91 "Fire on press only. Without this the release event runs the"`.
  Without that line every press-and-release would run the action twice. This is
  the release-stream version of the technique's rule that a repeat is a second
  command the user did not give.

## One code, two platform identities

The accelerator parser turns "A" into the position code `KeyA`. The backends
translate that code differently. Windows maps it to the virtual-key `VK_A`
(`src/platform_impl/windows/mod.rs` line 206, `Code::KeyA => VK_A`). Microsoft separates virtual-key codes
from the scan code, which "identifies the key pressed regardless of the active
keyboard layout, as opposed to the character represented by the key", and points
to scan codes for bindings that must hold "across US QWERTY or French AZERTY
keyboard layouts"
([Microsoft Learn, About Keyboard Input](https://learn.microsoft.com/en-us/windows/win32/inputdev/about-keyboard-input)).
macOS maps the same code to the raw key code `0x00`
(`src/platform_impl/macos/mod.rs` line 413, `Code::KeyA => Some(0x00)`). One declaration therefore reaches the
operating system as a layout-dependent identity on one platform and a hardware
code on the other. The technique asks a chord to be matched by character for a
mnemonic and by position only for a spatial cluster. A cross-platform global
accelerator does not get to choose. The declaration should be tested on a
non-default layout on each platform it ships to. This tree has no such test.

## Deviations

- **The in-app path has no repeat filter.** The same chord's in-app handler runs
  a toggle (start a voice turn, or stop the current one) on every matching
  keydown. The handler does not read `e.repeat`, and neither does the
  registry's single listener, `src/lib/keyboard/AppKeyboardProvider.tsx`. With
  the global feature off (the default) and the window focused, holding the chord
  should start and stop the turn with each auto-repeat. With the feature on,
  Windows takes the chord through the global hotkey, which does not repeat. So
  the same keys behave differently depending on a setting. This was read from
  the tree, not run.
- **No composition guard on the in-app path.** The in-app handler does not read
  `isComposing` either. A primary-modifier chord rarely reaches an input-method
  editor, so this gap is latent.
