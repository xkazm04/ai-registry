---
layer: application
type: application
subject: trailer-structure
technique: cue-first-assembly
stack: node
status: forged
verified_on: 2026-09-01
verified_against: node@24
---

# Node — the cue is the parent in the plan, and nothing in the picture

`gravity` (`gravitone-gcloud`, branch `main`, commit `51c0eea`, 2026-09-01) is a
TypeScript content-creation studio — research, script, frames, score, cut. Its
script phase carries a trailer beat model and a structural checker, executed here
under node v24.14.0 (CI pins node 22, `.github/workflows/gates.yml:180`). Both are
pure modules reachable from a bare `tsx` process, which is why this binds as `node`
rather than `react`, even though seven React panels sit on top of them.

**Fate: confirmed.** The hint's first alternative holds and is realised more
completely than any other technique in the subject — not as a check but as the
shape of the type graph. The hint's second alternative, `length-ladder`, is
realised too, but partially and by the tree's own admission
(`app/_phases/script/trailer/structure.ts:1077-1082`). And the director's expected
negative on the ledger and the budget is **wrong**: both are realised with full
models, described below.

## What the tree does

The technique's tool decision rule — "model the cue as the timeline's parent, not
as a track. A system where beats carry timings and music is attached afterwards
has encoded the inverted dependency" — is quoted at
`app/_phases/script/trailer/types.ts:180-187` and then obeyed structurally:

- `TrailerCut.cue` is a field of the cut, not a track
  (`app/_phases/script/trailer/types.ts:373`); `Movement.cueSection`
  (`:176`) and `TrailerBeat.cueMark` (`:352`) point **into** it.
- `CueSectionKind` (`app/_phases/script/trailer/types.ts:193-199`) is the
  technique's own six-part shape, closed: `mood-open | exposition | response |
  build | peak | tail`.
- `CueSection.isBoundary` (`:208`) encodes the edit affordance — "whether it gives
  the editor places to cut" — as the only place a reset may land.
- `Cue.frozen` (`:219`) records procedure step 5, so a later cue change is visible
  as the re-cut it is rather than presented as an adjustment.
- `checkCue` (`app/_phases/script/trailer/structure.ts:727-790`) enforces the
  reject rule: a cue with no boundary before its peak section is a `violation`
  (`:776-781`), because "there is nowhere to put the reset".
- A movement naming no cue section is `unmeasured`, never `pass`
  (`structure.ts:742-747`), on the technique's own reasoning that "a boundary the
  music does not mark is a boundary the viewer cannot perceive".
- `checkReset` delegates the reset's landing to the cue, not to the plan
  (`structure.ts:692-720`): a reset whose `cueMark` names a non-boundary section is
  a `violation` (`:705-710`). The dynamic reset's completeness in this tree is
  *downstream* of the cue being the parent.

**Promise ledger and withholding budget: present, not absent.**
`checkPromises` (`structure.ts:966-1000`) makes the payer a required field and
grades unpaid rows, and the ledger is on the advisory list so it never reaches
`malformed` — both of the technique's tool rules honoured at once. `checkWithholding`
(`structure.ts:1091-1149`) carries the five asset kinds and three allowances closed
(`types.ts:227-228`), fails a `spend` with no recorded trade, and reports a
missing budget as **undecided** rather than clean (`:1095-1101`).
Grep for a spoiler gate elsewhere in the tree returns nothing: the whole
`"what the trailer may show"` rule lives in these two functions.

## Executed evidence

`npx tsx pipeline/trailer-structure-regression.mts` (in-tree, no files written) —
**all 22 cases, 6 invariants and 5 seam checks behave correctly**, including
`unmeasured · a cut with no cue reports the cue rule unmeasured`
(`pipeline/trailer-structure-regression.mts:247`).

Then a read-only probe from scratch (`cue-probe.mts`, importing `structure.ts` by
absolute specifier) built one well-formed cut and stripped its cue, its
`cueSection`s and its `cueMark`s, changing nothing else:

```
WITH cue: passes=8 violations=2 unmeasured=5 enforced=67%
   cue rule: pass          reset rule: pass, pass
NO cue:   passes=6 violations=2 unmeasured=7 enforced=53%
   cue rule: unmeasured    reset rule: pass, unmeasured
```

Removing the music removes 14 points of enforceable structure and nothing else —
violations are identical. The technique's claim that a cue-less plan is "measured
against positions the music does not mark" is here an arithmetic fact, not a
metaphor.

## What it sharpened

**The tree obeys the rule in the plan and breaks it in the picture, and its own
comment does not know.** `types.ts:187` asserts "the shot layer inherits the marks
rather than setting them". It does not:
`grep -c cue app/_phases/frames/shots.ts` → **0**. `ShotLaneSourceBeat`
(`types.ts:445-456`) carries `at` and `atS` and no cue field; `shotsFromBeats`
derives every shot boundary from `beatSeconds()` (`app/_phases/frames/shots.ts:372-385`)
against `PACE_BAND`, durations measured on n=20 (`shots.ts:266-285`). So picture is
cut to the **beat's timecode**, not to the cue's marks — which is precisely the
dependency the technique says a tool must not encode, surviving one layer below the
place the tool checks for it. `grep -rn "cueMark|cueSection" app/_phases/score
app/_phases/cut` returns nothing either; only `trailer/cut.ts:63` passes the cue
through.

This is not the tree being sloppy — it is the technique's decision rule being
under-specified. "Model the cue as the timeline's parent" reads as a statement
about the *plan* object, and a tool can satisfy it in the plan while its render
lane still resolves positions from clock time. The rule needs to say that the
inheritance must reach whatever layer actually places cuts.

## Leads, with return conditions

- **The shot lane has no cue seam.** Return when `shots.ts` gains a cue-aware
  placement path, or when the Cut step learns shot boundaries — at which point
  `params.json`'s `not_encoded.rungFloorSeconds` (which names exactly that
  dependency) also becomes settleable.
- **Two techniques not bound here are near-complete in this tree**: `dynamic-reset`
  (`structure.ts:599-721` — count, position, holds-one-thing, cue landing, plus both
  "when not to use it" branches modelled as `not-engaged`) and `withholding-budget`.
  Either is a strong second application on this same counterpart.
- **`concealment-and-its-tells` is the one technique with no rule**, and the tree
  says so in a signed comment (`structure.ts:1206-1231`) rather than by silence.
  Return if a `TrailerCut` ever carries a signal about the work itself.

## Not verified

Whether the React panels (`PromiseLedger.tsx`, `WithholdingPanel.tsx`,
`MovementSection.tsx`) surface these findings faithfully — not read, and outside
this binding. The regression run was executed on node 24; the tree's CI pin of
node 22 was not exercised.
