---
layer: application
type: application
subject: bengali
technique: ui-conventions-and-length
stack: process
status: forged
verified_on: 2026-10-14
applied: experiment
ab_verdict: better
---

# Scanning a shipped Bengali catalog for width, wrap and fragment defects

Seam chosen to falsify: the consuming project's style guide says the -rya-
cluster takes a ZWJ and that ZWNJ is "essentially unused". A character scan of
the catalog could refute that, so the scan was the arm. The technique's wrap
rule (BN-WRAP: no zero-width character steering inside a word) supplied the
test.

## Arm A: counted (24,778 strings)

| Probe (technique anchor) | Result |
|---|---|
| ZWNJ / ZWSP / word-joiner / soft hyphen inside a word (BN-WRAP) | 2 strings, one label ("Rank") in two editor surfaces; all ZWNJ, between র and ্য, blocking the conjunct |
| Short English label (22 chars or fewer, no stop) whose Bengali ends in daṛi (BN-BUTTON, fragments) | 9, all status or empty-state sentences rather than button labels; filed, not rewritten |
| Short labels whose Bengali is over 2.2x the English length (BN-LENGTH) | 33 candidates; the longest are verb phrases ("auto-fixed" rendered as a full participle phrase), reviewed and left: the termbase and grammar anchors outrank the width preference |
| Latin token + hyphen + Bengali suffix (BN-WRAP) | 501 strings; spot-checked, all the established `API-এর` form, no break defects measurable without rendering |

## Arm B

The two ZWNJ strings were switched to ZWJ (র‍্যাংক), in the merged locale file
and its section split, so the rendered form matches the 13 other -rya- sites.
Coverage gate: 14 locales, 0 gaps. The nine daṛi strings are sentence-shaped
status lines, so the fragment rule does not clearly apply; they were left for the
operator rather than resolved by guess.

## Reading

Target moved (2 conjunct-breaking sequences removed), floor held (gate green, no
other locale touched). The technique held with no amendment. Not measured: real
rendered width and clipping; no render harness was reachable, so BN-LENGTH
remains a count, not pixels.
