---
layer: application
type: application
subject: docs-sync
technique: source-doc-mapping
stack: node
status: forged
verified_on: 2026-08-21
verified_against: node@20
---

# One map, three target types, and the glob that could never fire

The coupling record is a single JSON file — `scripts/docs/feature-doc-map.json`
— read by a Stop hook (`scripts/docs/check-doc-sync.mjs`, 239 lines) that nags
when a turn edited feature source without updating the documentation coupled to
it. Two smaller scripts guard the map itself.

## The entry is a coupling record, exactly as the technique asks

An entry carries `doc`, `sourceGlobs`, and optionally `marketingModule` and
`onboardingFlows`. The hook checks all three target types independently and
exits 2 on any miss (`check-doc-sync.mjs:8-22`), with each satisfied by a
different signal in the same turn: any edit under `docs/features/` satisfies
`doc`; any edit under `src/features/onboarding/**` satisfies the flows; any
edit in the sibling `../personas-web/` checkout satisfies the marketing module.

The indirect target resolves through a registry rather than naming an artifact
directly: `onboardingFlows` at the top of the map maps flow ids to their step
artifact, so the nag can name *which* tour rather than gesturing at tours in
general — the resolution step the technique asks for.

## Every measurement the technique cites still holds

Re-measured against the tree on 2026-08-21, all four confirmed:

| The standard's claim | Measured |
|---|---|
| a registry keyed by ids that also holds a `_comment` key makes a naive key count wrong by one | `onboardingFlows` has **39 keys, 38 flows** |
| optional target slots sit empty on most entries — 20 of 37 no flows | **20 of 37** declare no `onboardingFlows` |
| 13 of 37 no marketing module | **13 of 37** declare no `marketingModule` |
| the reference document is required | **0 of 37** entries lack `doc` |

A claim verified and left unchanged is a first-class result, and this is the
useful kind: the numbers in the upper layer were not rounded impressions, and
a reader can now tell that they were re-checked rather than merely repeated.

## The failure mode that earns the third script

`check-doc-map-paths.mjs` exists because a coupling record has a way of dying
that no consumer can see. Its header states the incident that produced it,
dated 2026-08-14: a `sourceGlobs` entry pointed at
`src-tauri/src/commands/infrastructure/live_roadmap.rs` while the file is really
at `src-tauri/src/commands/live_roadmap.rs`, so *"the hook has never once fired
for live-roadmap."*

That is worth stating precisely, because it is the general shape rather than a
typo: **a glob that matches no file cannot nag — it fails open, silently,
forever, and looks exactly like a feature nobody edited.** The mapping and the
absence of a complaint are indistinguishable from the outside. The script's own
comment generalises it to a family — dead doc links, a binding-drift check that
cannot see new files — *"a gate whose precondition quietly vanished."*

This is the strongest argument in the realization for the technique's insistence
that the mapping is **data, extended in the same change that adds the area**: a
declared artifact can be validated by a second program, and an undeclared
convention cannot be validated by anything.

## Where the realization is thinner than the standard

The map couples **source globs to documents**, and nothing couples the map's
entries to *coverage of the product*. There are 37 entries; nothing asserts that
37 is the right number, or names the feature areas that have no entry at all.
The path guard proves every declared glob resolves; no guard proves every
feature area is declared. That is the same open-versus-closed distinction the
subject makes elsewhere — this map is validated for correctness and not for
completeness, and a feature area added without an entry is invisible to every
mechanism downstream of it.
