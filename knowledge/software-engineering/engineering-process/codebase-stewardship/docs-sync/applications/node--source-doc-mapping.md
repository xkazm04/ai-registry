---
layer: application
type: application
subject: docs-sync
technique: source-doc-mapping
stack: node
status: forged
verified_on: 2026-10-31
verified_against: node@22
---

# One map, three target types, and the glob that could never fire

Described at personas@`22260d77`. The coupling record is a single JSON
file, `scripts/docs/feature-doc-map.json`, written for a Stop hook
(`scripts/docs/check-doc-sync.mjs`, 239 lines) that nags when a turn edited
feature source without updating the documentation coupled to it. A second
script, `scripts/docs/check-doc-map-paths.mjs`, guards the map itself and
runs as `npm run check:doc-map` inside `npm run check`
(`package.json:142`, chained at `:56`).

## The entry is a coupling record, exactly as the technique asks

The map holds 44 entries. Each carries `doc` and `sourceGlobs`, and
optionally `onboardingFlows` and `marketingModule`. The hook header
describes all three target types as independently checked, each an exit-2
nag on a miss (`check-doc-sync.mjs:5-21`), and the code agrees
(`:168-172`, exit at `:236`). Each target is satisfied by a different
signal in the same turn: any edit under `docs/features/` satisfies `doc`
(`:120`), any edit under `src/features/onboarding/` satisfies the flows
(`:121`), and any edit in the sibling `../personas-web/` checkout satisfies
the marketing module (`:125`).

The indirect target resolves through a registry rather than naming an
artifact directly. `onboardingFlows` at the top of the map
(`feature-doc-map.json:3-4`) maps flow ids to their step file, completion
event and description, and the nag prints the step file of each affected
flow (`check-doc-sync.mjs:192-194`). So it can name *which* tour rather
than gesturing at tours in general, the resolution step the technique asks
for. The registry holds 39 keys, 38 of them flows (one is `_comment`); 36
flow ids are referenced by entries, and none is unknown.

Optional target slots sit empty on most entries: 28 of 44 declare no
`onboardingFlows` and 21 of 44 no `marketingModule`. All 44 declare `doc`.

## The failure mode that earns the path guard

`check-doc-map-paths.mjs` exists because a coupling record has a way of
dying that no consumer can see. Its header states the incident that
produced it, dated 2026-08-14 (`:1-13`): a `sourceGlobs` entry pointed at
`src-tauri/src/commands/infrastructure/live_roadmap.rs` while the file is
really at `src-tauri/src/commands/live_roadmap.rs`, so *"the hook has never
once fired for live-roadmap."*

That is worth stating precisely, because it is the general shape rather
than a typo: **a glob that matches no file cannot nag — it fails open,
silently, forever, and looks exactly like a feature nobody edited.** The
mapping and the absence of a complaint are indistinguishable from the
outside. The script's comment generalises it to a family — dead doc links,
a binding-drift check that cannot see new files — *"a gate whose
precondition quietly vanished."* It fails loudly on its own blind spots
too: a walk of fewer than 1,000 files (`:45-48`) and a map with zero
entries (`:88-90`) both exit 2. Run at this commit, it reports
"84 node(s) checked against 17346 files" and exits 0.

`scripts/docs/check-promise-pins.mjs` covers what the map cannot hold. Its
header (`:3-8`) notes that a promise about what the app does *not* do has
no module to map, so the map, the path guard and the hook are
"structurally blind, permanently, by construction" to it.

This is the strongest argument in the realization for the technique's
insistence that the mapping is **data, extended in the same change that
adds the area**: a declared artifact can be validated by a second program,
and an undeclared convention cannot be validated by anything.

## Where the realization is thinner than the standard

- **The consumer is not running.** The hook header says it is triggered by
  `.claude/settings.json -> hooks.Stop` (`:23`), but no settings file in the
  tree registers it. Even when run, its transcript walk stops at the first
  event shaped `type: 'user'` with `role: 'user'` (`:98`), a shape tool
  results share, so it sees only the edits made after the turn's last tool
  result (see
  [same-change-enforcement](../techniques/same-change-enforcement.md)). The
  map is maintained and validated for a reader that does not read it.
- **The hook fails open on its own input.** If the map cannot be read or
  parsed, it exits 0 (`:131-135`): a cannot-check is reported as a pass.
- **Two descriptions of one slot disagree.** The map's own `_comment`
  (`feature-doc-map.json:2`) calls `marketingModule` "informational
  breadcrumb only, never exits 2 on its own", while the hook header and code
  exit 2 when a marketing module is hit and `../personas-web/` was not
  touched.
- **Satisfaction is coarse.** An edit to *any* file under `docs/features/`
  satisfies every `doc` target in the turn (`:120`), not only the documents
  the touched entries name.
- **Correctness, not completeness.** The map couples source globs to
  documents, and nothing couples the entries to *coverage of the product*.
  Nothing asserts that 44 is the right number of entries, or names the
  feature areas that have none. The path guard proves every declared glob
  resolves; no guard proves every feature area is declared. A feature area
  added without an entry is invisible to every mechanism downstream of it.

## History

- **2026-08-21 — the technique's figures re-measured.** All four claims the
  technique cites were confirmed against the tree:

  | The standard's claim | Measured |
  |---|---|
  | a registry keyed by ids that also holds a `_comment` key makes a naive key count wrong by one | `onboardingFlows` has **39 keys, 38 flows** |
  | optional target slots sit empty on most entries — 20 of 37 no flows | **20 of 37** declare no `onboardingFlows` |
  | 13 of 37 no marketing module | **13 of 37** declare no `marketingModule` |
  | the reference document is required | **0 of 37** entries lack `doc` |

  At that date the map had 37 entries, and this document's "thinner" section
  read "There are 37 entries".
- **2026-08-17 — the project's own replay** found the hook's transcript walk
  saw 0 of 2,367 edits in 100 real sessions, for every entry, because it
  stops at the first tool result. The path guard's "never once fired for
  live-roadmap" is true and too narrow: the hook never fired for anything.
- **Corrected 2026-10-31 at personas@`22260d77`.** The hook is registered in
  no settings file, and the map has grown to 44 entries (28 with no flows,
  21 with no marketing module, none without a `doc`). The 39-key registry
  figure still holds. The turn-boundary defect and the open-versus-closed
  coverage gap **still hold**. The fail-open map read, the contradictory
  `marketingModule` comment and the coarse `docs/features/` satisfaction
  were first recorded in this rewrite.
