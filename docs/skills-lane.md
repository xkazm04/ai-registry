# The `skills/` lane

Agent skills: one directory per skill, the instructions in `SKILL.md`, the reflection
beside it in `LESSONS.md`, the resources it loads beside both.

A skill is not documentation. It is instructions that an agent executes with tool access
against a real codebase, which is why this lane is reviewed like code and versioned like
a dependency rather than edited like a wiki.

This lane holds the skills that transplant to **any** repository — the fleet's shared
library. The skills that maintain *this* registry (`/forge`, `/deepen`, `/librarian`,
`/intake`) live in `.claude/skills/` and are not library items.

## Checks beyond structure

`check-skills.mjs` is the structural gate. Two further tiers exist or are adopted
direction (ladder pattern from the public agent-skills eval repos, kept where it
earns its place):

- **Trigger & routing** — `node scripts/check-skill-triggers.mjs` lints every
  skill description pairwise for vocabulary near-collision (advisory; `--strict`
  fails at containment ≥ 0.6; `TRIGGER_FLOOR` tunes the report). A selector that
  confuses two skills is the measured scaling failure of skill libraries — see
  `agent-memory/procedure-promotion`, "Selection is the scaling failure". Two
  colliding skills are one skill with a parameter, or two whose descriptions
  must name their boundary.
- **Deterministic script tests and behavioral evals** — not yet standing. A lane
  skill that ships scripts should carry its own `test_*.mjs` beside them; the
  harness's plugin-eval schema is the target for behavioral cases when a skill's
  behaviour, not its structure, regresses. Adopt per skill when one earns it.

## The shape

```
skills/<name>/SKILL.md        # required - frontmatter + the method
skills/<name>/LESSONS.md      # optional - append-only, one block per run
skills/<name>/references/     # optional - material the method loads on demand
skills/<name>/scripts/        # optional - instruments the method runs
skills/<name>/tools/          # optional - same, for tooling with its own deps
skills/<name>/assets/         # optional - templates, images, fixtures
skills/<name>/package.json    # optional - WITH a lockfile; never node_modules/
```

`<name>` is kebab-case and **is** the skill's identity: the directory name and the `name`
field must agree. A consumer copies or installs the directory; an indexer reads the field.
When they disagree, a copy and an index disagree about what was adopted. The method file
is `SKILL.md` in that exact case — a lowercase `skill.md` works only on a case-insensitive
disk and vanishes on the next one.

**Depth is fixed.** `skills/<name>/SKILL.md` is exactly three path segments; the
reference consumer's indexer and the plugin marketplace both address a skill at that
depth. A category folder here would not error — it would make every skill vanish from
both. If the lane outgrows browsing, the answer is a coordinated spec bump, not a folder.

### Frontmatter

```yaml
---
name: ci-gate-check
description: "Run the exact checks CI enforces before you push, so a red pipeline is never how you find out. Use before every push and after an agent finishes a batch of edits."
category: ci-cd
memory: project
version: 1.3.0
tags: pre-push, gate, lint, typecheck, tests
argument-hint: "[--fix]"          # optional - a harness key
---
```

| field | required | meaning |
| --- | --- | --- |
| `name` | yes | Kebab-case slug, matching the directory. |
| `description` | yes | One paragraph. This is how an agent decides whether to use the skill **without reading the body**, so it carries the trigger first and the summary second. **Hard cap 1,536 characters** (with `when_to_use`) — the reference harness truncates the routing signal there silently, and a truncated trigger is a skill that stops being reached for. The gate fails it; it warns from 1,200. |
| `category` | yes | Closed set: `ci-cd`, `testing`, `security`, `ai-native`, `docs`, `workflow`, `other`. An unlisted value is normalized to `other` at index time, which is why the gate rejects it here. |
| `memory` | yes | Which memory scope the skill reads and writes: `project`, `vault`, `user`, `none`. |
| `version` | yes | Semver `MAJOR.MINOR.PATCH`, three parts. See below — this field does more work than any other. |
| `tags` | no | Free-form, comma-separated or a list. |

**Harness keys are allowed** and passed through unchanged: `argument-hint`, `arguments`,
`allowed-tools`, `disallowed-tools`, `disable-model-invocation`, `user-invocable`,
`paths`, `context`, `agent`, `model`, `effort`, `background`, `hooks`, `shell`,
`when_to_use`, `metadata`, `license`, `compatibility`. So is `contexts` (an installation
key). Other unknown keys are **allowed** too — this registry guarantees `compatibility:
additive` — and surfaced as notes rather than failures, so a typo'd key is visible without
a new field being a breaking change.

**Frontmatter is ASCII.** Every consumer parses it with a small hand-rolled parser; a
smart quote in a value is a parse difference between two of them.

### The body

Keep `SKILL.md` under 500 lines — the harness's own guidance, and the gate notes it.
Long reference material belongs in `references/` and is loaded only when the method
reaches for it. Refer to bundled files as `${CLAUDE_SKILL_DIR}/references/<file>` (the
harness substitutes the variable in the body and in `allowed-tools` rules, wherever the
skill is installed) or with a relative markdown link.

