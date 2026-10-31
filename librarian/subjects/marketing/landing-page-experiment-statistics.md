---
subject: landing-page-experiment-statistics
domain: marketing
last_touched: 2026-10-31
touched_by: subject-review-1031 (review+apply)
dry_streak: 0
---

# landing-page-experiment-statistics

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `conversion-and-leads`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** declaring or refusing an A/B winner on a landing page, sizing a landing-page test before it starts, reviewing an experiment surface that shows a winner badge, designing how arms are assigned and served, drafting challenger arms for a running or finished test

**Techniques (6):** distinct-hypothesis-per-arm, experiment-pages-print-no-numbers, multi-arm-alpha-correction, peeking-guard, sample-size-trust-gate, uniform-split-disclosed-no-ramping.

**Applications (5; stacks: node):** node--distinct-hypothesis-per-arm, node--experiment-pages-print-no-numbers, node--multi-arm-alpha-correction, node--sample-size-trust-gate, node--uniform-split-disclosed-no-ramping.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.

- 2026-10-22, intake-apply-maac-1022: `multi-arm-alpha-correction` applied to systedo-case
  as an experiment (null replay over the real evaluator, two seeds of 100k tests). The
  shared-control caveat was inverted: the product form measured conservative on a shared
  control (0.046/0.044/0.042 at 3/4/6 arms vs 0.050 independent), so switching to the
  division form is `not-better`. Corrected in the technique, the golden path and the
  trust-gate application, which had carried the same sentence. Also measured: a surface
  that declares only an arm above control spends about half its two-sided budget.

- 2026-10-22, intake-apply-peeking-guard-1022: `peeking-guard` applied to systedo-case
  in code, verdict `better`. The procedure said a closed test is read on confidence
  alone, and the tree did exactly that. A null test closed on its first crossing became
  a winner 0.19-0.22 of the time, against 0.04-0.05 with the gate on closed tests too;
  closing when the gate opens was unchanged at 0.027-0.029. The procedure was inverted,
  and the golden-path summary and the trust-gate application were corrected. Also
  refuted, and not fixed in the tree: "the badge is a single look". Waiting for the
  badge gave 0.094-0.107 null winners in both arms, because the gate moves with the
  observed control rate and the looks continue after it opens. Written up as "What the
  gate does not close".

## Owed

- Single-stack debt: born with the stacks above; an external reconcile against a
  second tree is the next pass.
- Single stack stays: on 2026-10-22 the only other marketing tree in the fleet had no
  experiment surface, so the second stack waits for a tree that grows one.
- Badge-wait leak: the consumer recomputes its horizon on every read; return when it
  stores a horizon at test start or a gate-open snapshot.
- Unapplied: `distinct-hypothesis-per-arm`, `sample-size-trust-gate`,
  `uniform-split-disclosed-no-ramping` have no `librarian/applied.md` row unless the
  ledger says otherwise.
- Mid-test arm change: the consumer swaps a running test's arm list in place with no
  restart disclosure; the technique's rule is unmet there.

## 2026-10-31 - architecture review

First architecture-review record for this subject. Trigger: the subject was `pending`
in `review-coverage.mjs` (no record existed). Intended benefit: a winner on a
landing-page test is declared only when sample, a corrected threshold and an
un-peeked read all hold, and the split under it is the one promised. Failure if
ignored: false winners at several times the nominal rate, which then feed mined
"winning angle" lessons and challenger rounds. Boundary: the page-level causal claim
only; page content belongs to `money-page-conversion-craft` and channel causality to
`attribution-and-incrementality`.

Review findings. The 2026-10-22 peeking-guard correction reached the golden path and
the trust-gate application but left two sentences behind in the techniques: the
trust-gate technique still said "the gate governs *running* tests", and the peeking
guard's own "When NOT to use" said the guard "does not apply retroactively" to a
stopped test, both against its procedure step 1 (a closed test is significant only
past the gate). The multi-arm technique summarised the sibling application's table
as "0.021 to 0.023" for several challengers; the table reads 0.0203 to 0.0229.
Arithmetic re-derived and holding: 1 - 0.95^3 = 0.143 (one in seven); the product
form gives 0.0253 and 0.0170; (15/5)^2 = 9; the pooled formula gives 3,841 at
(0.10, +20%, 0.05, 0.8); the incident shape 0/40 vs 6/45 gives z of about 2.40,
which clears 95%; 8/65 vs 3/60 is a 2.46-fold lift.

