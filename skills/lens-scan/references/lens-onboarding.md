# Lens onboarding - `/lens-scan onboard`

Read from `SKILL.md` "Onboard". This is the one onboarding contract: the blueprint's lens chat
(bp `POST /api/lens-draft`) runs `/lens-scan onboard --draft-only` and follows this page instead
of carrying its own copy (it lived in bp `src/lib/scan/lens-draft.ts` until 1.3.0). The draft is
checked by `structure.mjs`'s `checkManifest`, the twin of bp's `checkLensManifest`.

```
/lens-scan onboard "<description>" [--id com.x.y] [--temporary] [--draft-only] [--first-scan]
```

## 1. Read the map

Read `.ai/lens-scan/app-structure.json` (the Kettle sample in the bp repo:
`src/data/kettle.app-structure.json`) for:

- the features (`features[].slug`, `name`, `capability`), to know what the lens will judge;
- the lenses (`lenses[]`): their ids (an id is never reused), and the **looks taken** - the
  `presentation.glyph` + `presentation.line` pair of every enabled lens;
- the product's org, for the id: `.ai/manifest.yaml`'s `registry.remote` owner
  (`github:<owner>/...`), else the git remote's owner.

## 2. Ask, at most 3 questions

Ask the user **AT MOST 3** short questions, one per message, and only when the answer changes
the lens (what counts, what is out of scope, the org of the id). A clear request gets none.
**Headless** (no one answering, `claude -p`, `BP_JOB_ID` set): ask nothing - decide, and say
each decision in one line of the reply ("decided: org = local, no remote owner found").

## 3. Draft a full lens-manifest/1

- `"$schema": "lens-manifest/1"`, `"version": "1.0.0"`, `"name"`, `"short"` (2-4 capital letters
  or digits), `"description"` (one sentence).
- `"id"`: `--id` when given; else `com.<org>.<kebab-name>` with the org from step 1 (ask when
  interactive and there is none; headless: `com.local.<kebab-name>`); `--temporary` makes it
  `tmp.<kebab-name>` (lower-case letters, digits, hyphens; 2-41 characters after `tmp.`).
- `"reader"`: `{ "role": who reads it, "density": "simple" | "standard" | "dense" }`.
- `"fields"`: 1 to 9 fields. Every field a scan fills is numeric (`"type": "integer" | "number" |
  "percent"`) with a `"metric"` block `{ "better": "up" | "down", "method": "judgement" | "static" }`
  (`static` for a field a script step yields). Keys are camelCase; each has a `"label"`. A count
  carries its `"unit"` (`"sites"`, `"cases"`, `"pairs"`, `"users"`); a percent `"%"`. Mark the
  field that sums the lens up `"headline": true`.
- `"health"`: `{ "rules": [ { "when": { "field": "<key>", "gt": 0 }, "health": "bad" | "watch" |
  "good", "reason": "<short sentence; {key} placeholders allowed>" } ... ]` over those fields only
  (operators: `eq ne lt lte gt gte in nin missing present`; combine with `all` / `any` / `not`),
  `"default": "good"`, `"rollup": { "method": "worst-of" }` (or `share` with `watch` and `bad`
  fractions) `}`.
- `"presentation"`: `"measures"`: the headline key; `"evidence"`: the keys a tile shows, most
  important first; the **look** below. Never an `accent`: lenses differ by shape, not colour.
- `"scan"`: `{ "method": "judgement", "instructions": ... }` when reading the code answers the
  question; `{ "method": "steps", "steps": [...] }` when it needs a script's numbers or
  `/conform`'s verdicts ([lens-manifest-scan.md](lens-manifest-scan.md)). The instructions say,
  in plain words, what to judge per feature, and that a feature the lens does not touch is "no
  impact": its facet is `{ "applicable": false }` with a reason, never a zero.

### The look: a free icon

`presentation.glyph` is drawn for this lens: `{ "path": "<SVG path>" }`, **one stroked path in a
16x16 box**:

- absolute (upper-case) commands only - `M L H V C S Q T A Z` - and every coordinate within
  `0..16`;
- at least 2 drawing commands (a move alone draws nothing);
- readable at 7 px: few strokes (aim for 2-5 segments), nothing smaller than 1.5 units, no
  detail a 7 px square loses; it is stroked, never filled, so draw outlines;
- it names the lens's subject (a ledger for a registry, a gauge for capacity), not a brand.

`presentation.line` is one of `solid, double, dotted, comb, chain, hatched, dimension`. The
glyph + line pair must not equal a pair another **enabled** lens draws (step 1's taken
looks): with a fresh path that holds by itself; with one of the shared names (`bars,
set-square, brackets, pulse, padlock, check`, all taken by the built-ins) pick a line that
name is not drawn with.

## 4. Reply, or write

**`--draft-only`** (the blueprint's chat; it passes `--resume` for later turns and reads the
JSON output): reply with a short plain sentence and **exactly one** fenced block tagged
`lens-manifest` holding the JSON - or with one question and no block. Write **nothing**: no
file, no map edit, no run. A change asked after a block gets a whole new block; the last block
in a reply wins.

````
```lens-manifest
{ ...the manifest... }
```
````

**Otherwise** (interactive or headless onboarding that keeps the lens):

1. Write the manifest to a temporary file and add it:
   `node ${CLAUDE_SKILL_DIR}/scripts/structure.mjs lens-add --manifest <file>`.
   It checks the manifest (the rules above, the id's form for its mode, the look) and appends
   `{id, version, source: 'project', enabled: true, created_at, manifest}` (`temporary: true`
   for a `tmp.` id) to `lenses[]` atomically. A refusal prints why: fix the draft and add
   again, or, for a duplicate id, stop - an id is never reused or renamed.
2. Check the method: `structure.mjs lens --id <id>` must print `judgement` or `steps`.
3. **`--first-scan`**: run `measure --lens <id>` over every feature (SKILL.md phase 2), then
   phase 1 so the facets show it.
4. Report: the id, the look (glyph path and line), the fields, the scan method, and the first
   scan's run id when there was one.

A permanent lens is edited, retired (`enabled: false`) or deleted in the blueprint's Lenses
panel; onboarding only adds.
