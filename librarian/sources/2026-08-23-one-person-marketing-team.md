---
source: youtube
url: https://www.youtube.com/watch?v=yCACmFTiCto
title: "Turn Claude Into a One Person Marketing Team in 38 Mins"
author: Nate Herk | AI Automation
kind: practitioner-tutorial (sub-class: beginner walkthrough, vendor-forward)
mined_on: 2026-08-23
words: 9483
skill_version: deepen 1.1.0
extracted: 8
picked: 1
accepted: 1
declined: 1
leads: 1
already_covered: 5
untriaged: 0
---

# The pipeline had a quality gate; nothing in it read the script

Run under `/deepen` — the operator handed a URL to the outward engine, the second
time today. Recorded here for the same reason as [[2026-08-23-seedance-web-design]]:
the ledger's question is whether a source has been mined, not which skill mined it.

The source is an end-to-end marketing-asset walkthrough: scaffold a project with
brand context, connect a model-aggregation service, generate a website, ad
creatives, carousels and UGC video, then log the spend in a spreadsheet. Its yield
profile is the **beginner-walkthrough** sub-class, and that class behaves
differently from the technique demonstration: it covers more surface, states each
claim more weakly, and its value is concentrated almost entirely in what it does
*by accident* rather than what it teaches on purpose. Five of eight candidates were
already owned. The one that landed is something the source does, warns nobody
about, and never names.

## Accepted

### A1 — A synthetic performer's first-person claim invents a witness → `evidence-bound-visuals / performer-claims-need-a-person`

**The source's most useful contribution is a defect it demonstrates carefully, not
a technique it teaches.**

What it demonstrates: four synthetic "creators" cast as still images, storyboards
derived from them, video animated from the boards, and — the detail that makes the
instance worth recording — an automated QA pass that screenshots finished clips and
**rejects** takes with defective packaging text (`[32:10]`–`[33:01]`). The pipeline
has a working review gate. The gate fires on a logo.

Nothing fires on the script. The accepted clips deliver first-person experience
claims in the synthetic creators' voices — the morning routine the product
replaces, "coffee that pulls its weight" — presented as customer testimony with no
label in frame or workflow. The operator's own critique is that they read "very
salesy… not completely organic" (`[33:27]`), and the proposed fix is to study real
creator content and make them *more* organic. That fix improves the assertion
without touching whether anyone stands behind it.

The corpus had no coverage at all: `grep` for testimonial/endorsement across all
seven bundles returned twenty files, every hit an unrelated sense of the word.

Convergence came from two independent directions. The training-data-only lane —
written before any search and kept in the run scratch — reached "synthetic UGC
testimonials are an endorsement/disclosure problem" as its sixth item unprompted.
The regulation reached the same place harder: **16 CFR Part 465 §465.2**, effective
2024-10-21, covers testimonials misrepresenting that the endorser **exists** or
**had experience** with the product, and the Commission's final-rule notice is
explicit that human-made and model-made fakes are treated alike.

The regulation also closed an exit the craft statement appeared to leave open.
Labelling cures the *provenance* question — was this generated — but not a
misrepresented experience, so the technique's honest exits are moving the claim
into the brand's voice or sourcing a real user, never "keep the line, add a
disclosure". The composite "representative customer" is inside the prohibition too.

The hazard that earned it technique rather than footnote status: **identity-locking
craft runs the wrong way here.** Anchors, reference sheets and a reused cast exist
to make a performer read as more real, and every increment strengthens an assertion
nobody sourced. That is `evidence-bound-visuals`' standing warning — the violation
looks like better work — in its most acute available form, and it is why the
judgment has to be recorded at cast time: by review, the identity is locked and a
dozen shots derive from it, so the only remedy voids every approval.

Landed with a jurisdiction-neutral technique (the rule cite does not transplant) and
a dated application carrying the citation, the source as a live instance of a named
defect, and `refresh_by` at one year because a regulatory landscape moves on its own
clock. The golden path's "what this subject is not" now earns the widening from
factual work to promotional, rather than letting the technique smuggle it.

## Already covered (catches)

Five of eight. In every case the corpus is better hedged — and in two it actively
contradicts the source.

