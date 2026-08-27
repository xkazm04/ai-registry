---
layer: application
type: application
subject: deployment-contract
technique: direct-push-delivery
stack: process
status: forged
verified_on: 2026-08-27
---

# A four-repository fleet adopts direct push, after measuring why it was failing

A 2026-08 audit of a single-owner fleet (four Next.js repositories, all pushed to directly,
rarely through pull requests) found every repository violating at least one of the technique's
preconditions — and each violation had already produced the predicted failure. This
application records the evidence and the standardization that followed.

## The evidence: four repositories, four precondition failures

**No one-command gate.** One repository's CI ran seven npm scripts in sequence
(`typecheck`, `lint:ratchet`, `check:manifest`, `test`, `build`, `check:bundle`, plus a
browser suite); reproducing the gate locally meant typing all seven by hand. Its default
branch had been red for five consecutive pushes. Another documented its four gates as a
CONTRIBUTING table — a sequence, not a command — and eight lint errors reached its default
branch in one push.

**No push-time machinery.** Two repositories had no hooks at all (`.git/hooks` contained only
samples); one had a husky pre-*commit* hook but nothing at push. Their documented gates were
memory-based discipline, and both had multi-day red default branches at audit time.

**A gate that skips what breaks.** The one repository that *did* have a pre-push hook
(`.githooks/pre-push`, wired by a `prepare` script setting `core.hooksPath`, firing only for
pushes that update the default branch) ran typecheck, lint, a design check, and the build —
but not the unit tests or the localization check. Its default branch had been red for
seventeen days, on failures in exactly the categories the hook omitted. A gate that runs the
passing half of the pipeline is the technique's ritual case, measured.

**Red main as backlog, not outage.** In every red repository, feature commits continued to
land on top of the red gate — including one where the failing lint step short-circuited CI so
early that the build step had not been *exercised* in days: unverified pushes stacked on
unverified pushes.

## The standardized shape

The fleet converged on one pattern per repository, varying only in the command list:

1. **One aggregate script**, `verify`, in `package.json`, mirroring the CI blocking set in CI
   order, build included. CI and the script reference each other in comments so drift is
   visible in review — the parity-as-maintained-invariant rule.
2. **A pre-push hook** on `core.hooksPath` (zero dependencies, works on Windows git), firing
   only when the push updates the default branch, running `npm run verify`, blocking on first
   failure. Repositories that already had a hook system kept it (the husky repo gained a
   `.husky/pre-push`; the `.githooks` repo extended its existing hook) — never a second hook
   system beside an existing one.
3. **A loud escape hatch**: `<REPO>_SKIP_GATE=1 git push`, printing what it skipped and
   requiring a one-line reason in the repo's journal file. This adopted the one audited hook's
   existing design, which the fleet judged correct as-is.
4. **The after-push watch**: `gh run watch --exit-status` (the code host's CLI following the
   triggered run to its verdict) as the documented final step of a default-branch push, so
   "pushed" and "green" stop being separable claims.

## What the rollout deliberately did not do

It did not add the browser/e2e suites to the local gate — at 30 minutes they fail the
technique's timebox, and they stay remote-only with the watch as the loop-closer. It did not
make the hook fire on non-default branches; those push freely under CI, preserving the
branch-by-exception lane for preview-first and irreversible changes. And it did not bypass the
red gates to install the machinery "cleanly": each repository's standing failures were fixed
or explicitly quarantined first, because installing a push-time gate on top of a red baseline
just converts every future push into an escape-hatch push, which is the ritual again with
extra steps.

## The upward lesson

The audit's sharpest finding is about *which* precondition matters most: every repository had
working checks and honest documentation, and none had machinery. The fleet's failures were not
knowledge failures — the gates were known, written down, and runnable — they were enforcement
failures, and they clustered precisely where enforcement was weakest (the repo with a partial
hook outlived the repos with none, but failed through the gap in its coverage). The
technique's ranking is confirmed from the field: machinery first, completeness second,
documentation a distant third.
