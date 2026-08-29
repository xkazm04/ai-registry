---
layer: application
type: application
subject: terminal-multiplexing
technique: keystroke-injection
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
---

# The paste verb, and the four call sites that never learned it

*Verified against the project tree at `2b5e24223`.*

This technique's central claim is that injection is not string writing, and
its sharpest instance is the typed-versus-pasted distinction: whether a
newline submits depends on how it arrives, not on what byte it is. A tree
that has paid for that lesson usually shows one of two things — a correct
path, or the incident. This one shows both, in the same feature, roughly one
file apart, which makes it useful as evidence in a way a purely conformant
tree would not be.

## The correct path: a paste is framed, and the framing is conditional

`src/features/plugins/fleet/fleetTerminalManager.ts:575-613` is the
clipboard-to-PTY path, and its header comment states the technique's rule in
the technique's own terms (`:578-585`):

> Writing the text straight to the PTY was wrong in the one way that matters:
> a terminal's input is keystrokes, not text, and the typed-versus-pasted
> distinction is what decides whether a newline inserts a line or SUBMITS
> one. The framing that carries that distinction is bracketed paste
> (`ESC[200~ … ESC[201~`, DECSET 2004) and this path never emitted it — so a
> multi-line clipboard payload arrived as a sequence of submitted lines, and
> in a shell that means every line after the first EXECUTES.

The fix routes the payload through the emulator's own `paste()` rather than
through the raw write, and the comment names why that is the mechanism rather
than a wrapper: it normalizes CRLF/LF to CR, brackets the payload, and emits
through `onData` — "the same door a keystroke takes" (`:587-590`), which is
this technique's one-parser rule realized as a code path rather than as a
convention. The user's own typing enters through the same `onData` handler
(`:773-778`).

The load-bearing line is the condition:

```ts
m.term.paste(m.term.modes.bracketedPasteMode ? textRaw : textRaw.replace(/\r?\n$/, ''));
```

(`:609`). The trailing-newline strip survives, but only for a child that has
*not* enabled bracketed paste — where it is "the sole thing between a copied
line (which almost always ends in a newline) and an unintended submit"
(`:592-596`). Under brackets, stripping it would corrupt the payload, because
the child now decides what the newline means. That is the distinction stated
as a branch on the *child's declared mode*, not on the injector's guess, and
it is the part most implementations get wrong by applying one rule to both
cases.

Both paste doors converge on that one function: the context-menu handler
(`:793-798`) and the Ctrl+Shift+V / Cmd+V branch of
`attachCustomKeyEventHandler` (`:800-814`), the latter returning `false` only
for the paste chord so every other key still reaches the PTY.

## Framing asserted as bytes, not as behaviour

`src/features/plugins/fleet/__tests__/fleetTerminalManager.test.ts:718-792`
is the oracle, and it is written at the right altitude — it asserts the exact
byte string handed to the transport, so the brackets are the subject of the
test rather than an implementation detail behind it:

```ts
expect(vi.mocked(fleetApi.writeInput)).toHaveBeenCalledWith(
  'paste-bracketed',
  '\x1b[200~foo\rbar\rbaz\x1b[201~',
);
```

