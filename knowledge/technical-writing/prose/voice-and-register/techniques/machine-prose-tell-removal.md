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
  result (", underscoring the need for..."). Its grammatical family is measured:
  instruction-tuned models use present participial clauses at 2 to 5 times the human rate,
  one of them at 5.3 times (Reinhart et al., 2025). That study counts the clause type, not
  the commenting tail, and no study ranks tells by frequency. Give the comment a sentence
  with a subject, or cut it. A regex for a comma and an -ing word near the end needs a
  reader: on a ten-post product blog it returned 5 hits and 2 were tails; the others were
  gerund lists and a gerund subject.
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
  tells its editors not to rely solely on detection tools, and rules a high detector
  percentage out as a criterion for speedy deletion. Early detectors misfired on
  non-native writers: 61.3 percent average false positives on 91 essays from an English
  proficiency test, across seven tools (Liang et al., 2023). A 2026 test of thirteen
  detectors on 135,389 pairs of non-native manuscripts and their professionally edited
  versions found false-positive rates from 0 to 100 percent (Park, Jeong and Kim). The
  error depends on the tool; the missing span does not. A finding without a span cannot
  be fixed.
- **Check the collection, not only the post.** The same opener template in two posts ("AI
  agents aren't just for chatbots." and "...aren't just for developers.") is a tell no
  per-post check sees. On the product blog and its guide, the "not just X, but Y" frame
  was the most reliable pattern: 13 hits, 12 of them the frame and 1 a plain qualifier
  ("any two versions, not just consecutive ones").
- **Word lists date and misfire.** A lexical tell rises and falls with the models: the
  excess style words in 2024 scientific abstracts were mostly verbs (Kobak et al., 2025),
  and the field guide now dates its em dash section as ending September 2026. A word list
  also flags literal senses ("the key that unlocks it"). Re-check a list when the drafting
  model changes, and read each hit for its sense.
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
