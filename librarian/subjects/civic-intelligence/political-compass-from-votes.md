---
domain: civic-intelligence
subject: political-compass-from-votes
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# political-compass-from-votes

## Architecture review - 2026-09-09

Read all ten owned documents. Corrected model and evidence boundaries; historical application dates remain unchanged. Consumer code, fixture execution, incident replay, group membership/quorum, UI semantics and answer privacy remain open verification leads.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/political-compass-from-votes",
  "date": "2026-09-09",
  "baseline": "78850ba5",
  "digest": "sha256:8ff9a05b199fc9c4",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read and assessed with explicit counterexamples. External checks are scoped in sources. No consumer runtime, historical incident replay, or application witness refresh.",
  "counterexamples": [
    "One disagreement over two comparable questions versus two over ten reverses raw-distance and agreement ordering.",
    "Three answers with a half-overlap floor admits two votes; zero answers also needs an explicit guard.",
    "Two yes votes and eighteen absences can produce a misleading group line without quorum.",
    "A partial round favors earlier theme buckets; missing confidence does not mandate retention."
  ],
  "sources": [
    {
      "url": "https://link.springer.com/article/10.1057/ap.2013.30",
      "scope": "Primary abstract: model sensitivity in the studied StemWijzer sample."
    },
    {
      "url": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0164184",
      "scope": "Primary abstract and authors: question polarity experiment."
    },
    {
      "url": "https://link.springer.com/chapter/10.1007/978-3-031-70381-2_23",
      "scope": "Primary abstract: adaptive questionnaire experiment; no replication."
    }
  ],
  "documents": {
    "political-compass-from-votes.md": {
      "disposition": "clarify",
      "reason": "Narrow neutrality, model equivalence, reliability and inferred group-position claims."
    },
    "techniques/comparability-floor-for-ranking.md": {
      "disposition": "clarify",
      "reason": "Replace a universal half-overlap/three-answer prescription with explicit count, coverage and zero-input guards."
    },
    "techniques/matching-model-choice.md": {
      "disposition": "clarify",
      "reason": "State the binary equivalence assumptions with a counterexample and remove categorical rejection of adaptive methods."
    },
    "techniques/non-positional-abstention-handling.md": {
      "disposition": "clarify",
      "reason": "Preserve unknown versus absence and qualify group-line inference."
    },
    "techniques/divisive-vote-selection.md": {
      "disposition": "clarify",
      "reason": "Correct validity, confidence and reproducibility boundaries."
    },
    "techniques/theme-balanced-drawing.md": {
      "disposition": "clarify",
      "reason": "Disclose partial-round preference, taxonomy choices and repeated-bill correlation."
    },
    "techniques/disclosed-scoring-rule.md": {
      "disposition": "clarify",
      "reason": "Scope study claims and distinguish deterministic computation from privacy and semantic consistency."
    },
    "applications/node--disclosed-scoring-rule.md": {
      "disposition": "clarify",
      "reason": "Retain historical witness; identify concrete consumer checks without claiming execution."
    },
    "applications/node--divisive-vote-selection.md": {
      "disposition": "reverify",
      "reason": "Retain historical witness; identify concrete consumer checks without claiming execution."
    },
    "applications/process--matching-model-choice.md": {
      "disposition": "clarify",
      "reason": "Replace broad unverified product survey with three scoped primary findings and corrected authorship."
    }
  }
}
```

### 2026-09-10 — architecture re-review after the compression revert

All ten documents read against baseline `44c8996585f2e5e3f36e0cb0bd1983c607cadfd7`.
Seven carry the salvaged 2026-09-09 appends; three —
`techniques/comparability-floor-for-ranking.md`,
`techniques/matching-model-choice.md` and
`applications/process--matching-model-choice.md` — were restored whole and are
therefore the pre-review bytes.

**This entry retracts the 2026-09-09 record's document-level clarifications for
the seven salvaged documents.** Their stated corrections are already in the
text: `divisive-vote-selection` already ends with a numeric-and-coverage
boundary section (exact margins before rounding, uncalibrated self-reported
confidence, gate losses reconciling to the input pool);
`non-positional-abstention-handling` already separates unknown source states
from confirmed absence and already qualifies the group line as an inferred
positional majority; `theme-balanced-drawing` already discloses the
partial-round preference and the repeated-bill correlation;
`disclosed-scoring-rule` already scopes the study claim and separates
determinism from privacy. Those documents are `keep`.

**The salvage left one live contradiction inside the subject.** The restored
technique and the tightened golden path now disagree about the ranking floor.
`comparability-floor-for-ranking` states one rule — rankable at
⌈answered / 2⌉ positional ballots — and argues *against* an absolute companion
("A fixed floor ('at least 5 ballots') changes meaning as the citizen answers
more or fewer questions"). The golden path's step 4, in its kept form, says the
opposite: "Ranking eligibility requires a published overlap policy combining an
absolute minimum with a relative floor and topic-coverage checks. Half the
answered questions is only a heuristic." One of the two is wrong and a reader
cannot tell which is the standard. The technique's own opening argument settles
it against itself: at the published three-answer minimum, ⌈3/2⌉ = 2, so an
entity with two comparable ballots is rankable and a 100%-on-two row leads the
board — the exact outcome the technique opens by calling "small-sample noise
wearing a medal". This is a finding about the corpus's internal consistency,
not a request to shorten anything.

**One citation is misattributed, and I verified it at source.**
`applications/process--matching-model-choice.md` credits the question-polarity
result to "Baka et al. (*PLOS ONE*, 2016)". The article at the URL the document
itself cites is *Positive vs. Negative: The Impact of Question Polarity in
Voting Advice Applications*, by Bregje Holleman, Naomi Kamoen, André Krouwel,
Jasper van de Pol and Claes de Vreese (PLOS ONE, 2016). Baka is a different
author on a different VAA question — the middle answer category. The finding as
stated (polarity alone shifts answers, more strongly among users with lower
political sophistication) is correct; the byline is not.

**One source is read one-sidedly.** Both the process application and
`techniques/matching-model-choice.md` cite the ECML PKDD 2024 adaptive-
questionnaire work only for its negative half — condensed fixed subsets keep
recommendation accuracy below 40%. That is accurate. What both omit is the
paper's actual result: an IDEAL encoder/decoder with PosteriorRMSE selection
reaches **74% accuracy at the same question count** as the condensed version.
The technique uses the sub-40% number as support for refusing adaptive
selection, when the paper measures adaptive selection recovering most of that
gap. The refusal is still right — a per-citizen question set means no two
readers answered the same instrument, and the published board stops being one
artifact — but it must stand on comparability alone, not on a fidelity result
the source uses in the opposite direction.

Louwerse & Rosema checked out exactly: *Acta Politica* 49(3), 286–312 (2014);
analyses on actual StemWijzer users' answers; a majority of users would have
received different advice under another spatial model, and aggregate
best-match frequencies depend strongly on the method. Both the golden path's
scoping ("specific to that study, not an estimate for every compass") and
`disclosed-scoring-rule`'s are faithful to it. Volume and pages are absent from
the citation and would make it checkable.

Not resolved this pass: Gemenis 2012 on exclusion versus midpoint imputation;
the Rosema & Louwerse 2016 response-scale result; the Wahl-O-Mat 38-thesis /
city-block description, smartvote's ~75 questions, euandi 2024's 30 Likert
statements, and the PreferenceMatcher hybrid metric. No consumer checkout was
opened, no fixture run, no incident replayed, and no application witness date
was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/political-compass-from-votes",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:eb9c22947fdcb514",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full against the post-restore bytes, and checked against each other for internal agreement. Primary sources read (not executed): the PLOS ONE 2016 polarity article page, the Acta Politica 2014 bibliographic record and abstract, the ECML PKDD 2024 adaptive-questionnaire record. Not evaluated: the politicas consumer code, its line numbers and fixtures; Gemenis 2012; Rosema & Louwerse 2016; the Wahl-O-Mat, smartvote, euandi and PreferenceMatcher product descriptions; group membership and quorum handling in any live tool; answer-privacy behaviour.",
  "counterexamples": [
    "At the published three-answer minimum the ranking floor is ceil(3/2)=2, so a representative with two comparable ballots at 100% is rankable and leads the board - the exact small-sample artefact the technique opens by rejecting.",
    "A representative who answered nineteen of twenty questions at 78% is ranked below a two-ballot 100% row whenever the citizen answers few enough questions, so the relative floor alone does not deliver the comparability it promises.",
    "Two entities whose comparable sets differ in size can be ordered differently by raw agreement count and by agreement rate, so the binary metric-collapse holds only over one shared comparable set - which abstention and absence guarantee is not the general case.",
    "A theme cap of two over a bill that generated twelve divisions across three theme buckets still admits six correlated questions, so theme balance does not deliver independent evidence.",
    "A group with two yes ballots and eighteen absences produces a strict positional majority and therefore an inferred line, which is why the quorum rule and not the majority rule is what stops it."
  ],
  "sources": [
    {
      "url": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0164184",
      "result": "Established the article is 'Positive vs. Negative: The Impact of Question Polarity in Voting Advice Applications' by Holleman, Kamoen, Krouwel, van de Pol and de Vreese (PLOS ONE, 2016), and that implicit and explicit negations shift reported attitudes, more strongly among less politically sophisticated users. Established that the corpus's attribution to 'Baka et al.' is wrong. Did not establish effect sizes or transferability to a record-based instrument."
    },
    {
      "url": "https://link.springer.com/article/10.1057/ap.2013.30",
      "result": "Bibliographic record and abstract resolved via search: Louwerse & Rosema, Acta Politica 49(3):286-312 (2014), analyses on actual StemWijzer users' answers, a majority of users would receive different advice under another spatial model, and aggregate best-match frequencies depend strongly on method. The corpus's scoped use of this result is faithful. The full text is behind a Springer authentication redirect and was not read."
    },
    {
      "url": "https://link.springer.com/chapter/10.1007/978-3-031-70381-2_23",
      "result": "Established via the ACM/arXiv records: Bachmann, Sarasua & Bernstein, ECML PKDD 2024 Applied Data Science Track, on the smartvote 2019 Swiss federal dataset; condensed fixed questionnaires keep recommendation accuracy below 40%, and the proposed adaptive method (IDEAL encoder/decoder plus PosteriorRMSE selection) reaches 74% at the same question count. Established that the corpus cites only the first half. Did not reproduce the experiment."
    },
    {
      "source": "Internal consistency check across the subject's own documents",
      "result": "Established that techniques/comparability-floor-for-ranking.md and the golden path's step 4 now state different ranking-floor policies after the partial restore. Did not determine which the practitioner intends."
    }
  ],
  "documents": {
    "political-compass-from-votes.md": {
      "disposition": "keep",
      "reason": "The honest-trade framing, the six-stage pipeline with one invariant each, the group-line quorum paragraph and the lens boundary are sound and correctly scoped; its step 4 is the side of the ranking-floor disagreement that should probably win, but the resolution belongs to the technique."
    },
    "techniques/comparability-floor-for-ranking.md": {
      "disposition": "clarify",
      "reason": "States the relative floor as the rule and argues against an absolute companion, contradicting the golden path's kept step 4; at the three-answer minimum its own rule admits the two-ballot 100% row it opens by rejecting. One policy must own this, stated in both places."
    },
    "techniques/disclosed-scoring-rule.md": {
      "disposition": "keep",
      "reason": "One definition with two consumers, the meaningless-tie-break disclosure, the rejection accounting, the never-blend lens boundary and the reproducibility/privacy section are complete and correctly scoped against the studied result."
    },
    "techniques/divisive-vote-selection.md": {
      "disposition": "keep",
      "reason": "The declared gate order, the two participation-rejection states, missing-is-not-low for classifier confidence and the every-gate-ships-its-count rule are intact, and the numeric and coverage boundary the prior record asked for is already in the text."
    },
    "techniques/matching-model-choice.md": {
      "disposition": "clarify",
      "reason": "The adaptive-ordering bullet leans on the sub-40% condensed-subset result to refuse adaptive selection, while the same study measures adaptive selection recovering to 74% at equal question count. The comparability argument is the sound one and should carry the bullet alone."
    },
    "techniques/non-positional-abstention-handling.md": {
      "disposition": "keep",
      "reason": "The three-fate partition, the follow-the-chamber's-own-procedure rule, the three named fabrications, the counts-render discipline and the group-line inheritance are correct and already carry the unknown-state and selection-bias caveats."
    },
    "techniques/theme-balanced-drawing.md": {
      "disposition": "keep",
      "reason": "The round-robin draw, symmetry-not-proportionality, the two published caps over stated populations, and the closing section on what theme caps do not establish (bill-family correlation, no claim about public priorities) are complete."
    },
    "applications/node--disclosed-scoring-rule.md": {
      "disposition": "reverify",
      "reason": "Dated source-line account of the pure scoring function and the sibling lens module retained with its own boundary section; no consumer checkout was opened, no fixture run, and the sibling contribution-index lens still does not demonstrate reader reweighting in the compass itself."
    },
    "applications/node--divisive-vote-selection.md": {
      "disposition": "reverify",
      "reason": "The gate constants, the counted-loss incident and the tie-break cascade are dated implementation claims that were not replayed; the 120-ballot floor and the 0.7 confidence threshold remain that deployment's policy, as its own boundary section says."
    },
    "applications/process--matching-model-choice.md": {
      "disposition": "clarify",
      "reason": "Misattributes the PLOS ONE 2016 polarity article to 'Baka et al.' when its authors are Holleman, Kamoen, Krouwel, van de Pol and de Vreese; omits volume and pages for Louwerse & Rosema (Acta Politica 49(3):286-312); and reports only the negative half of the ECML PKDD 2024 result, omitting the 74%-at-equal-length adaptive figure."
    }
  }
}
```
