---
domain: grant-funding
subject: funder-format-blueprints
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# funder-format-blueprints

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/funder-format-blueprints",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:ba00c5f24eb00fa8",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Two programmes on one portal require different forms: source alone cannot choose both correctly.",
    "An unscored mandatory declaration must be submitted even though it earns no rubric points.",
    "One portal answer can support multiple evaluation criteria, and one criterion can span several fields.",
    "A proposed future regulation is not a final application template."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/proposal-craft/funder-format-blueprints",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/horizon/wp-call/2026-2027/wp-15-general-annexes_horizon-2026-2027_en.pdf",
      "scope": "Read introduction and admissibility: separate programmes, topic-specific deviations and forms provided in submission system; not verification of future programme legislation."
    }
  ],
  "documents": {
    "funder-format-blueprints.md": {
      "disposition": "reverify",
      "reason": "Scored criteria and form fields are not universally one-to-one; mandatory unscored annexes are not dead weight. A portal can host multiple programmes and a generic template is not submission-ready by default. Hard page/character limits differ from advisory word bands."
    },
    "techniques/arts-panel-sections.md": {
      "disposition": "reverify",
      "reason": "Useful candidate triad, not a universal panel structure. Reach can be a justified target rather than actual attendance; seat counts do not establish unique people. Claims about panel preferences, highest weights and length need call-specific evidence."
    },
    "techniques/blueprint-routing-rules.md": {
      "disposition": "clarify",
      "reason": "Repaired precedence so exact current call and stage override source/genre heuristics, with provisional routing and explicit migration. Shared keys do not automatically validate different questions."
    },
    "techniques/federal-rubric-sections.md": {
      "disposition": "reverify",
      "reason": "Four dimensions are an optional working outline, not all federal criteria. Points need not dictate proportional words, qualitative evidence can be valid, and local government reviewer culture is not established by the source category."
    },
    "techniques/movement-funder-sections.md": {
      "disposition": "reverify",
      "reason": "Organizing, advocacy and service delivery can coexist; officer backgrounds and scoring reactions are unsupported generalizations. A causal diagram can convey theory of change. Activity permissibility cannot be achieved merely by changing narrative framing."
    },
    "techniques/supranational-award-criteria-sections.md": {
      "disposition": "clarify",
      "reason": "Repaired conditional three-criterion scope, form-to-rubric mapping, call/stage thresholds and limits. Verifiable objectives need not always have numerical targets; future programme continuity is not guaranteed."
    },
    "techniques/trust-and-lottery-sections.md": {
      "disposition": "reverify",
      "reason": "Trusts may use formal scoring and professional reviewers. Shorter is not always stronger, core costs can be fundable, and a single indicator may not suffice. Confirm actual question set, limits and safeguarding requirements for the call."
    },
    "applications/process--blueprint-routing-rules.md": {
      "disposition": "reverify",
      "reason": "Historical code/date preserved, not rerun. Source-first resolver cannot distinguish programmes on one portal; repeated band tables may drift and shared keys do not prove critique coverage. Capping 12 requirements at 300 characters can delete obligations or qualifiers; delimiter removal cannot guarantee instruction isolation."
    },
    "applications/process--federal-rubric-sections.md": {
      "disposition": "reverify",
      "reason": "Historical prompt implementation/date retained. Static word bands are not derived from call point allocations, null guidance does not prove all old behavior unchanged, and sharing federal section arrays does not prove municipal form compatibility."
    },
    "applications/process--supranational-award-criteria-sections.md": {
      "disposition": "reverify",
      "reason": "Historical date remains unchanged. Official annex introduction excludes several separate work programmes, allows topic deviations, and requires actual submission forms. Threshold arithmetic is correct within its scope; proposed successor legislation cannot establish unchanged future sections, keys or guidance. Remaining successor assertions not independently verified."
    }
  }
}
```

### 2026-09-10 — architecture re-review after the compression revert

Read all ten documents at their restored bytes: the golden path, six family
blueprints and three process applications. The record above this one was written
against the 2026-09-09 rewrite, which has since been reverted, so its verdicts
point at text that no longer exists. **Retraction:** its `reverify` on eight of ten
documents, and specifically its treatment of the supranational application as
carrying unverified successor assertions, does not survive re-checking. I verified
the load-bearing numbers in that application against the funder's own published
mechanics and they are correct.

Source work done this pass. The Horizon Europe General Annexes rule — each of the
three award criteria scored out of 5, a threshold of 3 per criterion, an overall
threshold of 10 on the sum, and Impact weighted 1.5 for Innovation Actions in
ranking only — is restated identically across work-programme cycles including the
2026–2027 annex the application cites, and the annex URL still resolves. The FP10
claim also holds: the proposed 2028–2034 regulation's Article 25 carries excellence,
impact and quality-and-efficiency-of-implementation as the award criteria. The
application already frames that as a proposal under member-state discussion, which
is the honest framing, so I left it alone. I read these documents; I evaluated no
proposal and ran no submission system.

One finding is worth a content change. The golden path's organizing insight is a
strict one-to-one mapping — "one section per scored criterion" — and it draws the
consequence that "a section the rubric does not score is dead weight the reviewer
must skim past". That is wrong at a boundary the subject cares about. The same
supranational family whose scoring mechanics the subject verifies also imposes
admissibility and eligibility requirements, mandatory annexes and declarations
(ethics self-assessment being the standard example) that earn no award points and
are not optional; a blueprint that treats unscored required content as dead weight
produces a document that is well-mapped to the score sheet and inadmissible. The
fix is small: the mapping governs the *narrative* sections; mandatory unscored
elements are a separate, non-negotiable class that the blueprint must carry.

A second, cheaper finding: `techniques/movement-funder-sections.md` asserts that
"program officers in this family are former organizers more often than not". That
is an unsupported empirical claim about a population of people, doing no work the
surrounding advice does not already do ("they read for strategic realism"). Either
source it or drop the clause; the section's substance is unaffected either way.

Everything else I kept. The routing technique's precedence, its "uncertainty falls
to the default" rule and its insistence that the default reproduce the previously
trusted structure byte for byte are argued from cost-of-error rather than asserted,
and the three applications record them as implemented with their motivating
incidents attached. The arts, federal and trust blueprints stay inside hedged
language ("typically", "commonly", "the dominant form across this family") and each
carries a when-not-to-use section that names the families it must not be exported
to. What I could not verify: the `grant-writing-nonprofits` repository is not in
this checkout, so the quoted file paths and line numbers in all three applications
were read as dated records, not re-executed; their verified_on dates are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/funder-format-blueprints",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:82526c02b7275f63",
  "disposition": "clarify",
  "coverage": "All 10 documents read in full at restored bytes. The supranational application's scoring mechanics and its successor-programme claim were checked against the funder's published work-programme annex text and the proposed 2028-2034 regulation. Not evaluated: the grant-writing-nonprofits repository, so the three applications' file and line references were read as dated records; no proposal was drafted, submitted or evaluated; no maturity or verified_on change.",
  "counterexamples": [
    "An ethics self-assessment or other mandatory annex earns no award points but is required for admissibility: a blueprint that treats unscored sections as dead weight drops content the submission cannot go in without.",
    "One portal answer can serve two award criteria and one criterion can span several form fields, so the one-section-per-criterion mapping is a drafting heuristic, not a property of the form.",
    "An organization that both organizes and delivers services applying to a funder that scores need/approach/capacity/evaluation: the movement form's power framing is the wrong route even though every advocacy signal fires.",
    "A specific named call publishes its own template that deviates from its family shape; the routing table is right about the family and wrong about the document."
  ],
  "sources": [
    {
      "url": "https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/horizon/wp-call/2026-2027/wp-15-general-annexes_horizon-2026-2027_en.pdf",
      "result": "Confirms the cited scoring mechanics restated across cycles: threshold 3 per criterion, overall threshold 10, Impact weighted 1.5 for Innovation Actions in ranking only. Read as a document; it does not establish anything about how any drafting product routes an opportunity."
    },
    {
      "url": "https://www.europarl.europa.eu/legislative-train/spotlight-MFF%202028-2034/file-horizon-europe",
      "result": "Corroborates that the proposed 2028-2034 framework regulation retains excellence, impact and implementation as award criteria under Article 25, and that it is still in negotiation. It does not establish that the enacted regulation will keep them, which is why the application's 'proposed' framing is the correct one."
    }
  ],
  "documents": {
    "funder-format-blueprints.md": {
      "disposition": "clarify",
      "reason": "The one-section-per-scored-criterion mapping is sound, but the corollary that 'a section the rubric does not score is dead weight' is false where the funder requires unscored mandatory elements (declarations, ethics self-assessments, admissibility annexes). Mandatory-but-unscored content needs its own class in the section contract."
    },
    "techniques/arts-panel-sections.md": {
      "disposition": "keep",
      "reason": "The triad is presented as what panels score in this family with the stream's own published criteria given precedence in the first decision rule, and the reach-figure rule distinguishes participation from attendance. Claims stay inside hedged, family-scoped language."
    },
    "techniques/blueprint-routing-rules.md": {
      "disposition": "keep",
      "reason": "Precedence is justified by cost of error rather than confidence, the default-to-generic and byte-identical-default rules are provably additive, and the specific-call override is explicit in when-not-to-use. Nothing here is contradicted by the current bytes."
    },
    "techniques/federal-rubric-sections.md": {
      "disposition": "keep",
      "reason": "The four dimensions are offered as the canonical narrative set with 'the published rubric is the outline' as the first decision rule, so the notice governs. Quantitative claims are hedged ('commonly carries a substantial share') and the placeholder discipline keeps the quantify pressure honest."
    },
    "techniques/movement-funder-sections.md": {
      "disposition": "clarify",
      "reason": "Asserts that program officers in this family 'are former organizers more often than not' — an unsupported empirical claim about people that carries no weight the neighbouring advice does not already carry. Source it or cut the clause; the rest of the section is sound and correctly bounded."
    },
    "techniques/supranational-award-criteria-sections.md": {
      "disposition": "keep",
      "reason": "Independent thresholds, mirror-the-sub-headings, two-stage front-loading and 'weighted criteria shift emphasis, not structure' all match the funder's published annex mechanics as re-checked this pass. The measurable-objective rule pairs the pressure with an explicit placeholder escape."
    },
    "techniques/trust-and-lottery-sections.md": {
      "disposition": "keep",
      "reason": "Presented as the dominant form across the family with 'portal wins over instinct' as a decision rule, and the register advice is scoped to the family with an explicit list of families it must not be exported to. The safeguarding and published-priorities rules are concrete and checkable against any given funder's form."
    },
    "applications/process--blueprint-routing-rules.md": {
      "disposition": "keep",
      "reason": "A dated record of the resolver, the mirrored band table and the requirements block, each tied to the incident that forged it. The caps it reports (12 requirements, 300 characters) are the implementation's choices as recorded, not claims about what is correct."
    },
    "applications/process--federal-rubric-sections.md": {
      "disposition": "keep",
      "reason": "Reports the per-section guidance verbatim and names the guidance-null fallback mechanism that keeps the prior behaviour unchanged. The placeholder valve and its separate proofreader treatment are exactly the never-fabricate discipline surviving rubric pressure."
    },
    "applications/process--supranational-award-criteria-sections.md": {
      "disposition": "keep",
      "reason": "Its scoring arithmetic and weighting claims were re-checked against the published annex text this pass and hold. The successor-programme section is already framed as a proposal with weighting under discussion, which is the honest reading; verified-and-untouched remains the correct result."
    }
  }
}
```

