# ai-registry

An **AI development registry**: the knowledge, skills, practices and shared memory an
organization's agents run from, kept in git, owned by the organization, and reviewed like
code.

The repository carries seven lanes, declared in [`registry.yaml`](registry.yaml):

| Lane | Holds | Status |
| --- | --- | --- |
| [`knowledge/`](knowledge/README.md) | **Reference Knowledge Bundles** - four-layer domain knowledge (Golden Path → Technique → Application → Evidence), one bundle per domain. | Real content. Gated by CI. |
| [`skills/`](docs/skills-lane.md) | The fleet's shared skill library, one directory per skill, published as a **plugin marketplace** for the reference harness. | Real content (25 skills). Gated by CI. |
| `practices/` | Repo-level habits plus the starter artifacts they drop. | Worked example. |
| `memory/` | Organizational memory notes, one fact per file. | Worked example. |
| [`usage/`](docs/usage-lane.md) | Which skills actually get used - counts contributed by the installations that run them, one file per contributor. | Real, gated. First contributor reporting. |
| [`signals/`](docs/signals-lane.md) | Whether the knowledge is still TRUE where it is used - stack versions, citation-resolution verdicts, deviations and consults, one file per contributor. | Real, gated. First contributor reporting (stack only, so far). |
| [`librarian/`](librarian/index.md) | Coverage memory for the maintenance loop - what was swept when, what was dispatched, what external sources were mined, and what was declined and why. | Real. Seeded by the founding sweep. |

