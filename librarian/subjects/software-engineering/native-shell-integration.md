---
subject: native-shell-integration
domain: software-engineering
last_touched: 2026-09-04
dry_streak: 0
---

# native-shell-integration

First touch: [[2026-09-04-everywhere]] — an intake against a design-deep desktop
assistant repository. Class: YOUNG (forged 2026-09-03; this run took it from
five techniques to eight, one day after it was forged).

## State

Eight techniques. The subject was scoped around what a native process is
*entitled to do* — grants as a vector, presence as a separate axis, focus
custody, input synthesis, stream ownership — and it was scoped well: a source
carrying three unmodelled decisions about overlays landed entirely inside it,
with no argument for a new subject anywhere in the routing count.

## 2026-09-04 — /intake `Everywhere` (run `everywhere-build`)

Three techniques, all of them one enumeration's missing third item.

`non-stealing-overlay` closes on a rule that reads as complete: *"a defensive
teardown is judged by what remains **clickable**, not by what remains
visible."* Two axes, and the golden path's whole overlay section is a **focus
custody chain**. That framing is correct and it is short by one: an overlay
belonging to a product that *reads* other applications is also **queryable**,
and the accessibility layer it queries through will return the overlay itself
unless the overlay is excluded from that layer explicitly.

- **`query-transparent-overlay`** — exclude the surface from the accessibility
  layer rather than making it transparent to input. The rejected rungs are the
  valuable part and both were shipped first: input-transparency plus global
  low-level hooks (which broke under privilege-elevation dialogs, leaving the
  user's real mouse button stuck, and fought other hook-installing tools), and
  hide-query-reshow around each call (the call is synchronous, the compositing
  effect is not, so it flickers). Carries the acceptance test parallel to the
  neighbour's: judge the query axis by walking the tree from an inspection tool
  with the surface up, as the neighbour judges the click axis by clicking.
- **`observer-perturbation`** — the general one. A fullscreen opaque surface
  trips the *observed application's own* occlusion optimization, which
  hibernates its renderer and reparents its accessibility provider out of the
  subtree being queried; the query then returns a bare root and the cause is
  invisible from the query site. Also carries the isolation method: shrink the
  apparatus to a fraction of the screen and scale the coordinates, so the path
  exercises the full space while the target stays unobscured — a general way to
  ask "is my own instrument causing this".
- **`unexported-capability-ladder`** — the rungs for reaching a capability the
  platform does not export (symbol lookup rejected on per-call cost, hardcoded
  offsets rejected because they had already shifted between releases, an
  anchor inside the target's own binary taken), and the rule that ends the
  ladder: **when the instrument perturbs a subsystem, look for that
  subsystem's own opt-out before building a scoped replacement for its
  interface.** In the source, the opt-out found in chapter four retired two
  chapters of reverse engineering.

The worker was invited to fold the third into the second and declined, arguing
the rungs carry non-derivable content with no home in a technique about
perturbation. It also declined to invent the taken fix for the second, writing
the supported rule — fix at the perturbation, not at the reaction, because
there is one apparatus and an open-ended number of occlusion heuristics — and
giving the remedies as a ranked ladder instead.

Unapplied: no authorized fleet project ships a native process that reads other
applications' accessibility trees. Return condition in `applied.md`.

## 2026-10-14 - light-c (intake lightc-1014)

Added technique native-side-owns-the-target-set (entitlement of a command to touch the filesystem or spawn, upstream of ipc-contract call shape) with one application against the source tree. Leads banked in the source note: exact exemptions from a protected root, mode-detection ladder that fails toward the cheaper wrong guess. Return condition for both: a second independent source.

2026-10-23 (intake-firetv-inbox-1023, [[2026-10-23-firetv-inbox-harvest]]): new technique host-forwarded-key-contract (tested key table, consumption readback, back leaves only when the page did not take it). Unapplied: no managed project wraps a page for a remote-driven host. Boundary named in the technique: script-created key events carry no default action, which keyboard-navigation-models should say too (banked rows 5 and 26).

## 2026-10-31 - architecture review

All 17 documents read. Two internal defects and no source refutation: the golden path's body never reaches its two newest techniques, and the idle-timeout formula has no jitter margin, which the stream witness's own 45 s constant exposes (the application's arithmetic for it was wrong). Rule four of the target-set technique and the key-contract boundary were checked against primary sources and hold.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/native-shell-integration",
  "date": "2026-10-31",
  "baseline": "a7d8d83e0",
  "digest": "sha256-b2:9034ad02704d9c88",
  "disposition": "clarify",
  "coverage": "Golden path, all 10 techniques and all 6 applications read in full. Primary sources checked for the Tauri command default, untrusted-event default actions, Chromium occlusion behaviour, and the native-owned-stream witness at its pinned commit; other application anchors were not reopened.",
  "counterexamples": [
    "A stream whose only consumer is a visible view is correctly left in the view; relocating it adds a hop and a second reconnect policy for nothing.",
    "A host that delivers raw virtual keys to targets makes layout resolution a bug generator; hardcoding is the right answer there.",
    "A transparent or cloaked window is not counted as occluding by Chromium, so an overlay below full opacity does not trigger hibernation for that class of target - which is exactly why that fix does not generalise.",
    "A product shipping to one host has no presence matrix; the presence axis collapses into the grant vector.",
    "A task runner's shell string is the product; the bound moves to who may call it rather than to the string."
  ],
  "sources": [
    {
      "url": "https://v2.tauri.app/security/capabilities/",
      "result": "Quote: 'By default, all commands that you registered in your app are allowed to be used by all the windows and webviews of the app. To change that, consider using AppManifest::commands.' Supports native-side-owns-the-target-set rule four."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted",
      "result": "Quote: isTrusted is 'false when the event was dispatched via EventTarget.dispatchEvent()'. Supports host-forwarded-key-contract boundary (untrusted)."
    },
    {
      "url": "https://groups.google.com/a/chromium.org/g/blink-dev/c/WEMnlVIbe70/m/hP7fhHP0AAAJ",
      "result": "Via search summary: per UI Events, un-trusted events should not invoke the default action; 'click' is the only legacy permitted case. Supports the no-default-action half of the boundary."
    },
    {
      "url": "https://chromium.googlesource.com/chromium/src/+/b78a1594de8fdb3ce9eea0665d2d773123e8c435/docs/windows_native_window_occlusion_tracking.md",
      "result": "Quotes: occluded windows - 'rendering stops, and js is throttled'; 'Transparent windows, cloaked windows, floating windows, non-rectangular windows, etc, are not considered occluding.' Supports observer-perturbation mechanism and its rejected rung; says nothing about accessibility reparenting."
    },
    {
      "url": "https://raw.githubusercontent.com/jamiepine/voicebox/51f49dea198384b4eb6087b72c17057c6eb1c1cd/tauri/src-tauri/src/speak_monitor.rs",
      "result": "Pinned witness: 15 s heartbeat, 45 s STREAM_IDLE_TIMEOUT 'absorbs one missed heartbeat', productive-round backoff reset, unconditional post-round sleep at :82 - all as cited. Refutes the application's '15 s x (1+1)' arithmetic."
    },
    {
      "url": "https://developer.apple.com/documentation/iokit/iohidaccesstype",
      "result": "Page not machine-readable (JS-only); IOHIDAccessType values remain attested only by the witness's own FFI comment."
    }
  ],
  "documents": {
    "native-shell-integration.md": {
      "disposition": "clarify",
      "reason": "Frontmatter lists ten techniques; the closing technique list names eight and the body never mentions native-side-owns-the-target-set or host-forwarded-key-contract, so a reader of the path never reaches them. Add both to the list and name the target-set technique where the boundary section already states its question ('which side may perform this act')."
    },
    "techniques/permission-gate-vector.md": {
      "disposition": "keep",
      "reason": "Killer/degrader split, poll-not-try, three-plus-one query states and refocus reconciliation are coherent and witnessed; the three-valued IOHID access enum is consistent with the witness's own FFI comment (Apple's page was not machine-readable this run)."
    },
    "techniques/capability-presence-contract.md": {
      "disposition": "keep",
      "reason": "Presence as an axis distinct from grant, four classes, typed refusal and compile-out-only-for-unsafe are well bounded; the witness application shows the motivating collapse concretely."
    },
    "techniques/non-stealing-overlay.md": {
      "disposition": "keep",
      "reason": "Layered teardown order, omitted-focus comment, idempotent construction and verified hand-back stand; claims are scoped to 'at least one host' and witnessed."
    },
    "techniques/query-transparent-overlay.md": {
      "disposition": "keep",
      "reason": "Three-transparency enumeration and both rejected rungs are argued from mechanism; 16-33 ms flicker is the correct arithmetic for one to two frames at 60 Hz. Single-source provenance for the rejected rungs is acknowledged in the subject note."
    },
    "techniques/observer-perturbation.md": {
      "disposition": "keep",
      "reason": "Chromium's own occlusion document confirms that an occluded window stops rendering and that transparent windows are not considered occluding, which supports both the mechanism and why the rejected 'defeat the detector' rung works for that class only. The accessibility-provider reparenting detail remains single-source (the intake) and is stated as observed behaviour, not as a documented contract."
    },
    "techniques/unexported-capability-ladder.md": {
      "disposition": "keep",
      "reason": "The search-order rule ahead of the ladder is the load-bearing content and is well argued; per-rung timings are single-source measurements presented as such."
    },
    "techniques/layout-resolved-input-synthesis.md": {
      "disposition": "keep",
      "reason": "Per-host matching layer, main-thread resolution with change notification, single cell and logged fallback are coherent; the witness carries both host comments verbatim."
    },
    "techniques/native-owned-stream.md": {
      "disposition": "clarify",
      "reason": "Formula 'heartbeat x (missed beats tolerated + 1)' puts the deadline exactly at the due time of the beat after the tolerated miss, so any jitter trips it; the witness's 45 s for a 15 s heartbeat (verified at source) is that formula plus one interval of margin, which the formula cannot produce. Add an explicit margin term."
    },
    "techniques/native-side-owns-the-target-set.md": {
      "disposition": "keep",
      "reason": "Rule four verified against Tauri 2 capabilities documentation: 'By default, all commands that you registered in your app are allowed to be used by all the windows and webviews of the app. To change that, consider using AppManifest::commands.' Other rules are general security reasoning, scoped command by command."
    },
    "techniques/host-forwarded-key-contract.md": {
      "disposition": "keep",
      "reason": "Boundary claim verified: MDN defines isTrusted false for events dispatched via dispatchEvent(), and the UI Events rule (as cited in Chromium's intent to ship) is that untrusted events do not invoke default actions, click being the only legacy exception, which does not affect the keyboard case described."
    },
    "applications/react--permission-gate-vector.md": {
      "disposition": "keep",
      "reason": "Re-read the pinned useDictationReadiness.ts: lines 85-90 and allReady at 95, the web 'treat both as granted' at 78-81 and the poll stop condition at 64-75 match the citations. Other anchors not reopened; verified_on unchanged."
    },
    "applications/rust--capability-presence-contract.md": {
      "disposition": "keep",
      "reason": "Shows the class-collapse defect concretely and states the fix; anchors not reopened this run, verified_on unchanged."
    },
    "applications/rust--layout-resolved-input-synthesis.md": {
      "disposition": "keep",
      "reason": "Quotes both host comments and the fallback constant; the anchor note already corrects a stale spec range. Anchors not reopened, verified_on unchanged."
    },
    "applications/rust--native-owned-stream.md": {
      "disposition": "clarify",
      "reason": "Arithmetic error: '45 s is 15 s x (1 missed beat + 1)' evaluates to 30 s. The constant and its comment (verified at the pinned commit, speak_monitor.rs:38-42) are one tolerated miss plus a full interval of margin; say that."
    },
    "applications/rust--native-side-owns-the-target-set.md": {
      "disposition": "keep",
      "reason": "Read-only witness with its exploitability limit stated; the manifest finding is consistent with the Tauri default verified above. Anchors not reopened, verified_on unchanged."
    },
    "applications/rust--non-stealing-overlay.md": {
      "disposition": "keep",
      "reason": "Teardown order, Linux compile-out reason and verified activation ordering are quoted from the tree; the missing native-side watchdog is disclosed. Anchors not reopened, verified_on unchanged."
    }
  }
}
```

Applied the three clarify items the same day (golden-path technique list, idle-timeout margin, stream witness arithmetic); record against the new digest below.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/native-shell-integration",
  "date": "2026-10-31",
  "baseline": "a7d8d83e0",
  "digest": "sha256-b2:a28c1929a3d0c38a",
  "disposition": "keep",
  "coverage": "Golden path, all 10 techniques and all 6 applications read in full. Primary sources checked for the Tauri command default, untrusted-event default actions, Chromium occlusion behaviour, and the native-owned-stream witness at its pinned commit; other application anchors were not reopened.",
  "counterexamples": [
    "A stream whose only consumer is a visible view is correctly left in the view; relocating it adds a hop and a second reconnect policy for nothing.",
    "A host that delivers raw virtual keys to targets makes layout resolution a bug generator; hardcoding is the right answer there.",
    "A transparent or cloaked window is not counted as occluding by Chromium, so an overlay below full opacity does not trigger hibernation for that class of target - which is exactly why that fix does not generalise.",
    "A product shipping to one host has no presence matrix; the presence axis collapses into the grant vector.",
    "A task runner's shell string is the product; the bound moves to who may call it rather than to the string."
  ],
  "sources": [
    {
      "url": "https://v2.tauri.app/security/capabilities/",
      "result": "Quote: 'By default, all commands that you registered in your app are allowed to be used by all the windows and webviews of the app. To change that, consider using AppManifest::commands.' Supports native-side-owns-the-target-set rule four."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted",
      "result": "Quote: isTrusted is 'false when the event was dispatched via EventTarget.dispatchEvent()'. Supports host-forwarded-key-contract boundary (untrusted)."
    },
    {
      "url": "https://groups.google.com/a/chromium.org/g/blink-dev/c/WEMnlVIbe70/m/hP7fhHP0AAAJ",
      "result": "Via search summary: per UI Events, un-trusted events should not invoke the default action; 'click' is the only legacy permitted case. Supports the no-default-action half of the boundary."
    },
    {
      "url": "https://chromium.googlesource.com/chromium/src/+/b78a1594de8fdb3ce9eea0665d2d773123e8c435/docs/windows_native_window_occlusion_tracking.md",
      "result": "Quotes: occluded windows - 'rendering stops, and js is throttled'; 'Transparent windows, cloaked windows, floating windows, non-rectangular windows, etc, are not considered occluding.' Supports observer-perturbation mechanism and its rejected rung; says nothing about accessibility reparenting."
    },
    {
      "url": "https://raw.githubusercontent.com/jamiepine/voicebox/51f49dea198384b4eb6087b72c17057c6eb1c1cd/tauri/src-tauri/src/speak_monitor.rs",
      "result": "Pinned witness: 15 s heartbeat, 45 s STREAM_IDLE_TIMEOUT 'absorbs one missed heartbeat', productive-round backoff reset, unconditional post-round sleep at :82 - all as cited. Refutes the application's '15 s x (1+1)' arithmetic."
    },
    {
      "url": "https://developer.apple.com/documentation/iokit/iohidaccesstype",
      "result": "Page not machine-readable (JS-only); IOHIDAccessType values remain attested only by the witness's own FFI comment."
    }
  ],
  "documents": {
    "native-shell-integration.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added native-side-owns-the-target-set and host-forwarded-key-contract to the techniques list (both were in frontmatter, absent from the body) and named the target-set technique in the boundary section. Body still develops neither in its own section; a fuller paragraph for each is optional, not owed."
    },
    "techniques/permission-gate-vector.md": {
      "disposition": "keep",
      "reason": "Killer/degrader split, poll-not-try, three-plus-one query states and refocus reconciliation are coherent and witnessed; the three-valued IOHID access enum is consistent with the witness's own FFI comment (Apple's page was not machine-readable this run)."
    },
    "techniques/capability-presence-contract.md": {
      "disposition": "keep",
      "reason": "Presence as an axis distinct from grant, four classes, typed refusal and compile-out-only-for-unsafe are well bounded; the witness application shows the motivating collapse concretely."
    },
    "techniques/non-stealing-overlay.md": {
      "disposition": "keep",
      "reason": "Layered teardown order, omitted-focus comment, idempotent construction and verified hand-back stand; claims are scoped to 'at least one host' and witnessed."
    },
    "techniques/query-transparent-overlay.md": {
      "disposition": "keep",
      "reason": "Three-transparency enumeration and both rejected rungs are argued from mechanism; 16-33 ms flicker is the correct arithmetic for one to two frames at 60 Hz. Single-source provenance for the rejected rungs is acknowledged in the subject note."
    },
    "techniques/observer-perturbation.md": {
      "disposition": "keep",
      "reason": "Chromium's own occlusion document confirms that an occluded window stops rendering and that transparent windows are not considered occluding, which supports both the mechanism and why the rejected 'defeat the detector' rung works for that class only. The accessibility-provider reparenting detail remains single-source (the intake) and is stated as observed behaviour, not as a documented contract."
    },
    "techniques/unexported-capability-ladder.md": {
      "disposition": "keep",
      "reason": "The search-order rule ahead of the ladder is the load-bearing content and is well argued; per-rung timings are single-source measurements presented as such."
    },
    "techniques/layout-resolved-input-synthesis.md": {
      "disposition": "keep",
      "reason": "Per-host matching layer, main-thread resolution with change notification, single cell and logged fallback are coherent; the witness carries both host comments verbatim."
    },
    "techniques/native-owned-stream.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the idle-timeout formula now adds a stated jitter margin (up to one interval) to heartbeat x (tolerated misses + 1), since the bare formula puts the deadline exactly on the next beat's due time; the decision rule says the same."
    },
    "techniques/native-side-owns-the-target-set.md": {
      "disposition": "keep",
      "reason": "Rule four verified against Tauri 2 capabilities documentation: 'By default, all commands that you registered in your app are allowed to be used by all the windows and webviews of the app. To change that, consider using AppManifest::commands.' Other rules are general security reasoning, scoped command by command."
    },
    "techniques/host-forwarded-key-contract.md": {
      "disposition": "keep",
      "reason": "Boundary claim verified: MDN defines isTrusted false for events dispatched via dispatchEvent(), and the UI Events rule (as cited in Chromium's intent to ship) is that untrusted events do not invoke default actions, click being the only legacy exception, which does not affect the keyboard case described."
    },
    "applications/react--permission-gate-vector.md": {
      "disposition": "keep",
      "reason": "Re-read the pinned useDictationReadiness.ts: lines 85-90 and allReady at 95, the web 'treat both as granted' at 78-81 and the poll stop condition at 64-75 match the citations. Other anchors not reopened; verified_on unchanged."
    },
    "applications/rust--capability-presence-contract.md": {
      "disposition": "keep",
      "reason": "Shows the class-collapse defect concretely and states the fix; anchors not reopened this run, verified_on unchanged."
    },
    "applications/rust--layout-resolved-input-synthesis.md": {
      "disposition": "keep",
      "reason": "Quotes both host comments and the fallback constant; the anchor note already corrects a stale spec range. Anchors not reopened, verified_on unchanged."
    },
    "applications/rust--native-owned-stream.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: replaced '45 s is 15 s x (1 missed beat + 1) with a full interval of slack' (15 x 2 = 30, not 45) with the formula-plus-margin reading; every speak_monitor.rs citation re-checked at the pinned commit (1-8, 16-28, 36-42, 44-48, 63-86, 89-92, 109, 114-117) plus useDictationReadiness.ts 61-76, so verified_on moved to 2026-10-31."
    },
    "applications/rust--native-side-owns-the-target-set.md": {
      "disposition": "keep",
      "reason": "Read-only witness with its exploitability limit stated; the manifest finding is consistent with the Tauri default verified above. Anchors not reopened, verified_on unchanged."
    },
    "applications/rust--non-stealing-overlay.md": {
      "disposition": "keep",
      "reason": "Teardown order, Linux compile-out reason and verified activation ordering are quoted from the tree; the missing native-side watchdog is disclosed. Anchors not reopened, verified_on unchanged."
    }
  }
}
```
