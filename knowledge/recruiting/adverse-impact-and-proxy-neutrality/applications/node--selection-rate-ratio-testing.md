---
layer: application
type: application
subject: adverse-impact-and-proxy-neutrality
technique: selection-rate-ratio-testing
stack: node
status: forged
---

# The four-fifths primitive in a demographic-blind hiring platform (TypeScript)

`app/_lib/adverse-impact.ts` is a pure, stateless module — no imports, no store
access — that computes the selection-rate ratio for a set of groups the
recruiter supplies. Its header (`:1-16`) is the clearest statement of the
standard's central claim anywhere in the repo, and it is written as a warning
rather than a feature note:

> This is a READY PRIMITIVE, not an automatic monitor. … THIS PLATFORM COLLECTS
> NO DEMOGRAPHIC DATA, so it cannot and does not run this on stored candidates.

The same paragraph closes the door on the substitution the subject exists to
prevent: the app's automated-rejection fairness gate "is a separate thing: an
ARCHETYPE shield (early-career / unknown), NOT a protected-class test".

## The two constants, and why the second is the interesting one

`FOUR_FIFTHS = 0.8` (`:19`) is the threshold. `ADVERSE_IMPACT_MIN_COHORT = 30`
(`:39`) is the floor, and its doc comment does what the standard asks of a
number: it shows its reasoning rather than asserting a magic value. It notes
that the guidelines themselves caution that a four-fifths difference "based on
small numbers" and "not statistically significant" does not establish adverse
impact; that no single floor is codified; and that 30 is therefore adopted as
the rule-of-thumb minimum for a stable proportion estimate. It also states the
two-group requirement — "a full analysis needs ≥2 such groups (one reference +
one comparison) before any ratio is asserted" — and cross-references the
sibling min-cohort gates in the same codebase (`calibration.ts`
`MIN_CALIBRATION_OUTCOMES = 20`, `db/salary-benchmark.ts`
`SALARY_BENCHMARK_MIN_COHORT = 3`), so the floors read as one policy rather
than three opinions.

## Reference selection defended at both ends

`computeAdverseImpact` (`:148`) picks the reference as the highest selection
rate **among groups that clear the floor**, with the reason stated inline: a
sub-floor group "e.g. n=1 at 100%" can no longer anchor the verdict. Ties
resolve to the first such group in input order, so the function is
order-independent and deterministic.

Two input guards protect that data-chosen reference, and both are the standard's
"input hygiene is fairness logic" rule realized:

- `clampCounts` (`:125`) floors counts at zero and caps `selected` at `total`,
  "rather than producing a >100% selection rate that would corrupt the
  reference".
- `parseGroupCounts` (`:68`) records the 1-based line number of every non-blank
  row that failed to parse (`:81`) instead of dropping it. The type comment
  states the mechanism precisely: because the reference is "highest selection
  rate among whatever parsed", quietly discarding a mistyped line "can change
  which group anchors the ratio and flip a group between 'ok' and 'adverse
  impact'". An empty numeric field is treated as a typo, not as a real zero.

## Three states, enforced in the type and again in the view

`AdverseImpactResult.reliable` is true only when at least two groups clear the
floor, and when it is false `anyAdverseImpact` is **forced** false (`:168`,
`:174`) — the comment names the distinction the standard insists on: "the
sample is too small to assess, which is a DISTINCT state from 'no adverse
impact'". Per group, `impactRatio` is `null` rather than a number whenever the
group or the reference cannot support one, so an unreliable rate is never
promoted into an authoritative ratio.

`DecisionsComplianceImpactCheck.tsx` carries the state through to the surface:
a comment at `:82` states "Three states, not two", and the verdict colour
branches to a neutral steel — not the green — when `!impact.reliable` (`:87-98`),
rendering an explicit insufficient-sample string parameterised by the floor.
Malformed rows surface as their own warning listing the ignored line numbers
(`:32-43`).

## The jurisdiction field that is mostly null

`app/_lib/compliance-regimes.ts:29-33` types `adverseImpactStandard` as
`string | null` and populates it with the four-fifths rule for exactly one of
seven regimes (`:59`); every other jurisdiction is `null` (`:45`, `:52`, `:66`,
`:73`, `:80`, `:87`), with the field comment recording the refusal: "null where
there is no single codified ratio — the primitive still applies, but no
jurisdiction-specific threshold is asserted". The renderer honours it —
`DecisionsComplianceSection.tsx:63` falls back to an explicit "none" string
rather than to 0.8. The module header adds the framing the standard requires of
such a catalog: these are "FRAMING references, not legal advice and not a claim
of certified conformance".

## Where it falls short of the standard

The primitive computes the ratio and stops: there is no statistical-significance
companion and no shortfall count, so a flagged group at n=31 and one at n=3,100
present identically. Results are not stamped with a gate, a window or a scoring
version — the module is ad hoc by design, which makes the stamping the caller's
unowned problem. And the analysis is single-gate by construction: nothing walks
the funnel stage by stage.
