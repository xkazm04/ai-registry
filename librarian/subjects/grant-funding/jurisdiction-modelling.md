---
domain: grant-funding
subject: jurisdiction-modelling
last_touched: 2026-10-22
touched_by: intake
dry_streak: 0
---

# jurisdiction-modelling

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/jurisdiction-modelling",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:46087056a5829103",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A country profile has no code table because ingestion is incomplete, not because every call is governed solely by legal form.",
    "A non-member country is associated with one funding programme but not another.",
    "An uploaded file named audit.pdf contains a draft budget rather than a valid audit."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/grant-operations/jurisdiction-modelling",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/horizon/wp-call/2026-2027/wp-15-general-annexes_horizon-2026-2027_en.pdf",
      "scope": "Previously opened primary annex distinguishes participation, funding eligibility and call-specific conditions; no individual legal eligibility determination."
    },
    {
      "url": "https://www.grants.gov/api/status-codes",
      "scope": "Previously checked official code 25 requires additional eligibility clarification; not an unrestricted default."
    }
  ],
  "documents": {
    "jurisdiction-modelling.md": {
      "disposition": "reverify",
      "reason": "Eligibility includes programme and private-funder conditions, not only legislation. One profile cannot encode all call exceptions through a Boolean. Country of registration, programme participation, service geography and preferred language are distinct; inherited sources are discovery coverage, not universal entitlement."
    },
    "techniques/compliance-document-taxonomy.md": {
      "disposition": "clarify",
      "reason": "Repaired conventional versus mandatory documents, per-authority scope and content validation. Filename matches cannot establish satisfaction and filtering solely to profile defaults can omit a novel call requirement."
    },
    "techniques/eligibility-regime-detection.md": {
      "disposition": "clarify",
      "reason": "Repaired empty-code-table inference and default applicant assumptions; mixed code/prose/legal requirements compose at call level. Shared shape can consistently encode a wrong regime."
    },
    "techniques/entity-type-code-mapping.md": {
      "disposition": "reverify",
      "reason": "Curated mapping is useful but a fully verified enumeration can be supported. Agreement of name inference and self-declaration is not independently verified legal status. Preserve registry facts and mapping versions; code namespaces reflect issuing vocabulary, not necessarily each adapter."
    },
    "techniques/jurisdiction-profile-schema.md": {
      "disposition": "reverify",
      "reason": "Pure data helps testability but cannot prove legal correctness or guarantee all new markets need no code. Boolean grantEligible and a single currency/language lose programme conditions; source keys are not eligible geography. Preserve incumbent behavior only where correct, and record rule dates and source versions."
    },
    "techniques/market-claim-truthfulness.md": {
      "disposition": "reverify",
      "reason": "A supported flag keeps surfaces consistent, not necessarily truthful. Capability-specific current evidence is required, and onboarding registration choices must not be the full programme-market list. Roadmap announcements and waitlist priority are separate product choices; static blurbs can still drift."
    },
    "techniques/supranational-membership-inheritance.md": {
      "disposition": "clarify",
      "reason": "Repaired membership versus programme association, discovery versus eligibility, effective dates and registration-market separation. Supranational programmes need not map to a simple political membership tree."
    },
    "applications/node--jurisdiction-profile-schema.md": {
      "disposition": "reverify",
      "reason": "Historical schema/date retained, not rerun. Code 25 is not unrestricted and legacy nonprofit defaults can misclassify. Empty table does not prove legal-form-only eligibility; pending copy migration and declared-unbuilt verification mean configuration alone does not prove support."
    },
    "applications/node--market-claim-truthfulness.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained. Same list can consistently expose an inappropriate incorporation choice, and static US-only notice already contradicts derived coverage. Supported flag with unbuilt verification needs scoped claims rather than automatic truth; consumers were not executed."
    }
  }
}
```

## Architecture re-review - 2026-09-10 (after the compression revert)

All nine documents read at reverted bytes. **I retract the preceding record's
per-document reasons** as descriptions of the current corpus: they assess a rewritten
document set that was reverted on 2026-09-10.

This is the strongest of the five subjects I hold. Its central move - treat the whole
jurisdiction rule set as configuration, with a level enum that discriminates a body
you apply *through* from a country you incorporate *in* - is argued from consequences
rather than asserted, and the supranational technique earns its place by naming the
specific double-count a country-typed union produces. The market-claim technique is
the rare coverage-honesty doc that closes the loop in both directions (render-time
filtering drops a shipped market from the roadmap; profile derivation keeps an
unshipped one off the coverage band).

Two findings. First, `eligibility-regime-detection` derives the regime structurally -
legal-form when the eligible-code set is empty *and* entity types are listed - and
argues correctly that a structural predicate cannot disagree with the data it
summarizes. But it has only two states, and the shape it reads cannot distinguish "no
funder-side codes exist in this market" from "codes exist and nobody has transcribed
them yet." A half-written code-regime profile is silently classified legal-form and
every applicant in that market is gated on the wrong rule - which is the same class of
silent misroute the technique invokes against a hand-maintained flag. The subject's
own honest-null posture argues for a third answer (undetermined) that routes to the
unsupported surface rather than to a regime. Second,
`node--jurisdiction-profile-schema` describes the US profile as carrying "the
grants.gov applicant-code table (`US_APPLICANT_CODE_LABELS`, codes '00'-'99')" hung
off each entity type. There are two distinct federal enumerations here: SF-424, the
form an applicant actually files, uses letter applicant-type codes (A State
Government, C City or Township Government, M Nonprofit, and so on through W), while
the numeric list is the Grants.gov opportunity-eligibility taxonomy - a funder-side
audience enumeration. `entity-type-code-mapping` closes with precisely this warning:
applicant-side classification and funder-side audience codes "look similar, and
merging them silently collides two unrelated enumerations." The profile hangs the
funder-side numeric codes off the applicant's entity type, which is the merge, or at
least reads as it; the document should name which enumeration it means. The cited
example (a municipality carrying `["00","01","02","04","25","99"]`) turns on whether
"00" denotes state governments in that numeric list, which I could not confirm: the
Grants.gov search page does not render its code table to a fetch, and my searches
returned only the SF-424 letter taxonomy. That specific value is the reverify work.

Sources were read, not exercised; no registry API was called, and the cited repo
(`grant-writing-nonprofits`) is absent from this machine, so both applications' code
citations are unverified rather than confirmed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/jurisdiction-modelling",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:7f85406ebe7d3130",
  "disposition": "clarify",
  "coverage": "All 9 documents read in full at reverted bytes; the regime predicate and the level/inheritance rules were reasoned through against the failure cases each claims to prevent. A source check was attempted on the US federal applicant-code enumerations. NOT evaluated: the grant-writing-nonprofits repo (absent from this machine), so all code and line citations are unverified; no registry API exercised; no legal claim in any profile (Czech, Japanese, UK, EU) independently verified against its national register; no maturity or verified_on change.",
  "counterexamples": [
    "A genuinely code-based market whose profile is half-written - entity types entered, applicant codes not yet transcribed - satisfies 'empty code set and non-empty entity types' and is classified legal-form; the shape predicate cannot separate 'no codes exist here' from 'no codes entered yet'.",
    "A US 501(c)(3) is incorporated under state law and granted its tax status federally; the country-above-region nesting has no place for a status conferred at the national level on a legal form created at the regional one, so 'the region inherits the country's sources and adds its own' does not describe the fact the eligibility gate actually reads.",
    "A programme family operating inside a union (its own calls, own participant identity, own members) is a supranational body whose members are themselves supranational; memberOf points at one level and the model offers no way to express it.",
    "The document taxonomy's 'report the class as not-demanded-by-this-call rather than dropping it' assumes the profile's conventional set is right for every funder in the market; a foreign funder filing into that market demands its own set, and the checklist shows locally conventional classes the call will never ask for."
  ],
  "sources": [
    {"url": "https://www.grants.gov/applicants/applicant-eligibility", "result": "Fetched and searched: returned the SF-424 applicant-type taxonomy as letters A-W (A State Government, C City or Township Government, M Nonprofit, ... W Other). Establishes that two federal enumerations exist and that the applicant-facing one is not numeric; did NOT establish the numeric opportunity-eligibility code list, so the '00' value in the application's municipality example remains unconfirmed."},
    {"path": "knowledge/grant-funding/grant-operations/jurisdiction-modelling", "result": "All 9 documents read at reverted bytes and reasoned against their own named failure modes. No profile's legal content was verified against a national register, and the cited repo was unavailable."}
  ],
  "documents": {
    "jurisdiction-modelling.md": {"disposition": "keep", "reason": "The ownership test ('would a lawyer in another country answer differently'), the four-level enum with supranational as the load-bearing distinction, the structural regime split, and the registry-is-silent-about-everything-else posture are all correct and consistent with the techniques. The failure-mode list names real, specific defects rather than generic risks."},
    "techniques/compliance-document-taxonomy.md": {"disposition": "keep", "reason": "Classes-not-translations is the right insight and is demonstrated with document families that genuinely do not exist across markets. The recognition rules (local-language needles, diacritic-insensitive filename hints, per-market labels) and the four-state report - required, demanded, satisfied, unmatched - keep 'satisfied' distinguishable from 'we could not tell'."},
    "techniques/eligibility-regime-detection.md": {"disposition": "clarify", "reason": "The structural predicate is right to prefer shape over a hand-maintained flag, but it is two-valued over a three-valued reality: an unfinished code-regime profile (entity types present, codes not yet transcribed) is indistinguishable from a genuine legal-form market and silently gates every applicant there on the wrong rule. Add an undetermined state that routes to the unsupported surface, per this subject's own honest-null posture."},
    "techniques/entity-type-code-mapping.md": {"disposition": "keep", "reason": "Curated-subset-never-the-full-enumeration, the lower inference tier with specific-before-general pattern ordering, matching against the registered rather than user-supplied name, the three-way reconciliation with the self-declared type, and the closing separation of applicant-side from funder-side enumerations are all correct. This is the document the profile application should have been read against."},
    "techniques/jurisdiction-profile-schema.md": {"disposition": "keep", "reason": "The field inventory is discovered rather than invented (excavate-before-abstract), pattern-source-not-compiled-regex and the attestation sentence on each verification source are both non-obvious and load-bearing, and 'ship the market without the dependent feature rather than guessing the field' is the correct resolution of the schema's hardest case."},
    "techniques/market-claim-truthfulness.md": {"disposition": "keep", "reason": "Derivation from the profile set closes drift in both directions, the supported flag is given a real bar with an explicit anti-pattern, the unsupported surface is designed as a product rather than an error, and the countries-only-versus-full-list forced choice is exactly the discrimination the level enum exists to enable."},
    "techniques/supranational-membership-inheritance.md": {"disposition": "keep", "reason": "Membership declared on the member, merge at resolution, single-homed corpus, and the body still directly onboardable are four rules that together produce the claimed behaviour, and the 'do not model it as a parent country' rule is argued from what parent nesting would imply rather than by assertion."},
    "applications/node--jurisdiction-profile-schema.md": {"disposition": "reverify", "reason": "Describes the US profile as hanging 'the grants.gov applicant-code table, codes 00-99' off each entity type, but the enumeration a US applicant files under (SF-424) is lettered A-W, while the numeric list is the funder-side opportunity-eligibility taxonomy - the exact two-table collision entity-type-code-mapping warns against. Name the enumeration. The municipality example including '00' additionally depends on whether that code denotes state governments, which I could not confirm from a primary source this run; that is the unresolved evidence. The CZ/JP contrast profiles and the shape-derived predicate are otherwise a good demonstration."},
    "applications/node--market-claim-truthfulness.md": {"disposition": "keep", "reason": "Reports the derived-list pipeline, the two list functions with their call-site rule, and the EU level incident faithfully, and names its own live deviation (the notice's statically written market name) rather than hiding it - which is what an application is for. Repo unavailable this run, so line citations are unverified rather than confirmed."}
  }
}
```

