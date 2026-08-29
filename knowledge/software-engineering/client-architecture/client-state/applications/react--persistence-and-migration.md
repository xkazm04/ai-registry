---
layer: application
type: application
subject: client-state
technique: persistence-and-migration
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# Persistence and migration — the direction nobody tests

*Verified against the project tree at `bf2a1e249`.*

A canvas layout store that gets almost every clause of this technique right
is the best place to find the one clause that is structurally hard to get
right: **version skew runs in both directions.** Forward skew is exercised
by every upgrade. Backward skew is exercised by rollbacks, old installers
and synced profiles — none of which happen on a developer's machine.

## The seam

`src/features/teams/sub_mastermind/lib/layoutStore.ts` is a model
implementation of the technique's other clauses. The durable app database is
the authority and `localStorage` is demoted to a fallback (`:251-263`,
asserted at `__tests__/layoutStore.test.ts:155-168`). The version lives
inside the payload under a stable key, with the reason written at `:38` —
"the version FIELD is what moves". The v1→v2 author backfill is a real
migration step (`:172-183`). Legacy per-artifact keys are imported once and
written through. A corrupt document falls back to empty without throwing.
Panel specs one level down are checked for **membership** in
`SUPPORTED_PANEL_SPEC_VERSIONS` and dropped when unknown (`:191`) — the
future-payload question answered correctly, for the nested object.

For the document itself, `parseLayout` returned:

```ts
return {
  version: LAYOUT_DOC_VERSION,
  ...
};
```

at `:216`: the current version stamped onto whatever was parsed. Not a
migration — an assignment. A v3 document written by a newer build was read as
v2, and the first canvas edit scheduled a write-through that re-saved it as
v2 with every field this build has no parser for silently gone. The file
knew the right move and applied it one level down; the outer document
inherited the coercion.

## A and B

**A** — stamp `LAYOUT_DOC_VERSION` on parse, write through on every edit.

**B** — preserve-and-default, in the two halves the technique names.
*Preserve*: a `version` above this build's survives the parse. *Default*: the
session runs on the fields it understands (`parseLayout` already coerces each
one defensively), but `writeThroughNow` becomes inert while the doc is from
the future, because the build that wrote a payload is the only code that can
serialize it without loss. `isLayoutFromNewerBuild()` is exported as the
channel a surface can use to say so — the "loudly" half of falling toward
defaults, and what keeps this state distinguishable from a first run.

## What was read, and what it said

The test harness at `__tests__/layoutStore.test.ts:31-43` already logs every
value written through `set_app_setting`, so the instrument existed; only the
case was missing. A v3 document carrying a field this build has no parser
for, hydrated, then a position saved and the debounce advanced.

Under A: one write, and the stored document came back as `version: 2` with
the unknown field dropped — a rollback converted into data loss, by a user
who did nothing but drag a node. Under B: zero writes, and the v3 payload in
storage is byte-identical to what the newer build left. The file's seven
other cases, the sibling persistence and authorship suites (30 tests) and
`tsc --noEmit` are green under both.

## What this cannot do or prove

- **The disclosure has no consumer.** `isLayoutFromNewerBuild()` is a
  channel, not a message. Until a surface renders it, a user on a rolled-back
  build silently loses this session's canvas edits at close — a quieter
  failure than the one removed, and arguably the one worth fixing next.
- **It protects one payload.** The technique's registry clause — every key
  declared in one place with its owner and durability class — is untouched;
  this store owns exactly one key and cannot demonstrate anything about the
  keys other features declare privately.
- **The measurement is a fixture, not the field.** No installation has been
  observed rolling back. The test proves the code now does the right thing
  for a document it has never actually met, which is the whole difficulty of
  this clause: the case that motivates it cannot be produced by upgrading.
- **Inert writes are a policy, not a guarantee.** Nothing stops another
  module from writing `mastermind.layout.v1` directly; the technique's
  one-author rule is honored by convention here, and no gate enforces it.
