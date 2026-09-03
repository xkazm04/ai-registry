---
layer: application
type: application
subject: voice-io
technique: transcript-handoff-receipts
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.78
---

# A timed clipboard restore in a shipping dictation product — the defect, at a line number

**This is a negative application.** The technique gives four rules for restoring
a borrowed clipboard after handing a transcript to a foreign application.
Voicebox — a local-first voice studio whose Tauri/Rust shell owns the dictation
hotkey and the auto-paste path — implements **rule 2 and nothing else**, and it
implements it well. The other three do not exist, because the mechanism they
depend on does not exist: there is no receipt. The restore is a fixed timer,
which is the "race by construction" the technique names, and it is reachable in
a shipped product at a line this document cites.

Citations resolve against commit `51f49dea198384b4eb6087b72c17057c6eb1c1cd`.
The stack witness is `tauri/src-tauri/Cargo.toml` (`edition = "2021"`, tauri
2.0) together with `Cargo.lock`'s `version = 4` lockfile format, which requires
Cargo 1.78 or newer; no toolchain is pinned in the tree and CI resolves
`dtolnay/rust-toolchain@stable`, so 1.78 is the floor the tree itself witnesses
rather than a version anyone declared.

## The whole paste transaction

`tauri/src-tauri/src/main.rs:1216-1253`, `paste_final_text`. In order:

```rust
focus_capture::activate_pid(focus.pid)?;
tokio::time::sleep(Duration::from_millis(POST_ACTIVATE_SETTLE_MS)).await;   // 120 ms

let snapshot = clipboard::save_clipboard()?;
let after_write = clipboard::write_text(&text)?;

let paste_result = synthetic_keys::send_paste();
tokio::time::sleep(Duration::from_millis(PASTE_CONSUME_MS)).await;          // 400 ms

let safe_to_restore = matches!(
    clipboard::current_change_count(),
    Ok(current) if current == after_write
);
if safe_to_restore {
    clipboard::restore_clipboard(&snapshot)?;
} else {
    eprintln!("[voicebox] clipboard mutated during paste window — skipping restore to preserve newer content");
}

paste_result?;
Ok(true)
```

`PASTE_CONSUME_MS = 400` is at `main.rs:994`, and its own comment states the
tradeoff the technique says has no solution on this axis: *"Too short and slow
apps haven't consumed the paste yet; too long and the user sees our text if
they look at their clipboard manager."* That is the timed restore, written down
by the author, with the failure mode named and accepted.

## Rule 2, implemented — and implemented carefully

`main.rs:1239-1249` is the ownership check. `write_text` returns the change
counter as it stood after the product's own write (`clipboard.rs:208`,
`:671`), and the restore runs only if the counter still equals that value. The
snapshot type carries the same field with a comment explaining exactly why
(`clipboard.rs:46-50`): the counter is *"Incremented by AppKit on every
mutation from any process, so a caller can decide whether a restore is still
safe … or whether someone else wrote to the clipboard in the interim and we
should back off."*

The detail worth transplanting is the `matches!`. A failed *read* of the
counter — `Err(_)` — is not treated as "unchanged"; it falls out of the match
and `safe_to_restore` is false. Unknown does not render as a definite value, so
an instrument failure produces the conservative outcome (skip the restore, keep
whatever is there now) rather than a confident clobber. And the skip is logged,
so the restore that did not happen is a fact rather than a silence.

## What the tree does better than a minimal reading of the technique

- **The snapshot is full-fidelity, not "the previous text".** `clipboard.rs:37-50`
  stores `Vec<Vec<(String, Vec<u8>)>>` — every pasteboard item, every
  `(type, raw bytes)` pair — and restores by rebuilding the item with
  `setData:forType:` without interpreting the payload. The module docstring is
  explicit: *"Images, styled text, file-reference lists all survive the
  round-trip."* The Windows arm walks `EnumClipboardFormats` and copies every
  advertised format's payload, documenting exactly which handle-backed formats
  it deliberately skips and why. The technique's "what the restore must
  preserve" rule is usually implemented as *prefer text, restore an image if
  there was no text*; this is the stronger version, and it eliminates the whole
  class of "my screenshot vanished after dictating" rather than the common case
  of it.
