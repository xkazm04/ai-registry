---
layer: application
type: application
subject: quality-gates
technique: enforcement-binding
stack: cpp
status: forged
verified_on: 2026-09-03
verified_against: cpp@23
---

# A hash-pinned linter whose findings are comments, not verdicts

Read against Chatterino 2.5.5 (`CMakeLists.txt:71`, Qt 6 required per
`CMakeLists.txt:30,100`) at commit `fda51f0d3a4a5cd15f099b951b796e299d566e9e`.
The static-analysis lane is two workflows and a setup script:
`.github/workflows/clang-tidy.yml` runs the analyzer on pull requests,
`.github/workflows/post-clang-tidy-review.yml` posts its findings as review
comments once the first workflow completes, and `.CI/setup-clang-tidy.sh`
fetches the two out-of-tree check modules the configuration depends on. The
check set itself is `.clang-tidy`, which enables `chatterino-*` and `clazy-*`
(`.clang-tidy:4,16`) - families that do not exist in a stock analyzer.

## Where the tree confirms the technique

**The external checks are pinned by content, not by name.** The two modules
are downloaded from a release tag literally named `ci` - a mutable pointer
(`.CI/setup-clang-tidy.sh:31,36`) - and then verified against SHA-256
digests committed in the script (`:7-8,32,37`). The pin is the hash: a
re-published `ci` release that changes the module fails the checksum and
aborts the job. Every workflow action is likewise referenced by commit hash
with the version as a trailing comment (`clang-tidy.yml:26,34,45,72`;
`post-clang-tidy-review.yml:17`). The gate's own dependencies are therefore
gated artifacts with a committed expectation - the technique's first
counter, applied to the tool rather than to the binding.

**The analyzer job's inputs are enumerable.** The exclusion list is in the
workflow (`clang-tidy.yml:51`), the analyzer version is fixed (`:53`), the
configure step is a checked-in script (`:54-55`), and the review action runs
in split mode (`:49`) so the untrusted pull-request context never holds a
token that can write comments - the second workflow, triggered by
`workflow_run`, does the posting with the repository's own credentials.

## Where it falls short of the technique - and this is the finding

**The findings cannot fail anything.** The posting workflow sets
`num_comments_as_exitcode: false` (`post-clang-tidy-review.yml:20`), so a
review with forty findings and a review with none both conclude `success`.
The analysis workflow's `error_action: abort` (`clang-tidy.yml:50`) aborts
only when the analyzer itself cannot run. Read by the technique's inventory:
this check is *emitted* and cannot be *required* in any meaningful sense,
because its success carries no information about the code. Its author
shipped a report, and the report is a good one - inline comments on the
diff - but nothing in the tree turns a finding into a refusal. Whether the
merge decision lists the job as required cannot be read from the tree at
all; the binding lives in the hosting platform's settings and no committed
text states what it is expected to be.

**The skip is the fail-open shape.** The whole job is conditioned on a
label: `if: !contains(labels, 'skip-clang-tidy')` (`clang-tidy.yml:13`). A
skipped job on this platform satisfies a required-check rule, so even if the
job were required, anyone who can apply a label can satisfy it without a
run. The label is visible on the pull request, which is a ledger of a kind,
but it is not counted anywhere and there is no review of its use.

**The check's name is a template.** The job name is
`clang-tidy ${{ matrix.os }}, Qt ${{ matrix.qt-version }})` (`clang-tidy.yml:14`,
stray parenthesis included). A required-check list matches names, so every
runner-image or framework-version bump renames the check and orphans the
requirement - the technique's rename failure made routine, on a schedule set
by dependency upgrades.

**It does not run where merges happen.** The formatting check runs on push,
pull request and merge queue (`.github/workflows/check-formatting.yml:4-9`);
the analyzer runs on `pull_request` only (`clang-tidy.yml:4-5`). A change
entering through the merge queue is analyzed never.

**Local and pipeline see different populations.** `scripts/check-clang-tidy.sh:23-39`
runs the analyzer over `src`, `tests`, `benchmarks`, `mocks` and the payload
library; the pipeline excludes `lib/*`, `mocks/*` and the crash handler
(`clang-tidy.yml:51`). And the local run loads no external modules, so the
`chatterino-*` and `clazy-*` families in `.clang-tidy` are silently unknown
to it - a developer who runs the script sees a subset of the findings the
review bot will post. `CONTRIBUTING.md:29` mentions the formatter and not
the analyzer at all.

## What this realization cannot do

It cannot prove the refusal the technique asks for - a change that should be
refused, taken to the merge decision, and refused there - because as
configured no change is refused by this lane. The lane is precise about
*what* it found and honest about *where* it found it, and it is bound to
nothing. Making it a gate would take three edits the tree does not have: a
non-zero exit on findings (or a severity threshold), a stable check name,
and a committed statement of the expected requirement list so a later audit
can diff it against the platform.
