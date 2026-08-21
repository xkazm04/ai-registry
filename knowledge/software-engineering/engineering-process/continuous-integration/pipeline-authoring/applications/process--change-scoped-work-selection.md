---
layer: application
type: application
subject: pipeline-authoring
technique: change-scoped-work-selection
stack: process
status: forged
verified_on: 2026-08-21
---

# Path-filtered lanes as this registry runs them

This repository is a knowledge registry, not a service, and its selection rule is the
simplest form of the technique: static path filters on the trigger, with one workflow per
lane. `.github/workflows/knowledge.yml` and `.github/workflows/skills.yml` each declare
their own `paths:` on both `push` and `pull_request`, and nothing computes a closure.

That is a defensible choice at this size, and it exhibits the technique's characteristic
defect exactly as predicted.

## The filters as written

`knowledge.yml`:

```yaml
paths: ['knowledge/**', 'usage/**', 'signals/**', 'scripts/**', 'catalog.json',
        '.github/workflows/knowledge.yml']
```

`skills.yml`:

```yaml
paths: ['skills/**', 'scripts/check-skills.mjs', '.github/workflows/skills.yml']
```

Both filters include their own workflow file and their own checker, which is the always-run
set the technique calls for, applied correctly: a change to the selection rule cannot exempt
itself. `knowledge.yml` takes the whole `scripts/**` directory rather than enumerating its
six checkers — coarser than it needs to be, and coarse in the safe direction.

## Where the closure is missing

Two directories are outside every filter and are inputs to the gated lanes:

- **`docs/`** holds `rkb-profile.md`, which is the specification `check-bundles.mjs`
  enforces. A change to the profile — a new frontmatter field, a changed layer rule — runs
  no bundle gate on the pull request that introduces it. The specification and its
  enforcement can diverge inside a single merge, and neither workflow notices.
- **`librarian/`** holds `standard.md` and the run records that `scripts/librarian-scan.mjs`
  reports against. The scanner is in `scripts/**` and therefore triggers; the standard it
  scans against does not.

Both are the dependency-closure failure the technique describes: a path-pattern rule maps
changed files to lanes and cannot see that a lane *reads* a file outside its own directory.
Adding `docs/**` to `knowledge.yml` closes the first; the second wants the reverse-dependency
edge to be written down somewhere before it can be closed at all.

## Where the reporting rule is honoured, and where it is not

The technique's central demand is that not-selected, passed, and selection-failed render
differently. This repository gets the third case right and leaves the first ambiguous.

**Right:** `knowledge.yml` splits into six named jobs — `bundle integrity`, `bundle index
freshness`, `usage lane`, `signals lane`, `currency report`, `catalog freshness` — with a
comment stating why the split is deliberate: *"A stale artifact is not a content defect, and
conflating the two makes people re-run the wrong thing."* The `currency` job goes further and
separates severity from outcome: it *"REPORTS, never fails"*, with the reason attached —
*"A stale document must not block an unrelated pull request — that is how a gate ends up
deleted."* The failing form is deferred to a scheduled run and to the librarian, *"where a red
result is the point and nobody is standing behind it waiting to merge."* That is
severity-by-construction, and it is the same instinct the three-outcome rule asks for.

**Right, and unusually so:** `skills.yml`'s `version` job refuses to report a comparison it
could not make. The checkout carries `fetch-depth: 0` with the reason in a comment —
*"The gate diffs against the merge base. A shallow clone cannot resolve it, and the checker
exits 2 rather than reporting 'no version problems' from a comparison that never ran."* A
selection input that cannot be resolved produces a hard failure, not an empty pass.

**Not right:** a change touching only `README.md` triggers neither workflow. The pull request
shows no knowledge jobs at all — which a reader must interpret as "not applicable" from the
absence of a row, exactly the not-selected-versus-passed ambiguity the technique names. The
platform renders both as the same nothing.

## The backstop is absent

Neither workflow has a `schedule:` trigger. Both carry `workflow_dispatch`, which is a manual
door, not a cadence. So the unscoped backstop run — the thing that catches dependency edges
the filters do not model and lanes that have silently stopped working — does not exist here;
the closest thing is the `push: branches: [main]` trigger, which fires only when the same
filters match.

The repository already knows the argument. `quality-gates`' own application records a
generated workflow that triggers on both a pull request and a weekly schedule, because *"a
pull_request-only trigger means a repo that goes quiet (no PRs for weeks) never re-reports, so
the dashboard silently shows a stale score while the manifest/hooks/CI may have drifted
underneath it."* That reasoning applies to this repository's own workflows and has not been
applied to them.
