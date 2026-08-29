---
layer: application
type: application
subject: draft-editing
technique: field-defaults-and-bounds
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# React: the hint said 1--10, the control said 50, and neither had anything to be wrong about

*Verified against the project tree at `bf2a1e249`.*

The most useful thing about this seam is that it sits eight lines away from the
same technique done exactly right, in the same JSX, by the same hand. The two
fields are rendered side by side, and the difference between them is entirely
whether the number has a definition.

## The seam

`src/features/agents/sub_settings/components/PersonaSettingsTab.tsx` renders the
persona's two execution limits in one flex row.

**The timeout field** derives everything from `PersonaDraft.ts`:
`MIN_PERSONA_TIMEOUT_MS` / `MAX_PERSONA_TIMEOUT_MS` are exported constants, the
`FieldHint`'s range is a template literal over them, the `NumberStepper`'s
`min`/`max` are the same values, and `DEFAULT_PERSONA_TIMEOUT_MS` carries the
technique's documented-incident discipline verbatim
(`PersonaDraft.ts:5-16`): "The previous default of 1_000_000 ms (~16.6 min) was
effectively 'no timeout' and was a top source of unexpected cloud bills."

**The maxConcurrent field, three lines up**, had:

```tsx
<FieldHint text="Maximum parallel executions..." range="1--10" example="3" />
<NumberStepper value={draft.maxConcurrent} min={1} max={50} />
```

Two authorities for one field's envelope, disagreeing by a factor of five, with
no definition either could be checked against. And the sentence shown to the
user was the wrong one: the engine validator
(`src-tauri/core/src/validation/persona.rs:9-10`,
`MAX_CONCURRENT_MIN = 1`, `MAX_CONCURRENT_MAX = 50`) rejects anything outside
1..50 on create and update, so the control was right by coincidence and the
hint was a plain falsehood a user could act on.

## A and B

- **A:** the two literals above, plus bounds enforced only by the control —
  `useEditorDraft`'s `patch` (the one door every draft write passes through) did
  a bare spread.
- **B:** `MIN_PERSONA_MAX_CONCURRENT` / `MAX_PERSONA_MAX_CONCURRENT` in
  `PersonaDraft.ts` beside the field, with the engine constant named as their
  source and the old disagreement recorded as the reason they exist; the hint
  and the stepper render from them; a `clampDraftPatch` applied inside `patch`
  clamps both bounded fields at the door.

## What was read

A new `personaDraftBounds.test.ts` — four cases: out-of-range high and low clamp
to the definition's bounds, a fractional concurrency rounds rather than
persisting half a slot, and a patch that does not mention a bounded field is
returned untouched. All four fail under A (the door and the constants do not
exist). Under B they pass, `vitest src/features/agents/sub_editor
src/features/agents/sub_settings` is green, and `tsc --noEmit` over the whole
project is clean — the typecheck is what confirms the hint now renders from the
definition rather than from a string.

## The structural fact: the exemplary field is the one that had an incident

The timeout field is not better-engineered because someone was more careful with
it. It is better-engineered because it *cost money once*, and the incident
comment at `PersonaDraft.ts:5-16` is the artifact of that. `maxConcurrent` has
never produced an invoice, so it never earned a definition, and the drift
appeared in the only field on the screen that had nowhere to record what it was
for.

That is the technique's "a default is a decision" argument arriving as an
observation rather than an assertion: in a tree where one field has a documented
incident and its neighbour does not, the documented one has colocation,
derivation and a shared clamp, and the undocumented one has three literals. The
scar tissue did not just preserve the rationale — it created the structure that
prevents the next drift. Nobody built that correlation deliberately; it is what
the file looks like after two years.

## What this realization cannot do or prove

- **The clamp is silent, which the technique separately prohibits.** A user who
  types 80 and sees 50 persisted with no acknowledgement reads that as
  corruption. This change moves enforcement to the right place and does not
  make it visible; "clamp visibly — show the applied value, note the limit"
  remains unapplied.
- **The definition still mirrors, it does not derive.** `MAX_PERSONA_MAX_CONCURRENT
  = 50` is a hand-copy of the Rust constant with a comment pointing at it. Two
  authorities across the language boundary are now one authority per side, which
  is better and is not what the technique asks for. The project generates
  TypeScript types from Rust already (`ts-rs` bindings), so the instrument
  exists; the constants are simply not in it.
- **Nothing tests the disagreement itself.** The gate proves the clamp clamps.
  It cannot assert "the range the user is told equals the range the app
  enforces", because that would need to render the component and read the hint
  text. B makes the disagreement inexpressible by construction, which is a
  stronger guarantee than a test — and it is a guarantee no gate is checking, so
  the next literal typed into that JSX is caught by review or not at all.
- **Only two fields were brought to the door.** `maxBudget` and `maxTurns` are
  `number | ''` in the same draft and have no bounds anywhere; the patch door
  now exists to hold them and does not.
