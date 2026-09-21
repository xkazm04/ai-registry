---
name: consult
description: "Consult the ai-registry's knowledge bundles before a product, architecture or domain decision: resolve the registry (local checkout or GitHub), pick the bundle(s) this repo consumes, match the task against subjects and techniques by their use_when triggers, read the golden path + the techniques that apply, apply them, and log the consult so the signals lane can count demand. Use before designing a feature, choosing a pattern, writing a prompt/rubric, or making a product call in any domain the registry covers (software engineering, recruiting, media generation, game production, LLM observability, grant funding, civic intelligence). Invoke with /consult <what you are about to decide or build> [--bundle <name>] [--deep]."
category: ai-native
memory: project
version: 1.5.0
tags: knowledge, rkb, consult, routing, signals
argument-hint: "<topic or decision> [--bundle <name>] [--deep]"
---

# Consult - read the standard before deciding

The registry holds seven Reference Knowledge Bundles (four-layer: Golden Path ->
Technique -> Application -> Evidence), forged from real repositories and hardened with
research. Their value is realized only when an agent reads the relevant subject at the
moment a decision is made. This skill is that moment: it routes a task to the subjects
that own it, reads the two upper layers (which transplant unchanged to any codebase),
surfaces the stack-specific applications when a matching stack exists, and records the
consult so demand reaches the registry as a count.

Say the rule out loud once per session: **a bundle states the standard; the repo may
deviate, but a deviation is recorded, never silent.**

## Project overlay

Reads `.ai/manifest.yaml` in the consuming repo when present:

```yaml
registry:
  remote: github:xkazm04/ai-registry      # where the registry lives
  local: ../ai-registry                   # a sibling checkout, if any (optional)
knowledge:
  domains: [software-engineering, recruiting]   # bundles this repo consumes
```

Without an overlay the skill still runs: it consults every bundle, ranks by match, and
says that no domain filter was declared. Resolution order for the registry root:
`$AI_REGISTRY_DIR` -> `registry.local` from the manifest -> sibling `../ai-registry`
-> the public GitHub repo (raw `catalog.json` + `knowledge/<bundle>/index.json`).

**The gap register — name it before you write a deviation.** Say in the response which file
takes the deviations, chosen in this order and no other:

1. `.ai/registry-map.json`, if the repo carries one - a deviation there is a pair's `state`,
   and `/conform` owns that write. Report it and leave the write to `/conform`.
2. The single defect file the repo already declares for this (a `DEVIATIONS.md`, a
   `docs/gaps.md`, the backlog file its own guidance names) - append, at the end.
3. **None of the above: there is no register.** Put the deviation in the response and in the
   consult log, and say that nothing was persisted. Do not create a register, and never
   renumber, re-order or restructure a human-maintained document to make room for one.

Six runs wrote deviations into six different files, which judges read as scope creep - and it
was, because the skill let each run invent its destination.

## Procedure

1. **Resolve the registry** (above). State which root you are reading and its commit or
   date. If only the remote is reachable, fetch `catalog.json` and the needed
   `knowledge/<bundle>/index.json` files; never guess a subject path - `index.json`
   carries each subject's `file`, and bundles are nested.
2. **Pick the bundles.** `--bundle` wins; else the manifest's `knowledge.domains`; else
   all bundles declared in the current catalog with a note.
3. **Match.** Turn the task into 3-8 terms (nouns and the decision being made). With a
   local checkout, ALWAYS route with the script - never by hand:
   `node <registry>/scripts/research-map.mjs "<term>" ... --top 6`. It scores every
   subject slug and every technique's `use_when` from `index.json` for zero context
   tokens; `--deep` additionally opens each golden path for ITS `use_when`, which the
   index does not carry - worth it for a broad decision, not for a named mechanism.
   Remote-only: fetch the bundle's `index.json` and match by hand - knowing that the
   largest bundle's index is well over 100K tokens, so fetch ONE bundle, named by the
   manifest, and match against `use_when` before slugs. Keep the top 3-6 techniques
   across at most 3 subjects.
4. **Read the two upper layers.** The subject's `<subject>.md`, then each selected
   `techniques/<slug>.md`. Read the technique's opening boundary paragraph - the
   interesting material sits between subjects, and the golden path states who owns what.
   Then check `applications/<stack>--<technique>.md` for this repo's stack; an
   application is teaching material with real citations, not a mandate.
