---
name: leonardo
memory: none
category: other
description: Generate images with OpenAI gpt-image-2 (primary) or Leonardo AI (fallback), remove backgrounds, analyze with Gemini vision, and write SVG. For brand assets, UI illustrations, backgrounds, and icons.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node *), Bash(npx *)
argument-hint: <description of visual asset to create>
version: 1.2.0
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

<!-- clause: skill-reflection v2 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in `.claude/leonardo/config.md`, or in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - leonardo` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/leonardo` in a consuming repo is a symlink to `<registry>/skills/leonardo` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/leonardo` and `git -C <registry> commit -m "skill(leonardo): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/leonardo/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/leonardo` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
