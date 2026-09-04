---
source: worldlabs-atlas
kind: vendor release announcement (first-party — the team that built it)
url: https://www.worldlabs.ai/blog/atlas
title: "Atlas: A World Model for Spatial Intelligence"
author: World Labs team
published: 2026-09-01
words: 2835
extracted: 12
accepted: 2
declined: 0
leads: 3
already_covered: 4
untriaged: 2
dispatched: 0
applied: 2
shipped: 1
fetches_spent: 0
run_id: atlas-wl
siblings: 3
---

# Atlas — a world model announcement, mined for its protocol rather than its model

**Class and expected yield, said before the triage table.** A vendor release
announcement about the vendor's own release. Reliable for its *numbers* and its
*stated protocol*; its prose is the strip test's problem, and its scaling section is
future tense and therefore unstrippable. The calibrated expectation was one or two
techniques and a majority of catches, and that is what the run produced.

**Siblings.** Three live runs on the board at Phase 0 — `zvecgrep` (a search
repository), `copilot-cost` (a vendor cost-efficiency post) and `agentic-video` (a
vendor video-model post). None held a media-generation subject; both of this run's
homes checked clear immediately before the write. Two of the three were landing in
`software-engineering/llm-agent/`, which is where this run found the gate red on files
it did not own (see below).

**Fetch budget: 0 of 3 spent**, which is the class rule rather than thrift. A
first-party account corroborates corpus-internally, and both accepted findings did:
one against a law this corpus already holds, one against real code in a connected
tree. Reaching for the web here would have been a sign the claim had no home.

## The design read (abbreviated — a blog, not a tree)

The Technical Details section is decision-dense enough to run the design read against,
with one honest limit: there is no tree, so `where:` is a section name and no
source-tree application is writable.

| # | Decision | Forces | Corpus |
| --- | --- | --- | --- |
| 1 | Every context element is grounded at an explicit camera pose — a *spatial* context | Prose cannot express a camera path; two authorities over one channel compromise | **media-generation#typed-input-owns-its-channel** models the forces |
| 2 | Autoregressive over a multimodal sequence, so each task is just a different sequence shape | One model for generation, reconstruction and simulation without a head per task | **NONE** — nearest is `self-describing-model-packages`, which models packaging, not architecture |
| 3 | Hybrid AR-transformer + latent diffusion, chosen partly to inherit *both* optimization ecosystems | Serving cost; optimization work is ecosystem-bound and does not transfer | **NONE** — `inference-serving` models the techniques, nothing models the inheritance as a selection criterion |
| 4 | The world and the robot's view of it come from one model | A separate simulator and sensor renderer have independent errors; the view can be right about a wrong world | **game-production#one-authority-per-quantity** models the forces exactly |
| 5 | Depth maps are a native output type, not a post-process estimate | A post-hoc estimator is a second authority over the same geometry | Same law as #4 |

**Routing count: 2** (entries 2 and 3), and they share no home-if-new. Below the
threshold on both clauses, so: **stay in intake, no forge handoff, no XL trigger.**
Both NONE entries are decisions about how to build a foundation model, which is the
correct reason the corpus does not carry them and probably should not.

## Accepted

### 1. `input-channel-parity` — media-generation/visual-generation/generated-output-grading

The source benchmarks itself against video models on camera-controlled generation. It
encodes the camera path in its own native format; the baselines, which have no such
input, get the path described in a text prompt using cinematic terms. The post
discloses the confound in its own prose — "it is possible that more sophisticated
prompt engineering… could improve camera following for some models" — and then reports
that its advantage *grows as camera trajectories become more complex*.

The corpus already owns the design side of this: `typed-input-owns-its-channel` says
prose stops directing a dimension the moment something else sets it. Nothing owned the
measurement side. The two neighbouring instruments both assume it away —
`arena-benchmark-protocol` holds budgets identical across arms, and
`cross-provider-flip-analysis` declares that "the diff is only valid if the generator
was the *only* variable… any second difference contaminates every flip." That
enumeration does not contain the case where the second difference **cannot be
removed**, because it is a property of what the arms are. Counted greps: zero hits for
affordance / native input / typed input / input channel across the whole subject, run
uncapped.

