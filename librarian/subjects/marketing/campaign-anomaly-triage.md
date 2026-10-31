---
subject: campaign-anomaly-triage
domain: marketing
last_touched: 2026-09-09
touched_by: intake-marketing-0909 (forge wave)
dry_streak: 0
---

# campaign-anomaly-triage

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `paid-advertising`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** ranking which campaigns a paid-search manager should open first, designing badges and alerts over a paid portfolio, deciding whether a metric move is an anomaly or weekday noise, stopping an alert inbox from repeating itself

**Techniques (7):** crater-vs-slow-bleed, disjoint-severity-rules-worst-first, hysteresis-and-cooldown-tombstones, one-target-reciprocal-thresholds, severity-times-spend-attention-order, spend-spike-without-return, weekday-deseasonalised-baseline.

**Applications (3; stacks: node):** node--hysteresis-and-cooldown-tombstones, node--one-target-reciprocal-thresholds, node--weekday-deseasonalised-baseline.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.

## Owed

- Single-stack debt: born with the stacks above; an external reconcile against a
  second tree is the next pass.
- No `librarian/applied.md` row yet except where the source note says so; the
  unapplied backlog is every technique here without a row.

## Architecture review 2026-10-31

Trigger: pending since forging (no prior record). Intended benefit: one cheap,
deterministic verdict and ordering, identical on every surface. Failure if ignored:
surfaces disagree, inboxes repeat, slow slides go unbadged. Boundary: the verdict and
its order only; actions belong to the neighbour subjects named in the golden path.
Correction to the first-touch entry above: the subject now carries 7 node
applications, not 3 (four were added by the 2026-10-14 A/B wave).

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/campaign-anomaly-triage",
  "date": "2026-10-31",
  "baseline": "c99b6d9db",
  "coverage": "All 15 documents read in full (golden path, 7 techniques, 7 node applications). Source checks cover the external claims (3-sigma convention, platform learning delay, last-click attribution); arithmetic (1/0.6, 1/0.18, sqrt((n-1)/n) rescale) checked by hand. The consumer workspace is not on this machine; application citations were not re-opened and their verified_on dates are unchanged.",
  "counterexamples": [
    "A row with cost, conversions above zero and conversion value exactly zero (conversions tracked without value) matches no return-axis rule: rule 2 needs zero conversions, rule 3 needs positive return.",
    "A deliberate scale-up in its learning window fires the spend-spike rule with honest numbers although the platform says performance has not stabilised yet.",
    "A prospecting campaign trends red on last-click return without being broken; the subject labels the funnel role instead of changing the threshold.",
    "An account with strong non-weekly seasonality is under-served by a weekday-only profile; calendar events are the manual substitute."
  ],
  "sources": [
    {
      "url": "https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc31.htm",
      "result": "Supports the weekday technique's 'three is the number general-purpose guidance quotes': 'Usually this multiple is 3 and thus the limits are called 3-sigma limits' and '3σ limits are the practical equivalent of 0.001 probability limits'. 2.5 remains labelled convention, correctly."
    },
    {
      "url": "https://support.google.com/google-ads/answer/13020501",
      "result": "Supports spend-spike's 'delayed conversions and learning periods lag value behind cost': 'It can take up to 1 to 2 conversion cycles for performance to stabilize'; evaluate 'over 2 conversion cycles or a 2 week window (whichever is longer) accounting for conversion delay'. The subject's 'on some platforms' hedge is right; no number is quoted that needs correcting."
    },
    {
      "url": "https://support.google.com/google-ads/answer/6259715",
      "result": "Last click 'Gives all credit for the conversion to the last-clicked ad'; only last click and data-driven remain available. Supports the under-crediting rationale for prospecting campaigns; the subject names no retired model."
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated A/B reports retained as written; private workspace evidence not re-executed. Original verification dates unchanged."
    }
  ],
  "digest": "sha256-b2:a78ea1170fae119e",
  "disposition": "clarify",
  "documents": {
    "campaign-anomaly-triage.md": {
      "disposition": "keep",
      "reason": "Scope boundaries to neighbour subjects are explicit; every principle is carried by a technique; conventions are labelled; consistent with the techniques after the disjoint fix (it states bands, not clauses)."
    },
    "techniques/crater-vs-slow-bleed.md": {
      "disposition": "clarify",
      "reason": "Still owed: clause 2's 'a fall to exactly zero is the spending-without-conversions rule's territory' holds only when zero value implies zero conversions; a zero-value row with conversions is reported by neither rule. Resolution depends on the disjoint-rules decision below, so not applied."
    },
    "techniques/disjoint-severity-rules-worst-first.md": {
      "disposition": "clarify",
      "reason": "Internal inconsistency: its own decision rule (and the node application's A/B) gives the ratio rules the zero-conversion complement, but the rule-set listing for rules 3-5 omits that clause. Also owed: decide whether value exactly zero with conversions above zero is a deliberate silence (not measured) or a gap."
    },
    "techniques/hysteresis-and-cooldown-tombstones.md": {
      "disposition": "keep",
      "reason": "Write order and run-on-empty-input are correctness with incidents recorded; cooldown, cap and band are labelled convention."
    },
    "techniques/one-target-reciprocal-thresholds.md": {
      "disposition": "keep",
      "reason": "1/0.6 = 1.6667 and the [1.6, 1.667) band arithmetic verified; scope rule and break-even boundary are sound."
    },
    "techniques/severity-times-spend-attention-order.md": {
      "disposition": "keep",
      "reason": "Lexicographic weight with a 10^12 minor-unit constant cannot cross a severity boundary at plausible spend; identifier tie-break and shared-input rule match the application."
    },
    "techniques/spend-spike-without-return.md": {
      "disposition": "keep",
      "reason": "Zero-base stand-in rule matches the application; learning-delay caveat supported by the platform's own documentation."
    },
    "techniques/weekday-deseasonalised-baseline.md": {
      "disposition": "keep",
      "reason": "Whole-week windows, present-days-only ratio baselines and coverage tiers are internally consistent; the 3-sigma claim is supported by NIST; 2.5 is labelled convention."
    },
    "applications/node--crater-vs-slow-bleed.md": {
      "disposition": "keep",
      "reason": "Dated A/B with target and floor arms and a return condition; consistent with the technique's zero-spend-day rule."
    },
    "applications/node--disjoint-severity-rules-worst-first.md": {
      "disposition": "keep",
      "reason": "Dated A/B; it is the evidence for the clarify applied to the technique."
    },
    "applications/node--hysteresis-and-cooldown-tombstones.md": {
      "disposition": "keep",
      "reason": "Pinned-commit reconciliation with line citations; deviation (band defined at call site) disclosed. Not re-opened this run."
    },
    "applications/node--one-target-reciprocal-thresholds.md": {
      "disposition": "keep",
      "reason": "Pinned reconciliation; 1/0.18 'about 5.6x' checked. Not re-opened this run."
    },
    "applications/node--severity-times-spend-attention-order.md": {
      "disposition": "keep",
      "reason": "Dated A/B with shipped commit and unmeasured items stated."
    },
    "applications/node--spend-spike-without-return.md": {
      "disposition": "keep",
      "reason": "Dated A/B; matches the technique's zero-base decision rule."
    },
    "applications/node--weekday-deseasonalised-baseline.md": {
      "disposition": "keep",
      "reason": "Pinned reconciliation; the sqrt((n-1)/n) bar rescale is the correct equivalence between population and sample z. Not re-opened this run."
    }
  }
}
```

Phase B applied the one internally verifiable clarify (disjoint rule listing). The
crater clause and the zero-value-with-conversions gap remain owed because they need a
design decision, not a source. Re-recorded against the new digest:

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/campaign-anomaly-triage",
  "date": "2026-10-31",
  "baseline": "c99b6d9db",
  "coverage": "All 15 documents read in full (golden path, 7 techniques, 7 node applications). Source checks cover the external claims (3-sigma convention, platform learning delay, last-click attribution); arithmetic (1/0.6, 1/0.18, sqrt((n-1)/n) rescale) checked by hand. The consumer workspace is not on this machine; application citations were not re-opened and their verified_on dates are unchanged.",
  "counterexamples": [
    "A row with cost, conversions above zero and conversion value exactly zero (conversions tracked without value) matches no return-axis rule: rule 2 needs zero conversions, rule 3 needs positive return.",
    "A deliberate scale-up in its learning window fires the spend-spike rule with honest numbers although the platform says performance has not stabilised yet.",
    "A prospecting campaign trends red on last-click return without being broken; the subject labels the funnel role instead of changing the threshold.",
    "An account with strong non-weekly seasonality is under-served by a weekday-only profile; calendar events are the manual substitute."
  ],
  "sources": [
    {
      "url": "https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc31.htm",
      "result": "Supports the weekday technique's 'three is the number general-purpose guidance quotes': 'Usually this multiple is 3 and thus the limits are called 3-sigma limits' and '3σ limits are the practical equivalent of 0.001 probability limits'. 2.5 remains labelled convention, correctly."
    },
    {
      "url": "https://support.google.com/google-ads/answer/13020501",
      "result": "Supports spend-spike's 'delayed conversions and learning periods lag value behind cost': 'It can take up to 1 to 2 conversion cycles for performance to stabilize'; evaluate 'over 2 conversion cycles or a 2 week window (whichever is longer) accounting for conversion delay'. The subject's 'on some platforms' hedge is right; no number is quoted that needs correcting."
    },
    {
      "url": "https://support.google.com/google-ads/answer/6259715",
      "result": "Last click 'Gives all credit for the conversion to the last-clicked ad'; only last click and data-driven remain available. Supports the under-crediting rationale for prospecting campaigns; the subject names no retired model."
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated A/B reports retained as written; private workspace evidence not re-executed. Original verification dates unchanged."
    }
  ],
  "digest": "sha256-b2:971c3805269abb5e",
  "disposition": "clarify",
  "documents": {
    "campaign-anomaly-triage.md": {
      "disposition": "keep",
      "reason": "Scope boundaries to neighbour subjects are explicit; every principle is carried by a technique; conventions are labelled; consistent with the techniques after the disjoint fix (it states bands, not clauses)."
    },
    "techniques/crater-vs-slow-bleed.md": {
      "disposition": "clarify",
      "reason": "Still owed: clause 2's 'a fall to exactly zero is the spending-without-conversions rule's territory' holds only when zero value implies zero conversions; a zero-value row with conversions is reported by neither rule. Resolution depends on the disjoint-rules decision below, so not applied."
    },
    "techniques/disjoint-severity-rules-worst-first.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: rules 3, 4 and 5 in the rule-set listing now carry 'conversions above zero', matching the technique's own decision rule. Still owed: decide whether value exactly zero with conversions above zero is a deliberate silence or a gap."
    },
    "techniques/hysteresis-and-cooldown-tombstones.md": {
      "disposition": "keep",
      "reason": "Write order and run-on-empty-input are correctness with incidents recorded; cooldown, cap and band are labelled convention."
    },
    "techniques/one-target-reciprocal-thresholds.md": {
      "disposition": "keep",
      "reason": "1/0.6 = 1.6667 and the [1.6, 1.667) band arithmetic verified; scope rule and break-even boundary are sound."
    },
    "techniques/severity-times-spend-attention-order.md": {
      "disposition": "keep",
      "reason": "Lexicographic weight with a 10^12 minor-unit constant cannot cross a severity boundary at plausible spend; identifier tie-break and shared-input rule match the application."
    },
    "techniques/spend-spike-without-return.md": {
      "disposition": "keep",
      "reason": "Zero-base stand-in rule matches the application; learning-delay caveat supported by the platform's own documentation."
    },
    "techniques/weekday-deseasonalised-baseline.md": {
      "disposition": "keep",
      "reason": "Whole-week windows, present-days-only ratio baselines and coverage tiers are internally consistent; the 3-sigma claim is supported by NIST; 2.5 is labelled convention."
    },
    "applications/node--crater-vs-slow-bleed.md": {
      "disposition": "keep",
      "reason": "Dated A/B with target and floor arms and a return condition; consistent with the technique's zero-spend-day rule."
    },
    "applications/node--disjoint-severity-rules-worst-first.md": {
      "disposition": "keep",
      "reason": "Dated A/B; it is the evidence for the clarify applied to the technique."
    },
    "applications/node--hysteresis-and-cooldown-tombstones.md": {
      "disposition": "keep",
      "reason": "Pinned-commit reconciliation with line citations; deviation (band defined at call site) disclosed. Not re-opened this run."
    },
    "applications/node--one-target-reciprocal-thresholds.md": {
      "disposition": "keep",
      "reason": "Pinned reconciliation; 1/0.18 'about 5.6x' checked. Not re-opened this run."
    },
    "applications/node--severity-times-spend-attention-order.md": {
      "disposition": "keep",
      "reason": "Dated A/B with shipped commit and unmeasured items stated."
    },
    "applications/node--spend-spike-without-return.md": {
      "disposition": "keep",
      "reason": "Dated A/B; matches the technique's zero-base decision rule."
    },
    "applications/node--weekday-deseasonalised-baseline.md": {
      "disposition": "keep",
      "reason": "Pinned reconciliation; the sqrt((n-1)/n) bar rescale is the correct equivalence between population and sample z. Not re-opened this run."
    }
  }
}
```
