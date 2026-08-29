---
layer: application
type: application
subject: fleet-orchestration
technique: session-registry
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# The consumer side of a closed vocabulary (React)

*Verified against the project tree at `bf2a1e249`.*

The registry's status vocabulary is single-sourced and honest: eight variants,
generated from Rust into `src/lib/bindings/FleetSessionState.ts`, with a doc
comment naming the three signals that drive them and an instruction to keep the
names stable because they ship in event payloads and persisted decision logs.
The technique's warning is not about that definition. It is about the mapping
layer — "the classic failure is a monitoring layer that keeps its own parallel
enum plus a mapping function; the mapping is precisely where new states get
silently dropped." This is what that looks like when the parallel enum is not
even parallel, just short.

## The seam

`src/features/plugins/fleet/sub_grid/FleetGridPage.tsx:63` declares the visual
order of the session list:

```ts
const GROUP_ORDER: ReadonlyArray<{ id: FleetSessionState; ... }> = [ ... ];
```

Seven rows. The binding has eight. `finished` is absent, and the grouping step
(`.filter((g) => buckets.has(g.id) ...)`) walks `GROUP_ORDER`, so a finished
session has no row to land in and does not render at all — on the only tab that
lists sessions.

The annotation is why nobody noticed. `ReadonlyArray<{ id: FleetSessionState }>`
type-checks every *element*; it says nothing about the *set*. The compiler was
asked whether each row is well-formed, not whether the rows cover the vocabulary,
and it answered yes. Meanwhile the shared authority beside it
(`src/features/plugins/fleet/fleetStateMeta.ts:33-42`) does list all eight, so
`FleetSummaryPills` renders a teal "Finished — N" pill whose filter resolves to
an empty list. The two structures disagree, and the disagreement is exactly the
distance between "one authority per vocabulary" and "one authority, plus a
hand-maintained copy that happens to be shorter".

## A and B

**A** is the tree as it stands: the annotated array, seven rows.

**B** drops the annotation for `as const satisfies ReadonlyArray<FleetGroupMeta>`,
adds the missing `finished` row, and closes the derivation with a compile-time
door:

```ts
type _StatesWithoutAGroup = Exclude<FleetSessionState, (typeof GROUP_ORDER)[number]['id']>;
const _groupOrderIsExhaustive: _StatesWithoutAGroup extends never ? true : never = true;
```

Thirty-one lines changed, half of them the new test.

## What was read

A unit test asserting that the grid renders every state the shared authority
defines. Under A it fails with `expected [ 'finished' ] to deeply equal []`.
Under B it passes, and `tsc --noEmit` is clean across the project. Deleting the
`finished` row again under B does not restore the silence: the typecheck stops
at `error TS2322: Type 'true' is not assignable to type 'never'` on the
assertion line. The failure mode has been converted from an empty group nobody
sees into a build error nobody can merge past.

## The structural fact

The tree already contained the fix, twice over, and could not use it. The same
directory holds `FLEET_STATE_META` — complete, eight rows, with a doc comment
explaining that it exists so "a state can never wear violet in one place and
blue in another" — and `laneOfState`, a `switch` over the same union whose final
`return 'done'` makes it total by construction. Colour got a shared authority
because a mismatch is *visible*; ordering did not, because a missing group looks
exactly like an empty one. That is the general shape of this failure: the parts
of a vocabulary consumers get right are the parts where being wrong shows up on
screen, and a state with zero sessions and a state the code forgot are the same
picture.

## What this cannot do or prove

The compile-time assertion covers exactly one consumer. It says nothing about
the other places this union is consumed — filters, notification predicates, the
attention lanes — each of which needs its own door; nothing in the change makes
the *next* one exhaustive. Nor does it prove the ordering is right, only that it
is total: a `finished` row placed in the wrong position is still a defect and
the test will not see it, because the test asserts coverage, not sequence. And
this is a frontend derivation only. The registry's own transition door — the
technique's larger claim, that writers report observations and one function maps
`(state, observation)` to the next state — is a Rust concern in this tree and
untouched here; a UI that renders all eight states faithfully is still rendering
whatever the backend's dozen sibling mutators agreed on.
