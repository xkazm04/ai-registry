---
source: youtube
url: https://www.youtube.com/watch?v=NUK_TBz46dM
title: "Turn Claude Into A Web Design Genius in 3 Steps With Seedance 2.5"
author: Chase AI
kind: practitioner-deep-dive (sub-class: technique demonstration)
mined_on: 2026-08-23
words: 4037
skill_version: deepen 1.1.0
extracted: 6
picked: 1
accepted: 1
declined: 0
leads: 0
already_covered: 5
untriaged: 0
---

# A design workflow the corpus already knew, minus one thing it had backwards

Run under `/deepen`, not `/research` — the operator handed a URL to the outward
engine. Recorded here anyway, because the ledger's question ("has this been mined?")
does not care which skill did the mining, and because the five catches below are the
half worth not re-deriving.

The source is a three-step web-design workflow: find inspiration, invoke a skill that
turns the inspiration into a working base, iterate. Its yield profile matches the
technique-demonstration sub-class exactly — grounded, specific, and almost entirely
already owned, because a mature bundle has usually met the practitioner's craft before
the practitioner films it.

## Accepted

### A1 — Variation needs anchors, not amplitude → `review-iteration-loops / anchored-variation-slate`

**The source located something real and stated its mechanism backwards, which is the
best shape a candidate can arrive in.**

What it demonstrated: a variation step that asks two questions before generating —
*amplitude* (how far from the current design) and *anchors* (which external references
to pull toward) — then renders the variants together on one page and lets the operator
pick. Its stated rule for getting genuine variety is **turn the amplitude up**
(`[10:32]`, "in terms of amplitude, I want to go big"), with anchors presented as an
optional extra that helps.

The literature inverts the emphasis. A controlled study generated 4,000 design
solutions across five topics under eight parameter combinations and eight distinct
prompt-engineering techniques, and human crowdsourced solutions were more diverse on
**every topic tested** — sixteen ways of asking for difference did not close the gap
(`arxiv.org/abs/2405.02345`, resolved 2026-08-23). Amplitude is a phrasing lever, and
phrasing levers were the thing measured not to work. Anchors are the structural half,
because they are the only part of the request carrying material from outside the
generator's own distribution.

So the corrected claim, and the one landed: an unanchored slate does not merely stay
close to the original, it **converges on the model's modal answer** — which is why
unanchored variants look like each other, a different symptom pointing at a different
fix than the one the source gives.

Convergence came from three independent directions: this source, the diversity-collapse
literature, and the parallel-prototyping tradition in HCI (side-by-side alternatives
producing more divergence and better outcomes than serial iteration).

