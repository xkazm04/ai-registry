---
layer: technique
type: technique
subject: document-text-extraction
technique: extraction-yield-bands
status: forged
laws: [verdict-survives-boundary, unknown-is-not-a-value]
shared_with: []
use_when: [an extraction returned text but far less than the document visibly holds, text came back fluent but wrong through a character mapping nothing verified, you are about to attach a confidence float to an extraction result]
---

# Extraction yield bands

Nothing and everything are the easy answers. A region that yields zero
characters is refused; a region that yields clean prose is admitted. The
engineering lives in the middle — forty characters where a page should be, a
table flattened into one run of concatenated cells, a page whose glyphs decoded
through a mapping the reader could not verify and came back as fluent-looking
rubbish. Every one of these reports success, because success was defined as
*bytes came back*, and every one of them is worse than an empty result, because
an empty result is at least conspicuous.

This technique grades yield on a **closed band set** and routes each band to an
action. The band is a property of a region, not of a document; a document's
band is the worst of its regions, with the identities of those regions retained
rather than summarized.

## The bands, and what each one licenses

| band | what it means | what the caller does |
| --- | --- | --- |
| **complete** | yield is consistent with the region's apparent content | admit |
| **sparse** | text present, materially less than the region's structure implies | re-run the real operation scoped to this region |
| **corrupt** | text present in quantity, decoded through a mapping nothing verified | admit only where the consumer tolerates noise; never as authoritative quotation |
| **empty** | nothing | refuse, or admit with a per-region obligation |

Four bands, and the count is not arbitrary. Two ("worked / did not") cannot
express the middle, which is where the damage is. Many more produces a
vocabulary that nobody branches on, so every consumer collapses it back to two
in its own way and the drift becomes the bug.

**Sparse is a transient band, not a result.** It is the state in which the
extractor has evidence of a problem and has not yet resolved it, and it must be
resolved before the verdict leaves the component — by re-running extraction over
that region and re-banding to complete or empty. A sparse band that ships is a
suspicion published as a finding. The one exception is when the re-run is
genuinely unavailable (the source bytes are gone, the budget is exhausted); then
sparse ships *as sparse*, explicitly, and the caller is told it is unresolved
rather than being handed a number that implies it was measured.

## Corrupt is the band teams do not build, and it is the one that bites

When a reader detects that a character mapping is broken — a font with no usable
encoding, a legacy codepage guessed rather than declared, a substitution table
the container never supplied — the overwhelmingly common response is to log a
warning and return the text anyway. That is the same defect as the silently
dropped page, wearing better clothes. The text is present, it is wrong, and the
caller received no value it can branch on, because a log line is not a return
value. The classification existed exactly where it was computed and died exactly
where it mattered
([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)).

So a detected encoding problem is a **band on the record**, not a warning in a
stream. What the caller then does with it is a real decision with legitimate
answers on both sides: a full-text search index may reasonably take corrupt text
(false hits are cheap, and the region is at least present), while anything that
quotes the document to a person or a model must not, because corrupt text is
indistinguishable from confident content once it leaves the extractor.

## Band by action, not by certainty — the discriminator against scores

The reflex when a middle band appears is to replace it with a number: attach a
confidence float, threshold it downstream, move on. State the discriminator
before reaching for it.

> A confidence score is right when the consumer **ranks** results and can
> afford to be approximately right about ordering. It is wrong when the consumer
> must decide **whether to re-acquire the region**, because a float does not
> tell anyone what to re-run.

Re-acquisition is a discrete act with a target. `0.62` names no target and
implies a precision that the underlying measurement — a ratio of characters to
page area, a count of unmapped glyphs — does not have. A band names the target
and the action, and it does so because it was defined by the actions available
rather than by the shape of the evidence. Ranking pipelines should use scores
and should not adopt this table; re-acquisition pipelines should use bands and
should not be talked into a float because it is easier to store.

Where both consumers exist over the same corpus, carry both, and derive the
score from the same measurement the band was derived from rather than computing
it independently. Two numbers about one region, computed by two code paths, will
disagree, and the disagreement will be discovered by a user.

## The measurement rides with the band

"Materially less than the region's structure implies" is a threshold, and a
threshold that nobody wrote down is a constant somebody will change. Record,
beside the band, the measurement it came from and the predicate: characters per
unit of region area, extracted length against the median of sibling regions in
the same document, the proportion of glyphs the reader could not map. Two
reasons. A band can then be re-derived when the rule improves, without
re-extracting the corpus. And a band that turned out wrong can be *diagnosed*,
which a bare label cannot be.

Sibling comparison is the cheapest strong signal available and is
under-used: the other regions of the same document were produced by the same
tool, in the same session, by the same author, so a region an order of magnitude
below its siblings is anomalous in a way that no absolute threshold captures.
It also degrades gracefully — a single-region document simply has no sibling
evidence, which is *unknown*, and must be recorded as unknown rather than
defaulting to complete
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)).

## When not to use this

Skip the band set entirely when the consumer is ranking and nothing can be
re-acquired — a score is the correct instrument and four labels are ceremony.
Skip it too when the extractor has no structural evidence about what a region
*should* contain: without that, "sparse" cannot be distinguished from "short",
and a band set that fires on every legitimately brief region trains its
consumers to ignore it, which is worse than not having built it.
