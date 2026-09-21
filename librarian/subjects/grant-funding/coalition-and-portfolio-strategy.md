---
domain: grant-funding
subject: coalition-and-portfolio-strategy
last_touched: 2026-09-10
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
