---
layer: technique
type: technique
subject: cv-authenticity-screening
technique: claim-density-and-stuffing-heuristics
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [a document repeats required terms unusually often, deciding how to model an over-used keyword in a match result, tuning a buzzword or density heuristic]
---

# Claim density and stuffing heuristics

Two related measurements, one shared trap. **Buzzword density** asks what
fraction of a document's words are content-free superlatives and role clichés.
**Keyword stuffing** asks whether a specific required term appears at a rate
that no natural prose would produce. Both are honest measurements of the
document. Neither is a measurement of the person, and the entire craft is in not
letting the second thing happen.

## Measure the document, not the impression

Both heuristics need a denominator or they are noise. A term appearing twelve
times means nothing until you know whether the document is 300 words or 3,000 —
this is
[a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)
applied to a ratio nobody thinks of as a statistic.

The procedure:

- **Normalise first.** Case-fold, strip layout artifacts, and collapse the
  document to a word stream *before* counting. Counting over raw extracted text
  makes column reflow and repeated page headers look like stuffing.
- **Count occurrences against total words**, and record both numbers in the
  flag. A reviewer needs the raw counts to judge; a bare ratio is not reviewable.
- **Refuse to render on a short document.** Below a floor of a few hundred words
  the ratio is dominated by its denominator and a two-line summary of a
  specialist role trips every threshold. Under the floor, the honest output is
  *not measured* — never a pass and never a fail.
- **Localise the repetition.** Twenty occurrences spread evenly through a
  narrative career history and twenty occurrences inside one comma-separated
  skills block are different phenomena. The second is the one worth a note, and
  it is also usually harmless: a skills block is a list, and lists repeat.
- **Discount the structurally expected.** Section headers, a technology column
  repeated per role, and terms that are genuinely the substance of the specialty
  are not evidence of anything. A specialist in one technology will say its name
  constantly, and correctly.

## The denominator that actually matters is the demand

Document length is the obvious denominator and the weaker one. For a term drawn
from the role's stated requirements, the sharper comparison is **the term's rate
in the document against its rate in the posting**: a requirement the ad mentions
once and the document mentions twenty times is disproportionate to what was
asked, regardless of how long either text is.

Two conditions, both required, keep this from firing on honest specialists:

- an **absolute floor** — the term occurs at least a handful of times, so a term
  used once or twice can never be flagged however short the posting is;
- a **ratio** — the document's count exceeds the posting's count by a multiple,
  so heavy use is flagged only when it clearly outstrips real demand.

Keep both as named, documented parameters rather than literals buried in a
comparison. They are a product judgment about how much attention to spend, they
will be tuned, and the person tuning them needs to see what they mean.

## Two token-level patterns worth separating

Beyond per-requirement density, two document-wide repetition shapes are worth
detecting separately because they have different causes:

- **A consecutive run** — the same token repeated back-to-back many times over.
  No natural prose produces this; it is almost always a machine-targeted padding
  block, and it is the cheaper and more specific of the two checks.
- **Dominance of the stream** — one token occupying a large share of all
  substantial tokens across a document of meaningful length. This catches
  repetition scattered rather than clustered.

Count only word-shaped tokens of at least a few characters, so digits, symbols
and short function words never trip either check, and require a minimum token
count before computing a share — the sample floor again, in its most literal
form.

## Specificity is the companion measurement

Density asks whether the document says one thing too often. The mirror question
is whether it says anything checkable at all: **a document of substantial length
containing almost no numbers** — no dates, no team sizes, no percentages, no
quantities — describes a career in claims that cannot be probed.

This is the most useful signal in the family and the most easily misused. It
must be worded as what it is: *the claims here are hard to verify from the
document; bring specifics into the interview*. It must **not** be worded as an
inference about how the prose was produced. Vague writing is common, distributed
across every kind of applicant, and correlated with inexperience at writing about
oneself far more than with anything else.

## Stuffing is a sub-state of matched, never a separate failure

The single most consequential modelling decision in this technique. When a
required term appears at abusive density, the naive system marks the requirement
*unmatched* — reasoning that the presence is not credible. This is wrong twice
over: it states something false (the term is present, verifiably, in the
document) and it penalises the candidate on a fit score for a stylistic
property, hiding a suspicion inside a number that claims to measure experience.

The correct model:

- the requirement's match state stays **matched** — because it is;
- the match carries an **over-used** qualifier alongside the evidence quote;
- the qualifier surfaces to a human as a note, and travels with the match rather
  than replacing it.

The state name matters and is not a label to derive meaning from — downstream
rules key off the structured qualifier, not off display prose, per
[meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label).
Presence and credibility are two fields. Collapsing them into one loses
information that the reviewer needs and that the system cannot reconstruct.

## Thresholds and what they are for

Thresholds here are *attention allocators*, not classifiers, and should be
chosen to fire on the obviously anomalous tail — the document where one term is
several percent of all words, or where clichés dominate the prose — rather than
tuned toward some target precision. A threshold that fires on one document in
fifty and produces a note nobody minds reading is working correctly. A threshold
that fires on one in five is training reviewers to ignore the flag, which is the
only real failure mode a non-acting screen has.

Publish the threshold and the counts in the flag. A heuristic whose parameters
are invisible cannot be argued with, and a reviewer who cannot argue with it
will either obey it or ignore it — both bad.

## What density does not mean

State this in the note itself, because reviewers under load will not supply it:

- **It does not mean the claims are false.** Density is a property of writing
  style, not of employment history.
- **It does not mean the document was machine-drafted**, and machine drafting
  would not be a finding anyway.
- **It does not mean gaming.** The dominant cause of keyword-dense documents is
  candidates following mainstream advice about automated filters — advice that
  is, given how many filters work, correct.
- **It especially does not travel.** A density observation is bound to this
  document; it never becomes an attribute of the candidate across applications.

Rendering any of these implications in the grammar of a measured finding
violates [inference must look like inference](../../_laws.md#inference-must-look-like-inference).

## When not to use this

- **Not on documents converted from formats that repeat structure.** Slide-style
  or table-heavy documents duplicate headers per page; screen the repaired text
  or do not screen at all.
- **Not on very short or fragment documents**, per the sample floor above.
- **Not on non-prose sections in isolation.** Running the density heuristic
  against a skills list alone guarantees a positive and measures nothing.
- **Not as an input to ranking.** These measurements inform a reviewer; they
  never order candidates. A comparative use of a stuffing heuristic is a
  ranking by writing style with a fraud vocabulary attached.
