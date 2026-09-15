---
kind: deepen-dispatch
date: 2026-09-15
run_id: intake-JwTCjarfJYw
source: https://www.youtube.com/watch?v=JwTCjarfJYw
status: OPEN
bundle: media-generation
subject: generative-provider-routing
target: knowledge/media-generation/visual-generation/generative-provider-routing/applications/process--vendor-fact-ledger.md
---

# Refresh the image-provider fact ledger as one dated document

## Why this is dispatched

OpenAI's 2026-09-08 Images 2.5 release makes the ledger's GPT Image 2 row stale. This intake run
rechecked that one vendor, but the application's `verified_on` describes resolution of the
document's citations as a whole. Advancing it after a one-row check would make the untouched rows
look freshly verified. The safe unit of work is therefore a full ledger refresh (or a deliberate
split into independently dated records), not an opportunistic row edit.

## Confirmed starting delta

The first-party release page confirms ChatGPT Images 2.5, reference preservation, precise and
multi-turn editing, sketch input, ChatGPT/Work/Codex availability, and two API variants named Flare
and Sunburst: <https://openai.com/index/introducing-chatgpt-images-2-5/>. Its comparative quality
and latency statements are vendor assertions. They may populate a sourced fact row but cannot
replace local comparative evidence.

## Work packet

1. Re-open every citation in the current application and record withdrawals, redirects, and changed
   model names. Do not move the document date until that pass is complete.
2. Replace or amend the OpenAI row with exact current API identifiers, availability, and pricing
   from first-party documentation. Keep release-page quality claims visibly attributed.
3. If whole-document re-verification is too broad for one clock, split the ledger into independently
   dated vendor or fact records before changing freshness metadata.
4. Preserve comparative statements only where the source still supports them. Route semantic image
   quality to a controlled local comparison rather than inferring it from a launch page.
5. Before promoting reference preservation, localized editing, or sketch control above the fact
   ledger, run the intake render-proof path with a fixed brief, declared observable, paired outputs,
   blind verdict, and bounded attempts.

## Acceptance

The target's freshness date truthfully covers every retained citation (or each split record has its
own truthful date); the OpenAI row names the current variants and source class; vendor claims are
not presented as local measurements; and the lane gates plus full repository gate are green.
