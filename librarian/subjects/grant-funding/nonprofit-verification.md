---
domain: grant-funding
subject: nonprofit-verification
last_touched: 2026-10-31
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

## Intake apply - 2026-10-22 (run intake-apply-rac-1022)

Dispatched from the attention scan ("single stack (node)"). The subject's only consumer is a
node tree, so the stack count stays where it was. The run applied `registry-adapter-contract`,
the subject's one technique with no `applied.md` row.

- `registry-adapter-contract`: first application, `code` / `better`. The tree already has the
  contract through to the verdict: one constructor, the implemented flag, the shared id+name
  subject, a branch-free settled fan-out, and a declarative adapter factory. The seam was chosen
  to falsify the health test ("zero lines of display code"), and the test failed. Two surfaces
  named passing sources from hand-kept key tables that listed the five built adapters. Replay
  over all 11 declared sources: raw-key chips went from 6 to 0, and agreement with the profile
  label went from 1 to 11. Floor green. One decision rule was appended to the technique:
  passing-source names travel with the result from the profile and are never looked up again
  in a display table. Still open: the identity form's client-side list of sources with a Verify
  control.

## Intake apply - 2026-10-22 (run intake-apply-vpass-1022)

Dispatched from the attention scan ("single stack (node)"). The only consumer is a node tree,
so the stack count stays put. `verification-passport` was the subject's last technique with
no `applied.md` row.

- `verification-passport`: first application, `code` / `better`. The verdict, the
  determinate-only score, expiry, the stub signature and the summary projection were all
  built, so the seam was chosen to falsify the roster and denominator claims. Both failed.
  The public passport built its roster from the live-only fan-out, so declared sources with
  no adapter were absent: 8 of 11 across the four profiles, and 0 of 11 after the change.
  The score was a bare number, and "nothing decided" printed 0 like an all-fail run: 4 of 4
  offline rosters before, 0 after. The floor held: verdict and score were identical across
  arms, and tsc, eslint and vitest 3684/3684 passed. Shipped grant 72f7d57 + a25216c. One
  decision rule was appended: build the roster from the declaration, not from the fan-out's
  output. Still open: the passport is minted live and never persisted, so expiry has no
  consumer yet.

## Architecture review - 2026-10-31

