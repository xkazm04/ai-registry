---
layer: application
type: application
subject: political-compass-from-votes
technique: matching-model-choice
stack: process
status: forged
---

# Matching-model choice — the VAA field's methodology landscape (surveyed 2026-08-20)

The application layer may name names, so this document records where the
voting-advice-application field actually stands, as the concrete reference the
technique's purity-clean claims compress. Survey date 2026-08-20; each source
carries its access date.

## Matching models in named practice

- **Wahl-O-Mat (Germany)** matches with the **city-block** metric over 38
  theses; statements are selected and formulated by an editorial board that
  deliberately includes first- and second-time voters, balancing across
  subject areas by hand — the editorial analogue of the theme-balanced draw.
- **StemWijzer (Netherlands)** runs ~30 statements with an agreement-style
  model; it is the tool on which the central design-effects result was
  measured (below).
- **smartvote (Switzerland)** offers a long questionnaire (~75 questions) and
  a condensed one, and renders both a high-dimensional match and spatial
  visualizations (smartspider/smartmap) — the projection-as-display case the
  technique disciplines.
- **The PreferenceMatcher consortium** (Choose4Greece and siblings) publishes
  a **hybrid** model: the average of the city-block and scalar-product
  metrics — direct evidence that metric choice is a live, contested design
  axis, not settled convention.
- **euandi 2024** (European Parliament elections) used 30 statements on a
  Likert scale with expert/party iterative position coding.

## The measured findings the technique leans on

- **Model sensitivity.** Louwerse & Rosema, "The design effects of voting
  advice applications: comparing methods of calculating matches" (*Acta
  Politica*, 2014): with identical StemWijzer data, **a majority of users
  would have received different advice under a different spatial model**, and
  aggregate how-often-is-party-X-first varies strongly by method. This is the
  golden path's "model sensitivity finding", confirmed at source.
- **Scale and polarity effects.** Rosema & Louwerse (*Policy & Internet*,
  2016) show response-scale design changes outcomes; Baka et al. (*PLOS
  ONE*, 2016) show question polarity alone shifts answers — wording and
  scale are model surface, which the record-based inversion removes for the
  representative side but keeps for none of the citizen side reading a real
  motion title.
- **Imputation.** Gemenis, "Estimating parties' policy positions through
  voting advice applications" (*Acta Politica*, 2012): Monte Carlo work
  advises **excluding** missing values rather than midpoint-imputing them —
  the field's own support for "a skip enters neither slot". Some deployed
  hybrid models nonetheless score neutral/no-opinion against the scale
  midpoint, which is exactly the fabrication the technique bans.
- **Shortened and adaptive questionnaires.** "Fast and Adaptive
  Questionnaires for Voting Advice Applications" (ECML PKDD 2024): condensed
  fixed subsets of smartvote's questionnaire drop party-recommendation
  accuracy **below 40%** versus the full set; the proposed fix is per-user
  adaptive question selection (encoder/decoder over a 2D latent space).
  Fidelity motivates it; the technique's comparability rule is why a
  published compass still refuses per-citizen sets — no two readers would
  have answered the same instrument.

## Reconciliation with the record-based design

For a record-based compass the metric axis collapses (binary ballots make
city-block, euclidean and agreement-rate orderings coincide over the same
comparable set), so none of the named tools' metric debate transfers — but
every finding about selection, scale, imputation and subset fidelity does,
which is the boundary the technique states.

## Sources

- https://link.springer.com/article/10.1057/ap.2013.30 — Louwerse & Rosema, design effects (accessed 2026-08-20)
- https://www.sozwiss.hhu.de/en/institut/abteilungen/politikwissenschaft/politik-ii/prof-dr-stefan-marschall/forschungsprojekte/wahl-o-mat-research/facts-about-the-wahl-o-mat — Wahl-O-Mat facts: 38 theses, editorial board, city-block (accessed 2026-08-20)
- https://www.frontiersin.org/journals/political-science/articles/10.3389/fpos.2024.1286893/full — AI and VAAs survey; PreferenceMatcher hybrid metric (accessed 2026-08-20)
- https://link.springer.com/article/10.1057/ap.2012.36 — Gemenis, exclude-not-impute (accessed 2026-08-20)
- https://onlinelibrary.wiley.com/doi/abs/10.1002/poi3.139 — Rosema & Louwerse, response scales (accessed 2026-08-20)
- https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0164184 — question polarity (accessed 2026-08-20)
- https://link.springer.com/chapter/10.1007/978-3-031-70381-2_23 — fast/adaptive questionnaires, sub-40% condensed accuracy (accessed 2026-08-20)
- https://oxfordre.com/politics/display/10.1093/acrefore/9780190228637.001.0001/acrefore-9780190228637-e-620 — VAA overview: StemWijzer, smartvote, statement selection practice (accessed 2026-08-20)
