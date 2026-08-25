---
layer: application
type: application
subject: czech
technique: plural-and-count-agreement
stack: process
status: forged
verified_on: 2026-08-24
---

# Process · Czech plural agreement across two real catalogs

Two products in the same fleet hit the Czech count system with opposite
tooling — one with full ICU plural support, one with a two-slot system — and
between them exercised nearly every failure mode this technique names.
Verified against both working trees on 2026-08-24.

## kp — full ICU, and the defects that survive it (~4 800-key catalog)

`C:\Users\kazda\kiro\kp\docs\i18n\style-cs.md` states the rule (one/few/other
ICU blocks, `many` optional for integer counts) and the escape hatch
(count-invariant neuter verb — "postoupilo {n}" — when the number renders in
a separate badge). The 2026-08 review wave (recorded in
`C:\Users\kazda\kiro\kp\docs\i18n\review-cs.md`) fixed ~55 keys of ICU
number agreement, the largest theme of the whole 455-key wave, in exactly
the two shapes this technique predicts:

- flat genitive plurals against live counts ("1 aktivních", "3 čeká",
  "4 týdnů") — CS-NUM;
- verbs and adjectives frozen *outside* a plural block while the noun
  declined inside it — CS-AGREE, e.g. `jobs.rediscoveryFeed.swept`, where
  frozen "publikovaných" beside a correctly declining noun rendered
  "1 publikovaných role"; the fix moved the adjective into each branch.
  `pipeline.tab.degradedBannerBody` had reused the *few* form for *other*
  ("5 je nespárovatelné útržky"); `devcase.integrity.backdatedTitle` was the
  one plural whose branches differed by count but had no Czech `few`, so
  2–4 fell through to the genitive-plural branch.

The critical-severity incident is the format-contract one: on the public
market page, call sites (`MarketPulseApp.tsx:110-111`, `parts.tsx:232,303`)
passed `n` as an already-`fmtInt()`-formatted string (NBSP thousands
separator) into `{n, plural, …}`, which evaluated `"38 553" - 0 = NaN` — cs
rendered literally **"NaN volných míst"** on the hero. The worked-around
state (count-invariant genitive plural, correct for every value the data
snapshot actually carries, wrong for a future 1–4) and the real fix (pass
the raw number, restore the branches) are both recorded in `review-cs.md`
under the `jobMarket` section — a textbook source-defect register entry.

## personas — a two-slot system and the settled workarounds (~19k-key catalog)

`C:\Users\kazda\kiro\personas\docs\i18n\style-cs.md` (Pitfall 1) documents
the constrained case: the i18n system exposes only `_one`/`_other` for cs —
no `_few`. The guide pins exactly the two house patterns this technique
teaches, and forbids inventing a third:

- genitive-plural `_other` for descriptive strings ("{count} nových zpráv",
  "{count} agentů zkontrolováno") — acceptable down to count 2;
- the parenthetical shorthand for tight confirm labels where 2–4 is common
  ("Smazat {count} agent(y/ů)");

plus the explicit ban on the nominative-plural-only `_other` ("agenti",
"návrhy") — flatly wrong at 5+. It also carries the gender-adjacent
agreement pitfall this technique shares a boundary with: a template like
"{name} je nastaven" breaking when a feminine persona name fills the slot.

## What generalized upward

The upward lessons this subject's technique absorbed from these two repos:
the count-invariant escape hatch as a *named* pattern rather than an ad-hoc
dodge; CS-AGREE as a separate anchor from CS-NUM (branch-content checks
systematically missed the shared tail until it had its own ID); the
render-at-1/3/5 audit procedure; and the rule that a two-slot system gets
exactly two recorded workarounds, decided per surface class, never per
translator.
