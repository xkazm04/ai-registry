---
source: youtube:rjLuHtvrmMo + youtube:QzvMFvKdvc4
kind: channel corpus (batch sub-class) - practitioner build-walkthrough, two videos, one author
url: https://www.youtube.com/watch?v=rjLuHtvrmMo
url_2: https://www.youtube.com/watch?v=QzvMFvKdvc4
title: "How I Fully Automated Video Editing with Claude Opus 5" + "I Forced Claude to Clone Any Video Editing Style in Remotion"
author: Ryan | AI Content Automations (both)
words: 1794 + 1346 = 3140
extracted: 11
accepted: 1
declined: 0
untriaged: 3
already_covered: 5
leads: 2
applied: 1
shipped: 0
dispatched: 0
run_id: yt-vid2-0909
siblings: 2 at claim, 3 by Phase 7
fetches: 1 of 3
---

# Two videos, one voice: a code-compiled editor and a style cloned from a render

## Class, and the expected yield said before the table

The ingest decided this at the author field: **both sources are the same
creator**, so this is a **channel corpus** — the batch sub-class — and not a
batch. The reference is explicit about what that costs: *one voice voids
within-batch convergence entirely*, so the convergence column is unusable and
triage leans on corpus-vs-source novelty instead. Its stated yield profile is
**amendments and corroborations, never new subjects**.

**Expected yield said out loud before triage: LOW — one landing at most, several
catches, no subject.** That is what came in: 1 technique, 5 catches, 3 untriaged,
2 leads, 0 declined.

Each video is a hybrid and was routed per half:

- The **build half** (what the toolchain is, three programs wired together) is a
  tour, and the corpus turned out to be materially ahead of it on every point.
- The **operating half** (what happened to the creator while using it) carried
  every candidate worth having — as the class predicts. Roughly a third of the
  first video is a sales pitch for the author's paid community; that half is
  marketing and was not mined.

## Triage table

Score is `GAIN/RISK/COST`. `src` is which video carried the candidate — recorded
for completeness, but **it is not a convergence signal here**, because one author
cannot corroborate himself.

| # | src | Lane | Shape | Eff | Title | Prior art | Impact | G/R/C | Read | Decision |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | B | K | technique | M | Motion style captured from a reference under a frame budget | visual-style-locking/style-onboarding-from-sample | new-technique | 3/0/2 | real gap | **accept** |
| 2 | A+B | K | technique | M | Author the edit as code and compile the video | video-assembly/cut-compiled-from-source | none | 1/1/2 | likely catch | already covered |
| 3 | B | K | technique | M | Revise in fragments, not whole artifacts | review-iteration-loops/edit-plan-over-regeneration | none | 1/1/2 | likely catch | already covered |
| 4 | A | K | technique | M | A timed transcript pairs what was said to what was shown | visual-style-locking/style-onboarding-from-sample | none | 1/0/2 | likely catch | already covered |
| 5 | A+B | K | technique | S | Save an approved result as a reusable template | video-assembly/cut-compiled-from-source | none | 1/1/1 | likely catch | already covered |
| 6 | B | K | technique | M | Route past the renderer's boundary to a generative provider | video-assembly/cut-compiled-from-source; generative-provider-routing | none | 1/2/2 | partial | untriaged |
| 7 | A | K | practice | S | Instruct the style rather than delegating it wholesale | visual-style-locking (whole subject) | none | 1/2/1 | likely catch | already covered |
| 8 | B | K | technique | M | Declare the sampling so the reader can discount it | — (arrived via the apply step) | new-technique | — | real | **folded into row 1** |
| 9 | A | K | lead | S | Word-level timestamps as the animation's clock | video-assembly/derived-turn-markers | none | 1/2/1 | thin | lead |
| 10 | B | K | lead | S | An extraction produces a reusable "methodology" artifact | visual-style-locking | none | 1/2/1 | thin | lead |
| 11 | A | X | — | S | The offer doubles as its own marketing demo | — | none | 0/2/1 | thin | untriaged |

`auto=1/0/0` `fp=0`. **Zero declined.** The promoting question ran on the one
`partial` row (6) and did not promote it.

