---
layer: application
type: application
subject: inclusive-job-advertising
technique: advisory-lint-gated-on-substance
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# The substance gate and the typed finding vocabulary (Node/TypeScript)

Two files split the technique cleanly: `app/_lib/jd-lint.ts` is the pure engine
and the finding vocabulary; `app/features/library/jds/jdsLibrary.ts` is the
wiring — the threshold, the shared fact predicate, and the advisory posture.
Read at kp `9f2ff09d6`.

## The substance gate

`builderLintFindings` (`jdsLibrary.ts:51-57`) is the technique in three lines:

```ts
export function builderLintFindings(
  body: string,
  opts: { marketResearch: boolean; mustHaveCount?: number }
): JdLintFinding[] {
  if ((body ?? "").trim().length < LINT_MIN_BODY_CHARS) return [];
  return lintJd({ body, salaryAvailable: opts.marketResearch, mustHaveCount: opts.mustHaveCount });
}
```

`LINT_MIN_BODY_CHARS = 40` (`:41`) with the reason stated at `:37-40`:
*"Below this many characters a JD body is too thin to lint usefully — every
short draft would trip missing-salary/place, which reads as nagging rather
than advice. Named here so the wiring test pins it."* The gate measures
**trimmed body**, not document length — a filled title and an empty
description do not clear it — and the wiring test imports the constant rather
than a literal (`jdsLintWiring.test.ts:11`, `:24`), which is what stops it
drifting upward every time someone finds the panel annoying. The same comment
scopes it: *"The Generate form's editor is the NEED, not a posting, so this
threshold is for post-build editors only"*, and the wiring test asserts the
builder never lints the need text (`:17`).

Forty is at the low end of the standard's landing zone, and that is the right
end to err toward: it suppresses a stub and nothing else.

## One predicate for "does this role have a salary"

`jdMarketResearchAvailable` (`jdsLibrary.ts:30-35`) is the single rule, and
its comment names every consumer (`:12-16`): *"the ONE rule that feeds the
lint's `salaryAvailable` suppression seam on every POST-BUILD surface (the
ledger modal, the ledger read-view, AND the public page's editor)."*

The predicate was narrowed, and the comment at `:18-28` is the reason this
technique insists the predicate read the artifact. It used to return true for a
ticked market-research build option as well as for a usable band. *"The tick
is the recruiter's pre-build INTENT, recorded before the step ran"*, and the
step can legitimately resolve to no band. Then the published body carried *"no
pay figure ANYWHERE — while the lint, trusting the tick, suppressed its
missing-salary finding and the panel rendered its all-clear."* It now returns
`normalizeMarketSalary(artifacts.salary).available` and nothing else: *"After
the build the artifacts are the evidence; the tick is a promise we can now
check."* That is one predicate per fact, and it is also suppression is not
satisfaction, observed in the code.

## The finding vocabulary is closed, and closed twice

`JdLintFinding` (`jd-lint.ts:13-19`) is a four-member discriminated union —
`vague`, `missing` (`salary` | `place`), `exclusionary`, `manyMustHaves` — and
findings carry **canonical kinds, with display copy living in the catalogs**
(`:5-6`). `jdLintMessage` (`:212-225`) maps each kind to a translation key
plus ICU values, so the sentence is composed at render in the surface's
language. The exhaustiveness guard carries its incident (`:200-204`): a new
kind used to fall *"through to the 'missing place' label for an unrelated
finding"*; `assertNever` (`:230-232`) makes it a type error at build and a
throw at runtime.

The panel needed the same guard a second time. `JdLintPanel`
(`JdsLintPanel.tsx:32-44`) maps the message key to copy through a ternary
chain, and the comment at `:67-73` records why the engine's guard was not
enough: the compile error at `jdLintMessage` *"is discharged by adding a
JdLintMessage member, and the ternary below it used to absorb the new key into
the 'missing place' label and ship."* The chain now ends on a named key with
`assertLintMessageHandled(m: never)` as the residue (`:74-76`). A closed
vocabulary needs a total mapping at **every** layer that translates it, not
only at the first.

## Deviation

**Suppressed renders as silence, never as "not yet checked".** The ledger
read-view is the one surface that renders zero findings as a positive verdict,
and it now holds that all-clear behind the threshold
(`JdsLedgerDetailModal.tsx:225-241`). Its comment records the incident: a
short hand-saved body *"claimed 'pay, place, no boilerplate' about text
carrying neither."* That closed the false pass. Below the threshold every
surface still shows nothing, and the two editors hide the panel at zero
findings (`JdsModalEditor.tsx:160`, `app/jds/[slug]/JdActions.tsx:192`), so an
unchecked stub and a clean posting look the same there. The standard asks for
a distinct *not yet checked* line, per [absence of evidence is not
evidence](../../../_laws.md#absence-of-evidence-is-not-evidence).