**The body is generic.** It may not carry one project's name, paths, vault location,
component names, gate commands or file lists — those are exactly the bytes that made the
fleet's copies diverge. Everything project-specific lives in a **per-repo overlay** that
the skill reads at start and runs without. The skill's `## Project overlay` section names
the overlay location (default `.claude/<skill-name>/config.md` in the consuming repo, or
the vault/overlay directory the skill already keeps there) and lists the keys it may
carry, each with a default. A skill that needs an overlay to run at all is a project
skill, not a lane skill.

### What a skill directory may not publish

`node_modules/`, `out/`, `output/`, `state/`, `dist/`, `tmp/`, `.cache/`, `*.local.*`,
installation sidecars (`.personas-skill-meta.json`). The gate fails them. Installed
dependencies are the consumer's to install (ship `package.json` + `package-lock.json`;
plugin installs run `npm ci --ignore-scripts` into the cached copy); run artifacts are
nobody's to publish; and **mutable state lives in the consuming repository** — a skill
that writes into its own directory diverges on first use and can never be synced again.
Under a plugin install the harness also offers `${CLAUDE_PLUGIN_DATA}`, a per-plugin
directory that survives updates, for state that is not repo-shaped.

## ASCII where it bites

Prose in this lane is UTF-8: a skill is long-form writing, and an em dash is correct
typography rather than an affectation. The rule is narrower than it used to be and
enforced where the hazard actually is:

- **Frontmatter** — ASCII only (parsers, above).
- **Fenced code** — no *lookalike* punctuation: the dashes U+2010–2015, the quotes
  U+2018–201F, the no-break space, `…`, `×`, `≤`, `≥`, `≠`. Each has an ASCII twin a
  reader's eye substitutes and a shell does not; a pasted command breaks silently. A
  Czech string in a heredoc or a box-drawing diagram is fine — that is data, not an
  operator. The gate reports the first offender per file with its code point.

`practices/` and `memory/` keep the stricter ASCII-only rule; their files are terse and
templated and get pasted wholesale.

## Version discipline

> **Versions are the comparison currency. Hashes only detect drift.**

A consumer answers "am I stale?" by comparing its copy's version against the registry's.
That comparison is the entire sync model, and it has a silent failure: if an author
changes a skill and leaves the version alone, every consumer resolves `in_sync` while
running different instructions. Nobody is notified, because nothing is wrong from either
side's point of view. `contentHash` would reveal it, but a hash can only say *that*
something differs — it cannot order two copies, so it cannot answer "which of us is behind".

So `scripts/check-skills.mjs --since <ref>` enforces two rules on every pull request:

- **Content changed, version did not → fail.** Any file under the skill directory except
  `LESSONS.md` is content — the references and scripts a skill ships are part of the
  method. A checker cannot distinguish a typo from a behaviour change, so it asks for the
  cheapest honest signal instead of guessing: a **patch** bump. The patch level exists for
  exactly this and costs nothing.
- **Version went backwards → fail.** A consumer already at the higher version resolves as
  ahead of the registry and never syncs again.

Appending to `LESSONS.md` does **not** require a bump. A lesson records a run *against* a
version; it is not a change to the method.

The practical rule for authors is unchanged: bump minor or major when behaviour changes,
patch when it does not. What the gate adds is that "leave it alone" is no longer an option
for a change that alters the directory. And the version is also the **update signal of
the marketplace** (below): a consumer receives a new copy exactly when the version moves.

## `LESSONS.md`

Append-only, newest or oldest first as the file already does — but never rewritten:

```markdown
## <version used> - <YYYY-MM-DD> - <project>
- What the run taught, in bullets.
```

The version slot records the version the run **used**, not the bump it argues for, so a
future reader can tell which method produced the lesson. A range (`0.1-1.0`) is valid
when a lesson covers an arc; a two-part version is valid for a run that predates semver.
The separator may be `-` or an em dash — lessons arrive from installations that write
either. The gate checks the heading shape; append-only is a property of history, not of
a file, so it is enforced by review.

## Distribution, part 1: within one owner's machine, a skill is LINKED

**The default here is a link, not a copy.** Every consuming project's
`.claude/skills/<name>` is a symlink into this lane, so there is exactly one file on the
machine:

```sh
node scripts/link-registry.mjs           # make the machine match every project's manifest
node scripts/link-registry.mjs --check   # verify; the form for a pre-commit hook
```

The harness supports this directly: *"A `<skill-name>` entry in the enterprise, personal,
or project locations can be a symlink to a directory elsewhere on disk. Claude Code follows
the symlink and reads `SKILL.md` from the target directory, and if the same target is
reachable from more than one location, Claude Code loads the skill once."*

What that buys, and why it is the default:

- **Editing a shared skill from a project session edits the lane's file.** There is no
  copy to sync, so the failure this registry measured across the fleet — 44 copies, 0 in
  sync — cannot recur. The skill is live in every project immediately; the harness watches
  skill directories and reloads within the session.
- **The shadowing class of bug is gone by construction.** One target reachable from several
  locations loads once, so "personal overrides project" has nothing to override.
