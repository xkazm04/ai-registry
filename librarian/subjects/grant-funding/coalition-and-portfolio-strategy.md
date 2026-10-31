---
domain: grant-funding
subject: coalition-and-portfolio-strategy
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# coalition-and-portfolio-strategy

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/coalition-and-portfolio-strategy",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:434a4a360c4d7fd4",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Same-region score 1+0 ties out-of-region score 0+1, so a capacity tie-break can choose the out-of-region peer.",
    "A three-year award exceeding one year's revenue need not exceed annual delivery capacity; comparing totals without duration misstates exposure.",
    "Allocating 100 percent to members then adding a 10 percent administration share requests 110 percent of the same award."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/matching-and-intelligence/coalition-and-portfolio-strategy",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://rea.ec.europa.eu/horizon-europe-grants-reporting_en",
      "scope": "Opened official page lists multiple beneficiaries with rights/obligations in the grant agreement and coordinator reporting responsibilities; demonstrates program-specific roles rather than universal single-recipient assumptions."
    },
    {
      "url": "https://erasmus-plus.ec.europa.eu/programme-guide/part-c/after-approval",
      "scope": "Official search excerpt distinguishes mono- and multi-beneficiary agreements; no live grant eligibility or legal advice assessment performed."
    }
  ],
  "documents": {
    "coalition-and-portfolio-strategy.md": {
      "disposition": "reverify",
      "reason": "Coalition feasibility and portfolio capacity are useful distinct questions. Award-to-revenue is not universal eligibility, partner structure can change several gates, and summing revenue does not prove delivery capacity. Lead liability and subaward form depend on the program. Barbell outperformance, tenfold rates and consortium advantage require comparable outcome evidence; requirement gaps depend on which member must satisfy each rule."
    },
    "techniques/capacity-floor-detection.md": {
      "disposition": "clarify",
      "reason": "Repaired capacity heuristic as hard eligibility gate and unknown bound as known zero/unlimited. Compares time/currency/payment basis, preserves unknowns and evaluates coalition rules rather than promising capacity is uniquely curable by partnership."
    },
    "techniques/complementarity-scoring.md": {
      "disposition": "reverify",
      "reason": "sameRegion plus a 0-1 fraction permits a tie, not strict dominance; hard requirements need filtering. Candidate-only novelty does not measure relevant incremental coalition coverage and must be recomputed after additions. Greedy ranking does not guarantee minimum membership, redundant delivery can be valuable, and missing capabilities are unknown rather than proven zero. Coalitions may be required even when solo revenue clears a floor."
    },
    "techniques/lead-applicant-selection.md": {
      "disposition": "clarify",
      "reason": "Repaired universal single-recipient/full-liability and largest-revenue lead default. Requires current program roles, agreement, eligibility and demonstrated administrative/liquidity capacity, with explicit partner consent and permitted costs."
    },
    "techniques/portfolio-balance-across-difficulty.md": {
      "disposition": "reverify",
      "reason": "Barbell superiority and cutting the middle first are unsupported universal strategy. Gross award times estimated probability is not unrestricted net value; account for restrictions, cofunding, timing, dependencies and delivery burden. Small samples can inform uncertainty without claiming precision, and high pooled program rates need not predict this applicant's chances."
    },
    "techniques/proportional-subgrant-split.md": {
      "disposition": "clarify",
      "reason": "Repaired revenue-proportional allocation as capacity guarantee and admin allocation on top of a fully allocated pot. Starts from eligible scoped work, preserves total budget, clarifies rounding, comparable figures and program-specific agreements."
    },
    "techniques/requirement-profile-aggregation.md": {
      "disposition": "reverify",
      "reason": "Preserve required versus optional modality, negation, dates and applicability before normalization. Per-analysis dedupe is not per-independent-application dedupe; repeated org analyses of one call inflate frequency. No finite high-share history proves always, missing extraction is not absence, and a 990 is not interchangeable with financial statements. Untrusted source text must be isolated/escaped rather than merely stripped."
    },
    "applications/node--complementarity-scoring.md": {
      "disposition": "reverify",
      "reason": "Historical grant-writing-nonprofits code, funder signal and verification date were not rerun. Score ties defeat strict regional dominance; greedy novelty order is not smallest coalition. Combined revenue and rounded shares do not establish legal eligibility or spend capacity. The 4-to-1 coalition signal has no primary evidence supplied here; proposed consent and lead acceptance require actual records."
    },
    "applications/node--requirement-profile-aggregation.md": {
      "disposition": "reverify",
      "reason": "Historical Node implementation and verification date were not rerun. The displayed regex strips only one leading imperative and can merge must versus should; per-analysis counting can overweight one solicitation. First-seen text can be a poor representative and localeCompare depends on locale/runtime for reproducibility. Profile shares are historical sampled observations, not binding checklist rules."
    }
  }
}
```

### 2026-09-10 — architecture re-review after the compression revert

I read all nine documents at their restored bytes. The record above no longer
matches the tree (digest 434a4a360c4d7fd4 versus 57e9ab887c9fac22); its
"3 document(s) repaired" describes edits the revert removed.

The clearest finding is an arithmetic claim that is simply false, asserted in
two places. complementarity-scoring says the ranking adds "a binary same-region
indicator ... to the complementarity fraction, so a same-region complementary
partner outranks an out-of-region one at any complementarity level", and the
Node application restates it as "region strictly dominates". Complementarity is
defined as a fraction of the candidate's terms that are new, so its maximum is
exactly 1.0 — reached whenever every one of a candidate's capabilities is new
to the applicant, which is the technique's own headline example ("a small
focused organization whose three capabilities are all new scores 1.0"). A
same-region candidate that adds nothing scores 1 + 0; that fully novel
out-of-region candidate scores 0 + 1. They tie, and the documented tie-break is
capacity, so the out-of-region peer wins whenever it is larger. Strict
dominance would need the sameness term to exceed the complementarity term's
supremum, which 1 does not. This is worth fixing precisely because the
technique's whole sameness argument — coherence is what makes breadth fundable
— is right; only the weight is wrong.

Second, an allocation that can exceed the pot. proportional-subgrant-split's
negotiation sequence is: anchor with shares summing to one, adjust for scope,
then "add the lead's administrative allocation on top of its programmatic
share". lead-applicant-selection repeats it: "an administrative allocation on
top of the proportional split is standard practice". If the proportional anchor
already distributes the whole award, an administrative allocation added
afterwards allocates more than 100 percent of it. The intended practice — carve
the administrative allocation off the top, then proportion the remainder — is a
different arithmetic and is not what either document says. Both are otherwise
strong on the thing that matters most here, which is that the split is written
and signed before submission.

Third, lead-applicant-selection generalizes one regime's structure. "In nearly
every funding regime the lead organization is legally and fiscally accountable
for the entire award — for the appropriate expenditure of funds by every
member" describes a US pass-through prime accurately. In an EU multi-beneficiary
grant every beneficiary is a party to the grant agreement carrying its own
rights and obligations, and the coordinator acts on behalf of the consortium
rather than absorbing its members' expenditure liability. The document's own
"when not to use" already handles funder-prescribed lead types; what it does
not handle is that the accountability model itself is regime-dependent. I read
the Research Executive Agency's coordinator page for this and it confirmed the
consortium-representative framing and that the grant agreement lists all
beneficiaries with rights and obligations, but it did not state the liability
allocation directly — the annotated model grant agreement would settle it, and
I did not read it.

Fourth, the golden path's "A barbell ... outperforms a slate clustered in the
middle" is stated as a result. The technique it points to is more careful, and
calls the same shape "a defensible starting shape". No comparative outcome
evidence appears anywhere in the subject, and the corpus's own
small-samples-stay-silent law is the reason to be suspicious of one. The
technique should keep its hedge and the golden path should adopt it.

Fifth, capacity-floor-detection hard-fails on a proxy it repeatedly calls a
heuristic, and its own "when not to use" lists whole classes of organization
for which the proxy answers a question nobody asked. This is the same
contradiction I recorded today against grant-funding/eligibility-analysis, where
hard-gate-vs-soft-score states that heuristics return pass or unknown and never
fail while award-size-capacity-fit calls the capacity ceiling "the only fail".
The two subjects agree with each other and both disagree with the evidence-class
rule; whichever way it is resolved, it should be resolved in one place.

One observation rather than a finding: capacity-floor-detection and
eligibility-analysis's award-size-capacity-fit restate the same floor-defaults-
to-zero, ceiling-defaults-to-unbounded rule and the same 5-40 percent band. I am
not proposing a merge — each has a distinct load-bearing move, and this one's is
the conversion of the fail into a coalition lead with the floor attached — but a
future editor changing the band should know it is stated twice.

I retract two of the earlier record's charges. requirement-profile-aggregation
does not confuse per-analysis with per-application dedupe in a way that inflates
frequency; it states the cap and its reason explicitly and the module implements
it. And it does not treat untrusted extraction text as instructions; the
untrusted-text-is-data law is cited and the boundary handling is named.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/coalition-and-portfolio-strategy",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:57e9ab887c9fac22",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read in full at restored bytes. The complementarity dominance claim was checked by arithmetic against the technique's own definition and its own worked example. Consulted one EU primary page on the coordinator role. Not evaluated: the grant-writing-nonprofits repo at runtime, the wellspring-index intelligence dataset, the Horizon Europe annotated model grant agreement, US Uniform Guidance subrecipient provisions, and the verified_on dates of both applications, which are left unchanged.",
  "counterexamples": [
    "A same-region peer whose capabilities all duplicate the applicant's scores 1 + 0; a fully novel out-of-region peer scores 0 + 1. They tie, and the capacity tie-break hands the slot to whichever is larger — so the 'strictly dominates' claim fails on the technique's own example.",
    "A three-member coalition splits 100 percent of the award by revenue, then adds a 10 percent administrative allocation to the lead's share as the sequence instructs: the budget now requests 110 percent of the award.",
    "An EU multi-beneficiary consortium: each beneficiary signs the grant agreement and carries its own obligations, so 'the lead is fiscally accountable for every member's spending' misdescribes the structure the coalition is actually forming.",
    "A fiscally sponsored project with a large pass-through budget and small recorded revenue is hard-failed by the capacity gate that the same document's 'when not to use' section says should not run on it."
  ],
  "sources": [
    {
      "url": "https://rea.ec.europa.eu/horizon-europe-grants-reporting_en",
      "result": "Confirmed the coordinator 'acts on behalf of the consortium' and that the grant agreement lists the beneficiaries and specifies all rights and obligations, i.e. a representative role over a multi-party agreement. Did NOT state how expenditure liability is allocated between coordinator and beneficiaries; the annotated model grant agreement would settle that and was not read."
    }
  ],
  "documents": {
    "coalition-and-portfolio-strategy.md": {
      "disposition": "clarify",
      "reason": "The composable-and-rivalrous framing, the four-step ordering argument, and the insistence that a short coalition never be dressed as reachable are the best things in the subject. One overreach: 'a barbell ... outperforms a slate clustered in the middle' asserts a comparative result the subject has no evidence for, and states it more strongly than the technique it links to."
    },
    "techniques/capacity-floor-detection.md": {
      "disposition": "clarify",
      "reason": "The conversion rule and its strict non-converting boundary list (type, geography, deadline, mission fit) are excellent and specific. But it hard-fails on annual revenue while calling revenue 'the working proxy' and 'a heuristic', and its own exclusion list names organization classes for which the proxy is meaningless. Same contradiction recorded today in eligibility-analysis; resolve once, not twice."
    },
    "techniques/complementarity-scoring.md": {
      "disposition": "clarify",
      "reason": "The additive-not-similar denominator argument, the empty-set-scores-zero rule, the smallest-coalition stopping rule and the consenting-pool precondition are all correct. The claim that a binary sameness term makes a same-region partner outrank an out-of-region one 'at any complementarity level' is false: the complementarity fraction reaches exactly 1.0, so the two tie and the capacity tie-break decides."
    },
    "techniques/lead-applicant-selection.md": {
      "disposition": "clarify",
      "reason": "The capacity-carries default with audit history and funder relationship as refinements, eligibility gates as veto, and decide-before-drafting are all well argued. Two boundary problems: 'nearly every funding regime' overstates a US pass-through structure that does not describe an EU multi-beneficiary agreement, and 'an administrative allocation on top of the proportional split' allocates past 100 percent of the award unless it is carved off first."
    },
    "techniques/portfolio-balance-across-difficulty.md": {
      "disposition": "keep",
      "reason": "Per-program rather than per-funder difficulty, suppression of thin-sample rates, bracket-segmented odds, the capacity budget as a hard constraint, and the explicit suspicion of every term in the expected-value product are all correctly hedged. It calls the barbell 'a defensible starting shape', which is the right strength; the golden path is the document that overstates it."
    },
    "techniques/proportional-subgrant-split.md": {
      "disposition": "clarify",
      "reason": "Verifiability, absorption and symmetry-with-the-capacity-story are three good reasons for the revenue anchor, and the anchor-not-verdict framing with recorded deviations is the heart of the technique. Step 3 of the negotiation sequence adds the administrative allocation on top of a split that already sums to the whole award; the arithmetic needs the carve-out stated."
    },
    "techniques/requirement-profile-aggregation.md": {
      "disposition": "keep",
      "reason": "Normalization with a preserved display form, the explicitly stated lexical ceiling, per-application presence counting with its reason, the published denominator, and the thin-profile presentation rule are each sound and correctly bounded. The earlier record's dedupe and untrusted-text charges are not supported by the text and are retracted."
    },
    "applications/node--complementarity-scoring.md": {
      "disposition": "clarify",
      "reason": "A dense and honest field record: it carries the floor/ceiling incident comment, the honest-null revenue branch, the greedy stopping rule and an explicitly flagged deviation on the sameness axis. It repeats the false 'region strictly dominates' claim as if the code proved it, and it sources the 4-to-1 consortium signal to an internal intelligence dataset row rather than to a funder publication, which is worth saying where the golden path leans on that signal. Historical code and verified_on 2026-08-19 preserved; not rerun."
    },
    "applications/node--requirement-profile-aggregation.md": {
      "disposition": "clarify",
      "reason": "Unusually good practice: its 'where the standard exceeds the module' section names two consumer obligations the type system does not enforce. One narrow correction — a bare localeCompare with no locale or options argument is locale- and implementation-dependent, so describing it as a deterministic tie-break is not quite right, and reproducibility across environments needs an explicit locale or a plain code-unit comparison. Historical implementation and date not rerun."
    }
  }
}
```