Re-review against `8432a5cfa`. None of the 2026-09-10 clarify items had landed: the
golden path, determinate-vs-inconclusive, registry-name-binding and both 2026-08-19
applications were byte-unchanged. Since then four applications were added and four
techniques each gained one decision rule; all are consistent with the subject. The IRS
page was re-opened and still lists the three classes that may be absent from Pub. 78.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/nonprofit-verification",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:247c9dd2beeb2f4d",
  "disposition": "clarify",
  "coverage": "All 13 documents decided. The golden path and the seven documents carried from the 2026-09-10 record were checked by diff against 44c8996: the golden path, determinate-vs-inconclusive, registry-name-binding and both 2026-08-19 applications are byte-unchanged, so all their clarify items are still owed; four techniques gained one appended decision rule each, read in full. The four applications added since (2026-10-14 and 2026-10-22) were read in full. The IRS search page was re-opened. Not evaluated: any live registry, sanctions or IRS lookup, OFAC guidance, and the private consumer tree; no verification date refreshed.",
  "counterexamples": [
    "A church eligible for deductible contributions is absent from the Pub. 78 data by design; mapping exempt-list 'not found' to a determinate fail blocks it. Group ruling subordinates and governmental units are in the same position (retained from 2026-09-10).",
    "The business register times out and the exemption lookup errors; the sanctions screen comes back clear. One pass, zero fails, name binding unconfirmed: the unqualified verdict is grant-eligible with no source having confirmed the organization exists.",
    "A claimed name 'Aid' is contained in 'Global Aid Foundation' and matches at the containment stage before the larger-set divisor runs.",
    "A registry payload nests a predecessor entity's active registration; an unbound walk for registration states finds it."
  ],
  "sources": [
    {
      "url": "https://www.irs.gov/charities-non-profits/search-for-tax-exempt-organizations",
      "result": "Re-opened 2026-10-31. States: 'Some donees (i.e., churches, group ruling subordinates, and governmental units) eligible to receive tax-deductible charitable contributions may not be listed in Pub. 78 Data.' Supports making exempt-list absence inconclusive for those classes. Says nothing about other roster sources; no lookup performed."
    }
  ],
  "documents": {
    "nonprofit-verification.md": {
      "disposition": "clarify",
      "reason": "Still owed from 2026-09-10 (text unchanged since): (1) the aggregation rule accepts any pass, including a sanctions 'clear', which is not affirmative confirmation of standing; require a pass from a source that establishes existence or standing. (2) The absence paragraph should name the exempt-list coverage exceptions the IRS states. (3) 'a checksum failure proves ... that the string is a typo' overreaches: it proves the string is not valid in that scheme (typo or another scheme), which the technique itself says."
    },
    "techniques/determinate-vs-inconclusive-outcomes.md": {
      "disposition": "clarify",
      "reason": "Still owed from 2026-09-10: the exempt-org list's 'yes, every applicant has it' polarity answer is contradicted by the IRS page for churches, group ruling subordinates and governmental units; and a clean sanctions screen is listed as a determinate pass with no rule stopping it from carrying the verdict's positive clause alone."
    },
    "techniques/graceful-source-degradation.md": {
      "disposition": "clarify",
      "reason": "Still owed: the defensive walk over nested payloads is not bound to the subject entity, the one route by which a spurious active state enters the direction the downward-only rule protects. The added explicit-not-found rule (2026-10-14) is sound and consistent with the ladder."
    },
    "techniques/identifier-checksum-prevalidation.md": {
      "disposition": "keep",
      "reason": "Retained keep. The added shared-normalizer rule (2026-10-14) follows from procedure step 1 and is backed by its application's paired arms."
    },
    "techniques/registry-adapter-contract.md": {
      "disposition": "keep",
      "reason": "Retained keep. The added carry-the-profile-label rule (2026-10-22) is a presentation-layer corollary of the one-declaration contract, backed by its application."
    },
    "techniques/registry-name-binding.md": {
      "disposition": "clarify",
      "reason": "Still owed: containment runs before the token stage with no token-boundary or minimum-length condition, so a one-token claim bypasses the larger-set divisor the document argues for."
    },
    "techniques/verification-passport.md": {
      "disposition": "clarify",
      "reason": "Still owed: the first verdict clause is satisfiable by a sanctions 'clear' alone with an unconfirmed (non-blocking) name binding. The added declared-roster rule (2026-10-22) is sound and closes the roster gap the graceful-degradation application left open."
    },
    "applications/node--determinate-vs-inconclusive-outcomes.md": {
      "disposition": "clarify",
      "reason": "Still owed: records the exempt-org adapter's nonexistent->fail without the IRS coverage exceptions and the passes>0 verdict without noting a sanctions-only pass satisfies it. Historical, not rerun; verified_on unchanged."
    },
    "applications/node--registry-name-binding.md": {
      "disposition": "clarify",
      "reason": "Still owed: documents containment-in-either-direction without noting it runs before, and defeats, the larger-set divisor. Historical, not rerun."
    },
    "applications/node--graceful-source-degradation.md": {
      "disposition": "reverify",
      "reason": "New since last record. Paired arms over five constructed partial bodies are internally consistent and the not-measured live rate is stated. Its 'Open' roster gap is later closed by the verification-passport application. Private tree not reopened."
    },
    "applications/node--identifier-checksum-prevalidation.md": {
      "disposition": "reverify",
      "reason": "New since last record. Clear seam, consistent arms (4 of 4 to 0 of 4, typo floor held), and the short-id choice is argued. Private tree not reopened."
    },
    "applications/node--registry-adapter-contract.md": {
      "disposition": "reverify",
      "reason": "New since last record. Consistent counts (6 of 11 to 0; 1 of 11 to 11) and remaining hand-kept lists disclosed. Private tree not reopened."
    },
    "applications/node--verification-passport.md": {
      "disposition": "clarify",
      "reason": "New since last record. Roster and denominator arms are consistent and disclosed limits are honest. It reports the three-clause verdict as complete without noting that a sanctions-only pass would satisfy its first clause if the screen maps 'clear' to pass. Private tree not reopened."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied every clarify item from the record above. The two 2026-08-19 applications
and the 2026-10-22 passport application gained short gap notes derived from their own
recorded code, labelled as not rerun; their verified_on dates are unchanged. The
overall disposition is now reverify, carried by the four private-tree applications.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/nonprofit-verification",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:7140a029c5f784a7",
  "disposition": "reverify",
  "coverage": "All 13 documents decided. Every clarify item owed by the first 2026-10-31 record was applied and the edited passages re-read; check-bundles passes. The IRS exceptions rest on the page re-opened this run; the other changes rest on the documents' own definitions (the golden path's 'affirmative confirmation' wording, the name-binding divisor argument). The application additions are inferences from their own recorded code, labelled as such, not reruns. Overall reverify because four applications rest on private trees not reopened.",
  "counterexamples": [
    "A church eligible for deductible contributions is absent from the Pub. 78 data by design; mapping exempt-list 'not found' to a determinate fail blocks it. Group ruling subordinates and governmental units are in the same position (retained from 2026-09-10).",
    "The business register times out and the exemption lookup errors; the sanctions screen comes back clear. One pass, zero fails, name binding unconfirmed: the unqualified verdict is grant-eligible with no source having confirmed the organization exists.",
    "A claimed name 'Aid' is contained in 'Global Aid Foundation' and matches at the containment stage before the larger-set divisor runs.",
    "A registry payload nests a predecessor entity's active registration; an unbound walk for registration states finds it."
  ],
  "sources": [
    {
      "url": "https://www.irs.gov/charities-non-profits/search-for-tax-exempt-organizations",
      "result": "Re-opened 2026-10-31. States: 'Some donees (i.e., churches, group ruling subordinates, and governmental units) eligible to receive tax-deductible charitable contributions may not be listed in Pub. 78 Data.' Supports making exempt-list absence inconclusive for those classes. Says nothing about other roster sources; no lookup performed."
    },
    {
      "source": "Internal consistency",
      "result": "The sanctions-only eligibility hole and the containment bypass follow from the documents' own definitions and worked examples; the walk-binding gap from the downward-only rule's stated purpose."
    }
  ],
  "documents": {
    "nonprofit-verification.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the aggregation paragraph now requires the pass to come from a source that establishes existence or standing and says a sanctions-only run cannot satisfy it; the absence paragraph names the IRS's churches/group-ruling-subordinate/governmental-unit exceptions; the checksum sentence now says 'not a valid identifier in that scheme: usually a typo, sometimes a number from another scheme'."
    },
    "techniques/determinate-vs-inconclusive-outcomes.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: exempt-list 'not found' is now inconclusive with the IRS exceptions quoted in paraphrase, wrong-class stays a fail; the sanctions 'clear' is described as a non-disqualifier, not identity; the demographic paragraph adds the exempt-list collapse; the aggregation rule requires a pass from an existence-or-standing source."
    },
    "techniques/graceful-source-degradation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the defensive-parsing rule now binds the walk to the subject entity, naming related entities, predecessors and historical records."
    },
    "techniques/identifier-checksum-prevalidation.md": {
      "disposition": "keep",
      "reason": "Retained keep. The added shared-normalizer rule (2026-10-14) follows from procedure step 1 and is backed by its application's paired arms."
    },
    "techniques/registry-adapter-contract.md": {
      "disposition": "keep",
      "reason": "Retained keep. The added carry-the-profile-label rule (2026-10-22) is a presentation-layer corollary of the one-declaration contract, backed by its application."
    },
    "techniques/registry-name-binding.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: stage 2 now requires token-boundary containment and a minimum length or token count for the shorter side, with the 'Aid' example."
    },
    "techniques/verification-passport.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the at-least-one-pass clause now requires an existence-or-standing source and explains why a sanctions clear alone cannot carry it."
    },
    "applications/node--determinate-vs-inconclusive-outcomes.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added a 'Gaps against the standard' section (exempt-list nonexistent->fail without IRS exceptions; sanctions-only pass satisfies passes>0), marked as read from the record, not rerun; verified_on unchanged. Code itself remains reverify."
    },
    "applications/node--registry-name-binding.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added a 'Gap against the standard' section on containment preceding the divisor, marked as read from the record, not rerun; verified_on unchanged."
    },
    "applications/node--graceful-source-degradation.md": {
      "disposition": "reverify",
      "reason": "New since last record. Paired arms over five constructed partial bodies are internally consistent and the not-measured live rate is stated. Its 'Open' roster gap is later closed by the verification-passport application. Private tree not reopened."
    },
    "applications/node--identifier-checksum-prevalidation.md": {
      "disposition": "reverify",
      "reason": "New since last record. Clear seam, consistent arms (4 of 4 to 0 of 4, typo floor held), and the short-id choice is argued. Private tree not reopened."
    },
    "applications/node--registry-adapter-contract.md": {
      "disposition": "reverify",
      "reason": "New since last record. Consistent counts (6 of 11 to 0; 1 of 11 to 11) and remaining hand-kept lists disclosed. Private tree not reopened."
    },
    "applications/node--verification-passport.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the limits section now notes the first clause still counts any pass and that a sanctions-only clear would satisfy it if the screen maps clear to pass, with that mapping stated as unchecked; verified_on unchanged."
    }
  }
}
```
