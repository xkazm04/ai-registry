---
subject: english
domain: localization
last_touched: 2026-09-14
touched_by: deepen (forge-sized: coverage hole)
dry_streak: 0
---

# english

**Forged 2026-09-14** (`e86f41e8`), from a `/deepen` run on the operator's request to make
the localization bundle "a professional service for high quality native English texts to
web". The scan found a coverage hole, not an undercooked subject: every language subject
treated English as the source, none as the target, so the run forged (per the skill's own
rule — a coverage hole is forged, not deepened around).

8 techniques, 88 anchored `EN-*` rules, 3 applications (`process--interference-constructions`,
`process--generated-prose-patterns`, `spec--typography-and-capitalization`). Depth rung at
forge: **L2** (primary style authorities and peer-reviewed studies read by the research
lanes; no L3 probe of our own yet).

## Research shape

Seven lanes plus a fleet survey: authorities (Microsoft, Google, Apple, GOV.UK, Mailchimp,
Atlassian, WCAG, ISO 24495, NN/g — read directly, several URLs found moved), non-native and
translationese (Czech learner corpora, Volansky/Ordan/Wintner 2015, ISO 17100/18587, TAUS),
generated prose (Reinhart 2025, Kobak 2025 + monthly update, Shaib 2025, a crowd-maintained
field guide), tooling, **counter-evidence** (13 claims attacked), a **blind training-data
lane**, cross-repo enforcement. Convergence marks carried into a Director dossier; single-lane
rules are written hedged (EN-NUMERAL, EN-SECTION-NAMES, EN-BUT-OPEN, EN-COPULA).

**Counter-evidence was again the highest-yield lane.** It refuted, as absolutes: readability
formulas as targets, native review as necessary-and-sufficient, detectors as quality gates,
"em dash = generated-text tell", "plain language costs expert credibility". It left
unresolved: US-as-default for Europe, sentence vs title case on performance, translated-copy
underperformance (the flagship survey measures stated preference). Every one of those shaped
a rule's wording.

## Worker corrections to the dossier (verified by reading the trees)

- systedo-case's "validated EN-ARTICLE, six pairs" shows five, only two of them article fixes
  — the favourite-bucket lesson now in the application.
- goat's Title Case is consistent, so undeclared rather than mixed; two word-list hits
  (`seamlessly` with proof beside it, literal `unlock`) are clean under their exceptions.
- politicas' review rejected an em-dash advisory reasoning about Czech typography, which
  contradicts this bundle's own Czech subject.

## Leads (banked, with return conditions)

1. **A subheading that restates its heading** (goat "Browse by Category" / "Explore rankings
   across different topics") — no EN rule covers it. Return: a second sighting in another tree.
2. **An elided head noun** ("the same you see" → "the same data you see") — the English mirror
   of CS-DEM. Return: second sighting.
3. **`specimen` for *vzorek*** — a wrong-sense rendering, not a cognate; candidate lexicon row
   beside EN-FALSE-FRIEND. Return: the next false-friend lexicon pass.
4. **L3 probe owed:** measure the mechanical EN rules' precision on real fleet catalogs once
   the `native-copy` checker has run in several trees; a rule over ~20% rejected findings
   gains a condition (copy-quality-gates' own promotion rule).

## Clocks

Vocabulary-shaped rules (EN-PUFFERY, EN-OPENER, EN-SIGNIFICANCE word lists) decay with model
generations — re-check against the excess-vocabulary literature by **2027-03-14**. Style
authorities move slowly; the authorities table by **2027-09-14**.

## Impact (2026-09-14 map regeneration)

Joined to contexts in 8 projects - kp 4, politicas 2, personas-web 2, systedo-case 2, goat 1,
personas 1, ascent 1, gravitone 1 (gravitone-gcloud 0). All pairs `unknown`: the first
`/conform` pass per project is the queue. Every one of those projects also runs the
`native-copy` gate, whose findings cite this subject's IDs; baselined debt at adoption:
politicas 865, personas-web 276, systedo-case 100, kp 78, gravitone 40, ascent 29,
gravitone-gcloud 9, goat 0.

**Operator decisions from adoption, ruled 2026-09-14:** the Czech koruna is `Kč` in Czech
only and `CZK` in every other language (kp, systedo-case); "Gravitone" is the official product
name and stays in titles, with a `|` separator instead of the banned dash (gravitone-gcloud);
kp's apostrophes stay as they are (not a finding); politicas' Title Case document names are out
of scope for now; goat's tagline is `Greatest of All Time` (chosen by the Director on
delegation: title style lowercases a short preposition in a spelled-out acronym). The
koruna ruling matches EN-CURRENCY and is the first fleet-wide instance of a per-language
currency form - a candidate example for that rule's next deepen pass.