### 2026-10-11 - `/intake apply`, capacity-floor-detection (run `intake-apply-capfloor-1010`)

The attention scan's single-stack finding (node only) dispatched this run. No registered project
declares this bundle. The one tree that implements it is `grant`, which is checked out only on
the other machine, so I read a fresh clone of its remote. The stack is still node. This run adds
the technique's first application and does not change the single-stack point.

I chose the seam to falsify the technique. The tree already had the gate, the floor/ceiling
asymmetry, the honest unknown and the forward pointer. A caught outcome would have made the
technique's strict conversion boundary moot. It did not. The pointer was written inside the
capacity check's own fail message, so it rode on every capacity fail. Because capacity sorts
ahead of deadline, it also became the headline screen-out reason on closed and foreign grants.

`code`, `better`, ab-paired over a 16-case cross-product. Capacity fails that showed the pointer
beside another fail went from 7 of 8 to 0. Floor: no status and no first-hard-fail key changed,
the sole-capacity pointer was kept, and the project's gate was green. Shipped as `849f03d` +
`a1e95cb` on the project's origin main.

**Boundary added to the technique.** Attach the pointer after every check has run. "Hard"
means *structural*, not *vetoes this system's verdict*: the tree keeps geography soft, but its
only geography fail is a foreign national programme, which no partner cures.