Landed as a technique, not an amendment: the resolution is a procedure the subject did
not have — enumerate the channels per arm before the first render, run the typed arm
through prose as a parity column, and report both numbers labelled — not a caveat on
an existing rule.

### 2. `anchor-removal-ablation` — media-generation/research-grounding/evidence-bound-visuals

The source's reconstruction section is a staged demonstration: one input image, the
garden is faithful and the rest is imagined; two images, the cottage joins it and the
house on the left is still invented; three, the scene is accurate. "The more it sees,
the less it imagines."

`epistemic-draw-routing` owns the corpus's answer to grounded-vs-invented — route
checkable pixels to code, free pixels to the model — and it works **by layer**. A
reconstruction breaks that precondition: one surface, grounded and invented content
interleaved at the pixel, in the same style, with no seam. The golden path's standing
remedy is to trim "the region where the invention became obvious", which assumes it
became obvious; here the model's whole value is that it does not.

The finding is that the source's own three-image progression, read backwards, is an
instrument: **the invented region is the region that changes when you remove an
anchor.** Landed as a technique with the ladder, the instability map, and the rules
that keep it honest (stability is necessary, not sufficient).

## Leads

- **An architecture choice inherits an optimization ecosystem.** The source argues its
  hybrid can use KV-caching, cache-aware routing and disaggregated serving *because*
  it is autoregressive, and distillation, classifier-free guidance and shifted noise
  schedules *because* it is a latent diffusion model — i.e. the architecture decision
  is partly a decision about which body of serving work you may draw on. Real hole:
  five hits under `backend-platform/inference-serving`, all of them applications, none
  a technique or golden path stating this. **Return when** a second independent source
  states it, or a connected tree makes an architecture choice on serving-inheritance
  grounds — one unmeasured vendor sentence cannot authorize a technique.
- **Media-generation carries no 3D lane at all.** A counted grep for novel-view
  synthesis, sparse-view reconstruction, splats, point clouds or photogrammetry
  returns **zero files** across all 20 subjects. This was triaged as a currency signal
  and the promoting question demoted it: there is no clock to reset, because there is
  nothing there. The bundle covers 2D generation, audio and narrative. **Return when**
  a connected project takes on 3D asset work, or a second source makes the gap
  measurable — it is a scope question for the bundle, not a subject-sized gap this
  source can argue.
- **Capture cost for multi-view work has collapsed.** Reframing shots from three to
  five ordinary phones on tripods, and reconstructing large environments from a single
  24-frame phone video, in place of a capture studio. Dated fact, no home while the
  previous lead stands. **Return when** the 3D lane exists.

## Already covered (catches)

- **Typed camera input beats prose camera direction.** `media-generation#typed-input-owns-its-channel`
  owns it as a law. The source is independent first-party confirmation *with a
  measurement*, which is why the accepted finding sits one level down at the
  measurement consequence rather than restating the law.
- **One model for both the world and its observer.** `game-production#one-authority-per-quantity`
  models the forces exactly — "two systems answering the same question with two models
  is worse than having one model, and worse than having none: the disagreement is
  invisible until it is load-bearing." Triaged as a lead, demoted to a catch by the
  promoting question. The law generalizes to a simulator/renderer pair, and that is
  worth knowing without writing anything.
- **"You are staging the scene, not pulling the lever of a slot machine."**
  `cinematic-language` and `frame-direction` own the staging-over-sampling doctrine.
- **Re-run every baseline under one protocol rather than citing published numbers.**
  `quality-regression-gating#baseline-carries-its-conditions`, plus
  `arena-benchmark-protocol`'s fixed-set rule. The source does the right thing here
  and says so; the corpus already said it.
