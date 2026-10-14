---
layer: application
type: application
subject: translation-quality-measurement
technique: deterministic-checks-before-estimates
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@22
applied: code
ab_verdict: better
---

# A placeholder gate that could not see non-ASCII names (personas)

`personas` at `7114530021`. The catalog is 24,778 English strings and thirteen target
files. The seam is the skeleton-parity rung of the i18n tooling: a helper that lists
keys whose translation carries a placeholder the source lacks. It compared ASCII
word-class spans only, which is the pattern the runtime substitutes, and it was called
by the gap planner but by no gate. The seam was chosen to falsify "skeleton parity is
already covered here": the repository has a parity check, a comment explaining the
exact failure, and a pre-commit untranslated check beside it.

## What ran

A replay over all thirteen targets compared three things per key: dropped names,
invented names, and rich-tag multisets, plus duplicate-source divergence.

| Class | Result |
| --- | --- |
| Invented placeholder name, ASCII-class compare | 0 (the helper's own answer) |
| Invented placeholder name, delimiter-defined span | 7, all one key (the monitor subtitle) in seven locales, each with the name translated and suffixed (`{人格s}`) |
| Dropped name | 16, ten of them singular plural-form values that state the count in words (correct) plus the same seven |
| Rich-tag mismatch | 11 across six locales, none a translated tag name |
| Duplicate-source groups | 1,000 groups; 257 to 397 diverge per locale (unread) |

The 7 are live keys and rendered raw braces on screen. Change B widened the compare to
a delimiter-defined span (any script, excluding comma and quote shapes), wired it into
the pre-commit untranslated check, and retranslated the seven values.

## Verdict

Target, live broken strings visible to the gate: A 0 of 7, B 7 of 7 (the check exits 1 on
the pre-fix catalog, 0 after). Floor: zero new findings across 13 locales times 24,778
keys, the coverage, escape and census gates green. `better`, shipped on origin master.
Not read: the duplicate-source groups (most are likely legitimate context splits, and the
technique says count before gating), the tag mismatches, and termbase adherence.

## Proof

`proof: ab-paired`. Same catalogs through the old helper and the new one.
