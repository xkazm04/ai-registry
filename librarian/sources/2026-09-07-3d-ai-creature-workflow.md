---
source: youtube:URjhE8QEhJU
kind: practitioner build-walkthrough (tutorial half + operating half)
url: https://www.youtube.com/watch?v=URjhE8QEhJU
title: "Create Anything with 3D AI - Animals, Monsters, Creatures Tutorial"
author: Stefan 3D AI
words: 5543
extracted: 11
accepted: 2
declined: 0
leads: 2
already_covered: 5
untriaged: 4
applied: 2
shipped: 0
dispatched: 0
run_id: gamedev-urjhe
siblings: 0
---

# 3D AI creature workflow — a build-walkthrough over a corpus that already models the bench

Operator brief: `domain game-development`. The registry's `game-production` bundle owns
this ground in depth, so the expected yield was **low, and concentrated in the operating
half** — the class reference's discriminating question (*is the creator describing what
the tool does, or what happened to them while using it?*) did the whole triage. It was
said out loud before the table and it held: the tour half produced five catches and a
pile of proper nouns; every row that survived came from a sentence about something that
went wrong.

**Container check.** 5,543 words from a real subtitle track — prose, not a decoded
container, so no thin-source or confidently-large failure. Length is not yield and was
not treated as such.

**Siblings: 0 live at claim.** No contention on either target, checked again immediately
before the first write.

**Fetch budget: 0 of 3** — the fourteenth consecutive corpus-internal run. The class
predicts it: a first-party account corroborates against the corpus and against the tree,
and the one row that needed outside support got it from training-data convergence plus a
law this bundle already carries.

## The declared focus (round 36), and whether it applied

1. **Report apply-row debt as a fraction.** Applied: **2 of 2 owed**, stated as a
   fraction in the scorecard cell rather than as a bare mode string. It did change how
   the run's last hour was spent — with the fraction visible, dropping the second row
   was not available as a quiet option.
2. **Keep seam-to-falsify and record when it fires.** It fired, for the **third**
   consecutive round, and this time it refuted the run's own technique rather than its
   hypothesis. See the texture row below; on the method's own rule, a third refutation
   makes this a rule the file should carry rather than a focus item.
3. **Ladder before corpus where a measured baseline exists.** `n/a` — game-production
   has no measured ladder. Only agent memory does. This run has nothing to add to the
   question of whether a second one is worth building.

## Triage table

Vetoes ran before scores; no score overturned one. `G/R/C` = gain / risk / cost.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | Plan the cuts before generating parts | image-to-3d-input-gating | new-technique | real gap | 3/1/2 | **accept** |
| 2 | K | technique | M | A texture pass must consume the bake | mesh-finishing-for-engine-readiness | new-technique | real gap | 3/1/2 | **accept** |
| 3 | K | amendment | S | Round-trip transform loss is a provider criterion | generative-provider-auditing | new-technique | real gap | 2/1/1 | untriaged |
| 4 | K | amendment | S | Auto-rig fails outright; harvest the skeleton | mesh-finishing (rig-preset) | new-technique | partial | 2/2/1 | untriaged |
| 5 | K | currency | S | Residual weight cost invariant across rig routes | mesh-finishing (rig-preset) | none | partial | 1/2/1 | untriaged |
| 6 | K | amendment | S | Low-direct vs dense+finish routes per PART | mesh-finishing (golden path) | none | partial | 1/1/1 | untriaged |
| 7 | K | — | — | Generate in a neutral symmetric pose | canonical-pose-rule | none | likely catch | — | already covered |
| 8 | K | — | — | Bound the regeneration loop | bounded-refine-iteration | none | likely catch | — | already covered |
| 9 | K | — | — | A rigid accessory rides one bone | rig-preset-and-bone-remap-binding | none | likely catch | — | already covered |
| 10 | K | — | — | Parts beat single-shot on local quality | part-split-budget-division | none | likely catch | — | already covered |
| 11 | K | — | — | Don't re-shade a mesh with authored normals | crease-angle-and-custom-normals | none | likely catch | — | already covered |

`auto=2/4/0`, `fp=0`. Four rows were rejected by the score and **none is filed as a
decline** — nobody looked at them and said no; the arithmetic put them below a threshold
deliberately set to prefer the recoverable error. Their anchors are below so a later run
buys them for the price of a re-read.

## The two promoting questions, executed

Both `partial` rows that could be promoted got their one file read, per the standing rule.