(`:739-754`, with the comment "Every line after the first used to EXECUTE …
The brackets are what make it an insert.") The conditional half gets its own
two cases: a trailing newline is *kept* inside the brackets when the child
enabled the mode (`:756-769`) and *stripped* when it did not (`:771-780`).
Those two tests are complementary by construction — the same input, opposite
expectations, selected by the child's mode — which is the only shape that can
fail when someone "simplifies" the branch to one rule.

## The naive path, one file away, four times

The same feature writes to the same PTY from four other call sites, none of
which go through the emulator, and every one of them hand-encodes the submit
by concatenation:

- `FleetBroadcastModal.tsx:137` — `const payload = pressEnter ? `${text}\r` : text;`
  then written to every selected session at `:157`.
- `sub_grid/FleetGridPage.tsx:272` — `await writeInput(id, `${replyText}\r`)`,
  the inline reply from the "Needs you" banner, with the comment at `:268-269`
  explicitly describing the trailing `\r` as what submits, "mirroring the
  broadcast composer".
- `sub_grid/FleetGridPage.tsx:283` — `writeInput(id, '/compact\r')`.
- `useFleetOverlayActions.ts:148` — `await writeInput(activeSessionId, `${command}\r`)`,
  documented at `:144` as "writes `<command>⏎` to its PTY".

This is precisely the pattern the technique names: "Automation that
concatenates command-plus-newline into one write works against a dumb line
reader and silently does nothing against a bracketed-paste-aware program."
Three of the four are user-authored text of arbitrary length; the broadcast
composer is a multi-line textarea, so a payload with an interior newline goes
out as one chunk with no verb attached to any part of it.

## The structural fact: the door sniffs instead of the caller declaring

What makes this tree evidence rather than merely a bug report is where the
rescue lives. The four naive call sites are not broken in production, because
the command they all funnel through inspects the payload and re-splits it
(`src-tauri/src/commands/fleet/commands.rs:94-99`):

```rust
if text.chars().count() > 1 && text.ends_with(['\r', '\n']) {
    return registry().write_text_line(&session_id, &text);
}
registry().write_input(&session_id, text.as_bytes())
```

`write_text_line` (`src-tauri/src/commands/fleet/registry.rs:587-681`) is the
technique's paste-then-type macro implemented properly, and its header
records the incident that produced it (`:592-599`): a composer that
distinguishes a lone `\r` chunk from a `\r` inside a larger chunk, every path
shipping `format!("{text}\r")` as one write, and — observed live on
2026-07-24 — an auto-fired instruction that "sat in the composer unsubmitted"
until the session was reaped with the message still stranded. The repair is
the technique's sequence exactly: write the text alone (`:619`), wait, then
send `\r` as its own chunk, with the wait implemented as
`WaitCondition::StableMs(SUBMIT_SETTLE_MS)` against the session's own output
(`:628-633`) rather than as a fixed sleep — "A busy machine used to under-run
the old 350 ms; an idle one over-paid it" (`:625-627`). It then *confirms*
the submit from the session flipping `Running` and retries Enter once
(`:636-681`), and logs shape only, never terminal contents (`:683-701`).

So the structural fact is this: **the correct behaviour is reached by
inference at the door, not by the caller saying which verb it meant.** The
condition is a heuristic over the payload — more than one character, ends
with a newline — and it is doing the work that the technique says a
first-class verb should do. Two consequences follow directly, and both are
visible in the tree rather than hypothetical. A caller that legitimately
wants a multi-character *paste* ending in a newline cannot express it: the
door will split it and submit. And a caller that wants to type a bare Enter
gets the `write_input` branch by accident of length, which happens to be
correct — one character — but is correct for the wrong reason and stops being
correct the moment a named key with a multi-byte encoding is passed the same
way.

The near half of the boundary shows what the far half is missing.
`src-tauri/src/commands/fleet/keys.rs` carries an actual notation —
`<Down><Space><CR>` parsed to "one chunk per key" (`:31-53`), with the
chunking rule stated as semantic, not cosmetic (`:17-23`), for the same
2026-07-24 reason — and a named constant `RIGHT` so call sites "stop
repeating the literal" (`:28-30`). Nothing on the React side reaches it. The
frontend has a paste verb (via the emulator) and no type verb at all, so
every submit is a `\r` typed into a template literal at four different call
sites, which is the technique's drift engine described as a diagram.

## What this realization cannot do or prove

- **It proves the paste half only.** The verified, tested, correctly
  conditional path is *paste*. There is no React-side keystroke vocabulary,
  no parser, no escaping rule, and no unknown-key error — the four rules the
  technique states before it gets to the Enter question. A typo'd key name
  cannot be mis-parsed here because there is no notation to typo, which is
  not conformance but absence.
- **The bracketed-paste assertion is against a fake.** The tests assert bytes
  handed to a mocked `writeInput`, with `bracketedPasteMode` set by the test
  itself (`fleetTerminalManager.test.ts:741`, `:758`). Nothing exercises a
  real child that enables DECSET 2004, so what is proven is that the manager
  asks the emulator to frame, not that a real program on the far side
  receives an insert. The 2026-07-24 evidence for the *other* half is a live
  observation; this half's evidence is a unit test.
- **The one-door rule is satisfied by a backend heuristic, and heuristics
  have no gate.** Nothing prevents a fifth call site from writing a payload
  the sniff misclassifies, and nothing would fail if someone removed the
  `ends_with` branch — the four callers would silently regress to the
  2026-07-24 failure, and the only test that would notice tests the frontend
  paste path, which does not use that branch.
- **The fallback is the naive write, undisclosed.** When no emulator is
  attached, `pasteFromClipboard` degrades to `writeInput(sessionId,
  textRaw.replace(/\r?\n$/, ''))` (`:604-608`) — an unframed multi-line
  payload, exactly the original defect, reached whenever a session's terminal
  has not been opened. The comment calls it "exactly as before" and it is
  correct that this is the only option available without an emulator, but the
  operator is told nothing, and a multi-line paste into a detached session
  will still execute line by line.
- **Chunking between keys is unverified from this side.** The
  atomic-within-a-key, deliberate-between-keys discipline lives entirely in
  the Rust half; the React half issues one write per user event and has no
  way to express a settle delay, so nothing here bears on the merging and
  splitting failures the technique's chunking section is about.
