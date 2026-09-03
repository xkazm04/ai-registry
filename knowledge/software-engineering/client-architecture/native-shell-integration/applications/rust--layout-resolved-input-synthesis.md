---
layer: application
type: application
subject: native-shell-integration
technique: layout-resolved-input-synthesis
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@2021
---

# Resolving the paste chord per layout in Voicebox

Witness: the `voicebox` desktop shell at commit
`51f49dea198384b4eb6087b72c17057c6eb1c1cd`. No toolchain file is pinned, so the
version witness is `tauri/src-tauri/Cargo.toml:8` (`edition = "2021"`); the
platform crates it resolves against are declared at `Cargo.toml:29-42`
(`core-foundation-sys 0.8`, `objc 0.2` on macOS; `windows 0.62` on Windows).
The synthesized chord is the paste that delivers a finished transcript into
whatever application the user was typing in.

## Two platforms, two opposite implementations, both commented

`tauri/src-tauri/src/keyboard_layout.rs:6-9` states the macOS matching layer:

> macOS apps process Cmd+V via NSMenu key equivalents, which match against
> `[NSEvent charactersIgnoringModifiers]` — i.e. the layout-translated
> character, not the raw keycode. Posting `kVK_ANSI_V` (= 9, the QWERTY V
> position) on Dvorak therefore produces Cmd+. and never triggers Paste.

and `:17-20` states the Windows one, as an explicit non-coverage note:

> Windows is intentionally not covered here. `SendInput` with `wVk = VK_V`
> delivers `WM_KEYDOWN` to the target with `wParam = VK_V` regardless of the
> active layout — most Windows apps treat that as Ctrl+V. AutoHotkey relies on
> the same behaviour.

`synthetic_keys.rs:20-30` repeats both sides at the call site. This is the
technique's core discriminator answered per host, from how the host's
applications register command chords, and written down beside each
implementation — the divergence is deliberate rather than an unfinished port.

## Resolve on the main thread at startup, refresh on the host's notification

`main.rs:1403-1409` calls `keyboard_layout::init()` from the Tauri setup hook
with the constraint spelled out: "Resolve the active keyboard layout's V
keycode now, on the main thread, and register an observer for layout changes.
The synthetic-paste hot path then only reads an atomic."

`keyboard_layout.rs:107-110` is the two-step init — `resolve_into_cache()` then
`register_layout_change_observer()`. The observer (`:171-186`) registers
`kTISNotifySelectedKeyboardInputSourceChanged` on the distributed notification
centre with `DeliverImmediately`, and its callback (`:161-169`) does nothing but
re-resolve. The module comment at `:11-15` names the threading constraint:
"All TIS calls happen on the main thread … The hot path (`paste_keycode_v`)
only reads an `AtomicU16`, so paste latency is unchanged."

## One cell, read lock-free

`keyboard_layout.rs:32` holds the single authority:

```rust
static V_KEYCODE: AtomicU16 = AtomicU16::new(FALLBACK_V_KEYCODE);
```

`paste_keycode_v()` (`:39-41`) is a `load(Ordering::Relaxed)` and is the only
public reader; `resolve_into_cache()` (`:112-115`) is the only writer. Nothing
in the tree recomputes the keycode a second time.

The resolution itself (`:117-159`) walks `0..=MAX_KEYCODE` calling
`UCKeyTranslate` with no modifiers and `kUCKeyTranslateNoDeadKeysMask`,
returning the first keycode whose translation is a single `'v'`. `MAX_KEYCODE
= 127` is derived rather than guessed — `:76-79`: "Standard US-style virtual
keycodes occupy 0..0x7F. We iterate the full range so non-US-extended layouts
(ISO, JIS) can still be resolved if their `v` lives outside the ANSI range."

## The fallback is a named constant with its conditions enumerated

`keyboard_layout.rs:25-29`:

```rust
/// `kVK_ANSI_V` — the keycode for the physical V key on a US QWERTY
/// layout. Used as the fallback whenever live resolution can't produce a
/// better answer (no Unicode key layout data, lookup failure, non-macOS).
const FALLBACK_V_KEYCODE: u16 = 9;
```

It is the atomic's initial value, so the pre-init window degrades to the naive
implementation rather than to an unset zero, and `resolve_v_keycode()` returns
`Option` with four distinct `None` sites (`:120-133`, `:157`) for null input
source, absent layout data, null byte pointer, and no matching keycode.

## Emitting an event the target believes came from hardware

`synthetic_keys.rs:7-11`: "Cmd down with Cmd flag, V down with Cmd flag, V up
with Cmd flag, Cmd up via `CGEventPost` at `kCGHIDEventTap`. The Cmd-down event
carries the Command flag so its `flagsChanged` representation matches hardware
— Electron/Chromium tracks modifier state from that flag and drops the paste
otherwise." The constants at `:56-63` say why the injection point and event
source are chosen: `kCGHIDEventTap` so "every downstream tap (including the
target app) sees them exactly as if the hardware had produced them", and
`kCGEventSourceStateHIDSystemState` so "modifier bookkeeping inside target apps
stays consistent". That is the technique's full-sequence-with-flags rule,
learned the same way it is stated here — from targets that dropped the chord.

## Delivery discipline sits above this, and is not duplicated here

`main.rs:1216-1253` (`paste_final_text`) is where the resolved chord is used,
and everything around it — the clipboard snapshot at `:1234`, the conditional
restore gated on `clipboard::current_change_count()` matching the value
returned by the write at `:1240-1246`, the isolation of the paste error from
the restore decision at `:1200-1203` — belongs to the transcript-delivery
discipline, not to this technique. Noted here only to show the two composing in
order: resolve what to emit, then deliver under that discipline.

## Where the tree falls short

**The fallback is not distinguishable in logs.** `resolve_into_cache()` does
`resolve_v_keycode().unwrap_or(FALLBACK_V_KEYCODE)` and stores it. When the
active input source carries no Unicode layout data — the real case for several
input methods — the product silently guesses, and a user reporting "Cmd+. keeps
firing" produces no evidence anywhere. The standard is unchanged: the fallback
path is logged as a fallback.

**Resolution is one character wide.** The cache holds only the keycode for
`'v'`, so any second synthesized chord the product grows will re-derive the
mechanism or, more likely, hardcode. A small map keyed by target character,
resolved in the same walk, costs one extra comparison per iteration.

## Anchor note

The spec's cited range `keyboard_layout.rs:1-32,69-80` is accurate for the
module comment and the fallback constant, and `:69-80` lands on the
`UCKeyTranslate` option constants rather than on the resolution body; the
resolution is at `:112-159` and the observer at `:161-186`.
