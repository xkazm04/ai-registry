---
layer: application
type: application
subject: repository-landing-document
technique: evidence-linked-badges
stack: process
status: forged
verified_on: 2026-09-01
---

# Auditing a seven-badge row

`github.com/glukicov/slideops` @ `66af7de` carries the only badge row in the
2026-09-01 fleet survey: seven badges, `README.md:5-11`, inside a centered
block above the first paragraph. Auditing it is the technique's whole
procedure — enumerate the badges, and for each one name the artifact that
changes colour when the claim breaks.

## The row, badge by badge

| line | claim | link target | can the target go red? |
|---|---|---|---|
| 5 | the build passes | the CI workflow's run history | **yes** — the badge image is served by the same run history it links to |
| 6 | latest release version | the releases page | **yes** — the value is derived from the host's release data |
| 7 | licensed MIT | `LICENSE` in the tree | **yes**, weakly — the target *is* the artifact, one click to confirm |
| 8 | Python 3.14 | `pyproject.toml` | **yes**, weakly — the pin is in the file the link opens |
| 9 | zero dependencies | `.github/workflows/ci.yml` | **no** — a static workflow *file*, not the job's runs |
| 10 | implements the Agent Skill spec | the specification's homepage | **no** — the specification outlives any project's conformance |
| 11 | listed on a skills registry | the registry's project page | **no** — a listing page that renders whether or not anything is true of it |

Four wired, three not. The independently-run fleet instrument
(`scripts/check-readmes.mjs`) scores the same row 4 of 7, by a rule keyed on
whether the link resolves to a run, a check or a tracked artifact rather than
to a landing page.

## The three failures, and the repair each one takes

**Line 9 is the instructive one**, because it is nearly right. The claim
*zero dependencies* is genuinely enforced in this repository: `.github/
workflows/ci.yml:54-76` defines a `Skills run on bare Python` job that copies
`skills/slideops/` the way a user installs it and executes `check.py` and
`cite.py` on a bare interpreter with nothing installed, then repeats it
through `./install.sh`. The proof exists. The badge links to the file that
*declares* the job rather than to the job's runs, so the badge stays green on
a day the job is deleted, disabled, or made conditional. The repair is a link
target change and nothing else: point it at the workflow's run history,
filtered to that job, and the badge acquires the failure mode it was always
supposed to have.

**Line 10** asserts conformance to an external specification and links to the
specification. By the technique's rule this links to the project's own entry
in whatever catalog registers conformance, because the entry disappears when
conformance lapses and the specification does not. Absent such a catalog, the
claim is a sentence in the prose, not a badge.

**Line 11** is a registry listing badge whose target is the listing. A listing
page renders for a project that has been abandoned for two years, so the
target cannot fail; the honest version of this badge is an install-count or
last-published value served by the registry, or no badge.

## Why this row is worth studying rather than dismissing

This is the strongest landing document in the survey by every other measure —
three captioned figures, five reader-directed callouts, four routed pages, a
longest unbroken prose run of ten lines — and it still fails its own badge
rule three times out of seven. That is the technique's central claim
demonstrated on a careful author: a badge row is assembled once, when the
project is young and each badge is added for a reason its author remembers,
and then never re-read. Care at authoring time does not catch this failure
class. Only a periodic enumeration does, and the enumeration is cheap: seven
rows, one question each, ten minutes.

The row also shows the laundering effect the technique warns about. Lines 5
and 6 are real instruments. Lines 10 and 11 are decoration. They render
identically, at the same size, in the same row, above the first paragraph — so
a reader who discounts the decorative ones has no way to keep discounting them
without discounting the build badge too.