Sources. Evan Miller, "How Not To Run an A/B Test": "Try 26.1% - more than five times
what you probably thought the significance level was", for a test after every
observation; supports "roughly a quarter". Wikipedia, Šidák correction: the method is
"conservative for tests that are positively dependent, and liberal for tests that are
negatively dependent" and "exact for tests that are stochastically independent";
supports the shared-control caveat as now written. Fabijan et al., KDD 2019
("Diagnosing Sample Ratio Mismatch"): recommends a chi-square test but names no
p-value bar ("To detect an SRM, a chi-square test can be used"). Secondary sources
put Microsoft's platform at p < 0.0005 and other vendors at p < 0.001, so "one in a
thousand is the common industry bar" holds only as the looser end of a range, and the
uniform-split technique's "one in a hundred as borderline" found no source. That is
left owed, not applied, because no primary source states either bar.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/landing-page-experiment-statistics",
  "date": "2026-10-31",
  "baseline": "df3f1c1d7",
  "digest": "sha256-b2:a5b8d7e67242d3cb",
  "disposition": "clarify",
  "coverage": "All 13 documents read in full. Every threshold and worked number in the golden path and techniques was recomputed. Three primary or reference sources were opened. The application trees (the marketing workspace and systedo-case) were not reopened, and no replay was re-run; their dated reports were checked for internal consistency against the techniques only. No verification date was refreshed.",
  "counterexamples": [
    "A test the operator closes the morning it first crosses the bar is a false winner about one time in five when closed tests are read on confidence alone.",
    "A test kept open until the badge appears still gives about one null winner in ten, because the horizon is recomputed from the observed control rate.",
    "On a shared control with two-sided tests the product-form correction measured conservative (0.042-0.046), not optimistic, so switching to the division form bought nothing.",
    "An up-front unequal split (a risky challenger held to ten percent) is legitimate if the sizing and the ratio check use the intended ratio and it never moves."
  ],
  "sources": [
    {
      "url": "https://www.evanmiller.org/how-not-to-run-an-ab-test.html",
      "result": "Quoted 26.1% false positives for a test after every observation at a nominal 5%; supports the 'roughly a quarter' claim in the golden path and peeking guard."
    },
    {
      "url": "https://en.wikipedia.org/wiki/%C5%A0id%C3%A1k_correction",
      "result": "Quoted: conservative under positive dependence, liberal under negative, exact under independence; supports the multi-arm shared-control caveat."
    },
    {
      "url": "https://exp-platform.com/Documents/2019_KDDFabijanGupchupFuptaOmhoverVermeerDmitriev.pdf",
      "result": "Recommends a chi-square test for SRM and gives no p-value bar; does not support any specific threshold. Secondary sources give 0.0005 (Microsoft) and 0.001 (other vendors)."
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated reports retained; private trees and replays not re-executed. Cross-checked the multi-arm technique's numbers against the application table."
    }
  ],
  "documents": {
    "landing-page-experiment-statistics.md": {
      "disposition": "clarify",
      "reason": "Sound and consistent with the corrected peeking guard. The SRM bar 'one in a thousand is the common industry bar' should name the range (Microsoft's platform is reported at 0.0005, others at 0.001); no primary source states either."
    },
    "techniques/sample-size-trust-gate.md": {
      "disposition": "clarify",
      "reason": "'When NOT to use' still says the gate governs running tests only, against peeking-guard step 1 after the 2026-10-22 correction. Restate: the stopped read is allowed, significance on a closed test still needs this gate."
    },
    "techniques/multi-arm-alpha-correction.md": {
      "disposition": "clarify",
      "reason": "Directional false-winner range for several challengers reads 0.021-0.023; the sibling application's table gives 0.0203-0.0229, so 0.020-0.023. The rest re-derived and the dependence caveat matches the Šidák reference."
    },
    "techniques/peeking-guard.md": {
      "disposition": "clarify",
      "reason": "'When NOT to use' says the guard 'does not apply retroactively' to a stopped test, which contradicts procedure step 1. Should say the guard does not forbid the read, only promotion below the gate. The 26.1% figure is confirmed."
    },
    "techniques/uniform-split-disclosed-no-ramping.md": {
      "disposition": "clarify",
      "reason": "SRM bar: the one-in-a-thousand figure is one end of a reported 0.0005-0.001 range, and 'one in a hundred as borderline' found no source. Name the range, or label the borderline band as this subject's convention."
    },
    "techniques/distinct-hypothesis-per-arm.md": {
      "disposition": "keep",
      "reason": "Structural rules (one-call drafting, headline-collision check, identity binding, loser feed) are design claims backed by the application's incident; no unstable external claim."
    },
    "techniques/experiment-pages-print-no-numbers.md": {
      "disposition": "keep",
      "reason": "Schema-level no-numeric-field, single address, noindex/follow, bounded destination and gated mining are consistent with the golden path and the 2026-10-14 application finding."
    },
    "applications/node--sample-size-trust-gate.md": {
      "disposition": "keep",
      "reason": "Dated report at a pinned commit; it already says the closed-test branch it quotes was changed on 2026-10-22, and the 3,841 sizing pin recomputes. Tree not reopened."
    },
    "applications/node--multi-arm-alpha-correction.md": {
      "disposition": "keep",
      "reason": "Null-replay table is internally consistent (standard error about 0.0007; the 8,080 requirement recomputes to about 8,076). Replay not re-run."
    },
    "applications/node--peeking-guard.md": {
      "disposition": "keep",
      "reason": "Paired replay figures match the technique's summary (1/35 about 0.028, 1/22 about 0.045, badge-wait about 3.6 times the gate read). Replay not re-run."
    },
    "applications/node--distinct-hypothesis-per-arm.md": {
      "disposition": "keep",
      "reason": "Dated report with honest deviations (headline-only distinctness, label-level loser ban). Tree not reopened."
    },
    "applications/node--experiment-pages-print-no-numbers.md": {
      "disposition": "keep",
      "reason": "Dated A/B finding with a stated narrow scope (percentages only). Tree not reopened."
    },
    "applications/node--uniform-split-disclosed-no-ramping.md": {
      "disposition": "keep",
      "reason": "Dated report; the pinned uniformity test and disclosure match the technique. Deviations (no SRM check, no runtime gate) stated. Tree not reopened."
    }
  }
}
```


Second record, after applying the three verified clarify items above. The SRM-bar item
stays owed in the golden path and the uniform-split technique.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/landing-page-experiment-statistics",
  "date": "2026-10-31",
  "baseline": "df3f1c1d7",
  "digest": "sha256-b2:f1979619bc982e07",
  "disposition": "clarify",
  "coverage": "All 13 documents decided. Three clarify items from the record above were applied in this run (the trust-gate and peeking-guard techniques' 'When NOT to use' contradictions, and the multi-arm range against the sibling table), and the edited passages re-read. The other ten documents are byte-unchanged and keep their dispositions. The SRM-bar clarify in the golden path and uniform-split technique stays owed: no primary source states a bar. No private tree or replay was reopened and no verification date was refreshed.",
  "counterexamples": [
    "A test the operator closes the morning it first crosses the bar is a false winner about one time in five when closed tests are read on confidence alone.",
    "A test kept open until the badge appears still gives about one null winner in ten, because the horizon is recomputed from the observed control rate.",
    "On a shared control with two-sided tests the product-form correction measured conservative (0.042-0.046), not optimistic, so switching to the division form bought nothing.",
    "An up-front unequal split (a risky challenger held to ten percent) is legitimate if the sizing and the ratio check use the intended ratio and it never moves."
  ],
  "sources": [
    {
      "url": "https://www.evanmiller.org/how-not-to-run-an-ab-test.html",
      "result": "Quoted 26.1% false positives for a test after every observation at a nominal 5%; supports the 'roughly a quarter' claim in the golden path and peeking guard."
    },
    {
      "url": "https://en.wikipedia.org/wiki/%C5%A0id%C3%A1k_correction",
      "result": "Quoted: conservative under positive dependence, liberal under negative, exact under independence; supports the multi-arm shared-control caveat."
    },
    {
      "url": "https://exp-platform.com/Documents/2019_KDDFabijanGupchupFuptaOmhoverVermeerDmitriev.pdf",
      "result": "Recommends a chi-square test for SRM and gives no p-value bar; does not support any specific threshold. Secondary sources give 0.0005 (Microsoft) and 0.001 (other vendors)."
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated reports retained; private trees and replays not re-executed. Cross-checked the multi-arm technique's numbers against the application table."
    }
  ],
  "documents": {
    "landing-page-experiment-statistics.md": {
      "disposition": "clarify",
      "reason": "Sound and consistent with the corrected peeking guard. The SRM bar 'one in a thousand is the common industry bar' should name the range (Microsoft's platform is reported at 0.0005, others at 0.001); no primary source states either."
    },
    "techniques/sample-size-trust-gate.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'When NOT to use' now says this technique does not decide the stopped read, and a closed test is significant only past this same gate (peeking-guard step 1)."
    },
    "techniques/multi-arm-alpha-correction.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: directional false-winner range for several challengers 0.021-0.023 -> 0.020-0.023, matching the application table."
    },
    "techniques/peeking-guard.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'does not apply retroactively' -> 'does not forbid that read'; the thing to avoid is promotion below the gate."
    },
    "techniques/uniform-split-disclosed-no-ramping.md": {
      "disposition": "clarify",
      "reason": "SRM bar: the one-in-a-thousand figure is one end of a reported 0.0005-0.001 range, and 'one in a hundred as borderline' found no source. Name the range, or label the borderline band as this subject's convention."
    },
    "techniques/distinct-hypothesis-per-arm.md": {
      "disposition": "keep",
      "reason": "Structural rules (one-call drafting, headline-collision check, identity binding, loser feed) are design claims backed by the application's incident; no unstable external claim."
    },
    "techniques/experiment-pages-print-no-numbers.md": {
      "disposition": "keep",
      "reason": "Schema-level no-numeric-field, single address, noindex/follow, bounded destination and gated mining are consistent with the golden path and the 2026-10-14 application finding."
    },
    "applications/node--sample-size-trust-gate.md": {
      "disposition": "keep",
      "reason": "Dated report at a pinned commit; it already says the closed-test branch it quotes was changed on 2026-10-22, and the 3,841 sizing pin recomputes. Tree not reopened."
    },
    "applications/node--multi-arm-alpha-correction.md": {
      "disposition": "keep",
      "reason": "Null-replay table is internally consistent (standard error about 0.0007; the 8,080 requirement recomputes to about 8,076). Replay not re-run."
    },
    "applications/node--peeking-guard.md": {
      "disposition": "keep",
      "reason": "Paired replay figures match the technique's summary (1/35 about 0.028, 1/22 about 0.045, badge-wait about 3.6 times the gate read). Replay not re-run."
    },
    "applications/node--distinct-hypothesis-per-arm.md": {
      "disposition": "keep",
      "reason": "Dated report with honest deviations (headline-only distinctness, label-level loser ban). Tree not reopened."
    },
    "applications/node--experiment-pages-print-no-numbers.md": {
      "disposition": "keep",
      "reason": "Dated A/B finding with a stated narrow scope (percentages only). Tree not reopened."
    },
    "applications/node--uniform-split-disclosed-no-ramping.md": {
      "disposition": "keep",
      "reason": "Dated report; the pinned uniformity test and disclosure match the technique. Deviations (no SRM check, no runtime gate) stated. Tree not reopened."
    }
  }
}
```
