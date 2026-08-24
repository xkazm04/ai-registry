---
layer: technique
type: technique
subject: chat-transcript
technique: transcript-scroll
status: forged
laws:
  - gate-sees-target
shared_with: []
use_when: [deciding whether new content may move the viewport, open lands mid-history despite waiting for data, prepending older turns shifts the visible rows]
---

# Transcript scroll

The transcript grows at the bottom; the user reads wherever they choose. This
technique is the contract that lets both proceed without the surface ever
moving the viewport against the user's will — plus the two moments the
contract is hardest to keep: first paint, and returning to a thread.

## Open at latest — behind a ready gate

A conversation opens at its most recent exchange. The naive implementation —
scroll to bottom as soon as the data arrives — lands mid-history often enough
to feel broken, because "data arrived" is not "layout settled": rows render
at provisional heights, rich text reflows as it parses, media and embedded
cards size themselves late, fonts swap. A bottom computed against provisional
heights is above the real bottom by exactly the amount of late layout.

The fix is a **ready gate that observes the actual target**, per
[gate-sees-target](../../../../_laws.md#gate-sees-target): initial positioning
waits until the rendered layout of the opening window is stable — sizes
measured, late-sizing rows accounted for — and only then positions, in one
jump. Gating on proxies (fetch completed, first frame painted, a fixed delay)
passes exactly when the proxy diverges from real layout, which is the case
the gate exists for. Two subtleties:

- **The gate stamps itself done only after it has acted on a real target.**
  The subtle failure is not the missing gate but the self-satisfied one: the
  positioning effect fires while the container does not exist yet, silently
  no-ops, and records "initial scroll done" — converting a frame-timing race
  into a permanent misposition, because nothing ever retries. Success is
  "the jump executed against a mounted, measured container", never "the
  effect ran". The same discipline applies to every listener the contract
  depends on: a scroll listener attached to nothing leaves the pin state
  frozen at its initial value, which reads as "pinned forever" and yanks the
  user on every arrival.
- **The gate has a deadline.** Layout stability is detected, not proven; a
  surface that waits forever for a straggling embed shows a blank or
  mispositioned transcript forever. Past a short deadline, position anyway
  and correct once on the next stability signal.
- **The jump is instant and unanimated.** Smooth-scrolling through the whole
  history on open is theater that costs seconds; animation is for movements
  the user should perceive as movement, and "where the conversation starts"
  is not one.
- **Until the gate opens, the user sees a stable loading posture** — not
  content at the wrong position that then leaps. One paint at the right place
  beats two paints with a visible correction.

## Pinned growth and the user override

While streaming, the transcript inherits the pin-to-tail contract from
streaming-output's
[render-throttling](../../../../llm-agent/runtime-and-io/streaming-output/techniques/render-throttling.md):
pinned at (or near) the tail, each flush keeps the tail in view; a user
scroll up disengages the pin; content keeps growing below the viewport
without moving it; yanking a reading user to the tail is the cardinal sin.
The transcript adds the conversation-level affordances on top:

- **A visible way back with a count** — while disengaged, a "jump to latest"
  affordance carries how much is unseen, in transcript units (new turns, new
  events), not raw pixels or lines. The count's predicate is "turns arrived
  since disengagement", and it resets exactly when the user re-pins.
- **Re-pin is symmetric** — reaching the tail by scrolling re-engages the pin
  implicitly; the affordance re-engages it explicitly; a new turn *submitted
  by the user* also re-pins, because sending a message is an unambiguous
  statement of where their attention is.
- **The pin threshold is forgiving.** "At the tail" means within a small
  band, not pixel-exact; users who nudge the wheel one notch have not
  declared they are reading history.

## History pagination holds the ground still

Older turns load on demand at the top. Prepending content above the viewport
shifts everything the user is looking at unless compensated: the anchor rule
is that **the row the user could see before the prepend is in the same
viewport position after it**. Implementation is measurement and offset
correction in the same frame, or an anchoring primitive that does it — but
the observable contract is the point: loading history is invisible except
for the new content being available above.

## Per-thread restoration

Scroll position is **per conversation, remembered while the surface lives**:

- Switching threads and returning restores the reading position the user
  left — restored behind the same ready gate as opening, since the returning
  thread renders from scratch and has the same late-layout problem.
- A thread never visited this session opens at latest.
- A restored position is invalidated by enough new content: if the tail has
  moved substantially since the user left, restoring their old position must
  come with the unseen-count affordance already visible, so the restoration
  does not silently hide that the conversation moved on.

## The page-flip: a sent prompt lands at the top, with a reserve below

When the user sends, the most useful place for their prompt is the **top of
the viewport**, with the answer growing beneath it — the reader's eye is
already there and the whole answer arrives into empty space. The naive
implementation scrolls the prompt to the top and then, one frame later, the
pin-to-tail logic clamps the viewport back down because the document is not
yet tall enough to legitimately scroll that far. The result is the jump every
user has felt.

The rule: **the page-flip adds a reserve.** A phantom spacer below the last
row makes the top-pinned pose a *legitimate* scroll bottom, so follow mode
and the flip agree instead of fighting. As the answer streams in, the reserve
shrinks by exactly the height the answer added, and it shifts if content
above the prompt changes height. Follow mode stays armed throughout — the
flip is a one-shot suppression of the *next* auto-scroll, not a
disengagement — so the user is still "at latest" for every subsequent row.
The reserve is owned by the same single scroll authority as the pin, never by
the composer that triggered the send.

## Two anchors, and the one that must go stale

Position is held across two different disturbances, and they need different
anchors:

- **Re-wrap** (width or font change): the anchor is *content* — which row,
  which logical line within it, how far into its wrapped sub-rows — so a
  narrower column re-pins the same words, not the same pixel offset.
- **Structural change** (older turns prepended, a row removed): the anchor
  is the *identity of a row* plus its offset, armed immediately before the
  mutation invalidates layout and consumed by the very next layout pass.

The second anchor has a rule most implementations miss: **it is discarded if
the user scrolled between arming and consumption.** An anchor that survives
a user scroll re-asserts a position the user already left, which is the
yank arriving one frame late.

## What this technique refuses

- **Scroll as notification.** New content never moves a disengaged viewport —
  attention is requested by affordance and count, never taken.
- **Animated corrections.** Programmatic positioning (open, restore,
  pagination compensation) is instant; animated scroll is reserved for the
  user-invoked jump-to-latest, where perceiving the travel is the feedback.
- **A second scroll authority.** Exactly one owner tracks pin state,
  disengagement, and restoration per transcript; a narration widget or
  embedded card that scrolls the container on its own schedule reintroduces
  the yank through a side door.
