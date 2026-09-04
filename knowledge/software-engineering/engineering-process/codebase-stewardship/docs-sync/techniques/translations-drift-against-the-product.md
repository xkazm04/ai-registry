---
layer: technique
type: technique
subject: docs-sync
technique: translations-drift-against-the-product
status: forged
laws: [derivation-names-recomputation, gate-sees-target]
shared_with: []
use_when: [a translated page advertises a feature that was retired, deciding whether a locale's staleness is measured against its source or against the system, a localized page was authored directly rather than translated, a source-pinned pipeline reports every locale current, choosing which localized pages get which assertions]
---

# Translations drift against the product, not only against their source

Wall 3 lists the translated page among the surfaces a change owes and stops
there, correctly — what a translation catalog demands belongs to the
localization discipline. But one property of translated *prose* comes back
across the boundary, because it decides whether this subject's drift story is
complete, and the answer is that it is not.

The mature treatment of a translated unit models it as a **derived value**:
it stores the content hash of the source revision it was made from, and a
detector recomputes that hash against today's source to name exactly which
units went stale. That is
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
done properly, and it is the right question — *is this translation still
derived from what it claims to be derived from?*

It has a blind spot this subject has to state, because the two failures are
independent: **a corpus can be perfectly clean under the source-relative
question and wrong under the product-relative one.**

## Staleness relative to a stale source is zero

The source-relative detector cannot see a change that moved both sides equally,
or neither.

When a capability is retired in the code and the primary-language page is
updated, every derived unit goes stale and the detector fires. Working exactly
as designed. When the capability is retired and **nobody updates the primary
page**, every hash still matches, every locale is reported current, and every
translation is a faithful derivation of a document that is now false. The
instrument is not broken and no rule was violated; the anchor simply moved out
from under the whole population at once.

The harder case is the page that was **never derived at all**. Long-lived
projects accumulate landing pages contributed directly in a target language by
someone who wanted their language served, listing what that contributor's
version supported. It has no source unit, so it has no pin, so it is outside
the pipeline's population entirely — and the completeness board is green
because a board counts the units it knows about. That is
[checked-vs-skipped-denominators](./checked-vs-skipped-denominators.md)
arriving in the localization lane, where it is easy to miss because the missing
population is a whole *document* rather than a key inside one.

## Anchor the second detector to the shipped capability set

The corrective is a second check with a different anchor: assert each localized
page against **what the program actually exposes**, read from the code — the
registry of features, the command table, the channel or adapter list — never
against its primary-language sibling.

The two detectors answer different questions and neither subsumes the other.
The source-relative one is fine-grained and catches wording that fell behind.
The product-relative one is coarse and catches the thing wording accuracy
cannot: **this page advertises something that does not exist.**

## The per-file scope is the finding

The signature that tells you a project has actually learned this, rather than
adopted it, is that **the assertion set differs per page** — and where it
differs is the evidence.

One worked example forbids two retired platform names in exactly two of its
four landing pages, while requiring the current routing line in all four. A
uniform check would have said nothing useful in either direction. The author
knew which two files had been authored independently and therefore could carry
capabilities the primary page never listed, and the asymmetry of the check is
the durable record of that knowledge — the only place it is written down.

So when writing one of these, treat the scope as a deliverable: for each page,
why it is in or out, and which of the two failure modes put it there. A later
maintainer reading a uniform check learns nothing; reading an asymmetric one
with its reasons learns the history of the corpus.

## The cost, and the ceiling

This is a **capability-level** check, not a sentence-level one. It scales with
the number of user-visible capabilities rather than with the size of the
corpus, which is exactly why it is affordable where a full bilingual review is
not, and why it can run on every change.

It buys one thing and should claim only that: a localized page cannot advertise
a retired capability or omit a current one. A mistranslated caveat, an inverted
warning, a boundary statement rendered into a promise — all still need a reader
of that language, and the check going green is not evidence about any of them.
Say so next to the signal, or the green will be read as the larger claim.

## When not to use this

- **The localized pages are generated.** A page emitted from the same registry
  the check would read cannot disagree with it, and the assertion is a tautology
  dressed as a gate.
- **One locale, one page.** The technique's whole content is the divergence
  between independently maintained copies; without copies, the ordinary coupling
  walls already cover it.
- **The capability list is not readable as data.** If the shipped feature set
  can only be established by reading prose, this check inherits that prose's
  errors and launders them into a green — take
  [source-as-data-without-the-app](./source-as-data-without-the-app.md) first,
  or do not take this at all.
