# XL spec — `native-shell-integration`

- **Run:** `intake-voicebox-0903`
- **Source:** `github:jamiepine/voicebox` @ `51f49dea198384b4eb6087b72c17057c6eb1c1cd`
- **Status:** DISPATCHED
- **Routing count (Phase 2d):** system E, **4 `corpus: NONE`**, all four sharing one home-if-new. Both v2.2 clauses fire.

## Placement (verified against the authority, not against a count)

`knowledge/software-engineering/taxonomy.json` — `layout: "nested"`; it is the
AUTHORITY and the folder tree is derived from it.

- `client-architecture` is **flat**, holds **7** subjects, and is the home:
  `client-fetch-cache, client-state, i18n, ipc-contract, realtime-events,
  hash-pinned-translation-pipeline, demo-data-plane` → add `native-shell-integration` as the 8th.
- **Not** `llm-agent/runtime-and-io` — at **10 subjects, its cap**.
- **Not** `ui-surfaces/shell-and-navigation` — `app-shell` there is a web shell
  (`next,react,spec`); three of the four decisions are about the native↔OS and
  native↔web boundaries, not about a UI surface.
- Resulting link depth from a technique to `_laws.md`: `../../../_laws.md`
  (flat category → subject → techniques/). Golden path to a sibling subject:
  `../ipc-contract/ipc-contract.md`.

## The boundary this subject must state, and must NOT absorb

- **`ipc-contract`** owns the *shape* of what crosses the two-world boundary —
  generated types, drift gates, error mapping, naming. It states its own scope
  and explicitly hands off: *"Opening a second transport is a different subject."*
  This subject owns **what the native side owns at all**, not the shape of the
  calls. Do not restate generated-type discipline.
- **`sidecar-provisioning`** owns acquiring and supervising engine processes and
  model files. Do not absorb process supervision — cite it.
- **`voice-io/transcript-handoff-receipts`** already owns delivering text into a
  foreign application through the clipboard/keystroke channel, including the
  ownership-token rule. **Do not rewrite it.** This subject may cite it as the
  worked example of the general rule in T3, and must not restate its four
  receipt rules.
- **`ui-surfaces/shell-and-navigation/app-shell`** owns the web shell. State the
  discriminator in the golden path's opening: this subject applies when the
  product ships a native process that holds capabilities the presentation layer
  cannot reach at all.
- **`security/device-pairing`** and **`mcp-tools/transport-selection`** own the
  local-listener trust question. Do not absorb it.

## Proposed techniques

**T1 `permission-gate-vector`**
Two capabilities granted by the host OS are not one "permissions OK" boolean.
They have different blast radii: one makes the feature *dead* (no event is ever
delivered, so arming is pointless), the other is swallowed *silently* while the
rest of the pipeline still works. The gate that arms the feature includes only
the first; the second is surfaced as a degraded notice, so the user keeps the
share of the feature that functions. Neither API errors visibly, so state must
be polled up front rather than discovered by trying; the host never re-prompts
after a first denial, so the system dialog cannot be the UI; and the grant
happens **out of band**, in a settings surface the product does not control —
so the product reconciles on regaining focus rather than on restart.
Decision rule it must carry: *for each capability, does its absence kill the
feature or degrade it? Only the killers gate.*

**T2 `non-stealing-overlay`**
An overlay that annotates another application's work must never take focus,
because the product's whole pipeline depends on the user's original focus
staying put. Hiding it is not one call: on at least one platform a transparent
always-on-top window survives its own hide as an invisible click target that
steals focus back. The teardown is therefore defence in depth — suppress hit
testing, park off-viewport, then hide — and the show path deliberately omits
the focus call. One platform cannot perform the hit-test suppression at all
before the window is realized (the call aborts the process), so the capability
is compiled out there rather than guarded at runtime. Carry the rule that a
window manager's hide is a *request*, and that a defensive teardown is judged
by what remains clickable, not by what remains visible.