## Intake apply - 2026-10-22 (run intake-apply-etcm-1022)

Dispatched from the attention scan ("single stack (node)"). The subject's only consumer is a
node tree, so the stack count is unmoved; the run applied the one technique with no
`applied.md` row instead.

- `entity-type-code-mapping`: first application, `code` / `better`. The curated subset, the
  null-as-unconfirmed rule and the three-way reconciliation were already met in the tree.
  The broken rule was the last one, key the map by registry: the verify step resolved every
  source's code through the one Czech map, so a declared-but-unbuilt registry (two more in
  the Czech profile, two in the UK one) would have borrowed it. A/B over 13 real cases:
  correct 8 to 13, out-of-profile suggestions 3 to 0, ARES and IRS cases unchanged. Still
  unbuilt: the unmapped-code log the technique calls the curation queue.
- No technique edit. The finding is a boundary the technique already states; the application
  records the one non-obvious form of it, a resolver passed as a function that receives the
  code without its source.

## Intake apply - 2026-10-22 (run intake-apply-smi-1022)

Dispatched from the attention scan ("single stack (node)"). The subject still has one node
consumer, so the stack count stays where it was. This run applied the next technique with no
`applied.md` row.

- `supranational-membership-inheritance`: first application, `code` / `better`. Membership
  inheritance was built in the tree: declared on the member, merged at resolution, one corpus,
  and the body can be onboarded directly. The level was not built. The EU was typed as a
  country, with a comment calling the supranational level optional polish. The level and the
  countries-only list existed only on an unmerged work-in-progress branch. A/B: countries
  covered went from 4 to 3. The onboarding sentence stopped naming the EU beside a member that
  inherits it. The floor held.
