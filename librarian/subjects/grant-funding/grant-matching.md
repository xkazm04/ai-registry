---
domain: grant-funding
subject: grant-matching
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# grant-matching

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/grant-matching",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:cf92be6e6c66f936",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 5 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "With all other components equal, ten keyword hits still outrank three under any strictly increasing saturation transform.",
    "The same concept written in three spelling variants earns more than one variant unless deduplicated before counting.",
    "An injected response containing valid JSON and score 100 passes a schema check.",
    "A mandatory geographic restriction cannot be overridden by strong mission fit."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/matching-and-intelligence/grant-matching",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.microsoft.com/en-us/msrc/blog/2025/07/how-microsoft-defends-against-indirect-prompt-injection-attacks",
      "scope": "Primary description calls spotlighting probabilistic; no local attack benchmark or provider execution."
    }
  ],
  "documents": {
    "grant-matching.md": {
      "disposition": "reverify",
      "reason": "Capacity heuristics are not formal pass/fail facts; geography can be a mandatory gate. Unknowns must remain unresolved. Saturation does not reverse raw hit order; deterministic functions are not zero-cost or infallible, and parseable injected output can affect more than one score."
    },
    "techniques/diminishing-returns-keyword-overlap.md": {
      "disposition": "clarify",
      "reason": "Repaired concept deduplication before scoring and monotone-transform limitations; missing text differs from measured no overlap. Formula arithmetic is correct but cannot by itself demote broad announcements."
    },
    "techniques/explainable-match-reasons.md": {
      "disposition": "reverify",
      "reason": "Faithful attribution does not establish true fit. Unsupported positive defaults need explanation, while negative or missing evidence can be useful to users. Reason count is not strength, and claims about all post-hoc explanations require evidence."
    },
    "techniques/injection-safe-rfp-analysis.md": {
      "disposition": "clarify",
      "reason": "Repaired mitigation versus guarantee, valid-schema malicious output, tool authority limits, truncation completeness and grounded output checks."
    },
    "techniques/llm-plus-deterministic-two-lane.md": {
      "disposition": "reverify",
      "reason": "Model superiority and fallback availability are not guaranteed. Provider spend cannot necessarily be reclaimed; structured ingest can be stale versus authoritative call prose. Cache requires rule/model versions and time expiry. Model-assisted extraction is possible with verified gate evidence."
    },
    "techniques/verdict-thresholds.md": {
      "disposition": "clarify",
      "reason": "Repaired authoritative conditions versus heuristics, unresolved eligibility, invalid scores and arbitrary band limits. Geography can hard-block, revenue-relative fit need not."
    },
    "techniques/weighted-component-scoring.md": {
      "disposition": "reverify",
      "reason": "Missing-value defaults encode policy rather than neutral truth. Preserve native currency plus dated conversion rather than replacing it. A sum may tie and need tie-breaking; component weights and regional preferences require evaluation, and clamping can conceal a broken component."
    },
    "applications/node--weighted-component-scoring.md": {
      "disposition": "clarify",
      "reason": "Removed private checkout root, retaining historical implementation and verified_on. Displayed scoring still needs consumer verification: substring geography, variant-inflated overlap, fixed revenue range, and half-credit unknown amounts can misrank."
    },
    "applications/process--injection-safe-rfp-analysis.md": {
      "disposition": "clarify",
      "reason": "Removed private checkout root; historical prompt/date not refreshed. Newline stripping cannot stop single-line instructions, valid JSON can carry manipulated scores, source text can omit key requirements, and cache expiry/spend recovery claims need consumer evidence."
    }
  }
}
```

### 2026-09-10 — architecture re-review after the compression revert

I read all nine documents at their restored bytes; the record above no longer
matches the tree (cf92be6e6c66f936 versus e52c421c0cab9483), and its "5
document(s) repaired" describes edits the revert removed.

The subject contains a contradiction between two of its own techniques about
whether geography can force an ineligible verdict. verdict-thresholds step 1
names the canonical hard gates as applicant type, deadline and award-capacity
fit, and puts "geographic nuance" among the checks that "may inform the score
without gating". weighted-component-scoring's first decision rule says a hard
geography mismatch — wrong country for a national-only program — "scores the
component zero and should already have failed eligibility". Both cannot hold.
Follow the first and a US organization sees a UK-only national programme with
geography at zero but mission and award intact, which under the stated
50/30/20 weights and the 50/75 bands lands at "possible" — the golden path's own
"eloquent ineligible" failure mode, produced by the subject's gate list rather
than despite it. Worth noting that the excluded check, geography, is the one
decided by a structured country field, while the included check,
award-capacity fit, is the revenue heuristic that grant-funding/eligibility-
analysis and grant-funding/coalition-and-portfolio-strategy both describe as a
rule of thumb. I recorded the same inversion against both of those subjects
today; all three inherit it from one hard-block list, and it should be resolved
once.

The second finding is that a saturating transform does not do the job the
subject says it does. The golden path's argument is that the opportunity
mentioning every keyword is usually an umbrella announcement, so "overlap must
saturate", and the technique's decision rule says a document hitting an unusually
large fraction of the keyword set should be treated as "weak evidence of a
meta-document, not strong evidence of fit — the saturating curve does this
automatically". It does not. The curve is strictly increasing, so more hits
always score more; saturation compresses the advantage but never reverses it. I
computed the technique's own curve to check that its published figures are right,
and they are: at k=2, one hit earns 39.3 percent of the maximum, three 77.7,
five 91.8, ten 99.3. So the meta-announcement with ten hits still beats the tight
three-hit fit by about eleven points of a hundred-point total. Demoting breadth
needs a non-monotone treatment — a penalty above a fraction-of-set threshold, or
scoring concepts rather than hits. The same overclaim appears one rule earlier:
variant spellings are admitted on the grounds that "saturation also absorbs this
inflation", but three spellings of one concept score 77.7 percent where the
concept scores 39.3, and the technique then offers hit-deduplication as optional
"extra precision" rather than as the actual fix. The arithmetic in these
documents is correct throughout; it is the claims made about the arithmetic that
overreach.

Third, explainable-match-reasons asserts that the recommender-explainability
literature "consistently finds that post-hoc free-form explanations fail"
fidelity, and the golden path calls it "a finding the wider recommender-
explainability literature keeps re-learning". No citation appears anywhere in the
subject and I did not attempt to establish the state of that literature. The
technique does not need the claim — its design argument stands on its own — and
as written it is an empirical assertion about a body of research that the corpus
has not shown.

Fourth, in the Node application the unknown-award default is AWARD_UNKNOWN_DEFAULT
= 10 against a component maximum of 20. weighted-component-scoring's rule is that
a missing value "gets a small fixed default (or zero), never the component
maximum". Half the maximum is not a small default: an opportunity that published
no amount scores higher on that component than one that published an amount
outside the sweet-spot band, so the shortlist rewards silence. The application
records the constant without noting the tension, and the golden path lists "the
optimistic unknown" among the failure modes it exists to prevent.

I retract two of the earlier record's charges. injection-safe-rfp-analysis does
not present delimiting as a guarantee: it states the content-mimicking limit in
its own decision rules, says outright that spotlighting "reduces, not eliminates,
injection success", and puts the last line of defense in the architecture rather
than the prompt. And llm-plus-deterministic-two-lane does not claim model
superiority or guaranteed fallback availability; it claims the model is better at
qualitative judgment and worse at everything exact, and its fallback is the lane
shipped first, which is the strongest form that claim can take.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/grant-matching",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:e52c421c0cab9483",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read in full at restored bytes. The saturation curve was evaluated numerically (node -e on the published formula only, no repo code executed) and its stated percentages confirmed. The geography contradiction was derived from the two techniques' own text plus the stated weights and bands. Not evaluated: the grant-writing-nonprofits repo at runtime, any provider call, the recommender-explainability literature, prompt-injection efficacy research, and the verified_on dates of both applications, which are left unchanged.",
  "counterexamples": [
    "A UK-only national programme scored for a US organization: geography zero, mission 50, award 20 gives 70, which bands as 'possible' because geography is not in the hard-gate list.",
    "A portal digest hitting ten mission keywords scores 49.7 of 50 on the mission component; a precisely targeted opportunity hitting three scores 38.8. Saturation narrowed the gap and left the ranking inverted.",
    "One concept written as three spelling variants counts as three hits and earns 77.7 percent of the mission maximum where the concept alone earns 39.3.",
    "An opportunity publishing no award range scores 10 of 20; one publishing an amount far outside the applicant's band scores less. Silence outranks disclosure."
  ],
  "sources": [
    {
      "url": "node -e over max*(1-exp(-hits/k)) with k=2",
      "result": "Confirmed the technique's published figures exactly (39.3, 63.2, 77.7, 91.8, 99.3 percent at 1, 2, 3, 5 and 10 hits) and confirmed the function is strictly increasing over the hit count. Establishes that saturation cannot demote a high-hit document; establishes nothing about what k or what curve would, which remains a design question."
    }
  ],
  "documents": {
    "grant-matching.md": {
      "disposition": "clarify",
      "reason": "The gate-then-rank-then-explain framing and the leakage diagnosis are the best statement of this domain in the bundle, and the adversarial-surface section is honest about its own residual risk. Two corrections: 'overlap must saturate' is offered as the cure for meta-announcements outranking tight fits, which a monotone transform cannot deliver; and its list of pass/fail facts includes award-capacity fit while geography appears only as a score component, which is the inversion the techniques then disagree about."
    },
    "techniques/diminishing-returns-keyword-overlap.md": {
      "disposition": "clarify",
      "reason": "The failure mode it identifies is real and well described, the curve and its published percentages are arithmetically correct, and the keep-the-matched-terms-from-the-identical-rule instruction is exactly right. But the claim that the curve treats a high hit fraction as weak evidence 'automatically' is false for any strictly increasing transform, and the parallel claim that saturation 'absorbs' variant inflation understates a two-fold credit difference while listing the real fix as optional."
    },
    "techniques/explainable-match-reasons.md": {
      "disposition": "clarify",
      "reason": "Explain-from-components, evidence recovered with the identical matching rule, tiered language for tiered credit, silence for empty components, and the directional rule that signals flow into the score before they flow out into reasons — all sound and all self-supporting. The one thing to fix is the uncited claim that the recommender-explainability literature 'consistently finds' post-hoc explanations fail fidelity; the technique loses nothing by dropping it."
    },
    "techniques/injection-safe-rfp-analysis.md": {
      "disposition": "keep",
      "reason": "Per-class delimiters with forged-delimiter stripping, the security rule stated in task terms next to the data, hard bounds, a strict schema that makes hijacked output unparseable rather than believable, and the your-own-user's-uploads-are-untrusted rule. It states the content-mimicking limit in its own decision rules and puts the last line of defense in the architecture. The earlier charge that it presents mitigation as guarantee is not supported and is retracted."
    },
    "techniques/llm-plus-deterministic-two-lane.md": {
      "disposition": "keep",
      "reason": "The division of authority is precisely drawn, the ship-deterministic-first argument is about knowing what you are scoring rather than about cost alone, the substance check that treats a parseable empty summary as a failure is a genuinely non-obvious rule, and the cache key covers every profile field the analysis reads. Model claims are correctly bounded to qualitative judgment; the earlier superiority charge is retracted."
    },
    "techniques/verdict-thresholds.md": {
      "disposition": "clarify",
      "reason": "Small fixed vocabulary, gate before score, one derivation site, band-with-score-visible, unknown-does-not-force-ineligibility and the recalibrate-only-above-the-sample-floor rule are all right. Its hard-gate enumeration excludes geography while including the award-capacity heuristic, which contradicts weighted-component-scoring in the same subject and reproduces the golden path's own eloquent-ineligible failure mode."
    },
    "techniques/weighted-component-scoring.md": {
      "disposition": "clarify",
      "reason": "Name-before-weight, gate-don't-weight, structured field beats text heuristic, conservative detectors with documented false positives, currency normalization at ingest, and one-change-at-a-time tuning are all strong. It says a hard geography mismatch 'should already have failed eligibility', which the sibling verdict technique's gate list does not permit. One of the two has to move."
    },
    "applications/node--weighted-component-scoring.md": {
      "disposition": "clarify",
      "reason": "A good record of the pattern, and the two transplant lessons it names — the conservative federal-agency detector with its Texas Workforce Commission exclusion, and the USD-normalization comment — are worth carrying anywhere. It records AWARD_UNKNOWN_DEFAULT at half the component maximum without noting that the technique calls for a small default, so an unpublished award range outscores a published mismatched one. Historical code and verified_on 2026-08-19 preserved; not rerun."
    },
    "applications/process--injection-safe-rfp-analysis.md": {
      "disposition": "keep",
      "reason": "A faithful and detailed record of the prompt pipeline: two trust classes with two delimiter tokens, per-class sanitizers, line sanitizing for single-line fields, the pre-bounded reference blob that is omitted when empty, the strict schema with the honesty instruction, and the parser treating an empty summary as failure. Its authority-boundary section restates the same hard-gate list the techniques disagree about, but the injection argument it is making does not depend on geography. Historical prompt and date not refreshed."
    }
  }
}
```