**Open, with return conditions.**
- **The coalition module has no production caller.** The shipped conversion is copy. **Return:**
  when a caller lands, gate it on the same sole-fail predicate.
- **Duration-blind capacity.** The tree has no award period, which was the earlier review's
  counterexample. **Return:** when ingested awards carry a period, compare an annualized floor.
- **The hard-fail-on-a-proxy contradiction** recorded by the 2026-09-10 re-review is untouched.
  This run tested the conversion, not the gate's evidence class.
- **The repository is private.** The application describes the seam without paths. The older
  `node--complementarity-scoring` application cites line ranges in the same eligibility module,
  and those ranges have since drifted.

### 2026-10-31 - architecture re-review (stale after four new applications)

The subject went stale because four applications landed after the 2026-09-10 record.
I read all thirteen documents. None of the five clarify items that record named has
been applied: the barbell "outperforms", the complementarity "at any complementarity
level", the two "on top of" administrative allocations and the "nearly every funding
regime" lead liability are all still in the text. The four new applications are
careful, falsification-shaped records and their figures recompute.

The open question from 2026-09-10, how EU liability is allocated, is now settled from
the Annotated Grant Agreement itself. It is not one rule: outside Horizon Europe the
coordinator is fully liable for the whole recovery at balance; inside Horizon Europe
(the Mutual Insurance Mechanism) each beneficiary is in principle liable for its own
debt. So the earlier record's framing ("the coordinator acts on behalf of the
consortium rather than absorbing its members' expenditure liability") was right for
Horizon Europe and wrong as a statement about EU grants generally. I narrow it here.

