---
layer: application
type: application
subject: build-economics
technique: capability-feature-gating
stack: rust
status: forged
verified_on: 2026-08-29
verified_against: rust@1.96
---

# The `p2p` gate, and the screen the lite build renders instead

*Verified against the project tree at `c2a3c5fa1`.*

A peer-to-peer transport — LAN discovery, a QUIC stack, signing keys,
certificate generation — sits behind a Cargo feature, and the default build
does not compile it. What makes this tree worth citing is not the gate; it is
the **second half nobody builds**: the shipped variant without the capability
renders a designed, translated panel that says which feature is absent and
what to run instead. Rule 4's "runtime behavior at the gap is designed, not
accidental" is usually a developer courtesy. Here it is a product surface.

## The gate, and where the cut falls

`src-tauri/Cargo.toml:132-160` is the whole tier vocabulary in one block:
`default = []` (`:133`), a `desktop` tier listing the everyday plugins
(`:137-154`), and

```
# Full desktop = core + ML + P2P. Used by CI and production builds.
desktop-full = ["desktop", "ml", "p2p"]
```

at `:155-156`. `p2p` (`:160`) is the technique's dependency-edge cut, not a
consumption-site cut: alongside the three workspace forwards it names seven
`dep:` optional crates — `ed25519-dalek`, `bs58`, `mdns-sd`, `quinn`, `rcgen`,
`rmp-serde`, `socket2` (declared optional at `:337-338` and `:341-350`) — so in the default
tier the cryptography and transport libraries are **absent from the build
graph**, not merely unreferenced. The manifest also states the switch cost the
technique demands be advertised, at the tier itself: "Use this for fast local
builds (~5 min faster than desktop-full)" (`:135`).

The cut is mirrored down the workspace, and both mirrors carry a comment
explaining why the mirror exists at all — the failure mode where a
`#[cfg(feature = "…")]` names a feature its own crate never declared and
therefore silently evaluates false forever:

- `src-tauri/core/Cargo.toml:26-27` — "Same deal for `p2p` — `models` gates
  the pairing/identity structs behind it", then `p2p = []`.
- `src-tauri/db/Cargo.toml:24-25` — "Declared so `#[cfg(feature = "p2p")]`
  inside moved code keeps its meaning", then `p2p = ["personas-core/p2p"]`.

That comment is the interesting artifact: a feature mirror is a *tier
definition* obligation the technique states abstractly, and this tree found
the reason for it the hard way and wrote it next to the declaration.

The gates themselves are ordinary. `src-tauri/src/commands/network/mod.rs`
is sixteen lines and eight `#[cfg(feature = "p2p")] pub mod …` pairs — the
file has no other content. The state field is gated with it
(`src-tauri/src/state.rs:76-78`, `pub network: Option<Arc<engine::p2p::NetworkService>>`),
and the command registrations are gated inside the handler macro
(`src-tauri/src/lib.rs:1069-1086` for signing, and the network block from
`:1907`).

## Two tiers are declared in one place and built by routine

The tier vocabulary reaches the build entry points through configuration
overlays rather than through hand-copied flag lists:
`src-tauri/tauri.lite.conf.json:3-7` overrides `build.features` to
`["desktop"]`, `tauri.stable.conf.json:3-7` to `["desktop-full"]`, and
`package.json:93,96` binds them to `tauri:build:lite` / `tauri:dev:lite`.
`scripts/check-tauri-configs.mjs` is the drift guard the "one place" rule
needs: `OVERLAYS` at `:18`, and `checkFeatures` (`:91-99`) fails the run when
an overlay names a feature that is not declared in the manifest's `[features]`
block — the overlay cannot invent a tier.

The rot-watch is real and it is deliberately *shaped* as a feature matrix
rather than as an extreme-ends pair. `.github/workflows/ci.yml:400-416`
declares a `rust-features` job whose matrix builds `desktop-full`,
`desktop,scraper` and `desktop,test-automation`, each with the reason in a
comment ("What ships. ml + p2p on top of desktop"); everyday clippy and test
runs are pinned to `--features desktop` (`:338`, `:346`, `:574`), so the lite
side is the one exercised per commit and the gated side is exercised per
matrix run. A fourth job, `rust-no-features` (`:461`), compiles the three
library crates with no features at all — the shape a mobile target sees — and
its preamble explains why the desktop crate cannot join it (an updater
capability reference aborts the build script before compilation).

## The compiled-without state is a rendered screen, not a missing symbol

This is the part the technique's rule 4 does not yet reach, because it is
written for a developer who wanders into gated territory. Here an end user
does.

