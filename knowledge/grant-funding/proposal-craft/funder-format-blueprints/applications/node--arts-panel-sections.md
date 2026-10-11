---
layer: application
type: application
subject: funder-format-blueprints
technique: arts-panel-sections
stack: node
status: forged
verified_on: 2026-10-11
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# An arts form chosen by the applicant, and an editor that could not save it

Source tree: the fleet's grant-matching and drafting platform for small nonprofits (slug `grant`),
a TypeScript web application, read on 2026-10-11 at `3c568f0` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `2f4bfa8` and its ledger row is `77f3c2c`,
both on the project's `main`.

## The arts triad was already built

The tree implements this technique's sections closely. The arts blueprint carries artistic
quality and ambition, public engagement and audience, management and feasibility, and a budget.
Each section's drafting guidance reads like the technique: ground quality in the work rather than
adjectives, include a concrete reach figure, and name the timeline, team, venues, risk and
environmental impact. The generation-time critic gates each section on a word band, on naming the
work and the artists, and on a figure in the audience section. It also rejects the "world-class,
visionary" filler. The proofreader carries the same bands. A seam on the sections themselves
would only have confirmed them.

The seam is the technique's boundary instead: *only when the funder is an arts panel or the call
is an arts stream; an arts project applying to a community fund uses the community fund's form.*
The tree picks the form from a genre classifier, and that classifier reads the grant's agency and
description **together with the applying organization's mission keywords**. A theater's keywords
("theater", "new works") therefore selected the arts form for every grant the theater opened,
including a youth-services foundation's. An advocacy coalition's keywords selected the advocacy
form even for a state arts council.

I chose this seam to falsify the boundary. A caught outcome would be arts funders whose own text
carries no arts signal, which reach the arts form only through the applicant's keywords. Then
routing on the funder alone would cost an arts organization the arts form on its real funders,
and the technique's boundary would be wrong for a product that has to infer the family. That did
not happen.

## The split nobody designed

Seven callers resolve the blueprint. Six pass the profile's keywords: the editor page, the full
draft, autopilot, per-section suggest, the review panel and its rubric, and the submission seal.
The save path passes none. Its comment said the routing is driven by the funder's signals and not
the mission keywords, which is true for the portal and federal routes but false for arts and
advocacy. So for an arts organization on a foundation grant, the editor rendered the arts sections
and the streaming routes persisted AI text under the arts keys. Autosave then filtered every edit
to those sections against the default keys, dropped them, and reported "Saved". Review chips on
those sections were refused. Nothing errored.

## A and B

- **A**: the tree as read. Six structural callers use the applicant-aware genre, and the save path
  uses the funder-only genre.
- **B**: one funder-only genre (agency and description) feeds every structural caller: the
  blueprint, the review rubric and the save allow-list. The applicant-aware genre stays for prompt
  register only.
- **Instrument**: every curated and demo grant the project ships (33: US foundations, eight state
  portals, UK and Czech curated trusts, and the demo set) crossed with nine organization profiles.
  Six profiles come from the project's own fixtures: the four UAT organizations, the demo
  organization and the Czech organization. Three come from the project's own words: the arts
  managing director persona, the advocacy director persona, and the "creative" keyword its own
  July bug hunt named. That makes 297 pairs, run through the project's own classifier and
  blueprint resolver.
- **Target**: pairs whose form is decided by the applicant fell from 75 to 0. Pairs where the
  editor renders funder-facing sections that the save path drops fell from 75 to 0, which covers
  252 section keys. Arts-funder pairs kept on the arts form rose from 24 of 27 to 27 of 27. The
  three that A lost were all arts councils turned into the advocacy form by the advocacy profile.
- **Floor**: the service-organization profiles' blueprint moved on 0 of 198 pairs. All three
  arts funders carry arts words in their own name or call, so the arts persona's actual funders
  keep the arts form. Type check clean, lint clean, and the suite went from 3,588 to 3,593 passed.
  The same two deadline-reminder tests fail on both arms. A census test fails when any single
  caller is reverted to the applicant-aware genre.

## What the tree adds to the technique

The technique states its boundary as a drafting judgment: read the funder, not your own identity.
A product cannot read the funder, so it classifies, and the applicant is the input it holds most
of. That makes the applicant's identity the one input most likely to leak into the form decision.
Once a form depends on who applies, it also stops being a property of the grant. Then every reader
that resolves it has to agree on the applicant, and here one reader did not have the profile. The
technique's rule has a mechanical form: **the form is a function of the opportunity alone, and
every reader that renders, saves, scores or seals a section resolves it through the same
function.**

## What this realization cannot do

- Prompt register still reads the applicant. A theater drafting for a youth foundation now gets
  the foundation's sections, but the narrative prompt still tells the model to "foreground artistic
  vision". The technique says that project should be restructured around community outcomes. This
  needs a live generation arm to measure, and the recorded quality-gate outputs cannot replay a new
  prompt.
- There is no migration. A draft already persisted under an applicant-chosen form keeps those keys
  in the store and now renders the funder's sections. The old text is not deleted, but it is no
  longer shown. No store snapshot was available to count such drafts.
- The classifier's loose markers ("creative", "cultural", "policy", "reform") still route a
  *funder* whose own text uses them, which is the bug hunt's open finding. This change removes the
  applicant from the decision, not the over-broad vocabulary.
- The reach-figure gate accepts any digit, so "since 2014" satisfies "commit to a reach number".
  It was not tested here.