The other half the source supplies, and which survived intact: the operator's own words
for *why* a slate beats a prompt — "it is really hard for a lot of us who don't come
from a design background to even think of these different changes, we kind of have to
see them" (`[12:31]`). That is recognition-over-description, and the corpus already had
it on the **input** side (`style-onboarding-from-sample`: "do not make them describe
what they can only point at") and nowhere on the **output** side. The gap was real.

Counter-evidence shaped the technique's hazard section rather than killing the finding:
choice overload past a handful of options, the decoy slate (alternatives built as
afterthoughts so a stakeholder can be shown options), and the slate silently becoming
the reviewer's idea of the available design space. None of the three appear in the
source.

Landed with a golden-path section naming the divergence phase and its boundary — the
slate terminates on the choice, after which the ratchet governs, because re-running a
slate to answer a note is regeneration wearing divergence's clothes.

## Already covered (catches)

Five of six candidates. In four cases the corpus is not merely equivalent but strictly
better hedged, which is the pattern worth recording about this sub-class.

| # | Source claim | Prior art | Verdict |
| --- | --- | --- | --- |
| A2 | Make a reference image first, then image-to-video from it (`[04:55]`) | [`generated-shot-sourcing`](../../knowledge/media-generation/production-ops/video-assembly/techniques/generated-shot-sourcing.md) | Corpus wins. A four-rung conditioning ladder (text-only / single-image anchor / head-and-tail anchors / reference-conditioned); the source knows rung 2 and calls it *the* workflow. |
| A3 | Compose the image with dead space where the copy goes (`[06:12]`) | [`plate-elements-text-split`](../../knowledge/media-generation/visual-generation/frame-direction/techniques/plate-elements-text-split.md) | Equivalent. "Reserve the text zone" — same rule, stated as a layer contract rather than a composition tip. |
| A4 | Point at a site you like instead of describing a style (`[01:42]`) | [`style-onboarding-from-sample`](../../knowledge/media-generation/visual-generation/visual-style-locking/techniques/style-onboarding-from-sample.md) | Corpus wins, on rights. The source spends 40 seconds insisting "this isn't about ripping off websites" without a rule; the technique has one — a third party's work seeds a *description*, never a conditioning input. |
| A5 | Keep hero motion subtle so it does not compete (`[07:14]`) | [`taste-budgets`](../../knowledge/software-engineering/ui-surfaces/feedback-and-style/motion/techniques/taste-budgets.md) | Equivalent, and numeric where the source is a sensibility: ambient movement bounded in distance, attention-drawing motion must deserve the attention. |
| A6 | If it is a mobile user, serve the still instead of the video (`[15:20]`) | [`adaptive-fidelity-tiers`](../../knowledge/software-engineering/ui-surfaces/feedback-and-style/adaptive-fidelity-tiers/adaptive-fidelity-tiers.md) | **Corpus contradicts it.** Gating richness on "is this a phone" is that subject's named wrong answer — a declaration the device makes about itself, wrong in both directions on hardware nobody tested. The right instrument is the page's own measured frame cost this session. |

`A6` is the one to remember. It is a first-party practitioner stating a rule with total
confidence in the exact shape the class is unreliable for — a general recommendation
inferred from one system that worked. The class row already says this; this is its
third confirmation.

## Folded rather than landed separately

The source's **taste vault** — a personal, cross-project collection of admired designs,
gathered when encountered rather than when needed (`[01:42]`) — was a candidate for its
own technique and became a section of `anchored-variation-slate` instead. The reason is
that it has no independent job: it exists to make the anchor slot fillable, and stated
alone it is a filing tip. Stated as the anchor supply, it earns a comparison table
against the approved reference sheet, which is the near-opposite object (unratified vs
locked, cross-project vs project, direction vs consistency, never-sent vs sent) and the
one it would otherwise be confused with.

## Not done, and deliberately

- **No application written.** Nothing here opened a tree, so nothing may carry
  `verified_against`, and there is no dated field instance to record. The finding is
  craft, and craft with no installation behind it stops at the technique layer.
- **Two fetches of three.** One search pair for the counter-evidence lane, one abstract
  resolved to check the study's actual claim before citing its shape. The PDF fetch
  failed to parse and was not retried against a secondary write-up — a paper's abstract
  is a primary source; commentary about it is not.
- **The video's site-cloning skill was not evaluated.** Reading a live implementation
  rather than a screenshot of it is a real claim about reference fidelity, and it is
  home-ambiguous between a media bundle that owns image style capture and a software
  bundle that owns front-end surfaces. Not banked as a lead either, because no return
  condition would change the answer — it needs a placement decision, not more evidence.

## For the next run

- **A mature subject's best defence is its hedges, and that is what a catch should be
  judged on.** Four of five catches here were not ties. In each case the corpus said the
  same thing *with the condition attached* — the rights rule, the four rungs, the
  measurement instead of the device guess. A catch recorded as "already covered" loses
  that; recorded as "covered, and better hedged, here is how" it is an argument for the
  layer contract that the next run can reuse.
- **The inversion is the yield.** This run's single accepted finding came from the one
  candidate whose stated mechanism was wrong. Five correct-and-covered claims produced
  nothing. That is now twice — the 2026-08-21 precision-tier incident was the same
  shape. Worth watching for a third: **the candidate a source explains badly may be the
  only one worth the corroboration budget**, because a claim the source gets right is a
  claim the corpus probably already has.
