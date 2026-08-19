# ai-registry

An **AI development registry**: the knowledge, skills, practices and shared memory an
organization's agents run from, kept in git, owned by the organization, and reviewed like code.

The repository carries five lanes, declared in [`registry.yaml`](registry.yaml):

| Lane | Holds | Status |
| --- | --- | --- |
| [`knowledge/`](knowledge/README.md) | **Reference Knowledge Bundles** - four-layer domain knowledge (Golden Path → Technique → Application → Evidence), one bundle per domain. | Real content. Gated by CI. |
| `skills/` | Agent skills, one directory per skill. | Worked example; a real library migrates in later. |
| `practices/` | Repo-level habits plus the starter artifacts they drop. | Worked example. |
| `memory/` | Organizational memory notes, one fact per file. | Worked example. |
| [`usage/`](docs/usage-lane.md) | Which skills actually get used - counts contributed by the installations that run them, one file per contributor. | Real, gated. Empty until an installation reports. |

The three example lanes (`skills`, `practices`, `memory`) are deliberately generic and synthetic -
no company, no product, no proprietary code - so tooling that onboards, indexes and tracks a
registry has something real to read. `knowledge/` and `usage/` are not examples: the first holds
the actual bundles, the second holds real counts once an installation reports them.

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
registry.yaml             # what this repository IS: its lanes, their specs and guarantees
.ascent/registry.yaml     # Ascent's overlay: how ONE consumer indexes it (mode, telemetry, policies)
CODEOWNERS                # who merges = who adopts
catalog.json              # GENERATED index: bundles, skill versions, hashes, adopters, counts
docs/rkb-profile.md       # the knowledge lane's format spec (an OKF profile)
docs/usage-lane.md        # the usage lane's format spec + what may never go in it
scripts/check-bundles.mjs # the knowledge lane's gate (zero dependencies)
scripts/check-usage.mjs   # the usage lane's gate: shape + the counts-only privacy rule
scripts/build-index.mjs   # regenerates knowledge/<domain>/index.json (--check in CI)
scripts/build-catalog.mjs # regenerates catalog.json (--check in CI)
knowledge/<domain>/       # a Reference Knowledge Bundle - see knowledge/README.md
knowledge/<domain>/index.json  # GENERATED: every subject, technique, law and application
skills/<name>/SKILL.md    # frontmatter: name, description, category, memory, version
skills/<name>/LESSONS.md  # append-only reflection lane, beside the skill it is about
practices/<slug>/PRACTICE.md   # frontmatter: id, dimension, applies-when; body = the shape
practices/<slug>/starter/**    # templatized artifacts the practice drops into a repo
memory/<kind>/<slug>.md   # frontmatter: kind, confidence, namespace, source
memory/_index.md          # map of content over the notes
usage/<contributor>.json  # counts from ONE installation - see docs/usage-lane.md
```

Two `registry.yaml` files is deliberate, not drift: the root one says what this repository is,
the `.ascent/` one says how Ascent indexes it. A second consumer adds its own overlay; neither
rewrites the other, and a reader that knows only one of them still works.

## What is in here

### Knowledge bundles

| Bundle | Covers |
| --- | --- |
| [`software-engineering`](knowledge/software-engineering/) | Building and operating software: UI surfaces, client architecture, LLM/agent engineering, backend platform, operations, security, integration, engineering process. |
| [`media-generation`](knowledge/media-generation/) | Producing factual audiovisual content with generative models: narrative craft, research grounding, image generation and prompting, frame direction, production operations. |
| [`civic-intelligence`](knowledge/civic-intelligence/) | Watching public power with data: parliamentary records, legislation, public money, and the accountability methodology for publishing about real, named people. |
| [`grant-funding`](knowledge/grant-funding/) | Finding, winning and accounting for grant money: the funding landscape, eligibility and matching, proposal craft, and grant operations from deadline to post-award. |

A bundle's two upper layers (Golden Path, Technique) carry **no** repo paths, file extensions or
product names - enforced by [`scripts/check-bundles.mjs`](scripts/check-bundles.mjs), not left to
discipline - so they transplant to any codebase unchanged. Applications are the opposite by
design: they cite real code and name their stack in the filename.

**Evidence is not published.** The pointers proving a claim against a particular tree are noise to
everyone else, so they live in each consumer's gitignored `<subject>/.evidence.local.md` overlay.
The gate fails any published file that declares them. Format spec:
[`docs/rkb-profile.md`](docs/rkb-profile.md).

**Read a bundle without reading 965 files.** Each bundle carries a generated
`index.json` - every subject with its category, status, techniques (and the laws they cite),
and applications. That is the file an agent selecting knowledge to consult should read; the
markdown is for humans and for the agent that decided to go deeper. It excludes evidence for
the reason above, and says so in its own `meta.excludes`. Regenerate with
`node scripts/build-index.mjs` **before** `build-catalog.mjs`, whose hash covers it.

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
this the one row that should light up in a sync heatmap. The `adopters` values are illustrative
placeholders until real fleet repos are indexed; the `contentHash` values are true sha256
prefixes of the files at seed time.

`invokes30d` is no longer a placeholder: it is **derived** from the [`usage/`](docs/usage-lane.md)
lane and reads `0` until an installation contributes counts. A zero with an empty
`usageContributors` means nobody is reporting on that skill - not that nobody runs it.

To exercise `diverged` as well, edit any skill's body without bumping its `version`: the hash
moves, the version does not.

## Conventions

- LF line endings, no trailing whitespace.
- **ASCII only in `skills/`, `practices/` and `memory/`** - those files are terse and get
  copied into terminals, shell heredocs and `.claude/` directories where a stray Unicode
  dash is a debugging session nobody planned. **`knowledge/` is UTF-8 prose**: OKF requires
  valid UTF-8, and a bundle is long-form writing where an em dash is correct typography
  rather than an affectation. The lanes differ because their readers do.
- No secrets, ever - not in a file, not in an example, not in a test fixture. A tracked
  credential is a hard failure and has to be rotated, not deleted.
- One idea per skill, per practice, per memory note.
- Vendor-neutral: name the capability (`Test: npm test`), not the tool.

## License

Public domain / CC0. Copy anything here into your own registry and change it to fit.