**Fetch budget checked at Phase 5, per round 44's focus item (2).** The class
(first-party operating half) says the fetch is usually unnecessary — but row 1's
blocker was not the source's reliability, it was a **dated capability claim the
corpus itself makes**. One fetch on the vendor's vision documentation settled it
and is the reason row 1 landed rather than being banked. **1 of 3.**

## The landing: `motion-sampled-under-a-frame-budget`

`style-onboarding-from-sample` splits a house style into three capture stages and
reaches a hard verdict on the third:

> *How it moves… Here the readback is unavailable: capture presumes a model that
> can read the evidence back into the grammar, and **a sequence of frames is not
> evidence anything in the pipeline can currently read as motion**.*

…so the motion stage must be **hand-authored** from a decomposition. Both videos
do exactly what that sentence says is impossible — "study the frame by frame and
recreate the animation style", "assess every frame so it understands camera
movement" — and report it working.

**The fetch settled it in favour of the corpus, and supplied a mechanism neither
side had.** The vendor's vision documentation says there is **no video input at
all** — only an image block — and that where an animated container is accepted,
**only its first frame is used**. So the corpus's sentence is still true: nothing
reads a sequence *as motion*. What the practitioners are doing is a third thing
the enumeration did not contain — **sampling** stills into one request — and its
fidelity is governed by two documented platform limits: a hard cap on images per
request, and a stricter per-image dimension limit that kicks in past a small
threshold, so density and resolution trade against each other.

That turns the source's vaguest complaint into arithmetic. His observation —
*"every time I gave it a certain timestamp it would best replicate the scene, but
if I handed over a full minute of edits, it was more prone to drift"* — is not a
statement about model attention. **A minute of footage cannot fit a fixed frame
budget, so the sample rate silently collapses as the span grows.** Span is the
only lever the caller has, and nothing in the response reports that the sample
was too sparse: the readback is equally fluent either way.

Landed as a **new technique**, not an amendment: the parent's rule survives
untouched (its sentence is still true, and its hand-authoring floor is explicitly
preserved), and what the source located is a mechanism the subject never had. A
pointer paragraph was added to the parent so the enumeration now names its own
middle case.

## Applied: 1 of 1 owed, ship 0 — and the seam refuted the landing

**`pof`, `experiment`, `not-better`, `ab-paired`, ship 0** (`d823bffe`, ledger row
only).

Seam: `src/lib/anim-critique/` — a filmstrip sampler that feeds captured animation
frames to a vision model for critique. **The only frame-sampling seam in the
fleet**, and chosen because it could falsify: a caught outcome would show a tree
already implementing the sampling lane, which would corroborate by convergence
*and* refute the technique's claim to be new.

**Caught, and it refuted the technique's central arithmetic.** The technique
treated the budget as the whole story — resolution as budget over span, with
"sample more" implied. The tree's own module comment states the sharper rule:
*"the sampling is part of the instrument"* — a judge scoring timing on a strip
whose spacing the sampler made uneven is grading the sampler.

The probe reimplemented the tree's index arithmetic and **asserted itself against
the worked example in that file's own comment before reporting** (10 of 14 must
give indices 0,1,3,4,6,7,9,10,12,13 with gaps of 1 and 2 — it does). Results:

- **31 count-inversion pairs** across nine ordinary capture lengths, where a
  *smaller* cap is uniform and a larger one is not: 4 of 10 is a clean stride of
  3, while 5, 6, 7, 8 and 9 of 10 are all mixed. **A larger sample is routinely
  the worse instrument.**
- The structural fact nobody designed: an even-as-possible pick is uniform only
  when `(available − 1)` is divisible by `(kept − 1)`. So when `available − 1` is
  **prime, the only uniform picks are two frames and every frame** — no middle
  exists. Six of the nine lengths probed are that case, including the 14-frame
  capture the file names. The tree's default cap of 10 is therefore **not a
  sloppy number; it is the only kind available.**

So the tree is ahead of the corpus, and adopting the technique as first written
would have made it worse. **The corpus was corrected in the same run** (round 44's
focus item 1, firing for the second consecutive round): the technique gained the
spacing constraint, the divisibility rule, the count-inversion finding, and a
declaration discipline lifted from what the tree already does — publish
kept-of-available rather than a bare count, publish the gaps, tell the reader the
removed frames are the sampler's doing and not the motion's, and report an
unmeasured denominator as **unknown rather than complete**. Two decision rules
became four; row 8 of the triage table is that finding, and it arrived from the
apply step rather than from either video.

