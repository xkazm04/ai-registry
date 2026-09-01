---
source: youtube:6Ytluv_DiSo
kind: practitioner build-walkthrough - hybrid, ~85% tour half
url: https://www.youtube.com/watch?v=6Ytluv_DiSo
title: "I Built a Whole Game Level Using Only FREE AI - My Full Workflow"
author: Stefan 3D AI
words: 5616
extracted: 12
accepted: 1
declined: 0
leads: 2
already_covered: 6
untriaged: 3
applied: 1
shipped: 1
dispatched: 0
fetches_spent: 0
run_id: intake-6ytluv
siblings: 2
---

# Free-AI game level walkthrough

A 3D artist builds one pirate-cave level end to end on free tools, narrating every click.
Read as a **practitioner build-walkthrough**: the tour half (which button, which tool,
which add-on) is 85% of the runtime and yields nothing but proper nouns, and the operating
half — the sentences about what happened to him while doing it — carried everything.
Expected yield was called low before the triage table and the run landed one amendment,
which is on target for the class.

**Siblings:** 2 live at claim (`intake-echx` on `generative-provider-auditing`,
`intake-yt-lnlmxsuqggc` on `quality-regression-gating`); by Phase 9, 4 — `reallusion-aistudio`
and `openwiki-v050` joined. None held either subject I touched, so no `content` lock was
ever contended. Two siblings' uncommitted applications ended up inside my regenerated
`index.json`, so index and catalog were deliberately left uncommitted (see Phase 10 note
below).

**Zero of three fetches spent.** Sixth consecutive run in a practitioner class to spend
none: the pick was corroborated *corpus-internally* against a subject in the same bundle,
which is stronger than anything the video could have said.

## Accepted

### 1. A deterministic producer can be terminal, not a stand-in — `[26:20]`

> "sometimes generating objects with AI is not optimal by speed and by quality. For
> example I needed a rope to connect this hook and the boat with the pierce. So instead of
> going and generating the rope alone I just created the primitive curve … that will be
> five times faster than doing that with AI."

**Strip test:** survives. Remove every tool name and the claim is *an asset class that a
parameter set describes completely is constructed faster and better than it is generated,
and the constructed result is finished work.*

**Home:** `game-production/content-pipeline/generative-artifact-gating` — the golden path
plus its `placeholder-is-not-an-asset` technique. Landed as an **amendment**, not a new
technique: the concern belongs inside the origin rule rather than beside it, and this way
no golden-path `techniques:` list was touched, which is also why nothing contended.

**What the source got wrong, and what it located.** The video is a tool tutorial that
states the rule offhandedly while demonstrating it; it never generalizes past ropes. The
generalization came from reading the corpus against itself.

**How it was corroborated — corpus-internally, and this is the finding's real spine.**
The same bundle already holds `balance-validation/procedural-level-planning`, a subject
whose *shipped artifact* is locally computed, reproducible from a seed, and terminal —
nobody regenerates a level plan with a model — and whose `seed-determinism-contract` is
precisely the evidence-of-work record that a generation history is for a generated asset.
Meanwhile `placeholder-is-not-an-asset` listed "a procedurally derived sample" among
stand-ins and ruled *the generator must run*. Two subjects of one bundle disagreeing is
better evidence than a video, and it cost no fetch. Training-data convergence backs it
independently: splines for ropes, cables and roads, and procedural foliage and terrain,
are terminal producers in every serious content pipeline and predate generative tooling
entirely.

**The correction I owe my own first reading.** I initially wrote this up as a missing
exception. It is not — `placeholder-is-not-an-asset` already carried one, *"Where the
stand-in is the deliverable"*, and I only found it by opening the file instead of trusting
the `research-map` summary. But all three of its examples (a fallback, a neutral default,
a licence-safe substitute) are **a slot accepting a lesser thing**, and the technique's
disjointness rule — *"a real asset is always a reference to a served location, a stand-in
is always a locally computed value"* — makes a *finished* construction structurally
unrepresentable. What was missing was not an exception but a **third origin**. That is what
landed.

**What changed:** `use_when` gained the discriminating case; the verdict table's stand-in
row gained its precondition and a `constructed` row beside it; the origin field went from
two values to three; the disjointness bullet now names its own assumption and says when two
representations are not enough; a second "when not to use it" bullet separates *a better
producer* from *a lesser one*. The golden path's "the only thing that can carry the line
forward" is now scoped to classes a generator alone can produce, its third state gained a
precondition, and a new section, *Deterministic is not a synonym for unfinished*, states
the three origins and the cost of collapsing two of them.

## Untriaged — reached the table, nobody verified them

Recorded with anchors so a later run does not re-derive them. **No judgment attached; these
were not declined.**