- **Row 2** promoted. The question was *does the corpus already own the ordering
  constraint between a bake and a generative texture pass?* The golden path's chain ends
  at bind and hands texture authoring to a neighbour; nothing owns the seam between them.
  The read also found the anchor: **L13, "declaring an input is not consuming it"**, which
  is the exact shape of a normal map that rides along on the material and is never read.
  L13 is cited by two techniques, neither in this lane.
- **Row 3 did not promote, and the read is worth recording anyway.**
  `arena-benchmark-protocol` step 5 enumerates the constraints to measure alongside
  quality — peak memory, latency, coexistence, concurrency ceiling, cold-start, cost per
  item. **Every one is a resource constraint. None is a correspondence constraint.** That
  is a genuine enumeration gap in a document that declares its own completeness, but it
  moved GAIN to 2 against a RISK of 1, which is 1, and the threshold is 2. Banked, not
  argued up. The temptation to pick the framing that flattered it is exactly what round
  27's rejected row is a precedent against.

## What landed

**`image-to-3d-input-gating/part-cut-planning`** (new technique). The corpus owns every
*consequence* of splitting an asset into parts and no part of the *decision*: budget
division takes the part count as an input, input gating grades each part image once it
exists, finishing assembles whatever arrives. So the cut boundaries get chosen by
whatever was easy to select in the reference. The technique makes the plan an artifact
authored before the first generation, with each boundary justified against one of four
downstream consumers — silhouette, binding, multiplicity, entanglement — and makes the
plan the one authority for the part count that every downstream budget derives from.
The subject already pulls downstream constraints forward (its pose rule exists because
a rig assumes a rest pose), so this is that subject's own move applied to a second axis.

**`mesh-finishing-for-engine-readiness/texture-pass-must-consume-the-bake`** (new
technique, plus an amendment it earned during the apply step). A generative texturer
that does not read the baked normal map produces colour describing a different surface
from the one the maps describe; the map is a declared input nothing consults. Routing key
is normal salience and it is a property of the *part*, so one character legitimately
splits across two texturing paths.

## The apply step: 2 rows owed, 2 run — and the refutation is the better one

Seam project **pof** (declares `game-production`; both subjects are joined to real
contexts in its registry map). Both rows are `simulation` with `structural-only` proof;
the reason no behavioural arm ran differs per row and is stated in each application.

**Row 1 — `part-cut-planning`, `better`.** The structural fact: in that tree the word
"part" has exactly one meaning and it is a **defect**. The critique stage carries an
over-budget part count as a finding code beside floater fragments; the finishing stage is
declared to *resolve* it, because its runner joins every part back into one object. Parts
are what the generator did to the asset, never what the pipeline asked for — the missing
stage in its purest form. Walked against three recorded in-tree measurements, including
four independent rolls of one prompt scoring 0/100 each with 35-56 substantial parts every
time at 20 credits a roll. Case 3 predicts **no difference** and is reported as such: a cut
plan does not touch the dominant defect, which is floaters in 10 of 10 failures. The
falsifier is named and is measurable from job stores the pipeline already keeps.

**Row 2 — `texture-pass-must-consume-the-bake`, `not-better`.** The seam was chosen to
falsify and it did. The re-texturing module documents, ground-truthed against the
provider's own SDK, that its texture operation accepts **a prior task id from that
provider and nothing else** — so a bench-baked mesh cannot be submitted at any price.
The technique's central procedure step, *probe the service with a strongly-baked part*,
is not uninformative here, it is **unrunnable**: arm B does not exist. Generator-textured
and bench-baked are disjoint product lines in that tree, and nothing crosses. The
technique gained a section for the condition it did not survive, which relocates the
routing decision from after finishing to commissioning time and makes the disjointness a
design constraint rather than a discovered surprise. A confirmation would have taught
nothing.

**Ship 0, and the reason is not timidity.** Row 1's next step is running the credit-spend
arm, not editing code; row 2's arm cannot exist. The only cheap change available was a
doc comment recording the disjointness, which has no measurable — and a change whose
effect cannot be named is a lead, not a landing. Both rows are recorded in pof's own
`.ai/applied.jsonl` and committed there with a pathspec (`8e47eb24`, on its active branch,
not pushed); two sibling files in that project's `.ai/` were modified and left untouched.

## Untriaged — real, unverified, nobody said no

