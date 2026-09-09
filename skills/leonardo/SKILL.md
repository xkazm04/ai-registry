---
name: leonardo
memory: none
category: other
description: Generate images with OpenAI gpt-image-2 (primary) or Leonardo AI (fallback), remove backgrounds, analyze with Gemini vision, and write SVG. For brand assets, UI illustrations, backgrounds, and icons.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node *), Bash(npx *)
argument-hint: <description of visual asset to create>
version: 1.4.0
---

# Leonardo — AI Image Generation & Visual Assets

Generate production-quality images. **Default generator: OpenAI `gpt-image-2`**
(snapshot `gpt-image-2-2026-04-21`) — an agentic image model that reasons about
structure (and can web-search) before rendering and returns 2K-capable PNGs;
needs `OPENAI_API_KEY`. **Fallback: Leonardo AI** (Lucid Origin) when no OpenAI
key is set. Gemini vision is used for analysis and iterative refinement.

Prefer gpt-image-2 for logos/brand marks (cleaner typography, fewer AI tells);
use Leonardo for cheap bulk/ambient art or when only a Leonardo key is present.

## Project overlay

The generation method is repo-agnostic; what a repo's assets should LOOK like is not.
Per-repo brand direction lives in ONE overlay this skill reads before the first
generation: **`.claude/leonardo/config.md` in the consuming repo** (tracked, so every
session and every machine gets the same look). **The skill runs with no overlay at all**
- every key below has a default - but when defaults are in force, say so and ask the user
for a style direction in the opening question rather than inventing one silently.

| Key / section | What it carries | Default when absent |
|---|---|---|
| `## Brand direction` | the identity in one or two sentences - the motif, the adjectives, what it must never look like | none; ask the user, and offer to write their answer into the overlay so the next run inherits it |
| `## Palette` | where the authoritative colors live (a stylesheet, a token file) and the few hex values that matter | read the repo's main stylesheet for its primary/accent custom properties; say which file you took them from |
| `## Output paths` | where each asset type is written (icons, illustrations, backgrounds) and the naming convention | beside the component that consumes the asset |
| `## Theme adaptation` | how a generated asset becomes theme-aware here (which custom properties an SVG should reference) | `currentColor` plus the repo's own custom properties |
| `## Defaults` | preferred sizes, quality, styles/contrast per asset type when they differ from the procedures below | the values in the procedures below |

Write the user's answers back into the overlay when they give a direction the skill had to
ask for. A brand decision the operator makes twice is a brand decision the overlay should
have been carrying.

## Interactive Workflow

When the user invokes `/leonardo`, start by asking:

> **What type of visual do you need?**
>
> 1. **Icon** — App icons, logos, brand marks (square, centered, clean edges)
> 2. **State illustration** — Empty states, onboarding, success/error states (needs transparent bg)
> 3. **Background** — Ambient textures, atmospheric scenes, decorative backdrops
> 4. **Other** — Describe freely and I'll choose the best approach
>
> Also tell me: where will this be used? (component/page name)

Then follow the matching procedure below.

---

## Procedures by Type

### Icon / Logo
1. Discuss concept with user, confirm style direction
2. Generate with Leonardo: `--width 512 --height 512 --style dynamic --contrast 3.5`
3. Analyze with Gemini vision to verify quality
4. If user wants theme-adaptive version → analyze structure, write SVG with `currentColor`
5. Integrate into component

### State Illustration (transparent bg)
Leonardo's Lucid Origin does not support `--transparent`. Use the remove-bg pipeline:
1. Generate with solid dark background: `--style vibrant --contrast 3`
2. Use `remove-bg --id <imageId> --output path.png` (requires `--no-cleanup` on generate)
3. Clean up cloud generation manually after bg removal
4. Analyze result with Gemini to verify clean extraction
5. Integrate with appropriate sizing

### Background
1. Generate wide format: `--width 1536 --height 512 --style cinematic --contrast 2.5`
2. Integrate at very low opacity (8-15%) with gradient fade to `var(--background)`
3. For theme-adaptive version → analyze, write SVG using `currentColor` and CSS custom properties

### Other
1. Discuss with user to understand requirements
2. Choose appropriate dimensions, style, and contrast
3. Generate, analyze, iterate

---

## Tools

