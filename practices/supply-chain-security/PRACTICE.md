---
id: supply-chain-security
dimension: D9
applies-when: "The repo ships or deploys code and has no SAST, dependency scanning or secret scanning wired into its pull-request checks."
---

# Supply-chain security

**What it gives you:** the shift-left guardrail against the vulnerable or secret-leaking code an
AI can produce confidently and at speed.

**Dimension:** D9. **Starters:** [`starter/SECURITY.md`](starter/SECURITY.md),
[`starter/.github/workflows/supply-chain.yml`](starter/.github/workflows/supply-chain.yml).

## The shape

Four guardrails, in the order they pay off. Each one runs on every pull request, blocks on a
finding at or above a declared severity, and names an owner.

1. **Static analysis (SAST).** A scanner over the diff on every PR. Generated code raises the
   volume of plausible-but-unsafe patterns (string-built queries, unvalidated redirects,
   permissive CORS) and a reviewer reading a large diff will not catch them all.
2. **Dependency scanning.** Known-vulnerable and unmaintained packages, checked on every PR and
   on a schedule, because a dependency becomes vulnerable while your code sits still. Add a
   check that new dependencies are real, current, and named as intended - a hallucinated or
   typosquatted package name is a supply-chain attack with an easy entry point.
3. **Secret scanning.** Both a pre-commit hook and a CI check with history scanning. The hook is
   primary: it is the only one that prevents the leak rather than reporting it. A secret that
   reaches the remote must be rotated, not deleted.
4. **Provenance for what you ship.** An SBOM per release, and signed, attested build artifacts.
   Only meaningful once you publish images or packages; declare it out of scope, explicitly, if
   you do not.

## Placement

Put every check a developer can run at the earliest point it can run: secret scanning and
dependency checks belong in a pre-commit or pre-push hook, where the fix costs seconds. CI is
the backstop that makes the check unskippable, not the place the developer meets it first.

## How to tell it is working

- Every PR carries the security checks in its check list, and they block merge.
- Findings are triaged with a named severity threshold, not left open indefinitely. Count open
  findings older than the threshold - that number is the practice's real health.
- The vulnerability report path is documented and has been exercised at least once.
- No credential has ever been committed. Where one was, it was rotated, and the rotation is
  recorded.

## Adopting it

1. Copy `starter/SECURITY.md` to the repo root and fill in the reporting path and response time.
2. Copy `starter/.github/workflows/supply-chain.yml` into `.github/workflows/`, pin the actions
   to the versions your org allows, and enable only the jobs that fit the stack.
3. Make the checks required for merge on the default branch.
4. Add the secret scanner to a pre-commit hook so the CI job is a backstop, not the front line.
5. Declare which guardrails are out of scope, and why, in `SECURITY.md`. An explicit
   out-of-scope beats a silent gap.

## Anti-patterns

- Scanners that run but never block. A non-blocking check is a dashboard, not a guardrail.
- A severity threshold set so low that everything alerts, so nothing is read.
- Deleting a leaked secret from the repo without rotating it. It is in the history and in
  someone's clone.
- Scanning the release branch only. The point is to catch it in the pull request, while the
  author still has the change in their head.
