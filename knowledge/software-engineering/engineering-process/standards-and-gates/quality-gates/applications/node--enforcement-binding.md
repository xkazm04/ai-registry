---
layer: application
type: application
subject: quality-gates
technique: enforcement-binding
stack: node
status: forged
verified_on: 2026-09-04
verified_against: node@20
applied: experiment
ab_verdict: not-better
---

# A fleet audit of conditional required checks, read once by shape and once by platform

The version witness is this registry's own CI pin: `.github/workflows/knowledge.yml`
sets `node-version: '20'` three times. The audit instrument was a script over the
fleet's checked-in CI definitions, run from this tree on 2026-09-04; the ten
project trees it read were not modified.

The technique's skip clause flipped on 2026-09-04. It used to say a conditionally
skipped job resolves to success — fail-open by shape. It now says the direction
is a platform fact: on one hosted platform a job skipped by its own condition
satisfies a required check, on the other a skipped pipeline blocks a must-succeed
rule by default, and the audit reads the platform's documentation for the version
in use rather than reasoning from the shape. This document runs that audit both
ways over the same inputs.

## Seam

Every `.github/workflows/*.yml` in ten managed trees (personas, kp, pof,
politicas, ascent, pumper, gravitone, systedo-case, personas-web, and this
registry), plus one `.gitlab-ci.yml` (personas — its `audit.yml:43` calls that
pipeline "a second forge nobody watches", but it is a second platform all the
same). For each workflow, the jobs carrying a **job-level** `if:`; for each of
those, whether the job's check name is declared required anywhere in the tree
(committed rulesets, branch-protection payloads, contributing and deploy
documents, workflow comments) and — because a declaration is not a binding —
whether the hosting platform's live branch protection lists it.

## Measurable, chosen before running

Required-check jobs whose skip would silently satisfy the requirement.

## Arms

**A** — the pre-flip rule: every skip resolves to success, on every platform.
**B** — the flipped rule: GitHub Actions' documented semantics (a job skipped by
its condition reports success and does not block a required check; a workflow
that never runs because of a path or branch filter leaves the check pending)
for the ten trees' workflows, and GitLab's (a skipped pipeline blocks a merge
under "pipelines must succeed" unless "allow merge on skipped pipelines" is
switched on; `allow_failure: true` is the explicit fail-open) for the one
`.gitlab-ci.yml`.

## Result

Job-level `if:` conditions: **27 jobs across 7 of 10 trees** (personas 7, kp 4,
pumper 7, systedo-case 5, ai-registry 2, ascent 1, personas-web 1; pof, politicas
and gravitone carry none).

Named required somewhere in the tree: kp declares 11 checks in
`.github/rulesets/main.json`, systedo-case 6 in `.github/required-checks.json`,
pumper names three (`Format`, `test`, `Dependency audit`) only in comments inside
`ci.yml` ("the required-status-check list on master should name ..."). Of the 27
conditional jobs, **none of kp's or systedo-case's declared checks carries a
job-level `if:`** — systedo-case's two conditional jobs (`judgment`, `publish`)
are deliberately absent from its required list, with the reason written in the
list itself. **Pumper is the whole population**: the live branch protection on
`master`, read through the platform API, requires six contexts (`Format`,
`test (ubuntu-latest)`, `test (windows-latest)`, `@pumper/sync (TypeScript SDK)`,
`Ship inventory + doc-sync hook`, `Dependency audit`), and **all six jobs carry
`if: github.event_name != 'schedule' || github.event.schedule == '17 6 * * 1'`**.

Under **A**: 6 required-check jobs whose skip satisfies the requirement. Under
**B**: the same 6 — GitHub's documented semantics are exactly the assumption A
was made from. The one GitLab pipeline has **zero** conditional jobs of its own
(three carry `allow_failure: true`, which is a different and explicit fail-open),
and its three included security templates carry `rules:` the platform would
resolve to *not created*, not *success*; nothing on that side is named required
anywhere, and the tree records no merge-request setting. **Identical counts on
both arms**, for the reason the tie is honest rather than empty: the fleet's
only conditional-and-required jobs live on the platform whose default the old
rule described.

A qualifier the count needs: pumper's condition is true for every `push`,
`pull_request` and `workflow_dispatch` event, so the skip fires only on the
nightly cron, where no requirement is evaluated. The six are *exposed* — one
edit to the condition and the requirement is satisfiable without a run — not
currently *bypassable*.

## The mid-state the platform read produced anyway

Arm B's extra step — reading the platform rather than the tree — did not move
the measurable, but it moved a neighbouring one the technique already owns.
Declared versus bound: **kp's committed ruleset is not applied** (the rulesets
API returns an empty list; live branch protection on `main` requires 3 of the
11 declared contexts), and **systedo-case's live protection requires 2 of its 6
declared checks** (`Typecheck, lint & build` and `E2E smoke`; the rubric review,
both SAST rules and the secret scan are declared blocking in the tree and are not
bound on the platform — its own `merge-gate` script checks that the named jobs
still exist and run on pull requests, which is the half a tree can check, and
cannot see the platform half). Pumper, with no committed declaration at all, is
the one repository whose live binding matches its intent. That is the
technique's original claim — the binding lives in the platform and a committed
copy is a copy — confirmed on 2 of 3 declarations.

## Verdict and falsifier

`not-better`. The flip adds a lookup per platform and, on a fleet whose
conditional-and-required jobs all sit on the platform the old rule described,
returns the old rule's number. The condition the technique gains: **the platform
read changes the audit only where a conditional job exists on the platform whose
default blocks, or at a migration** — on a fleet that is single-platform in
effect (a second platform present but carrying no conditional, no required job)
it is a constant, and the audit's cost is the count of platforms, not of jobs.

Falsifier for B's claim about the second platform: a personas GitLab job given a
`rules:` clause and a must-succeed merge setting, then skipped on a merge
request — if the merge proceeds, GitLab's default is not what B read. Return
condition: a fleet tree that adds `rules:`/`when:` to a GitLab job it also
requires, or any tree that moves platforms with its pipeline definition.
