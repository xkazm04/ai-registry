---
layer: application
type: application
subject: quality-gates
technique: policy-projection
stack: node
---

# One enumeration, four projections

## The structure

`describeGatePolicy` in `src/lib/scoring/gate.ts:100-140` is the technique
implemented literally. It walks an active `GatePolicy` once and returns an
ordered `GateConditionView[]`, where each condition carries every
projection of itself:

```ts
export interface GateConditionView {
  text: string;              // dashboard list + LLM brief (policyText)
  bit: string;               // PR-comment footer chip (policyBits)
  query?: [string, string];  // gate-API query param
  ci?: string;               // GitHub-Action `with:` line
}
```

The header comment states both the structure and the incident that
motivated it:

> The ONE ordered enumeration of an active policy's conditions, each
> pre-rendered into all four projections that previously hand-walked
> GatePolicy in lockstep … They can no longer drift — **the PR footer used
> to silently omit the D9 security floor + protected-branch rule the gate
> actually enforces.**

That is the technique's directional failure, measured: the footer was a
strict subset of the enforced policy, so an author reading it saw a weaker
policy than the one that had just refused their change.

## The inexpressible-condition rule, implemented

Only some conditions have a gate-URL parameter or an action input. The
per-dimension Security floor maps to `min_security` and branch protection
to `require_protection`; other per-dimension floors have no exposed
parameter at all. The code marks that explicitly —
`const exposed = dim === SECURITY_DIM;` — and spreads `query`/`ci` in only
when exposed, while **still emitting `text` and `bit` unconditionally**,
"so every enforced condition is visible." A condition that cannot be
reproduced through the parameterized entry point still appears in the
human-readable projections, which is exactly the rule that stops
inexpressible conditions from disappearing from every surface.

The effective-value rule is enforced next door: `effectiveFloor`
(`gate.ts:90-102`, with `failsFloor` beside it) is "the single source for this precedence — the gate
verdict …, the PR-comment 'where the score falls short' table, and the
fleet green-path math all derive a dim's floor from here."

## The display cap consumed as a data cap

`src/lib/org/security.ts:176-201` carries the measured instance of the
worst form of this bug. `securityGate.failingRepos` is capped for a card:

> DISPLAY cap only, sized for the failing-repos card. Anything that must
> be exhaustive (the CI gate snippet — see buildGateSnippet) reads the
> full `register` instead; consuming this list as "all failing repos"
> silently dropped every repo past the cap.

`FAILING_DISPLAY_CAP = 8`, and its own doc comment repeats the
distinction: "a UI bound, NOT a data cap." `buildGateSnippet` — the
paste-ready copy action that emits one gate invocation per failing repo —
is then built from `o.register.filter(r => r.gateReason)`, with the
consequence recorded at the function:

> an org with 20 failing repos previously copied a snippet that silently
> enforced only 8 of them while the tile above said "20 fail."

Two details worth copying. The cap is named as a display bound at *both*
the definition and the consumption site, because the consumer is where the
mistake is made. And the generated artifact is a real enforcement
artifact — a snippet someone installs — which is why it must never derive
from a view model.

## The policy travels with the verdict

`defaultGatePolicy` (`gate.ts:176-190`) returns different defaults per
archetype: an org repo is held to `L3` with no dimension below 40 and no
"ungoverned" posture; a team repo to `L3`/35; a solo or early repo to
`L2`/25 — "so the gate is fair to how the repo is actually run." Because
the bar differs by class, the verdict is only interpretable alongside the
policy that produced it — which is what `GateResult` does by returning
`policy` next to `pass` and `failures`, and what `describeGatePolicy`
makes readable wherever that verdict is shown.
