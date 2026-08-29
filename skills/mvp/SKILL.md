---
name: mvp
category: workflow
memory: project
description: Launch-readiness orchestrator for taking a dev project (typically NextJS) from "advanced WIP" to first market release. Assesses 21 checklist items across 7 chronological phases (Define -> Rails -> Automate -> Harden -> Polish -> Market -> Launch gate), reports an honest scorecard, then walks each phase with batched select decisions and executes accepted work with subagents. Delegates infra to passport-onboard, artifacts to project-populate, security to security-review instead of duplicating them. State lives in a public-safe mvp-passport.json at the target repo root; the skill self-calibrates across runs via the target repo's .claude/mvp/calibration.md. Invoke with `/mvp [project-root]`.
argument-hint: "[project-root]"
version: 1.1.0
---

# /mvp — first-release readiness loop

You are assessing and driving ONE repository toward its first market release.
Your altitude is the **launch decision** — "can a stranger find this, use it,
and can we live with what happens next?" — not code perfection. The two
sibling skills own lower altitudes and you DELEGATE to them, never duplicate:

- `passport-onboard` — infra wiring (hosting, CI, DB, auth infra, observability)
- `project-populate` — Personas artifacts (context map, features, KPIs)
- `security-review` — the security pass
- `ship-loop` — long-horizon quality convergence (not needed for a single /mvp run)

The checklist is `references/checklist.md`: **21 items in 7 phases P0–P6**,
chronologically ordered because early items define scope for later ones
(P0 value case decides what P4 onboarding leads to and what P5 landing says).

## Target resolution

Argument = project root (default: cwd). All assessment and edits happen in the
TARGET repo. If the target is Personas-managed (`.personas/` dir or the
operator says so), use the memory outbox at the end. Never edit the personas
app repo from this skill unless the target IS that repo.

## The loop: Assess (parallel) → Scorecard → Phase walk (gated) → Certify

### Phase A — Assess (parallel, read-only)

If `mvp-passport.json` exists at the target root, read it FIRST: trust levels
as of `generatedAt` (re-verify only cheap probes), and NEVER re-ask an item
marked `skippedByChoice` — surface it as "skipped on <date>, say the word to
revisit". Also read `app-passport.json` if present — passport-onboard's levels
are authoritative for the delegated items (cicd, deploy, observability, auth
infra); don't re-derive what it already observed.

Spawn 4 read-only assessors IN PARALLEL (Explore-class), one per cluster:

1. **Product & market** — P0 (value-case, monetization) + P5 (landing, seo, legal, analytics)
2. **Rails & automation** — P1 (artifacts, milestone, notes, fleet) + P2 (cicd, deploy, observability)
3. **Engineering floor** — P3 (code-quality, auth, security, design-system, i18n)
4. **Experience** — P4 (onboarding, feedback) + P6 (launch-gate)

Each assessor gets its items' probes from `references/checklist.md` and
returns per item: **level** (🟢 met / 🟡 partial / 🔴 missing / ❔ can't tell
from code), 1–2 lines of evidence with file paths, and 2 realistic paths
forward with ONE recommendation. Assessors read; they never write. For items
that code can't answer (is there a distribution plan? is monetization
decided?), the assessor returns ❔ and the QUESTION goes to the operator in
the phase round — never guess a product answer from code.

### Phase B — Scorecard

One screen before any question: the 7 phases as rows, each item with its
level emoji + a ≤10-word evidence note. State the overall read in one
sentence ("P0–P2 largely green, launch blockers concentrate in P5").

### Phase C — Phase walk (P0 → P6, batched selects)

Walk phases in order. Per phase:

- Intro text states ✓ items (no question wasted on them) and any
  skipped-by-choice priors.
