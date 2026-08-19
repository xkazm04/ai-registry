---
layer: application
type: application
subject: video-assembly
technique: gap-and-refusal-honesty
stack: react
status: forged
---

# Gap-and-refusal honesty in the Gravitone cut and score surfaces (React/TypeScript)

The Gravitone video studio (`C:\Users\mkdol\dolla\gravitone-gcloud`) realizes
the technique on two sibling surfaces — the three-lane cut timeline
(`app/_phases/cut/CutTimeline.tsx`) and the music spotting view
(`app/_phases/score/ScoreSpotting.tsx`) — over shared clock fixtures
(`app/_studio/score.ts`, `app/_studio/scenes.ts`). The repo is notable
because the honesty was *retrofitted in a named pass*: the file header
documents an "HONESTY ROUND (2026-08-14)" (`CutTimeline.tsx:8-24`) listing
each claim that was typed rather than derived, and what happened to it.

## Gaps drawn, not hidden

The timeline fixture carries `status: "missing"` on four clips
(`score.ts:42-48`); the timeline renders them in place with a dashed hollow
style and an explicit caption — `` `${c.label} — missing` `` — plus a legend
row reading "missing — drawn, not hidden" (`CutTimeline.tsx:126,137,149`).
The refused music cue exists in *both* fixtures under its two identities:
`CUES` cue-2 with `status: "failed"` and the note "Lyria refused the request
in this region — no clip was produced" (`score.ts:17-26`), and `TIMELINE`
t-m2 as the corresponding `missing` block — refusal upstream, gap downstream.

## Refusal as a state with a stated cost

The score surface opens focused on the refused cue on purpose —
`useState(CUES[1].id)` with the comment "open on the refused cue"
(`ScoreSpotting.tsx:17`). Its detail card leads with the refusal and prices
it on the clock: "13s of the 31s clock plays silent"
(`ScoreSpotting.tsx:119-124`), computed from `cue.durS` and
`PROJECT.totalS`, not typed.

## Computed coverage, never narrated

The coverage line — scored / refused / unspotted seconds — is three
reductions over the cue array (`ScoreSpotting.tsx:26-28`):

```ts
const scoredS = CUES.filter((c) => c.status === "rendered").reduce((n, c) => n + c.durS, 0);
const refusedS = CUES.filter((c) => c.status === "failed").reduce((n, c) => n + c.durS, 0);
const silentS = PROJECT.totalS - scoredS - refusedS;
```

The surface's own header comment states the rule: "computed from the cues,
never retyped" (`ScoreSpotting.tsx:5-6`). The cut's wrap card does the same
for gaps — the sentence naming which tracks are missing what is built by
filtering `TIMELINE`, because the hand-typed predecessor "was hand-typed to
match the four missing rows" and a fixture edit could leave it lying
(`CutTimeline.tsx:18-19`, `221-228`).

## Phantom capability removed, seam stated

Two removals in the honesty round are the technique's no-phantom rule
verbatim:

- Body copy claiming "Preview plays what exists and holds black over the
  gaps" was deleted because "There is no `<video>` here, no play control,
  and no preview surface in anything this file imports"
  (`CutTimeline.tsx:10-14`). The replacement is the honest wrap state:
  "There is no playback here. This app has no player… what is drawn is the
  plan for the cut" (`CutTimeline.tsx:230-233`).
- A "retry cue" button — styled as the primary CTA, carrying no `onClick`
  — was removed rather than wired, because "no route under app/api
  generates audio" (`ScoreSpotting.tsx:113-118`). What replaced it names
  the seam: "Re-asking the model is a seam this app has not built —
  nothing here generates music yet" (`ScoreSpotting.tsx:120-123`).

The same round fixed the interactive variant on the cut side: the sync
bench "moved a counter and rewrote a sentence while `TimelineClip.offsetMs`
… was never read by anything" (`CutTimeline.tsx:21-24`); it now reads and
writes the real field and the block moves on the ruler above
(`CutTimeline.tsx:53-71`), with a caption bounding the claim — "Moves the
block on the ruler above and nothing else — no audio is shifted"
(`CutTimeline.tsx:205-208`).

## Confirmations and upward lessons

- **Confirmed:** missing drawn in place with legend; refused-silence
  distinct from unspotted-silence (three-term coverage line); cost stated
  in clock seconds at the site of the refusal; summaries computed from the
  drawing data; dead control and phantom-playback copy removed rather than
  softened.
- **Upward lessons taken into the technique:** the honest replacement for a
  removed phantom is a one-sentence statement of the unbuilt seam (both
  removal comments model it); and "lead with the failure" — defaulting the
  score view's focus to the refused cue makes the worst news the first
  thing read.