The capacity-floor hard-fail-on-a-proxy contradiction stays owed. It is the same
question as eligibility-analysis's award-size-capacity-fit versus
hard-gate-vs-soft-score, and should be settled once, by whoever owns both subjects.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/coalition-and-portfolio-strategy",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:ec06b242b68b93f5",
  "disposition": "clarify",
  "coverage": "All 13 current documents read in full, including the four applications added since the 2026-09-10 record (capacity-floor-detection 2026-10-11, lead-applicant-selection 2026-10-13, portfolio-balance-across-difficulty and proportional-subgrant-split 2026-10-14). Their reported ratios were recomputed (497/756 = 66 percent, 305/798 = 38 percent, 7.55 to 8.41 million = +11 percent, 136/500 = 27 percent). The complementarity tie and the administrative over-allocation were re-derived by arithmetic. One primary source opened on lead liability (EU Annotated Grant Agreement V2.0, 2025-04-01) and one on localeCompare (MDN). Not evaluated: the private grant tree at runtime, the internal intelligence dataset behind the 4-to-1 consortium signal, US Uniform Guidance subrecipient provisions. No verification date refreshed.",
  "counterexamples": [
    "A same-region peer whose capabilities all duplicate the applicant's scores 1 + 0; a fully novel out-of-region peer scores 0 + 1. They tie and the capacity tie-break decides (carried from 2026-09-10, still in the text).",
    "Three members split 100 percent by revenue, then the lead's 10 percent administrative allocation is added on top: the budget requests 110 percent of the award (carried, still in the text).",
    "A Horizon Europe coordinator is not liable for the whole recovery at final payment; each beneficiary's liability is in principle limited to its own debt. In an EU programme without the Mutual Insurance Mechanism the coordinator IS fully liable at balance. 'Nearly every regime' fits neither description of the EU case as one rule.",
    "A fiscally sponsored project with a large pass-through budget and small recorded revenue is hard-failed by the capacity gate that the same document's 'when not to use' says should not run on it (carried, unresolved)."
  ],
  "sources": [
    {
      "url": "https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/common/guidance/aga_en.pdf",
      "result": "Read V2.0 (2025-04-01). Quoted: 'For programmes without MIM (all programmes except HE): At the payment of the balance, the coordinator is fully liable for the whole amount that needs to be recovered' and 'For programmes with MIM (HE only): The coordinator is not fully liable for the whole amount that needs to be recovered; each beneficiary's financial liability is in principle limited to their own debt'. Supports making lead liability regime-dependent; settles the question the 2026-09-10 record left open."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare",
      "result": "Quoted: 'In implementations without Intl.Collator support, this parameter is ignored and the host's locale is usually used'; with Intl support the parameters are the Intl.Collator constructor's. A bare localeCompare depends on the runtime's locale, so it is deterministic per environment, not across environments."
    },
    {
      "path": "knowledge/grant-funding/matching-and-intelligence/coalition-and-portfolio-strategy",
      "result": "All 13 documents read; arithmetic re-derived on paper. No code executed."
    }
  ],
  "documents": {
    "coalition-and-portfolio-strategy.md": {
      "disposition": "clarify",
      "reason": "Still owed from 2026-09-10: 'a barbell ... outperforms a slate clustered in the middle' states a result the technique itself only calls 'a defensible starting shape'. New this run: step 3 says the lead is 'fiscally accountable for every member's spending', which the EU AGA contradicts for Horizon Europe; and 'some programs are documented to favor consortia heavily' rests in this subject on one internal intelligence-dataset row, not a funder publication."
    },
    "techniques/capacity-floor-detection.md": {
      "disposition": "clarify",
      "reason": "Still owed: hard-fails on annual revenue while calling it 'the working proxy' and 'a heuristic', contradicting the evidence-class rule in eligibility-analysis/hard-gate-vs-soft-score. The 2026-10-11 boundary paragraph (attach the pointer after every check; 'hard' means structural) is sound and backed by its application. Resolving the proxy question is a cross-subject design decision, not a wording fix."
    },
    "techniques/complementarity-scoring.md": {
      "disposition": "clarify",
      "reason": "Still owed: 'outranks an out-of-region one at any complementarity level' is false; complementarity reaches exactly 1.0, so 1 + 0 ties 0 + 1 and the capacity tie-break decides."
    },
    "techniques/lead-applicant-selection.md": {
      "disposition": "clarify",
      "reason": "Still owed, now settled by the AGA: 'in nearly every funding regime the lead ... is accountable for the entire award' is regime-dependent (US pass-through prime yes; EU non-MIM coordinator first-line at balance; Horizon Europe each beneficiary for its own debt). Also still owed: 'an administrative allocation on top of the proportional split' allocates past 100 percent unless carved off first."
    },
    "techniques/portfolio-balance-across-difficulty.md": {
      "disposition": "keep",
      "reason": "Correctly hedged. The median-of-measured-rates rule added from its application is consistent with small-samples-stay-silent and is backed by a paired test."
    },
    "techniques/proportional-subgrant-split.md": {
      "disposition": "clarify",
      "reason": "Still owed: step 3 adds the administrative allocation on top of a split that already sums to the whole award. The largest-remainder rule added since is correct and its 'more than a quarter' matches 136 of 500."
    },
    "techniques/requirement-profile-aggregation.md": {
      "disposition": "keep",
      "reason": "Unchanged since 2026-09-10; that record's keep stands."
    },
    "applications/node--capacity-floor-detection.md": {
      "disposition": "keep",
      "reason": "A falsification-shaped field record: constructed 16-case matrix, stated floor, and an honest 'what this cannot do' (no production caller, duration-blind, no route for fiscally sponsored forms). Private tree, so not re-checked; verified_on unchanged."
    },
    "applications/node--complementarity-scoring.md": {
      "disposition": "clarify",
      "reason": "Still owed: repeats 'region strictly dominates', which the arithmetic refutes (tie at complementarity 1.0). Its line citations into the eligibility module have drifted per the 2026-10-11 note; that is reverify work the Director may want, not something this run could check."
    },
    "applications/node--lead-applicant-selection.md": {
      "disposition": "keep",
      "reason": "Constructed 48-case matrix, explicitly not a rate; the canLead veto implements the technique's eligibility-gate rule and the null-lead output is honest. Not re-run."
    },
    "applications/node--portfolio-balance-across-difficulty.md": {
      "disposition": "keep",
      "reason": "Ratios recompute (497/756, 305/798, +11 percent); assumptions behind the dollar comparison are stated. Not re-run."
    },
    "applications/node--proportional-subgrant-split.md": {
      "disposition": "keep",
      "reason": "136 of 500 recomputes to the technique's 'more than a quarter'; equal thirds 34/33/33 is the correct largest-remainder output."
    },
    "applications/node--requirement-profile-aggregation.md": {
      "disposition": "clarify",
      "reason": "Still owed: calls a bare localeCompare a deterministic tie-break; MDN confirms the default depends on the host locale, so it is deterministic within one environment only."
    }
  }
}
```

### 2026-10-31 - clarify applied

Applied six of the seven clarify items the record above names. The one left is capacity-floor-detection's hard fail on a revenue proxy: settling it is a design decision shared with eligibility-analysis/award-size-capacity-fit, and the overall disposition stays clarify for it.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/coalition-and-portfolio-strategy",
  "date": "2026-10-31",
  "baseline": "3f7e1dfbc",
  "digest": "sha256-b2:8b725ba66db5fb5f",
  "disposition": "clarify",
  "coverage": "All 13 documents decided. Six clarify items applied and the edited passages re-read; the arithmetic changes were re-derived and the liability change rests on the EU AGA V2.0 opened this run. Other documents are byte-unchanged and keep their dispositions. No verification date changed.",
  "counterexamples": [
    "A same-region peer whose capabilities all duplicate the applicant's scores 1 + 0; a fully novel out-of-region peer scores 0 + 1. They tie and the capacity tie-break decides (carried from 2026-09-10, still in the text).",
    "Three members split 100 percent by revenue, then the lead's 10 percent administrative allocation is added on top: the budget requests 110 percent of the award (carried, still in the text).",
    "A Horizon Europe coordinator is not liable for the whole recovery at final payment; each beneficiary's liability is in principle limited to its own debt. In an EU programme without the Mutual Insurance Mechanism the coordinator IS fully liable at balance. 'Nearly every regime' fits neither description of the EU case as one rule.",
    "A fiscally sponsored project with a large pass-through budget and small recorded revenue is hard-failed by the capacity gate that the same document's 'when not to use' says should not run on it (carried, unresolved)."
  ],
  "sources": [
    {
      "url": "https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/common/guidance/aga_en.pdf",
      "result": "Read V2.0 (2025-04-01). Quoted: 'For programmes without MIM (all programmes except HE): At the payment of the balance, the coordinator is fully liable for the whole amount that needs to be recovered' and 'For programmes with MIM (HE only): The coordinator is not fully liable for the whole amount that needs to be recovered; each beneficiary's financial liability is in principle limited to their own debt'. Supports making lead liability regime-dependent; settles the question the 2026-09-10 record left open."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare",
      "result": "Quoted: 'In implementations without Intl.Collator support, this parameter is ignored and the host's locale is usually used'; with Intl support the parameters are the Intl.Collator constructor's. A bare localeCompare depends on the runtime's locale, so it is deterministic per environment, not across environments."
    },
    {
      "path": "knowledge/grant-funding/matching-and-intelligence/coalition-and-portfolio-strategy",
      "result": "All 13 documents read; arithmetic re-derived on paper. No code executed."
    }
  ],
  "documents": {
    "coalition-and-portfolio-strategy.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: barbell restated as 'a defensible starting shape' (matching the technique); step 3 lead liability made regime-dependent per the EU AGA; 'documented to favor consortia' softened to 'signal a heavy preference', since the only evidence in the subject is an internal dataset row."
    },
    "techniques/capacity-floor-detection.md": {
      "disposition": "clarify",
      "reason": "Still owed: hard-fails on annual revenue while calling it 'the working proxy' and 'a heuristic', contradicting the evidence-class rule in eligibility-analysis/hard-gate-vs-soft-score. The 2026-10-11 boundary paragraph (attach the pointer after every check; 'hard' means structural) is sound and backed by its application. Resolving the proxy question is a cross-subject design decision, not a wording fix."
    },
    "techniques/complementarity-scoring.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'outranks ... at any complementarity level' replaced by the 1 + 0 = 0 + 1 tie, the capacity tie-break, and how to make the constraint strict (weight above 1, or filter first)."
    },
    "techniques/lead-applicant-selection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'nearly every funding regime' narrowed to pass-through structures such as a US prime, with the AGA's non-MIM versus Horizon Europe liability split added; administrative allocation now carved off the award before the split instead of added on top."
    },
    "techniques/portfolio-balance-across-difficulty.md": {
      "disposition": "keep",
      "reason": "Correctly hedged. The median-of-measured-rates rule added from its application is consistent with small-samples-stay-silent and is backed by a paired test."
    },
    "techniques/proportional-subgrant-split.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: negotiation sequence reordered: carve the administrative allocation off first and anchor the split on the remainder, then adjust for scope, reconcile to exactly the award, record."
    },
    "techniques/requirement-profile-aggregation.md": {
      "disposition": "keep",
      "reason": "Unchanged since 2026-09-10; that record's keep stands."
    },
    "applications/node--capacity-floor-detection.md": {
      "disposition": "keep",
      "reason": "A falsification-shaped field record: constructed 16-case matrix, stated floor, and an honest 'what this cannot do' (no production caller, duration-blind, no route for fiscally sponsored forms). Private tree, so not re-checked; verified_on unchanged."
    },
    "applications/node--complementarity-scoring.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'region strictly dominates' replaced by the tie at complementarity 1.0 decided by the revenue tie-break. Line-citation drift is still unchecked; verified_on unchanged."
    },
    "applications/node--lead-applicant-selection.md": {
      "disposition": "keep",
      "reason": "Constructed 48-case matrix, explicitly not a rate; the canLead veto implements the technique's eligibility-gate rule and the null-lead output is honest. Not re-run."
    },
    "applications/node--portfolio-balance-across-difficulty.md": {
      "disposition": "keep",
      "reason": "Ratios recompute (497/756, 305/798, +11 percent); assumptions behind the dollar comparison are stated. Not re-run."
    },
    "applications/node--proportional-subgrant-split.md": {
      "disposition": "keep",
      "reason": "136 of 500 recomputes to the technique's 'more than a quarter'; equal thirds 34/33/33 is the correct largest-remainder output."
    },
    "applications/node--requirement-profile-aggregation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: bare localeCompare described as deterministic within one environment (runtime default locale, per MDN), not across environments. verified_on unchanged."
    }
  }
}
```
