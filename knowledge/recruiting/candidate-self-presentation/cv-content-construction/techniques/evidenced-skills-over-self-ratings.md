---
layer: technique
type: technique
subject: cv-content-construction
technique: evidenced-skills-over-self-ratings
status: forged
laws: [inference-must-look-like-inference, a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [designing the skills section of a CV, deciding whether to render skill levels as bars, pips or percentages, stating language proficiency]
---

# Evidenced skills over self-ratings

The skills section is where a CV is most tempted to look like a dashboard: a column of
technologies, each with five dots, four of them filled. It looks measured. It is a guess,
drawn in the grammar of measurement - which is exactly what [inference must look like
inference](../../../_laws.md#inference-must-look-like-inference) forbids.

Self-assessed ability correlates with measured performance at roughly r=.29 across a
synthesis of twenty-two meta-analyses (higher for specific, familiar, objectively scored
tasks; lower for broad ones). A dot scale adds no unit ("four of five" relative to whom?),
invites the reader to discount every item equally, and survives text extraction as
nothing or as noise. No study measures recruiters penalising the bars as such, and the
figures quoted online for parser failure rates on them are untraceable; the case rests on
what the rating *is*, not on a callback penalty.

## The shape

- **Grouped, not ranked.** Four to six groups the reader can scan - by kind ("Languages
  and runtimes", "Data", "Delivery", "Domain") or by the target's own categories - each a
  plain comma-separated line or short list.
- **Tied to evidence.** The strongest form is a skill that also appears in a role or
  project bullet where it was used. The skills section then acts as an index into the
  experience, which is what both a human skimmer and a search index use it for.
- **Levels in words, on a scale the reader knows, only when the record states them.**
  For human languages, the six-level common European reference scale (A1-C2) or "native";
  for professional skills, plain words anchored in use ("daily, 4 years"; "used on two
  projects") beat any adjective. A level the record does not state is not rendered.
- **Recency where it matters.** A tool last used eight years ago is honestly listed with
  that fact or moved to an "earlier" line; it is not presented alongside current skills.

## Decision rules

- **When the source CV carries bars, pips, stars or percentages, convert them to words
  or drop them - never re-draw them.** Keep the owner's stated level as a word if one
  exists ("advanced"); a bare graphic with no word has no recoverable content and is
  dropped with a note to the owner.
- **Strip the meter before the item is read, not after.** A tool that takes a skill line
  apart by looking only for a trailing level *word* leaves a pip run, stars, "85%" or
  "4/5" inside the skill's name, so the graphic is printed as drawn and a percentage
  also breaks the evidence match and raises a false "where did you use it?" flag. Remove
  the trailing meter first, keep a level word if one sits beside it, and never map a
  number to a word - that is the inferred level the next section forbids.
- **When a listed skill appears nowhere in the experience, flag it to the owner**
  ("where did you use X?") rather than removing it. A self-asserted skill is real
  information - the person said it - and deleting it converts a discountable claim into
  [absence of evidence](../../../_laws.md#absence-of-evidence-is-not-evidence). The flag
  exists so the owner can add the evidence line, or accept that the item reads as an
  assertion.
- **When the list is long, cut by relevance and recency, not by the owner's rating.** A
  twenty-item list tells the reader nothing is prioritised; ten evidenced items do.
- **When a generic "soft skills" list appears** ("communication, leadership,
  teamwork"), move the substance into bullets that show it or drop it; an unevidenced soft
  skill is the purest self-descriptor on the page.
- **When the document states a level for a human language, it states it on the scale**
  ("German - B2", "Czech - native"). A certificate with its date is stronger still, and
  says what it is; [a claim carries its sample and its
  basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis) - "B2 (self-assessed)"
  and "B2 (certified 2024)" are different claims.

## What a tool may do deterministically

Group items into kinds by a vocabulary, canonicalise spelling and casing, deduplicate,
reorder toward a target, convert a stated level word into a scale label where the
mapping is exact, and compute which listed skills lack an evidence line. It may not infer a
level from years of experience or from how often a word appears; that is a reading-side
judgment, and printing it on the candidate's own document puts a machine's guess under
their name.

## When not to use this

Some registers expect a formal competence grid (certain public-sector and standardised
European formats); fill it honestly, with self-assessment labelled as such. And where a
skill is certified by an issuing body - a licence, a named certification - list the
credential with its issuer and date in its own section rather than as a skill.
