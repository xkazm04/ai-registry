# Resume note — recruiting bundle wave

Forged 2026-08-20 from a 13-scout extraction over a 285-context recruiting platform.
The wave was interrupted by a session limit at 42 of 64 subjects. This file records
exactly where it stopped so a later session resumes rather than re-derives.

## State

- **42 subjects forged**, 252 techniques, 116 applications. All gate-clean.
- **22 subjects pending.** `categories.json` assigns all 64; the gate reports one
  `assigns "X", which has no folder` line per pending subject. That is the progress
  meter, not an error.
- `interview-calendar-integrity` was half-written when the wave stopped (2 of 6
  techniques) and was **removed** so the tree stays coherent. Re-forge it whole.

## Pending subjects (22)

interview-calendar-integrity · voice-interview-fidelity · conversational-assessment-validation ·
interview-run-of-show · work-sample-timeboxing-and-cost · regulated-credential-gating ·
recruiter-anchored-model-evaluation · candidate-identity-and-staleness ·
candidate-outreach-and-halt-rules · silver-medalist-rediscovery · sourcing-campaign-honesty ·
portable-hiring-records · requisition-lifecycle-governance · degrade-never-block-a-candidate ·
pre-boarding-and-first-day-handoff · hiring-policy-defaults-and-tiering ·
portable-candidate-credentials · small-sample-honesty-in-hiring-analytics ·
honest-measurement-presentation · recruiting-cost-and-automation-economics ·
peer-benchmarking-under-k-anonymity · compensation-banding-and-market-honesty

## Backfill needed on three forged subjects

These three were killed after their techniques landed but before their applications:
`assessment-instrument-validation`, `candidate-self-scheduling`,
`offer-lifecycle-and-deadlines`. They pass the gate (applications are not gate-enforced)
but the format expects 1-3 per subject. Add them from the anchors in each subject's
techniques.

## Wave contract

The dispatch contract each forger read is at
`docs/forge-brief.md` plus a per-wave context file that named: this registry as the
write root, `C:\Users\kazda\kiro\kp` as the read-only source, the `recruiting` purity
profile as a floor, the 11 law anchors, the boundary contracts with `llm-observability`
and `software-engineering`, and the stack mapping (`process` for prompt pipelines and
human workflows, `node` for server-side policy, `react` for recruiter/candidate
surfaces, `sql` for schema-as-taxonomy).

Web hardening was applied to the regulatory/fairness lane and the assessment-validity
lane. It repaid itself three times: a superseded regulatory applicability date, the
weak empirical record behind anonymised-CV screening, and the uneven false-positive
rate of AI-writing detectors across first-language background.
