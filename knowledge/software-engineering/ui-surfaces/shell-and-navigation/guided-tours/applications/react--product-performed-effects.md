---
layer: application
type: application
subject: guided-tours
technique: product-performed-effects
stack: react
status: forged
verified_on: 2026-10-27
verified_against: react@19
---

# A guide that presses the screen's own Replay (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893. The
onboarding guide is a port of a design-contest winner that had rebuilt the app's panes inside
its own page; the owner rejected that ("layer on top of it, not as separate experience
outside", `src/app/features/guide/README.md:16-17`), and the port is a layer drawn over the real
screens (React 19.2, `package.json:40`). This application covers
[product-performed-effects](../techniques/product-performed-effects.md), and records beside it
how the same hook realizes two older techniques of the subject (navigate on entry,
[spotlight-continuity](../techniques/spotlight-continuity.md)) and the lifecycle around it.

## Effects are data, run in order, once per entry

A step declares its effects from a closed set: `src/app/features/guide/model/steps.ts:19-20`,
"What the layer does once the step's screen is drawn: open a tab, start the screen's own
replay, or play the tripwire", typed as `{ kind: 'tab' } | { kind: 'replay' } | { kind:
'tripwire' }`. The Proof Block step declares `effects: [{ kind: 'tab', tab: 'court' }, { kind:
'replay' }]` (`src/app/features/guide/model/story/govern.ts:27`).

`src/app/features/guide/hooks/useStage.ts:55-71` performs them. Order is enforced by
`if (done.has(n) || done.size < n) return; // in order: a replay waits for its tab`
(`src/app/features/guide/hooks/useStage.ts:58`); a tab is clicked only when not already selected (`src/app/features/guide/hooks/useStage.ts:62`); the
replay is pressed only when `pressable(btn)` (`src/app/features/guide/hooks/useStage.ts:66`), defined at
`src/app/features/guide/model/find.ts:30` as present and neither `disabled` nor
`aria-disabled`. The control is the screen's own: `REPLAY` is "Task's own Replay (r): it
re-derives the verdict from the ledger, check by check, and never re-runs the agent"
(`src/app/features/guide/model/find.ts:26-27`). Only drawn matches count — `src/app/features/guide/model/find.ts:1-2` "A route kept alive in <Activity>
is in the document but hidden (zero-sized), so only a drawn match counts."

The `done` set lives inside the effect keyed on `[layer, step, entry]` (`src/app/features/guide/hooks/useStage.ts:113`), and
`entry` is `${run}:${i}` (`src/app/features/guide/model/store.ts:90-91`, "the run and the step,
so stepping back and reopening both set the screen up again"). Navigation is keyed the same
way and happens only on entry (`src/app/features/guide/hooks/useStage.ts:43-47`, guarded by `navigated.current === entry`),
which is [action-driven-advancement](../techniques/action-driven-advancement.md)'s "never yank
the user back" rule.

## The layer's own marks, and the live flag

`src/app/features/guide/components/GuideLayer.tsx:13-18` names the layer's whole drawn
repertoire: a spotlight ring, a ghost cursor where the person acts, and the tripwire's sweep —
"Nothing here takes a click: the screen under it stays live." Each effect mark is gated on
`live` (`src/app/features/guide/components/GuideLayer.tsx:20` "const tripwire = live && step.effects"; `src/app/features/guide/components/GuideLayer.tsx:30` "step.cursor &&
live && box"). The stage holds the last box for `HOLD_MS = 1500` while the next screen streams
in (`src/app/features/guide/hooks/useStage.ts:12-13`, `src/app/features/guide/hooks/useStage.ts:88-91` "glide on from the last place, not a blink"), sets
`live = own !== null` (`src/app/features/guide/hooks/useStage.ts:92`), and skips the render when nothing moved
(`src/app/features/guide/hooks/useStage.ts:93-94` "nothing moved: no re-render, so the ring does not restart"). It measures
on a 300 ms tick, on resize, and on a mutation observer narrowed to the `data-reveal` attribute
a screen-host region sets when it lands, coalesced to one frame (`src/app/features/guide/hooks/useStage.ts:98-106`).

## The step where the person acts

"Your write" declares `cursor: true, hold: true` (`src/app/features/guide/model/story/govern.ts:79-80`) and its caption states
what the click does and does not do: "your click stages the exact write in the Outbox. Nothing
runs until you press Run, and on the demo Run only simulates it" (`src/app/features/guide/model/story/govern.ts:76`). Autoplay
stops there (`src/app/features/guide/model/playback.ts:30`, `!STEPS[p.i]?.hold`).

## Lifecycle and the demo binding

It never starts by itself: `src/app/features/guide/components/invite/Invite.tsx:10-14` "the
guide never starts by itself, it asks", and Skip persists per browser (`src/app/features/guide/model/store.ts:79-87`, a
`localStorage` key, with a refused store degrading to this page life only). Escape belongs to
the overlay stack (`src/app/features/guide/hooks/useGuideKeys.ts:13-14` "Escape is the overlay
stack's (onEscape), so a popover opened over the guide closes first"). The guide is bound to
the demo plane: `src/app/features/guide/components/GuideController.tsx:13` "The guide replays
the demo estate, so it only opens on demo data", closing when the mode is not demo
(`src/app/features/guide/components/GuideController.tsx:25-27`), with the mode read hydration-safely
(`src/app/features/guide/hooks/useDemo.ts:12-15`); captions name what was planted ("Seeded
fault.", `src/app/features/guide/model/story/govern.ts:44`).

## Where the tree sits against the technique

Confirmed: declared ordered effects, pressable gating, product-owned replay, a short list of
pointer-transparent marks, the live flag, the hold step. One deviation, recorded against
[action-driven-advancement](../techniques/action-driven-advancement.md): the hold step stops
autoplay but does not complete on the observed result (the staged Outbox row); it waits for the
person's next, and the guide keeps no completion ledger that could tell performed from moved
past.