| # | Candidate | Anchor | My read at triage |
| --- | --- | --- | --- |
| 2 | Independently generated assets are not mutually consistent in colour; the economical fix is a downstream deterministic correction **baked into the artifact**, not a regeneration or a better prompt. The corpus answers consistency almost entirely *upstream* (`visual-style-locking`, and a law: `style-is-restated-not-remembered`); this is the downstream half, and zero files in `game-production` or `media-generation` match colour drift, white balance, colour grade or material consistency. | `[10:30]` | partial |
| 3 | Subject count for a generation input is **decided, not observed** — the cut is chosen by how much independent control you need downstream, and props that will always be placed as a unit should be generated as one subject to save time and tokens. `single-subject-plain-background` says "Count subjects", but its own qualifier ("a held prop *that must exist as a separate asset*") already smuggles in the real criterion. An amendment sharpening the qualifier into the rule, at most. | `[02:31]` | likely catch |
| 4 | Seed a scene's assembly from the element whose dimensions are **externally fixed**, not from the largest — it becomes the scale reference for everything else, and elements sized only relative to others cannot be placed first. Adjacent to `generated-asset-world-scale`, but that subject's `reference-skeleton-size-check` is about one humanoid against a reference rig, not about assembly order. | `[21:00]` | partial |

## Leads

- **Generation is not the cost centre of an AI asset pipeline; assembly and presentation
  are.** Self-reported timings, n=1: ~1 hour to assemble the main chunk, ~25 minutes for
  the cave, ~2 hours in the engine on lighting, weather and VFX, and "one hour like two
  hours" on lighting options alone — against minutes of actual generation. The class entry
  says *read the timers*, and these are the timers. **Return condition:** when a second
  independent first-party account reports its own stage-time distribution, this becomes a
  golden-path claim about where a generative pipeline's budget actually goes.
- **Currency, unverified.** The video reports an engine vendor announcing native MCP in an
  upcoming release, and a 3D-generation vendor shipping quad topology. Both are exactly the
  class of fact a news source is reliable for and neither was corroborated in-run.
  `asset-class-poly-budgeting/quad-trap-detection` is the subject quad topology would touch.
  **Return condition:** when either ships and a connected project can consume it.

## Already covered — catches, verified by reading the subjects

Proposing any of these again is wasted budget. All six are covered *better* than the video
covers them, which is the expected result for this class.

| Candidate | Owned by |
| --- | --- |
| Decimate to low-poly, unwrap, bake the normal from the high-poly | `mesh-finishing-for-engine-readiness` — `unwrap-only-the-low-poly`, `high-to-low-bake-coverage`, `pack-existing-vs-smart-unwrap` |
| Tile a texture across a big surface, or build the surface from chunks | `tiling-texture-acceptance` — `texel-density-and-uv-tiling` |
| Author roughness/metallic maps by painting values | `shader-budget-authoring` — `channel-packing` |
| Split a generation into parts and budget each | `asset-class-poly-budgeting` — `part-split-budget-division` |
| Local repair beats a generator round trip below a defect threshold | `regeneration-vs-repair-economics` — `defect-class-to-remedy-map`, `refuse-the-fix-that-cannot-help` |
| Cut geometry the player can never see | `asset-class-poly-budgeting`, and level craft generally |

## Apply — `experiment`, verdict `better`

`pof` is the only fleet project declaring `game-production`, and its `.ai/registry-map.json`
joined two contexts to this subject, so the seam was predicted at triage rather than
discovered at Phase 8 — which was this run's declared focus, and it held.

The A/B is in the application document. In short: of `pof`'s thirteen Items steps, the
two-valued origin classifies **2 correctly** and would defer the other eleven to a
generator run that does not exist for them; the three-valued origin classifies **13**. The
tree implements the three origins without naming them, which is a structural fact nobody
designed and better evidence than the video that occasioned it.

**The instrument lied first, twice, and both ways are worth carrying.** The mutation probe
I added to `pof` reported four insensitive gates on its first run. All four were the
probe's fault: it mutated every value at once, which leaves a ratio-reading predicate
invariant, and it walked only the top level, which never reached a nested `stats` object.
Corrected — one leaf at a time, recursive, plus deletion — it reports **13 of 13 sensitive,
0 insensitive**. A probe that under-reports sensitivity indicts working gates, and I would
have shipped that indictment if I had trusted the first number.

**Shipped:** `pof@3de20873` — the probe plus the `.ai/applied.jsonl` row, committed on
`master` with a pathspec, not pushed. `pof`'s tree carried unrelated WIP, so nothing else
was staged.

## Phase 10 note — index and catalog left uncommitted, deliberately

By the time I regenerated, two siblings had uncommitted applications in this shared
checkout (`node--never-the-account-default.md`, `react--movement-motivation.md`), and both
appear in the regenerated `index.json`. Committing those artifacts would bake another run's
half-finished work into a hash under this run's name, so index and catalog stay in the
working tree for whoever commits last. A stale index in a shared checkout is a known,
self-correcting state.
