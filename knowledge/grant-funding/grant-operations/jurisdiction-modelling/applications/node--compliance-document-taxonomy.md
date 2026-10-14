---
layer: application
type: application
subject: jurisdiction-modelling
technique: compliance-document-taxonomy
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Hints written in ASCII, uploads written in Czech

Source tree: the fleet's grant-matching platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-14 at `8fb9bb8` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and cites no paths or lines. The change is `446d239` and its ledger row is `9270e22`, both on
the project's `main`.

## The tree followed the technique's rule and met only half of it

The technique says recognition hints must be diacritic-insensitive, because users name files in
stripped ASCII at least as often as in correct orthography. The tree's Czech document classes
(registry extract, statutes, public-debt clearance, budget, annual report, sworn declaration)
carry exactly that: filename hints written in plain ASCII. The pre-submission checklist then tests
each hint against the raw upload name. So `doklad-o-bezdluznosti.pdf` matched, and `Doklad o
bezdlužnosti.pdf` did not. The rule had been satisfied on the author's side of the match and left
open on the user's side, and the half left open is the one a Czech applicant types by default.

The failure is the quiet kind the technique's last decision rule is about. A properly spelled
upload was reported as a missing required class, so the checklist told an applicant who had done
everything right to attach what was already attached. It did not certify anything false; it
nagged, which is cheaper than the opposite failure but teaches users to ignore the checklist.

## What changed

The match now tests the hint against the raw filename and against the same name decomposed to
base letters with combining marks dropped. Nothing else moved: the hints stayed ASCII, so a hint
author still writes one spelling, and the normalization lives in one place beside the match.
Three tests pin it: every class recognised under the diacritic spelling, every class still
recognised under the stripped spelling (the floor), and every class still flagged when only
unrelated files are attached.

## The paired result

Target: classes reported missing when the correctly spelled upload is attached, over six classes.
A (raw name only) reported 6 of 6 missing; B (raw and stripped name) reported 0 of 6. Floor:
stripped-ASCII uploads recognised 6 of 6 under both arms, unrelated files still flag all six
classes under both arms, the 30 pre-existing checker tests are unchanged, and the full suite is
green (378 files, 3,613 tests). The new orthography test fails on arm A.

The seam was chosen to falsify the technique's tacit claim that ASCII hints are enough. A caught
outcome would have been the diacritic spelling already matching through some other path; it did
not. It missed every class.

## What it does not show

The demand needles, which recognise the requirement in a funder's call text, run on a different
path with their own accent handling and were not touched. The match remains a screening layer:
a matched filename is reported provisional and never as verified content. Only one language with
diacritics is modelled in the tree today, so the result says nothing about scripts where
decomposition does not reduce to a base letter.