| # | Source claim | Prior art | Verdict |
| --- | --- | --- | --- |
| A2 | Cast a character image, storyboard from it, then animate — for control (`[31:44]`) | [`generated-shot-sourcing`](../../knowledge/media-generation/production-ops/video-assembly/techniques/generated-shot-sourcing.md) | Corpus wins. It states the four-rung conditioning ladder *and* the reason — "identity degrades with distance from the anchor" — plus head-and-tail anchoring as the defence against mid-clip drift. The source has the workflow without the mechanism. |
| A3 | The choppy two-second UGC cuts are an aesthetic quirk; "you could have it be a 15-second raw selfie" (`[34:20]`) | [`generated-shot-sourcing`](../../knowledge/media-generation/production-ops/video-assembly/techniques/generated-shot-sourcing.md), "clip caps are a structural constraint" | **Corpus contradicts it.** The cutting is not taste, it is the identity budget: models emit seconds not scenes, identity decays with clip length, so a longer scene is a multi-request scene by construction with seams somebody must author. The source reads a hard constraint as a style choice and proposes removing it. |
| A4 | A brand-guidelines PDF makes every deliverable on-brand (`[03:22]`, `[36:29]`) | [`visual-style-locking`](../../knowledge/media-generation/visual-generation/visual-style-locking/visual-style-locking.md) | Corpus wins, structurally. It has an attribute grammar, a draft→proofed→locked ratchet, and a control-arm measurement; the source has a PDF and an impression. Its own delight that the palette leaked into a *spreadsheet* is, in the corpus's terms, a style with no lifecycle applying itself to a channel nobody scoped. |
| A5 | An automated QA pass checks generations before reporting done (`[32:10]`) | [`generated-output-grading`](../../knowledge/media-generation/visual-generation/generated-output-grading/generated-output-grading.md) | Corpus wins. Unconditional-fail criteria, a vision-model grading schema, and a two-grader disagreement rule. The source's pass is real and narrow — see A1 for what it does not look at. |
| A6 | Report what each batch cost; 18 creatives for $3.43, a sizzle reel ~$17.55, five carousels $9.56 (`[27:36]`, `[29:09]`, `[30:52]`) | [`cost-per-usable-economics`](../../knowledge/media-generation/visual-generation/generative-provider-routing/techniques/cost-per-usable-economics.md) | **Corpus contradicts the framing.** These are sticker totals with no acceptance rate, which is the exact number the technique says not to route on — and the source's own UGC run rejected takes in QA without ever counting them, so the denominator it needed existed and went unrecorded. |

`A3` is the one to remember: a practitioner correctly observing model behaviour and
inverting its cause. Same shape as `A6` in [[2026-08-23-seedance-web-design]] — a
confident first-party rule inferred from one system — and this is that class row's
fourth confirmation.

## Banked as a lead

**L1 — the aggregator / credit-broker topology.** `generative-provider-routing`
assumes you hold each vendor's credentials directly. The source runs everything
through a service that fronts many models behind one subscription, one credential
and one synthetic currency, with a roster that changes without notice. That is a
genuinely different topology for at least three of the subject's rules: the vendor
fact ledger now describes a middleman whose prices are a markup, "never invent a
price" gets harder when the unit is a credit, and the refusal-reroute hop becomes
cheap in a way that changes plan ordering. The source even garbles the unit itself
— "$17.55 cents based on my credits" (`[29:09]`), which is not a figure in any
currency.

**Return condition:** a second, non-promotional source — an aggregator's own
pricing documentation, or a tree that actually integrates one. One vendor-forward
tutorial is not enough to restructure a subject around, and the whole reason
`cost-per-usable-economics` exists is that sticker-price reasoning misroutes money.

## Declined

**D1 — the project-scaffolding method** (a `CLAUDE.md` plus context/assets/output
folders, the "three Ps" of pain/person/promise, an interview skill to extract tacit
brand context, generations logged to a spreadsheet). Sound advice, and roughly half
of it is what this registry already is. It is not media craft: it is
agent-project ergonomics, it is stated at a depth no consumer here would gain from,
and the parts with teeth are owned elsewhere in the fleet. Declined as out-of-domain
rather than wrong.

## Instrument note

`research-map` reported **`PRIOR ART: none — the corpus has never heard of this`**
for *spokesperson avatar reuse*, and thin overlap for *character consistency*, while
`generated-shot-sourcing` owned the concept dead-centre. The cause is vocabulary:
the corpus writes "identity drift" and "anchors", the field writes "character
consistency". Slug-and-`use_when` overlap is a recall signal over the corpus's *own*
naming, so it degrades exactly where a source uses the field's dialect instead —
which is the normal case for an external source, and the case the tool is most used
in.

Nothing is wrong with the script; its header already says it answers neighbourhood,
not sameness. But an empty result read as a coverage hole would have produced a
duplicate subject here, and only reading `generated-shot-sourcing` in full caught
it. Recorded because this is the second instrument lesson in the skill's history
with the same shape: verify the instrument before reporting a content gap.

## Not done, and deliberately

- **No benchmark.** Nothing here hinges on a measurement this run could make, and
  the source's cost figures are not a harness — they are one operator's receipts
  from one vendor on one day.
- **The specimen's own numbers were not promoted.** Per the software-engineering
  run's rule: a specimen's rationale is not evidence because its output is good.
  The costs are recorded in the source note as claims, not in the corpus as facts.
- **Non-US jurisdictions not surveyed.** The technique is jurisdiction-neutral by
  construction; the application says plainly that its citation is not.
- **The aggregator was not opened.** No account, no tree, no `verified_against`.
  That is precisely what L1's return condition asks for.
