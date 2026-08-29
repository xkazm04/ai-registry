---
layer: application
type: application
subject: session-resume
technique: first-run-and-quiet-silence
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# React: the briefing that could not say why it was quiet

*Verified against the project tree at `bf2a1e249`.*

This surface already satisfied the loud half of the technique. First run
renders nothing; no news renders nothing; both are tested. What it could not do
was tell those two silences apart from a third one — the derivation that never
got to run — and that is the failure the technique exists to name.

## The seam

`computeSinceLeftBriefing` in
`src/features/home/sub_welcome/lib/sinceLeftBriefing.ts` is a pure function
from three store-held inputs to a list of briefing lines. Its runs input is
`readonly RunSample[] | null`, where `null` means the overview spine has not
loaded yet. The body treated that with a truthiness check —

```ts
if (input.runs) { /* ...count runs since the anchor... */ }
```

— and returned `{ lines, firstRun: false }`. So a run whose store was cold and
a run over a genuinely quiet week produced **byte-identical results**, and the
existing test `treats a null runs sample (not yet loaded) as no runs line`
asserted that conflation as the correct behaviour. It is a reasonable-sounding
test. It is also the exact shape of the trap: the assertion is about what is
*absent* from the output, and absence is where both silences live.

## A and B

- **A:** a bare `{ lines: [], firstRun: false }` for both "nothing cleared
  threshold" and "an input had not loaded".
- **B:** the result carries a discriminated
  `outcome: 'first-run' | 'briefed' | 'quiet' | 'not-derived'` and an
  `unavailable` list naming the inputs the derivation wanted and did not have.
  Rendering is untouched — `visible` still keys off `lines.length`, so no pixel
  moves.

## What was read

`vitest src/features/home/sub_welcome` — 5 files, 36 tests. Two new cases
assert that a quiet week and a cold store are different observations, and that
a partial render (`briefed`, with `unavailable: ['runs']`) still reports the
input it never saw. Under A both fail, because `outcome` is `undefined`. Under
B the suite is green with every pre-existing assertion intact, including the
one that pins the conflation's *visible* consequence — which is the point: the
old test was not wrong about the rendering, it was wrong about what the
rendering was allowed to mean.

## The structural fact: the tree already knew what this costs

The technique's cautionary extreme is an away-digest engine that produced zero
output for ninety-nine days while looking, from every surface, exactly like a
quiet week. That is not a hypothetical here — this repository is where the
example came from. `src-tauri/src/engine/project_tracking/mod.rs:63` still
holds a non-persisted `AtomicBool::new(false)` gate beside a durable
per-project flag with no writer any user can reach, and the intersection of the
two is empty by construction.

So the same codebase contains both the disease and, in the briefing, the
surface most exposed to it — and the briefing's derivation had no way to
distinguish its own silences until this change. Nobody built it that way on
purpose; a pure function that returns a list has no natural place to put
"and here is why the list is short", and so the answer goes unwritten. The
falsifiability of silence is not a thing you forget to add, it is a thing the
shape of a list-returning function actively discourages.

## What this realization cannot do or prove

- **The discrimination is computed and then dropped.** `useSinceLeftBriefing`
  still returns only `lines`, `visible` and `dismiss`. Nothing counts a
  `not-derived` outcome anywhere a human looks, which is the technique's second
  obligation and the one that would actually surface a broken briefing. The
  instrument that would close this is a counter on the accidental-silence
  outcome, reported somewhere other than this surface.
- **There is still no last-ran mark.** A session that showed nothing and a
  session where the hook never mounted remain the same observation. The
  latch that exists (`briefingRan` in the cockpit's morning briefing) is
  per-process, not persisted, so it cannot answer "has this ever run today".
- **The gate is a unit test over a pure function.** It proves the derivation can
  now name its outcome. It proves nothing about the store's loading behaviour in
  a real session — whether `runs` is actually ever null at the moment the memo
  fires is not measured here, and if it never is, this change buys only the
  ability to find out.
- **`unavailable` covers one input.** Alerts and the approvals count are not
  nullable in this shape, so a failure to fetch either arrives as an empty array
  and is indistinguishable from real emptiness. The pattern is applied where the
  type made absence expressible, which is not the same as where absence happens.
