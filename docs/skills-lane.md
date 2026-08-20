# The `skills/` lane

Agent skills: one directory per skill, the instructions in `SKILL.md`, the reflection
beside it in `LESSONS.md`.

A skill is not documentation. It is instructions that an agent executes with tool access
against a real codebase, which is why this lane is reviewed like code and versioned like
a dependency rather than edited like a wiki.

## The shape

```
skills/<name>/SKILL.md      # required — frontmatter + the method
skills/<name>/LESSONS.md    # optional — append-only, one block per run
```

`<name>` is kebab-case and **is** the skill's identity: the directory name and the `name`
field must agree. A consumer copies the directory; an indexer reads the field. When they
disagree, a copy and an index disagree about what was adopted.

### Frontmatter

```yaml
---
name: ci-gate-check
description: "Run the exact checks CI enforces before you push, so a red pipeline is never how you find out."
category: ci-cd
memory: project
version: 1.3.0
tags: pre-push, gate, lint, typecheck, tests
---
```

| field | required | meaning |
| --- | --- | --- |
| `name` | yes | Kebab-case slug, matching the directory. |
| `description` | yes | One line. This is how an agent decides whether to use the skill **without reading the body**, so it carries the routing signal, not a summary. |
| `category` | yes | Closed set: `ci-cd`, `testing`, `security`, `ai-native`, `docs`, `workflow`, `other`. An unlisted value is normalized to `other` at index time — which is why the gate rejects it here, where a typo is still visible. |
| `memory` | yes | Which memory scope the skill reads and writes. |
| `version` | yes | Semver `MAJOR.MINOR.PATCH`. See below — this field does more work than any other. |
| `tags` | no | Free-form, comma-separated or a list. |

Unknown keys are **allowed**: this registry guarantees `compatibility: additive`, and a
reader must ignore what it does not recognize. The gate surfaces them as notes rather than
failures, so a typo'd key is visible without a new field being a breaking change.

## Version discipline

> **Versions are the comparison currency. Hashes only detect drift.**

A consumer answers "am I stale?" by comparing its copy's version against the registry's.
That comparison is the entire sync model, and it has a silent failure: if an author
changes a skill and leaves the version alone, every consumer resolves `in_sync` while
running different instructions. Nobody is notified, because nothing is wrong from either
side's point of view. `contentHash` would reveal it, but a hash can only say *that*
something differs — it cannot order two copies, so it cannot answer "which of us is behind".

So `scripts/check-skills.mjs --since <ref>` enforces two rules on every pull request:

- **Content changed, version did not → fail.** A checker cannot distinguish a typo from a
  behaviour change, so it asks for the cheapest honest signal instead of guessing: a
  **patch** bump. The patch level exists for exactly this and costs nothing.
- **Version went backwards → fail.** A consumer already at the higher version resolves as
  ahead of the registry and never syncs again.

Appending to `LESSONS.md` does **not** require a bump. A lesson records a run *against* a
version; it is not a change to the method.

The practical rule for authors is unchanged: bump minor or major when behaviour changes,
patch when it does not. What the gate adds is that "leave it alone" is no longer an option
for a change that alters the file.

## ASCII only

Files in this lane are ASCII. They get copied into terminals, shell heredocs and `.claude/`
directories, where a stray Unicode dash is a debugging session nobody planned. `knowledge/`
is UTF-8 prose by contrast, because the lanes have different readers.

Write `-` for a dash, `->` for an arrow, `<=` `!=` `x` for the operators. The gate reports
the first offending line per file with its code point.

## `LESSONS.md`

Append-only, newest or oldest first as the file already does — but never rewritten:

```markdown
## <version used> - <YYYY-MM-DD> - <project>
- What the run taught, in bullets.
```

The version slot records the version the run **used**, not the bump it argues for, so a
future reader can tell which method produced the lesson. A range (`0.1-1.0`) is valid when
a lesson covers an arc. The gate checks the heading shape; append-only is a property of
history, not of a file, so it is enforced by review.

## Resolution: which copy runs

A skill rarely exists in one place. The same name can sit in the repository being worked
in, in the operator's own library, and here — three copies, three versions, and until this
section existed, nothing saying which one an agent actually loads.

Declared in [`registry.yaml`](../registry.yaml) under `lanes.skills.resolution`:

| tier | where | wins against |
| --- | --- | --- |
| `project` | the repository being worked in | everything |
| `user` | the operator's own library | `registry` |
| `registry` | this repository | — |

**Nearest to the work wins, outright.** A tier is a location, not a ranking of quality.

### Version does not break ties across tiers

This is the load-bearing rule, and it is the counterintuitive one: **a higher version here
does not displace a nearer copy.** A repository pinned to `1.1` keeps running `1.1` after
`1.7` is merged here.

That is not conservatism, it is the whole safety property. If the newest version won, then
merging a pull request in this repository would change the behaviour of every repository
that ever adopted the skill — remotely, silently, without anyone there present to review
it. A skill executes with tool access against a live codebase. "Someone else's merge
changed what my agent does to my repo" is the one outcome a registry must never produce.

So what a version does across tiers is **report staleness, never resolve it**. A consumer
three minors behind should be told so, clearly, and then left alone until a human syncs.
This is the mirror of the rule the rest of this registry already runs on: merging is
adopting, and it is a human act. Copying is consuming, and it is also a human act. Nothing
here auto-resolves in either direction.

The failure this prevents is not hypothetical. Measured on a live installation while this
section was being written: one skill at `1.7` in the user tier and `1.1` in a project tier,
six minors apart, with the publish ritual pushing outward and nothing ever pulling forward
— and no rule anywhere saying which of the two an agent would load.

### What the registry cannot do here

**This rule is not gated, and cannot be.** The registry cannot see a consumer's tiers; it
has no way to know what any installation holds. `scripts/check-skills.mjs` does not check
it and never will.

It is declared here so that the tool doing the syncing has something to honour instead of
inventing its own answer per installation, and so that two consumers of this registry
resolve the same name the same way. A consumer that resolves differently is not violating
a gate — it is diverging from a documented contract, which is a review conversation, not a
build failure.

## Not yet specified

**Sub-resources.** Skills in this lane are `SKILL.md` plus `LESSONS.md` and nothing else.
Real skill libraries carry more — `references/`, `scripts/`, `assets/`, and in some cases a
mutable `state/` directory the skill writes to across runs. None of that has a declared
shape here yet, and the two questions it raises are open:

- How does a body reference a resource that a consumer may have copied to a different path?
- What happens to a skill's *mutable* state on sync — is it the registry's, the
  installation's, or excluded from publication entirely?

Until this is specified, a skill that needs sub-resources is not yet a good fit for the
lane. The gate does not check them, and says so in its output rather than implying coverage.

## What the gate does not check

- **Whether the body is any good.** That is the CODEOWNERS review, and it is the point of
  `write_path: pull-request`.
- **Whether a lesson was actually appended** after a behaviour change. Append-only is a
  property of history.
- **Sub-resources**, per above.
