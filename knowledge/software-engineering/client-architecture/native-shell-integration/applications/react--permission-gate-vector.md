---
layer: application
type: application
subject: native-shell-integration
technique: permission-gate-vector
stack: react
status: forged
verified_on: 2026-09-03
verified_against: react@18
---

# The dictation readiness vector in Voicebox

Witness: the `voicebox` desktop application (a Tauri 2 shell over a React 18
frontend and a Python backend), read at commit
`51f49dea198384b4eb6087b72c17057c6eb1c1cd`. The React version is the one
`app/package.json:51` declares (`"react": "^18.3.0"`); the permission surfaces
below are React hooks, and the native queries they call are Tauri commands.

## The vector is declared once and produces three answers

`app/src/lib/hooks/useDictationReadiness.ts:10` declares the gate vocabulary as
a closed union — `type ReadinessGate = 'stt' | 'llm' | 'input_monitoring' |
'accessibility'` — and lines 85-90 derive everything from it in one place:

```ts
const missing: ReadinessGate[] = [];
if (!sttReady) missing.push('stt');
if (!llmReady) missing.push('llm');
if (!inputMonitoring) missing.push('input_monitoring');
if (!accessibility) missing.push('accessibility');
const canRecord = sttReady && llmReady && inputMonitoring;
```

Three products, one declaration: `missing` is what the checklist renders,
`canRecord` is what the record control binds to, and `allReady` (line 95) is
`missing.length === 0` for onboarding. The technique's rule that the three must
not be three independent conjunctions is met.

## The blast-radius split is explicit and correctly drawn

`canRecord` omits `accessibility` on purpose, and the hook's doc comment
(`:32-34`) states the reasoning in the technique's own terms: "``canRecord``
covers the gates that must be green before the chord can start recording.
``allReady`` also includes Accessibility, which only gates synthetic paste —
dictation still records and lands in Captures without it."

That is the killer/degrader classification, made per feature rather than per
capability. Input Monitoring is a killer — without it the global keyboard tap
observes nothing and the chord never fires
(`tauri/src-tauri/src/input_monitoring.rs:1-6`). Accessibility is a degrader —
without it `CGEventPost` silently drops the paste keystrokes
(`tauri/src-tauri/src/accessibility.rs:1-10`), but the transcript still lands
in the app's own capture list. Both are still rendered in `missing`, so the
user is told about the degrader without being blocked by it.

## Poll, do not try — and the prompt is separated from the query

`input_monitoring.rs:42-58` declares the two IOKit entry points as separate
functions with the distinction commented at the declaration:

- `IOHIDCheckAccess(kIOHIDRequestTypeListenEvent)` — "Returns the current
  access state as an `IOHIDAccessType` enum (Granted=0, Denied=1, Unknown=2).
  No prompt side-effect."
- `IOHIDRequestAccess(...)` — "Returns true when access is already granted;
  otherwise queues the system prompt and returns false synchronously. Safe to
  call repeatedly — once the entry exists in the Input Monitoring pane macOS
  won't re-prompt."

The three-valued enum is handled at the FFI boundary rather than at the call
site, and the comment at `:47-49` records why: declaring the return as `bool`
rather than `c_uint` is "undefined behaviour that silently inverts our gate".
`is_trusted()` at `:61-64` compares against `ACCESS_TYPE_GRANTED` explicitly
rather than truth-testing.

The prompting call is invoked from exactly one place — `enable_hotkey`, on the
user's own toggle — and the module comment (`:21-23`) names the reason: "so the
prompt fires from a deterministic, user-initiated point (the Captures toggle)
instead of as a side-effect of keytap's `Tap` creating its CGEventTap."

## Reconciliation on refocus, and polling only for what changes silently

`app/src/components/InputMonitoringGate/InputMonitoringGate.tsx:38-46` is the
out-of-band reconciliation, and the hook comment at `:15-16` states the model:
"Re-checked on mount and on window focus (cheap way to pick up the user
flipping the toggle in System Settings and alt-tabbing back)."

```ts
useEffect(() => {
  if (!platform.metadata.isTauri) return;
  recheck();
  const onFocus = () => { recheck(); };
  window.addEventListener('focus', onFocus);
  return () => window.removeEventListener('focus', onFocus);
}, [platform.metadata.isTauri, recheck]);
```

The model-readiness half of the same vector is polled instead, and the query at
`useDictationReadiness.ts:68-75` stops polling once both models are ready,
because "the endpoint's answer can't change until the user swaps models in
settings, and that path invalidates the query explicitly". That is exactly the
technique's split: poll what changes without the user leaving; refocus-check
what the user changes by leaving.

`AccessibilityGate.tsx` carries the same shape for the second capability, and
`useDictationReadiness.ts:50-59` composes both hooks rather than duplicating
either.

## Where the tree falls short

**A failed check is reported as a denial.** `InputMonitoringGate.tsx:30-32`:

```ts
} catch (err) {
  console.warn('[input-monitoring] check failed:', err);
  return false;
}
```

The catch returns `false` — the same value the caller receives for a genuine
denial — while leaving `needsPermission` at its previous value. So
`recheckInputMonitoring()` reports "denied" for an invoke that never reached
the native side, and the state the checklist renders and the value the caller
branches on can disagree. The standard is unchanged: the failed query is its own
state, held distinct from denied, and surfaced as "the check could not run".

**The system prompt is fired at most once per install and nothing re-offers
it.** `IOHIDRequestAccess` is called on the first `enable_hotkey`; a user who
dismisses that dialog thereafter has only the inline notice's "open settings"
link. The notice exists and is durable, so the surface rule is satisfied — but
there is no second prompt attempt at a later, better-contextualised moment.

**Web treats absent as granted.** `useDictationReadiness.ts:78-81` maps both
capabilities to `true` on the non-desktop build ("there's no TCC layer — treat
both as granted"). That is the right *behaviour* and the wrong *representation*
— it stores presence in the grant boolean, which is the collapse
`capability-presence-contract` names. Nothing user-visible breaks here because
the web build never reaches the paste path; the same collapse does misfire on
the third desktop platform, which that technique's application records.
