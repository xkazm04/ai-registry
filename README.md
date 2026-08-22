# ai-registry

An **AI development registry**: the knowledge, skills, practices and shared memory an
organization's agents run from, kept in git, owned by the organization, and reviewed like code.

The repository carries seven lanes, declared in [`registry.yaml`](registry.yaml):

| Lane | Holds | Status |
| --- | --- | --- |
| [`knowledge/`](knowledge/README.md) | **Reference Knowledge Bundles** - four-layer domain knowledge (Golden Path → Technique → Application → Evidence), one bundle per domain. | Real content. Gated by CI. |
| [`skills/`](docs/skills-lane.md) | Agent skills, one directory per skill. | Worked example; a real library migrates in later. Gated by CI. |
| `practices/` | Repo-level habits plus the starter artifacts they drop. | Worked example. |
| `memory/` | Organizational memory notes, one fact per file. | Worked example. |
| [`usage/`](docs/usage-lane.md) | Which skills actually get used - counts contributed by the installations that run them, one file per contributor. | Real, gated. Empty until an installation reports. |
| [`signals/`](docs/signals-lane.md) | Whether the knowledge is still TRUE where it is used - stack versions, citation-resolution verdicts, deviations and consults, one file per contributor. | Real, gated. Empty until an installation reports. |
| [`librarian/`](librarian/index.md) | Coverage memory for the maintenance loop - what was swept when, what was dispatched, what external sources were mined, and what was declined and why. | Real. Seeded by the founding sweep. |

The three example lanes (`skills`, `practices`, `memory`) are deliberately generic and synthetic -
no company, no product, no proprietary code - so tooling that onboards, indexes and tracks a
registry has something real to read. The other four are not examples: `knowledge/` holds the
actual bundles, `librarian/` holds the real record of maintaining them, and `usage/` and
`signals/` hold real numbers the moment an installation reports them.