Ship 0 is correct here and is of the "tree is already right" kind, not the "no
seam" kind.

## Catches (5) — the corpus is ahead of the source on all of them

1. **The whole Remotion premise.** `cut-compiled-from-source` already owns
   authoring the edit as a declarative composition and compiling the video from
   it — including "when a machine assistant edits, have it emit composition
   changes, never rendered video", which is the architecture both videos spend
   their build halves describing.
2. **Fragment-scoped revision.** `edit-plan-over-regeneration` owns it and gives
   the stronger form: the deliverable is *a list of edit operations, never a new
   artifact*, so scope is bounded by construction rather than by the operator
   remembering to keep the chunk small.
3. **The timed transcript pairing.** `style-onboarding-from-sample` already names
   this exact instrument for capture stage one — *"learnable only from finished
   work paired with its timed transcript… the pairing is the whole instrument"* —
   which is precisely what the first video's word-level-timestamp step does.
4. **Template extraction.** `cut-compiled-from-source` covers it and contradicts
   the source's method in passing: *"extract the template then, while the
   decisions are fresh — a style reverse-engineered from a finished render is a
   style guessed twice."* Both videos reverse-engineer from finished renders.
   Recorded as a **catch with a noted tension**, not a landing: the corpus's rule
   assumes you own the source composition, and the source's case is one where you
   never had it.
5. **"Instruct it, don't let it wing it."** The entire `visual-style-locking`
   subject is that argument, made with a ratification gate the source does not have.

## Untriaged (3) — banked with anchors, nobody verified these

- **Row 6.** The declarative renderer has a capability boundary and the operator
  routes past it to a generative provider [B 00:04:42]. `cut-compiled-from-source`
  says complex motion "belongs in a motion tool, entering the composition as
  footage" — which covers the *shape* but not the routing decision. The promoting
  read did not promote it.
- **Row 11.** "Your offer doubles as your marketing engine" — the artifact
  produced by the service is also the advertisement for it [A 00:06:28]. Real, and
  it belongs in `marketing`, a bundle a live sibling is mid-creation of; not
  touched for that reason.
- The **$2,500/client pricing ladder** [A 00:08:10]. Business-model content with
  no engineering claim; recorded so a later run does not re-derive it.

## Leads (2)

- **Word-level timestamps as the animation's clock.** The first video's animations
  are timed to spoken words via forced alignment. `derived-turn-markers` computes
  marker positions from *material durations*; a transcript-derived clock is a
  second derivation source it does not model. *Return when a second independent
  source builds visuals against a forced-alignment clock, or when a fleet project
  grows one.*
- **The extracted "methodology" as a durable artifact.** Both videos produce an
  intermediate editing-methodology document that is reused across videos. *Return
  when a source describes what that artifact contains and how it is versioned —
  neither video says.*

## Run conditions

2 siblings live at claim, 3 by Phase 7. **`visual-style-locking` was CONTENDED**:
`yt-0kbZ-0909` claimed the same subject at Phase 4 while this run was mapping.
Per the contention rule this was not a stop — the write is an append (one new
technique file, one line on the golden path, one pointer paragraph), not a
restructure, so V5 did not fire. Their tree state was checked first (they had
written nothing), both golden-path edits were made under the `content` lock, and
the lock was released immediately. Said here per the method's requirement to
record which branch of the contention rule was taken.

**`research-map` refused to run at all** — `marketing has no index.json` — because
a third sibling is mid-creation of that bundle. Rather than regenerate over their
WIP, the map was run from a **detached worktree of `HEAD`** at a short path, where
the untracked bundle does not exist. The gate is red for the same reason: **all 42
failures are in `knowledge/marketing/`, none are mine**, and `software-engineering`
and `media-generation` both parse clean.

`index.json` and `catalog.json` were **not regenerated** — the regeneration FATALs
on the sibling's half-written taxonomy, and a stale index in a shared checkout is
self-correcting where a committed artifact over somebody's WIP is not.
