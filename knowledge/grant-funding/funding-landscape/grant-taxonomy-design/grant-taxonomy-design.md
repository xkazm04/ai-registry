---
layer: golden-path
type: golden-path
subject: grant-taxonomy-design
status: forged
use_when: [designing a controlled vocabulary for funding opportunities, building or auditing a grant classification pipeline, deciding when an LLM may assign category codes, evolving category codes without breaking stored data]
techniques:
  - orthogonal-dimension-modelling
  - append-only-codes-with-migrations
  - deterministic-first-classification
  - false-positive-suppressors
  - agency-and-programme-fallbacks
  - llm-residual-classification
---

# Grant taxonomy design

A grant taxonomy is the controlled vocabulary through which a funding corpus
becomes navigable: the closed set of codes that answer *what is this money
for, who is it for, who gives it, and in what form*. It is not a display
convenience. Every downstream capability — faceted search, eligibility
matching, portfolio analysis, win-rate reporting — inherits its precision
from the taxonomy and from the discipline of how codes get assigned. A
mis-designed vocabulary cannot be repaired by a better classifier, and a
sloppy classifier poisons even a well-designed vocabulary. The subject is
therefore two inseparable halves: the **shape of the vocabulary** and the
**discipline of assignment**.

The naive reading — "make a list of categories, have a model tag each grant"
— fails on both halves at once. A single flat category list conflates
independent questions (a youth arts grant and an arts grant for seniors fight
over one slot); an unconstrained model invents categories, guesses under
uncertainty, and produces tags nobody can audit or reproduce. The principal
reading replaces both with structure: orthogonal dimensions, versioned
append-only codes, and a classification stack in which the cheap,
deterministic, auditable layer does the bulk of the work and the expensive,
probabilistic layer is confined to the residual it alone can reach.

## The vocabulary: facets, not a tree

The sector-wide lesson — learned independently by every mature funding
classification effort — is that one hierarchical code cannot carry a grant's
identity. A funding opportunity has several *independent* attributes: its
subject domain (health, education, environment…), its beneficiary population
(youth, veterans, low-income…), its funder type (national government,
regional government, private foundation, corporate…), and its support
mechanism (project grant, operating support, capital, fellowship, prize…).
The modern faceted standard in philanthropy classification models these as
separate dimensions precisely because the older single-tree coding forced
them into one slot and lost information every time. Model each question as
its own dimension, let a grant carry one or more codes per dimension, and
never let one dimension's vocabulary smuggle in another dimension's meaning
([orthogonal-dimension-modelling](./techniques/orthogonal-dimension-modelling.md)).
The acid test of the facet set is the browse surface: the dimensions users
actually filter by *are* the taxonomy — a dimension no one can query is
decoration, and a filter users need that no dimension supplies is a design
gap.

Two structural rules keep a facet honest:

- **Code and label are different objects.** The code is a stable machine
  identifier stored on rows forever; the label is presentation, freely
  editable, freely translatable. A vocabulary that stores labels has no
  rename path; a vocabulary that displays codes has no product.
- **Every dimension needs a home for everything.** A grant that fits no
  sector stays *uncategorized* — visibly, queryably — rather than being
  forced into the least-wrong bucket. The uncategorized set is not failure
  exhaust; it is the taxonomy's backlog, and auditing it is how new codes
  earn their place.

## The version discipline: append-only codes, migrations for renames

Codes outlive the session that assigned them. They sit in stored rows,
cached model outputs, exported reports, and other teams' integrations. So
the vocabulary follows the same rule every durable identifier scheme
converges on: **codes are appended, deprecated, or migrated — never edited,
never deleted, never reused.** A rename does not touch history; it lands as
an entry in a migration map applied *on read*, so a tag written under last
quarter's vocabulary normalizes to today's live code instead of silently
dropping as unknown. Every classified row is stamped with the taxonomy
version that produced it, which makes "which rows predate the split of code
X" a query instead of an archaeology project
([append-only-codes-with-migrations](./techniques/append-only-codes-with-migrations.md)).

The deeper reason is trust: a rename applied by editing the vocabulary
in place makes every historical row a lie of a new kind — syntactically
valid, semantically stale, and indistinguishable from a fresh tag. The
migration map keeps the lie impossible by construction.

## The assignment stack: deterministic first, probabilistic last

Classification is layered by cost, auditability, and failure mode — in that
order of privilege:

