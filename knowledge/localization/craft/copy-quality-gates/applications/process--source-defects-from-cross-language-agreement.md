---
layer: application
type: application
subject: copy-quality-gates
technique: source-defects-from-cross-language-agreement
stack: process
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# The catalog gate filed every failure against its own locale (kp)

The seam hunt chose the check that could falsify "a target gate files every one of those
failures against the locale that produced it": does the catalog gate's output carry any
view keyed by source unit?

## What the tree showed

- `scripts/i18n/catalog-check.mjs` returns a flat list of `locale: "address" - message`
  strings, one per failing locale. Nothing groups by address, and findings carry no check
  identifier, so a placeholder lost in two locales read as two unrelated slips.
- The real catalogs (4 locales, 14,676 strings each) are clean today, so the live count of
  suspects is zero and the technique's precision is not measured here.

## A and B (code, kp)

A string with a placeholder dropped in two of three target locales. Arm A (old gate): two
unrelated per-locale lines, no source finding. Arm B: one suspect citing both locales and
`placeholder-missing`, ranked by locales affected, advisory only. Controls: a failure in one
locale raises none; a clean catalog raises none; a target-local em dash in two locales raises
none (it is the translator's punctuation, not what a source forces).

## Verdict

Better on the seeded case; 3 new fixtures plus the 13 existing pass, and the live gate stays
green. The checks counted are placeholder, ICU syntax and missing key only: dash and orphan
findings are excluded because a shared source does not force them. Floor held at an absolute
two locales. Not built: the owner's verdict register and the relative-deficit signal. Return
condition: the first real catalog edit that trips a suspect, to count how many the owner
clears as check or pipeline causes.
