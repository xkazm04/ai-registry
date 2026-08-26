---
source: youtube
url: https://www.youtube.com/watch?v=g3X8JauSWTM
title: "Stop Building AI Slop - Build High-End Web Apps with AI"
author: freeCodeCamp.org
kind: practitioner-tutorial (course walkthrough)
mined_on: 2026-08-26
words: 14649
skill_version: 0.11.0
extracted: 12
picked: 3
accepted: 3
already_covered: 0
declined: 0
leads: 0
untriaged: 9
dispatched: 0
---

# Stop Building AI Slop, 2026-08-26 - the longest source yet, three findings, and length disproved as a yield proxy

Run 22. A 14,649-word hour-long course - **the longest source this ledger has
taken, by more than double the previous roundup record** - and it produced one
amendment on first triage. The operator then picked two more from the
untriaged table and both landed, so the run closed at three. The
source-level finding stands regardless: the method has said since 2026-08-22 that
length is not yield, on the evidence of a 2,974-word talk outproducing a
6,958-word roundup. This run tests the claim at the other end of the range and
it holds. The class, not the word count, predicted the yield correctly.

## The class, second observation - practitioner tutorial (course walkthrough)

First seen 2026-08-23 (9,483 words, 1 accepted, 5 catches). Second observation
matches on the metric that counts: **14,649 words, one finding the source
itself offered.** The other two came from operator picks off the untriaged
table, and both were things the creator did wrong rather than things they
taught. The row is now earned.