1. **Deterministic rules over the grant's own text** carry the confident
   majority. A keyword rulebook is cheap enough to re-run over the whole
   corpus on every change, consistent by construction (same input, same
   output, forever), and auditable to the character — you can point at the
   phrase that fired. This layer is where taxonomy *intent* gets encoded and
   tested ([deterministic-first-classification](./techniques/deterministic-first-classification.md)).
2. **Negative rules** run immediately after the positive ones. Every broad
   keyword over-fires in some systematic way — a word that means one thing
   in your target domain and another in a neighboring genre of prose. Each
   discovered over-fire becomes a named, commented suppressor that removes
   the false code *only* when the genuine signal is absent
   ([false-positive-suppressors](./techniques/false-positive-suppressors.md)).
   Suppression is measured, not vibes: a suppressor exists because an audit
   put a number on the mis-tag rate it corrects.
3. **Structured-metadata fallbacks** rescue the rows whose text is hollow.
   Funding corpora are full of opportunities titled with bare programme
   codes or internal reference numbers — no sector word anywhere — while the
   issuing agency or the programme-code prefix predicts the sector almost
   perfectly. Mapping *known* agencies and programme prefixes to sectors,
   and deliberately leaving ambiguous agencies unmapped, converts a large
   uncategorized tail into confident tags without a single guess
   ([agency-and-programme-fallbacks](./techniques/agency-and-programme-fallbacks.md)).
4. **A constrained language-model pass** takes only what remains — the
   residual whose signal is non-English, idiomatic, or otherwise off every
   deterministic path. The model chooses exactly one code from the closed
   vocabulary or answers null; its output is validated against the code set,
   gated by a confidence threshold, and persisted as derived metadata that
   never overwrites source fields
   ([llm-residual-classification](./techniques/llm-residual-classification.md)).

The ordering is not a performance optimization; it is an epistemic one. Each
layer down the stack is more expensive, less reproducible, and harder to
audit — so each layer is only allowed the rows the layers above it could not
decide. Inverting the stack ("let the model tag everything, use rules to
clean up") forfeits reproducibility for the entire corpus and turns every
taxonomy change into a full re-inference bill.

## The honest-null spine

One principle runs through all four layers and is the subject's moral core:
**a wrong category is worse than an honest absence.** A mis-tagged grant is
invisible to the applicant it belongs to and noise to everyone else; an
untagged grant is at least visibly unfinished, routable to a human, and
countable as a taxonomy gap. This is why unknown codes drop instead of
defaulting, why ambiguous agencies stay unmapped, why suppressors prefer
removing a tag over keeping a doubtful one, and why the model layer is
prompted, few-shotted, and thresholded toward null. Corpus "completeness" is
a vanity metric; corpus *trustworthiness* is the product.

## Failure modes this standard exists to prevent

- **The conflated tree** — one hierarchical code carrying subject,
  population, and mechanism at once; every query becomes a guess about
  which meaning the coder privileged.
- **The silent rename** — a code edited in place; every historical row and
  cached model output now means something else, undetectably.
- **The forced bucket** — no legal null, so the classifier's uncertainty is
  laundered into confident-looking wrong tags.
- **The unaudited keyword** — a broad stem shipped without measuring what
  else it matches; one production corpus found a majority of one
  sector-source slice mis-tagged by a single polysemous word.
- **The model-first pipeline** — probabilistic tags on rows a regex would
  have decided identically, at a thousand times the cost and none of the
  reproducibility.
- **The invented code** — model output persisted without validation against
  the closed vocabulary; the taxonomy forks silently inside its own data.

## The techniques

- [orthogonal-dimension-modelling](./techniques/orthogonal-dimension-modelling.md) —
  independent facets, code/label separation, the browse surface as the test.
- [append-only-codes-with-migrations](./techniques/append-only-codes-with-migrations.md) —
  versioned vocabulary, rename-by-migration, normalization on read.
- [deterministic-first-classification](./techniques/deterministic-first-classification.md) —
  the keyword rulebook as the privileged layer; stems, haystacks, and audits.
- [false-positive-suppressors](./techniques/false-positive-suppressors.md) —
  measured negative rules for systematic over-fires.
- [agency-and-programme-fallbacks](./techniques/agency-and-programme-fallbacks.md) —
  issuer and programme-code metadata as conservative sector evidence.
- [llm-residual-classification](./techniques/llm-residual-classification.md) —
  the constrained, validated, null-preferring model pass over what remains.
