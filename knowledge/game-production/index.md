---
okf_version: "0.1"
okf_bundle_name: game-production
okf_bundle_title: Game production
profile: rkb/0.1
purity: game
---

# Game production

The craft of producing a game's systems and content at scale with machine assistance,
and proving the result is good enough to ship: the systems law a genre obeys, the
balance work that validates numbers before an engine ever runs them, the production
line that carries a piece of content from brief to accepted, the generative asset
craft that makes model output engine-ready, the protocol for driving a live engine
without lying about what happened, and the machine judgment that grades all of it
against what shipped products actually look like.

One bundle on purpose. Design law, content pipeline, asset generation and engine
integration look separable, but they share one denylist — engine names, digital-content-
creation tools, generative model products — and they share the epistemic spine that
runs through every category: a production claim is worth exactly the evidence behind
it. The split test lives in `knowledge/README.md`; no category has earned it yet.
Categories keep the seam visible until one does.

## Boundary contract with `media-generation`

The `media-generation` bundle owns **generative media craft in general**: narrative
structure, research grounding, prompt composition, style locking, provider routing,
frame direction, and grading a generated output as a finished piece. This bundle owns
what is specific to producing a **playable artifact** — output that must satisfy an
engine, a budget, and a runtime before anyone can look at it. The seam is *engine-
readiness*: polygon budgets in a declared unit, world scale at the import edge, seam
and tiling acceptance ahead of a build cycle, shader sampler ceilings, rig and skeleton
binding, spatial audio derived from a level's rooms, and motion judged as motion rather
than as footage. Where a concern touches the seam, the golden path names the neighbour
in prose; cross-bundle links are forbidden by the profile, deliberately.

## Boundary contract with `llm-observability`

The `llm-observability` bundle owns the **operator side of production model traffic**:
telemetry, price books, cost attribution, unit economics, and judge-scoring of live
traces as a general practice. This bundle owns the **craft half** of machine judgment —
what a rubric for game craft must contain, what a verdict is bound to, what a gate may
conclude, and what an unattended builder is allowed to certify. Spend metering, session
plumbing and stream parsing belong to the neighbour and are not duplicated here.

The upper two layers are transplant-clean per the `game` purity profile: a studio on a
different engine, with different tools and a different genre, must be able to adopt a
golden path unchanged. Applications cite real code and name their stack in the filename.

Cross-cutting invariants live in [`_laws.md`](./_laws.md); techniques cite them by
anchor. Subjects are grouped - and located - by [`taxonomy.json`](./taxonomy.json).

Format: [RKB profile v0.1](../../docs/rkb-profile.md), an OKF profile.
Evidence: consumer-local by design — see the profile, §5.
