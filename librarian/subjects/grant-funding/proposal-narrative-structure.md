---
domain: grant-funding
subject: proposal-narrative-structure
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# proposal-narrative-structure

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/proposal-narrative-structure",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:7251a9e0fe068309",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A program has an uncontrolled attendance log while external research has a well-designed comparison: ownership of the log does not make its causal evidence stronger.",
    "A retention intervention measures continued enrollment as its intended outcome.",
    "A grant keeps the only service site open; continuation has a meaningful funded versus unfunded difference.",
    "A government arts application requires both artistic merit evidence and prescribed form answers."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/proposal-craft/proposal-narrative-structure",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://ies.ed.gov/ncee/wwc/Document/246",
      "scope": "Official evidence guidance distinguishes study designs capable of supporting causal claims, rather than ranking by applicant ownership."
    },
    {
      "url": "https://www.arts.gov/grants/grants-for-arts-projects/applicant-resources",
      "scope": "Official arts applicant resources include form instructions and review criteria alongside narrative guidance; no consumer application rerun."
    }
  ],
  "documents": {
    "proposal-narrative-structure.md": {
      "disposition": "reverify",
      "reason": "Useful argument skeleton but universal length bands, four genres, panel stereotypes and rankings of rejection causes are unsupported. Explicit questions override the skeleton. A winning application does not establish winning voice causality; approved targets are not achieved facts and retention can be an outcome."
    },
    "techniques/evidence-base-citation.md": {
      "disposition": "clarify",
      "reason": "Repaired automatic own-results evidence hierarchy, causal inference, projected targets versus observations, evidence relevance and output/outcome context. Citations must support the actual claim rather than merely name a source."
    },
    "techniques/funder-dollars-unlock-close.md": {
      "disposition": "clarify",
      "reason": "Repaired contradiction that continuation changes nothing, exclusive increments versus disclosed cofunding, budget scope and uncertain additionality. Maintaining a service can be the real funded difference."
    },
    "techniques/genre-register-classification.md": {
      "disposition": "clarify",
      "reason": "Repaired mutually exclusive genre assumptions, unsupported safe-default and arts-agency exceptions. Explicit requirements lead; arts emphasis can coexist with government compliance and mixed objectives."
    },
    "techniques/problem-population-opening.md": {
      "disposition": "reverify",
      "reason": "Problem-first is conditional on the question, not every first sentence. Most-common rejection and precise-small-population scoring claims lack sources; funder wording can need contextual correction. Figures alone are not evidence and illustrative urgency must not become an invented fact."
    },
    "techniques/program-model-specificity.md": {
      "disposition": "reverify",
      "reason": "Reconstructibility is useful but the strongest-lever mentoring claim is uncited. Planned delivery assumptions can be stated as plans, not only existing operational facts. Specificity does not prove effectiveness, distinctive delivery is not universally scored, and past success does not prove voice caused the award."
    },
    "techniques/theory-of-change-framing.md": {
      "disposition": "reverify",
      "reason": "Causal spine is a hypothesis with assumptions and external influences, not proof that each element produces the next. Retention and attendance can be substantive outcomes depending on purpose. Advocacy can use ordinary logic models, counts can measure change, and a causal link needing explanation is not by itself a design defect."
    },
    "applications/process--evidence-base-citation.md": {
      "disposition": "reverify",
      "reason": "Historical prompt/code/date retained, not rerun. Prompt instructions do not enforce anti-fabrication; a percentages gate cannot catch all unsupported statistics, named partners or dates. Fact-block presence does not imply relevant outcome grounding, longest winning sample is not necessarily best voice, and retention prohibition is overbroad."
    },
    "applications/process--genre-register-classification.md": {
      "disposition": "reverify",
      "reason": "Historical classifier/date retained, not rerun. Mixed arts/government requirements defeat exclusive precedence and broad agency exclusion. Word boundaries do not solve context, negation or multilingual vocabulary; fixed word ranges are product defaults, not current call rules. Delimiters mitigate rather than guarantee instruction separation."
    }
  }
}
```

### 2026-09-10 — architecture re-review after the compression revert

Read all nine documents at their restored bytes: the golden path, six techniques
and the two process applications. The record above was written against the reverted
2026-09-09 rewrite and its verdicts describe text that is gone. **Retraction:** its
`reverify` on six of nine documents does not survive re-reading. Its main charges —
that the subject presents length bands and genre counts as universal, that it lets
retention be barred as an outcome, that it asserts a winning voice caused an award
— are answered in the current text. The golden path calls the four genres what
"cover most of the field", `genre-register-classification` makes the funder's
prescribed structure override the genre default outright, `theory-of-change-framing`
already treats retention as an output *whose promotion to outcome depends on the
purpose*, and `evidence-base-citation` frames a past winning application as a style
source with an explicit fact firewall. Those are not defects.

Two findings survive, and they are the same kind: unsourced superlatives that
contradict each other.

The golden path says reviewers "consistently flag 'a problem described but never
documented' as the most pervasive narrative weakness". `problem-population-opening`
says "misalignment with priorities is the single most common rejection reason".
`evidence-base-citation` adds that a weak evaluation plan is "among the most cited
proposal weaknesses" — that one is properly hedged. Two of the three are stated as
settled empirical facts about what reviewers do at scale, neither carries a source,
and they cannot both be the top of the same list. Nothing in the surrounding advice
depends on the ranking: "document the problem" and "align with stated priorities"
are both right regardless of which is more common. Either attach a study or a
funder's own published reviewer guidance to each, or hedge both to what the craft
actually knows.

The third finding is conceptual. `evidence-base-citation` orders its ladder "in
descending strength" with the applicant's own measured results at rung 1 and the
published evidence base at rung 2. That conflates two different strengths. A
well-designed external study with a comparison condition supports a *causal* claim
that an organization's uncontrolled intake and attendance records cannot; what the
applicant's own data uniquely supports is that *this* organization can run the model
and has done so. The document half-knows this — it says rung 1 "evidences both the
model and this organization's capacity to run it", and its own decision rule ties
external research to the model's mechanism rather than the field in general. The fix
is to say what each rung is strongest *for* rather than ranking them on one axis;
as written it licenses presenting weak internal numbers over strong external
evidence, which is the opposite of the rung-inflation discipline the section is
built to enforce.

Kept: funder-dollars-unlock-close (its honest-continuation rule is the antidote to
the fake-expansion close and it is stated as the fundable framing, not a
concession), genre-register-classification (conservative default, guarded ambiguous
tokens with tests drawn from real misfires, cost-ordered precedence, and the
principled exception for arts agencies that are legally government), theory-of-change
-framing, program-model-specificity, and both applications. The applications are
notably honest: the conditional measurability nudge is recorded as an incident-shaped
lesson with the drill date attached and the downstream grounding gate that keeps the
conditional from reopening the fabrication risk.

What I could not verify: the `grant-writing-nonprofits` repository is not in this
checkout, so both applications' file and line references and the quoted prompt
strings were read as dated records, not re-executed; no draft was generated and no
classifier was run. Their verified_on dates are unchanged. Settling the two
superlatives needs published reviewer-side evidence — a funder's own reviewer
debrief or a study of scored applications — not another reading of the corpus.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/proposal-narrative-structure",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:aee3ac802a01e6de",
  "disposition": "clarify",
  "coverage": "All 9 documents read in full at restored bytes and cross-read for internal contradictions between the golden path's and the techniques' claims about reviewer behaviour. Not evaluated: the grant-writing-nonprofits repository, so both applications' prompt quotations and line references were read as dated records; no narrative was drafted, classified or reviewed; no maturity or verified_on change. The two superlative claims were not resolved against any external study.",
  "counterexamples": [
    "A young program with no results of its own citing a well-designed external study with a comparison condition: rung 2 supports the causal claim better than rung 1's uncontrolled attendance log, so 'descending strength' inverts.",
    "The golden path's 'most pervasive narrative weakness' and problem-population-opening's 'single most common rejection reason' name different failures and cannot both head the same list; neither cites a source.",
    "A retention intervention whose intended change is continued enrolment: retention is the outcome there, so the blanket demotion of retention to an output misstates the work.",
    "A national arts agency that is legally a government funder but whose panel reads as an arts panel: classification by legal category gets the register wrong, which is why the technique classifies by how the reader reads."
  ],
  "sources": [
    {
      "url": "https://www.corporateservices.noaa.gov/grantsonline/Documents/FFO_Help_Pages/FFO_Help_Submission_Dates_and_Times.htm",
      "result": "Consulted for a sibling subject's deadline claim; it confirms that agencies publish their own criteria and instructions per notice, which supports this subject's 'the published rubric is the outline' posture, but it establishes nothing about which narrative weakness reviewers cite most."
    }
  ],
  "documents": {
    "proposal-narrative-structure.md": {
      "disposition": "clarify",
      "reason": "States as fact that reviewers 'consistently flag' the undocumented problem as the most pervasive narrative weakness, unsourced and in tension with problem-population-opening's competing superlative. The skeleton, the genre-decides-rendering framing and the truth-discipline floor are sound and unaffected by hedging the ranking."
    },
    "techniques/evidence-base-citation.md": {
      "disposition": "clarify",
      "reason": "Orders the ladder 'in descending strength' with own results above the published evidence base, conflating causal strength with capacity evidence; a controlled external study evidences the mechanism better than uncontrolled internal records. Say what each rung is strongest for. The anti-inflation rule, the provenance-in-prose rule and the placeholder discipline stay as they are."
    },
    "techniques/funder-dollars-unlock-close.md": {
      "disposition": "keep",
      "reason": "Additionality, sizing and timing are three checkable questions, the honest-continuation rule explicitly handles the case where no increment exists, and the partitionability rule closes the double-promise. The rubric-driven carve-out correctly says the close may not exist as a section at all."
    },
    "techniques/genre-register-classification.md": {
      "disposition": "keep",
      "reason": "Conservative default with an honest-null justification, guarded ambiguous tokens with tests drawn from real misfires, precedence ordered by cost of error, and a principled exception for funders whose legal category and reading culture diverge. The funder's prescribed structure overrides the genre default outright."
    },
    "techniques/problem-population-opening.md": {
      "disposition": "clarify",
      "reason": "Asserts that priority misalignment is 'the single most common rejection reason' without a source, and it competes with the golden path's own most-pervasive-weakness claim. The procedure itself — specific condition, concrete population, document-don't-emote, enter the org as the response — needs no ranking to stand."
    },
    "techniques/program-model-specificity.md": {
      "disposition": "keep",
      "reason": "The reconstruction test is a concrete bar, the mechanism-statement rule ties back to the theory of change rather than duplicating it, and the quantify-from-verified-facts rule routes unconfirmed operational numbers to placeholders. The mentoring sentence is an illustrative model description, not a claim the corpus asserts."
    },
    "techniques/theory-of-change-framing.md": {
      "disposition": "keep",
      "reason": "The red thread through need, design and evaluation is the anti-circularity mechanism and is stated as a hypothesis to be evidenced, not as proof. The advocacy variant reshapes the blocks rather than forcing headcount onto campaign work, and it keeps the systems-change target concrete-rather-than-fake-numeric."
    },
    "applications/process--evidence-base-citation.md": {
      "disposition": "keep",
      "reason": "A dated record of the shared anti-fabrication clause, the verified-facts-only figure rule and the conditional measurability nudge, with the drill that forged the conditional and the downstream grounding gate that keeps it from reopening the risk. The voice/fact channel separation is recorded precisely."
    },
    "applications/process--genre-register-classification.md": {
      "disposition": "keep",
      "reason": "Reports the pure classifier, its documented token guards, its cost-ordered precedence and the deliberate exclusion of national arts and library endowments from the federal signal list. The orthogonal segment-voice axis and the conditional voice instruction are recorded as implemented, matching the technique."
    }
  }
}
```
