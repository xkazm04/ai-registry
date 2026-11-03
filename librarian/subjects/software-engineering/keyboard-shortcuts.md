---
subject: keyboard-shortcuts
domain: software-engineering
last_touched: 2026-11-03
dry_streak: 0
---

# keyboard-shortcuts

First note. The subject was harvested on 2026-10-27 from one react tree, an agentic
DevSecOps control plane (afterlife 009c7893). A Curator dispatch ranked it on "single stack
(react)".

## State

4 techniques and 4 applications:
- 2 `react`, from afterlife 009c7893;
- 2 `rust`, from personas 3cb920506a (its OS-level push-to-talk accelerator), applying
  shortcut-collision-rules and repeat-composition-and-odd-events.

declared-keymap-authority still has only its react application. The personas tree touches it
only as a deviation: the chord is written twice, once as an accelerator string and once as an
in-app predicate.

## 2026-11-03 - deepen (ks-deepen-1103)

Landed in 1c57a4971, with the catalog in edb927fa5. Lanes:
- **`check-currency --volatile --subject`.** 0 dated facts in 7 documents. The subject
  states no vendor-set figure.
- **Field.** A per-repo git grep for non-web key handling found personas' Tauri global
  shortcut command (Rust) and its two frontend halves. The crate source was read from the
  local cargo registry at the versions the lockfile pins (global-hotkey 0.8.0,
  tauri-plugin-global-shortcut 2.3.2). The same grep turned up two further react trees with
  layered dispatch: personas' priority registry and gravitone's pure keymap router. Anchors
  held against git-archive exports: 10/10 and 1/1 (personas), 26/26 and 20/20 (afterlife,
  unchanged at 009c7893).
- **Counter-evidence (web, primary pages fetched and quoted verbatim).**
  - The W3C Understanding page for 2.1.4 says character keys include "upper- and lower-case
    letters", and "What matters is that a shortcut relies on a printable character ... and
    not the number of physical keyboard keys". This refuted the technique's "Shift plus a
    letter is the lightest modifier that type-ahead ignores", and the golden path's
    "modified chord" default as it read for Shift.
  - The cited tree refutes the type-ahead half too. Its `isTypeAhead` predicate excludes
    Control, Meta and Alt, not Shift.
  - Microsoft Learn: the RegisterHotKey page (MOD_NOREPEAT; the refusal is scoped to other
    registrations) and About Keyboard Input (virtual-key code versus layout-independent scan
    code).
  - The W3C UI Events code table ("KeyA" is labelled q on AZERTY).
- **Training-data only (blind).** One agent, no tools, six neutral questions. It converged
  on every landed claim:
  - Shift+G and "?" are in scope of 2.1.4;
  - type-ahead accepts capitals;
  - an overlay over a mounted route needs a modal key scope, and `inert` does not stop a
    document listener;
  - MOD_NOREPEAT applies, and there is no release message;
  - Windows virtual-key codes depend on the layout, while macOS kVK codes are positional.

  It added one bound: a successful OS registration does not prove there is no conflict.
  That bound was adopted, worded from Microsoft's own text. Its claim that macOS
  registration usually succeeds despite a conflict (medium-low confidence) was not landed.

Landed:
- **shortcut-collision-rules (flipped).** Shift is not a non-printing modifier. A global
  Shift+letter needs the off switch or the remap, like a bare letter. A new decision rule:
  for an OS-registered accelerator the registration is the collision check, and the check
  is one-sided. The golden path follows, with a new failure-mode clause.
- **layered-key-dispatch (condition added).** "Claiming the keyboard is not matching a key".
  A covering layer claims, and a see-through layer passes keys down. Claiming ends the walk
  down the layers, not the event's propagation. The rule converged from two independent
  trees: personas' "exclusive" registrations (commit 363ea0eaea, where one arrow press
  rejected a card and a backlog row behind an opaque deck) and gravitone's per-kind
  `claimsKeys` policy. The golden path gains the rule and the "opaque overlay that only
  consumes" failure mode.
- **Two rust applications.**
- **The react layered-key-dispatch application** gains a deviation: Shift+G is a global
  character-key shortcut with no off switch. Its anchors were re-checked and verified_on
  was moved.

Applied (gravitone, a harness over the tree's pure route() exported from origin/main
db5e225f):
- claim rule, experiment, better (A 3 of 5, B 5 of 5);
- Shift flip, experiment, better (a capital E, L or G fires send-edit-plan, lock and gap
  outside a field).

No code changed. Rows were committed locally in gravitone's `.ai/applied.jsonl` (e3999bc8).

Declined: none.

Banked:
- **personas in-app chord.** The predicate matches Control or Meta, never checks Alt, and has
  no repeat filter. Read, not run, the held chord should toggle the voice turn with each
  auto-repeat while the global feature is off. Return: a personas pass that touches the orb
  layer. The likely fix is to bind it through a declared table, using the same accelerator
  string.
- **gravitone off switch.** Gravitone has no shortcut off switch for its Shift and bare-letter
  page-mode keys. Return: when it grows a keyboard settings surface.
- **A cross-platform global accelerator binds by character on one platform and by position on
  the other.** It is documented in the rust application, but untested. Return: a project that
  ships a global accelerator to a non-US layout user.
- **declared-keymap-authority.** gravitone's `chord.ts` (caps parsed into chords, with "⇧1"
  matched by both character and code) is a candidate for its second application. That
  application would be a third react tree, not a new stack.

## Impact

The map was regenerated across 12 projects. No judged pair exists for this subject, so
nothing is on any project's `/conform --stale` queue. Pairs: gravitone 1, kp 1
(lexical-only), paypal 1 and overlord 1, all `state: unknown`. personas is not joined,
although it has two real seams (the global accelerator and the priority registry). All 12
maps were committed locally on each project's active branch, unpushed.