## Architecture review - 2026-10-31

Twelve documents read in full: the golden path, six family techniques, three process applications
and three Node applications added since 2026-09-10 (arts, trust, movement). Both 2026-09-10
clarify items are still owed at current bytes. The golden path still calls an unscored section
"dead weight"; the funder's own 2026-2027 General Annexes, opened this run, say applications
"must be complete and contain all parts and mandatory Annexes and supporting documents" and that
"Applicants must have completed the ethics self-assessment as part of their application" - content
that earns no award points and without which the proposal is inadmissible. The movement technique
still asserts that its program officers "are former organizers more often than not", with no source.

One new finding, an internal inconsistency the applications expose. `blueprint-routing-rules`
puts genre (including "advocacy funder") ahead of the sub-national government fallback for every
genre, and its process application quotes the resolver doing exactly that ("so a state ARTS or
ADVOCACY call still gets its specialized blueprint"). `movement-funder-sections` says "not for
public-agency funders", and the 2026-10-14 movement application moved the state route ahead of
advocacy (arts still above it) for that reason. The routing technique needs the exception. The
process routing application is now a superseded record of the resolver (genre read with applicant
keywords before 2026-10-11, advocacy above state before 2026-10-14); a dated supersession note
needs the tree, so it is `reverify`, not mine.

The annex also re-confirms the supranational numbers: "each criterion will be scored out of 5. The
threshold for individual criteria will be 3. The overall threshold ... will be 10", Impact
"given a weight of 1.5" for Innovation Action ranking, and first stages of two-stage calls
evaluate only Excellence and Impact at a threshold of 4. I read documents; I ran no portal or tree.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/funder-format-blueprints",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:aec02f7c8d562627",
  "disposition": "clarify",
  "coverage": "All 12 documents read in full, routing rules cross-read against the movement boundary and the three newer applications. The Horizon Europe 2026-2027 General Annexes opened and its admissibility, ethics and scoring text quoted. NOT evaluated: no application tree re-read, no portal form inspected per call, no proposal drafted; no verified_on or maturity change.",
  "counterexamples": [
    "An ethics self-assessment earns no award points yet is required: a blueprint that drops unscored sections as dead weight is inadmissible.",
    "A state agency notice whose description says \"policy reform\" fires the advocacy genre; genre-before-structure routing hands a public-agency funder the organizing form the movement technique forbids for it.",
    "A specific named call publishes its own template that deviates from its family shape; the routing table is right about the family and wrong about the document.",
    "The annex scores criteria, \"not ... the different aspects listed in the table\", so mirroring sub-questions helps navigation but no sub-question carries its own score."
  ],
  "sources": [
    {
      "url": "https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/horizon/wp-call/2026-2027/wp-15-general-annexes_horizon-2026-2027_en.pdf",
      "result": "Opened this run (text extracted). Quotes: \"Applications must be complete and contain all parts and mandatory Annexes and supporting documents\"; \"Applicants must have completed the ethics self-assessment as part of their application\"; \"each criterion will be scored out of 5. The threshold for individual criteria will be 3. The overall threshold, applying to the sum of the three individual scores, will be 10\"; Impact \"given a weight of 1.5\" for Innovation Action ranking; two-stage first stage evaluates Excellence and Impact only, threshold 4. Supports the golden-path clarify and the supranational technique and application."
    },
    {
      "path": "knowledge/grant-funding/proposal-craft/funder-format-blueprints",
      "result": "All 12 documents read; the routing/movement inconsistency derived from the techniques and confirmed by the 2026-10-14 movement application and the process routing application's quoted resolver."
    }
  ],
  "documents": {
    "funder-format-blueprints.md": {
      "disposition": "clarify",
      "reason": "Still owed and now sourced this run: \"a section the rubric does not score is dead weight\" is false where the funder requires unscored mandatory content (annex quotes above). Mandatory-but-unscored elements are a separate, non-negotiable class."
    },
    "techniques/arts-panel-sections.md": {
      "disposition": "keep",
      "reason": "Hedged, family-scoped triad; the funder-not-applicant trigger is backed by its paired application."
    },
    "techniques/blueprint-routing-rules.md": {
      "disposition": "clarify",
      "reason": "Genre-before-structure is stated for every genre, but movement-funder-sections forbids the movement form for public-agency funders and its application reordered the resolver accordingly. Name the exception: a government source never routes to the movement form."
    },
    "techniques/federal-rubric-sections.md": {
      "disposition": "keep",
      "reason": "The published rubric governs; quantitative claims hedged; placeholder valve present."
    },
    "techniques/movement-funder-sections.md": {
      "disposition": "clarify",
      "reason": "Still owed: \"program officers in this family are former organizers more often than not\" is an unsourced population claim doing no work; cut it."
    },
    "techniques/supranational-award-criteria-sections.md": {
      "disposition": "keep",
      "reason": "Thresholds, IA weighting and two-stage rules match the annex text opened this run."
    },
    "techniques/trust-and-lottery-sections.md": {
      "disposition": "keep",
      "reason": "Family-scoped with portal-wins rule; its application confirms the priorities rule carries. \"No professional review layer\" for most trusts is unsourced but hedged and does not change the structure; worth sourcing on a future pass."
    },
    "applications/node--arts-panel-sections.md": {
      "disposition": "keep",
      "reason": "297-pair paired proof with a floor and a census test; limits (prompt register, no migration, loose markers) stated."
    },
    "applications/node--movement-funder-sections.md": {
      "disposition": "keep",
      "reason": "Honest unmeasurable verdict; the reorder it records is the evidence for the routing clarify."
    },
    "applications/node--trust-and-lottery-sections.md": {
      "disposition": "keep",
      "reason": "Instruction-level change with an honest unmeasurable verdict and a stated return condition."
    },
    "applications/process--blueprint-routing-rules.md": {
      "disposition": "reverify",
      "reason": "Its quoted resolver (advocacy above state; genre fed by applicant keywords) is superseded by the 2026-10-11 and 2026-10-14 sibling applications. Needs a dated supersession note checked against the tree; not applied without reading it."
    },
    "applications/process--federal-rubric-sections.md": {
      "disposition": "keep",
      "reason": "Dated record of guidance and bands; citations not re-read."
    },
    "applications/process--supranational-award-criteria-sections.md": {
      "disposition": "keep",
      "reason": "Scoring arithmetic and two-stage claims re-confirmed against the annex this run. Only one of its four sources re-opened, so verified_on is unchanged."
    }
  }
}
```

### 2026-10-31 - after applying the owed clarifications

All three clarify items applied. The process routing application stays `reverify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/funder-format-blueprints",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:6a3940b4e8de873c",
  "disposition": "reverify",
  "coverage": "All 12 documents read in full, routing rules cross-read against the movement boundary and the three newer applications. The Horizon Europe 2026-2027 General Annexes opened and its admissibility, ethics and scoring text quoted. NOT evaluated: no application tree re-read, no portal form inspected per call, no proposal drafted; no verified_on or maturity change. Phase B applied three clarifications; process--blueprint-routing-rules remains reverify, so it now sets the overall disposition.",
  "counterexamples": [
    "An ethics self-assessment earns no award points yet is required: a blueprint that drops unscored sections as dead weight is inadmissible.",
    "A state agency notice whose description says \"policy reform\" fires the advocacy genre; genre-before-structure routing hands a public-agency funder the organizing form the movement technique forbids for it.",
    "A specific named call publishes its own template that deviates from its family shape; the routing table is right about the family and wrong about the document.",
    "The annex scores criteria, \"not ... the different aspects listed in the table\", so mirroring sub-questions helps navigation but no sub-question carries its own score."
  ],
  "sources": [
    {
      "url": "https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/horizon/wp-call/2026-2027/wp-15-general-annexes_horizon-2026-2027_en.pdf",
      "result": "Opened this run (text extracted). Quotes: \"Applications must be complete and contain all parts and mandatory Annexes and supporting documents\"; \"Applicants must have completed the ethics self-assessment as part of their application\"; \"each criterion will be scored out of 5. The threshold for individual criteria will be 3. The overall threshold, applying to the sum of the three individual scores, will be 10\"; Impact \"given a weight of 1.5\" for Innovation Action ranking; two-stage first stage evaluates Excellence and Impact only, threshold 4. Supports the golden-path clarify and the supranational technique and application."
    },
    {
      "path": "knowledge/grant-funding/proposal-craft/funder-format-blueprints",
      "result": "All 12 documents read; the routing/movement inconsistency derived from the techniques and confirmed by the 2026-10-14 movement application and the process routing application's quoted resolver."
    }
  ],
  "documents": {
    "funder-format-blueprints.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"dead weight\" narrowed to unscored narrative sections; mandatory unscored elements (declarations, ethics self-assessment, required annexes) named as a separate class, with the annex admissibility quote opened this run."
    },
    "techniques/arts-panel-sections.md": {
      "disposition": "keep",
      "reason": "Hedged, family-scoped triad; the funder-not-applicant trigger is backed by its paired application."
    },
    "techniques/blueprint-routing-rules.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: genre-before-structure now names the movement exception (a government source never routes to the movement form; a sub-national advocacy-worded call takes the structural route), matching movement-funder-sections and its 2026-10-14 application."
    },
    "techniques/federal-rubric-sections.md": {
      "disposition": "keep",
      "reason": "The published rubric governs; quantitative claims hedged; placeholder valve present."
    },
    "techniques/movement-funder-sections.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: cut the unsourced \"program officers ... are former organizers more often than not\"; \"read for strategic realism\" kept."
    },
    "techniques/supranational-award-criteria-sections.md": {
      "disposition": "keep",
      "reason": "Thresholds, IA weighting and two-stage rules match the annex text opened this run."
    },
    "techniques/trust-and-lottery-sections.md": {
      "disposition": "keep",
      "reason": "Family-scoped with portal-wins rule; its application confirms the priorities rule carries. \"No professional review layer\" for most trusts is unsourced but hedged and does not change the structure; worth sourcing on a future pass."
    },
    "applications/node--arts-panel-sections.md": {
      "disposition": "keep",
      "reason": "297-pair paired proof with a floor and a census test; limits (prompt register, no migration, loose markers) stated."
    },
    "applications/node--movement-funder-sections.md": {
      "disposition": "keep",
      "reason": "Honest unmeasurable verdict; the reorder it records is the evidence for the routing clarify."
    },
    "applications/node--trust-and-lottery-sections.md": {
      "disposition": "keep",
      "reason": "Instruction-level change with an honest unmeasurable verdict and a stated return condition."
    },
    "applications/process--blueprint-routing-rules.md": {
      "disposition": "reverify",
      "reason": "Its quoted resolver (advocacy above state; genre fed by applicant keywords) is superseded by the 2026-10-11 and 2026-10-14 sibling applications. Needs a dated supersession note checked against the tree; not applied without reading it."
    },
    "applications/process--federal-rubric-sections.md": {
      "disposition": "keep",
      "reason": "Dated record of guidance and bands; citations not re-read."
    },
    "applications/process--supranational-award-criteria-sections.md": {
      "disposition": "keep",
      "reason": "Scoring arithmetic and two-stage claims re-confirmed against the annex this run. Only one of its four sources re-opened, so verified_on is unchanged."
    }
  }
}
```
