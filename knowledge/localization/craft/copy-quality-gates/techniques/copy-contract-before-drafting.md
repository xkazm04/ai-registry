---
layer: technique
type: technique
subject: copy-quality-gates
technique: copy-contract-before-drafting
status: forged
laws: [the-authority-is-a-hypothesis, one-concept-one-rendering]
shared_with: []
use_when: [before a coding agent or contractor drafts product or landing copy, a style standard exists only as a long document nobody can check against, deciding what goes into a writer's context and what stays in the checker]
stage: solo
---

# Copy contract before drafting

A writer handed a style guide and a topic produces copy that must then be argued
about, string by string, with nothing to settle the argument. A writer handed a
**contract** produces copy that can be checked, and a reviewer handed the same
contract produces findings that cite it. The contract is the one artifact both
ends of the pipeline read; drafting before it exists guarantees the first review
pass is spent inventing the rules it should have been applying.

It is a per-product artifact. The language knowledge it draws on is transplantable;
the choices it records — this product's variant, this product's terms, this
product's voice — are not.

## What the contract holds

- **Declared variant and mechanics table.** The choices that style authorities
  genuinely contradict each other on: spelling variant and reference dictionary,
  serial comma, dash system, quote punctuation, time and percent formats,
  contraction policy, case per element class. No evidence shows one choice
  performs better; the defect is mixing. Each row carries its reason and, where
  the product overrules its authority, the ruling.
- **Register per surface.** Marketing, product interface, errors, legal, and
  transactional email each get a one-line register statement. One rubric applied
  to all of them drags interface copy toward chattiness and legal copy toward
  friendliness.
- **Termbase with forbidden variants.** Every product concept, its one rendering
  and the renderings a writer will reach for instead, recorded so a check can
  find them.
- **Exemplars.** Three to five approved strings per surface, plus two or three
  annotated anti-exemplars saying which rule each one breaks. Exemplars carry
  voice in a way description cannot: few-shot prompting matched a target style up
  to 23.5 times more accurately than zero-shot prompting in one comparison
  (Jemama 2025, preprint).
- **The rule set in force.** Every rule identifier the product applies, each
  marked block, warn or off, with the precision that justified a block.
- **Money-page list and review ownership.** Which surfaces get complete human
  review, and who signs off on nativeness, fidelity and terms.
- **Page brief and fact sheet, per page.** Audience, the one job of the page, the
  claims it may make and the facts behind each claim. The fact sheet is the only
  permitted source of claims.

## Procedure

1. **Count before declaring.** For every mechanics row, count both forms in the
   existing catalog before writing the row, per
   [the authority is a hypothesis](../../../_laws.md#the-authority-is-a-hypothesis).
   A catalog that is coherent on a choice the authority rejects has a ruling to
   record, not a sweep to run. A catalog that is genuinely mixed needs a decision,
   and it must be made from the full count: two reviewers each generalizing from
   their own sample will each be confidently wrong in opposite directions.
2. **Seed the termbase from the catalog's own drift.** Group candidate renderings
   of each core concept, rule once, and record the losers as forbidden variants —
   the mechanical half of
   [one concept, one rendering](../../../_laws.md#one-concept-one-rendering).
3. **Select exemplars from shipped, reviewed copy**, not from copy written for
   the contract. An exemplar written to illustrate a rule illustrates the rule's
   author.
4. **Split the contract into two audiences.** The writer's context receives the
   positive description of the voice, the exemplars, the brief and fact sheet,
   and about ten verifiable constraints. The checker receives everything
   mechanically decidable — the mechanics table, forbidden variants, pattern
   lists. Nothing appears in both.
5. **Mark every rule's disposition** and the date its precision was last counted.
6. **Refuse briefless page copy.** A page with no brief and fact sheet is not
   drafted; it is sent back.

## Decision rules

- **When a constraint is mechanically checkable, keep it out of the prompt**,
  because constraint density degrades compliance and the omissions are silent;
  the gate enforces it at no cost to the writer's attention.
- **When a rule is a list of forbidden words, it belongs to the checker only**,
  because naming a word can prime it and long ban lists fail at scale; the writer
  gets the positive pattern instead ("state the fact that makes it true").
- **When the catalog and the authority disagree and the catalog is coherent, the
  catalog wins** and the authority's row is corrected with the ruling recorded,
  so no later run re-litigates it.
- **When a claim is not on the fact sheet, the writer asks rather than invents**,
  because an invented specific is grammatical and fluent, and no language gate
  can see that it is false.
- **When a surface has no exemplar, the first reviewed strings for it become the
  exemplars** — the contract grows from review, it is not finished in advance.

## When not to use it

- **For a one-off internal string.** A single settings label in an existing
  surface needs the rule set and the termbase, not a brief.
- **As a substitute for the gate.** A contract nobody checks against decays the
  way every uncheckable instruction does; its value is that the gate and the
  reviewer cite it.
- **To encode persuasion strategy.** Page structure, proof policy and positioning
  are a marketing concern; the brief records the claims and facts that strategy
  produced, not the strategy.
- **Before counting.** A mechanics table written from an authority alone, then
  enforced, produces a wall of findings on a catalog that was coherent the other
  way — and the wall gets suppressed, taking the contract's credibility with it.