The frontend cannot read a Cargo feature, so it **probes**, and the probe's
verdict is derived structurally rather than from message text.
`src/lib/network/p2pCapability.ts:54-61` classifies one rejection of a cheap
read-only gated command into three outcomes: a structured application error
means the command ran, so the feature is present (`:58`); a bare string is the
IPC layer refusing to dispatch an unregistered command, so it is absent
(`:60`); a timeout is `'indeterminate'` and is explicitly **not latched**
(`:56`, `:99-104`) because "a slow backend is not a missing feature". The
module header (`:1-37`) records what it replaced — a substring sniff for
`"not found"` that a perfectly ordinary runtime error would trip, latching the
whole tab dark for the session — and that both directions were wrong: only
three read paths consulted the old heuristic, so writes surfaced raw error
toasts in a lite build.

One verdict, one signal, every consumer derives.
`src/stores/slices/network/networkSlice.ts:111` holds `p2pUnavailable`, whose
doc (`:101-110`) states the authority rule outright — "Set ONLY by
`ensureP2pSupport` … never inferred from an arbitrary error message, and never
latched by a runtime failure". `ensureP2pSupport` (`:192-196`) mirrors the
once-per-session probe into the flag, and every network action awaits it
first: reads return quietly (`:201`), writes throw a typed
`P2pUnavailableError` (`:211`), across roughly twenty call sites in that slice
and `devicesSlice.ts`.

The rendered state is a first-class early return, ahead of any of the
surface's normal UI. `ExposureManager.tsx` — the settings network page, lazily
routed at `SettingsPage.tsx:16` — reads the flag at `:223` and returns at
`:237-260` a full framed panel whose copy resolves to *"P2P networking
unavailable. This build was compiled without the `p2p` feature. Identity, peer
discovery, and resource exposure are inactive. Run `npm run tauri:dev` (full
build) to enable them."* The sibling device-linking page does the same
(`DeviceLinkPage.tsx:63-79`), carries a test hook
(`data-testid="devices-p2p-unavailable"`, `:69`), and its strings are in the
translation catalog (`src/i18n/locales/en.json:6425-6426`) alongside thirteen
other locales. A build-time flag has been carried all the way into the
localization pipeline.

The backend half of the same discipline is the more surprising one.
`src-tauri/src/commands/companion/approvals/approval_exec_devices.rs:259-281`
keeps the remote-instruction operation **registered and dispatched in the lite
build**, with a `#[cfg(not(feature = "p2p"))]` transport stub returning a
sentence a user can act on ("This build has no device link, so I can't reach
…"). Its doc block gives the reason, and it is a gate-sees-target argument:
keeping the action list, the lifecycle match and the agent's instructions
identical across feature sets means the dispatcher's parity test asserts the
*same* surface in both builds "instead of a shape that only holds in one". The
adjacent prompt-side stub goes the other way and returns an empty roster
(`src-tauri/src/companion/prompt/devices.rs:70-77`) — "a roster of machines
nothing can reach would be worse than silence". Two `cfg(not)` arms, two
different right answers, each with its reasoning written where the arm is.

## The structural fact that makes this evidence

The gate is only half-observable from the manifest. What proves the design is
that **three independent layers agree on one absence**: a Cargo feature that
removes seven dependencies from the graph, a runtime probe whose verdict comes
from the transport's dispatch behavior rather than from any message, and a
translated panel keyed to that verdict. None of the three can read the other
two — the frontend cannot see `cfg`, the manifest cannot see the panel — and
they are kept in agreement by a probe that asks the running binary rather than
by a constant anybody could copy. That is what a designed gap looks like when
the lite variant ships to users instead of only to developers.

## What this realization cannot do or prove

- **No build-cost measurement backs the headline number.** "~5 min faster than
  desktop-full" (`Cargo.toml:135`) is a manifest comment with no sampler, no
  dated before/after, and no attribution to the gated units. The switch-cost
  inequality is asserted, not computed; nothing here would notice if the gate
  stopped paying for itself.
- **The probe cannot distinguish absent from unauthorized.** Both a
  compiled-out command and a command refused by the IPC permission scope
  reject with an unstructured value, so both classify as `'unsupported'`
  (`p2pCapability.ts:59-60`). The panel would then tell a user their build
  lacks a feature it actually has.
- **Only one `cfg(not(feature = "p2p"))` arm exists per gated entry point that
  bothered.** There are two in the tree. The eight gated command modules have
  no stubs at all — they simply do not exist in the lite build — so the honest
  message only appears where a surface remembered to probe. The technique's
  rule 4 is satisfied at the surfaces cited here and unenforced everywhere
  else; nothing mechanical requires a gated entry point to have a designed gap.
- **Two-tier discipline is not proved for the other five flags.** `ml`,
  `scraper`, `ollama`, `test-automation`, `daemon` and `mobile` are declared in
  the same block; the matrix builds three combinations, so tier content is
  proved for those and asserted for the rest. Feature unification means the
  unbuilt combinations' contents are a prediction.
- **Nothing here proves the lite build is what developers actually run.** The
  scripts and the configs exist; adoption is not measured, and a gate nobody
  stays on the light side of is the technique's own definition of pure
  complexity.
