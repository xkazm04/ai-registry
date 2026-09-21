---
source: youtube
kind: practitioner build-walkthrough (sponsored; two builds, one relayed)
url: https://www.youtube.com/watch?v=9lFE4T7iZKM
title: "I Spent 1B Tokens with GPT-6 to Create This…"
author: Stefan 3D AI
words: 2964
extracted: 12
accepted: 0
declined: 0
leads: 3
already_covered: 4
untriaged: 5
applied: 0
shipped: 0
dispatched: 0
run_id: intake-9lfe4t
siblings: 0
intake_version: 2.11.0
---

# Two agent-only game builds, prompting only - a lead-and-catch run

The creator tried to build a realistic zombie shooter on one engine using only prompts. A friend
tried an open-world driving game on another. Both used the same frontier coding model, an engine
bridge and a generation aggregator (the sponsor). This is the channel's ninth entry in this ledger.
The class rule held again: *is the creator describing what the tool does, or what happened to them
while using it?* Both real gaps came from failure sentences: the cars that could not be
interactive and the assets the agent downloaded unasked. Every catch came from the tour half.

**Expected yield, said before the table: LOW.** `game-production/asset-production` already
models this bench in depth, and two same-channel runs (2026-09-07, 2026-09-14) mined the
neighbouring ground. **Actual: 0 landings, 3 leads, 4 catches, 5 untriaged.** 0 of 3 fetches, as
the class predicts for a first-party account. 0 siblings live at claim.

Declared focus from the scorecard was `ship`. It did not move: nothing cleared the gate, so no
apply row was owed. The reason is in the scorecard row, not hidden here.

## Triage

Upper-layer rows were scored under v2.5. Currency and leads were admitted under the
corroboration table. Row 3 is also render-bound (Phase 6b).

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| - | - | - | - | - | - | - | - | - | - |
| 1 | K | technique | S | Prototype procedurally, then layer generated assets, 00:01:16 | `production-work-prioritization` (vertical slice), `generative-artifact-gating/placeholder-is-not-an-asset` (stand-in origin) | none | likely catch | - | **Already covered** |
| 2 | K | technique | M | An acquired asset is an origin the generative gate cannot represent, 00:03:50 | `generative-artifact-gating/placeholder-is-not-an-asset` | new-technique | real gap | 2/1/2 | **Untriaged** |
| 3 | K | amendment | M | Runtime articulation is a cut trigger, 00:13:30 and 00:06:45 | `image-to-3d-input-gating/part-cut-planning` | corrects-claim | real gap | 3/2/2 | **Untriaged -> lead** (score 1; render-bound with no local image-to-3D instrument) |
| 4 | K | technique | M | Video reference for agent-authored animation, 00:05:30 and 00:12:14 | lead L1 of 2026-09-14 (measured within agent variance); `motion-quality-gating` gates footage for extraction | none | reconsider? | - | **Lead sighting** (same author, not independent) |
| 5 | K | technique | S | Parallel agent sessions contend for one engine editor, 00:09:43 | `engine-integration-safety/single-instance-lease-and-drain`, `content-drift-and-revision/batch-lease-on-a-non-reentrant-resource` | none | likely catch | - | **Already covered** |
| 6 | K | currency | S | One aggregator subscription reaches many 3D and video providers, 00:04:40 (sponsor read) | `generative-provider-auditing/capability-is-not-registry-membership` | none | thin | - | **Already covered** |
| 7 | X | currency | S | Frontier coding model public; an official engine plugin exposes the engine CLI to coding agents, 00:01:42 | no application cites either | none | dated | - | **Lead** |
| 8 | K | dated fact | S | Agent-only cost: 1.29B and ~2.5B tokens, ~50-100 h, ~$40-100 of assets; a human does the car-with-doors in 30 min, 00:08:25 and 00:14:48 | `production-pipeline-phasing` | none | thin | - | **Untriaged** |
| 9 | K | technique | S | A model's default UI output converges on one house style, 00:02:08 | none mapped | none | thin | - | **Untriaged** |
| 10 | K | technique | S | Procedural construction is sufficient for stylized low-poly VFX/SFX, 00:02:58 | `placeholder-is-not-an-asset` "deterministic construction is the better producer" | none | likely catch | - | **Already covered** |
| 11 | K | technique | S | The agent composes coherent interiors from generated parts, 00:12:39 | none | none | thin | - | **Untriaged** |
| 12 | K | technique | S | A compile-bound engine slows agent iteration loops, 00:09:43 | `engine-integration-safety` | none | thin | - | **Untriaged** |

`auto=0/2/0 fp=0`: rows 2 and 3 were scored and both fell below the +2 threshold. No row was
escalated.

## Row 3 - runtime articulation is a cut trigger (lead)

**What the source showed.** Generated car models could not be made interactive. A door has to be
its own piece to open, so the friend's build kept the ugly procedural cars, because those cars
were modular. In the other build, the agent rebuilt a shotgun barrel and a minigun from separate
primitive parts so the reloads could animate. The creator's own verdict: a human who generates
the car and its doors separately in 30 minutes beats days of prompting.

