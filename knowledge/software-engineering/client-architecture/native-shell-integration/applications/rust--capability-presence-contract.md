---
layer: application
type: application
subject: native-shell-integration
technique: capability-presence-contract
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@2021
---

# Three desktop platforms, one grant boolean, in Voicebox

Witness: the `voicebox` desktop shell at commit
`51f49dea198384b4eb6087b72c17057c6eb1c1cd`; version witness
`tauri/src-tauri/Cargo.toml:8` (`edition = "2021"`), with the per-target
dependency blocks at `:28-42` showing macOS and Windows carve-outs and no third
block. The application builds for macOS, Windows and Linux and its auto-paste
pipeline exists on two of them.

## The classes are present in the tree, as `cfg` branches rather than as data

Each host capability is a module with a per-target implementation, and the
module comments state the class in prose:

- **`accessibility.rs`** — governed on macOS (`:19-32`, `AXIsProcessTrusted`),
  ungoverned on Windows (`:34-37`, returns `true`, with `:12-17` explaining
  "Windows has no equivalent user-facing permission … there's no Settings pane
  to send users to"), and *absent* on everything else (`:39-42`, returns
  `false`).
- **`input_monitoring.rs`** — governed on macOS (`:61-72`), ungoverned
  elsewhere (`:74-82`, returns `true`, with `:25-26`: "Windows / Linux don't
  gate keyboard taps behind a TCC-style permission, so those branches return
  `true`").
- **`synthetic_keys.rs`** — present on macOS (`:94`) and Windows (`:157`),
  class 4 elsewhere (`:217-220`).

The ungoverned branches returning `true` are the technique's class 1 handled
correctly: a capability nobody has to grant reports *satisfied*, so the readiness
vector on Windows does not inherit a phantom blocker.

## The one place the class survives to the surface

`synthetic_keys.rs:217-220` is the technique's typed refusal:

```rust
#[cfg(not(any(target_os = "macos", target_os = "windows")))]
pub fn send_paste() -> Result<(), String> {
    Err("synthetic paste is not yet implemented on this platform".into())
}
```

The message names the class — not implemented here — rather than the nearest
available failure, and it is an `Err` rather than an `Ok(())` no-op, so no
caller believes the paste happened. It is a string rather than a typed variant,
which the technique would rather it were, but the distinction is preserved
where it matters.

## The collapse the technique exists to prevent, in the tree

`main.rs:1224-1229`, the guard at the head of `paste_final_text`:

```rust
if !accessibility::is_trusted() {
    return Err(
        "Accessibility permission required for auto-paste. Open System Settings → Privacy & Security → Accessibility and enable Voicebox."
            .into(),
    );
}
```

On the third platform `accessibility::is_trusted()` returns `false`
unconditionally (`accessibility.rs:39-42`) — because the capability does not
exist there, not because a grant is missing. The guard has no representation
for that distinction, falls through to its ungranted branch, and instructs the
user to open a settings pane, in a settings application, that their operating
system does not have. `send_paste`'s honest class-4 refusal at `:217-220` is
never reached, because this guard runs first.

That is the technique's motivating failure exactly, and it is worth stating
what makes it so easy to ship: every line is locally correct. `is_trusted()`
returning `false` for an unknown platform is the conservative choice.
Refusing before touching the clipboard is the right ordering. The message is
accurate on the platform it was written for. The defect exists only in the
composition, which is why the class has to be a declared value rather than an
inference from a boolean.

The fix the standard asks for: `is_trusted()` returns a three-way class
(`Granted` / `Denied` / `Unsupported`) rather than a bool, the guard branches on
it, and the `Unsupported` arm returns the same class-4 refusal `send_paste`
already carries — with no settings link, because there is no setting.

## The abstraction line, and the null objects on the wrong side of it

`app/src/platform/types.ts:74-80` closes the injected host interface at five
members:

```ts
export interface Platform {
  filesystem: PlatformFilesystem;
  updater: PlatformUpdater;
  audio: PlatformAudio;
  lifecycle: PlatformLifecycle;
  metadata: PlatformMetadata;
}
```

Saving a file, checking for updates, reporting a version, starting the engine —
each is genuinely answered differently by the desktop host and the browser host,
and each is behind the interface. The capabilities only the desktop host can
answer — the permission queries, the chord registration, the pill window — are
*not* interface members; they are direct `invoke()` calls behind
`platform.metadata.isTauri`, and the tree confines them to four files
(`AccessibilityGate.tsx`, `InputMonitoringGate.tsx`, `DictateWindow.tsx`,
`useChordSync.ts`). Four clustered call sites is the line drawn in the right
place, and it is a number a reviewer can recount.

The counter-example sits inside the interface. `web/src/platform/audio.ts:8-22`
implements three of `PlatformAudio`'s six members as throws:

```ts
async startSystemAudioCapture(_maxDurationSecs: number): Promise<void> {
  throw new Error('System audio capture is only available in the desktop app.');
},
```

These are the throwing stubs the technique names: the class lives in an
exception message a caller can only string-match, and a third host would have
to write the same three throws again. The interface already carries the honest
alternative one line above — `isSystemAudioSupported(): Promise<boolean>`
returns `false` on the web host (`:4-6`) — so the members with no possible
implementation should be reached only behind that predicate rather than being
interface members at all. `web/src/platform/lifecycle.ts:14-38` is the milder
version: six no-ops, each commented "server is managed externally", which is
the honest case the technique allows because doing nothing genuinely is correct
there.

## Where the tree falls short

Beyond the collapse above: there is **no declared presence matrix**. Every
class is inferred from a `cfg` branch or an `isTauri` check at the point of
use, so the readiness checklist, the paste guard and the audio interface each
answer "is this available here" by their own route, and the paste guard answers
it wrong. One table — capability by host by class — read by all three is the
change the standard asks for, and it is smaller than the three inference sites
it replaces.
