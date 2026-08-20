---
layer: application
type: application
subject: image-prompt-composition
technique: style-first-token-ordering
stack: process
status: forged
verified_on: 2026-08-19
---

# Process: the model-probe prompt as an ordering artifact

The gravitone-gcloud pipeline's model-comparison probe
(`pipeline/FRAMES-PROMPT.md:44-79`) is a single paste-ready prompt used to
score candidate image models against one rubric. It is worth studying as a
worked example of the full composition doctrine — every block scoped,
ordered, and placed where truncation hurts it least.

## The prompt, block by block, in priority order

1. **Style block first** (`pipeline/FRAMES-PROMPT.md:44-49`): "Flat vector
   editorial infographic, one complete explainer frame… Wide 16:9. Deep ink
   navy (#0B1B2B) ground; warm paper cream (#F5EFE0) for every object and
   rule; bright cyan (#67E8F9) used only on the single element that breaks.
   Matte finish, hairline strokes of even weight… No gradients, no shading,
   no photographic texture, no 3D rendering." Technique, format, assigned
   colour roles, finish, style bans — the entire project contract inside
   the first sentence-cluster.
2. **Macro-structure next** (`:51-52`): the three-panel division with
   explicit inequalities ("left panel widest, the right panel narrowest").
3. **Countable subject detail** (`:54-64`): each panel's elements with
   exact counts and relations — "a closed circular loop of exactly three
   thick arrows… The third, at the lower left, is cyan and points the
   wrong way" — the accent spent on precisely one element.
4. **The creative slot** (`:66-68`): "one small emblem of your own
   invention that stands for a promise that was made and then not kept" —
   deliberately late, because it is the bonus a truncating model is
   permitted to miss.
5. **Reserved space** (`:70-71`): "The bottom fifth of the frame is
   completely empty navy ground" — dead space for the composited caption
   layer.
6. **The constraint clause last** (`:73`), duplicated into a **negative
   prompt** for models that take one (`:75-79`).

## The ordering rationale, stated by the authors

The document's own caveat section makes the triage explicit
(`pipeline/FRAMES-PROMPT.md:129-134`): short-window "CLIP-conditioned"
models "see roughly the first 77 tokens and silently drop the rest — which
here means they get the style block and the panel division, and never see
the emblem or the reserved space… The style block is deliberately first for
this reason." And the diagnostic procedure follows: "If a model misses
everything after the centre panel, suspect truncation before you conclude
incompetence; re-run it with only the style block plus the left panel to
confirm."

## What the ordering buys the process

Because every rubric line (`pipeline/FRAMES-PROMPT.md:87-123`) checks a
countable element placed at a known priority, a failure localizes: a model
that nails checks 1-2 and misses 5-8 is likely truncating; a model that
misses check 3 ("exactly three arrows") on a full-window read is failing on
capability. The companion analysis (`docs/imaging.md:205-208`) shows the
payoff — one model drew the countable mechanism 0/6 across six unrelated
style blocks: "A failure that survives six different prompts is not a
prompt problem." Text-leakage results in the same file (`docs/imaging.md:
210-213`, `:238-243`) traced leakage to a text-magnet noun in the brief,
not to the ordering — each defect attributable to its own layer because
the layers were separated on the page.

## What transfers

The reusable process: author one probe prompt in strict descending
priority; give every element a rubric line; run four generations per model
("one sample measures luck, not fit", `pipeline/FRAMES-PROMPT.md:82-83`);
and read failures positionally — late-element misses point at budgets,
early-element misses at models. The probe measures the *method* (locked
style, no text, reserved margins, assigned palette, countable composition),
and must be re-run per production model before its scores are trusted
(`pipeline/FRAMES-PROMPT.md:136-139`).
