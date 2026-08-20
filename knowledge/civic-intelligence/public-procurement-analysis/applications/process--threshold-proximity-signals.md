---
layer: application
type: application
subject: public-procurement-analysis
technique: threshold-proximity-signals
stack: process
status: forged
---

# Process: the open-contracting indicator landscape a splitting detector plugs into (2024–2026)

A near-threshold detector built from this subject's techniques does not enter an
empty field. As of 2026 there is a standards layer, a published indicator library,
tooling that computes it, and a validation literature — and the process decision is
to *adopt* that stack rather than re-derive it. Snapshot dated 2026-08-20; all
sources below accessed on that date.

## The standards layer

- **Open Contracting Data Standard (OCDS)** — the release-and-record model this
  subject's record-modeling technique defers to in its "when not to use": releases
  are publication events, records compile them per contracting process, amendments
  are first-class. 50+ governments publish in it, which is what makes indicator
  formulas portable across jurisdictions at all.
- **EU eForms + the Public Procurement Data Space (PPDS)** — the PPDS launched
  2024-09-24 as the EU-level aggregation point over EU/national/regional notices,
  with eForms as the structured input format. Its own dashboards track data-quality
  gaps (missing notice numbers, missing buyer/supplier registration ids) — a
  standards body publishing its own coverage statement. Independent analysis (CBS,
  2025) finds the quality gains real but "not enough to enable a data-driven
  policy" — i.e. even the standardized layer is a floor over stated coverage,
  exactly the posture registry-coverage-blind-spots prescribes for national
  registries.

## The indicator-library layer

- **OCP, *Red Flags in Public Procurement* (guide, December 2024)** — a revisited
  library of **73 red-flag indicators** spanning the whole lifecycle
  (planning → tender → award → implementation), each with a definition, a
  calculation formula over standardized fields, and a mapping to OCDS. Contract
  splitting / near-threshold clustering is in the library; so are single bidding,
  short submission windows, non-open procedure overuse, and repeat-winner
  concentration.
- **Cardinal (OCP, announced 2024-06)** — an open-source library that computes the
  common collusion/corruption risk indicators directly over OCDS-format data.

The process consequence is this subject's one-definition-one-import law applied at
field scale: where a published formula exists for an indicator, encode *that*
formula (with the library citation as the definition point) rather than a private
variant — a bespoke restatement of a published indicator is drift with extra steps,
and it forfeits cross-jurisdiction comparability.

## What the validation literature says about this technique's signal

- **Near-threshold bunching is a validated population-level indicator.** Tas,
  *Bunching below thresholds to manipulate public procurement* (Empirical
  Economics 164, 2023): regression-discontinuity manipulation (density) tests over
  2M+ EU contracts find **10–13% of contracting authorities with a high
  probability of bunching**, and bunching authorities are measurably less likely
  to use competitive procedures, more likely to award to local firms, and more
  likely to repeat the same winner. This is the source behind the technique's
  procedure-type-shift corroborating signal and its density-test decision rule.
- **Single bidding is the field's most-validated single indicator.** Fazekas &
  Kocsis, *Uncovering High-Level Corruption* (British Journal of Political
  Science): contract-level corruption risk indicators over 2.8M contracts in 28
  European countries, aggregates consistent with established country-level
  indices; World Bank project data link rising single-bidding rates to materially
  higher cost-overrun probability. A proximity detector that ships without the
  single-bidding and procedure-type companions is using the field's weaker
  instrument alone.
- **The precision caveat is the field's own.** The validity literature (Social
  Indicators Research, 2023) states plainly that validating red-flag indicators
  against ground-truth corruption is "complex and still largely unexplored" —
  corruption is latent, convictions are a biased sliver, and indicators measure
  *restricted competition risk*, not corruption. Fraud-analytics work finds single
  flags flood with false positives and that combining flags (or pairing them with
  process-level analysis) is what restores precision. This is the lead-not-finding
  law restated by the people who built the indicators.

## The process this application prescribes

1. Map the corpus into OCDS (or at minimum its contract/version/party separation)
   before computing any indicator — formulas assume the model.
2. Take indicator definitions from the published library, cited as the single
   definition point; record library version and access date next to the formula.
3. Compute ensembles, never a lone flag: proximity + temporal clustering +
   supplier concentration + procedure-type shift + single-bidding rate.
4. Keep every output a ranked review queue. The field's own validation literature
   cannot certify any of these as a finding; neither can you.

## Sources (accessed 2026-08-20)

- OCP red-flags guide (2024): https://www.open-contracting.org/resources/red-flags-in-public-procurement-a-guide-to-using-data-to-detect-and-mitigate-risks/
- Cardinal announcement: https://www.open-contracting.org/2024/06/12/cardinal-an-open-source-library-to-calculate-public-procurement-red-flags/
- Tas 2023, Empirical Economics: https://link.springer.com/article/10.1007/s00181-022-02250-4
- Fazekas & Kocsis, BJPS: https://www.cambridge.org/core/journals/british-journal-of-political-science/article/abs/uncovering-highlevel-corruption-crossnational-objective-corruption-risk-indicators-using-public-procurement-data/8A1742693965AA92BE4D2BA53EADFDF0
- EU PPDS: https://www.public-procurement-data-space.europa.eu/en/dashboards ; deployment overview: https://www.eipa.eu/blog/the-future-of-public-procurement-deploying-the-new-public-procurement-data-space-ppds/
- PPDS/eForms limits (CBS): https://research.cbs.dk/en/publications/looking-into-the-public-procurement-data-space-and-eforms/
- Validity of corruption risk measures: https://link.springer.com/article/10.1007/s11205-023-03238-y
- False positives / flag combination: https://www.sciencedirect.com/science/article/pii/S146708951630077X
