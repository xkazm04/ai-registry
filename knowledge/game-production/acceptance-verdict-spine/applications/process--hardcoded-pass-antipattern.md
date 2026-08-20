---
layer: application
type: application
subject: acceptance-verdict-spine
technique: hardcoded-pass-antipattern
stack: process
status: forged
---

# Process realization — acceptance integrity as a reviewed dimension

Same repo (`C:\Users\kazda\kiro\pof`). The countermeasure is a blocking human/agent
review with acceptance honesty as a first-class rubric dimension, plus the incident
that proved it necessary.

## The incident

`src/components/layout-lab/steps/itemsSteps.ts:128` carries the finding in a comment:

> The gate's verdict is DERIVED from upstream sibling acceptance, never fabricated
> (scan 2026-07-16 finding: `produce()` hard-coded `pass: true`, so the gate could
> never fail — success theater).

`GATE_CHECK_DEPS` is the remediation's first half — the declared map from each named
check to the upstream steps it verifies (`'Visual QA (icon + mesh)': ['Icon 2D Art',
'3D Generation', 'Material / Texture']`).

The second half, at `itemsSteps.ts:176`, is the deeper bug found later:
`deriveGateChecks` used to re-run each sibling's own local shape checker on raw `data`
— no context, no server drain verdict, no judge verdict. So

> the step that gates the whole item was the one step that bypassed [the single
> truth]: `item-1`'s `Icon 2D Art` was `deferred/L4` on the SERVER with the reason
> "not a generated asset", and this gate's `"Visual QA (icon + mesh)"` row printed
> PASS beside a log line reading `Result={Success}`.

The fix is injection: `resolved` is `CheckerContext.siblingVerdict`
(`src/lib/catalog/acceptance/types.ts:56`), filled by `buildLabCheckerContext` in the
lab and by its own sources on the server. `SiblingVerdict` carries
`source: 'checker' | 'drain' | 'judge'` so `blockerLabel()` can render
`Icon 2D Art (deferred · drain)` — the operator's routing information. With no
resolver the function falls back to the sibling's own checker, labelled `checker`.
`GateCheckResult.deferred` keeps the third state: blocked only by deferred upstreams is
not a failure, and `ItemGate.tsx:72` computes the log's `Result={…}` from the same
three-state reading so the panel and the banner cannot disagree.

## The blocking rubric

`docs/catalog/QUALITY-GATE.md:1` — every catalog row passes a review by a fresh
reviewer subagent, an author → review → REVISE → re-review → APPROVE loop. "Tests
passing is **necessary, not sufficient**." Three dimensions, all must meet bar:

1. **Content fidelity** — is the produced content genre-grade per the laws, with
   concrete in-envelope numbers.
2. **Wiring** — do links resolve or defer honestly; is the Granted-by / Activated-by /
   Dependencies / Verification contract declared.
3. **Acceptance integrity — *is the gate honest?*** — "Acceptance is **derived** from
   the produced data (no faked pass); tiers are honest (runtime/visual genuinely
   `deferred` at L3/L4, never faux-passed at L0)."

The reviewer prompt template (same file, line 34) hard-codes independence: "Verify
INDEPENDENTLY — read the actual code + the laws, do not trust the author's report",
and requires the reviewer to run the tests itself rather than read a report of them.
REVISE gaps are returned as `step · dimension · concrete fix`, and "Do **not** advance
the row on a REVISE."

## Confirmed, deviation, upward lesson

- **Confirmed.** The literal-constant disguise, and its prevalence in generated
  pipeline code — this one was authored by a code-generating agent and passed its own
  tests.
- **Upward lesson.** Naming acceptance integrity as a *separate reviewed dimension*
  alongside content and wiring. A reviewer asked only "is the content good" never
  looks at the accept path; the expert draft treated this as a lint concern and the
  repo shows it is a review-rubric concern.
- **Upward lesson.** The second, subtler form: a gate that *is* derived but derives
  from the wrong layer. Deriving from raw sibling data reproduces the hardcoded-pass
  outcome with none of its smell, and the only cure is reading the resolved verdict.
- **Deviation, standard held.** `UNSERVABLE_STEPS` in
  `src/lib/catalog/acceptance/stepGradability.ts` is empty and the per-catalog
  unservable list holds exactly one entry, so the `unknown` state still absorbs cases
  the four-state doctrine says should be explicitly reasoned. The standard stays: an
  `unknown` is a finding, not a resting place — the repo agrees in its own comment
  ("This is not an accepted state: it is a FINDING").
