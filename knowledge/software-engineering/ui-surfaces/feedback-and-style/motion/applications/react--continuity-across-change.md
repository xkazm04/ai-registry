---
layer: application
type: application
subject: motion
technique: continuity-across-change
stack: react
verified_on: 2026-09-20
verified_against: react@19.2.8
---

# React application — shared layout identity, and the delta behind it

How the technique's three shapes — do not unmount, share one identity, animate
only the delta — look in a tree that implements all three, and the two places
the same tree does the opposite. Evidence is from `kp` (Next.js 16.3.3, React
19.2.8, framer-motion 13.1.1) at `0203b5d20`, resolved on 2026-09-20.

## The pending marker that becomes the answer

`app/_components/studio/StudioTranscript.tsx` is the canonical case: a waiting
indicator replaced by the reply it was waiting for. The two are different
components in different branches — the turn list, and an `AnimatePresence` block
that renders only while a request is in flight — so the swap is structural and
cannot be avoided by keeping one element mounted. They are given one identity
instead (lines 142 and 193), and the component's own comment (lines 24–28) states
both halves of the rule:

> The waiting mark and the turn that replaces it share a `layoutId` —
> `atelier-turn-<index>`, the index the reply will occupy — so the coral rule
> GROWS from the waiting mark into the arrived turn instead of one element
> unmounting and an unrelated one appearing. **The id advances with the
> transcript, so no two elements ever hold it at once.**

The exclusivity is arithmetic rather than a convention someone has to remember:
`pendingId` is `atelier-turn-${turns.length}` (line 114) — the slot the reply
*will* occupy — while a landed turn claims `atelier-turn-${index}` only when it
is the newest interviewer turn (`morph`, line 127). The pending marker names a
slot that does not exist yet; the moment it does, the marker is gone.

Note what this buys and what it does not. The gutter rule visibly travels, so the
wait reads as the answer forming; the pending element is still discarded, and
nothing in it held focus or a selection — which is what makes the second
preference the right one here rather than a compromise.

## Not unmounting, and the one element that has to move

`app/_components/studio/StudioZone.tsx` runs the first preference and the second
in one component, and labels the distinction (lines 23–27):

> FOLDING IS A WIDTH TWEEN, not a swap. The section is always mounted and
> framer's `layout` animates the width; the COUNT is the shared element that
> survives the fold — same `layoutId` on the head numeral and on the rail
> numeral, so the one fact the folded zone still owes the reader visibly travels
> rather than blinking out on one side and in on the other.

The section carries `layout={!reduced}` (line 74) and stays mounted across the
fold, so everything inside it keeps its scroll position and anything focused
keeps focus. Only the count numeral genuinely has to exist in two places — a
horizontal header when open, a vertical rail when collapsed — and it is the only
thing given a shared identity (`atelier-count-${zoneKey}`, lines 85 and 122). The
two branches are mutually exclusive, so the one-holder rule holds by construction
again.

## Identity is the record's, not the position's

`app/features/hiring/schedule/ScheduleCalendarCell.tsx:63` keys the shared
identity on the interview's own id — `sched-chip-${e.id}` — so a slot change
arriving from the tab's six-second poll glides the chip from the old cell to the
new one (`ScheduleCalendar.tsx:30-32`). An index-derived identity here would
animate the wrong chip into the right cell on any reorder: the positional-key
defect, arriving in the gesture rather than in the data.

## The delta, computed over the data

`app/features/library/jds/intake/intakeDelta.ts` is the technique's "size of the
change, never the size of the surface" as a pure module, and its header says why
it cannot be anything else: one exchange returns the whole brief rather than a
patch, so *which rows just changed* has to be derived by comparing the snapshot
before the turn with the snapshot after it. It yields `{ added, changed, removed
}` of row refs keyed by each row's stable identity within its section, and it is
pure — no React, no DOM — so it is tested directly instead of being inferred from
an animation.

`IntakeArrivalMotion.tsx` is the motion over that delta, and the division is
stated strictly (lines 9–24): arrival moves the **row**, the separate reveal
writes the **text** inside it, and neither duplicates the other. Three details
match the technique:

- **Only the delta moves.** `ArrivalList` (lines 108–165) gives a new row an
  entrance with a staggered delay and everything else `initial={false}` — an
  untouched row does not re-enter because a neighbour changed.
- **The stagger is a cue, not a loading bar.** `STAGGER_MS = 40`,
  `STAGGER_CAP = 12` (lines 36–37), with the comment that a twenty-row extraction
  staggered end to end "would hold the last row back most of a second after the
  reply is already readable" — the
  [taste-budgets](../techniques/taste-budgets.md) entrance cap, reasoned out
  locally.
- **The mark clears itself.** `ARRIVAL_WINDOW_MS = 1400` (line 54) expires the
  delta, so a row that lands and then sits there is not permanently marked new,
  and "a re-render for any other reason (opening the edit form, folding a leaf)
  cannot replay the cascade." The hook also treats its first snapshot as history
  whatever its age (lines 56–74), so opening a finished session animates nothing.

That last pair is the short-lived arrived-set in
[one-shot-guarding](../techniques/one-shot-guarding.md), implemented without a
seen-set anywhere in the tree.

## Two deviations, in the same tree

- **A changed row is re-keyed, which unmounts it.** `ArrivalList:143` builds the
  React key as `` `${keyOf(item)}${isChanged ? ":changed" : ""}` ``, so a row
  rewritten in place is destroyed and rebuilt in order to replay a CSS arrival
  class on it. That is a swap chosen deliberately to get a gesture, and it
  discards exactly what the technique's first preference protects — a selection
  inside the row, or focus on the citation control within it — at the moment a
  reader is most likely to be reading that row. The standard prefers animating
  the mounted element; the gesture is available without the remount.
- **Reduced motion is honored two different ways.**
  `ScheduleCalendarCell.tsx:63` and the landing surfaces withdraw the identity
  under the preference (`layoutId={reduced ? undefined : …}`), which is the rule.
  `StudioTranscript.tsx:143,194` keeps the identity and sets
  `transition={{ duration: 0 }}` instead, which still matches, still measures,
  and still commits a computed position — the reduced path the technique names as
  the wrong one. Both spellings live in the same repository, and only one of them
  is written down.