**T3 `layout-resolved-input-synthesis`**
Synthesizing input into a foreign application means producing an event the
*target* will interpret, and the target's interpretation layer is not the
product's. On one platform the dispatch matches the layout-translated
character, so a hardcoded physical key fires the wrong command under a
non-default layout; on another the raw virtual key is delivered regardless of
layout, so hardcoding is correct there. **Two platforms, two correct answers**
— which is the point: the technique is not "resolve the key", it is *identify
which layer the target matches on, and resolve at that layer.* The resolution
is done once at startup and refreshed on the host's own layout-change
notification (it must run on the main thread, so it cannot be lazy inside the
hot path), read from a lock-free cell, with a conservative fallback constant
for when the host reports no usable layout data.
Cite `voice-io/transcript-handoff-receipts` as the delivery discipline this sits
under; do not restate it.

**T4 `native-owned-stream`**
A long-lived stream owned by a presentation context that the host is entitled to
throttle is unreliable by construction, and no amount of reconnect logic fixes
it: a hidden or backgrounded view has its network suspended by policy, not by
error. Move stream ownership to the process the host does not throttle and fan
events out over the local bus, leaving the view a pure renderer. The split is
deliberate and partial — a stream that only matters while the view is visible
may stay in the view, with a hard cap as its backstop. Carry the sizing rule
for the idle timeout: it is set against the *producer's* heartbeat interval so
it absorbs exactly one missed beat, and the reconnect backoff resets on a round
that produced a frame, not on one that merely connected.

**T5 `host-answerable-abstraction-scope`** *(optional — the worker may drop it
with an argument, or promote it into the golden path)*
When one core ships under several hosts, the injected host interface should
carry **what every host can answer differently**, and the capabilities only one
host can answer at all should be reached directly behind a capability flag.
An interface method whose only implementation elsewhere is `throw` buys nothing
over a guarded direct call and forces every future host to satisfy a member no
host can. The cost is visible and must be stated: the escape hatch is a guarded
call or a swallowed rejection, not a null object, and the count of such calls is
the metric that says whether the line was drawn in the right place.

## Open questions the drafter must DECIDE, not discover

1. Does T3 belong here or as a technique of `voice-io/transcript-handoff-receipts`?
   Decide from where the *decision* is made, not from where the source's code sits.
   Argue it either way and record which.
2. T5 — subject-level organizing principle, a technique, or a golden-path
   section? If it reads as the golden path's thesis, promote it and land four
   techniques rather than five.
3. Whether the golden path names a fifth stage this subject implies but no
   entry covers: what the native side owes the presentation layer when a
   capability is absent on this platform entirely (T2's compiled-out case, and
   a whole platform with none of the delivery paths built).
4. Whether any of the five earns a law proposal. Do not add one; return it.

## Evidence a reader can open

Source clone (deleted at Phase 9; anchors verified by two independent readers):
`tauri/src-tauri/src/main.rs:1417-1435` (the three-call teardown),
`:84-121` (the platform carve-out), `:1216-1253` (borrow/restore),
`hotkey_monitor.rs:271-273` (show path omits focus),
`keyboard_layout.rs:1-32,69-80` (layout resolution + fallback constant),
`synthetic_keys.rs:20-30` (the other platform hardcodes, correctly),
`speak_monitor.rs:1-42` (stream ownership + 45 s idle against a 15 s producer ping),
`app/src/lib/hooks/useDictationReadiness.ts:10,32-44,85-90` (the gate vector),
`input_monitoring.rs:43-68,86-92`, `accessibility.rs:1-17,34-42`,
`InputMonitoringGate.tsx:164-172` (reconcile on refocus),
`app/src/platform/types.ts:74-80` (the five-member closure).

## Purity

The upper layers carry no product, vendor, OS, framework or tool names. Every
technique above is already written in stripped form; keep it that way. "One
platform" / "another platform" is the correct register — naming them is the
failure `check-bundles.mjs` catches.