**U1. A round trip through a mesh service is not the identity, and that is a provider
criterion.** [00:12:37] *"with Tripo models it's a bit of a pain in the ass that the models
come up back not in the same position ... in Hunyuan it returns the model in very same
position and some people actually choose to work with Hunyuan because of that because that
saves some time but yeah that's a trade-off."* The cost is a manual realignment **per
part**, so it scales with the cut plan and can invert a provider choice made on raw
quality. Home if promoted: `arena-benchmark-protocol` step 5, whose enumeration is
entirely resource-shaped (see above). Return condition: a second independent account of a
service altering an artifact's frame on a round trip, or one fleet pipeline measuring the
realignment cost per part.

**U2. When auto-rig fails outright, the reusable artifact is the skeleton, not the rig.**
[00:24:25] *"I tried to do it with Mixamo and Mixamo actually failed ... so I surrendered
and I tried another approach, I actually exported like Mixamo skeleton ... positioned
bones and skeleton on top of my character and then ... parent with automatic weights and
surprise surprise it was working very well."* `rig-preset-and-bone-remap-binding` scopes
itself to *"prefer transferring skinning weights from an already-correct body ... when one
exists"*; a chimeric subject is the else-branch, where no correct body exists and the
preset's value is its bone topology alone. Return: a second sighting, or a fleet project
that rigs a non-humanoid.

**U3. The residual weight cost is invariant across rig routes.** [00:26:32] *"I still had
to spend the same amount of time like addressing like this waste transition."* Two
different routes — harvest-the-skeleton, and rig-the-humanoid-half-then-join — cost the
same manual weight work. If it holds, the interesting consequence is that rig automation
should be selected on something other than the weight time it claims to save. n=1 and
self-reported. Return: a second independent account, or one measured pair.

**U4. The low-direct vs dense-and-finish choice is made per part, not per asset.**
[00:05:28] *"for some parts such as hair, head I definitely recommend to go low poly right
away ... For the rest such as arms, legs, the general body I did high poly."* The
finishing golden path states this rule at asset granularity (*"acceptable for small simple
props ... a dice-roll for anything that must hold up close to camera"*). Most of the
substance folded into `part-cut-planning`; what is banked is the granularity claim itself.

## Leads

**L1. A texturing model that conditions on a supplied normal map.** [00:19:20] The creator
says he has been raising this with the vendors directly and expects a future version to
handle it. This is the premise of the new technique's amendment, so its arrival changes
the shape of the advice rather than merely dating it. **Return condition: when any
texturing provider ships normal-map conditioning for user-supplied meshes** — at that
point the disjoint-lines section stops being the strong form and becomes the exception,
and pof's bench-baked line gains a colour engine it currently does not have.

**L2. Per-stage retry counts as planning inputs.** 20-25 generations to settle a character
reference; up to 4 regenerations for one part; up to 3 retopology retries per part. These
are first-party numbers with no protocol, so they corroborate nothing on their own.
**Return condition: a second independent first-party account reporting per-stage retry
counts**, at which point they become a dated calibration for `bounded-refine-iteration`
and `reroll-economics-per-credit` rather than an anecdote.

Both conditions are tied to events outside this fleet, which the last four runs have
flagged as the recurring weakness in this vault's lead conditions. L1 is the better of the
two on that axis only because pof would feel it immediately.

## Already covered — the catches

1. **Generate in a neutral, symmetric pose because the rig assumes a rest pose.**
   `canonical-pose-rule` says it better: three independent reasons, and it names the
   downstream-assumption one as the most underestimated. The source reaches the same
   conclusion by hitting it ([00:04:13] *"there will be a rigging at some point, so that
   will be a nightmare"*).
2. **Bound the regeneration loop.** `bounded-refine-iteration` and
   `reroll-economics-per-credit`.
3. **A rigid accessory rides a single bone.** [00:25:16] hair and hair accessory follow
   the head bone only — the decision rule verbatim in substance.
4. **Parts beat single-shot on local quality.** The opening premise of
   `part-split-budget-division`. The source adds nothing to the premise; what it adds is
   the cut decision, which is row 1.
5. **Do not re-shade a mesh that arrives with authored normals, and verify the poly count
   a tool suggests.** `crease-angle-and-custom-normals` and
   `class-ceiling-vs-requested-budget` — and pof's own module has already measured it
   (0 of 30,967 normals changed on generated input).

## Notes for the next run over this class

The build-walkthrough class earned its entry again, and the split was unusually clean:
**every accepted and untriaged row came from a failure sentence, and every catch came
from the tour.** A cheap tell for the next run: rows sourced from the demo half were
already in the corpus at a higher quality, because a demo explains a solved problem and
the corpus is made of solved problems. The yield is in the sentences where the creator
stops selling and reports a cost.