- ONE AskUserQuestion call for the phase's below-target items (max 4
  questions; if a phase needs more, split by theme, never one-per-item).
  Every question offers: **Skip** · path A · path B with **(Recommended)** on
  exactly one · Other is built-in. Options name OUTCOMES ("Landing live on
  the prod domain with the 3 killer features above the fold"), not chores.
- ❔ items become direct questions ("Monetization: free beta / pricing page
  now / skip the decision — recorded either way").
- **Pipeline**: present P(n)'s round as soon as its cluster's assessment is
  in-hand; execute accepted P(n) work while presenting P(n+1) when the work
  is independent. Don't hold the operator for the slowest builder.
- Execute accepted items with parallel subagents (strongest available model
  for real engineering changes). One item = one scoped brief carrying: the
  accepted path, the DONE criterion from checklist.md, repo conventions, and
  the shared-checkout commit discipline (stage only your paths, never `-A`;
  verify staged set matches intent; no `--amend` once concurrent commits may
  exist). Merge briefs whose file scopes collide. Delegated items invoke the
  owning skill's flow (dimension-scoped passport-onboard, etc.) rather than
  reimplementing it.
- Builders self-verify (build/lint/test as available) before reporting; a
  blocked builder reports WHY, never silently drops its item.
- Re-assess touched items with the checklist probes; a phase closes when
  every item is 🟢 or ⚪ skipped-by-choice. An operator may explicitly
  ACCEPT a 🟡 to move on — record it as `acceptedAt: "partial"` in the
  manifest; it resurfaces at the P6 go/no-go.

### Phase D — Certify (P6) + report

P6 is not another work item — it is the ritual: run the smoke probe
(critical path against the production build/URL where one exists), then
present the **go/no-go screen**: all 21 items → final level → skipped/
accepted-partial flags. The verdict line is yours to state honestly:
`GO`, `GO with accepted risks: <list>`, or `NO-GO: <blockers>`.

Before the report, write/refresh **`mvp-passport.json`** at the target root
(public-safe: levels, tool NAMES, booleans — never URLs with tokens, env
values, costs, or local paths):

```json
{
  "schemaVersion": 1,
  "generatedAt": "<ISO date>",
  "generatedBy": "personas mvp",
  "verdict": "go | go-with-risks | no-go | in-progress",
  "phases": { "P0": "green|partial|red|skipped", "...": "..." },
  "items": {
    "<item-key>": { "level": "met|partial|missing|unknown", "tool": "<name or null>", "skippedByChoice": false, "acceptedPartial": false, "note": "<1-liner>" }
  }
}
```

Close with a compact table: item → before → after → skipped(choice/blocked),
plus the exact follow-ups the operator still owns. If dispatched from the
Personas wall, end with one greppable line:
`MVP_RESULT: <verdict>, <n> improved, <n> skipped, <n> blocked`.

## Hard rules

- **Honest levels only.** Every level is observed via a checklist probe or an
  explicit operator answer — never inferred optimism. "Subagent-claimed" is
  not "verified"; re-probe before flipping an item green.
- **Skip is always honored** and appears in the report as a choice, not a
  failure. Product calls (monetization, locales, scope cuts, go/no-go) belong
  to the operator — never auto-decide them.
- **Secrets never move.** Connector choices are names + service types; wiring
  reads env var NAMES. Credentials live in Personas Vault, never in this
  terminal.
- **Additive, convention-following changes.** Read before writing; match the
  target repo's stack and idioms; several small verifiable changes over one
  rewrite. Pre-existing lint noise gets reported, never silently fixed.
- **The value case gates scope.** After P0, any proposed work that serves no
  killer feature and no checklist item is a cut candidate — say so instead of
  building it.

## Calibration (while the skill is being finetuned)

This skill is under active calibration across multiple projects. At the end
of EVERY run, append to the target repo's `.claude/mvp/calibration.md`
(create on first use; it is the consuming repo's overlay, never a file inside
this skill directory — a skill that writes into itself diverges on first use):
date, target project, per-phase friction notes (questions that landed wrong,
probes that misfired, items that should merge/split/reorder), and one concrete
SKILL.md/checklist.md change proposal. Read the file at the START of every run
and apply what it already learned; a method-level lesson also goes to this
skill's LESSONS.md so it reaches every consumer, not just this repo.

## Memory outbox (Personas-managed targets)

If the target repo is Personas-managed, append 3–8 JSON lines to
`.personas/memory-outbox.jsonl` before finishing (append, never rewrite):
`{"type":"node","kind":"progress|decision|gotcha|fact","title":"≤200 chars","body":"optional","context":"optional context name"}`
— record phase outcomes, operator decisions, and gotchas. Skip silently for
unmanaged repos.

---

<!-- clause: knowledge-sync v1 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/knowledge-sync.md; edit the template, then re-stamp -->
## Knowledge sync

This skill proposes and executes backlog items. Every item it proposes is judged against the standard this repo subscribes to, so a run moves the codebase toward the registry's golden paths and sends back what it learned - not toward a private notion of "better" that the next skill will undo.

**Subscription** - read once at the start of the run; degrade honestly, never invent a standard:
- `.ai/manifest.yaml` -> `registry.local` (default `../ai-registry`; `$AI_REGISTRY_DIR` wins) and `knowledge.domains` (the bundles this repo consumes - `software-engineering` for code, plus whatever else it declares). No registry declared -> skip this section and say `registry: none` in the run header.
- `.ai/registry-map.json` - the join between this repo's contexts and the bundle's subjects, with a per-pair state (`unknown` / `conformant` / `deviation` / `not-applicable`) that `/conform` fills in over time. Missing while `context-map.json` exists -> build it once, `node <registry>/scripts/build-registry-map.mjs --project <slug>`, and commit it: the map is the repo's subscription to the paths, and it is how a path improved for another project reaches this one. Missing both -> resolve through `<registry>/knowledge/<domain>/index.json` and say `registry: declared, unmapped`.
- The always-on rules `.claude/rules/ai-registry-*.md` carry the subject map. They orient; they do not replace the read below.

**Read before you propose.** For each context in scope, take its subjects from the map and read the golden path (`subjects[<slug>].file`, verbatim from the index - never a path built from a slug; bundles are nested) plus the techniques whose `use_when` matches what you are about to decide. Then every backlog item you emit names the technique it serves or violates - `standard: <subject>/<technique>` - or `standard: none` when nothing governs it. A pair the map already marks `deviation` is a pre-approved item with its fix described; a pair marked `conformant` is a regression guard on anything you change there. A deviation is a finding: never lower the standard to fit the code, and never present a technique's number as a rule - the technique carries the rule, the application carries the measurement.

**Log the read** - one line per context, append-only, gitignored, to `.ai/consults.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}`, where `deviations` counts the items this run raised that a technique explicitly names. Bare slugs, never paths. The registry's `signals-collect.mjs` folds these into `signals/` as counts only; it is the only way the corpus learns which paths are load-bearing and which are decoration.

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"mvp@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
<!-- /clause: knowledge-sync -->

<!-- clause: skill-reflection v2 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in `.claude/mvp/config.md`, or in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - mvp` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/mvp` in a consuming repo is a symlink to `<registry>/skills/mvp` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/mvp` and `git -C <registry> commit -m "skill(mvp): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/mvp/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/mvp` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
