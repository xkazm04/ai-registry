---
layer: application
type: application
subject: candidate-archetype-routing
technique: self-declaration-trusted-contradictions-flagged
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: simulation
ab_verdict: better
---

# A real question, and three paths that answer it for the candidate

Read on 2026-09-26 at the tree's main, `cf9a4b81c`. The candidate-facing intake is
TypeScript. Routing and confidence come from the Python pipeline's `profile_cli`, which the
app spawns.

## What the tree gets right

- **The question is only asked when it is a question.** `app/_lib/apply.ts:51-58` sets
  `MIN_ARCHETYPE_OPTIONS_TO_OFFER = 2`, gated at 156, with the reason: "a one-choice
  'question' is a non-question that adds intake friction and erodes trust without adding
  routing signal".
- **Only a valid id counts as a declaration.** `apply.ts:291-293` sends `selfDeclared`
  only for a registry id, and `"auto"` otherwise. The candidate intake renders plain
  buttons with nothing pre-selected, so a declaration there is a click.
- **A declaration sets the class at 0.9, and contradictions cap it.**
  `pipeline/jobfit/registry.py:300-311` sets `selfDeclaredConfidence` and applies each
  archetype's contradiction, in both directions, including for the experienced default.

## Where this falls short of the standard

- **The system's own routing is re-submitted as the candidate's declaration.** Three paths
  do it:
  - `app/_components/results/ArchetypeBanner.tsx:114`, the recruiter's "Save as profile":
    `signals: { selfDeclared: v2.archetype }`. The comment at 105-107 says why: "pin the
    inferred archetype as the self-declaration so the re-route is deterministic".
  - `app/_lib/applicant-profile.ts:190`, the candidate's gap-answer merge:
    `selfDeclared: payload.archetype`, "exactly as the recruiter banner does".
  - The profile editor, which pre-selects the stored archetype
    (`app/features/tools/profile/ProfileForm.ts:94`, `choice: payload?.archetype || "auto"`)
    and sends it as `selfDeclared` (`profileBulkRefresh.ts:87`).

  The goal, a save that does not re-route, is right. The mechanism turns a guess into
  the top confidence tier.
- **Declared and derived are one field.** `pipeline/jobfit/profile.py:100-102` holds a
  single `archetype`. The declaration survives only as a reason string, which is exactly
  the string the paths above forge.
- **Caps are assigned, not taken as a `min`** (`registry.py:311`, mirrored at
  `profileReadiness.ts:116`), latent while each archetype has one rule.

## Applied

Simulation, 2026-09-26, on the rule that only the candidate's own act is a declaration
and a caller that pins a class pins a derived class. Each case was driven through kp's own
`profile_cli.main` with the payload shape the banner and the merge send. Nothing was
written.

| Case (analysis-time routing) | A: after the save, as shipped | B: pinned as derived |
| --- | --- | --- |
| No signal fired: `bau` at 0.4, review | `bau` at **0.9**, no review, reason "self-declared: Experienced (BAU)" | `bau` at 0.4, review kept |
| Domain change only: `career_switcher` at 1.0 | `career_switcher` at 0.7, reasons "self-declared: Career-switcher" plus a contradiction note against a claim the candidate never made | derived class, no declaration reason |
| Education dominant only: `student` at 1.0 | `student` at 0.9, "self-declared: Student / early-career" | derived class, derived provenance |

Under A, all three records assert a statement nobody made, and the first erases a review
flag on the one routing the tree's own invariant says must always be reviewed. Under B,
none does. **Verdict: better, 3 of 3.**

Falsifier: the save is meant as a *recruiter's* confirmation of the routing. If so, it is
a human decision, and it must be recorded as one, with the actor, as the conservative-
default technique asks. B holds either way. Only the "self-declared" provenance is wrong
in both readings.
