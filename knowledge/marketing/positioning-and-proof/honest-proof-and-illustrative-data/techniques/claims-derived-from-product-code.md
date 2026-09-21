---
layer: technique
type: technique
subject: honest-proof-and-illustrative-data
technique: claims-derived-from-product-code
status: forged
laws: [never-invent-proof, label-convention-as-convention]
shared_with: []
use_when: [writing pricing or feature copy that quotes a limit or a count, adding a marketing FAQ that states a fact the product owns, reviewing copy that drifted from what ships]
---

# Claims derived from product code

A marketing claim about the product - a price, a daily limit, a plan's name and
order, a feature list, the number of modules, the vendors a bring-your-own-key
tier accepts, the locales shipped, the bounds a production prompt enforces - is
a claim about a specific piece of shipping code, and the copy reads it from that
code at render time. Numbers enter copy only through placeholders filled from
the source of truth. A unit test fails if a number is typed into the copy. A
feature grid is the registry filtered and sorted, not a list typed beside it. An
FAQ answer that quotes the free price reads the pricing catalogue, so a stale
answer breaks the build instead of shipping in two languages.

The failure this prevents is invisible to every other check. A page that quotes
a limit the metering no longer enforces, or a price the account page states
differently, renders perfectly; typecheck, lint and a smoke test pass, because a
stale number is still a string. Only an assertion about the *relationship* -
that the row set is the plan catalogue, that every number arrives through a
placeholder - catches it.

## Procedure

1. **Find the source of truth for each fact.** The pricing module for prices,
   limits and plan order; the module registry for features and their sections;
   the vendor list for accepted key providers; the locale config for languages;
   the channel catalogue and the production prompt's own bounds for the counts a
   free-channel page states.
2. **Author the words, derive the numbers.** Copy is hand-written - taglines,
   feature lines, in every locale - and every number inside a line is a
   placeholder: "{aiEval} evaluations per day". The renderer fills it from that
   plan's own entry through the page's localized integer formatter.
3. **Derive the structure, not only the values.** Row set, order, which card is
   featured and which is free come from the catalogue; the feature grid's
   sections are keyed by the registry's section type, so a new section is a
   compile error on the marketing page until it is framed.
4. **Pin the relationship with a test.** Assert that the rows are the catalogue
   in the same order; that name, price and featured flag match; that the price
   the marketing page quotes equals the price the account page quotes; that no
   forbidden literal - any price, any limit value - appears in any copy line
   outside a placeholder; that no unfilled placeholder survives into the page;
   and that whichever limits a line chooses to quote are that plan's own.
5. **Keep copy decisions separate from source decisions.** Which limits a tier
   advertises is a copy decision; where the number comes from is not. The test
   asserts per placeholder rather than requiring every limit to be shown.
6. **Read prompt bounds from the prompt.** Where a page claims "six to nine
   channels, two to four first actions", the numbers come from the production
   prompt's own constants, because a claim about generated output is a claim
   about the generator's bounds.
7. **Derive the demo from the same call.** A marketing table of what the module
   knows about a business is built by the product's own grounding builder on
   the same fixture the public demo runs, so the marketing table and the live
   demo cannot disagree, and the walkthrough cannot narrate a grounding step the
   product does not perform.

## Where derivation ends

Derivation guarantees currency, not truth. A derived limit is honest exactly as
far as the metering enforces it; a derived feature count is honest exactly as
far as the registry's entries are real modules. A registry entry for a module
that is a stub produces a derived claim that is a lie by construction, and no
test on the derivation catches it. The inventory of what is real belongs to the
positioning subject; derivation makes the true claims stay true.

Two duplicates of the same copy - one on the pricing page, one carried in the
catalogue for a retired variant - drift from each other within a release. Delete
one and let the test keep the survivor honest; a second copy of a derived fact
is a typed fact with a delay.

## Decision rules

- When copy would contain a number the code owns, replace the number with a
  placeholder filled from the code, because a typed number is a snapshot of a
  release nobody dated.
- When a marketing fact and an account-page fact describe the same thing, assert
  their equality in a test, because two surfaces that state different prices for
  one plan is the specific failure buyers report.
- When a structural fact (a section, a plan, a vendor) is added to the source,
  the marketing surface should fail to build until it is framed, because a
  silent addition ships a page missing a row.
- When a page states a bound on generated output, read it from the generator's
  constants, because a bound typed on the page becomes the specification the
  generator is then blamed for missing.
- When a threshold shown on a marketing surface is a practitioner convention
  rather than an enforced limit, say so on the surface
  ([label convention as convention](../../../_laws.md#label-convention-as-convention))
  and do not derive it from code that does not enforce it.

## When NOT to use

- **Facts the code does not own.** A tagline, a positioning sentence, a
  comparison claim against an incumbent, a support-level statement - authored
  copy, reviewed as copy; deriving a sentence from a string constant is
  indirection, not derivation.
- **Outcome figures.** A demo ROAS is computed on a dataset, not derived from
  product code, and it takes a badge; this technique is for facts about the
  product, not results from it.
- **Values that must be frozen for a legal reason.** A price quoted in a signed
  offer or a printed piece is a dated snapshot on purpose; derive it at the
  moment of issue and record the version.

## Footing

The placeholder-and-test pattern is practitioner convention with a mechanism
plain enough not to need a measurement. The claim that buyers notice price
disagreement between surfaces comes from buyer-persona testing, not a study.
