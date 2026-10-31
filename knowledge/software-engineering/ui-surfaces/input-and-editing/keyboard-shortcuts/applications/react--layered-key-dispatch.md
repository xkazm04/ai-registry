---
layer: application
type: application
subject: keyboard-shortcuts
technique: layered-key-dispatch
stack: react
status: forged
verified_on: 2026-10-31
verified_against: react@19
---

# React — a capture-phase guide layer over the screen, Escape on the overlay stack

Citations are against the public tree
[xkazm04/afterlife](https://github.com/xkazm04/afterlife) at `009c7893` (main), a
server-rendered web control plane for agentic DevSecOps with a guided tour that
plays over the real screens. The tour is the overlay layer this technique is
about: while it plays, its arrow, Home/End and Space keys must win over the
screen beneath, which has its own keys and a focused table with type-ahead.

## One dispatch point per layer

`src/lib/keyboard/useHotkeys.ts` is the single dispatch point every layer uses.
`dispatchHotkey` runs the first matching entry and reports whether one matched,
`src/lib/keyboard/useHotkeys.ts:16` "returns whether one matched", and the
typing guard lives there once,
`src/lib/keyboard/useHotkeys.ts:20` "isTypingTarget(e.target)) continue;".
The hook attaches one document listener per call and reads handlers through a
ref, so a fresh array each render never re-subscribes and never moves the
listener in the queue,
`src/lib/keyboard/useHotkeys.ts:29` "Handlers are read through a ref". It skips
events an inner layer already handled and events an input method is composing,
`src/lib/keyboard/useHotkeys.ts:41` "if (e.defaultPrevented || e.isComposing) return;",
and in capture mode consumes only what it matched,
`src/lib/keyboard/useHotkeys.ts:42` "&& capture) e.stopPropagation();", on a
listener attached in the requested phase,
`src/lib/keyboard/useHotkeys.ts:44` "document.addEventListener('keydown', onKey, capture);".
Repeat handling is per entry: a `once` key's repeats are default-prevented but
never re-fired,
`src/lib/keyboard/useHotkeys.ts:12` "Ignore OS auto-repeat (a held key): for toggles such as play/pause".

## The guide layer hears first

`src/app/features/guide/hooks/useGuideKeys.ts` binds two capture-phase lists:
Shift+G opens the tour from any screen,
`src/app/features/guide/hooks/useGuideKeys.ts:35` "useHotkeys(OPEN, available && !on, true);",
and the playing keys are live only while it is on,
`src/app/features/guide/hooks/useGuideKeys.ts:36` "useHotkeys(PLAYING, on, true);".
The hook's comment states why capture,
`src/app/features/guide/hooks/useGuideKeys.ts:32` "focused table's type-ahead cannot take it".
The owner it avoids is the table's type-ahead predicate, which takes every
single printable character without Control, Meta or Alt except the slash,
`src/components/table/model/rowNavigation.ts:84` "e.key.length === 1 && e.key !== '/' && !e.ctrlKey".
The chord itself was the lesson: a bare letter was swallowed by a focused
table, and Shift+G replaced it,
`src/app/features/guide/model/keymap.ts:2` "a bare letter is a focused table's type-ahead".

## Escape goes to the stack

The guide declares an Escape entry so the reference page says what Escape does,
`src/app/features/guide/model/keymap.ts:12` "does: 'Leave the guide'", but
filters it out of its capture list,
`src/app/features/guide/hooks/useGuideKeys.ts:28` "k.key !== 'G' && k.key !== 'Escape'",
and registers on the overlay stack instead,
`src/app/features/guide/hooks/useGuideKeys.ts:37` "on ? onEscape(close) : undefined",
so a popover opened over the guide closes first,
`src/app/features/guide/hooks/useGuideKeys.ts:13-14` "so a popover opened over the guide closes first".
The stack's header records the incident behind the technique's "two
listeners on one node are not two layers" rule,
`src/components/overlays/escapeLayers.ts:2-3` "stopPropagation cannot part two listeners on one node",
and the fix: one listener per root hands Escape to the layer opened last,
`src/components/overlays/escapeLayers.ts:4` "the layer opened last hears Escape (the key is consumed)".

## Deviations

- **A declined key is still consumed.** The guide's Space handler declines on
  a focused button or link,
  `src/app/features/guide/hooks/useGuideKeys.ts:21` "e.target.closest('button, a')) return;",
  and the entry leaves the default alone,
  `src/app/features/guide/model/keymap.ts:11` "preventDefault: false", so the
  browser still presses the button. But `dispatchHotkey` has already returned
  true and the capture listener stops propagation, so no keydown listener on
  the focused control or its ancestors hears that Space. The rule "a handler
  that declines must not consume" is not met; the fix is a handler result or a
  condition on the declaration.
- **The typing guard is tag-based.** It recognises inputs, text areas, selects
  and editable content but not an element with a textbox or combobox role,
  `src/lib/keyboard/hotkeys.ts:36` "tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'".
- **Primary-modifier chords always pass the typing guard**,
  `src/lib/keyboard/useHotkeys.ts:8` "chords with `mod` always fire", where the
  technique passes only chords declared field-live. No editing chord is
  declared today, so the gap is latent.
- **The composition guard is the composing flag alone**
  (`src/lib/keyboard/useHotkeys.ts:41` "e.isComposing"), with no
  processing-key-code check on Enter, so an engine that fires the committing
  Enter after composition ends lets that Enter through to the dispatch.
- **The slash carve-out is a literal inside the table's predicate**
  (`src/components/table/model/rowNavigation.ts:84` "e.key !== '/'"), not
  derived from the declaration that binds the slash.
