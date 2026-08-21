---
layer: application
type: application
subject: production-coverage-measurement
technique: source-provenance-marks
stack: react
status: forged
verified_on: 2026-08-20
---

# Rendering provenance marks on the PoF status map

The `/status` map paints one cell per pipeline step. `src/lib/status/statusModel.ts:322`
defines the vocabulary; `src/components/status/StatusCell.tsx` and
`src/components/status/EvidenceModal.tsx` are the two render sites, and both read the same
object so they cannot drift.

## The vocabulary object

`EngineSource` (`statusModel.ts:324`) is `'audited' | 'authored' | 'authored-demotion' |
'inferred'`, and `ENGINE_SOURCE_MARK` (`:341`) keys `EngineSource | 'unsourced'` to
`{ glyph, word, note }`:

| value | glyph | word | what it means |
| --- | --- | --- | --- |
| audited | `✓` | AUDITED | named by the fleet gap audit (`step-facts.json` `trueEngine`) — an agent read this step and recorded what powers it |
| authored | `✎` | AUTHORED | declared by the step itself (`StepSpec.engine`); no audit fact covers it |
| authored-demotion | `↓` | AUTHORED ↓ | the step declares a lower-credibility engine than its audit does; graded on the less flattering of the two |
| inferred | `?` | UNAUTHORED | a heuristic guess over catalog + archetype + label, not a fact |
| unsourced | `?` | UNSOURCED | built without recording where the engine name came from |

The header states the defect it removes: `resolveEngine` had distinguished the sources
since the audit landed and `buildSwimlane` stamped the answer onto every cell, "but
nothing rendered it, so a heuristic guess and an audited fact printed the same string in
the same weight."

`undefined` is handled loudly rather than defaulted: `engineSourceMark(source?)` (`:373`)
resolves `source ?? 'unsourced'`, because "a cell built without recording its provenance
has proven nothing, and letting the omission render like an audited fact is exactly the
class of lie this map exists to expose."

## Glyph plus word, never hue

The comment cites WCAG 1.4.1 explicitly, and pins the discipline to the rest of the
surface: "`glyph` + `word` carry the distinction, never hue — the same discipline as
`readinessCode` and `ProvenanceStrip`." The cell has already spent its hue budget on the
readiness ramp (`readiness.ts:150`), where green is reserved for the gate-proven rungs;
a second hue language on the same cell would contradict the first.

`StatusCell.tsx:43` reads `engineSourceMark(cell.engineSource)` once and composes it into
a multi-line `title`, alongside `readinessLabel`, the craft label, and — crucially —
`credibility: ${engineClassNote(cell.engine)}`, whose inline comment names the same rule
from the demotion side: without it "a cell demoted for its engine class just came back a
different colour — a silent re-colour on the map whose premise is that a cell says what is
behind it."

`StatusCell.tsx:70` gates the mark on the cell actually printing an engine name, so an
unwired cell rendering `—` does not carry a provenance mark for a name it never showed.
`EvidenceModal.tsx:208` renders the same object as `engine: {cell.engine}
[{engineSourceMark(cell.engineSource).word}]` with the note as the tooltip, under
`data-testid="evidence-engine-source"`.

## The one-way self-demotion rule

`resolveEngine` (`statusModel.ts:379`) prefers `fact.trueEngine` over `StepSpec.engine`
over the heuristic — except downward. The comment is the clearest statement of the
asymmetry in the codebase:

> A step may always tell the map it has earned LESS than its audit credited it with; it
> may never tell it more. Preferring the audit unconditionally is right against an
> OVERCLAIM (a step cannot promote itself past the agent that read it), but it also
> silences a step CORRECTING itself downward — and that correction is the one direction
> that carries no risk, because nobody games a map by looking worse on it.

The demotion applies immediately, renders with its own `↓` mark, and the disagreement
stays on record for the spec linter to list while the audit catches up.

## Craft absence is not painted

`StatusCell`'s `craft` prop is documented as display-only and optional, with the rule that
absence — the step was never audited, or gauges failed to load — renders **no chip at
all**: "absence is never painted as A0". The legend in `PipelinesView.tsx:159` titles each
ramp swatch with `READINESS_MEANING[level]`, so the one-line meaning per rung ships with
the colour rather than living in a wiki.
