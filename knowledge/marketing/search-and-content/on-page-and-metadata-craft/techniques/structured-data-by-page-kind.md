---
layer: technique
type: technique
subject: on-page-and-metadata-craft
technique: structured-data-by-page-kind
status: forged
laws: [never-invent-proof, provenance-is-binary-and-labelled, label-convention-as-convention]
shared_with: []
use_when: [choosing which markup a page should carry, generating a structured-data graph from page data, deciding whether to keep markup after the engine withdraws a rich result]
---

# Structured data by page kind

Structured data is typed by what the page *is*, carries only what the page shows, and is
kept for the reason that the page embodies the type - not for the rich result the type
earned last year. The rich result is a bonus with a shelf life; the markup is a
machine-readable restatement of the page and is held to the same anti-fabrication law as
the copy.

## The type follows the page kind

| Page kind | Node(s) | What must be true on the page |
|---|---|---|
| Article, guide, post | article node with a person author, one image node per figure, a breadcrumb list, a question-and-answer node if the page has real questions | a named author with a role and a real page; figures with alt text and dimensions; each question deep-linked to its answer |
| Business, service, location | organisation or local-business node with name, address, phone and opening hours; a service node where a service is described; same-as links to real profiles | the name, address and phone are byte-identical to every listing; the address is a real staffed place; the hours are the hours |
| Product | product node with the offer the page shows (price, currency, availability); review markup only for reviews the page displays | a price that is the price; a rating computed from reviews the visitor can read |
| Proof or report page publishing a measured series | article node plus a dataset node whose measured variables are the numbers on the page, with the creator named | the series is the business's own synced data, or the page is not indexable |
| Experiment arm, thank-you, shared report | none beyond the site defaults; the page is not indexable | the page prints no numbers a crawler should treat as claims |

The rule inside the table: a node the page does not embody is at best ignored and at
worst a policy violation. Review markup for reviews the page does not show, a rating
without a visible source, a local-business node with a mailbox address, a question node
whose answers are not on the page - each has cost sites their rich results, and the
engine's spam policy names the pattern.

## Eligibility moves, markup does not

The engine withdrew how-to rich results from desktop in September 2023, retired seven
low-use types in June 2025, and withdrew the FAQ rich result in May 2026 while stating it
continues to parse the question markup to understand the page. Article, product,
local-business, breadcrumb and organisation nodes still earn their results as of this
writing, and that too will move. A team that added a node *for* a rich result loses the
reason when the result goes; a team that added it because the page has that structure
loses nothing. So each node in a generated graph is tied to a reason on the page, and a
rich result is recorded as the current bonus, dated.

## Procedure

1. Determine the page kind from the page, not from the template name. A "blog" page
   that is really a service description carries the service node.
2. Build the graph from the same validated data the visible page renders: the article
   title and description from the page's own head, the author from the author record,
   figures from the figure blocks that already passed the alt-and-dimensions check, the
   breadcrumb list from the same array that renders the visible trail, questions from the
   same list that renders the accordion, each with the anchor it opens. One source, so
   the markup cannot drift from the page.
3. Include optional fields only when present; never emit a placeholder, an empty string
   or a plausible default. An absent author bio is an absent key.
4. Validate: a graph with an error is ignored whole. Validation is a build step, not a
   report line.
5. Set indexability with the markup. A dataset node on a page whose numbers are
   illustrative is a fabricated proof in machine-readable form; the illustrative branch
   carries its disclosure and no index, and the real branch carries the node and no
   disclosure.
6. Provide the machine-readable twin where answer engines fetch one - a plain-text or
   markup alternate declared in the page head - built from the same source.

## Decision rules

- When a rich result the page was marked up for is withdrawn, keep the markup if the
  page embodies the type and drop nothing, because the engine still reads it and the
  page structure is unchanged; remove it only if it was decoration.
- When a generator is asked for a business node and the address, phone or hours are not
  supplied, emit the node without those fields and put the question to the owner,
  because a plausible address in markup is the same lie as one in copy.
- When a page's numbers are sample or illustrative, emit no dataset node and no index,
  because a labelled disclosure in the visible text does not reach the crawler that
  reads the graph.
- When two surfaces disagree - the visible breadcrumb and the breadcrumb node, the
  accordion and the question node - fix the shared source, because a graph built from a
  second copy will disagree again.

## Conventions, labelled

The page-kind table is practitioner convention shaped by the engine's published
structured-data documentation; the set of types that earn a rich result is documented
behaviour, dated, and changes. The one-source rule and the indexability coupling are
doctrine of this bundle.

## When NOT to use

- To earn an answer-engine citation: in the measurements this bundle holds, markup
  showed no independent effect on citation and the answer block in the body did; that is
  `answer-engine-visibility`.
- On pages that should not be indexed at all; a graph on a no-index page is work the
  crawler never reads.
- As a substitute for visible content: markup restates the page, it does not add to it.
