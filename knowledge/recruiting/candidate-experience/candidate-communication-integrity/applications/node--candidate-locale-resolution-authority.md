---
layer: application
type: application
subject: candidate-communication-integrity
technique: candidate-locale-resolution-authority
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# One locale resolver that says which step answered, in a Next.js hiring app

The three-step authority is already realized: one module resolves the language of
every candidate-facing letter (recorded choice, else the workspace default read at
dispatch, else the application default), write paths infer from stated CV
languages and store the result, and links are pinned to the resolved locale by the
composition. The legacy cohort is resolved at read time with no backfill.

## What the seam hunt found

The technique asks that every message record the locale it was composed in *and
which step supplied it*. The resolver returned only a locale. An unrecorded
candidate answered by the workspace default was indistinguishable from one who had
chosen that language, and the outbox row carried neither the locale nor the step,
so a wrong-language complaint was undiagnosable from the audit record.

## A and B

- A: `resolveCommsLocale` returned a bare locale; no surface reported the step.
- B: a sibling function returns `{ locale, source }` with `source` one of
  `recorded`, `workspace`, `app-default`; the plain form delegates to it, so there
  is still exactly one resolver. Tests pin that an unrecorded or invalid value is
  never reported as recorded. The seven locale tests and the typecheck passed,
  and callers were untouched (the floor).

The seam was chosen to falsify: the app was built from this subject's own
evidence, so the remaining half of the contract was the likeliest place for the
technique to find a gap, and it did. Remaining work is a task: persist locale and
source on the outbox row and thread the source through the single send function.
