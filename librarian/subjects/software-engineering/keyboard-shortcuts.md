---
subject: keyboard-shortcuts
domain: software-engineering
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# keyboard-shortcuts

## Architecture review - 2026-10-31

First review, against `a5a09a30c`. All seven documents were read in full. The
layering, the declared-keymap authority and the Escape hand-off to the overlay
stack hold. Three load-bearing claims fail against primary sources:

- WCAG 2.1.4 counts "upper- and lower-case letters" as character keys, and its
  remap option asks for "non-printable keyboard keys (e.g., Ctrl, Alt)". Shift
  plus a letter is therefore still a character-key shortcut. The collision rules
  present Shift plus a letter as the light modifier that escapes type-ahead and
  imply it escapes the criterion. The cited application's own type-ahead
  predicate takes any single-character key without Control, Meta or Alt, so it
  takes Shift+G too. Shift+G works over a focused table there only because it is
  heard in capture.
- In one engine the Enter that confirms an IME composition arrives after
  `compositionend`, with `isComposing` already false (WebKit bug 165004; the
  Chrome guidance pairs `isComposing` with key code 229, gated on Enter). Gating
  on the composing flag alone misses exactly the Enter the technique names.
- `aria-keyshortcuts` names the keys pressed, not the character produced
  (MDN: "Shift+2", not "@"). The authority technique says "the attribute's own
  syntax" but not this, and its declarations are character-matched.

