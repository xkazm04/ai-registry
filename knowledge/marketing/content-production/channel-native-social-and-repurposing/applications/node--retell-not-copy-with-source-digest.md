---
layer: application
type: application
subject: channel-native-social-and-repurposing
technique: retell-not-copy-with-source-digest
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# Retell with a digest - the model is told not to write the link, and nothing makes it so

Verified against the Czech-first marketing workspace at commit
`7461562c` (2026-10-14), where the repurposing tool already carried most of the
technique, which is what made it a place to look for the part it did not.

## What the tree already did

The source is digested before it enters the prompt (head seventy, tail thirty, a visible
elision marker, a no-op under budget), the instruction says to draw on the title and
text without copying and to retell what matters most, the absent-body case says to work
from the title, an empty channel triggers one repair re-prompt and then a template
backfill billed as full or partial demo, and the tracking link is shown by the module in
its own row. Five of the technique's decision rules held without a change.

## The seam, chosen to falsify "the system owns the link"

The prompt says "do not embed a link, the app adds it". The decision rule says that when
the model writes a URL into a variant it is stripped. The tree had the sentence and no
strip: the normalizer clamped length and nothing else, so an address the model recalled
passed to the card, to copy and to the newsletter handoff with no campaign parameters
or another channel's. A rule that exists only as a sentence in a prompt is a request.

## The change and the read

B strips a written address (including a bracketed one and a bare `www.` form) and the
punctuation it leaves behind in the normalizer, before the empty-text check, so a
variant that was only a URL counts as unfilled and is backfilled and billed as such.

| Case | A | B |
| --- | --- | --- |
| sentence ending in "read more: https://..." | address ships | sentence kept, address gone |
| variant that is only an address | counted as filled, ships a bare URL | counted unfilled, template backfill |
| existing seven unit tests, 4,183 suite | green | green |

Two new unit tests fail on A and pass on B; tsc and eslint clean. The floor (every
other repurpose test and the whole unit suite) held. Not measured: how often a served
model writes an address at all; the strip is a guard, not a measured gain.

## Structural facts the tree proves

1. A prohibition stated only in a prompt is not enforced by the generator that states it;
   the normalizer is where a rule about output shape becomes true.
2. The strip belongs beside the empty check, not after it, because stripping can empty a
   variant and the filled-count that drives the billing label must see the result.
3. Only the one generator carries the instruction; the sibling post tool does not say
   anything about links, so a written address there is neither forbidden nor stripped.
   That is the return condition.
