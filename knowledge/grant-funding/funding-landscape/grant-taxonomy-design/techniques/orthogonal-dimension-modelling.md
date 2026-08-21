---
layer: technique
type: technique
subject: grant-taxonomy-design
technique: orthogonal-dimension-modelling
status: forged
laws: []
shared_with: []
use_when: [defining or restructuring a funding vocabulary, a category list keeps growing compound entries, users cannot filter by a question the data should answer]
---

# Orthogonal dimension modelling

The concern: a funding opportunity answers several independent questions at
once — *what domain, for whom, from whom, in what form* — and a vocabulary
that mixes those questions into one list loses information on every grant it
touches. Orthogonal dimension modelling factors the vocabulary into facets,
one per question, before a single code is minted.

## The canonical facet set

Four dimensions cover the overwhelming majority of funding-corpus queries,
and match where sector-wide classification practice landed after abandoning
single-tree coding:

- **Sector / subject** — the domain the money serves (health, education,
  environment, human services, arts and culture, research, …).
- **Beneficiary / population** — who the funded work is for (youth, seniors,
  veterans, low-income, people with disabilities, indigenous communities, …).
- **Funder type** — the giver's institutional class (national government,
  regional government, municipal, private foundation, community foundation,
  corporate, supranational programme).
- **Mechanism / support type** — the form of the money (project grant,
  operating support, capacity building, capital, fellowship, prize).

Geography is usually best modelled as data (a jurisdiction id plus a scope
enum), not as vocabulary — places are an open set; support types are not.

## Decision rules

- **One question per dimension, tested by substitution.** If changing the
  answer to one dimension forces a different code in another, the dimensions
  are entangled — refactor. "Youth arts" is not a sector; it is
  sector=arts-culture plus beneficiary=youth.
- **Cardinality per dimension is a design decision, made explicitly.**
  Sector and beneficiary are naturally multi-valued (a grant can genuinely
  serve two domains); funder type is naturally single-valued (one issuer,
  one class). Write the cardinality down; classifiers and storage both
  depend on it.
- **Code ≠ label.** Codes are kebab-case machine identifiers stored on rows;
  labels are display strings resolved through a code→label map at render
  time. All product surfaces derive labels from the one canonical term list
  — never a second hand-maintained copy, which will drift.
- **The browse surface is the acceptance test.** Enumerate the filters users
  actually need — sector, funder, support type, served population, country,
  eligible-applicant type — and check every one is either a dimension or
  plain data. A dimension that never appears as a facet with counts is
  speculative; a needed filter with no dimension is the real gap.
- **Beware the beneficiary-as-geography trap.** Phrases like "rural
  communities" or "urban neighborhoods" describe *where and for whom*, not
  *what domain* — modelling them as sector signals produces systematic
  mis-tags (one measured corpus found roughly a fifth of its agriculture
  slice was really beneficiary-geography prose). If the concept matters,
  give it a home in the population or geography dimension.
- **Every dimension keeps a legal absence.** An empty sector list is a valid
  state meaning "not yet decided", distinct from any code. The one exception
  worth allowing: a dimension where a universal default is *actually true*
  (nearly every funding opportunity is a project grant unless stated
  otherwise) may default — but document that choice as a default, not a
  classification.

## When NOT to use it

- A corpus under a few hundred items browsed by a handful of people — a flat
  tag list is cheaper and the entanglement cost never materializes.
- Splitting a dimension nobody queries: orthogonality is justified by
  independent *questions*, not by ontological purity. Do not mint a
  "delivery modality" dimension because it is conceptually distinct; mint it
  when a user needs to filter by it.
- Retrofitting facets onto a foreign vocabulary you must interoperate with
  verbatim — map at the boundary instead, and keep your internal facets
  clean.
