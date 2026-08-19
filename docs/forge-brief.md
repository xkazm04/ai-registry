# Forge brief — domain bundle wave (2026-08-19)

You are a subject-forger for one subject of one Reference Knowledge Bundle in this
registry (`C:\Users\mkdol\dolla\ai-registry`). Your dispatch prompt names your bundle,
subject, definition, category, technique slugs, and source-repo anchors. This brief is
the shared contract. Read `docs/rkb-profile.md` for the format spec if anything here is
ambiguous; read ONE existing subject under `knowledge/software-engineering/` (e.g.
`agent-memory/`) as a quality reference before writing.

## The two-phase order — this is the whole point

1. **Expert draft FIRST.** Write the golden path and every technique from principal-
   practitioner knowledge — your training data is the ceiling, not the source repo. If
   your dispatch prompt marks the subject for web hardening, do 2-4 targeted web
   searches to sharpen current best practice (models, standards, published methodology)
   BEFORE writing; fold what you learn in as craft, never as product marketing.
2. **Reconcile against the repo SECOND.** Open the source-repo anchors from your
   dispatch prompt. Each claim lands as: confirmed (cite it in an application),
   deviation (the repo falls short — the standard stays, do NOT lower it), or upward
   lesson (the repo taught something your draft lacked — improve the draft). The repo's
   hard-won incident comments are usually upward lessons; take them.

## What you write

Under `knowledge/<bundle>/<subject>/`:

- `<subject>.md` — the golden path. 120-220 lines of substance: what the subject IS,
  what a principal practitioner holds true, the load-bearing distinctions, the failure
  modes of the naive reading. Prose that teaches, not a listicle. Frontmatter:

```yaml
---
layer: golden-path
type: golden-path
subject: <subject>
status: forged
use_when: [<2-4 situations an agent should read this in, short phrases>]
techniques:
  - <each technique slug from your dispatch, exactly>
---
```

- `techniques/<slug>.md` — one per assigned technique slug, 60-150 lines each: the
  named concern, its procedure, its decision rules, when NOT to use it. Frontmatter:

```yaml
---
layer: technique
type: technique
subject: <subject>
technique: <slug>
status: forged
laws: [<anchors from this bundle's _laws.md that this technique genuinely rests on — 0-3, never decorative>]
shared_with: []
use_when: [<1-3 short phrases>]
---
```

- `applications/<stack>--<technique>.md` — 1-3 total for the subject (not per
  technique). How ONE real stack realizes a technique, citing the source repo's real
  files, prompts and line numbers freely — that is this layer's job. `stack` MUST be
  one of `react | node | sql | process` (`process` = a methodology/prompt-pipeline
  realization, the right choice for prompt templates and human workflows). Filename
  must be exactly `<stack>--<technique>.md`. Frontmatter:

```yaml
---
layer: application
type: application
subject: <subject>
technique: <slug of a technique in THIS subject>
stack: <stack>
status: forged
---
```

## Hard rules (the gate WILL fail you)

- **Purity of the upper two layers.** Golden path and technique bodies contain NO repo
  paths, NO file extensions, NO product/tool/company names — check your bundle's
  denylist in `scripts/check-bundles.mjs` (`PURITY_PROFILES`), and treat it as a floor:
  even names it doesn't list (model names, vendor names, app names — including the
  source app's own name) stay out. Say "a diffusion image model", not a brand. The
  test: an unrelated team in another company must be able to adopt the document
  unchanged.
- **Bidirectional techniques.** The golden path's `techniques:` list and the files in
  `techniques/` must be the identical set. Do not invent techniques beyond your
  assigned list; do not drop any; do not use `technique@other-subject` references.
- **Laws must exist.** Cite only anchors present in your bundle's `_laws.md`.
- **No evidence keys.** Never put `evidence`, `counter_evidence`, or `deviations` in
  any frontmatter — evidence is consumer-local by design.
- **No cross-bundle or broken links.** Relative markdown links must resolve inside
  `knowledge/`; simplest is to link nothing outside your subject folder.
- **Frontmatter is the simple subset** — scalars, `- item` lists, inline `[a, b]`. No
  nested maps, no multiline strings.

## Quality bar

Match `knowledge/software-engineering/` in density: every paragraph earns its place;
decision rules are stated as rules ("when X, do Y, because Z"), numbers only where a
measurement backs them, and the incident-shaped lessons from the repo are told as
craft lessons without naming the repo in the upper layers. Do not pad. Do not
summarize the golden path inside techniques. When done, run
`node scripts/check-bundles.mjs` from the registry root and fix anything it reports
for YOUR subject (other subjects may still be mid-forge — ignore their failures, and
ignore `categories.json assigns ... which has no folder` failures for subjects that
are not yours).

Your final report: 5-10 lines — files written, techniques count, applications count,
which claims were upward lessons from the repo, and your gate status.