5. **Apply, and name the deviations.** State the rule(s) you are following as
   "When X, do Y, because Z" and where the repo falls short. A deviation is a finding:
   record it in the gap register named in `## Project overlay` - never lower the
   standard to match the code.

   **Every claim about this repository carries an anchor.** `<path>:<line>`, repo-root-relative
   exactly as `git ls-files` prints it, for a file you opened *in this run* - a basename is not
   an anchor, and a remembered one is not either. A deviation without an anchor is a hypothesis:
   label it as one ("suspected, unverified") or drop it. The runs that scored highest were the
   runs that cited; the ones that asserted the repo's behaviour from the task description were
   faulted for it ~22 times.

   **Write each deviation the same way**: *standard says X; this repo does Y at `path:line`*.
   One line, one anchor, one consequence.
6. **Log the consult.** Unconditional - `.ai/consults.jsonl` is gitignored telemetry, not an
   edit to the repository, and a consult nobody counted is demand the corpus never sees. Append
   one JSON line to `<repo>/.ai/consults.jsonl`:
   `{"ts":"<ISO>","bundle":"<name>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}`
   **One row per bundle** you read. `subjects` lists **every** subject whose golden path you
   opened, including the ones you read and rejected - a rejected read is the signal that the
   routing sent you somewhere useless, and dropping it makes the corpus look better-aimed than
   it is. `techniques` lists the ones you actually read. Subject and technique are named by bare
   slug - never by path.

   **`deviations: <n>` must have content.** If the count is non-zero, the response lists that
   many deviations in the step-5 form. A count with no prose behind it is a fabricated signal,
   and it is the one number the registry cannot check. If nothing fell short, write `0`.

   If the environment truly forbids the write (a read-only checkout), report the same
   identities and counts in the response and say the log line was not written.

## Anti-patterns

- Reading one technique and presenting it as the subject's whole position - the golden
  path hedges better than its techniques; read it first.
- Constructing a path from a slug. Bundles are nested; `index.json` is the address.
- Laundering an application's measured number into a general rule. Numbers carry their
  measurement; the technique carries the rule.
- Consulting after building. The decision is the moment; a post-hoc consult is a review.
- Asserting what this repo does without opening the file. An unanchored claim about the code
  is the one kind of output a consult has no business producing.

---

<!-- clause: skill-reflection v4 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Project learning.** Only when this run produced an observation that would change how a
future run behaves. A run that went as the method describes writes nothing: an entry that
restates the procedure, records "no issues", or repeats the task is a defect, not a
deliverable. When there is such an observation and local edits are within scope, put one
dated line in the overlay this skill's `## Project overlay` section names, under
`## Skill improvement log`. **Write only into an overlay that already exists.** If the
project has none, put the observation in the response instead - creating a new tracked
file for a reflection is scope the task did not ask for, and a reader who never asked for
the skill has to review it. If the overlay is a structured config (YAML, TOML, JSON),
record the note as comments so the file keeps parsing, or use the response.
Use a supplied memory contract only when its destination and writes are authorized.
Keep project details out of the shared method.

**Method learning.** Identify the installation before editing anything. A local
`.ai/registry-installation.local.json` receipt can identify development versus release,
the registry revision, and selected skill versions. Verify any link's actual target;
do not assume a skill directory is a writable registry link.

- For a pinned release, marketplace cache, ordinary copy, or unknown installation,
  keep a proposal in the project overlay or response. Do not edit the installed method
  or silently relink it. Adoption and rollback are explicit installation operations.
- For a development link, edit the registry only when that checkout is already within
  the accepted task scope. Otherwise report a proposal. Authorized changes belong in
  the source checkout, followed by its gates; commit only when the task authorizes it.
- Record an actual lesson in `LESSONS.md` against the version **used**:
  `## <version-used> - <YYYY-MM-DD> - <project-name>` and concise bullets. A proposal
  must be labeled as such; structural checks are not evidence of field effectiveness.
- Applied skill changes require a version bump: patch for wording, minor for a step
  refinement, major for method redesign. A lesson alone needs no bump. Shared stamped
  clauses are edited in the registry's `docs/skill-clauses/` and regenerated with
  `scripts/apply-skill-clauses.mjs`, never patched in individual installed skills.

**Domain learning.** Follow `## Knowledge sync` when present, within the same scope
and privacy boundaries. A method lesson and a domain knowledge lead are different
artifacts; do not fabricate either to fill a reflection quota.
<!-- /clause: skill-reflection -->
