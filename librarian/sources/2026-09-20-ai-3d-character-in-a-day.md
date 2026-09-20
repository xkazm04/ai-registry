---
source: youtube
kind: practitioner build-walkthrough (sponsored hybrid)
url: https://www.youtube.com/watch?v=4uy8X28k49U
title: How to Make Realistic 3D Character in Less Than a Day with AI
author: Stefan 3D AI
words: 3158
extracted: 13
accepted: 1
declined: 0
leads: 2
already_covered: 6
untriaged: 2
dispatched: 0
applied: 1
shipped: 1
run_id: intake-4uy8x
siblings: 0
---

# The path the corpus named once, to route away from it

## Class, and the expected yield stated before the table

A **practitioner build-walkthrough** with a sponsored review bolted on, so the halves were
routed separately per the hybrid rule. The demo half — the generator's "outstanding"
detail, the agent that splits reference images, the affiliate link — is an ad and was read
as one. The operating half is a genuine first-party account: the creator built the
character, and the things that went wrong on him are recorded with their remedies.

Expected yield, said before scoring: `game-production` is a 52-subject bundle with 328
techniques and the finishing bench is one of its most worked subjects, so **mostly
catches, one or two leads, and no upper-layer landing unless a fetched primary or a fleet
seam carried it.** That is close to what happened, with one exception that mattered.

Not render-bound, and worth saying why rather than skipping it. The home generates meshes,
so Phase 6b was checked explicitly: the landed claim is a *routing and verification*
contract — which kind of target a preset row is, and what check it owes — whose observable
is a data model and a test, not a picture. The render-bound claim in the neighbourhood
("a conformed template deforms better than a generic auto-rig") is one the corpus already
holds and the vendor states, and this run did not re-land it. Had it been the landing, no
local instrument could have produced the arms — the v2.10 chain needs a rigged subject and
an engine conform run, and neither exists on this machine — so it would have been a lead
naming the instrument.

## The declared focus, and whether it applied

The scorecard's focus was `extract`, narrowed to **"aim the hunt"**: on a source whose
subject the corpus saturates, use it to pick which fleet context to open and read that tree
for where it disagrees with itself. It applied exactly, and it is the sixth run running
where that move carried the result — but with a twist worth recording. Here the source and
the tree turned out to be **the same finding seen from two sides**, and neither half was
legible alone. The corpus names the conform path once, in an exclusion; the fleet project
had a conform target sitting in a remap table; and it is only holding both that either one
reads as anything other than a detail.

## The finding

`rig-preset-and-bone-remap-binding` ends with a "when not to use" list, and its second
entry reads:

> **When the character will be rebuilt by a parametric conform** rather than bound as-is.
> That path produces its own skeleton and its own weights, and a prior binding is discarded.

That sentence is the **only occurrence of the concept in the entire corpus** — verified
uncapped across all 3,259 techniques, with the exclusion line itself as the known positive,
after a `--prose` map at `--top 40` returned no asset-production subject for it. The corpus
names the path once, to route away from it, and nothing catches it. The golden path's own
"what finishing does not decide" section hands off five concerns and this is not among
them.

So it is a mechanism the corpus lacks, not a boundary case of one it has — a technique
under v2's rule, never an amendment. Landed as
`conform-target-is-not-a-remap-row`, with the golden path gaining two clauses: the
unstated premise behind its one-directional order (*the shipped mesh is derived from the
generated one* — which this second pipeline drops), and the second kind of binding target.

## The fetch inverted the easy version of the rule

One search spent, after one fetch returned an empty body. The vendor's own documentation
corroborated the mechanism — joints, RBFs and **skin weights are generated automatically**
to fit the source mesh, so a conform target has no mapping table by construction — and then
handed over the boundary the run had not thought to look for:

> the **Estimate Joints from Mesh** property can generate **non-standard joint
> orientations**, which may cause compatibility issues with animation and retargeting
> assets.

That is the half that makes the technique worth having. The conform path's entire promise
is inheritance — you get the template's rig, therefore the template's animation library —
and there is a setting that keeps the hierarchy while silently breaking the orientations
that a retarget actually reads. So a conform row does not owe *no* verification; it owes a
**different** one, and the easy version of this technique ("conform targets need no check")
would have been wrong in the expensive direction.

## The seam, chosen to falsify, and what a catch would have taught

`pof` is the only fleet project declaring `game-production`. Its
`src/lib/visual-gen/rig-presets.ts` was chosen precisely because it could kill the
finding: if the preset table already separated the two kinds of target, the technique is a
catch and the registry landing demotes to an amendment. Written before running it, so it
could not be rationalised afterwards.

It did not. Measured on the table as it stood, with the row count as a known positive:

```
id                 declared  faceRig  mapRows  chainBones  unmapped
ue5-mannequin            67    false       20          10         0
metahuman               584     true        0          10        10
minimal-humanoid         25    false       18          10         0
```

Ten of ten. By the corpus's own remap rule that is five limbs that will not animate — and
it is an artifact of asking a remap question of a conform row, which is the finding
restated as a number.

The **structural fact nobody designed** is better evidence than the count. A census of the
field's readers returns three, each blind differently: the renderer guarded the mapping
section on `mixamoMapping.length > 0`, so the one preset with no mapping was the one that
displayed no mapping problem; two sibling suites build fixtures by flat-mapping every
preset's rows, so a preset contributing zero rows cannot fail an assertion built from them;
and the armature builder ignores the field entirely, emitting the same eleven bones for
presets declaring 67, 584 and 25. A declared input with no consumer — law L13 — that had
reached the stage where the *absence* of a value was load-bearing in two contradictory
directions at once.