### OpenAI gpt-image-2 (primary)
```bash
node ${CLAUDE_SKILL_DIR}/tools/openai-image.mjs generate \
  --prompt "description" \
  --output path.png \
  --size 1024x1024 \
  --quality high \
  [--background transparent]   # transparent for icons/illustrations
```
**Model:** `gpt-image-2` (override via `OPENAI_IMAGE_MODEL`). **Sizes:** `1024x1024`, `1536x1024`, `1024x1536`, `auto`. **Quality:** `low` · `medium` · `high` · `auto`. Returns PNG inline (no polling). Native `--background transparent` (no remove-bg step needed). Edit/iterate: `openai-image.mjs edit --prompt "..." --image in.png --output out.png`. Requires `OPENAI_API_KEY`.

### gpt-image-2 via a Leonardo key (no OpenAI key needed)
Leonardo hosts gpt-image-2 under its own v2 API, so it runs on `LEONARDO_API_KEY`:
```bash
node ${CLAUDE_SKILL_DIR}/tools/leonardo-gpt-image.mjs generate \
  --prompt "description" --output path.png \
  --width 1024 --height 1024 --quality MEDIUM --quantity 2
```
`POST /api/rest/v2/generations` with `{ model:"gpt-image-2", public, parameters:{ prompt, width, height (×16), quantity, quality LOW|MEDIUM|HIGH, prompt_enhance } }`; retrieve via `GET /api/rest/v1/generations/{id}` → `generations_by_pk.generated_images[].url`. Use this when only a Leonardo key is present (e.g. cost-shared on Leonardo credits).

### Leonardo Image Generation (Lucid Origin fallback)
```bash
node ${CLAUDE_SKILL_DIR}/tools/leonardo-image.mjs generate \
  --prompt "description" \
  --output path.png \
  --width 512 --height 512 \
  --style dynamic --contrast 3.5 \
  [--no-cleanup]
```

**Styles:** `bokeh`, `cinematic`, `dynamic`, `fashion`, `portrait`, `vibrant`
**Contrast:** `1.0`, `1.3`, `1.8`, `2.5`, `3`, `3.5`, `4`, `4.5`
**Auto-cleanup:** Generations are deleted from Leonardo cloud after download. Use `--no-cleanup` when chaining with `remove-bg`.

### Leonardo Background Removal
```bash
node ${CLAUDE_SKILL_DIR}/tools/leonardo-image.mjs remove-bg \
  --id <imageId> --output path-nobg.png
```

### Gemini Image Analysis
```bash
node ${CLAUDE_SKILL_DIR}/tools/gemini-recognize.mjs \
  --input path.png \
  --prompt "Describe shapes, colors, composition, quality"
```

### SVG Conversion Workflow
1. Generate PNG with Leonardo
2. Analyze with Gemini: `"Describe every shape, position, color as SVG recreation instructions"`
3. Hand-write SVG using `currentColor` / `var(--primary)` for theme adaptation
4. Test across themes

---

## Environment
Requires in `.env`:
- `OPENAI_API_KEY` — primary generator (gpt-image-2); from platform.openai.com/api-keys
- `LEONARDO_API_KEY` — fallback generator; from app.leonardo.ai
- `GEMINI_API_KEY` — for vision analysis

Load env before running: `export $(grep -E '^(OPENAI_API_KEY|LEONARDO_API_KEY|GEMINI_API_KEY)=' .env | xargs)`

## Brand Direction

Read the overlay's `## Brand direction` and `## Palette` (§ Project overlay) and put both
into every prompt - the motif, the adjectives, the anti-pattern, and the actual hex values
rather than color names. With no overlay, ask the user for the direction in one question
before generating, pull the palette from the repo's main stylesheet, and say which file you
took it from. Never invent a house style silently: an asset generated against the wrong
identity looks finished, which is what makes it expensive.

---

<!-- clause: skill-reflection v4 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Project learning.** Put a dated observation in the consuming project's configured
overlay under `## Skill improvement log`, when local edits are within scope. Use the
location in this skill's `## Project overlay` section. If none is configured, use
`.agents/leonardo/config.md` for Codex or `.claude/leonardo/config.md` for Claude.
If the harness is unknown, propose the note in the response instead of guessing a path.
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
