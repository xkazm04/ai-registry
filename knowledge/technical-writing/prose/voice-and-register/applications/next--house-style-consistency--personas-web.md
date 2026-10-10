---
layer: application
type: application
subject: voice-and-register
technique: house-style-consistency
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# A five-rule house sheet with a gate, and the three things it does not say

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".

## What the site has

- **A short sheet with a check per rule.** docs/i18n/style-en.md names five mechanics
  (spelling variant, dashes, quotes, ellipsis, heading case), each tied to a checker rule,
  docs/i18n/style-en.md:12 "| Em dash | **banned** (operator, fleet-wide, 2026-09-14)".
  The ban carries a date, an owner and a method for recasting. It states no reason of its
  own. The registry rule it cites, in the `localization` bundle's `english` subject, calls a
  ban a house ruling and says the em dash is not a machine tell, density is.
- **A gate over the blog.** The contract's sources include the data files,
  docs/i18n/copy-contract.json:18 "src/data/*.ts", and the sheet names the blog among
  them, docs/i18n/style-en.md:33 "(blog, changelog, connectors, security,".
  The gate blocks only new errors against a baseline.
- **A stated unit.** docs/i18n/style-en.md:38 "one re-gates the whole string, so its existing em dashes must go in the same edit."

## What the gate shows

- **The ban, as debt.** The blog file held 61 em dashes before the first cut on 2026-09-14
  and 16 at `01eaee60`. The drops came in four commits: a language review (4), and three
  claim corrections that touched posts for other reasons (3 net, 7 and 31). The guide still
  holds 852.
- **A false warning on half the posts.** The registry's copy checker, run over the
  exported tree, reports "hyphen used as a dash between words" on five posts. Its extracted
  string has no line breaks, so a Markdown list reads as spaced hyphens, as in
  src/data/blog.ts:120 "In this tutorial, you'll build a Slack bot" whose prerequisites
  list becomes "Prerequisites - Personas installed on your machine - A Slack workspace".
- **No rule about person.** The sheet says nothing about who speaks or who is addressed.
  The blog addresses the reader throughout, and one post has the organization report an
  observation, src/data/blog.ts:220 "three workflows we've seen Personas users build".

## Simulation

Policy A is the technique before 2026-10-10. Policy B adds three conditions:
- run punctuation checks on the text the reader sees, not the raw markup;
- know the checker's unit, because a one-word edit owes the unit's debt;
- record why a model-habit rule exists, with the evidence that the habit is fading.

- **The bullet warnings.** A's step for false positives is to add an exception to the
  rule. An exception to "spaced hyphen between words" also hides real ones. B names the
  cause and sends the fix to the extractor.
- **Person.** A's list of what belongs on a sheet already includes person, so A flags the
  gap too. Same verdict.
- **The missing reason.** A asks that a model-habit rule say so; the sheet's ban says
  neither. B adds that the habit is fading, so the reason is what lets a later owner decide
  whether the ban still serves.
- **The unit.** The site's sheet already states it. B confirms it; A was silent.

B finds one defect A would paper over, and matches A on person. Nothing was changed on the
site or in the checker; the extractor defect is a notice for the checker's owner.

**Falsifier:** the checker reading line breaks in another code path, so the five warnings
come from real spaced hyphens. The project's map does not join this bundle, so the seam was
not applied.