A course walkthrough is a **demonstration transcript**, and the ratio that
matters is narrated-clicking to stated-reasoning. This class runs very low.
Most of its length is the creator describing what is on screen ("I'm going to
click here", "you can see this is what it looks like"), which ingests as words
and extracts as nothing. Its density of reusable rules is the lowest of any
class in the ledger.

What the class IS reliable for is the **operational residue**: the workarounds
and cleanups a creator performs on camera without flagging them as lessons.
Every candidate that survived the strip test in this run came from something
the creator did in passing, never from anything they set out to teach. The
five named steps of the course - collect context, clone, restyle, animate,
deploy - produced nothing. Finding 1 came from a 40-second aside about credit
costs; finding 2 came from the creator silently trimming a video to hide a
defect; finding 3 came from advice the creator gave confidently and wrongly.
Not one came from the curriculum.

**The class's characteristic hazard is confident advice on a subject the
creator has not considered.** This one recommends, on camera and with a
big-tech credential attached, cloning a live commercial product "entirely
logos text typographies colors everything" and then restyling it so "there's
no way that user can tell the difference." The trade-dress problem is never
mentioned. A class that teaches beginners is the class where an unnamed hazard
does the most damage - and this one became finding 3, where the corpus turned
out to already hold the correct procedure and the source to recommend its exact
inverse.

## Accepted

### 1. A probe may change medium, and the crossing is lossy - `media-generation/production-ops/production-pipeline-phasing`

Anchor `[49:25]`: the creator generates a six-frame image sketch of each
concept before committing to video, explicitly because video costs roughly ten
times an image per unit of output.

**Landed as an amendment to `asset-vs-disposable-render`, plus one sentence in
the golden path's cheap-probe rule.**

The subject already owned the neighbourhood and owned it well. Its cheap-probe
rule says fidelity is a property of the stage of decision, and
`asset-vs-disposable-render` says probes render "at the lowest fidelity that
still supports the judgment being made". The gap was in an **enumeration**:
that technique's two worked examples - "a fraction of final resolution for
visual comparison, a short excerpt for a voice audition" - are both
*same-medium scalar reductions*. Neither changes medium. The corpus treated
probe fidelity as one axis when the mature discipline treats it as a ladder of
media.

Corroboration was a single fetch to the previsualization literature, and it
**sharpened the finding rather than confirming it**. Film and animation
practice runs a rung ladder - storyboard (stills) to animatic (stills plus
timing) to previz (functional motion, no lighting or materials) to final - and
states the trap directly: a sequence that reads fine as a row of images may be
badly paced the moment it moves. So the amendment is not "use cheap probes"
(the corpus said that) but **"each rung is cheap because it dropped a
dimension, and the dropped dimension is unsettled, never approved"** - which is
`unmeasured-is-not-pass` applied to a gate that structurally cannot see what it
is being read as approving.

The second bullet of the amendment - probe the whole span, not its opening -
comes from the source's own failure rather than its advice, and this is the
run's best example of the class's residue. The creator's six-frame sketch
covered the opening beats, passed, and the resulting video failed at second 10+
where the model invented anonymous stock-photo faces for what the artifact
needed to be recognisable named people. The fix on camera was to trim the tail.
The probe never covered the region that broke, because the cheapness that made
the probe attractive scales with the span it covers.

### 2. Slots claim their subjects - `media-generation/research-grounding/evidence-bound-visuals`

Anchor `[52:49]`, landed on the operator's second pick as the **convergence
root**, not as a third instance.

The subject's opening grammar enumerates the marks and what each claims: axis
claims precision, arrow claims causation, shared scale claims comparability, a
number claims checking, a spoken testimonial claims a witness, screenshot
chrome claims a record. **Every mark in that list makes its claim
intrinsically** - read the element and you can name the assertion. This run's
case is the first that does not: an anonymous generated face is an innocent
mark, and the same face in a roster cell whose heading names real practitioners
asserts that it is one of them. The position supplied the claim.

That made the landing a golden-path correction plus a technique, rather than an
amendment to `performer-claims-need-a-person`. That technique's central claim is
"the trigger is the line, not the face", and its two-property test requires a
first-person experience claim - so it declares this run's case explicitly out of
scope ("synthetic performer, no experience claim ... nothing here constrains
it"). Widening it would have meant rewriting its thesis. New sibling technique
`slots-claim-their-subjects` instead, with the boundary stated in both files.

**The root, written into the golden path**: the corpus's three laundering forms
all start from a real fact and strip its grade. A second family has no referent
at all, so there is no grade to propagate and every grade-propagation mechanism
passes it silently. The two sightings are that family seen from opposite sides -
the claim riding on the element (catchable at the element) and the claim riding
on the position (invisible at the element, because the element is innocent and
the assembly is where the claim lives). Two structural consequences follow:
asset review does not cover the positional family *by construction*, since
generated material is judged in batch in the one view where the slot is not
visible; and the remedy is to break the claim rather than soften it, because
there is nothing to hedge.

No fetch: two independent sources from different runs is the convergence lane.

### 3. Structure is the layer a restyle does not touch - `media-generation/visual-generation/visual-style-locking`

Anchor `[09:47]`. **Mostly a catch, and the catch is the interesting part.**

`style-onboarding-from-sample` already governs this and governs it better than
the source: the sample "never becomes a production reference", it seeds a
*description* that a human edits, the sheet is regenerated on the project's own
canonical subjects, and one decision rule already reads "when the sample's owner
is not the user, treat the sample as inspiration for a description, never as a
conditioning input". The corpus states the correct procedure and the source
recommends its exact inverse.

The residue that was not covered is the **inversion**, and it is why the source's
advice feels safe to follow. That technique separates a sample's style from its
subject and keeps the style. It does not model a third layer - **structure**:
layout, zone arrangement and proportion, navigation architecture, reveal order.
The source keeps the structure whole and restyles the surface, which reads as
compliance with the technique (new palette, new type, an edited block) while the
layer carrying the source's identity passes through untouched.

One fetch corroborated and sharpened it: the identifying unit is the
**combination** - palette, type, zone arrangement, navigation architecture and
motifs assessed together - so swapping the single cheapest axis does not clear
the set, and it is cheapest precisely because it carries the least of the
structure's work. The literature's functionality carve-out supplied the honest
discriminator, which keeps the amendment engineering-grade rather than legal
advice: the question is not "have I changed enough" (uncomputable from inside
the work) but "which of what I kept is functional and which is identifying".
Amendment plus one decision rule; no new technique.


## Untriaged

Extracted, reached the table, never picked. **Nobody verified these** - they
carry no judgment and are recorded with anchors so a later run does not
re-derive them.

| # | Title | Anchor | Prior art / read |
| --- | --- | --- | --- |
| 2 | A global restyle is a token audit: whatever fails to change was never tokenized | `[31:32]` | `se/ui-surfaces/feedback-and-style/design-tokens` (`token-enforcement`); read: real gap |
| 4 | Materialize subjective variants as isolated trees judged side by side | `[23:50]` | `se/llm-agent`; read: partial |
| 5 | Decompose a reference artifact into a written beat sheet, generate from that | `[43:54]` | `media-generation/visual-generation/frame-direction` (`per-beat-rejection`); read: partial |
| 7 | An installed skill that writes a hook has mutated your harness, not your prompts | `[21:42]` | registry machinery; read: real gap |
| 8 | Keep a second agent authenticated: an overload response is a switch, not a stop | `[43:02]` | `se/llm-agent/runtime-and-io/agent-cli-transport` (`fallback-ladder`); read: likely catch |
| 9 | Split the append-only decision log from the derived spec | `[05:07]` | spec-driven; read: likely catch |
| 10 | Ask the skill library which of its own skills applies rather than learning it | `[22:35]` | registry machinery; read: thin |
| 11 | Video generation roughly ten times image cost per unit | `[49:25]` | `media-generation/.../cost-per-usable-economics`; read: thin, dated |
| 12 | Free static host that does not require a public repository | `[1:00:30]` | none; read: thin |

## The identity-slot convergence, now landed

Recorded here because the pair is what earned the altitude, and a later run
should cite the pair rather than re-derive it:

- **2026-08-23** (`one-person-marketing-team`): a synthetic-testimonial defect,
  landed on `evidence-bound-visuals` as `performer-claims-need-a-person`.
- **2026-08-26** (this run): a generated video filled its recognisable-subject
  slots with anonymous stock-photo faces; the creator's remedy was to cut the
  footage, not to re-prompt.

Both are now cited into the golden path's "Two families" section as one root.
**The trimming detail became a failure mode in its own right** - cutting the
region where the invention showed removes the evidence and keeps the practice -
and it appears in both the golden path and the new technique.

## Method notes

- **The mapper's two total empties were both honest and differently useful.**
  `storyboard` returned nothing across 111 media-generation techniques, which
  correctly signalled that the probe-ladder vocabulary was absent even though
  the *concept* of a cheap probe was present under other words - a seam, not a
  hole, and the amendment states the boundary rather than minting a duplicate.
  `ui cloning` returned nothing and is a genuine hole (candidate 6), untouched
  because unpicked.
- **The enumeration hunt paid again.** Four runs, and the highest-yield read
  remains "this document lists its cases - is the list complete?" Here the list
  was two probe examples in a technique's third section, and both turned out to
  live on the same axis.
- **One fetch of three spent.** The corroboration was the only fetch, and it
  changed the shape of what was written.
