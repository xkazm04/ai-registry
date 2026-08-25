---
layer: application
type: application
subject: agent-instruction-files
technique: single-source-topology
stack: node
verified_on: 2026-08-25
verified_against: node@22
---

# One data file, three consumers: a prompt library that generates its own agent skill (Node)

A public prompt-template library for a text-capable image model —
`freestylefly/awesome-gpt-image-2` at `6854698`, 2026-08-25 — that serves a
static website, an npm-installable agent skill, and a coding-harness
plugin marketplace from one hand-edited data file. The technique this
subject states for instruction files (content exists once; every other
file a consumer requires is a bridge, never a restatement) is realised
here for a *skill* — the same topology one lane over, with a validator
where this subject usually has only a review.

## The single source and its bridges

`data/style-library.json` is the only file a human edits for the
library's structure: 22 templates, each with a category, style and scene
tags, bilingual `useWhen`, `guidance` and `pitfalls`, example-case ids,
and an `anchor` into the long-form template document `docs/templates.md`.
Three consumers derive from it:

- **The website's data** — `scripts/generate-site-data.mjs` reads the same
  file into `data/cases.json` for the gallery and filters.
- **The agent skill's reference** — `scripts/generate-style-skill.mjs`
  renders `agents/skills/gpt-image-2-style-library/references/style-library.md`:
  a selection-rules preamble, then one section per template with its
  id, tags, cover, a deep link to the template's anchor in the source
  document, and the bilingual use-when / guidance / pitfalls. The
  generated file opens by naming its source ("Generated from
  `data/style-library.json`").
- **The plugin marketplace** — `.claude-plugin/marketplace.json` points
  at the skill directory; `bin/install.mjs` copies `SKILL.md`, `agents/`,
  `assets/` and `references/` into a harness's skill folder (`codex`,
  `claude-code`, or a generic `agents` target).

The hand-written half, `SKILL.md`, is the bridge in this subject's sense:
a short method (detect language, classify the target output, match
category → style tag → scene tag → nearest cases, build the prompt in six
named blocks) plus one instruction that makes the topology work — *"Prefer
the reference over memory when template names, categories, covers, or
style tags matter."* The method is authored once; the facts it operates on
are never restated in it.

## The validator is the part this subject usually lacks

`generate-style-skill.mjs` refuses to render when the source is
inconsistent: template ids, category / style / scene values must be
unique; every `anchor` must resolve to a real `<a name>` in
`docs/templates.md`; every cover image must exist on disk and be used by
only one template; and every text block is scanned for one specific
machine-writing tell (a "not X but Y" contrast construction in the
library's primary language) and rejected if found. Generation is wired
into `predev` and `prebuild`, so a stale reference cannot ship — the same
"regenerate or fail" contract this registry runs on its own generated
rules and catalog, and the enforcement this subject's
[enforcement-demotion](../techniques/enforcement-demotion.md) asks for:
what is checkable is checked, and the instruction file merely names the
result.

## What the tree does not do, and what it cannot show

- **The long-form document is a second hand-edited source.** The prompts
  themselves and the per-category pitfall guides live in
  `docs/templates.md`, not in the JSON; the JSON carries only the anchor.
  The validator proves the anchor resolves, not that the guidance
  summary in the JSON agrees with the guide it points at. Two hand-edited
  files with a link between them is the fork this technique warns about,
  held together by a check that sees the link and not the content.
- **Installation is a copy, not a link.** `install.mjs` uses `cpSync`
  into each harness's skill folder, so an installed skill drifts from the
  repository until re-synced; the `sync` command exists, and nothing runs
  it. The registry that hosts this application chose symlinks for the
  same reason.
- **No measure of whether "prefer the reference over memory" is
  obeyed.** The tree gives the agent a reference and an instruction; it
  records nothing about whether a generated prompt actually used the
  template it names. The topology is demonstrated; its effect on the
  agent's output is not.