- **The empty clipboard is handled.** `restore_clipboard` clears the pasteboard
  first and returns early when the snapshot has no items
  (`clipboard.rs:238-242`; the Windows arm calls `win::empty()` at `:683`
  before its loop). Restoring an empty clipboard as *empty* rather than leaving
  the transcript behind is the case the technique calls out as the one a
  restore silently forgets.
- **A failed injection still restores.** The doc comment at `main.rs:1200-1205`
  states the ordering as a deliberate decision — *"`send_paste` failure is
  isolated from the restore decision: we always attempt the conditional restore
  before propagating the paste error, so a failed `CGEventPost` / `SendInput`
  never leaves the user's clipboard stuck on the transcript"* — and
  `paste_result?` at `:1251` propagates only afterwards. Two pre-injection
  refusals are equally clean: the paste is skipped when the focused application
  is the product itself (`:1220-1222`) and refused with an actionable message
  when accessibility trust is absent (`:1223-1228`), so the product never
  clobbers a clipboard for a keystroke that could not land.

## The defect, precisely

The ownership check protects **the user's newer write** from being destroyed by
the restore. It says nothing at all about **the target's read**, which is the
failure the technique exists to prevent. Concretely, this sequence is reachable
today:

1. `write_text` publishes the transcript; the counter becomes *N*.
2. `send_paste` **enqueues** the chord. The target application reads the
   clipboard whenever its event loop reaches the paste — under load, in a
   browser tab, in an editor mid-render, later than 400 ms.
3. 400 ms elapse. Nobody has copied anything, so the counter is still *N* and
   `safe_to_restore` is **true**.
4. `restore_clipboard` puts the user's previous content back.
5. The target now services the chord and reads the clipboard. It gets the
   **restored** content — the user's old clipboard, pasted into their document,
   in the place the transcript was meant to go.

Every check in the function passes. `paste_final_text` returns `Ok(true)`.
Nothing is logged. The transcript is not on the clipboard either, so the user
cannot recover it with a second paste. This is exactly the outcome the
technique opens by saying a transcription product must never produce, and it is
not a hypothetical about a codebase that has not thought about the problem —
this codebase has thought about it carefully, and the mechanism it built
addresses the other party.

The three missing rules are missing together, because they are all properties
of a receipt:

| Rule | Status here |
| --- | --- |
| 1. Only receipts observed after the chord counts | no receipt mechanism exists |
| 2. Restore only while the product still owns the channel | **implemented** (`main.rs:1239-1249`) |
| 3. Quiet period after the *last* receipt | no receipt mechanism exists |
| 4. Bounded wait with the failure mode chosen | the wait is a **fixed** 400 ms, unbounded-by-evidence in either direction |

Rule 4 is the closest to present and the furthest in spirit: there is a bound,
but it is the *only* thing there, so its failure mode is "stale content lands"
rather than "the transcript lingers". Inverting that is the entire point of the
technique, and it is a lazy-promise pasteboard write plus a post-chord receipt
filter away — the platform APIs the tree already uses expose both.

## What a fix would cost here

The snapshot layer needs no change; it is the good half. The change is confined
to `paste_final_text` and one new clipboard entry point: publish the transcript
as a promise instead of as bytes, record the injection instant, count only
callbacks after it, restore after a short quiet window following the last
callback, and keep the existing ownership check as the veto it already is —
with the 400 ms constant surviving as the *bound*, not as the schedule. And per
the technique's own last section, the chord's modifier hold stays exactly where
it is while that lands: changing the restore mechanism and the chord timing in
one release makes any regression unattributable.
