---
name: leonardo
memory: none
category: other
description: Generate images with OpenAI GPT Image 2.5 (Sunburst for detail, Flare for speed) or Leonardo AI (fallback), remove backgrounds, analyze with Gemini vision, and write SVG. For brand assets, UI illustrations, backgrounds, and icons.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node *), Bash(npx *)
argument-hint: <description of visual asset to create>
version: 1.5.0
---

# Leonardo — AI Image Generation & Visual Assets

Generate production-quality images. **Default generator: OpenAI
`gpt-image-2.5-sunburst`** - the detail-holding half of the GPT Image 2.5 pair
(released 2026-09-08). It reasons about structure before rendering, holds
intricate detail through edits, and returns PNGs up to 3840px; needs
`OPENAI_API_KEY`. Its sibling **`gpt-image-2.5-flare`** is the same family at
roughly half the latency and cost: pass `--model gpt-image-2.5-flare` for bulk,
drafts and ambient art. **Fallback: Leonardo AI** (which hosts `gpt-image-2`, and
Lucid Origin) when no OpenAI key is set. Gemini vision is used for analysis and
iterative refinement.

Prefer Sunburst for anything a person will look at closely - logos, brand marks,
characters, hero illustration - and Flare when you need many candidates cheaply.
`gpt-image-2` remains available (`--model gpt-image-2`) for reproducing an asset
that was made with it.

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

### OpenAI GPT Image 2.5 (primary)
```bash
node ${CLAUDE_SKILL_DIR}/tools/openai-image.mjs generate \
  --prompt "description" \
  --output path.png \
  --size 1024x1024 \
  --quality high \
  [--background transparent]   # transparent for icons/illustrations
```
**Model:** `gpt-image-2.5-sunburst` by default; `--model` wins over `OPENAI_IMAGE_MODEL`, which wins over the default. Siblings: `gpt-image-2.5-flare` (about half the latency and cost, the right pick for bulk or drafts), `gpt-image-2` (the previous generation). **Sizes:** `1024x1024`, `1536x1024`, `1024x1536`, `auto`. **Quality:** `low` · `medium` · `high` · `auto`. Returns PNG inline (no polling). Native `--background transparent` (no remove-bg step needed). Edit/iterate: `openai-image.mjs edit --prompt "..." --image in.png --output out.png [--model ...]`. Requires `OPENAI_API_KEY`.

### OpenAI models via a Leonardo key (no OpenAI key needed)
Leonardo hosts OpenAI's image models under its own v2 API, so they run on `LEONARDO_API_KEY`:
```bash
node ${CLAUDE_SKILL_DIR}/tools/leonardo-gpt-image.mjs generate \
  --prompt "description" --output path.png \
  --width 1024 --height 1024 --quality MEDIUM --quantity 2
```
`POST /api/rest/v2/generations` with `{ model:"gpt-image-2", public, parameters:{ prompt, width, height (×16), quantity, quality LOW|MEDIUM|HIGH, prompt_enhance } }`; retrieve via `GET /api/rest/v1/generations/{id}` → `generations_by_pk.generated_images[].url`. Use this when only a Leonardo key is present (e.g. cost-shared on Leonardo credits).

**Which model this path can reach.** The `model` tag is an enum of Leonardo's own
slugs - not OpenAI's ids, not the UUIDs the model list returns. Measured 2026-09-22
on a paid account: `gpt-image-2` is accepted; **GPT Image 2.5 Sunburst and Flare are
listed by the account** (with a wider quality enum, `LOW|MEDIUM|HIGH|XHIGH|MAX`) but
every slug tried for them was refused with `value of tag "model" must be in oneOf`,
and v1 refuses their UUID outright. So reach 2.5 through `openai-image.mjs` on an
OpenAI key, or through Leonardo's web Studio, and pass `--model <slug>` here the day
Leonardo publishes one. What an account can see:
```bash
node ${CLAUDE_SKILL_DIR}/tools/leonardo-gpt-image.mjs models --filter gpt
```

**Two token pools, and they run out separately.** `subscriptionTokens` is the web
Studio's; `apiSubscriptionTokens` is this tool's. A 402 `Insufficient tokens` here
while Studio still generates means the API pool is empty, not the subscription
(`GET /api/rest/v1/me` shows both, plus each pool's renewal date).

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
- `OPENAI_API_KEY` — primary generator (GPT Image 2.5); from platform.openai.com/api-keys
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
