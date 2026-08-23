---
name: consult
description: "Consult the ai-registry's knowledge bundles before a product, architecture or domain decision: resolve the registry (local checkout or GitHub), pick the bundle(s) this repo consumes, match the task against subjects and techniques by their use_when triggers, read the golden path + the techniques that apply, apply them, and log the consult so the signals lane can count demand. Use before designing a feature, choosing a pattern, writing a prompt/rubric, or making a product call in any domain the registry covers (software engineering, recruiting, media generation, game production, LLM observability, grant funding, civic intelligence). Invoke with /consult <what you are about to decide or build> [--bundle <name>] [--deep]."
category: ai-native
memory: project
version: 1.1.0
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