- Technique amended with one decision rule. A retrofit must make every dispatch on level
  exhaustive in the same change. The tree's one level reader sent the new level to its
  `local` default and still type-checked.
- Currency note on `node--market-claim-truthfulness`: it cites the supranational level and the
  countries-only list as present. The default branch did not carry them until this run's
  commit. Its line citations should be re-resolved at the next reverify. Its date was left
  unchanged, because this run did not re-check that document's other claims.
- Open, not this technique's rule: a member's per-market count of inherited calls, and
  programme association for a non-member (the UK and Horizon-family programmes). The
  architecture review's second counterexample still stands.

## Architecture re-review - 2026-10-31

Stale since four applications landed (compliance-document-taxonomy, eligibility-regime-detection,
entity-type-code-mapping, supranational-membership-inheritance) and two techniques gained one
rule each. Read all thirteen documents.

The reverify owed on `node--jurisdiction-profile-schema` now has its evidence. The
Grants.gov XML-extract help page lists the numeric EligibleApplicants table: "00 = State
governments", "01 = County governments", "02 = City or township governments", "04 =
Special district governments", "05 = Independent school districts", "25 = Others ...", "99
= Unrestricted". So the profile's codes "00"-"99" are the funder-side opportunity-eligibility
enumeration and not the applicant's SF-424 type. The application's municipality example
(`["00","01","02","04","25","99"]`) lets a municipality match opportunities restricted to
state or county governments. The document should name the enumeration and state that
breadth. Whether the breadth is intended cannot be settled without the repository.