The two example lanes (`practices`, `memory`) are deliberately generic and synthetic - no
company, no product, no proprietary code - so tooling that onboards, indexes and tracks a
registry has something real to read. The other five are not examples.

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
.claude-plugin/marketplace.json  # GENERATED: the skills lane as a plugin marketplace, one plugin per skill
.claude/skills/           # the skills that maintain THIS registry: /forge /deepen /librarian /intake
CODEOWNERS                # who merges = who adopts
catalog.json              # GENERATED index: skills, practices, memory, bundles, hashes, adopters, counts
docs/rkb-profile.md       # the knowledge lane's format spec (an OKF profile)
docs/skills-lane.md       # the skills lane's format spec: shape, sub-resources, versions, distribution, resolution
docs/usage-lane.md        # the usage lane's format spec + what may never go in it
docs/signals-lane.md      # the signals lane's format spec: verdicts, never pointers
scripts/check-bundles.mjs # the knowledge lane's gate (zero dependencies)
scripts/check-skills.mjs  # the skills lane's gate: shape, sub-resources, the version-bump rule
scripts/check-usage.mjs   # the usage lane's gate: shape + the counts-only privacy rule
scripts/check-signals.mjs # the signals lane's gate: shape + the same privacy rule
scripts/check-currency.mjs# REPORTS how old the knowledge is; never fails a build
scripts/librarian-scan.mjs# REPORTS the maintenance scorecard; the instrument /librarian reads
scripts/research-ingest.mjs# normalizes an external source into an auditable transcript (/intake)
scripts/research-map.mjs  # maps a claim's terms onto existing subjects: prior art, and where new goes
scripts/apply-taxonomy.mjs# the ONLY thing allowed to move a subject (moves + rewrites links)
scripts/lib/taxonomy.mjs  # the shared slug -> path resolver; nothing else may build a subject path
scripts/lib/skills-lane.mjs # the ONE reader of the skills lane: frontmatter, digest, lessons, sub-resources
scripts/lib/fleet.mjs     # the shared bulk-model dispatcher: retry, budget and model rotation
scripts/fleet-use-when.mjs# proposes the missing use_when lines, then applies the reviewed ones
scripts/build-index.mjs   # regenerates knowledge/<domain>/index.json (--check in CI)
scripts/build-catalog.mjs # regenerates catalog.json from every lane (--check in CI)
scripts/build-marketplace.mjs # regenerates .claude-plugin/marketplace.json from the skills lane (--check in CI)
scripts/fleet-audit.mjs   # OPERATOR-SIDE: which installation runs which copy of which skill; writes adopters
scripts/signals-collect.mjs   # OPERATOR-SIDE: folds connected projects' consult logs + stacks into signals/
scripts/usage-from-personas.mjs # OPERATOR-SIDE: bootstraps usage/ from a Personas installation's own counts
knowledge/<domain>/       # a Reference Knowledge Bundle - see knowledge/README.md
knowledge/<domain>/taxonomy.json  # the authority on where every subject lives; max 10 folders/level
knowledge/<domain>/index.json  # GENERATED: every subject, technique, law and application
skills/<name>/SKILL.md    # frontmatter: name, description, category, memory, version (+ harness keys)
skills/<name>/LESSONS.md  # append-only reflection lane, beside the skill it is about
skills/<name>/references/ # material the method loads on demand; scripts/, tools/, assets/ likewise
practices/<slug>/PRACTICE.md   # frontmatter: id, dimension, applies-when; body = the shape
practices/<slug>/starter/**    # templatized artifacts the practice drops into a repo
memory/<kind>/<slug>.md   # frontmatter: kind, confidence, namespace, source
memory/_index.md          # map of content over the notes
usage/<contributor>.json  # counts from ONE installation - see docs/usage-lane.md
signals/<contributor>.json# currency verdicts from ONE installation - see docs/signals-lane.md
.projects.local.json      # GITIGNORED: slug -> checkout path on this machine; the bridge the operator-side scripts read
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
| [`game-production`](knowledge/game-production/) | Producing a game's systems and content at scale with machine assistance: systems canon and balance validation, the content pipeline and its acceptance ladder, generative asset production, engine integration, machine craft judgment, and production governance. |
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

**Consult it at the moment of decision.** The lane skill [`consult`](skills/consult/SKILL.md)
is how a connected project reads the right subject before a product, architecture or domain
call: it resolves the registry (a sibling checkout or GitHub), matches the task against
`use_when` triggers, reads the golden path and the techniques that apply, and logs the consult
to the project's gitignored `.ai/consults.jsonl`, which is what reaches the `signals/` lane as
a count. A project declares the bundles it consumes in its `.ai/manifest.yaml`
(`knowledge.domains`) and its agent guide says "run `/consult` before deciding".

**Knowledge has an age, and the registry cannot check it alone.** Every application
carries `verified_on` - the date its citations were last resolved against a real tree -
and [`scripts/check-currency.mjs`](scripts/check-currency.mjs) derives an expiry from it
per stack. That answers "how old is this claim". It cannot answer "is it still true",
because the registry does not have the consuming repository's checkout. That half arrives
from the other side, through [`signals/`](docs/signals-lane.md): the installation resolves
its own evidence overlay and reports **verdicts, never pointers** - `{"gone": 2}`, not
which two files. A bundle nobody reports on reads as **unknown**, never as current, for
the same reason `invokes30d: 0` with no contributors means nobody is looking.

**Some knowledge is correct but not yet.** A technique may declare a `stage` - `solo`,
`team`, `multi-service` or `fleet` - naming the rung at which it *starts to pay*
([`docs/rkb-profile.md` §3.2](docs/rkb-profile.md)). It is a floor, not a mandate: below it
the technique is over-engineering and a consumer is right to skip it; at or above it, its
absence is a gap. The field is optional and rare on purpose, and it is carried into each
bundle's `index.json` so a consumer can filter on it.

### Skills (25)

The fleet's shared library. Every skill is generic: project specifics live in a **per-repo
overlay** the skill names in its `## Project overlay` section and runs without. Full spec,
including sub-resources, the ASCII rule, versions, distribution and resolution:
[`docs/skills-lane.md`](docs/skills-lane.md).

| Skill | Category | Version | What it is for |
| --- | --- | --- | --- |
| [`agent-guidance-bootstrap`](skills/agent-guidance-bootstrap/SKILL.md) | `ai-native` | 0.4.0 | Create or refresh a repo's AGENTS.md so an agent joining the codebase gets commands, architecture and constraints without guessing. |
| [`architect`](skills/architect/SKILL.md) | `workflow` | 1.0.0 | Heavy structural codebase scan - weak patterns to upgrade, strong patterns to codify, ADR-style decisions with a durable cross-session backlog. |
| [`ci-bootstrap`](skills/ci-bootstrap/SKILL.md) | `ci-cd` | 0.1.0 | Give a project its first real CI gate, ratcheted so it is green on day one. |
| [`ci-gate-check`](skills/ci-gate-check/SKILL.md) | `ci-cd` | 1.3.0 | Run the checks CI enforces, before you push. |
| [`ci-triage`](skills/ci-triage/SKILL.md) | `ci-cd` | 0.1.0 | Turn a red build into a located first cause and a scoped fix proposal. |
| [`consult`](skills/consult/SKILL.md) | `ai-native` | 1.0.0 | Read the registry's knowledge bundle(s) at the moment of a product, architecture or domain decision, and log the consult for the signals lane. |
| [`explorer`](skills/explorer/SKILL.md) | `workflow` | 1.0.0 | Wander one logical area of a codebase, surface 10 items worth fixing, triage with the user, execute the accepted ones. |
| [`flake-register`](skills/flake-register/SKILL.md) | `testing` | 0.1.0 | Quarantine an intermittent test as tracked debt - owner, cause, expiry. |
| [`friend`](skills/friend/SKILL.md) | `workflow` | 1.0.0 | Endless single-area companion loop: scan → propose 5 directions → user picks → execute → repeat. |
| [`i18n-translate`](skills/i18n-translate/SKILL.md) | `workflow` | 1.1.0 | Copywriting-grade, context-aware localization: a transcreation loop with an engineering guardrail. Carries [`LESSONS.md`](skills/i18n-translate/LESSONS.md). |
| [`kpi-sim`](skills/kpi-sim/SKILL.md) | `testing` | 1.0.0 | Measure a project's KPIs locally, simulate user behavior with UAT-style Characters, predict real-world targets. |
| [`leonardo`](skills/leonardo/SKILL.md) | `other` | 1.0.0 | Generate images (gpt-image-2 / Leonardo), remove backgrounds, analyze with vision, write SVG. |
| [`motionize`](skills/motionize/SKILL.md) | `other` | 1.0.0 | Upgrade a generic UI icon or empty state into a traced, motion-animated SVG. |
| [`mvp`](skills/mvp/SKILL.md) | `workflow` | 1.0.0 | Launch-readiness orchestrator: 21 checklist items across 7 phases, honest scorecard, batched decisions. |
| [`npm-updates`](skills/npm-updates/SKILL.md) | `workflow` | 1.0.0 | Fetch npm package updates, analyze new features, identify improvement opportunities. |
| [`perfect`](skills/perfect/SKILL.md) | `workflow` | 2.3.0 | Session-after-session product perfection loop: a directing model, builder subagents on one shared branch, a vault that remembers. Carries [`LESSONS.md`](skills/perfect/LESSONS.md). |
| [`project-populate`](skills/project-populate/SKILL.md) | `workflow` | 1.0.0 | Populate a newly managed repository with the context map, feature inventory and KPIs its control plane needs. |
| [`promote`](skills/promote/SKILL.md) | `ai-native` | 1.0.0 | Promote one already-existing pattern in a repo into the workspace knowledge library, with evidence. |
| [`research`](skills/research/SKILL.md) | `ai-native` | 1.5.0 | Extract actionable improvements for a project from external sources, scored against the codebase. Carries [`LESSONS.md`](skills/research/LESSONS.md). |
| [`scan-sweep`](skills/scan-sweep/SKILL.md) | `workflow` | 1.0.0 | One context, every scan lens, fix the accepted S/M findings in-session. Carries [`LESSONS.md`](skills/scan-sweep/LESSONS.md). |
| [`ship-loop`](skills/ship-loop/SKILL.md) | `workflow` | 2.1.0 | Milestone-driven ship-readiness loop: scorecard, append-only backlog, user-gated milestones, hard gate. Carries [`LESSONS.md`](skills/ship-loop/LESSONS.md). |
| [`spark`](skills/spark/SKILL.md) | `workflow` | 1.0.0 | Turn a vague product idea into a complete, grounded design through waves of questions, then orchestrate the build. Carries [`LESSONS.md`](skills/spark/LESSONS.md). |
| [`test-before-commit`](skills/test-before-commit/SKILL.md) | `testing` | 2.1.0 | Prove a change works before it is committed. Carries [`LESSONS.md`](skills/test-before-commit/LESSONS.md). |
| [`tiger`](skills/tiger/SKILL.md) | `testing` | 2.1.0 | Certify an LLM app's call sites across three lenses: engine quality, business value, model/cost optimization. Carries [`LESSONS.md`](skills/tiger/LESSONS.md). |
| [`uat`](skills/uat/SKILL.md) | `testing` | 1.7.0 | Simulated User Acceptance Testing driven by Characters, two certification levels, then drained into a design backlog. Carries [`LESSONS.md`](skills/uat/LESSONS.md). |

The skills that maintain *this* registry - [`/forge`](.claude/skills/forge/SKILL.md) (extract a
repo's domain knowledge into a new bundle), [`/deepen`](.claude/skills/deepen/SKILL.md) (raise an
existing bundle above the repo it came from), [`/librarian`](.claude/skills/librarian/SKILL.md)
(sweep every bundle and dispatch the engines) and [`/intake`](.claude/skills/intake/SKILL.md)
(mine a source somebody sent for what it changes here) - live in `.claude/skills/`. They are
slash commands for anyone working *on* the registry, not library items.

`category` comes from a closed set: `ci-cd`, `testing`, `security`, `ai-native`, `docs`,
`workflow`, `other`. Anything else is normalized to `other` at index time. `name` is a kebab-case
slug and must match the directory. `description` is one paragraph - it is how an agent decides
whether to use the skill without reading the body, so it carries the trigger first.

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

## How a project consumes this registry

Plain git is the baseline. Nothing below requires an account or a token.

```sh
# read it
git clone https://github.com/xkazm04/ai-registry.git

# skills, door 1 - the plugin marketplace (versioned, cached, updated on request)
claude plugin marketplace add xkazm04/ai-registry               # once per machine
claude plugin install uat@ai-registry --scope project           # records adoption in .claude/settings.json
claude plugin update uat@ai-registry                            # pull what the registry now carries

# skills, door 2 - copy (the older model; still reviewed, still pinned by its version)
cp -r ai-registry/skills/ci-gate-check <your-repo>/.claude/skills/

# check what you have against what is current
cat ai-registry/catalog.json    # name, version, contentHash, adopters per skill
```

A project points at the registry from its manifest, and names the bundles it consumes:

```yaml
# .ai/manifest.yaml
registry:
  remote: github:xkazm04/ai-registry
  local: ../ai-registry          # optional sibling checkout, for /consult and the evidence gate
knowledge:
  domains: [software-engineering]
```

**Which copy runs, when a name exists in more than one place.** The reference harness
resolves a same-named skill *enterprise over personal over project*; plugin skills are
namespaced and never collide. So the lane's rule is **one home per name**: a name that
lives in this lane lives nowhere else on an installation - not in `~/.claude/skills`, not
as a second project copy beside an enabled plugin. A higher version here does **not**
displace any copy; a version reports staleness, a human updates. Declared in
[`registry.yaml`](registry.yaml) under `lanes.skills.resolution`, explained in
[`docs/skills-lane.md`](docs/skills-lane.md), and checked - from the operator's machine,
because the registry cannot see installations - by
[`scripts/fleet-audit.mjs`](scripts/fleet-audit.mjs), which also writes what it finds into
the catalog's per-skill `adopters`.

## How a change gets in

1. Branch, edit `skills/<name>/SKILL.md` (or anything in its directory), **bump `version`**.
2. Append an entry to that skill's `LESSONS.md`: `## <version used> - <YYYY-MM-DD> - <project>`
   followed by `-` bullets. Record the version the run *used*, not the bump target.
3. `node scripts/check-skills.mjs && node scripts/build-marketplace.mjs && node scripts/build-catalog.mjs`
   - the marketplace and the catalog are generated views and CI fails when they are stale.
4. Open a pull request. A `CODEOWNERS` owner reviews and merges - that merge is the adoption
   decision.
5. Installations update when they choose to: `claude plugin update <name>@ai-registry`, or a
   fresh copy. Merging here changes nothing anywhere until then.

Version discipline: **versions are the comparison currency, hashes only detect drift.** Bump
minor or major when behaviour changes, patch when it does not - but bump. A checker cannot
tell a typo from a behaviour change, so `scripts/check-skills.mjs --since <ref>` asks for the
cheapest honest signal on every pull request that edits a skill, and rejects a version that
moves backwards. Appending to `LESSONS.md` needs no bump: a lesson records a run *against* a
version. Full rule in [`docs/skills-lane.md`](docs/skills-lane.md).

## Counts, witnesses and adopters

`invokes30d` in `catalog.json` is **derived** from the [`usage/`](docs/usage-lane.md) lane -
the first contributor is a Personas installation reporting its own 30-day counts. A zero with
an empty `usageContributors` means nobody is reporting on that skill, not that nobody runs it.
`adopters` is written by the operator-side `fleet-audit` from the installations it can see
(`<project>@<version>` for copies, `<project>@plugin:<version>` for enabled plugins); the
registry carries it forward and never invents it. Bundle currency reads from
[`signals/`](docs/signals-lane.md): a bundle with no reporting installation is **unknown**,
never current.

## Conventions

- LF line endings, no trailing whitespace.
- **ASCII where it bites.** `practices/` and `memory/` are ASCII-only: terse, templated files
  that get pasted into terminals and `.claude/` directories. In `skills/`, frontmatter is ASCII
  and fenced code may carry no lookalike punctuation (a Unicode dash or quote that reads as
  ASCII and breaks a pasted command); prose is UTF-8. **`knowledge/` is UTF-8 prose**: OKF
  requires valid UTF-8, and a bundle is long-form writing where an em dash is correct
  typography. The lanes differ because their readers do.
- No secrets, ever - not in a file, not in an example, not in a test fixture. A tracked
  credential is a hard failure and has to be rotated, not deleted.
- One idea per skill, per practice, per memory note.
- Vendor-neutral: name the capability (`Test: npm test`), not the tool.

## License

Public domain / CC0. Copy anything here into your own registry and change it to fit.
