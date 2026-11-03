---
layer: application
type: application
subject: keyboard-shortcuts
technique: shortcut-collision-rules
stack: rust
status: forged
verified_on: 2026-11-03
verified_against: rust@1
---

# Rust: an OS-global accelerator, where registration is the collision check

The `personas` desktop app (https://github.com/xkazm04/personas) was read at
`origin/master`, commit `3cb920506a`. It registers one accelerator with the
operating system, so the user can start a voice turn while another application
has focus. The Rust side is a Tauri command over `tauri-plugin-global-shortcut`
2.3.2, which uses `global-hotkey` 0.8.0 (versions taken from the tree's
`Cargo.lock`). The chord is the same one the in-app keyboard handler binds,
`src/api/companion.ts:848 "export const COMPANION_VOICE_HOTKEY = 'CmdOrCtrl+Shift+A';"`.

This application traces
[shortcut-collision-rules](../techniques/shortcut-collision-rules.md) one layer
above the window. The technique lists four owners and treats the platform's
chords as "a denylist checked at declaration". For a global accelerator that list
cannot be written down. The owners include every other application the user has
installed, and the app cannot list their chords. The tree applies the only check
left: it asks the operating system, at the moment the user turns the feature on.

## Registration is the check, and a refusal is shown

- **The usual cause is named in the error.** When `on_shortcut` fails, the command
  returns a validation error that names the likely owner,
  `src-tauri/src/commands/companion/voice_hotkey.rs:110 "another application may already use it"`.
  On Windows the crate maps the operating system's "already registered" code to its
  own error variant. `RegisterHotKey` itself documents the failure: "Typically,
  RegisterHotKey also fails if the keystrokes specified for the hot key have
  already been registered for another hot key"
  ([Microsoft Learn, RegisterHotKey](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-registerhotkey)).
- **A refused binding turns the switch off.** The hook that owns registration
  does not leave the setting reading "on" when nothing is bound,
  `src/features/companions/athena/useGlobalVoiceHotkey.ts:73 "Flip the toggle back off rather than leaving the settings UI"`.
  The reason is written next to it,
  `src/features/companions/athena/useGlobalVoiceHotkey.ts:75 "nothing is bound is worse than one that visibly failed"`.
  This is the technique's rule for user remapping ("validated ... at the moment it
  is saved"), with the saved value replaced by the switch. Because the owners
  cannot be listed, the save is the registration attempt.
- **The default lives in one place.** Rust holds no copy of the chord,
  `src-tauri/src/commands/companion/voice_hotkey.rs:13 "Rust deliberately holds **no default**: duplicating the"`,
  and a rebind unregisters the old binding first,
  `src-tauri/src/commands/companion/voice_hotkey.rs:18 "Registration is last-write-wins"`.
  The feature is off by default, so nothing is taken from another application
  until the user asks for it.

## Deviations

- **The same chord is written twice, in two identity schemes.** The accelerator
  string is one copy. The in-app handler restates the key as a literal,
  `src/features/companions/athena/orb/AthenaOrbLayer.tsx:179 "if (mod && e.shiftKey && (e.key === 'a' || e.key === 'A')) {"`.
  A comment keeps them in step,
  `src/api/companion.ts:846 "Matches the in-app"`.
  The behaviour is shared (one callback serves both scopes), but the key is not,
  so a rebind in one place would leave the other on the old chord. The two copies
  also identify the key differently. The in-app predicate matches the produced
  character. The accelerator parser turns "A" into the physical-position code
  `KeyA` (`global-hotkey` `src/hotkey.rs`, `"KEYA" | "A" => Ok(KeyA)`), and the
  W3C code table defines that code as the key labelled "a on a US keyboard.
  Labelled q on an AZERTY (e.g., French) keyboard"
  ([UI Events KeyboardEvent code Values](https://www.w3.org/TR/uievents-code/)).
  Each platform backend then translates the code in its own way, covered in
  [rust--repeat-composition-and-odd-events](./rust--repeat-composition-and-odd-events.md).
  Whether the in-app chord and the OS chord are the same keys on a non-US layout
  is not tested anywhere.
- **The chord is shown in the parser's grammar, not the platform's.** The
  settings card renders the raw accelerator string,
  `src/features/companions/athena/sub_voice/GlobalHotkeyCard.tsx:51 "{COMPANION_VOICE_HOTKEY}"`,
  so every user reads `CmdOrCtrl+Shift+A`, whichever key their platform calls
  primary. The technique's "Platform grammar" rule is not met.
- **The in-app half accepts the wrong modifiers.** It treats Control or Meta as
  the primary modifier,
  `src/features/companions/athena/orb/AthenaOrbLayer.tsx:178 "const mod = e.ctrlKey || e.metaKey;"`,
  and never checks Alt. So on Windows the Windows key plus Shift+A also fires it,
  and so does Control+Alt+Shift+A, which is AltGr+Shift+A on layouts that have
  AltGr. The OS accelerator wants Control on that platform, so the two scopes
  answer to different chords there. This was read from the tree, not run.