- **No single pooled score for a generalist; report per task.** `arena-benchmark-protocol`
  rule 4, "results per class, never pooled".

## Untriaged — extracted, reached the table, nobody verified

Recorded with their anchors so a later run does not re-derive them. **Nobody looked at
these and said no; nobody looked at them at all.**

| Candidate | Anchor |
| --- | --- |
| Demo media disclosed as compressed for page performance — a claim about the artifact rather than the model | "The rest of the videos on this page have been compressed to optimize page performance." |
| Sparse reconstruction saturates: "as few as two or three images" for faithful output, but "over a hundred" is usable — a knee worth locating | "typically gives faithful reconstructions with as few as two or three images" |

## Apply, and the fleet's reach

| Technique | Project | Mode | Verdict |
| --- | --- | --- | --- |
| `input-channel-parity` | gravity | `code` | **better** — shipped |
| `anchor-removal-ablation` | — | — | **unapplied: no seam in the fleet** |

**The applied row.** The tree was ahead of the technique on one axis and behind on
another, which is the state this run's declared focus asked to be treated as a source
rather than as a verdict. Its imaging layer already carried a channel-capability flag
for reference images, with the reasoning written into the type — a request field
"honoured or quietly ignored" is a silent near-miss, so the router treats it as a
routing constraint. The negative prompt has the identical property and had no
declaration: native request field on one adapter, appended to the positive prompt as a
sentence on the other. The two dimensions **invert across the same provider pair**, and
nobody designed that — it fell out of the reference case being the one that visibly
broke. Per the technique, declaration rather than routing, because both arms do honour
it. Paired against `HEAD` on one counter: declared 1/2 → 2/2, recorded 0/2 → 1/2;
typecheck clean; 41 lines. Proof status `structural-only` — no vendor call was made,
and the parity column the technique asks for is still unrun in that tree.

**The unapplied row is the interesting one.** `anchor-removal-ablation` requires a
generator that fills unobserved regions of a real referent. Only two projects declare
media-generation; neither has that shape — one conditions on *style* references
explicitly labelled "not content to reproduce", the other's only 3D surfaces are UI in
a worktree. This is not a miss. It is the corpus outrunning the fleet, and it should be
read as its own state: **1 of 2 findings this run has no seam anywhere in the eight
authorized trees.** Return condition: when a project grows a reconstruction or
inpainting surface over real referents.

## Directions not proposed

Zero, and the instrument decided it rather than the cap. `build-fleet-map` classifies
**every** absence for both landed subjects as `out-of-domain`: only two projects carry
media-generation and both are already present in both subjects. No project's scope was
eligible, so none was ranked and none was withheld.

## The gate was red, on files this run does not own

`check-bundles` reported five bidirectional-link failures, all under
`software-engineering/llm-agent/` — `cost-metering`, `eval-harness` (×2) and
`mcp-tools` (×2): techniques on disk that their golden paths do not yet declare. That
is two live siblings mid-write. Reported, not fixed, and no lock was held while
looking. media-generation went 132 → 134 techniques with no problems of its own.

## Method notes for the next run over this class

- **The promoting question moved all three `partial` rows and demoted two of them.**
  One currency row became a bundle-scope lead, one lead became a catch. Under the old
  rule all three would have been banked with their anchors and the two demotions would
  have been re-derived. Cost: three file reads.
- **A vendor's self-disclosed confound is the highest-yield sentence in this class.**
  The paragraph that made this run was the one hedging its own benchmark. A release
  announcement is written to be quoted, and the one place it is not is where it
  explains why its own number might be generous. Read that paragraph first.
- **This source implements a good idea badly in exactly the useful way.** Its
  benchmark protocol is careful — it reproduces every baseline itself for a common
  evaluation — and then compares arms with unequal input channels and reports the
  result as a model comparison. A correct source would have handed over a catch.