**Shipped** pof `a0878ba1` (not pushed): `kind: 'remap' | 'conform'` on every row and a
`checkPresetBinding()` that branches on it. The conform branch returns
`unmappedChainBones: null` rather than `[]` — an empty array would claim *checked, nothing
missing*, which is a different and false statement — and refuses a conform row that carries
mapping rows. Target 0/10 → 10/10 correctly reported, plus 20/20 now verified on the two
remap rows that had never been checked either; floor held at 1,195 tests passing and
`tsc --noEmit` exit 0. The new suite carries a known negative pinning arm A at 10 of 10, so
the passing assertions are not vacuous.

## An instrument of this run's own was blind, and the known positive caught it

Verifying the regenerated index against `HEAD`, the first digest-diff returned "0 subjects
differing" — from a walker that had indexed **0 subjects**, because it guessed the index's
shape. Run against `game-production`, where a subject was known to have changed, it also
returned 0, which is what exposed it. Rewritten against the real shape it reports
`mesh-finishing-for-engine-readiness` 7→8 techniques *and* a second row:
`media-generation/generated-output-grading`, digest moved, technique count unchanged
9→10 revision — a **modified existing document**, exactly the case the last scorecard said
a slug grep cannot see. Its source is committed (`eda2deab`) and only the index was stale,
so it is caught up here rather than baked WIP; the working tree holds no uncommitted
media-generation source.

## Candidates

| # | Candidate | Anchor | Outcome |
|---|---|---|---|
| 1 | A conform target is not a row in the remap table | pipeline shape, `[00:05:28]`–`[00:07:35]` | **accepted** 3/0/2 → technique + 2 golden-path clauses + application + pof ship |
| 2 | Transfer skin weights from the already-rigged body, not an automatic solve | `[00:13:31]` "it transfer rates not only based on bones, but from the existing body that works so much better" | **already covered** — `rig-preset-and-bone-remap-binding` decision rules, near-verbatim |
| 3 | A rigid accessory takes a single-bone binding | `[00:13:06]` earring weighted 100% to the ear bone | **already covered** — same technique, same words |
| 4 | Freeze the pose before baking or the hands move | `[00:06:45]` "save pose ... our character will actually change pose in hands" | **already covered** — `high-to-low-bake-coverage` step 6: "a bake between differently posed versions of the same character is not a degraded bake; it is garbage that renders" |
| 5 | The generator cannot produce hair the engine can consume; buy it | `[00:04:38]` "that AI cannot really handle hair cards ... the only annoying gap" | **already covered**, and better — `image-to-3d-input-gating` files hair strands with text and thin wires under "things that never become geometry", at the *briefing* stage, upstream of where the video hits it |
| 6 | Retopologise only the simple garment shapes | `[00:12:14]` | **already covered** — `unwrap-only-the-low-poly`, `asset-class-poly-budgeting` |
| 7 | Generate the character as separate parts and assemble | `[00:00:35]` "split her into the parts and then assemble for better quality" | **already covered** — `face-rig-shell-readiness`, `floater-vs-part-face-share-rule` |
| 8 | Undress the reference before conforming | `[00:04:12]` "the original mesh will conform better" | folded into #1 as a decision rule — the conform fits a *surface* |
| 9 | Unpack the inherited multi-tile UV layout before baking | `[00:08:01]` "it uses UDIM for UV ... that's not going to work" | folded into #1 — the layout is the template's, not yours |
| 10 | Engine 5.8 ships the character system as plugins, with free markerless mocap | `[00:15:11]` | **currency**, admitted under the corroboration table (a source may authorize this alone) |
| 11 | The generator shipped an agent that splits references and generates parts, but "will still not do good job assembling" | `[00:00:50]`–`[00:01:40]` | **lead** — return condition: when an agent's assembly output clears the structural gate unassisted |
| 12 | Normal-map green-channel convention differs between authoring tool and engine | `[00:14:46]` | **untriaged** — zero corpus hits uncapped, but `format-defaults-are-not-asset-properties` is a near-miss of a different shape (a convention mismatch is not a format default, both sides state a value), and an S-effort dated tool fact needs a primary this run did not spend |
| 13 | Colour-match separately generated parts before the bake, while still shader-side | `[00:08:51]` "I just added RGB curves ... I want heads to match better the body color" | **untriaged** — anchors banked; plausibly a clause in the bake technique, not verified this run |

## Leads

- **An assembling generation agent.** The source reports an agent that produces parts and
  variations well and assembles them badly, which is the same split the corpus already
  draws between part generation and assembly. *Return when an agent's assembled output
  clears the structural gate without a human pass* — at that point `part-cut-planning` and
  the acceptance gate both have a new upstream.
- **Reading joint inheritance from an exported rig.** The landed technique's conform check
  is stated in prose and enforced by nothing, because no tree here can read an exported
  skeleton's joint orientations. *Return when any fleet tree gains a reader for an exported
  rig's joint orientations* — that is what turns the conform row's obligation from a
  sentence into a check.

## Notes for the next run

The corpus's "when not to use" sections are an under-read hunting ground, and this run
suggests why: they are written to *close* a technique, so they name paths the author knew
about and deliberately declined — which makes them a list of concepts the corpus has
already decided are real and has not necessarily housed anywhere. Grepping the corpus for a
concept that appears **only** inside a `when not to use` block is a cheap, mechanical
version of the enumeration hunt, and it found this run's landing.
