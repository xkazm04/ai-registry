# ai-registry

An example **AI development registry**: the skills, practices and shared memory an organization's
coding agents run from, kept in git, owned by the organization, and reviewed like code.

This repository is a **worked example**. Its content is deliberately generic and synthetic - no
company, no product, no proprietary code. It exists so tooling that onboards, indexes and tracks a
registry has something real to read, and so a person can see what a good one looks like before
creating their own.

## Why a repository

Agent instructions are code that runs against your codebase. They deserve the same treatment as
code: version control, review, an owner, and history.

- **Git is the door for content.** Every change to a skill, a practice or a memory note arrives as
  a pull request. Merging is adopting - see [`CODEOWNERS`](CODEOWNERS).
- **Nothing here needs an account.** A developer with `git` and a text editor is a first-class
  citizen. Clone it, read it, copy what you need.
- **Indexing is read-only.** A tool (here, [Ascent](https://github.com/)) reads the tree, parses
  the frontmatter, and keeps an index. It is never in the write path.

## Layout

```
README.md
.ascent/registry.yaml     # what this registry is: mode, telemetry sink, policies, owners
CODEOWNERS                # who merges = who adopts
catalog.json              # GENERATED index: versions, hashes, adopters, invoke counts
skills/<name>/SKILL.md    # frontmatter: name, description, category, memory, version
skills/<name>/LESSONS.md  # append-only reflection lane, beside the skill it is about
practices/<slug>/PRACTICE.md   # frontmatter: id, dimension, applies-when; body = the shape
practices/<slug>/starter/**    # templatized artifacts the practice drops into a repo
memory/<kind>/<slug>.md   # frontmatter: kind, confidence, namespace, source
memory/_index.md          # map of content over the notes
```

## What is in here

### Skills (3)

| Skill | Category | Version | What it is for |
| --- | --- | --- | --- |
| [`ci-gate-check`](skills/ci-gate-check/SKILL.md) | `ci-cd` | 1.3.0 | Run the checks CI enforces, before you push. |
| [`test-before-commit`](skills/test-before-commit/SKILL.md) | `testing` | 2.1.0 | Prove a change works before it is committed. Carries [`LESSONS.md`](skills/test-before-commit/LESSONS.md). |
| [`agent-guidance-bootstrap`](skills/agent-guidance-bootstrap/SKILL.md) | `ai-native` | 0.4.0 | Write or refresh a repo's `AGENTS.md` from evidence. |

`category` comes from a closed set: `ci-cd`, `testing`, `security`, `ai-native`, `docs`,
`workflow`, `other`. Anything else is normalized to `other` at index time. `name` is a kebab-case
slug and must match the directory. `description` is one line - it is how an agent decides whether
to use the skill without reading the body.

### Practices (2)

| Practice | Dimension | Starter |
| --- | --- | --- |
| [`agent-guidance`](practices/agent-guidance/PRACTICE.md) | D1 | [`AGENTS.md`](practices/agent-guidance/starter/AGENTS.md) |
| [`supply-chain-security`](practices/supply-chain-security/PRACTICE.md) | D9 | [`SECURITY.md`](practices/supply-chain-security/starter/SECURITY.md), [`supply-chain.yml`](practices/supply-chain-security/starter/.github/workflows/supply-chain.yml) |

A practice describes the **shape** of what good looks like, never a repo's actual content. Its
`starter/` files are templates full of `<...>` and `TODO:` markers: they scaffold, they do not
pretend to know your architecture. The starter workflow lives under `practices/` and does not run
in this repository - copy it into a target repo's `.github/workflows/` to use it.

### Memory (4)

Four notes, one per kind, indexed in [`memory/_index.md`](memory/_index.md): `semantic` (durable
facts), `procedural` (what worked), `episodic` (what happened, dated), `summary` (a rollup).
Confidence is a 0..1 float, banded as 1.0 verified, 0.6 probable, 0.3 a hunch.

## How a developer syncs

Plain git is the baseline. Nothing below requires an account or a token.

```sh
# read it
git clone https://github.com/xkazm04/ai-registry.git

# use a skill in a repo: copy the directory into wherever your agent reads skills from
cp -r ai-registry/skills/ci-gate-check <your-repo>/.claude/skills/

# check what you have against what is current
cat ai-registry/catalog.json    # name, version, contentHash per skill
```

To keep a repo pinned to a registry, point at it from the repo's manifest:

```yaml
# .ai/manifest.yaml
skills:
  registry: github:xkazm04/ai-registry
```

Repos with no pointer fall back to the organization's canonical registry
(`canonical: true` in [`.ascent/registry.yaml`](.ascent/registry.yaml)).

## How a change gets in

1. Branch, edit `skills/<name>/SKILL.md`, **bump `version`**.
2. Append an entry to that skill's `LESSONS.md`: `## <version used> - <YYYY-MM-DD> - <project>`
   followed by `-` bullets. Record the version the run *used*, not the bump target.
3. Open a pull request. A `CODEOWNERS` owner reviews and merges - that merge is the adoption
   decision.
4. The indexer picks up the merge and rewrites `catalog.json`; the next sync anywhere sees it.

Version discipline: **versions are the comparison currency, hashes only detect drift.** Bump the
version whenever behaviour changes; leave it alone for a typo fix.

## Intentional version drift (for testing)

`agent-guidance-bootstrap` is the drift fixture. The registry carries **0.4.0**, while
`catalog.json` lists a consuming repo at **0.3.0**:

```json
"adopters": ["example-org/checkout-service@0.4.0", "example-org/internal-tooling-cli@0.3.0"]
```

A consumer one minor behind must resolve to `stale`, not `in_sync` and not `diverged`. The other
two skills have every adopter at the registry version, so they resolve to `in_sync` - which makes
this the one row that should light up in a sync heatmap. The `adopters` and `invokes30d` values
are illustrative placeholders until real fleet repos are indexed; the `contentHash` values are
true sha256 prefixes of the files at seed time.

To exercise `diverged` as well, edit any skill's body without bumping its `version`: the hash
moves, the version does not.

## Conventions

- ASCII only, LF line endings, no trailing whitespace.
- No secrets, ever - not in a file, not in an example, not in a test fixture. A tracked
  credential is a hard failure and has to be rotated, not deleted.
- One idea per skill, per practice, per memory note.
- Vendor-neutral: name the capability (`Test: npm test`), not the tool.

## License

Public domain / CC0. Copy anything here into your own registry and change it to fit.
