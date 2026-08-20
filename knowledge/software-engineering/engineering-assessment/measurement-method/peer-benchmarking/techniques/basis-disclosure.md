---
layer: technique
type: technique
subject: peer-benchmarking
technique: basis-disclosure
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [shipping a percentile to a user, a rank is quoted in an export or generated summary, wording a suppressed comparison]
---

# Basis disclosure

A position without its basis is unfalsifiable. "Top 10%" cannot be checked,
argued with, or correctly re-used, because the reader has no way to know what
population, instrument, or window produced it — and readers do not withhold
belief pending that information; they supply the most flattering
interpretation available. This technique is the obligation that the facts
needed to re-derive a rank travel attached to it
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## What the basis contains

Five fields, minimum, for any position that reaches a human:

1. **Corpus size** — how many peers, counted in the unit that was ranked and
   counted *after* filtering.
2. **Membership rule** — what made those peers eligible: opt-in, publication,
   a named peer group, a shared segment. This is where self-selection becomes
   visible; a corpus of volunteers described as "organizations who chose to
   publish results" tells the reader more than any statistical caveat.
3. **Instrument and version** — which scoring engine and which rubric version
   both sides were filtered to
   ([comparability-filters](./comparability-filters.md)).
4. **Window** — the span both sides were measured over, and whether its
   trailing edge is complete.
5. **Unit** — organizations, projects, or items; means or medians
   ([population-vs-scalar-ranking](./population-vs-scalar-ranking.md)).

Together they turn "top 10%" into a sentence a sceptic can attack — which is
the point. A basis that nobody could disagree with is usually a basis that
says nothing.

## It travels with the number, not with the screen

The obligation binds hardest exactly where it is usually dropped: on the
**travelling forms**. A tooltip is not disclosure; a screenshot of the tile
does not contain the tooltip. A footnote at the bottom of a report page does
not survive the paragraph being pasted into a deck. Generated prose is the
sharpest case of all, because a summary that says "you rank in the top
quartile of your peers" reads as a finished fact and is quoted verbatim.

The rule: **every rendering that can be separated from the surface carries
its own basis** — the export row, the digest email, the report section, the
generated sentence, the payload field. Structurally, that means the basis is
part of the *result type* returned by the ranking computation, not decoration
added by one component. If the function that computes a position can return
a bare number, some caller will ship the bare number.

Keep it short at the point of use. A single parenthetical — the size, the
unit, the window, the version — with the fuller membership description one
click away, is the shape that people actually read and that survives
copy-paste.

## Suppression discloses the policy, never the corpus

When no position is produced — corpus below the floor, no comparable rows,
filter emptied the set — the surface **says so, and says why in policy
terms**. This is [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
at the presentation edge: "not computed" and "computed as low" must be
distinguishable by anyone downstream, including automated consumers.

Two hard edges:

- **Never quote the corpus size in a refusal.** "We need more comparable
  organizations before we can place you" is a statement about the product.
  "Only 3 comparable organizations were found" is a statement about other
  customers, and it defeats the exact threshold that triggered the message.
  This extends to progress indicators, "almost there" nudges, and anything
  else from which the count is derivable.
- **Never emit a placeholder that reads as a value.** A dash, a zero, a
  greyed "—" in a percentile column will be read as a rank, sorted as a rank,
  and exported as a rank. Absence needs words.

A well-written suppression is also an opportunity: it can state what *is*
known — the absolute value, the trend, the distance to a target — so the
reader gets an answer rather than a hole.

## Decision rules

- **When a ranking function returns a position, it returns the basis in the
  same object.** Optional basis fields become absent basis fields.
- **When a number is quoted outside the surface that computed it, the quote
  carries the basis** or it does not go.
- **When the basis would embarrass the number, fix the corpus, not the
  wording.** A basis so weak you would rather not print it is a signal to
  suppress the position.
- **When the corpus composition is self-selected, say so in the membership
  rule** — it is the only available correction, and it is a real one.
- **When a position is stored or cached, store its basis with it.** A rank
  re-displayed later beside a corpus that has since changed is a claim about
  a population that no longer exists.

## When not to use this

- **Dense operational tables** where a per-row basis would drown the data:
  disclose once per table, at table scope, provided every column in it truly
  shares that basis — and provided the export inherits the header. The moment
  two rows have different bases, per-row disclosure returns.
- **Internal debugging views** with a single, sophisticated audience — though
  these are the views most likely to be screenshotted into a customer thread,
  so the exemption is narrower than it feels.

## Smells

- A percentile field in an interface type with no accompanying size, version,
  or window.
- Basis rendered only in a hover state or only in a page footer.
- Generated summary text quoting a rank in a sentence that contains no
  qualifiers.
- A "—" in a rank column, with a legend nobody reads.
- A suppression message containing a number.
