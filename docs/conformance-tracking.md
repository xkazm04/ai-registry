# Conformance tracking — which paths a project follows

The registry publishes the standard; it cannot see the trees that follow it.
Two records close that gap, one on each side of the privacy line.

## Consumer side — `.ai/registry-conformance.md` (committed in the project)

A project that consumes a knowledge bundle keeps a committed conformance map at
`.ai/registry-conformance.md`, beside its manifest. One table per audited
bundle, one row per technique judged:

```markdown
# Registry conformance — software-engineering
contributor: <installation id> · audited: <YYYY-MM-DD>

| subject | technique | status | evidence |
|---|---|---|---|
| cost-metering | budget-enforcement | followed | lib/imaging/budget.ts:12 gate before vendor call |
| test-harness | negative-control-tests | deviation | no negative control on the scorer |

## Deviations backlog
1. ...ranked by value...
```

Statuses: `followed` (realized — cite where), `partial` (cite what is missing),
`deviation` (applies and the code contradicts or lacks it), `n/a` (an inapplicable
technique inside an audited subject; never a row for an unaudited subject). The
`## Deviations backlog` is the queue a later quality wave drains, and the diff
between two audits is the project's adherence trend. Paths and anchors are fine
here — the file lives in the tree it describes.

Subjects are chosen by relevance (the index's `use_when` against the project's
real surfaces), typically 10–14 per bundle. An unaudited subject is UNKNOWN, not
followed — the same rule the signals lane applies to bundles.

## Registry side — `signals/<contributor>.json`

The public aggregate. Each audited subject contributes `consults[<subject>] += 1`
and `deviations[<subject>] += <count of deviation rows>` to the installation's
signals file. Counts and slugs only — the gate refuses paths and project names,
because this repository is public. Which project carried which deviation is
answerable only from that project's conformance file, by design.

## The loop

1. Harvest wave: a project's strongest practices land in the bundle as
   techniques and applications; the deviations the workers record honestly are
   the first entries of the project's backlog.
2. Conformance wave: each project audits itself against the bundle, writes or
   refreshes `.ai/registry-conformance.md`, fixes the cheap high-value
   deviations under the technique's standard, and reports tallies.
3. Backfill: tallies land in `signals/<contributor>.json` under
   `scripts/check-signals.mjs`; reading across contributor files is the fleet
   view (`catalog.json` aggregates only the usage lane today). A subject with
   deviations across many installations is a candidate for `/deepen` (the
   standard may be unclear) or for the next quality wave (the standard is
   clear and unmet).

First run: 2026-08-24, six projects from the `mkdol-dev-box` installation, see
`docs/plans/secondary-machine-onboarding-2026-08-24.md`.
