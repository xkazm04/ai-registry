---
subject: earned-autonomy-tiers
domain: software-engineering
last_touched: 2026-10-31
dry_streak: 0
---

# earned-autonomy-tiers

## Architecture review - 2026-10-31

This is the first review, against `a5a09a30c`. The golden path, five techniques and
two node applications were read in full. All 36 line-anchored quotes in the two
applications were checked against the pinned `afterlife` commit `009c7893`, and each
matched its stated line. Three things need a clarify:

- The golden path's technique list says "unknown as the bottom". Its own body and the
  technique both say unknown resolves *below* the ladder.
- asymmetric-promotion-and-demotion announces "four rules" for tripwires and then lists six.
- The effective-tier application does not say that the source picks the unique holder
  whose name contains the class's role before it refuses.

The driving-automation analogy (the level is set by who is the fallback, not by
capability) was corroborated only through secondary summaries of SAE J3016. The
standard's own page did not render. The analogy is framing, not a load-bearing rule,
so it stays.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/earned-autonomy-tiers",
  "date": "2026-10-31",
  "baseline": "a5a09a30c",
  "digest": "sha256-b2:aebaaeb92019b866",
  "disposition": "clarify",
  "coverage": "All 8 documents were read in full, and the counts and internal cross-references were checked. All 36 quoted source lines in the two applications were fetched at the pinned commit and matched. The rule-of-three arithmetic was recomputed. Not evaluated: running the afterlife engine, any connected-project runtime, and the full text of SAE J3016.",
  "counterexamples": [
    "In a single-agent system where a person reviews every landed change, defaulting an unknown standing to assisted costs nothing. The effective-tier technique scopes this out under 'When not to use it'.",
    "Fifteen clean actions with zero failures bound the failure rate only below about one in five at 95% (exact 1 - 0.05^(1/15) = 0.181). A bar written as raw counts can be far looser than its author believed.",
    "A revert carried by a rival agent's change can be fabricated to demote a competitor. Automatic attribution therefore demotes nobody, and the event is surfaced for a person.",
    "A class whose outcomes surface only in a quarterly audit cannot score a shadow trial inside any useful window."
  ],
  "sources": [
    {
      "url": "https://github.com/xkazm04/afterlife/tree/009c7893",
      "result": "Raw files fetched at 009c7893: gitlab/apply/README.md, gitlab/components/scripts/lib/detect.mjs, engine/decide/{tripwire,standing,shadow}.ts, engine/README.md, src/schemas/tier.ts, src/lib/promotion/promotion.ts, policy/{trust-policy,tier-state}.yml. All 36 quotes matched at their stated lines. standing.ts:22 reads 'the one given, the only holder, or the unique holder whose name includes the role'. A role-named holder is chosen before the refusal, and the application omits this. detect.mjs looks up the carrier only among agent merge requests, so a person-carried revert has no carrier and still counts, which matches the technique."
    },
    {
      "source": "Secondary summaries of SAE J3016 (web search; the sae.org standard page returned no body)",
      "result": "They consistently report that the levels classify the roles of human and system (who performs the driving task and who provides fallback), not capability, and that the operational design domain is separate from the level. This supports the golden path's framing. The primary text was not read."
    },
    {
      "source": "Arithmetic in techniques/recomputable-promotion-trial.md",
      "result": "Rule of three: 3/15 = 0.20, and the exact 95% bound is 0.181, so 'below one in five' holds. Counted lists: promotion has four properties (4), the bar names five things (5), and the tripwire section says 'four rules' but lists six."
    }
  ],
  "documents": {
    "earned-autonomy-tiers.md": {
      "disposition": "clarify",
      "reason": "The technique list's 'unknown as the bottom' contradicts the body ('resolves below the ladder ... not even the bottom rung') and the technique's 'Unknown is below the ladder'. It should read 'unknown below the ladder'. The thesis, the off-ladder states and the boundary against hitl-approval, machine-paced-delivery and proof-carrying-agent-actions are sound."
    },
    "techniques/effective-tier-is-the-lowest-bound.md": {
      "disposition": "keep",
      "reason": "The minimum-as-combinator argument (adding a bound can only lower the result), vetoes ahead of the minimum, the binding bound returned, and the unknown cases are coherent. They match the source. 'unknown-is-assisted' appears only as an explicit when-not-to-use simplification."
    },
    "techniques/asymmetric-promotion-and-demotion.md": {
      "disposition": "clarify",
      "reason": "'Its design has four rules' precedes six bolded rules: model-free, amount, fires before anything else, idempotent, cooldown, recorded change. It should say six. The substance is sound and matches the source (policy schedule, cooldown, conditional write, scheduled-sweep exception)."
    },
    "techniques/shadow-next-rung.md": {
      "disposition": "keep",
      "reason": "Pre-registration timing, only acted-alone rows count as trials, edit-before-land counts as a catch, inconclusive below the minimum, and the shadow kept out of standing are all coherent. The source's shadow follows the same rules (raised copy, the real gate, nothing over the ceiling)."
    },
    "techniques/recomputable-promotion-trial.md": {
      "disposition": "keep",
      "reason": "The five-term bar, lower-bound statistic, gated-only record and hash-chain cut are coherent. The rule-of-three figure was recomputed and is correct."
    },
    "techniques/demotion-attribution-integrity.md": {
      "disposition": "keep",
      "reason": "The three traps, complete-or-fail scan, unattributed as a result and negative fixtures are coherent and match the source's detect.mjs behaviour."
    },
    "applications/node--demotion-attribution-integrity.md": {
      "disposition": "keep",
      "reason": "All 15 quotes matched at 009c7893. The trailer-fallback deviation and the scheduled-sweep deviation are disclosed. verified_on can move to 2026-10-31 on this re-check."
    },
    "applications/node--effective-tier-is-the-lowest-bound.md": {
      "disposition": "clarify",
      "reason": "All 21 quotes matched. Add one sentence: before refusing, the source picks the unique holder whose name contains the class's role (standing.ts:22). That is a naming convention in policy files, not a value from the action, and CI always names the agent. It sits beside the technique's 'never the most likely holder' and should be disclosed."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the three clarify items from the record above, against `a5a09a30c`. Two of
them fix internal errors that were verified by re-reading the text. The third is an
application disclosure taken from the pinned source line, which was fetched this run.
Both applications had every citation re-checked this run, so their `verified_on`
dates moved to 2026-10-31. Nothing is owed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/earned-autonomy-tiers",
  "date": "2026-10-31",
  "baseline": "a5a09a30c",
  "digest": "sha256-b2:d87bb329a363a269",
  "disposition": "keep",
  "coverage": "All 8 documents decided. The three clarify edits were made and the edited lines re-read. The 36 application quotes were checked at afterlife 009c7893 this run, plus the newly cited standing.ts:22. The other documents are byte-unchanged. Not evaluated: running the afterlife engine, and the primary text of SAE J3016 (secondary summaries only).",
  "counterexamples": [
    "In a single-agent system where a person reviews every landed change, defaulting an unknown standing to assisted costs nothing. The effective-tier technique scopes this out under 'When not to use it'.",
    "Fifteen clean actions with zero failures bound the failure rate only below about one in five at 95% (exact 1 - 0.05^(1/15) = 0.181). A bar written as raw counts can be far looser than its author believed.",
    "A revert carried by a rival agent's change can be fabricated to demote a competitor. Automatic attribution therefore demotes nobody, and the event is surfaced for a person.",
    "A class whose outcomes surface only in a quarterly audit cannot score a shadow trial inside any useful window."
  ],
  "sources": [
    {
      "url": "https://github.com/xkazm04/afterlife/tree/009c7893",
      "result": "Re-read this run. All 36 cited lines matched. standing.ts:22 reads 'the one given, the only holder, or the unique holder whose name includes the role', which is the basis for the new disclosure."
    },
    {
      "source": "Secondary summaries of SAE J3016",
      "result": "They support the framing that levels are defined by roles and fallback, with the ODD separate from the level. The primary text was not read."
    }
  ],
  "documents": {
    "earned-autonomy-tiers.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the technique list's 'unknown as the bottom' now reads 'unknown below the ladder', matching the body and the technique."
    },
    "techniques/effective-tier-is-the-lowest-bound.md": {
      "disposition": "keep",
      "reason": "Unchanged. The minimum-as-combinator, vetoes ahead of the minimum and the unknown cases are coherent and match the source."
    },
    "techniques/asymmetric-promotion-and-demotion.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'Its design has four rules' now reads 'six rules', matching the six it lists."
    },
    "techniques/shadow-next-rung.md": {
      "disposition": "keep",
      "reason": "Unchanged. Pre-registration timing, acted-alone trials, edit-before-land as a catch and inconclusive below the minimum are coherent."
    },
    "techniques/recomputable-promotion-trial.md": {
      "disposition": "keep",
      "reason": "Unchanged. The rule-of-three figure was recomputed and is correct."
    },
    "techniques/demotion-attribution-integrity.md": {
      "disposition": "keep",
      "reason": "Unchanged. Coherent, and it matches detect.mjs behaviour."
    },
    "applications/node--demotion-attribution-integrity.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: all 15 citations were re-checked at 009c7893 and verified_on moved to 2026-10-31. Disclosed deviations unchanged."
    },
    "applications/node--effective-tier-is-the-lowest-bound.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added a disclosure that the source picks the unique role-named holder before refusing (standing.ts:22). Citations re-checked and verified_on moved to 2026-10-31."
    }
  }
}
```
