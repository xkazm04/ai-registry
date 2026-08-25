# Contributing to ai-registry

This registry is maintained by one person plus agents; issues and pull requests are
triaged weekly. An honest SLA beats a fast one.

Everything here is content, not running code: knowledge bundles, skills, practices,
memory notes, and the per-contributor usage/signals files. The gates are Node scripts
with zero dependencies - `git clone` and a recent Node is the whole toolchain.

## How a change gets in

1. Branch. Edit the artifact - for a skill that means `skills/<name>/SKILL.md` or
   anything in its directory, and **bump `version`** (minor or major when behaviour
   changes, patch when it does not - but bump; `check-skills.mjs --since <ref>` rejects
   a version that moves backwards).
2. For a skill change, append an entry to that skill's `LESSONS.md`:
   `## <version used> - <YYYY-MM-DD> - <project>` followed by `-` bullets. Record the
   version the run *used*, not the bump target. Appending a lesson alone needs no bump -
   a lesson records a run against a version.
3. Run the gates for the lane you touched (below), always ending with
   `node scripts/build-catalog.mjs` - the marketplace and the catalog are generated
   views, and CI fails when they are stale.
4. Open a pull request - one focused change, pathspec-scoped commits (never
   `git add -A`), docs updated in the same PR as what they describe.
5. A [`CODEOWNERS`](CODEOWNERS) owner reviews and merges. **Merging is adopting** - the
   merge is the decision that the organization's agents run this. Installations update
   when they choose to; merging here changes nothing anywhere until then.

## Lane gates (run locally before pushing)

| You touched | Run |
| --- | --- |
| `skills/` | `node scripts/check-skills.mjs && node scripts/build-marketplace.mjs && node scripts/build-catalog.mjs` |
| `knowledge/` | `node scripts/check-bundles.mjs && node scripts/build-index.mjs && node scripts/build-knowledge-rules.mjs && node scripts/build-catalog.mjs` |
| `practices/` or `memory/` | `node scripts/build-catalog.mjs` |
| `usage/` | `node scripts/check-usage.mjs && node scripts/build-catalog.mjs` |
| `signals/` | `node scripts/check-signals.mjs` |

`build-index.mjs` runs **before** `build-catalog.mjs` - the catalog's hash covers the
index. Each build script takes `--check` (the CI form) to verify without rewriting.

## The privacy rule

No machine paths, no secrets, no repo-identifying pointers - not in a file, not in an
example, not in a test fixture. A tracked credential is a hard failure and has to be
rotated, not deleted.

Evidence stays local: the pointers proving a claim against a particular tree live in
each consumer's gitignored `.evidence.local.md` overlay, machine checkout paths live in
gitignored `.projects.local.json`, and consult logs live in each project's gitignored
`.ai/consults.jsonl`. What gets published is the aggregate: `usage/` carries counts
only, `signals/` carries **verdicts, never pointers** (`{"gone": 2}`, not which two
files). The lane gates enforce this; do not route around them.

## Conventions

- LF line endings, no trailing whitespace.
- **ASCII where it bites.** `practices/` and `memory/` are ASCII-only. In `skills/`,
  frontmatter is ASCII and fenced code may carry no lookalike punctuation (a Unicode
  dash or quote that reads as ASCII and breaks a pasted command); prose is UTF-8.
  `knowledge/` is UTF-8 prose. The lanes differ because their readers do.
- One idea per skill, per practice, per memory note.
- Vendor-neutral: name the capability (`Test: npm test`), not the tool.

## Issues

A useful issue names the lane and the file, and what you ran: for a gate or script
problem, the exact command and its output; for a content problem, the claim and why it
is wrong (with a source, for knowledge bundles). Feature requests state the job to be
done, not the solution.

## AI-assisted contributions

Welcome - this registry exists to be maintained by agents (`/forge`, `/deepen`,
`/librarian`, `/intake` live in `.claude/skills/`). But you own what you submit: you
ran the gates and you can explain every line of the diff. Disclose substantially
agent-generated PRs in the description. Drive-by bulk agent PRs - mass refactors,
dependency churn, style-only sweeps - are closed without review.

## Protected paths

[`CODEOWNERS`](CODEOWNERS) is the adoption mechanism, not a formality: `skills/`
changes how every agent in the fleet behaves, `practices/supply-chain-security/` is a
merged guardrail, `.ascent/` and `catalog.json` are the registry's own declaration and
index. Anyone can propose a change to any of them; merging requires the owner.

## License

Public domain - [CC0 1.0](LICENSE). By contributing, you dedicate your contribution to
the public domain under the same terms, so anyone can copy any of this into their own
registry and change it to fit. That is the point of the repository, so there is nothing
to fund and no CLA - the dedication is the whole model.
