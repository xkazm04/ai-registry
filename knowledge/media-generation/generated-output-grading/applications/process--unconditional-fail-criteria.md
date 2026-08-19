---
layer: application
type: application
subject: generated-output-grading
technique: unconditional-fail-criteria
stack: process
status: forged
---

# Process — an 11-point rubric with text leakage as the veto

The frame-audition prompt at `pipeline/FRAMES-PROMPT.md:87-124` is a
human-executable rubric that realizes the stratified grading the golden path
describes — countable checks first, judged checks few and labeled, and one
unconditional fail on top — as a document a person (or a dispatched agent)
runs against four generations per model.

## The tiers

**Precision — "count it, do not eyeball it"** (`FRAMES-PROMPT.md:91-104`).
Seven boolean checks, every one a count or a comparison: "Three panels …
left widest and right narrowest"; "Exactly three arrows in the loop";
"Exactly one arrow cyan … pointing against the other two"; "Exactly four
descending steps, each wider than the one above"; "Three colours only, with
cyan nowhere except the reversed arrow." The rubric states its calibration
threshold up front rather than after grading: "A model landing 5+ of these is
a serious candidate. Below 3 it is a mood board generator, whatever it looks
like."

**Creativity — "judge it"** (`:106-112`). Exactly one taste check (the
invented emblem), explicitly labeled as taste: "This is the only check where
your taste is the instrument" — and scoped to its real job, breaking ties
"between two models that tie on precision." Judgement never rescues a failed
count.

**Style** (`:114-120`). Two consistency checks that proxy for cross-frame
behaviour from a single image: one visual language across five unlike
elements, and "flatness held under load" — gradients creep in as scenes get
busier, so a full frame catches what a simple icon test cannot.

## The veto

Check 11 (`:121-124`) is the unconditional fail, with both halves of the
technique's justification in two sentences: *downstream incompatibility* —
"our captions are vectors precisely because models hallucinate letters" — and
*character evidence* — "a model that cannot stay silent cannot hold the plate
layer at any level of quality elsewhere." The definition errs wide ("Any
glyph, rune or letter-like mark"), exactly the generous-violation phrasing the
technique prescribes, and the same field leads the machine-grading schemas
that automate this rubric (`hasText` first in
`pipeline/build-style-trials.mts:78-88` and `pipeline/direct-frames.mts:150-159`).

## The caveats that keep the rubric honest

Two process rules travel with the rubric. **Sample spread, not best-of**:
"Four generations per model before judging: one sample measures luck, not
fit" (`:81-83`), and "The spread across four is the finding, not the best of
four" (`:89`) — which matters most for the veto, since `docs/imaging.md:176-178`
measured the same prompt on the same model producing a clean plate and then a
leaking one across two runs: "Text leakage is a per-generation risk, not a
per-model verdict — which is the argument for judging every plate rather than
sampling."

**Rule out truncation before conviction** (`:127-134`): older CLIP-conditioned
architectures see roughly the first 77 tokens, so a model that missed
everything after the centre panel may never have seen it — "suspect truncation
before you conclude incompetence; re-run it with only the style block plus the
left panel to confirm." The prompt's style block is ordered first for exactly
this reason. This is the mechanical-cause check the flip-analysis technique
requires before a fails-everywhere reading indicts either the brief or the
model.
