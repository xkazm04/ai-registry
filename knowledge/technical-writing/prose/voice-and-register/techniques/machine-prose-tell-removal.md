---
layer: technique
type: technique
subject: voice-and-register
technique: machine-prose-tell-removal
status: forged
laws: [a-check-names-a-property-and-a-span]
shared_with: []
use_when: [editing a model-drafted technical article, writing deterministic prose checks for a drafting pipeline, deciding whether a flagged pattern is a real finding in long-form text]
---

# Machine-prose tell removal

The concern: drafting models produce recurring habits that readers have learned to
recognize, and a technical post that carries them is discounted before its findings are
read. The habits are well catalogued; the danger is in how they are removed. **Treat each
tell as a property of a span that either does work or does not; remove or rewrite the span,
cite the rule, and never edit toward a detector or a synonym.**
([a check names a property and a span](../../../_laws.md#a-check-names-a-property-and-a-span))

## Where the rules live

The construction rules for these habits in English, each with an identifier, its trigger,
its exceptions and a worked rewrite, are owned by the `localization` bundle's `english`
subject (its generated-prose patterns technique). Cite those identifiers in findings. This
technique adds what changes when the text is a long-form technical article rather than
product copy.

## What long form adds

- **Significance narration at section ends.** The long-form version of puffery is a closing
  sentence per section that tells the reader the section mattered ("This highlights the
  importance of..."). Cut it; the next section's heading should carry the consequence.
- **Superficial analysis tails.** A sentence-final participial clause that comments on a
  result (", underscoring the need for...") is the most frequent tell in long drafts. Give
  the comment a sentence with a subject, or cut it.
- **Sign-posting.** "Let's dive in", "Now let's look at", "It's worth noting that". A
  claim-carrying heading makes the sign-post redundant.
- **The recap close.** A final paragraph that repeats the post in general terms. Replace it
  with the settled close of the `article-structure` subject.
- **Citation decoration.** References that do not resolve, identifiers that point at an
  unrelated paper, a book cited without a page. A crowd-written field guide to generated
  text lists broken links and invalid identifiers among its signs. In a technical post every
  citation is opened before publication (see the `evidence-and-sources` subject).
- **Uniform paragraphs.** Every paragraph the same length with the same three-sentence
  shape. See sentence-rhythm-and-stress.

## Procedure

1. Run the deterministic checks first: first-person pronouns, the house's banned
   punctuation, sign-post phrases, chat residue, unresolved citations. Each produces a
   finding with a span.
2. Then read for the judgment patterns (significance narration, analysis tails, false
   contrast, decorative triads), citing the rule identifier for each.
3. Repair only the flagged spans, once. Check each repair against the synonym rule: a fix
   that renames the empty claim ("crucial" to "vital") is rejected; remove the claim or
   supply the fact.
4. Leave clean prose alone. An edit pass that rewrites unflagged sentences reintroduces the
   habits it was meant to remove.

## Decision rules

- **Never cite a detector score or "sounds generated" as a finding.** The same field guide
  says a high detector percentage is not on its own a valid criterion, and detectors have
  been shown to misfire on non-native writers (Liang et al., 2023). A finding without a span cannot be fixed.
- **Presence is not the defect; function is.** A real three-part list, a single dash, an
  "additionally" in a long argument are not findings. Density and emptiness are.
- **The fix is usually a fact.** Most tells mark a place where the draft had no specific
  thing to say. The repair is to find the number, the mechanism or the example, not to find
  a better adjective.
- **A house ban is cited as a house rule.** Where the house bans a mark or a phrase outright
  to curb a drafting model's habits, the finding cites the house sheet (see
  house-style-consistency), not a claim that the mark is bad prose.

## When not to use it

On quoted material, which stays as the source wrote it; and on drafts not yet structurally
sound, where removing tells polishes sentences that the structural revision will delete.
