---
layer: technique
type: technique
subject: voice-io
technique: transcript-handoff-receipts
status: forged
laws: [creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [a dictation product inserts the transcript into whatever application holds the cursor, users report their previous clipboard content pasted instead of the transcript, deciding between synthesized keystrokes and a clipboard paste for delivery, a timed clipboard restore works on the developer's machine and fails under load, a screenshot or image vanished from the clipboard after a dictation]
---

# Transcript handoff receipts

The input pipeline's stage table ends at *awaiting disposition*, and in a
dictation product the disposition is almost always the same: **put it where
the cursor is.** The cursor is in someone else's application. The product
does not own that text field, cannot observe it, and reaches it only through
a channel the operating system provides for every application at once. This
technique owns that last step — the route into the foreign field, and the
obligations the route creates — because the naive version of it produces a
defect users describe as "it pasted the wrong thing", which is the one
outcome a transcription product must never produce.

## Two routes, and the decision between them

**Typing** synthesizes the transcript as keystrokes. It disturbs nothing the
user holds and needs no restore. It is slow at paragraph length, it depends on
the keyboard layout the target believes is active, and on some display
servers it depends on a helper the compositor may refuse to serve. It is the
right route for short commands and for environments that forbid the clipboard.

**Pasting** publishes the transcript to the system clipboard and sends the
platform's paste chord. It is fast, layout-proof, and handles any script the
target can render. Its cost is the one thing the user was holding: whatever
the clipboard contained is displaced and must be put back. Everything below
is the discipline that cost demands. A third route — handing the text to an
operator-supplied script — is an escape hatch for environments neither route
serves, and it inherits the paste route's rule about not capturing the
helper's output, because a clipboard helper may fork a daemon that holds the
inherited pipe open until the selection is replaced.

The decision is by length and environment, and it is a per-utterance choice
the user can override, never a global truth.

## A timed restore is a race by construction

The obvious restore — write the transcript, send the chord, wait a fixed
interval, put the old content back — is wrong in a way that does not show on
the machine that wrote it. The paste chord is only *enqueued*. The target
application reads the clipboard whenever its event loop gets to it, which
under load, in a browser tab, or in an editor mid-render is later than any
interval a developer chose while watching a fast machine. When the restore
wins the race, the target reads the *restored* content: the user's previous
clipboard lands in their document, in the place the transcript was meant to
go, with no error anywhere. Lengthening the interval reduces the frequency
and raises the time the transcript squats on the user's clipboard, and no
interval reaches zero.

## Restore on the consumer's receipt

The channel's owner can tell the product when something read it. Operating
systems expose this as a *lazy promise*: the product declares that it holds
the format without supplying the bytes, and the system calls back when a
consumer asks for them. That callback is a **receipt** — evidence that a
reader took the transcript — and the restore is sequenced on it rather than
on a clock. Four rules make a receipt trustworthy, and the first two are the
ones a first implementation omits:

1. **Only receipts observed after the chord was injected count.** A read
   before that is a third party reacting to the clipboard *change* — a
   clipboard history manager, a scanner, a synchronisation agent — and
   restoring on it re-creates the race with a different loser.
2. **Restore only while the product still owns the channel.** If the
   clipboard's sequence counter moved or an ownership-lost notification
   arrived, the user copied something else in the meantime, and their action
   wins: the product does nothing, because putting the old content back would
   now destroy the new.
3. **A quiet period after the *last* receipt, not the first.** Some
   consumers read the channel more than once per paste — a probe for
   available formats, then the read — and a restore between the two hands the
   second read the wrong content. A short quiet window after the most recent
   receipt absorbs that.
4. **A bounded wait, with the failure mode chosen.** No receipt within the
   bound means the chord was dropped, the target does not read the clipboard
   on that chord, or the read happened through a path the system does not
   report. The product restores anyway — and the bound is chosen so that the
   failure is always *the transcript lingers a few seconds longer*, never
   *stale content is pasted*. When the chord could not be injected at all,
   no legitimate receipt can ever arrive and the wait collapses to a short
   grace instead of the full bound.

The decision — keep waiting, or finish now — is a pure function of the
transaction's record: when the transcript was published, when the chord went
in, the receipt timestamps, whether ownership was lost, whether injection
failed. Keeping it pure is what lets the rules above be unit-tested without a
clipboard, and it is what makes a receipt that never came *legible*: a
transaction that finished on its bound is logged as "no read within the
timeout", which is a fact about the target that the timed restore could never
have produced. The published transcript names its own reaper
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): the
receipt-plus-quiet, or the bound, and nothing else clears it.

## What the restore must preserve

The clipboard held more than text. Restoring "the previous text" over a
clipboard that held an image silently destroys a screenshot the user took
seconds earlier — a loss users notice and attribute to the wrong product.
The restore captures what was there in the formats the platform reports,
prefers text when both exist (the common case, and reading an image decodes
a whole bitmap), and restores an image when there was no text. And when the
clipboard was *empty*, the restore clears it: leaving the transcript behind
is not a restore, it is a leak of the user's dictation into every later
paste. A user-facing "also keep the transcript on the clipboard" is a
separate, opt-in disposition, and it must be named as such rather than
falling out of a restore that forgot the empty case.

A failed injection restores too. The transcript was published before the
chord; if the chord cannot be sent, the transaction is reported as failed
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success))
and the previous content goes back — a paste path that errors out and leaves
the transcript on the clipboard has half-succeeded in the worst way.

## Introduce the mechanism, then tune it

The paste chord itself carries a tuning knob: how long the modifier is held
before the key. Real machines drop chords released too quickly, and the timed
restore hid every such drop behind a silent "nothing happened". The
receipt-sequenced path is the first one that can *see* a dropped chord — it
logs "no read within timeout" instead of restoring on schedule — which makes
the hold safe to shorten later. It is not safe to shorten *at the same time*:
a beta that changes the restore mechanism and the chord timing together
cannot attribute a regression to either. Keep the hold at parity, prove the
receipts in the field, then run the hold as its own experiment. The same
one-variable rule applies to any second change the new path makes tempting.

## When not to use this

- The destination is the product's own text field. No channel is involved;
  insert directly and skip everything above.
- The environment forbids injection — an operating-system secure-input mode,
  a locked session, a remote desktop that does not forward the chord. Detect
  it, say so, and fall back to a copy-only disposition the user triggers by
  hand, rather than injecting into a field that will not receive it.
- The user chose copy-only. "Put it on the clipboard and stop" is a
  legitimate disposition, and it is the one case where the transcript
  staying on the clipboard is the point.