The eligibility-regime clarify (two-valued predicate over a three-valued reality) is still
owed. I am narrowing the 2026-09-10 prescription. A shape predicate cannot add an
"undetermined" state, because a half-written code-regime profile and a genuine legal-form
profile have the same shape. The guard belongs to the declaration both documents already
carry, `supported`. The 2026-10-14 application adds a second item for the same technique:
"audit every consumer" should include consumers that re-derive part of the predicate,
pinned by a registry-wide equality test.

A new inconsistency between applications: `node--market-claim-truthfulness` (verified
2026-08-19) cites `level: "supranational"` in the EU profile and a countries-only list as
present, while `node--supranational-membership-inheritance` (2026-10-22) reports that the
default branch typed the EU as a country until that run's commit. The intake note already
flagged this. The repository is needed to settle which branch the earlier record read.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/jurisdiction-modelling",
  "date": "2026-10-31",
  "baseline": "c283f0c50",
  "digest": "sha256-b2:050abc894f0eedeb",
  "disposition": "clarify",
  "coverage": "All 13 documents read in full; the federal numeric eligibility table read at the publisher's page; applications cross-read against each other. Not evaluated: the private grant repository (all code citations and measurements are dated records); no national register's legal content verified; no verified_on or maturity change.",
  "counterexamples": [
    "A half-written code-regime profile (entity types entered, codes not yet transcribed) has the legal-form shape; only a declaration, not the shape, can keep it off the live gate.",
    "A consumer that re-derives half the regime predicate agrees with the shared one on every real profile and diverges on a codeless, entity-type-less profile (measured 2026-10-14).",
    "A municipality carrying federal code 00 (State governments) matches an opportunity restricted to states.",
    "A UK entity eligible for some EU programmes as an associated country: memberOf cannot say 'this programme family, not that one'."
  ],
  "sources": [
    {"url": "https://grants.gov/help/xml-extract/", "result": "EligibleApplicants numeric table: 00 State governments, 01 County governments, 02 City or township governments, 04 Special district governments, 05 Independent school districts, 25 Others, 99 Unrestricted. Confirms the profile's numeric table is the funder-side opportunity-eligibility enumeration and resolves the '00' reverify."},
    {"url": "https://www.grants.gov/applicants/applicant-eligibility", "result": "Carried from 2026-09-10 (SF-424 letter taxonomy A-W); not re-fetched."}
  ],
  "documents": {
    "jurisdiction-modelling.md": {"disposition": "keep", "reason": "Ownership test, level enum, structural regime split and registry-silence posture remain correct and consistent with the techniques."},
    "techniques/compliance-document-taxonomy.md": {"disposition": "keep", "reason": "Gained normalize-the-upload-name, directly witnessed by its 6-of-6 to 0-of-6 application."},
    "techniques/eligibility-regime-detection.md": {"disposition": "clarify", "reason": "Still owed, narrowed: a shape cannot express 'codes not yet transcribed', so a profile's regime must be confirmed before it is supported, and an unconfirmed profile routes to the unsupported surface. Also add from the 2026-10-14 application: audit consumers that re-derive part of the predicate and pin with a registry-wide equality test."},
    "techniques/entity-type-code-mapping.md": {"disposition": "keep", "reason": "Unchanged; its key-the-map-by-registry rule is now field-witnessed (8 to 13 of 13)."},
    "techniques/jurisdiction-profile-schema.md": {"disposition": "keep", "reason": "Unchanged; inventory and procedure stand."},
    "techniques/market-claim-truthfulness.md": {"disposition": "keep", "reason": "Unchanged; derivation and the supported bar stand."},
    "techniques/supranational-membership-inheritance.md": {"disposition": "keep", "reason": "Gained the exhaustive-dispatch retrofit rule, witnessed by the research-scoping fall-through."},
    "applications/node--compliance-document-taxonomy.md": {"disposition": "keep", "reason": "Paired proof with a falsifiable seam and stated limits (one diacritic language, needles untouched)."},
    "applications/node--eligibility-regime-detection.md": {"disposition": "keep", "reason": "Honest that it is a drift pin on a latent divergence; its upward lesson is owed to the technique."},
    "applications/node--entity-type-code-mapping.md": {"disposition": "keep", "reason": "13-case paired instrument; states that no production applicant was misclassified."},
    "applications/node--jurisdiction-profile-schema.md": {"disposition": "clarify", "reason": "Reverify resolved by the publisher's table: name the numeric codes as the funder-side opportunity-eligibility enumeration (not SF-424), and record that the municipality set includes 00 and 01 (state, county). Code citations not re-checked."},
    "applications/node--market-claim-truthfulness.md": {"disposition": "reverify", "reason": "Cites the supranational level and countries-only list as present at 2026-08-19, while the 2026-10-22 application reports the default branch typed the EU as a country until then. Needs the repository to resolve which branch was read."},
    "applications/node--supranational-membership-inheritance.md": {"disposition": "keep", "reason": "Paired proof (4 to 3 countries) with the floor stated and the open seams (per-member counts, programme association) named."}
  }
}
```

### 2026-10-31 - after applying

Applied both clarify items. The market-claim application stays `reverify`: it needs the repository, not a web source. The record below is against the edited bytes.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/jurisdiction-modelling",
  "date": "2026-10-31",
  "baseline": "c283f0c50",
  "digest": "sha256-b2:d336408f3817c213",
  "disposition": "reverify",
  "coverage": "All 13 documents read in full; the federal numeric eligibility table read at the publisher's page; applications cross-read against each other. Not evaluated: the private grant repository (all code citations and measurements are dated records); no national register's legal content verified; no verified_on or maturity change. Phase B applied two clarifies; one reverify left owed.",
  "counterexamples": [
    "A half-written code-regime profile (entity types entered, codes not yet transcribed) has the legal-form shape; only a declaration, not the shape, can keep it off the live gate.",
    "A consumer that re-derives half the regime predicate agrees with the shared one on every real profile and diverges on a codeless, entity-type-less profile (measured 2026-10-14).",
    "A municipality carrying federal code 00 (State governments) matches an opportunity restricted to states.",
    "A UK entity eligible for some EU programmes as an associated country: memberOf cannot say 'this programme family, not that one'."
  ],
  "sources": [
    {
      "url": "https://grants.gov/help/xml-extract/",
      "result": "EligibleApplicants numeric table: 00 State governments, 01 County governments, 02 City or township governments, 04 Special district governments, 05 Independent school districts, 25 Others, 99 Unrestricted. Confirms the profile's numeric table is the funder-side opportunity-eligibility enumeration and resolves the '00' reverify."
    },
    {
      "url": "https://www.grants.gov/applicants/applicant-eligibility",
      "result": "Carried from 2026-09-10 (SF-424 letter taxonomy A-W); not re-fetched."
    }
  ],
  "documents": {
    "jurisdiction-modelling.md": {
      "disposition": "keep",
      "reason": "Ownership test, level enum, structural regime split and registry-silence posture remain correct and consistent with the techniques."
    },
    "techniques/compliance-document-taxonomy.md": {
      "disposition": "keep",
      "reason": "Gained normalize-the-upload-name, directly witnessed by its 6-of-6 to 0-of-6 application."
    },
    "techniques/eligibility-regime-detection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: names the shape's blind spot (no codes vs codes not yet transcribed) and puts the guard on the supported declaration; procedure step 2 now audits partial re-derivations, pinned by a registry-wide equality test."
    },
    "techniques/entity-type-code-mapping.md": {
      "disposition": "keep",
      "reason": "Unchanged; its key-the-map-by-registry rule is now field-witnessed (8 to 13 of 13)."
    },
    "techniques/jurisdiction-profile-schema.md": {
      "disposition": "keep",
      "reason": "Unchanged; inventory and procedure stand."
    },
    "techniques/market-claim-truthfulness.md": {
      "disposition": "keep",
      "reason": "Unchanged; derivation and the supported bar stand."
    },
    "techniques/supranational-membership-inheritance.md": {
      "disposition": "keep",
      "reason": "Gained the exhaustive-dispatch retrofit rule, witnessed by the research-scoping fall-through."
    },
    "applications/node--compliance-document-taxonomy.md": {
      "disposition": "keep",
      "reason": "Paired proof with a falsifiable seam and stated limits (one diacritic language, needles untouched)."
    },
    "applications/node--eligibility-regime-detection.md": {
      "disposition": "keep",
      "reason": "Honest that it is a drift pin on a latent divergence; its upward lesson is owed to the technique."
    },
    "applications/node--entity-type-code-mapping.md": {
      "disposition": "keep",
      "reason": "13-case paired instrument; states that no production applicant was misclassified."
    },
    "applications/node--jurisdiction-profile-schema.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: names the numeric table as the clearinghouse's funder-side opportunity-eligibility enumeration (not the lettered applicant types) and records that the municipality set's 00 and 01 are state and county governments per the publisher's table; code citations and verified_on unchanged."
    },
    "applications/node--market-claim-truthfulness.md": {
      "disposition": "reverify",
      "reason": "Cites the supranational level and countries-only list as present at 2026-08-19, while the 2026-10-22 application reports the default branch typed the EU as a country until then. Needs the repository to resolve which branch was read."
    },
    "applications/node--supranational-membership-inheritance.md": {
      "disposition": "keep",
      "reason": "Paired proof (4 to 3 countries) with the floor stated and the open seams (per-member counts, programme association) named."
    }
  }
}
```
