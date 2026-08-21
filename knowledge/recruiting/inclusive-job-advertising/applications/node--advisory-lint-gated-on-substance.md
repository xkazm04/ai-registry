---
layer: application
type: application
subject: inclusive-job-advertising
technique: advisory-lint-gated-on-substance
stack: node
status: forged
---

# The substance gate and the typed finding vocabulary (Node/TypeScript)

Two files split the technique cleanly: `app/_lib/jd-lint.ts` is the pure engine
and the finding vocabulary; `app/features/library/jds/jdsLibrary.ts` is the
wiring — the threshold, the shared fact predicate, and the advisory posture.

## The substance gate

`builderLintFindings` (`jdsLibrary.ts:40-43`) is three lines and both of them
that matter are the technique:

```ts
export function builderLintFindings(body: string, opts: { marketResearch: boolean }): JdLintFinding[] {
  if ((body ?? "").trim().length < LINT_MIN_BODY_CHARS) return [];
  return lintJd({ body, salaryAvailable: opts.marketResearch });
}
```

`LINT_MIN_BODY_CHARS = 40` (`:29`) with the reason stated at `:25-28`: *"Below
this many characters the 'describe the need' body is too thin to lint usefully
— every short draft would trip missing-salary/place, which reads as nagging
rather than advice. So the builder holds the advisory panel until the draft is
substantive, then engages."* The gate measures **trimmed body**, not document
length — a filled title and an empty description do not clear it. And the
constant is *named so the wiring test can pin it*
(`jdsLintWiring.test.ts:23`), which is what stops it drifting upward every time
someone finds the panel annoying.

Forty is at the low end of the standard's landing zone, and that is the right
end to err toward: it suppresses a stub and nothing else.

## One predicate for "does this role have a salary"

`jdMarketResearchAvailable` (`jdsLibrary.ts:18-23`) is the single rule, and its
comment names every consumer (`:12-17`): *"the ONE rule that feeds the lint's
`salaryAvailable` suppression seam on every surface (the ledger modal, the
ledger read-view, AND the public page's editor) … Kept here (pure,
artifact-shaped) so those surfaces can't disagree on when a role 'has a
salary'."* It returns true for a ticked market-research build option **or** a
usable normalized band — one function, one answer, four callers. That is the
standard's one-predicate-per-fact rule implemented as a shared function rather
than as a shared intention.

The engine's side of the seam is documented as a contract at
`jd-lint.ts:114-117`: `salaryAvailable` means *"the published artifacts will
carry a figure even if the prose doesn't spell one out yet"* — the suppression
is about what the reader receives, not about the author having typed a number.

## The finding vocabulary is closed and exhaustively mapped

`JdLintFinding` (`jd-lint.ts:13-19`) is a four-member discriminated union —
`vague`, `missing` (`salary` | `place`), `exclusionary`, `manyMustHaves` — and
findings carry **canonical kinds, with display copy living in the catalogs**
(`:5-6`). `jdLintMessage` (`:142-155`) maps each kind to a translation key plus
ICU values, so the sentence is composed at render in the surface's language and
the engine stays monolingual-free.

The exhaustiveness guard is the standard's closed-vocabulary rule with an
incident attached (`:130-134`):

> switched EXHAUSTIVELY so a future kind is a COMPILE error at the
> `assertNever` default — rather than the panel's nested ternary silently
> falling through to the "missing place" label for an unrelated finding.

That is exactly the observed failure the technique warns about: a new finding
kind rendering under a confidently-worded, unrelated message. `assertNever`
(`:160-162`) makes it a type error at build and a throw at runtime, so the
mislabelled finding cannot ship.

## Deviation

**Suppressed renders as clean.** Below the threshold `builderLintFindings`
returns `[]`, and the panel *hides at zero* (`:32-33`) — so an under-threshold
draft is visually indistinguishable from a posting that passed every check.
The standard requires a distinct *not yet checked* state, per
[absence of evidence is not
evidence](../../_laws.md#absence-of-evidence-is-not-evidence); the empty array
collapses "we did not look" into "we found nothing". A third state on the
return, or a panel that renders a quiet not-yet-checked line instead of
hiding, closes it without changing the engine.
