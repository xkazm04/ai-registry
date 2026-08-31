---
source: youtube
kind: practitioner build-walkthrough (tutorial form, affiliate-sponsored demo half)
url: https://www.youtube.com/watch?v=DrsvFcPg8jY
title: How to Make 3D Documentary Videos with AI
author: Creating with Conor
words: 2214
extracted: 13
accepted: 2
declined: 0
leads: 2
already_covered: 8
untriaged: 3
dispatched: 0
applied: 2
shipped: 0
fetches_spent: 0
---

# How to Make 3D Documentary Videos with AI

`/intake` run 28. Domain constrained to `media-generation` by the operator.

A single creator walks one ~60-second animated documentary end to end: story from
a chat model, character sheets and location plates from an image model, five clips
from a video model, narration from a TTS model, assembly in a consumer editor,
terminal upscale. Sponsored - the platform is an aggregator and the link is in the
description.

## The class read, and why the yield was where it was

**Practitioner build-walkthrough, tutorial form.** The two halves separate unusually
cleanly here and the discriminating question decided every row:

- The **tour half** is a sponsored platform demo. It strips to nothing - the whole
  half is product names - and it contains no failure, no retake and no reject count
  in twelve minutes. The segment it is proudest of (*"if you showed this to someone
  without telling them it was AI, they'd genuinely believe real animators made it"*)
  is exactly where the boundary is missing, as the class row predicts.
- The **operating half** is better than this class usually gives, for one structural
  reason: the creator states his rules as *generalizations*, unprompted, in his own
  voice, at the end of each segment - "so when you're putting a character into one of
  your locations, light them with something that's already in that room". A tutorial
  built to be followed produces first-party rules as a side effect of being
  followable.

**Expected yield was called at 1-2 real gaps before the triage table**, against a
`visual-generation` area that is the second-densest in the bundle and had been swept
five times. Eleven of thirteen candidates landed on slugs that already existed. Two
survived. That is the class performing to spec, not a thin source.

**Fetch budget: 0 of 3.** Both accepted findings were corroborated corpus-internally -
one against the technique that denies the case, one against a sibling subject that
supplies the mechanism. This is the fourth consecutive first-party-account run to
spend nothing, and it is now the class's most reliable economic property.

## Accepted

### 1. Rung 3 across two worlds: the pair stops being a move and becomes a cut

**Landed** as an amendment inside
`media-generation/production-ops/video-assembly/techniques/generated-shot-sourcing.md`.

Anchor [00:05:53] - *"The lobby goes in pinned as the first frame, and the vault
corridor goes in behind it as the second reference"* - and [00:06:30] - *"multiple
shots of the main lobby... and then, right at the end, it dramatically cuts to the
corridor"*.

The technique's conditioning ladder denies this case explicitly at rung 3: **"the two
anchors must be cut from one cloth"**, because head and tail frames from separate
requests *"disagree about everything the prompt did not pin... and the model,
interpolating between two worlds that never matched, breaks visibly in the middle of
the move."* The source paired a head anchor with a separately generated plate of a
**different room** and got no broken interpolation - it got coverage of the anchored
space and then a hard cut to the referenced one.

The resolution is not that the corpus was wrong. It is that the rule under-specified
its own range: past some threshold of difference the pair stops reading as two views
of one scene and starts reading as a **scene boundary**, which the model renders as an
edit. The fix for a broken interpolation is to make the anchors agree *or* to make them
disagree completely, and only the first was written down. The amendment adds the third
row, and - the part that makes it a technique rather than a trick - states the cost:
**the cut lands inside the clip, so the assembly does not own it.** That is the same
defect the technique's own clip-cap section calls "a cut nobody made", arriving through
a door that section does not watch. Discriminator: *does the assembly need to own this
cut point?*

This is the enumeration hunt (Phase 6 section 3) in its denial form - *where a subject
explicitly denies a symmetry, check whether it denied too much.*

### 2. The seam between two references belongs to neither

**Landed** as an amendment inside
`media-generation/visual-generation/image-prompt-composition/techniques/reference-role-map.md`.

Anchors [00:05:02] - *"when a character picks up the light of the room he's in, he
actually feels like he belongs in it"* - and [00:05:27] - *"light them with something
that's already in that room and they'll actually look like they're standing in it"*.

The role map's step 3 forbids the beats from re-describing a mapped asset, and its
decision rules name re-description as where drift re-enters a well-mapped call. The
source re-describes on every composite - but only the *interaction*, never the
attributes. The corpus supplies the mechanism from a sibling subject:
`reference-shows-only-invariants` establishes that a subject reference carries "an
expression, an eyeline, a head angle **and a key light**", so in a plate-plus-subject
call **both** attachments hold lighting authority and the map's exclusive scope cannot
actually be granted. What is needed - the subject lit by the plate's source - is in
neither reference. It is a relation, and a map with one row per asset has no row for
one. Two constraints keep step 3 intact: author the relation and never the endpoints,
and the plate is the authority in the exchange.

Corroborated corpus-internally, zero fetches, across two subjects in one bundle.

## Applied (Phase 7.5) - both `simulation`, both against `gravity`

Neither amendment had a reachable `code` or `experiment` arm, and the reason is the
same for both: **neither media-generation project in the fleet makes the call the
amendment governs.** `gravity` has no generative-video request path anywhere in `lib/`,
and no composite (subject + plate) imaging call. `systedo-case` declares the domain but
is a web product. Simulations were run over three real cases each, from the shipped
tree.

- **`generated-shot-sourcing` -> `better`.** Three cases from the shipped project: the
  act-two marker (derived by scanning the scene list for a mood match and accumulating
  target seconds - a merged two-world clip moves it or erases it), the readiness signal
  (one scene carries the project's only null picked-frame), and the sync bench (one
  offset per clip cannot move a cut inside one). `better` because the amendment
  converts an accidental prohibition into a stated trade: rung 3 already said don't
  pair two worlds, but for a reason - *it will break* - that dies the first time a
  producer sees a two-world pair come back looking good, which is what this source had.
- **`reference-role-map` -> `unmeasurable`,** instrument named: the project's own
  verdict grader, run over composite calls it does not yet make. Not `not-better` - the
  technique did not lose, its precondition is absent.

**The structural facts are the better half of both applications,** and neither tree was
built to produce them:

- The project has no video generation at all, yet its data model *already* cannot
  express the thing the amendment warns about - one picked frame per scene, one span
  per timeline clip. The assembly owning every cut is not a policy there; it is a shape.
- The extract module's look/depiction split is a **binary over one image** - the types
  file says so itself - so a relation between two images has no slot in a vocabulary of
  eleven single-surface fields. A composite that is correctly styled, correctly staged
  and still reads as pasted would be invisible to every field the readback carries.

## Already covered (8 catches - proposed, checked, dropped)

- **Style-only anchor generated before any content asset** [00:02:05] - the creator's
  first image is deliberately not a character in the story, "its only job is to set the
  render language". -> `visual-style-locking/approved-reference-sheet` and
  `style-block-restated-every-call`.
- **Multi-view panel sheet in one generation** (front, back, face close-up as three
  panels) [00:02:05] -> `video-assembly/storyboard-grid-conditioning` covers panel
  conditioning and its legibility ceiling.
- **Hold the paragraph, rewrite only the identity line** [00:02:31] ->
  `image-prompt-composition/identity-split-from-state`, which is this rule with the
  purity requirement stated.
- **A fixed grade block in every location prompt** (two-tone, one motivated accent)
  [00:03:47] -> `assigned-colour-roles` plus the law
  `style-is-restated-not-remembered`.
- **Empty plate + character sheet as two declared roles, "copy the plate exactly"**
  [00:04:37] -> `reference-role-map` owns the declaration; only the *relation* between
  the two was missing, which is finding 2.
- **Camera height and lens vary per location, written as described effect** [00:04:12]
  -> `character-identity-continuity/camera-position-not-focal-length` and
  `cinematic-language/camera-position-semantics`.
- **Reference sheets fix identity while the model invents framing** [00:08:18] - "none
  of those angles came from a reference image" -> `reference-shows-only-invariants`.
- **Max resolution upstream, accept the cap at the terminal stage, upscale last**
  [00:02:05, 00:10:01] -> `generative-provider-routing/resolution-as-stage-property`
  (the explore/proof/deliver ladder) and
  `production-pipeline-phasing/asset-vs-disposable-render`.

## Currency - a confirmation, not a clock reset

The source shows a current, mainstream aggregation platform whose video model caps at
1080p with a separate terminal upscale to 4K [00:05:53, 00:10:01]. The sourcing ledger
(`video-assembly/applications/process--generated-shot-sourcing.md`, `verified_on:
2026-08-20`) already says *"Resolution stopped being the axis. Everything serious does
1080p or native 4K"*, and 1080p is inside that enumeration. So the observation
**confirms** the ledger at 2026-08-31.

`verified_on` was **not** moved on that application, deliberately. One video confirming
one row of a multi-vendor table is not a re-resolution of its citations, and
`verified_on` is the one field whose only value is that it is a fact.

## Untriaged (extracted, never verified - no judgment attached)

Recorded with anchors so a later run need not re-derive them. Nobody checked these.

- **N labelled prompt blocks with locked-vs-variable lifetimes, for video** [00:06:30] -
  *"I've split the whole thing up into labeled blocks instead of writing one paragraph.
  Some of those blocks are locked in, and I won't change them between generations."*
  Neighbour is `two-block-style-and-action`, which is two blocks with two lifetimes for
  *images*. Whether an n-block generalization earns its own material, or is that
  technique read at a different arity, was not checked.
- **Shot durations fixed first, narration written to the word budget each allows**
  [00:09:09] - *"each video only gives me a certain number of words to work with."*
  Neighbour is `platform-format-adaptation/image-led-vs-narration-led`, which owns the
  axis and says the mode is *derived*; this is an ordering claim about which artifact
  is authored first, and the two may not be the same question.
- **A single generation returning several angles of one location that no reference
  showed** [00:08:18] - adjacent to the angle-library probe already inside
  `generated-shot-sourcing`, but the source gets it from reference conditioning rather
  than from a hold-still brief.

## Leads (banked, with return conditions)

- **Where is the threshold between "two views of one scene" and "two worlds"?** The
  new third row is qualitative - *unmistakably different spaces*. The middle row
  (anchors that nearly match and break visibly) and the third row are separated by a
  boundary nobody has measured, and a pipeline choosing between one request and two
  needs to know where it is. **Return when a second independent source reports a
  two-world anchor pair, or when a connected project can run the pair on a real
  vendor** - the measurement is cheap once any tree can make the call.
- **The composite-integration axis has no grader in this corpus.**
  `generated-output-grading` carries a vision-model grading schema, two-grader
  disagreement and unconditional fail criteria; nothing in it scores whether an
  inserted subject shares light, contact and atmosphere with its plate. Finding 2
  asserts a rule the corpus cannot currently measure. **Return when a connected project
  makes composite calls** - the same trigger as the `unmeasurable` applied row, which
  is what makes it worth banking rather than acting on.

## Method observations

- The source is a **sponsored tutorial**, and that turned out to raise rather than
  lower the operating half's value: a tutorial must be reproducible by a stranger, so
  its rules are stated as rules. The sponsorship corrupts the tour half completely and
  leaves the craft half alone. Worth watching for a second observation before it
  becomes a class row.
- **The strongest finding came from the corpus's own denial, not from the source's
  strongest claim.** The creator does not think the two-world anchor pair is
  interesting - he narrates it as a nice cinematic moment and moves on in nine seconds.
  It is the *registry* that had a rule forbidding it. A source that contradicts a
  denial without noticing is the cheapest high-altitude finding available, and it is
  invisible to any triage that ranks candidates by how confidently the source states
  them.
