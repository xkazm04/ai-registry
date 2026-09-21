---
name: consult
description: "Consult the ai-registry's knowledge bundles before a product, architecture or domain decision: resolve the registry (local checkout or GitHub), pick the bundle(s) this repo consumes, match the task against subjects and techniques by their use_when triggers, read the golden path + the techniques that apply, apply them, and log the consult so the signals lane can count demand. Use before designing a feature, choosing a pattern, writing a prompt/rubric, or making a product call in any domain the registry covers (software engineering, recruiting, media generation, game production, LLM observability, grant funding, civic intelligence). Invoke with /consult <what you are about to decide or build> [--bundle <name>] [--deep]."
category: ai-native
memory: project
version: 1.3.0
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

## Procedure

1. **Resolve the registry** (above). State which root you are reading and its commit or
   date. If only the remote is reachable, fetch `catalog.json` and the needed
   `knowledge/<bundle>/index.json` files; never guess a subject path - `index.json`
   carries each subject's `file`, and bundles are nested.
2. **Pick the bundles.** `--bundle` wins; else the manifest's `knowledge.domains`; else
   all seven with a note.
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
   record it in the repo's own gap register (whatever it uses) - never lower the
   standard to match the code.
6. **Log the consult** (one JSON line, append-only, gitignored) to
   `<repo>/.ai/consults.jsonl`:
   `{"ts":"<ISO>","bundle":"<name>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}`
   Subject and technique are named by bare slug - never by path. The registry's
   `scripts/signals-collect.mjs` turns these lines into the `signals/` lane (counts
   only); nothing about the task leaves the machine.

## Anti-patterns

- Reading one technique and presenting it as the subject's whole position - the golden
  path hedges better than its techniques; read it first.
- Constructing a path from a slug. Bundles are nested; `index.json` is the address.
- Laundering an application's measured number into a general rule. Numbers carry their
  measurement; the technique carries the rule.
- Consulting after building. The decision is the moment; a post-hoc consult is a review.

---

<!-- clause: skill-reflection v4 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Lane 0 is written on EVERY run; lanes 1-3 are not. Be honest about volume: most runs produce nothing in lanes 1-3. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 0 - RUN LOG** (every run that started work, including failed and aborted ones; skip read-only info modes such as a status peek, and runs cancelled before any work). Append one row to the registry's run log with one command - identity (project, device) and the skill's version are resolved by the script, never typed (`<registry>` resolves as in lane 2 step 4):

```sh
node <registry>/scripts/log-run.mjs --skill consult --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence: what this run produced>" --comment "<free text>"
```

- `--outcome`: `shipped` (the goal landed) / `partial` / `no-op` (ran correctly, nothing to do) / `parked` (designed or staged, deliberately not landed) / `failed` / `aborted` (stopped by the operator or the harness).
- `--difficulty`: 1 trivial - mechanical, no judgment needed; 2 routine - the method applied as written; 3 demanding - real judgment calls, or one detour; 4 hard - several dead ends, rework, or an operator course-correction; 5 at the edge - partial or failed on the merits, not on tooling. Rate the TASK as this run met it, not the effort you spent.
- `--model` / `--effort`: what you are running as, as your harness states it; omit `--effort` when you cannot see it. `--tokens-est`: the drop in the harness's remaining-token counter from just before this skill was invoked to now; omit it when your harness shows no counter. Exact figures are measured later from the transcript and stored apart - never guess one.
- `--comment` is the self-reflection a reviewer will read: what went well, what the method made harder, where the skill's instructions were wrong, missing or ignored. Specific over polite; no filesystem paths or email addresses (the writer rejects them).
- If the command fails on validation, fix the named field and rerun. If the registry is unreachable, add `--pending` (the row waits in the project's `.ai/`). Never read the run log during a run: it is evidence ABOUT this skill for `/librarian skills`, and an executor that reads its own diagnosis contaminates the next measurement.

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). If this skill carries no `## Project overlay` section, or its overlay section names no location, write that dated one-liner to `.claude/consult/config.md` in the consuming repo under `## Skill improvement log`, creating the file and the heading if they are absent - so the instruction is executable in every skill. When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - consult` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/consult` in a consuming repo is a symlink to `<registry>/skills/consult` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/consult` and `git -C <registry> commit -m "skill(consult): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/consult/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/consult` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
