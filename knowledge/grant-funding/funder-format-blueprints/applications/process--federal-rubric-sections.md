---
layer: application
type: application
subject: funder-format-blueprints
technique: federal-rubric-sections
stack: process
status: forged
---

# Federal rubric sections as drafting guidance (process)

How the `grant-writing-nonprofits` repo encodes the federal four-section
form as per-section prompt guidance: `FEDERAL_BLUEPRINT` in
`src/features/ai-gemini/blueprints.ts:87-120`, with each section carrying
verbatim reviewer-aligned instructions the drafting model receives.

## The un-cramming

The blueprint's own comment records the structural failure it fixed: "the
four narrative dimensions a federal reviewer scores as SEPARATE sections
instead of one crammed blob (the old federal genre stuffed all four into a
single ~1000-word narrative because there was nowhere else)"
(`blueprints.ts:84-86`). The technique's core rule — one section per
scored dimension — arrived here as an incident, not a preference.

## The guidance, verbatim

Each `BlueprintSection.guidance` string is the criterion decomposed into
what the reviewer scores, in the reviewer's vocabulary:

- **need** (`blueprints.ts:94-95`): "State the problem and its magnitude
  with cited data, define the target population and geography, and make
  explicit the gap this project fills. **Federal reviewers score need on
  evidence, not adjectives — quantify.**" The register rule is in the
  prompt itself, not left to the model's taste.
- **approach** (`blueprints.ts:101-102`): goals and "measurable,
  time-bound objectives", activities and methodology, work plan and
  timeline, "and why this design will work. Tie every objective back to
  the stated need" — the need→objective chain reviewers cross-check.
- **capacity** (`blueprints.ts:107-109`): "relevant experience and past
  performance, key staff and their qualifications, partnerships and
  letters of commitment, and the infrastructure and systems in place."
- **evaluation** (`blueprints.ts:114-116`): "process and outcome measures
  tied to the objectives, the data sources and collection methods, who
  conducts the evaluation, and how findings will be used for continuous
  improvement and reporting."

Note what the guidance mechanism is: `guidance: null` on a section falls
back to the genre-aware default prompt, keeping the classic blueprint's
behavior identical (`blueprints.ts:27-33`); named blueprints supply
guidance only for their novel sections. The budget section stays
`guidance: null` even inside the federal blueprint (`blueprints.ts:118`).

## The bands and the fabrication valve

The federal keys carry review-time word bands in
`src/features/proofreader/config.ts:50-53` — `need: 120-800`,
`approach: 150-900`, `capacity: 100-700`, `evaluation: 100-700` —
implementing the technique's allocate-length-by-points discipline as soft
warnings before a hard portal limit bites (`config.ts:18-19`).

The quantify-pressure has its escape valve one layer down: the draft
prompts "deliberately ask the model to emit a bracketed [insert …]
placeholder instead of inventing a figure", and the proofreader checks
those placeholders "separately … with their own actionable message"
(`config.ts:65-70`) so a compliant draft full of expected scaffolding is
not reported as full of errors. Rubric pressure toward numbers plus a
structural placeholder discipline is how the never-fabricate law survives
contact with a rubric that scores evidence.

Structural reuse closes the picture: the sub-national government blueprint
is literally `sections: FEDERAL_BLUEPRINT.sections` under its own id
(`blueprints.ts:266-269`) — same reviewer culture, same four dimensions,
separable later without a migration.
