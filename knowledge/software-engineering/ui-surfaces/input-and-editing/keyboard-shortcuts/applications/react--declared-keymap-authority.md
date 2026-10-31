---
layer: application
type: application
subject: keyboard-shortcuts
technique: declared-keymap-authority
stack: react
status: forged
verified_on: 2026-10-31
verified_against: react@19
---

# React — screen keymaps as plain data, a derived Keyboard page, and an inventory walk

Citations are against the public tree
[xkazm04/afterlife](https://github.com/xkazm04/afterlife) at `009c7893` (main).
Every screen that answers to keys, and the guided tour over them, declares a
keymap once; its hook binds handlers to that declaration by id, and the
Settings Keyboard page renders the same declarations.

## The declaration and binding by id

The keymap module states the contract in its header: the screen's hook binds handlers
`src/lib/keyboard/keymap.ts:2` "to it by id (bindKeymap), and the Settings reference reads the same declaration",
and keeps the tables plain data so a server-rendered page reads them without
mounting a screen,
`src/lib/keyboard/keymap.ts:2-3` "Pure and server-safe".
`bindKeymap` is the structural check the technique asks for,
`src/lib/keyboard/keymap.ts:34` "Throws on a declared id without a handler and on a handler without a declared id",
in both directions:
`src/lib/keyboard/keymap.ts:37` "no key declared for handler" and
`src/lib/keyboard/keymap.ts:40` "no handler for". An entry binds one handler for
all its keys or one per key in order, so a film with three takes binds digits
1-3 of the declared 1-8,
`src/lib/keyboard/keymap.ts:26` "a film of three takes binds 1-3 of the declared 1-8".

The guide's table is a compact example — ids `open`, `prev`, `next`, `ends`,
`play`, `leave`, each with keys and a `does` label, and the `once` repeat
policy on the toggles,
`src/app/features/guide/model/keymap.ts:7` "{ key: 'G', shift: true, once: true }".
The matcher spells the platform modifier once,
`src/lib/keyboard/hotkeys.ts:1` "`mod` means Cmd on macOS or Ctrl elsewhere",
treats Shift as three-valued,
`src/lib/keyboard/hotkeys.ts:8` "When absent, Shift is ignored",
and answers no match rather than throwing on a key-down without a key,
`src/lib/keyboard/hotkeys.ts:21` "Chrome fires one when it autofills a field".

## The page derives, and two tests hold it

The Settings data module maps each imported keymap to its rows with `capsOf`,
`src/app/features/settings/data/screenKeys.ts:1` "derived from the keymaps each screen's hook binds",
so a row cannot drift from its table. Its import list is the remaining hand
copy, and the coverage test closes it by walking the features tree for every
module that declares a keymap,
`src/app/features/settings/data/keymapCoverage.test.ts:7` "read against every keymap declared on disk, not against a hand list of screens".
It asserts the walk found something,
`src/app/features/settings/data/keymapCoverage.test.ts:19` "expect(declaring.length).toBeGreaterThan(5);",
before asserting nothing is missing,
`src/app/features/settings/data/keymapCoverage.test.ts:26` "expect(missing).toEqual([]);".

The second test pins derived ranges to their ground truth — the tier filter
is read from the real tier list,
`src/app/features/settings/data/screenKeys.test.ts:26` "names the Ladder tier filter by the real tier count",
and the take keys from the real take cap,
`src/app/features/settings/data/screenKeys.test.ts:29` "names the Theater take keys by the real take cap"
— and counts the key hooks on disk against the page's screens,
`src/app/features/settings/data/screenKeys.test.ts:32` "has a row for every screen that registers a useXKeys hook",
`src/app/features/settings/data/screenKeys.test.ts:44` "expect(SCREEN_KEYS.length).toBe(hooks.length);".
That count is what forced a Settings row when a new key hook landed.

## Deviations

- **Bare-letter screen keys without an off switch.** The task screen declares
  `r`, `w`, `f` and `n` as unmodified letters live across the screen,
  `src/app/features/task/model/docket/keys.ts:44` "{ id: 'replay', keys: [{ key: 'r' }], does: 'Replay' }",
  not only while one component has focus. The character-key criterion asks
  for an off switch, a remap to a modifier chord, or focus scoping; none exists.
  The guide's global Shift+G is in the same position: the criterion counts
  upper-case letters, so Shift does not take it out of scope.
- **The announced shortcut is hand-written, not derived.** The declarations
  feed handlers and the page, but the one control that announces its
  shortcut spells it as a literal,
  `src/app/features/about/components/TopBar.tsx:10` "'aria-keyshortcuts': 'Escape'",
  rather than reading the entry it accelerates, and no other control
  announces one.
- **No same-scope collision check.** Nothing rejects two entries in one table
  that share a chord; the dispatcher silently runs the first.
