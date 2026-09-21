---
domain: grant-funding
subject: impact-reporting
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# impact-reporting

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/impact-reporting",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:2c0c9fc94b672ca7",
  "disposition": "reverify",
  "coverage": "All 11 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "FY2026 can end June 30; parsing it as December 31 moves the schedule by six months.",
    "A report due twelve hours ago has Math.ceil(daysRemaining) equal to negative zero, so a less-than-zero alarm can miss it.",
    "Two grants each report the same 20 trainees: aligned indicator labels do not justify 40 distinct people.",
    "50,000 dollars divided by 50,000 dollars per FTE-year is one FTE-year, not a counted job."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/grant-operations/impact-reporting",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://grants.nih.gov/grants-process/post-award-monitoring-and-reporting/reporting-requirements/research-performance-progress-report-rppr",
      "scope": "Current primary final RPPR timing: 120 days from end of period of performance."
    },
    {
      "url": "https://www.commonapproach.org/standards/common-framework/",
      "scope": "Primary framework separates aggregation methodology from data interoperability."
    }
  ],
  "documents": {
    "impact-reporting.md": {
      "disposition": "reverify",
      "reason": "Four questions are a scaffold, not universal requirements. No miss can be an honest result. Awarded, received, spent and attributable impact are distinct; matching indicators does not make counts additive. Report timing and future funding consequences depend on award rules, and missing dates must not look safely upcoming."
    },
    "techniques/four-section-report-model.md": {
      "disposition": "reverify",
      "reason": "Minimum character counts admit repeated placeholders and cannot prove substance. Required content follows the actual report form, not an unconditional four-section denominator. Reach allocation is not causal attribution; 10 percent variance and word ranges are advisory examples."
    },
    "techniques/honest-misses-disclosure.md": {
      "disposition": "reverify",
      "reason": "Useful warning-only qualification contradicts the golden-path mandatory miss. Causes may be genuinely external or unknown, changes may be unnecessary, and qualitative misses need not have invented numbers. Comparative fundability and officer-reading claims are unsupported."
    },
    "techniques/modeled-figure-marking.md": {
      "disposition": "clarify",
      "reason": "Repaired estimates versus bounds, dimensional units, causal language, invalid-input defaults and assumptions. Award dollars divided by dollars per FTE-year produce FTE-years, not jobs or observed employment."
    },
    "techniques/per-funder-track-record.md": {
      "disposition": "reverify",
      "reason": "An award with unknown amount is still an award; positive committed funds are not necessarily received or spent. Keep monetary totals with known amounts separate from award counts and unknowns, model missing currencies and refunds, and do not call fundraising totals delivered impact. Shared predicate alone cannot prove reconciliation."
    },
    "techniques/report-calendar-derivation.md": {
      "disposition": "clarify",
      "reason": "Repaired fiscal calendar requirements, actual obligation schedule, unknown dates and exact overdue comparisons. Current-period interim reporting is valid, and default grace is planning rather than a legal deadline."
    },
    "techniques/shared-indicator-alignment.md": {
      "disposition": "clarify",
      "reason": "Repaired comparability versus additivity, overlap and denominators, scoped definitions and revised mappings. Alignment supports exchange but cannot alone prevent double counting or establish causal contribution."
    },
    "techniques/verifiable-impact-certificates.md": {
      "disposition": "reverify",
      "reason": "An all-present-checks verdict can pass an empty or incomplete check set: require a declared expected set and unknown statuses. Hashes need trusted comparison and do not establish issuer authenticity or factual truth; keyed schemes need actual key validation. Expiry concerns current validity, not erasing historical facts, and publication requires appropriate authority/privacy scope."
    },
    "applications/node--modeled-figure-marking.md": {
      "disposition": "reverify",
      "reason": "Historical code/date retained. Formatter conflates FTE-years with FTE, hides negatives as zero and emits non-finite values; less-than-one does not identify a model. Denominator fallback and positive awards do not establish labor impact. A log-only truncation warning does not adequately qualify a public total."
    },
    "applications/node--report-calendar-derivation.md": {
      "disposition": "reverify",
      "reason": "Historical source/date retained, not rerun. FY year need not end December 31; Math.ceil(-0.5) is negative zero and can delay overdue detection. Unknown-as-upcoming conceals missing evidence; status submitted requires receipt and correction semantics. Overriding grace is not necessarily an explicit due-date override."
    },
    "applications/process--shared-indicator-alignment.md": {
      "disposition": "reverify",
      "reason": "Historical snapshot/date unchanged. Primary NIH guidance gives final RPPR 120 days, contradicting the stated 30. Common Approach distinguishes interoperability from aggregation methodology; mapping is not free additivity. Other survey counts, agency rules and revision effective dates were not independently refreshed."
    }
  }
}
```

### 2026-09-10 — architecture re-review after the compression revert

I read all eleven documents at their restored bytes. The record above was
written against text the revert removed; its digest (2c0c9fc94b672ca7) no
longer matches the tree (72dcd7f031e68ec6). I re-derived every finding.

The strongest finding is a checkable factual error. In
applications/process--shared-indicator-alignment.md the "Federal
financial-reporting windows" section reads: "Agency variation is real: NIH
final progress reports at 30 days, NSF final project reports at 120 — the
derivation technique's 'the stated deadline wins, always' rule exists precisely
because the class-level defaults have this much spread." NIH's Final RPPR is
due within 120 calendar days of the end of the period of performance, and the
Interim RPPR carries the same 120-day window. The 30-day figure is wrong, and
because the sentence uses that gap as its evidence for spread, the example
argues against the rule it is offered to support: NIH and NSF are the same
number, and both agree with the 2 CFR 200.344 figure the bullet above it cites.
The rest of that bullet list is unverified in this run.

Second, a live contradiction between the golden path and one of its own
techniques. impact-reporting.md says "a report that names no miss anywhere is
treated as incomplete, not as good news" — a completion state. honest-misses-
disclosure.md says the same screen "is a reviewer's-attention flag, not a
submission blocker. A period can be genuinely smooth". The technique is right
and the golden path overstates it; a reader implementing from the golden path
alone builds a gate that mandates a synthetic confession, which the technique
explicitly forbids under "do not manufacture a miss".

Third, report-calendar-derivation asserts that the period notation
"deterministically fixes the period's last day" and gives "a fiscal year ends
on its final day" as an example. A fiscal-year label does not fix a date
without a fiscal calendar: the US federal fiscal year ends 30 September, many
nonprofits close 30 June, and the Node application shows the notation resolving
to 31 December UTC unconditionally. Any organization on a non-calendar fiscal
year gets a due date up to six months out with no signal that anything was
assumed. The application's transplant note tells adopters to extend the
notation set per funder fiscal calendars, which is close, but neither document
names the assumption the current regex encodes.

Fourth, I confirmed the negative-zero edge the earlier record raised, by
checking the language semantics directly (node -e, no repo code executed):
Math.ceil(-0.5) is negative zero, and negative zero is not less than zero. The
technique's rule "round conservatively toward the alarm" and the application's
"Math.ceil on the day count rounds toward the alarm" are both true on the
due-soon side (13.2 rounds to 14, which trips a 14-day window) and false on the
overdue side, where ceil rounds toward zero and a report due a few hours ago
can fail a strict less-than-zero overdue test. This is a narrow window but it
is exactly the window the whole calendar exists to catch.

Fifth, verifiable-impact-certificates defines the aggregate verdict as "all
checks passed, computed over every check present". Its rule 1 correctly keeps
failed checks in the document, but an omitted check is not a failed check: a
certificate assembled with two of five checks still renders all-green, which is
the "clean is not ready unless every check ran" law failing on its own page.
The fix is a declared expected check set, so absence is visible as absence.

Sixth, the Node modeled-figure application shows formatJobsEnabled taking
fteYears and emitting "≈X FTE". FTE-years and FTE are different quantities —
one is labor-time, the other a headcount-equivalent at an instant — and the
same technique's rule 5 insists the presentation match the epistemics. The
certificate note quoted at impact.ts:84 makes the same substitution. The
sub-one branch also maps any non-positive value, including a negative, to
"0 FTE".

I retract three of the earlier record's charges. four-section-report-model's
substance floor is not offered as a quality measure — the text says outright it
defeats TBD and TODO "without judging quality". per-funder-track-record does
not conflate committed with received money; its countability rule is stated
twice and the truncation caveat is present. shared-indicator-alignment does not
claim alignment produces additivity; rule 1 and rule 4 are explicit that a
strained mapping poisons aggregates. Those three are keeps.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/impact-reporting",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:72dcd7f031e68ec6",
  "disposition": "clarify",
  "coverage": "All 11 owned documents read in full at restored bytes. Checked NIH reporting timing against public sources; checked JavaScript Math.ceil semantics by running node -e on the language primitive only. Not evaluated: the grant-writing-nonprofits repo at runtime, IRIS+ or Common Approach taxonomy content beyond their stated purpose, the 2024-2026 trust-based-philanthropy survey figures, and the verified_on dates of the three applications, which are left unchanged.",
  "counterexamples": [
    "An organization whose fiscal year ends 30 June files an FY2026 report: the FY notation resolves to 31 December and the derived due date lands six months late, silently.",
    "A report due eight hours ago yields a day count of negative zero after Math.ceil, so a strict less-than-zero overdue test leaves it in due_soon.",
    "A certificate built with two of five intended checks, both passing, renders the all-checks-passed verdict.",
    "A grant funds 4.2 FTE-years spread over three years; reporting it as 4.2 FTE implies four people employed now.",
    "A quarter genuinely without a shortfall produces a lessons section with no miss language, which the golden path's rule marks incomplete."
  ],
  "sources": [
    {
      "url": "https://grants.nih.gov/grants-process/post-award-monitoring-and-reporting/reporting-requirements/research-performance-progress-report-rppr",
      "result": "Direct fetch refused with HTTP 403, so the primary page itself was not read. A web search returned era.nih.gov closeout help and several university research-office pages agreeing that the Final RPPR and the Interim RPPR are both due within 120 calendar days of the period-of-performance end date. That is enough to contradict the corpus's 30-day claim; a direct read of the NIH page would settle it beyond doubt."
    },
    {
      "url": "node -e Math.ceil(-0.5)",
      "result": "Confirmed the result is negative zero and that the comparison against zero with a strict less-than operator is false. Establishes the arithmetic edge only; does not establish that the repo's reportBucket uses a strict less-than test, which was read from the application document rather than from source."
    }
  ],
  "documents": {
    "impact-reporting.md": {
      "disposition": "clarify",
      "reason": "Strong and well-argued throughout, but its miss-disclosure rule ('a report that names no miss anywhere is treated as incomplete') is stricter than the technique it links to, which calls the same screen a reviewer's-attention flag and warns against mandating a synthetic confession. One of the two has to move; the technique has the better argument."
    },
    "techniques/four-section-report-model.md": {
      "disposition": "keep",
      "reason": "The four questions, the per-section craft, the word bands as attention bands rather than compliance rules, and the funder-template mapping are all correctly bounded. The substance floor is explicitly described as placeholder-proofing that does not judge quality; the earlier charge that it 'cannot prove substance' is answered in the text and is retracted."
    },
    "techniques/honest-misses-disclosure.md": {
      "disposition": "keep",
      "reason": "The asymmetry argument is stated as a portfolio-comparison claim rather than a measured fundability result, the three-part miss structure earns its place, and the detector is honestly labelled crude with real false-negative risk. The legal/regulatory carve-out in 'when not to use it' is the right boundary."
    },
    "techniques/modeled-figure-marking.md": {
      "disposition": "keep",
      "reason": "The marker-on-the-value argument, the guarded denominator, the real-inputs rule and the verb discipline in rule 5 are correct and each names its failure. It is the technique the Node application under-delivers on, not the source of the problem."
    },
    "techniques/per-funder-track-record.md": {
      "disposition": "keep",
      "reason": "Countability defined once and shared, the visible Unattributed bucket, deterministic tie-break, small-sample suppression at cell rather than row grain, and the truncated-total warning are each concrete and correctly scoped. No unsupported claim found."
    },
    "techniques/report-calendar-derivation.md": {
      "disposition": "clarify",
      "reason": "Two boundary statements are too strong. 'Period notation deterministically fixes the period's last day' does not hold for a fiscal-year label without a fiscal-calendar parameter, and 'round conservatively toward the alarm' fails on the overdue side, where ceiling rounds toward zero. The false-alarm rule and the current-period rule are excellent and should survive any edit."
    },
    "techniques/shared-indicator-alignment.md": {
      "disposition": "keep",
      "reason": "Map-faithfully-or-not-at-all, mapping-as-provenance with a taxonomy version, the funder's set winning, and the taxonomy-is-not-the-theory rule are all sound. The earlier charge that it promises additivity is not in the text and is retracted."
    },
    "techniques/verifiable-impact-certificates.md": {
      "disposition": "clarify",
      "reason": "The failed-checks-stay, provenance, sign-the-built-object, expiry-is-a-distinct-state and disclose-the-scheme rules are all right. The aggregate verdict is defined over 'every check present', which passes vacuously when a check was never assembled. It needs a declared expected set so an absent check is distinguishable from a passing one."
    },
    "applications/node--modeled-figure-marking.md": {
      "disposition": "clarify",
      "reason": "A good field record of the marker-at-the-formatter move and of the shared countability predicate. But the formatter takes fteYears and renders 'FTE', and the quoted certificate note repeats the substitution; the technique's own rule 5 forbids exactly this kind of unit laundering. The sub-one branch also collapses negative values to '0 FTE'. Historical code and verified_on 2026-08-19 preserved; not rerun."
    },
    "applications/node--report-calendar-derivation.md": {
      "disposition": "clarify",
      "reason": "Accurately documents the retrofit-by-derivation design and quotes the false-alarm rule verbatim, which is the most valuable thing in it. It reports the FY regex resolving to 31 December UTC without noting that this assumes a calendar fiscal year, and repeats 'Math.ceil rounds toward the alarm', which is false at the negative-zero boundary. Historical source and date not rerun."
    },
    "applications/process--shared-indicator-alignment.md": {
      "disposition": "reverify",
      "reason": "Contains a source-contradicted claim: NIH final progress reports are not due at 30 days but at 120, the same as NSF and the same as 2 CFR 200.344, so the sentence's asserted agency spread does not exist as written. Separately, the IRIS+ and Common Approach descriptions, the trust-based philanthropy survey figures, the SF-425 windows and the 2024 Uniform Guidance thresholds were not re-checked in this run. verified_on 2026-08-20 left unchanged."
    }
  }
}
```
