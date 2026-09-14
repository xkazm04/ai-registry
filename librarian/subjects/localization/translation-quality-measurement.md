---
subject: translation-quality-measurement
domain: localization
last_touched: 2026-09-14
touched_by: deepen (market harvest, wave 1)
dry_streak: 0
---

# translation-quality-measurement

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-04 - `/intake`, forged in-session from an E4 escalation

**Created.** Golden path plus six techniques, taking `localization/craft` from
one subject to two. Source: [[2026-09-04-authority-hacker-writing-models]] — a
video about English marketing copy that authorizes nothing here. It
**originated** the question and the bundle's own structure answered it.

The gap, stated as the bundle stated it against itself. The thirteen language
subjects answer *what a correct translation is* — register, script, agreement,
the rules a native reviewer holds a string to. [[translation-pipeline-topology]]
answers *where translations live and what may claim to be source*, and says so
in those words in its opening. Between the two sits a decision neither makes and
both depend on: **which machine produced the derived store, and how anyone would
know it got worse.** `derived-and-served` is defined as machine translations,
keyed to their source, regenerable at will — the engine is a free variable that
the topology never constrains, and swapping it changes every string with nothing
in the bundle noticing.

Verified as a real absence rather than a slug miss: 146 files, and every
`use_when` hit on choosing/selecting is either a linguistic choice (register,
classifiers, quote glyphs) or a storage choice (branch, fallback). The nearest
neighbour, `source-identical-value-audit`, proves a catalog was *translated* —
values differ from source — while saying nothing about whether the translation is
good. That file is the seam, and it exists today.

Three mechanisms shared the home, which is the trigger for a subject rather than
an amendment: engine choice per language pair (the ranking does not transfer),
measuring without a reference (the case the derived topology is *always* in), and
regression under an engine defined as regenerable.

Forged by one worker on a primary-only budget, because the originating source
could not carry it: shared-task findings and a published error typology, five of
six fetches spent. The load-bearing number is that even reference-*based* metrics
recover under sixty percent of pairwise human preferences at segment level, which
is what turns "an estimator is a queue, not a grade" from a stance into a
measurement.

Three worker overrides, all argued and all accepted on review. It added a sixth
technique the spec did not propose — decide mechanically whatever a rule can
decide, and point the estimator only at the residue — on the argument that
without it the subject's spine is "we have a weak instrument", which is a bad
subject; with it the spine is the actual craft. That also answers the spec's
question about termbase adherence, which lands inside it as the one quality
dimension measurable at corpus scale, reference-free and model-free, against a
decision a human already made on the record. It folded the engine-selection split
(the ranking instrument has no decision rule of its own) and placed post-edit
distance here rather than in the neighbour, on the argument that a hand-authored
translation has no machine baseline to differ from.

**Owed, and it is the honest weakness:** no application layer. Every other
subject in this bundle is grounded in a real tree; this one is literature plus
training data. Two fleet projects declare the `localization` domain, so the
return condition is concrete — a later pass opens one and writes the missing
layer. A `deepen` pass should also re-check that
`deterministic-checks-before-estimates` has not converged with the neighbour's
`source-identical-value-audit`; the seam is drawn explicitly in both files today.

### 2026-09-14 — market harvest, wave 1: two published numbers retracted

Source: [[2026-09-14-l10n-market-landscape]] (five-lane sweep of the market's code,
docs and campaign papers). Landed in `423a40d7`.

**The 2026-09-04 entry above names as this subject's "load-bearing number" a claim
this pass removed.** "Even reference-based metrics recover under sixty percent of
pairwise human preferences at segment level" was written from a shared-task
reading and could not be re-sourced; the 2025 campaign reports segment-level
agreement between 0.35 and 0.57 across its metrics, which supports the same stance
without the unfound figure. The spine — *an estimator is a queue, not a grade* —
survives on better evidence than it was built with, which is the useful outcome of
being wrong.

The larger correction is the span-detection figure (0.3–0.6 F1 → 13.47% best
automatic against a 47.48% second-human ceiling; English→Czech human columns
14.40 / 24.86 / 18.24 against 10.55), and its rule: **a span score cannot be read
without the human-versus-human number from the same data, quoted as the range it
is.** The severity weighting was also wrong here and in the golden path ("1, 5 and
25" → major 5 / minor 1 / neutral 0, with non-translation 25 and minor
punctuation-fluency 0.1 as *categories*).

Added: segment-vs-system inversion; the no-metric-that-selected-it rule; per-pair
catastrophic recall; the blind-sentinel and corner-case controls; metric-delta
significance floors; the category-free review protocol as a costed tier (34s vs
49s, non-experts, 94.9% ranking agreement, τc 0.254 vs 0.116) with the loss of
category routing stated; and the cost-and-licence layer (3-bit quantization 22GB →
8GB at no quality cost; the dominant open family's reference-free and span-level
checkpoints are non-commercial).

**Still owed, unchanged and now sharper:** no application layer. Every number in
this subject is now literature, and the fleet has two projects that could ground
it. **New owed:** `reference-free-quality-estimation` reached 197 lines against a
60–150 guideline — split the cost-and-licence section into its own technique in
wave 2. The M3 cutoffs are pooled across pairs and marked borrowed; a per-pair
measurement replaces them when one exists. Nothing in this pass was verified
against a primary document by its worker (the session's search budget was spent);
the Director re-checked 13.47, 47.48, 18.24/10.55 and the sentinel pair against
the campaign's extracted tables, and those four hold.