- **The declaration stays reviewable.** The LINK is machine state and is gitignored (a link
  committed into a repo is a dangling path on the next machine). WHICH skills a project uses
  is committed, in that project's `.ai/manifest.yaml` under `skills:` — the same reviewable
  record the plugin `enabledPlugins` list used to be.
- **A real directory under `.claude/skills/` is a project-owned skill** and is never
  touched. Refusing to convert one is the point: a project skill that shadows a lane name is
  a finding for `scripts/fleet-audit.mjs`, not something to silently delete.

This is the right default **because one person owns the registry and every consumer**. The
ceremony below exists to stop one party's merge from changing another party's agent. With
one party, that protection is a tax: it charges a round trip (edit → bump → regenerate →
commit → push → update in six repos) and protects nobody.

## Distribution, part 2: for a second machine or a second person, a plugin marketplace

The moment the registry and a consumer are owned by **different people** — a second
developer, a second machine, CI — the link stops being appropriate: an edit here would
change what someone else's agent does, with no review and nobody present. Then the answer
is the marketplace, which is version-pinned, per-project and updated by an explicit human
act. It is generated and gated continuously so it is ready the day it is needed, and every
skill in this lane is one single-skill plugin:

```
.claude-plugin/marketplace.json    # GENERATED by scripts/build-marketplace.mjs (--check in CI)
  { "name": "<skill>", "source": "./skills/<skill>", "version": "<frontmatter version>" }
```

A plugin whose root holds `SKILL.md` loads as one skill named by its frontmatter `name`,
invoked as `/<skill>:<skill>` and — when nothing else claims the bare name — as
`/<skill>`. One plugin per skill keeps adoption per skill, and keeps this lane's fixed
depth untouched: a plugin root is simply the skill directory the indexer already matches.

Both doors are human acts:

```sh
# door 1 - install (versioned, cached, updated on request)
claude plugin marketplace add xkazm04/ai-registry       # once per machine
claude plugin install uat@ai-registry --scope project   # writes .claude/settings.json enabledPlugins
claude plugin update uat@ai-registry                    # pull the version the registry now carries

# door 2 - copy (the older model; still valid, still reviewed, still pinned by version)
cp -r ai-registry/skills/uat <repo>/.claude/skills/
```

A project that enables a plugin in `.claude/settings.json` has declared its adoption in
git, where it is reviewed like everything else and where `scripts/fleet-audit.mjs` can
read it back into the catalog's `adopters`. A project that copies has a pinned copy whose
staleness the same script reports. Either way **merging here changes nothing anywhere**
until someone, somewhere, updates — which is the point, when there is someone else.

`fleet-audit` reports all three states side by side: `<project>:link` (the lane's own
file), `<project>@<version> <verdict>` (a copy, with its staleness), and
`<project>:plugin` (an enabled plugin). A fleet is allowed to mix them; what it may not do
is hold two homes for one name.

`claude plugin validate .` at the registry root is the harness-side check; the gate does
not run it (it is not part of a zero-dependency toolchain) and says so.

## Resolution: which copy runs

A skill name can exist in several places at once: the repository being worked in
(`.claude/skills/`), the operator's personal library (`~/.claude/skills/`), an enterprise
tier, a plugin cache, and here. The reference harness resolves a same-named skill by
source, and the rule is **not** nearest-wins:

> Across levels, **enterprise overrides personal, and personal overrides project**.
> Plugin skills are namespaced (`/<plugin>:<skill>`) and never collide; the bare name
> reaches the plugin only when no other source claims it.

That has a consequence this lane learned the expensive way: a personal copy of `perfect`
silently ran in every one of six projects that carried their own, newer, diverged copy.
Nothing was wrong from any side's point of view.

So the lane's rule is **one home per name** — and a link is the strongest way to satisfy
it, because a link is not a second home at all:

- A name that lives in this lane lives **nowhere else** on an installation — not in the
  personal tier, not as a second project copy beside a plugin. The registry cannot see
  an installation, so it cannot gate this; `scripts/fleet-audit.mjs` runs where the
  installations are and reports every shadow it finds.
- Project-specific skills keep project-specific names (`research-pof`, not a fork of
  `research`). A fork that keeps the shared name is a shadow waiting to happen.
- **A higher version here does not displace any copy.** If it did, merging a pull request
  in this repository would change the behaviour of every repository that ever adopted the
  skill — remotely, silently. A version across sources reports staleness; a human
  resolves it.

Declared in [`registry.yaml`](../registry.yaml) under `lanes.skills.resolution`.

## What the gate does not check

- **Whether the body is any good.** That is the CODEOWNERS review, and it is the point of
  `write_path: pull-request`.
- **Whether a lesson was actually appended** after a behaviour change. Append-only is a
  property of history.
- **Whether an installation shadows a lane skill**, holds a stale copy, or enables the
  plugin — the registry cannot see installations; `scripts/fleet-audit.mjs` can, from the
  operator's machine, and writes what it finds into the catalog's `adopters`.
- **Whether the marketplace validates in the harness** — run `claude plugin validate .`.
