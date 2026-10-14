---
layer: application
type: application
subject: copy-quality-gates
technique: format-aware-check-catalog
stack: process
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# A catalog check that counted nothing it was asked to carry

One product's message-catalog gate, read on 2026-10-14: four locales, 14,673 strings
per locale, a check set of key parity, message-syntax compile, placeholder parity,
a house punctuation rule and (since that morning) control characters.

## What the catalog was missing

Read against the technique's membership, two things stood out. The **carried-literal**
class was absent entirely: nothing compared a number, a link or an address between the
default locale and a translation, so a transposed digit passed. And the **precondition
graph** was absent: a message with an unclosed brace was reported twice (the cheap brace
check and the full compile both fire) and its placeholder comparison then read a parse
that did not exist.

## The paired read

Mutations planted into a two-locale fixture, problem count per arm (A before, B after):

| mutation | A | B |
|---|---|---|
| transposed digit (48 to 84) | 0 | 1 |
| edited email host | 0 | 1 |
| edited link path | 0 | 1 |
| unclosed brace in a message that also has a placeholder | 2 | 1 |
| clean pair | 0 | 0 |

Floor: the shipped catalogs stay green. The first draft of the literal check failed that
floor, and the failure is the finding. It fired 7 keys per locale (21 findings), every one
an illustrative input sample (`you@company.com`, `github.com/owner/repo`) that each locale
localises on purpose. Exempting the sample class left the shipped catalogs at zero literal
drift across 3 translated locales, so the new check found no live defect here; its value
is the three planted classes above. Not measured: how often such drift recurs; n=1 repo.

## What this adds to the technique

Direction matters. Literal identity is demanded of the source's literals only, restricted
to multi-digit numbers, full links and non-example addresses; a looser check measured 18 to
23 false findings per locale on word-versus-digit and scheme-fragment cases before it was
narrowed.