**What the corpus says.** `part-cut-planning` treats the split as triggered by reconstruction
failure only. Its golden-path paragraph opens *"Past a certain complexity a subject stops being
one reconstruction"*, and the technique's first "When not to use" reads *"When the subject
reconstructs acceptably whole ... only worth paying where single-shot generation actually
fails."* Its Binding consumer already says *"A rigid single-bone piece is always its own part"*,
but only once a split has been chosen. A car that reconstructs cleanly but must open its doors
falls between those two sentences.

**Convergence found in the fleet, not in the source.** pof's own engine-gotcha knowledge,
written without this source, tells the agent to segment a generator's single solid mesh into
named parts *"so each is an independently-skinnable mesh ... or modular swap-slot"*, with rigid
parts weighted to one bone. It also says pof's mesh split exists for economics (one job, several
props) and for debris, never for articulation. So pof has written down the articulation trigger
as a gotcha and has no pipeline stage that acts on it. The source and the fleet tree agree, and
the corpus is the one that disagrees.

**Why it did not land.** There are two independent blockers:

1. The score is 3/2/2, which nets +1. The landing makes a standing sentence false (*"only worth
   paying where single-shot generation actually fails"*), so it takes the +2 rewrite penalty.
   The run asked whether the finding requires the rewrite (2.5.0 lesson). It does: an
   interaction trigger contradicts that clause in every shape tried, whether as a fifth
   consumer, a sibling technique or a qualifier.
2. The row is render-bound: its home is `asset-production`, and it changes what gets
   commissioned. **No local image-to-3D generator was found.** ComfyUI was not running, its
   configured model base did not resolve, and no local reconstruction package was importable.
   The render-proof instrument table lists none either.

**Return condition:** either a local image-to-3D route passes its probe, so a fused whole can be
rendered against a parts-commissioned articulated subject in a pose sheet, or a pof credit-spend
arm commissions one vehicle-class asset both ways. When it returns, land it as a scoped
amendment to `part-cut-planning`. The discriminator is *"does anything move this piece at
runtime?"*, and the "When not to use" clause gets that qualifier.

## Row 2 - the acquired origin (untriaged)

**Source.** Given web access and no sourcing policy, the agent found and downloaded third-party
animation and image packs on its own (*"if you're not specified that everything should be
generated procedurally, it can stick to the internet and use ready-made assets"*).

**Corpus.** `generative-artifact-gating` says *"origin is not a boolean. It has three values -
generated, constructed, stand-in"*. The technique's disjointness rule adds *"a generated asset is
always a reference to a served location"*. A downloaded asset is also a served reference, but it
has no generation history, no producer evidence and a licence. The three-valued field has no
place for it, and the representation rule reads it as generated.

**Tree.** pof keeps acquired assets in a library with a licence per download, and its step prompt
carries *"Assets the project ALREADY holds, with their licenses carried through"*. That is the
append shape: acquisition is its own record, not a fourth generation origin. **An asymmetry sits
inside pof itself.** Audio catalog entries carry a `license` field. The animation-asset entry
carries `source: 'mixamo' | 'authored' | 'imported'` and no licence, and animations are the one
class pof acquires through a manual third-party download step. This is a coverage lead for pof,
not a shipped change: no measurable was nameable beyond a field's existence, so it would be
`structural-only`, and that does not commit.

**Score.** 2/1/2 nets +1, below the +2 threshold. Written as an append, every standing sentence
stays true. RISK is 0 for the claim (corpus and tree opened) plus +1 because the home is
contested between `generative-artifact-gating` (admission) and `sourcing-economics` (the category
named for the decision). Banked with its anchors. **Return:** a second independent source on
agents sourcing third-party assets unasked, or a fleet incident where an acquired asset passed a
generative gate as generated.

## Leads

1. **Runtime articulation is a cut trigger (row 3).** Return condition above.
2. **Video reference for agent animation (row 4): second sighting, same channel.** This source
   adds a variant that 2026-09-14 did not test. The friend's build recovered motion from a
   generated clip with a monocular human-motion-recovery library (car entry and exit) rather
   than having the agent keyframe from frames. Extraction from footage is already gated in
   `motion-quality-gating`, so the variant is a catch in the corpus and an untested arm in the
   fleet. Return: same as 2026-09-14 L1 (a clean rig), plus a local motion-recovery route that
   passes a probe.
3. **Engine bridges for coding agents are now vendor-official (row 7).** Return: when an
   application in `engine-integration` cites how an agent drives the editor, re-verify it
   against the official bridge.

## Untriaged - real, unverified, nobody said no

Rows 2, 8, 9, 11 and 12 above, with their anchors. Row 2 is the one worth a re-read.

## Instruments

- `research-ingest`: VTT subtitle track, 2,964 words, prose on the first screen (not a decoded
  container).
- `research-map`: one call, 11 terms, `--deep`, 9 bundles on `main`.
- Absences asserted by uncapped Grep over `knowledge/` with counts: `retarget`, `pose estim`,
  `licen`, `articulat`, `editor instance`. No piped heads were used for an absence.
- Fleet seam greps in pof at `bba723dc`, read-only. Nothing in pof was modified.
