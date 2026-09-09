# XL spec - `vendored-patch-stack`

Raised by `/intake` run `intake-camoufox-0907` from `github:daijro/camoufox` @ `eb5dc3bc`.
Phase 2d routing count: **4 `corpus: NONE` entries in one system** (the fork/patch-stack
maintenance system), which fires the mechanical XL trigger. Operator chose `forge now`.

## Why this is a subject and not four techniques in `supply-chain`

`supply-chain/vendored-fork-ledger` already owns the fork's **provenance**: which upstream
commit the copy was taken from, what was changed on top, who reaps it, and the fact that
forking converts a governed dependency into an ungoverned subdirectory. Its `use_when` is
about *what must be recorded before a local patch is allowed to land*.

It owns none of the **mechanics of keeping the stack alive across upstream movement**, and
those mechanics have their own forces: the vendored tree is simultaneously a build output
and a VCS workspace, the patches are derived artifacts with no source of truth but a tree,
regeneration silently drops whole files, and the patch set's own internal structure decides
how much triage each upstream bump costs. Four decisions, one system, no home.

The subject begins **after** the fork's price has been paid, which is exactly where
`vendored-fork-ledger` stops.

## Placement

- bundle: `software-engineering`
- category: `engineering-process/build-and-release` (flat, 6 subjects, cap 10 - verified
  against `taxonomy.json`, not against a directory count)
- subject slug: `vendored-patch-stack`
- resulting technique link depth to `_laws.md`: `../../../../_laws.md`, same as
  `build-and-release/test-harness/techniques/*` - copy that form, do not derive it

## Proposed techniques, each with the decision rule it must carry

1. **`generated-tree-is-not-a-workspace`** - The vendored upstream tree is a build output
   that also happens to be a git repository, and the two identities disagree about what a
   reset means. The sanctioned reset is the build system's (`make clean`); `git reset` and
   `git clean` are wrong there because the tree carries untracked files the build needs and
   VCS tags the patch tooling uses as anchors. Rule: name one reset command and make every
   other one an error; a tree with two reset semantics will be reset by the wrong one.

2. **`patches-are-derived-not-source`** - A patch file's only correctness test is that it
   applies to a specific upstream. Hand-editing the diff text produces an artifact no tree
   ever proved. Rule: author patches by round-tripping a workspace (reset -> edit the tree
   -> regenerate the patch), and treat a hand-edited diff as unverified.

3. **`regeneration-must-see-new-files`** - `git diff` omits files git does not yet track, so
   regenerating a patch that ADDS a source file silently drops it. The patch still applies
   cleanly, which is what makes this expensive: the failure surfaces at link or run time,
   far from the regeneration. Rule: regeneration concatenates the staged and unstaged diffs,
   and the check is that the patch reapplies to a clean tree and the added paths exist.

4. **`collapse-patch-axes-that-share-hunks`** - A patch set split along two axes (feature x
   cross-cutting concern) multiplies reject triage at every upstream bump, and the
   multiplication is only worth paying when the axes are independent. Where both axes edit
   the same hunks, they conflict with each other as well as with upstream. Rule:
   independence of the hunk sets is the precondition for a second axis; collapse it
   otherwise, and say in the patch set which decision was made.

5. **`reject-triage-is-a-port-not-a-merge`** (drafter decides whether this earns a file) -
   Reject line numbers are wrong by construction after an upstream refactor; the work is to
   find the equivalent location in the new code and port the intent, not to force the hunk.
   Carries the sub-rule that the patch's *intent* has to be reconstructed before the reject
   can be resolved.

## Boundaries this subject must NOT absorb

- `security/code-provenance/supply-chain` - provenance, expiry, the ledger, advisory
  matching. Cite it; do not restate it.
- `engineering-process/build-and-release/packaging` - producing artifacts from a built tree.
- `engineering-process/build-and-release/release-pipeline` - promotion and gating.
- `engineering-process/codebase-stewardship/dependency-declaration` - declaring the upstream.
- Anything specific to browsers, fingerprinting or automation. The source is an anti-detect
  browser fork; the subject is about patch stacks. **Strip every proper noun** - the purity
  gate will catch the obvious ones and not the subtle ones.

## Open questions the drafter must DECIDE, not discover

- Is "vendor a tarball and carry patches" versus "carry a rebased downstream branch in the
  upstream's own VCS" one technique, or the golden path's opening trade? Both are live in
  the wild and the choice changes every other technique's shape.
- Does an LLM-facing maintenance runbook belong here? The source's own upgrade guide is
  written explicitly for an LLM audience. Suspect this is a lead for
  `machine-authored-documentation`, not a technique here - decide and say so.

## Trees to open (do not rely on the source alone)

The source clone is deleted at this run's Phase 9. Two public stacks carry the same shape
and are the reconciliation targets:

- **LibreWolf** (`gitlab.com/librewolf-community/browser/source`) - camoufox's patcher is
  LibreWolf-derived, so it is the nearest sibling and the place to check whether decision 1
  and 3 are shared or camoufox-local.
- **Chromium-based forks** (e.g. `github.com/brave/brave-browser`) - a different answer to
  the same problem (a fetch-and-apply pipeline over a much larger upstream), which is the
  cheapest available disproof of any rule stated as universal.

A rule that holds in camoufox and not in LibreWolf is a boundary, not a technique. Say which.