Lane depth is declared, not incidental. `knowledge/` is `depth: nested` and caps every level at
ten folders; `skills/`, `practices/`, `memory/`, `usage/` and `signals/` are `depth: fixed`
because a consumer's indexer selects their artifacts by exact path length - a category folder
there would not error, it would make every artifact silently vanish from the index.

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
docs/skills-lane.md       # the skills lane's format spec + the version-discipline rule
docs/usage-lane.md        # the usage lane's format spec + what may never go in it
docs/signals-lane.md      # the signals lane's format spec: verdicts, never pointers
scripts/check-bundles.mjs # the knowledge lane's gate (zero dependencies)
scripts/check-skills.mjs  # the skills lane's gate: shape + the version-bump rule
scripts/check-usage.mjs   # the usage lane's gate: shape + the counts-only privacy rule
scripts/check-signals.mjs # the signals lane's gate: shape + the same privacy rule
scripts/check-currency.mjs# REPORTS how old the knowledge is; never fails a build
scripts/librarian-scan.mjs# REPORTS the maintenance scorecard; the instrument /librarian reads
scripts/research-ingest.mjs# normalizes an external source into an auditable transcript
scripts/research-map.mjs  # maps a claim's terms onto existing subjects: prior art, and where new goes
scripts/apply-taxonomy.mjs# the ONLY thing allowed to move a subject (moves + rewrites links)
scripts/lib/taxonomy.mjs  # the shared slug -> path resolver; nothing else may build a subject path
scripts/build-index.mjs   # regenerates knowledge/<domain>/index.json (--check in CI)
scripts/build-catalog.mjs # regenerates catalog.json (--check in CI)
knowledge/<domain>/       # a Reference Knowledge Bundle - see knowledge/README.md
knowledge/<domain>/taxonomy.json  # the authority on where every subject lives; max 10 folders/level
knowledge/<domain>/index.json  # GENERATED: every subject, technique, law and application
skills/<name>/SKILL.md    # frontmatter: name, description, category, memory, version
skills/<name>/LESSONS.md  # append-only reflection lane, beside the skill it is about
practices/<slug>/PRACTICE.md   # frontmatter: id, dimension, applies-when; body = the shape
practices/<slug>/starter/**    # templatized artifacts the practice drops into a repo
memory/<kind>/<slug>.md   # frontmatter: kind, confidence, namespace, source
memory/_index.md          # map of content over the notes
usage/<contributor>.json  # counts from ONE installation - see docs/usage-lane.md
signals/<contributor>.json# currency verdicts from ONE installation - see docs/signals-lane.md
```

Two `registry.yaml` files is deliberate, not drift: the root one says what this repository is,
the `.ascent/` one says how Ascent indexes it. A second consumer adds its own overlay; neither
rewrites the other, and a reader that knows only one of them still works.

## What is in here

### Knowledge bundles

| Bundle | Covers |
| --- | --- |
| [`software-engineering`](knowledge/software-engineering/) | Building and operating software: UI surfaces, client architecture, LLM/agent engineering, backend platform, operations, security, integration, engineering process, and engineering assessment (measuring maturity, delivery and adoption). |
| [`media-generation`](knowledge/media-generation/) | Producing factual audiovisual content with generative models: narrative craft, research grounding, image generation and prompting, frame direction, production operations. |
| [`civic-intelligence`](knowledge/civic-intelligence/) | Watching public power with data: parliamentary records, legislation, public money, and the accountability methodology for publishing about real, named people. |
| [`grant-funding`](knowledge/grant-funding/) | Finding, winning and accounting for grant money: the funding landscape, eligibility and matching, proposal craft, and grant operations from deadline to post-award. |
| [`llm-observability`](knowledge/llm-observability/) | Operating production LLM traffic as a product: telemetry and cost attribution, price books and usage governance, unit economics, judge-scoring of live traces, and federated benchmark sharing. |
| [`recruiting`](knowledge/recruiting/) | Hiring people with machine assistance and staying defensible: role definition and intake, candidate evidence and its provenance, interviews and work samples, automated screening and its fairness gates, pipeline operations, candidate experience, governance and consent, and honest measurement of a small-sample process. |

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

**Knowledge has an age, and the registry cannot check it alone.** Every application
carries `verified_on` - the date its citations were last resolved against a real tree -
and [`scripts/check-currency.mjs`](scripts/check-currency.mjs) derives an expiry from it
per stack. That answers "how old is this claim". It cannot answer "is it still true",
because the registry does not have the consuming repository's checkout. That half arrives
from the other side, through [`signals/`](docs/signals-lane.md): the installation resolves
its own evidence overlay and reports **verdicts, never pointers** - `{"gone": 2}`, not
which two files. A bundle nobody reports on reads as **unknown**, never as current, for
the same reason `invokes30d: 0` with no contributors means nobody is looking.

### Skills (7)

| Skill | Category | Version | What it is for |
| --- | --- | --- | --- |
| [`ci-gate-check`](skills/ci-gate-check/SKILL.md) | `ci-cd` | 1.3.0 | Run the checks CI enforces, before you push. |
| [`test-before-commit`](skills/test-before-commit/SKILL.md) | `testing` | 2.1.0 | Prove a change works before it is committed. Carries [`LESSONS.md`](skills/test-before-commit/LESSONS.md). |
| [`agent-guidance-bootstrap`](skills/agent-guidance-bootstrap/SKILL.md) | `ai-native` | 0.4.0 | Write or refresh a repo's `AGENTS.md` from evidence. |
| [`domain-knowledge-forge`](skills/domain-knowledge-forge/SKILL.md) | `ai-native` | 1.2.0 | Extract a repository's domain knowledge into a four-layer RKB bundle, with a bounded agent pool. Carries [`LESSONS.md`](skills/domain-knowledge-forge/LESSONS.md). |
| [`deepen`](skills/deepen/SKILL.md) | `ai-native` | 1.1.0 | Review and widen an existing bundle topic via research lanes, batch workers, or a saturation-ledger loop. Carries [`LESSONS.md`](skills/deepen/LESSONS.md). |
| [`librarian`](skills/librarian/SKILL.md) | `ai-native` | 1.1.0 | Sweep every bundle for structural and quality decay, rank it, and dispatch the other engines at what needs work. Keeps coverage memory in [`librarian/`](librarian/index.md). |
| [`research`](skills/research/SKILL.md) | `ai-native` | 0.6.0 | Mine an external source - a video, an article, pasted notes - for what it changes here, and in the connected projects that consume it. Carries [`LESSONS.md`](skills/research/LESSONS.md). |

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

**Which copy runs, when a repo has its own.** Nearest to the work wins, outright: a skill in
the repository beats one in the operator's library, which beats this registry. A higher
version here does **not** displace a nearer copy — because if it did, merging a pull request
in this repository would change what every adopting repository's agent does, remotely and
silently. Across tiers a version reports staleness; it never resolves it. Merging is
adopting, copying is consuming, and both stay human acts. Declared in
[`registry.yaml`](registry.yaml) under `lanes.skills.resolution`, explained in
[`docs/skills-lane.md`](docs/skills-lane.md) — and not enforceable from here, since the
registry cannot see what any installation holds.

## How a change gets in

1. Branch, edit `skills/<name>/SKILL.md`, **bump `version`**.
2. Append an entry to that skill's `LESSONS.md`: `## <version used> - <YYYY-MM-DD> - <project>`
   followed by `-` bullets. Record the version the run *used*, not the bump target.
3. Open a pull request. A `CODEOWNERS` owner reviews and merges - that merge is the adoption
   decision.
4. The indexer picks up the merge and rewrites `catalog.json`; the next sync anywhere sees it.

Version discipline: **versions are the comparison currency, hashes only detect drift.** Bump
minor or major when behaviour changes, patch when it does not — but bump. A checker cannot
tell a typo from a behaviour change, so `scripts/check-skills.mjs --since <ref>` asks for the
cheapest honest signal on every pull request that edits a skill, and rejects a version that
moves backwards. Appending to `LESSONS.md` needs no bump: a lesson records a run *against* a
version. Full rule in [`docs/skills-lane.md`](docs/skills-lane.md).

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

To exercise `diverged` as well, edit any skill's body without bumping its `version` **in your
working tree**: the hash moves, the version does not. Keep it local — that state is a consumer
test fixture, not a thing to merge, and `scripts/check-skills.mjs --since <ref>` rejects it on
any pull request. That is the point: `diverged` should be reachable on a developer's machine
and unreachable on `main`.

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
