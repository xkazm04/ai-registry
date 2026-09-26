---
layer: application
type: application
subject: platform-format-adaptation
technique: format-as-measured-template
stack: process
status: forged
applied: simulation
ab_verdict: better
proof: structural-only
verified_on: 2026-09-26
---

# A short-clip format template with provenance and a declared gap — a video-studio pipeline

How one generative video studio (repo: `gravitone-gcloud`) codified its ≤60s
short-clip format as a measured template, and — the sharper half of the lesson
— refused to codify a second format whose numbers didn't exist yet.

## The measured template

The format lives twice, deliberately: a prose study at
`knowledge/templates/short-form-clip/steps/01-script/PATTERNS.md` and its
machine-readable mirror at `.../01-script/params.json`, which the pipeline's
script step consumes as defaults and ranges. Every parameter in the JSON
carries the evidence discipline the technique demands:

- **Provenance grades in the prose** — every claim in PATTERNS.md is prefixed
  MEASURED / OBSERVED / INFERRED (e.g. the one-sentence-hook rule is MEASURED
  at lines 13–21; the anchor-in-2-seconds rule is explicitly INFERRED at
  lines 49–51).
- **Sample size at top level** — `"sample_size": 3` and `"confidence": "n=3,
  two from one channel, nothing measured below 40s"` (params.json:7-8). The
  shared-channel caveat is repeated where it bites: the closing-joke pattern
  is tagged `"OBSERVED in 2 of 3, both from the same channel"` (line 77).
- **Band vs ceiling** — `"duration": {"measured_min": 40, "measured_max": 57,
  "target_max": 30}` (line 16): the measured band and the brief's target are
  separate fields, never conflated.
- **A first-class evidence gap** — the brief asks for ≤30s clips, but nothing
  was measured below 40s, so the template ships an `evidence_gap` object
  (params.json:10-14) stating the target, the measured durations, and:
  "Compression from 40s to 25s is INFERRED and untested — the template's
  first open question."
- **Anti-patterns as tool refusals** — the banned announced-fact hook carries
  `"ui_rule": "Do not offer this as a template option — if the tool offers
  it, it will be used"` (line 37), and the `ui_contract` block (lines 80-86)
  ends with `"forbidden": "a 'did you know' template"`.
- **A validation disclaimer** — `"not_validated": "No engagement, retention
  or completion data… view counts are not evidence of craft"` (line 88).

## The refusal — the same pipeline, one step later

The frames step of the sibling template
(`knowledge/templates/short-educational-video/steps/02-frames/PATTERNS.md`)
had, at n=1, every temptation to ship numbers: "compose in big blocks", "the
still is optional". It shipped the observations graded (OBSERVED · n=1,
ASSUMED) and **no params file at all**, with the reason written down
(PATTERNS.md:65-74): every number the single source could supply "is either
absent from it or an impression", and writing the file "would launder those
impressions into machine-readable authority" — quoting the library's own law
that "an estimate laundered into the library is worse than a gap, because the
gap is fixable and the estimate is invisible." The file ends: "It gets
written when a second source supplies real numbers."

Line 47 shows the softer half of the same rule: the big-blocks guidance may
"steer a composition but must not become a validator" until someone measures
how big is big.

## Why this is the reference realization

The two artifacts together demonstrate the technique's full decision surface:
*write the template* when measurements exist (and stamp every number with its
grade and sample), *declare the gap* when the brief outruns the evidence, and
*refuse the machine-readable form entirely* when all you have is impressions
— because the format of the artifact (JSON consumed by tooling) is itself an
authority claim the evidence must be able to back.

## Applied 2026-09-26: the draw-rule amendment, walked over this template

*Simulation over three real cases, read at `gravitone-gcloud@3ee32c6`. Citations
above re-checked the same day.* The amendment says a template must record how
its sample was drawn. The reason is that hand-picked successes show what
successes share, not what separates them. This template is the best-kept one the
fleet has, which makes it the fair test: if the amendment finds nothing here, it
is redundant.

1. **Absence read as underperformance.** PATTERNS §1 grades the announced-fact
   opening "Not observed, and worth avoiding", and `params.json` turns it into
   `"forbidden": "a 'did you know' template"`. The pre-amendment technique passes
   this, because the claim carries its grade and n. The amendment flags it:
   absence from three chosen successes says nothing about how the shape performs.
   **The tree had already caught this itself**, in OPEN-QUESTIONS s4: "an
   absence, not a measurement … a reasoned preference, not a finding". The
   prediction matches a judgment made independently of this pass.
2. **A band censored by its era.** The three sources run 59 s, 41 s and 60 s,
   and two sit exactly on the Shorts ceiling that stood until 2024-10-15. Each
   source records `captured: 2026-08-11` and `views_at_capture`, but not when the
   video was *published*. So the template cannot say which ceiling bounded its
   40–60 s band. The pre-amendment technique asks for ceiling and band to be
   dated; it does not ask when the witnesses were made. Flagged only by the
   amendment.
3. **Shared read as causal.** "MEASURED · all three deliver a complete hook in
   one sentence, at 0:00" is a true description of the sample. Carried into
   `params.json` as a default, it reads as the reason they succeeded. The
   pre-amendment technique accepts MEASURED n=3. The amendment splits it into
   MEASURED as a description and INFERRED as a cause.

**Falsifier:** a template whose sources carried a publish date and a draw rule
naming how successes were chosen, or that included the format's non-successes.
On such a template the amendment would flag nothing. Here it flags three of three
where the old text flagged none, and one of the three is corroborated by the
tree's own authors. **Verdict: better** (simulation, structural). No code
changed; the tree's owner decides whether `sources/*.md` grows a `published:`
field.
