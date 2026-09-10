---
domain: grant-funding
subject: nonprofit-verification
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# nonprofit-verification

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/nonprofit-verification",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:817194567a2448e9",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Only a clear sanctions name screen returns pass; identity and legal-status checks fail operationally. One-pass aggregation falsely grants eligibility.",
    "An eligible church may not appear in the public exemption dataset.",
    "Claimed name Aid is contained in Global Aid Foundation despite insufficient identity evidence.",
    "Anyone can copy a legitimate public name and identifier, so name equality alone does not authenticate representation."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/grant-operations/nonprofit-verification",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.irs.gov/charities-non-profits/search-for-tax-exempt-organizations",
      "scope": "Official search guidance lists eligible donees that may be absent from Pub. 78."
    },
    {
      "url": "https://ofac.treasury.gov/faqs/5",
      "scope": "Official valid-match guidance requires identity comparison beyond a name hit; no live sanctions screening performed."
    }
  ],
  "documents": {
    "nonprofit-verification.md": {
      "disposition": "reverify",
      "reason": "One pass with all other required checks unavailable does not establish eligibility. Public name/id consistency does not authenticate a representative. Registry absence has coverage exceptions, sanctions candidates need resolution, and pass/decided is not calibrated confidence. Checksum validity does not prove a typo or universal detection."
    },
    "techniques/determinate-vs-inconclusive-outcomes.md": {
      "disposition": "clarify",
      "reason": "Repaired per-claim/source applicability, required-check incompleteness, non-listing exceptions and sanctions review. Inconclusive can prevent a permission decision without accusing the applicant."
    },
    "techniques/graceful-source-degradation.md": {
      "disposition": "reverify",
      "reason": "Unknown registration status is inconclusive, not determinate historical status. Walking arbitrary nested payloads can capture another entity or historical states; validate schema paths and subject binding. Brief error caching/backoff may be appropriate if never presented as a fact. Declared roster must reflect applicable requirements."
    },
    "techniques/identifier-checksum-prevalidation.md": {
      "disposition": "reverify",
      "reason": "Checksum rules detect only specified error classes, not all swaps. Failure may reflect wrong scheme/version rather than proven user typo; preserve leading zeros and only normalize allowed punctuation. Stored identifiers can need revalidation after contract changes or corruption."
    },
    "techniques/registry-adapter-contract.md": {
      "disposition": "reverify",
      "reason": "Shared interfaces need claim scope, requiredness, source version and entity binding, not only per-source pass/fail. Filtering implemented adapters contradicts full roster unless unavailable placeholders are returned. A new source can require a genuine contract extension; one constructor does not prove all callers use it."
    },
    "techniques/registry-name-binding.md": {
      "disposition": "clarify",
      "reason": "Repaired fuzzy matching as candidate evidence, containment weakness, legitimate aliases and the separate representative-authority check."
    },
    "techniques/verification-passport.md": {
      "disposition": "clarify",
      "reason": "Repaired required-evidence coverage, qualified credential claims, checksums versus signatures and freshness/revocation. A pass ratio cannot prove trust and a newest unexpired document is not automatically applicable or trustworthy."
    },
    "applications/node--determinate-vs-inconclusive-outcomes.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained, not rerun. IRS non-listing is not universal failure; active SAM alone or clear name screen can satisfy the unsafe aggregate with identity unknown. Empty ARES status mapped historical fabricates a negative; BMF and annual filings have different scope."
    },
    "applications/node--registry-name-binding.md": {
      "disposition": "reverify",
      "reason": "Historical code/date retained. Containment bypasses larger-set protection, generic legal words can erase identity and first returned name is not necessarily authoritative. A matching public name and id still do not prove the account represents the entity."
    }
  }
}
```

### 2026-09-10 — architecture re-review after the compression revert

I read all nine documents at their restored bytes; the record above no longer
matches the tree (817194567a2448e9 versus d40042c3d47b9670).

This is the strongest-written subject in my group, and it produced the run's
best-evidenced finding, which is a polarity the subject gets wrong by its own
test. determinate-vs-inconclusive-outcomes asks exactly the right question —
"would every legitimate applicant have this record? Only if yes may absence
fail" — and answers it correctly for the annual-filing index and the
federal-contractor roster. For the tax authority's exempt-organization list it
answers yes, making "not found" a determinate fail. The IRS's own Tax Exempt
Organization Search page says the opposite in as many words: "Some donees (i.e.,
churches, group ruling subordinates, and governmental units) eligible to receive
tax-deductible charitable contributions may not be listed in Pub. 78 Data." So
three named classes of legitimate applicant are absent from that list by
design, and a determinate fail on absence produces precisely the structural
discrimination the technique's own paragraph warns about — against churches,
against subordinates under a group ruling, and against governmental units, which
are a first-class applicant type elsewhere in this bundle. The technique is
right about its method and wrong about one of its five worked answers.

The second finding is a hole in the aggregate verdict. Both the golden path and
verification-passport define eligible as at least one determinate pass, zero
determinate fails, and no name mismatch. The sanctions screen's "clear" is
classified as a determinate pass. A clean sanctions screen is the absence of a
disqualifier, not affirmative confirmation of good standing — the golden path's
own wording for the pass clause. So a run in which the business register and
the exemption list both error out, and only the sanctions screen decides,
satisfies all three clauses: one pass, zero fails, and a name-match of
"unconfirmed" (no source returned a name to bind), which the technique
explicitly says degrades but does not block. The result is a grant-eligible
verdict on zero identity evidence. verification-passport's "when not to use"
gestures at this ("do not mint passports from a single-source run in a
multi-source jurisdiction"), but the verdict clause itself does not encode it,
and the Node application shows the boolean implemented without it. The fix the
documents already imply is a class distinction: at least one pass from a source
whose positive establishes identity or standing, not merely any pass.

Third, registry-name-binding's containment stage defeats the protection its own
token stage was designed to provide. Stage 3 divides overlap by the larger token
set, and the document explains why: "dividing by the smaller lets a one-token
claimed name fully overlap any registry name sharing that token." Stage 2
accepts containment in either direction and runs first, so the one-token claim
never reaches stage 3 — a claimed name of "Aid" is contained in "Global Aid
Foundation" and matches at stage 2. This bundle already knows the correct
remedy: geographic-scope-gating, in grant-funding/eligibility-analysis, requires
whole-word matching with an escaped needle and a minimum needle length for
exactly this reason. Containment here needs a token-boundary condition and a
minimum length on the shorter side, or an explicit statement of the asymmetry it
is willing to accept.

Fourth, a narrower one. graceful-source-degradation tells the adapter to "walk
for the values you need rather than assuming the happy-path shape, and let the
drift widen what you find, never what you assume". Nothing binds that walk to
the subject entity, and registry payloads carry related entities, predecessors
and historical records. The same section's asymmetry rule — degrade downward
only, never promote an unclear status to active — depends on the walk not
finding a spurious active state somewhere else in the document. The walk needs a
subject-binding condition to be safe in the direction the document cares about.

I retract two of the earlier record's charges. Checksum handling is sound: the
technique states outright that "checksum validity is a statement about the
string, never about the organization", returns invalid as inconclusive rather
than fail, and warns against fabricating a checksum where the authority
specifies none. Only the golden path's compressed restatement — a checksum
failure "proves ... that the string is a typo" — overreaches slightly, since a
failure can equally mean an identifier from another scheme or a wrong algorithm
version; the repair path it prescribes is the same either way, so I am not
raising it to a finding. And registry-adapter-contract does carry claim scope
and source binding: the result shape includes the normalized subject id actually
checked, the raw source status, the canonical registry name, the legal-form code
and a check timestamp, which is the provenance the earlier record said was
missing.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/nonprofit-verification",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:d40042c3d47b9670",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read in full at restored bytes. Checked the exempt-organization list's coverage exceptions against the IRS search page. The aggregate-verdict hole and the containment bypass were derived from the documents' own definitions and worked examples. Not evaluated: the grant-writing-nonprofits repo at runtime, any live ARES, IRS, SAM or OFAC query, OFAC's valid-match guidance, and the verified_on dates of both applications, which are left unchanged.",
  "counterexamples": [
    "A church eligible to receive deductible contributions is absent from the Pub. 78 data by design; the exempt-list polarity records that absence as a determinate fail and blocks it. Group ruling subordinates and governmental units are in the same position.",
    "The business register times out and the exemption lookup returns garbage; the sanctions screen comes back clear. One pass, zero fails, name-match unconfirmed — the verdict is grant-eligible with no source having confirmed the organization exists.",
    "A claimed name of 'Aid' is contained in the registry name 'Global Aid Foundation' and matches at the containment stage, so the larger-set divisor that exists to stop exactly this never runs.",
    "A registry payload nests a predecessor entity's active registration; an unbounded walk for registration states finds it, and the downward-only degradation rule promotes nothing but also blocks nothing."
  ],
  "sources": [
    {
      "url": "https://www.irs.gov/charities-non-profits/search-for-tax-exempt-organizations",
      "result": "Established verbatim that 'Some donees (i.e., churches, group ruling subordinates, and governmental units) eligible to receive tax-deductible charitable contributions may not be listed in Pub. 78 Data.' That contradicts the subject's polarity answer for the exempt-organization list. It did NOT establish anything about the IRS Business Master File's separate coverage, about revocation data, or about any other source in the roster, and no lookup was performed."
    }
  ],
  "documents": {
    "nonprofit-verification.md": {
      "disposition": "clarify",
      "reason": "An unusually good golden path — the two-sided error-cost framing, the three-valued verdict, identity-as-binding and degrade-visibly are all right. Two corrections: it presents the exempt-organization list's absence as a disqualifier, which the IRS publicly contradicts for churches, group ruling subordinates and governmental units; and its aggregation rule accepts any single pass, including a sanctions screen's clear, which is not the 'affirmative confirmation of good standing' the same sentence requires."
    },
    "techniques/determinate-vs-inconclusive-outcomes.md": {
      "disposition": "clarify",
      "reason": "The determinate-versus-inconclusive framing and the per-source polarity question are the subject's central invention and are correct. One of the five worked polarity answers is wrong against a primary source: the exempt-organization list does not contain every legitimate applicant, so 'not found' there cannot be a determinate fail. Separately, listing 'a clean sanctions screen' as a determinate pass makes an absence of evidence carry the verdict's positive clause."
    },
    "techniques/graceful-source-degradation.md": {
      "disposition": "clarify",
      "reason": "The four-state ladder, the roster-equality invariant, the do-not-cache-a-partial rule and the downward-only promotion asymmetry are all sound and specific. The defensive-parsing rule tells the adapter to walk nested payloads for values without binding the walk to the subject entity, which is the one way a spurious active state could enter the direction the asymmetry rule exists to protect."
    },
    "techniques/identifier-checksum-prevalidation.md": {
      "disposition": "keep",
      "reason": "Correctly scoped throughout: the checksum is a statement about the string, failure returns invalid classified as inconclusive rather than fail, no fabricated checksum where the authority specifies none, normalization before comparison, and an explicit refusal to fall back to a name search. The earlier record's charges are answered in the text and are retracted."
    },
    "techniques/registry-adapter-contract.md": {
      "disposition": "keep",
      "reason": "Stable source key from the jurisdiction profile, an implemented flag so declared-but-unbuilt has a representation, one subject carrying both identifier and claimed name, per-field provenance including the normalized id actually checked, and the derive-one-convenience-from-the-other rule are each concrete and correctly motivated. The dumb-aggregation test is a genuinely good design check."
    },
    "techniques/registry-name-binding.md": {
      "disposition": "clarify",
      "reason": "The threat model, the empty-never-matches rule, the per-jurisdiction stop-set and the mismatch veto are exactly right, and the larger-set divisor is well argued. But containment runs before the token stage and accepts any claimed name that is a substring of the registry name, which bypasses that divisor entirely. It needs a token-boundary and minimum-length condition, as this bundle's own geographic prose matching already requires."
    },
    "techniques/verification-passport.md": {
      "disposition": "clarify",
      "reason": "Provenance per source, the score over decided checks only, reissue-rather-than-amend, expiry as non-optional and the boolean-with-its-metadata rule are all strong. The verdict's first clause needs a source class: 'at least one determinate pass' is satisfiable by a clean sanctions screen alone, with an unconfirmed name binding that by design does not block, which certifies eligibility on no identity evidence."
    },
    "applications/node--determinate-vs-inconclusive-outcomes.md": {
      "disposition": "clarify",
      "reason": "An excellent field record: the single construction site deriving the convenience boolean, the per-adapter polarity comments, the not-implemented placeholder rather than a dropped source, and the don't-cache-a-guess corner with its stated TTL consequence. It records the IRS adapter mapping 'nonexistent' to a determinate fail without the churches, group-ruling-subordinate and governmental-unit exceptions, and records the one-pass verdict boolean without noting that a sanctions-only pass satisfies it. Historical code and verified_on 2026-08-19 preserved; not rerun."
    },
    "applications/node--registry-name-binding.md": {
      "disposition": "clarify",
      "reason": "A faithful record of the guard, including the audit finding that motivated it, the empty-never-matches branch, the larger-set divisor and the ask-don't-accuse copy. It documents containment in either direction as a feature without noting that it runs before, and therefore defeats, the larger-set protection described two paragraphs later. Historical implementation and date not rerun."
    }
  }
}
```
