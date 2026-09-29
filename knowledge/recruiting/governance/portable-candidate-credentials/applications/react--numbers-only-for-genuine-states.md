---
layer: application
type: application
subject: portable-candidate-credentials
technique: numbers-only-for-genuine-states
stack: react
status: forged
verified_on: 2026-09-29
verified_against: react@19
---

# Gating the public credential card on the trust state

`app/skill/[token]/page.tsx` is the candidate-owned surface: a token-addressed public page
that renders a Durable Skill Profile to whoever the candidate sent the link to, with none
of the employer's internal context around it. It is the exact reader the technique is
written for — a stranger with no account, no pipeline view, and no way to ask a follow-up
question.

The markup no longer lives in `page.tsx`. Since the composition-kit move (commits `baca1cafb`,
`f1d58a156`) the server page resolves everything and hands plain props to
`app/skill/[token]/kit/SkillKitView.tsx`; the citations below were re-read against that
layout on 2026-09-29, and the gate they describe is unchanged.

## The bug that produced the rule

The card originally gated its numeric section on `substantive` alone. The regression
comment that survives at `app/_lib/skill-profile.ts:154–157` (the page-side copy went with the
old markup) records what that meant:

> `bug-ui-scan-2026-07-09 (dev-lifecycle-cohort-outcomes #2): gate the numeric score card
> on the full TRUST state (verified/stale = genuine, attested), NOT on substantive alone.
> A tampered/revoked/unverifiable credential can still be "substantive" (has numbers), so
> the old gate rendered attacker-/stale-controlled scores as the visual focus directly
> under a red "do not trust" badge.`

That is the technique's core claim demonstrated in production: substance and
trustworthiness are independent, a forged payload is *more* likely to be substantive than
an honest degraded one, and a badge does not retract a numeral. In the original markup the transfer score rendered in `text-display`, the largest type on
the page, beside a `text-sm` chip; the reader was never going to win that fight. The kit
layout has not been re-measured for visual weight, so that comparison is a claim about the
old page only.

## The fix

`skillProfileShowsScoreCard` in `app/_lib/skill-profile.ts:158` is the whole gate, carried to
the view as `showsScores` (`page.tsx:81`) and read by `skillBody` (`skillKitModel.ts:59`), and it
is a pure function of the resolved state:

```
return state === "verified" || state === "stale";
```

Two genuine states, and every other state renders its verdict and nothing else: the
`summaryUnavailable` block is now reserved for `incomplete`, the one state it is true of
(`skillBody`, `skillKitModel.ts:59–62`). The important structural property is that the gate lives in a pure,
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

## Withheld-state copy has to be true of each state

The same 2026-08-21 commit (`6010c6b86`, item 5) corrects a second thing the gate left
behind. The block shown in place of the numbers said the credential "was issued without a
scored skill summary". That is false in three of the four withheld states: a revoked
credential does carry axes and a score (they are withheld because they are untrusted, not
because they were never minted), and "unverifiable" is kp's own key misconfiguration, which
says nothing about issuance. The copy had been written for an older, narrower gate and kept
speaking after the gate widened. Withholding a number is half the technique; the words left
in its place must not assert a reason the state does not have.

## The zero-versus-missing detail

The axis meter (now `app/_components/kit/ScoreList.tsx:34–43`) carries a further lesson the standard adopted upward:

> `the axis meter was a purely presentational div — no role/value, so assistive tech got
> the number with no notion of scale, and a 0-score axis rendered a visually empty track
> indistinguishable from "no data".`

The fix gives the meter `role="meter"` with `aria-valuenow/min/max` and a labelled
description, and draws a baseline tick when the score is zero (`pct > 0 ? <i style=… /> : <i aria-hidden />`,
line 41; the component's own catalog line says a 0 "reads low, never missing"). A surface that suppresses numbers in untrusted states but cannot distinguish a real
zero from an absent measurement in trusted ones has only moved the ambiguity.

## Deviations from the standard

- **Confidence renders as a bare percentage** (`StatStrip` item at `SkillKitView.tsx:82`) with no scale, instrument
  or observed extent beside it. The standard requires a figure to carry its basis: what
  was measured, over what sample, under which methodology version. The page links to a
  methodology page (`SkillKitView.tsx:104–107`) but does not bind the basis to the number.
  Re-checked 2026-09-29 against the kit layout: still open.
- **The badge and the numbers are the same visual weight problem, one level down.** The
  transfer score is displayed at display size with the label beneath it; the standard's
  "render its basis with it" would put the scale range adjacent to the digit itself, not
  in a caption.
- **The stale state keeps an amber palette.** Amber reads as a warning about the artifact,
  and the standard's position is that staleness is not a fault of the credential. The
  caption compensates in prose; the colour still argues the other way.