All application citations at `009c7893` were re-read from the public tree and
match. The repo-wide claim "no other control announces one" was not re-checked
(no full-tree search was possible this run).

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/keyboard-shortcuts",
  "date": "2026-10-31",
  "baseline": "a5a09a30c",
  "digest": "sha256-b2:4a9b32a38c928955",
  "disposition": "clarify",
  "trigger": "First architecture review; subject pending.",
  "intended_benefit": "A shortcut layer whose key choices meet the character-key criterion as written, whose composition guard catches the committing Enter in every engine, and whose announced shortcuts name the keys a user presses.",
  "failure_if_ignored": "A team following the collision rules ships Shift+letter globals believing they are exempt from WCAG 2.1.4 and from type-ahead; a Safari IME user's committing Enter runs a shortcut.",
  "boundary": "Application accelerators above widgets. Widget keyboard models stay with accessibility; Escape and dismissal stay with the overlay stack.",
  "coverage": "All 7 documents read in full. Primary sources opened: WCAG 2.2 Understanding 2.1.4, MDN aria-keyshortcuts, MDN KeyboardEvent.isComposing, Chrome IME-safe Enter guidance, WebKit bug 165004 (via search result). Every application citation at xkazm04/afterlife 009c7893 re-read from raw files. Not evaluated: the WAI-ARIA spec text itself (page too long to reach the section), any runtime behaviour, and the repo-wide negative claim about announced shortcuts.",
  "counterexamples": [
    "Shift+G produces the printable character 'G'; a type-ahead predicate testing key.length === 1 without Control, Meta or Alt takes it, and WCAG 2.1.4 counts it as a character-key shortcut.",
    "In Safari the Enter confirming an IME composition fires keydown after compositionend with isComposing false, so a guard on isComposing alone lets it through.",
    "A shortcut declared as '?' announced as aria-keyshortcuts='?' names the character, where the attribute asks for the keys pressed (Shift+/ on a US layout).",
    "A one-screen tool with two shortcuts gains nothing from tables and an inventory test (the authority technique's own boundary)."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html",
      "result": "SC 2.1.4 (Level A) applies to shortcuts 'using only letter (including upper- and lower-case letters), punctuation, number, or symbol characters'; options are turn off, 'remap the shortcut to include one or more non-printable keyboard keys (e.g., Ctrl, Alt)', or active only on focus; the '?' example is typed with Shift+/ and still in scope; listbox type-ahead is unaffected because it is focus-scoped. Refutes Shift as an exempting modifier."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-keyshortcuts",
      "result": "'it has no effect on the functionality of the page'; modifiers first, exactly one non-modifier last; 'The key combination listed must be the keys the user needs to press, not the outcome ... \"Shift+2\", not \"@\"'; value case-insensitive. Supports announce-not-bind; adds the keys-not-character rule."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/isComposing",
      "result": "isComposing is true between compositionstart and compositionend; 'not Baseline'. Supports the composition rule, not its completeness."
    },
    {
      "url": "https://developer.chrome.com/docs/modern-web-guidance/guides/forms/ime-safe-enter-submit",
      "result": "Safari: 'By the time the keydown handler ran, event.isComposing had already been reset to false'; recommended check 'event.isComposing || event.keyCode === 229', nested under the Enter gate so it is 'safe from mobile virtual keyboards that might use 229 for normal character layout entry'. Refutes the flag as sufficient."
    },
    {
      "url": "https://bugs.webkit.org/show_bug.cgi?id=165004",
      "result": "Seen via search result only: Safari sends the confirming Enter keydown with isComposing false. Not opened directly; corroborates the Chrome guidance."
    },
    {
      "url": "https://github.com/xkazm04/afterlife/tree/009c7893",
      "result": "Raw files re-read: useHotkeys.ts, hotkeys.ts, keymap.ts, guide keymap and hook, screenKeys.ts and both tests, task keys.ts, TopBar.tsx, rowNavigation.ts, escapeLayers.ts. Every quoted line matches at its cited line. useHotkeys.ts:41 guards on e.isComposing only; rowNavigation.ts:84 takes any single-character key without Control, Meta or Alt, Shift included."
    }
  ],
  "documents": {
    "keyboard-shortcuts.md": {
      "disposition": "clarify",
      "reason": "'The reliable default for an application-wide accelerator is a modified chord' needs the modifier to be non-printing (primary modifier or Alt): Shift plus a letter is still a printable character under WCAG 2.1.4 and to type-ahead predicates."
    },
    "techniques/declared-keymap-authority.md": {
      "disposition": "clarify",
      "reason": "The announced-shortcut bullet should say the attribute names the keys the user presses, not the character produced (MDN 'Shift+2', not '@'), which matters because declarations are character-matched."
    },
    "techniques/layered-key-dispatch.md": {
      "disposition": "keep",
      "reason": "Innermost-wins order, capture for overlays, consume-only-on-match, same-node listeners not parted by stopPropagation, decline-must-not-consume and Escape to the stack are all correct and consistent with the cited incident."
    },
    "techniques/repeat-composition-and-odd-events.md": {
      "disposition": "clarify",
      "reason": "The committing Enter can arrive with the composing flag already false in one engine (Safari); the guard must also treat the processing key code (229) as composing on Enter, per Chrome guidance."
    },
    "techniques/shortcut-collision-rules.md": {
      "disposition": "clarify",
      "reason": "'Shift plus a letter is the lightest modifier that type-ahead ignores' is refuted: the character-key criterion includes upper-case letters and the cited type-ahead predicate takes Shift+G. Shift+letter survives a focused composite only when heard in capture, and still needs off switch, remap or focus scope. The criterion section and the table/list decision rule need the non-printing qualifier."
    },
    "applications/react--declared-keymap-authority.md": {
      "disposition": "clarify",
      "reason": "Citations re-verified at 009c7893. The bare-letter deviation should also name the guide's global Shift+G, which is a character-key shortcut under 2.1.4 with no off switch or remap. The 'no other control announces one' claim was not re-checked."
    },
    "applications/react--layered-key-dispatch.md": {
      "disposition": "clarify",
      "reason": "Citations re-verified at 009c7893. Add a deviation: the composition guard is e.isComposing alone (useHotkeys.ts:41), so Safari's committing Enter is not skipped."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied all six clarify items the first 2026-10-31 record named, each from a
primary source opened this run. Both applications had every citation re-read at
`009c7893`, so their `verified_on` moved to 2026-10-31; the repo-wide "no other
control announces one" claim was left as written and is still unchecked.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/keyboard-shortcuts",
  "date": "2026-10-31",
  "baseline": "a5a09a30c",
  "digest": "sha256-b2:f930edf1713b8d6d",
  "disposition": "keep",
  "trigger": "Clarify items from the first 2026-10-31 record applied in the same run.",
  "intended_benefit": "Key-choice, composition and announcement rules now match WCAG 2.1.4, the aria-keyshortcuts syntax and current IME event ordering.",
  "failure_if_ignored": "Not applicable; the items were applied.",
  "boundary": "Application accelerators above widgets. Widget keyboard models stay with accessibility; Escape and dismissal stay with the overlay stack.",
  "coverage": "All 7 documents decided; the six edited sections re-read after editing. The layered-key-dispatch technique is byte-unchanged. Sources as in the first 2026-10-31 record. Not evaluated: runtime behaviour, the WAI-ARIA spec text itself, and the repo-wide negative claim about announced shortcuts.",
  "counterexamples": [
    "Shift+G produces the printable character 'G'; a type-ahead predicate testing key.length === 1 without Control, Meta or Alt takes it, and WCAG 2.1.4 counts it as a character-key shortcut.",
    "In Safari the Enter confirming an IME composition fires keydown after compositionend with isComposing false, so a guard on isComposing alone lets it through.",
    "A shortcut declared as '?' announced as aria-keyshortcuts='?' names the character, where the attribute asks for the keys pressed (Shift+/ on a US layout).",
    "A one-screen tool with two shortcuts gains nothing from tables and an inventory test (the authority technique's own boundary)."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html",
      "result": "Re-read 2026-10-31: 'using only letter (including upper- and lower-case letters), punctuation, number, or symbol characters'; remap to 'non-printable keyboard keys (e.g., Ctrl, Alt)'. Basis for the Shift qualifier in the golden path and collision rules."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-keyshortcuts",
      "result": "'the keys the user needs to press, not the outcome ... \"Shift+2\", not \"@\"'. Basis for the announced-shortcut sentence."
    },
    {
      "url": "https://developer.chrome.com/docs/modern-web-guidance/guides/forms/ime-safe-enter-submit",
      "result": "'event.isComposing had already been reset to false'; 'event.isComposing || event.keyCode === 229' under the Enter gate. Basis for the composition sentence and the react deviation."
    },
    {
      "url": "https://github.com/xkazm04/afterlife/tree/009c7893",
      "result": "All quoted lines re-read and matching; basis for the two added deviations and the verified_on move."
    }
  ],
  "documents": {
    "keyboard-shortcuts.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the reliable default is now 'a chord with a non-printing modifier (the primary modifier or Alt)', with one sentence saying Shift alone does not count and why."
    },
    "techniques/declared-keymap-authority.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the announced-shortcut bullet now names the keys pressed rather than the character produced ('Shift+2', not '@'), including for character-matched entries such as '?'."
    },
    "techniques/layered-key-dispatch.md": {
      "disposition": "keep",
      "reason": "Innermost-wins order, capture for overlays, consume-only-on-match, same-node listeners not parted by stopPropagation, decline-must-not-consume and Escape to the stack are all correct and consistent with the cited incident."
    },
    "techniques/repeat-composition-and-odd-events.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added that one engine fires the committing Enter with the composing flag already false, so on Enter the processing key code is also treated as composing, gated on Enter for virtual keyboards."
    },
    "techniques/shortcut-collision-rules.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the criterion now names upper-case letters and 'non-printing key such as Control or Alt'; Shift plus a letter is described as the lightest chord but not a non-printing one, surviving a focused composite only in capture and still owing off switch, remap or focus scope; the table/list decision rule now asks for a non-printing modifier or capture."
    },
    "applications/react--declared-keymap-authority.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the bare-letter deviation now also names the guide's global Shift+G; every citation re-read at 009c7893 and verified_on moved to 2026-10-31. The repo-wide 'no other control announces one' claim remains unchecked."
    },
    "applications/react--layered-key-dispatch.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the deviation that the composition guard is e.isComposing alone (useHotkeys.ts:41) with no processing-key-code check on Enter; every citation re-read at 009c7893 and verified_on moved to 2026-10-31."
    }
  }
}
```
