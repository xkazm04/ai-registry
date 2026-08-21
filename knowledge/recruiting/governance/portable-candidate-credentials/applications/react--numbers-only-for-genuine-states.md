---
layer: application
type: application
subject: portable-candidate-credentials
technique: numbers-only-for-genuine-states
stack: react
status: forged
verified_on: 2026-08-20
---

# Gating the public credential card on the trust state

`app/skill/[token]/page.tsx` is the candidate-owned surface: a token-addressed public page
that renders a Durable Skill Profile to whoever the candidate sent the link to, with none
of the employer's internal context around it. It is the exact reader the technique is
written for — a stranger with no account, no pipeline view, and no way to ask a follow-up
question.

## The bug that produced the rule

The card originally gated its numeric section on `substantive` alone. The regression
comment at `page.tsx:87–92` records what that meant:

> `bug-ui-scan-2026-07-09 (dev-lifecycle-cohort-outcomes #2): gate the numeric score card
> on the full TRUST state (verified/stale = genuine, attested), NOT on substantive alone.
> A tampered/revoked/unverifiable credential can still be "substantive" (has numbers), so
> the old gate rendered attacker-/stale-controlled scores as the visual focus directly
> under a red "do not trust" badge.`

That is the technique's core claim demonstrated in production: substance and
trustworthiness are independent, a forged payload is *more* likely to be substantive than
an honest degraded one, and a badge does not retract a numeral. The transfer score renders
in `text-display` (line 97) — the largest type on the page — while the badge is a
`text-sm` chip (line 72). The reader was never going to win that fight.

## The fix

`skillProfileShowsScoreCard` in `app/_lib/skill-profile.ts:158` is the whole gate, and it
is a pure function of the resolved state:

```
return state === "verified" || state === "stale";
```

Two genuine states, everything else falls through to the muted `summaryUnavailable` block
at `page.tsx:150–152`. The important structural property is that the gate lives in a pure,
testable leaf module (`skill-profile.test.ts`) rather than inline in the JSX, and the
resolution it consumes comes from `resolveSkillProfileCardState` (line 129) — the render
body carries no branching logic of its own. That is the standard's "gate at the data
layer, not the template" made concrete by the module boundary: the page cannot compute its
own opinion about whether to show a number.

`stale` is deliberately on the *permitted* side. `page.tsx:38–43` and the stale caption at
lines 79–85 keep the numbers visible while replacing the green shield with a muted amber
"issued a while ago" verdict naming the reason (`staleAge` or `staleMethodology`). This
matches the standard exactly: age is context, not disqualification, and hiding a real
result from its owner destroys the artifact's only value to them.

## The zero-versus-missing detail

The axis meter at `page.tsx:128–141` carries a second lesson the standard adopted upward:

> `the axis meter was a purely presentational div — no role/value, so assistive tech got
> the number with no notion of scale, and a 0-score axis rendered a visually empty track
> indistinguishable from "no data".`

The fix gives the meter `role="meter"` with `aria-valuenow/min/max` and a labelled
description, and draws a 1px baseline tick (`w-1 bg-stone-300`, line 139) when the score is
zero. A surface that suppresses numbers in untrusted states but cannot distinguish a real
zero from an absent measurement in trusted ones has only moved the ambiguity.

## Deviations from the standard

- **Confidence renders as a bare percentage** (`page.tsx:102`) with no scale, instrument
  or observed extent beside it. The standard requires a figure to carry its basis: what
  was measured, over what sample, under which methodology version. The page links to a
  methodology page (line 156) but does not bind the basis to the number.
- **The badge and the numbers are the same visual weight problem, one level down.** The
  transfer score is displayed at display size with the label beneath it; the standard's
  "render its basis with it" would put the scale range adjacent to the digit itself, not
  in a caption.
- **The stale state keeps an amber palette.** Amber reads as a warning about the artifact,
  and the standard's position is that staleness is not a fault of the credential. The
  caption compensates in prose; the colour still argues the other way.
