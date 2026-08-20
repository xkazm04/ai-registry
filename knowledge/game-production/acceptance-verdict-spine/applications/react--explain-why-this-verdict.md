---
layer: application
type: application
subject: acceptance-verdict-spine
technique: explain-why-this-verdict
stack: react
status: forged
---

# React realization — the "Why this grade?" disclosure

Same repo (`C:\Users\kazda\kiro\pof`). The explanation is a pure module plus a
lazily-invoked thunk plus one disclosure component.

## The reconstructor

`src/lib/catalog/acceptance/explainAcceptance.ts:8` — the header states the motivating
cost directly: "Diagnosing one red step therefore took a scout, a three-commit bisect
and a read-only DB query."

It returns `AcceptanceExplanation { final, decidedBy, layers[] }`. Each
`AcceptanceLayer` carries `id` (`'checker' | 'server-overlay' | 'judge-bridge'`),
`label`, `input`, `output` (both rendered as `status · tier` by the `shown()` helper),
`won`, and a plain-sentence `note`.

The declining-to-act notes are the teaching surface, and they are written as prose:

> `Not applied. A server verdict wins ONLY over a local "deferred" — the checker
> decided this one itself (the server row says pass).`

`decidedBy` is computed last, and `checkerLayer.won` is *corrected* after the fact
(`decidedBy === 'checker'`) so exactly one layer is marked as having won.

## The two guarantees, in code

- **Display only, by construction.** The module imports and re-applies
  `serverVerdictOverlay` and `bridgeJudgeVerdict` — the same functions
  `resolveStepAcceptance` calls, in the same order — so `explanation.final` *is* the
  resolver's output. The header says so: "it never re-grades and never changes a
  verdict." Four cases in `src/__tests__/catalog/explainAcceptance.test.ts:101`
  ("display only") assert `explained.final` deep-equals `resolveStepAcceptance(...)`.
- **On demand.** `steps/shared/useStepAcceptance.ts:68` returns
  `{ ...merged, explain: () => explainAcceptance({ ...args, checker: accept, ctx }) }`
  — a thunk, not a value, with the comment "it re-runs the checker (and every `allOf`
  member), which must be a reader's cost, never a per-render one."
  `ProvenanceStrip.tsx` holds `const [openWhy, setOpenWhy] = useState(false)` and
  computes `const explanation = openWhy ? explain?.() : undefined`, so the checker
  re-run happens only while a reader has the disclosure open.

## Naming the member that spoke

`explainMembers()` (line 74) reads the composition's members back from the symbol
property `allOf` stamped on the composed function
(`src/lib/catalog/acceptance/combinators.ts:29`, `Symbol.for('pof.acceptance.allOfMembers')`,
non-enumerable, "Metadata only: grading is untouched"), re-runs them, and flags
`spoke: index === decided` where `decided` is the first non-pass index, else 0. The
checker layer's note then reads: `Composed of 4 checks; "price/power band" produced the
reported fail · L1.`

## The provenance chip

`src/components/layout-lab/steps/shared/ProvenanceStrip.tsx:13` renders verdict
standing as a colourblind-safe chip (glyph + word, never hue alone — WCAG 1.4.1):
`VERDICT: CURRENT` is the only one styled `ok`; `stale`, `unknown` and `superseded` all
render `warn`. The unapplied judge verdict is displayed *because* it was not applied.

## Confirmed, deviation, upward lesson

- **Confirmed.** Layer chain with input/output/won/note; a single `decidedBy` field.
- **Upward lesson.** Rendering input and output as the same `status · tier` string
  makes a no-op layer *visibly* a no-op — cheaper and clearer than the boolean alone.
- **Upward lesson.** The display-only guarantee is enforced by a table-driven test
  asserting deep equality with the resolver across four chain shapes, not by comment.
  That test is what keeps the second-authority risk closed.
- **Upward lesson.** Recording composition members as a non-enumerable symbol property
  at build time is what makes member naming free at grade time; the expert draft had
  the requirement but not this mechanism.
