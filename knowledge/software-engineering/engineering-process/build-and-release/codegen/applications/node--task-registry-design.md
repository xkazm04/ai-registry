---
layer: application
type: application
subject: codegen
technique: task-registry-design
stack: node
verified_on: 2026-10-31
verified_against: node@22
---

# Node: the flat codegen registry (`scripts/run-codegen.mjs`)

The technique's canonical manifestation in this repo is
`scripts/run-codegen.mjs` — a single file whose `TASKS` object literal is
the complete definition of the codegen pipeline, with the design rationale
written into it as a comment (`run-codegen.mjs:32-33`):

```js
// Keep this mapping flat and explicit — no glob/auto-discovery, so the set
// of codegen tasks is reviewable in one place.
const TASKS = {
  commands:  "scripts/generate-command-names.mjs",
  "i18n-split": "scripts/i18n/split-locales.mjs",
  checksums: "scripts/generate-template-checksums.mjs",
  sprites:   "scripts/generate-agent-icon-sprites.mjs",
  catalog:   "scripts/docs/gen-shared-catalog.mjs",
  // … 15 tasks total
};
const PRESETS = {
  predev:   [/* 14 tasks — no `checksums` */],
  prebuild: [/* 14 tasks — no `host-check` */],
};
```

Re-checked 2026-10-31 at personas@22260d77: the literal is now 17 tasks
(`run-codegen.mjs:34-97`; `gp-index` and `bindings-index` joined), and each
preset lists 16 — `predev` still without `checksums`, `prebuild` still
without `host-check` (`:99-102`). The counts below are the ones read on
2026-08-18; the shape they describe holds.

## What matches the technique

- **Flat and explicit.** Fifteen tasks, one literal, no discovery. The
  preset arrays (`run-codegen.mjs:99-102`) are the named groups: `predev`
  and `prebuild` share most tasks and deliberately diverge on two
  (`checksums` is build-only; `host-check` is dev-only).
- **The registry as institutional memory.** Nearly every entry carries a
  comment naming the incident that put it there. `sprites`: "Previously
  orphaned in vite buildStart only (asymmetric: `npm run dev` regenerated,
  plain `npm run predev` did not)." `system-skills`: "a fresh clone that
  only ever ran `tauri dev` failed with 'resource path resources\skills
  doesn't exist'." A reviewer proposing to drop a task argues with the
  incident, not with silence.
- **Registration predicts freshness — measured.** The legacy leaf
  codegen-task-registration (`docs/concepts/golden-paths/codegen-task-registration.md`)
  executed all of the repo's generators into memory and diffed against the
  committed tree: every artifact of every registered generator was
  byte-fresh (1,617 files, including the 793 section locales), while four
  of the five *unregistered* generators were stale — the worst,
  `scripts/docs/gen-tour-anchors.mjs`, 127 anchors behind the tree it
  projects. Headers, guards, and compare-before-write logic predicted
  nothing; membership in `TASKS` predicted everything.

## Where the repo deviates from the standard

- **Budgets are runner policy, not registry data.** One global
  `CODEGEN_TIMEOUT_MS` (default 60s, `run-codegen.mjs:104`) covers all
  tasks; the technique wants per-task budgets in the registry, reviewable
  when a task joins.
- **Outputs are undeclared.** `TASKS` maps name → script and says nothing
  about what each script writes (the legacy leaf's §8 Gap 1). Nothing can
  join a task to its artifacts, so nothing can mechanically notice a
  generator that writes committed files and appears in no preset — which
  is exactly the class of defect the freshness measurement found. The
  technique's inventory complement (trace every writer of generated output
  to a registry entry) is the missing piece. Re-checked 2026-10-31: partly
  changed. An input cache added 2026-09-18 (`run-codegen.mjs:11-20`) has
  three tasks declare inputs and outputs in `scripts/codegen/inputs.mjs`,
  so they can be skipped when nothing changed. The declarations sit beside
  `TASKS`, not in it, and cover three of seventeen tasks. They exist to
  skip work, not to trace writers, so the inventory gap stands for the
  other fourteen.
- **No dependency declarations.** All 15 tasks are treated as independent
  and fanned out with `Promise.allSettled`. True today; the day one task
  consumes another's output, list-order will be the only thing encoding it.
