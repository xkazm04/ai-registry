---
layer: application
type: application
subject: portable-candidate-credentials
technique: freshness-is-separate-from-integrity
stack: node
status: forged
---

# Adding a freshness dimension without breaking the back catalogue

`app/_lib/skill-profile.ts:74–78` states the problem the technique names, in the words of
the scan that found it:

> `a "durable" credential has revocation but no freshness dimension — the green "Verified"
> shield reads identically for a week-old and a five-year-old attestation, and for a
> superseded methodology. The HMAC only attests INTEGRITY (untampered bytes); it says
> nothing about whether the assessment is still CURRENT.`

The credential was cryptographically sound and communicatively wrong. Nothing about the
signature was broken; the surface was over-asserting a property the signature never
carried.

## Both mechanisms, in one pure function

`skillProfileFreshness` (line 96) computes the two axes the technique separates:

- **Elapsed time** against `PROFILE_FRESHNESS_DAYS = 730` (line 82) — roughly two years,
  derived from `issuedAt`.
- **Supersession**, as `(dsp.methodologyVersion ?? DSP_VERSION) !== DSP_VERSION` — an
  event on the issuer's side, not a clock. `DSP_VERSION` (line 12) is stamped into
  `methodologyVersion` at build time (`buildDurableSkillProfile`, line 40), which is what
  makes retrospective detection possible at all.

The returned `SkillProfileFreshness` (line 84) carries a `reason: "age" | "methodology" |
null` alongside the boolean, so the surface can say *why* rather than just *stale* —
`page.tsx:81–83` branches on it to render `staleMethodology` or `staleAge`. And the
standard's decision rule that supersession outranks a clock is honoured with the inverse
guard: when `issuedAt` is unparseable (line 101), age is unknown and *only* a methodology
bump can mark the credential stale, rather than defaulting an undatable credential into
expiry.

## The migration property worth copying

The design note at line 79 is the upward lesson this application contributes:

> `Freshness is derived from the already-signed issuedAt + methodologyVersion — NO new
> signed field — so existing credentials keep verifying and outstanding /skill links never
> break.`

Adding a `freshUntil` field to `DurableSkillProfile` would have changed the canonical form
that `signProfile` (line 173) seals via `canonicalize` from `app/_lib/decision-hash.ts`,
requiring a `DSP_VERSION` bump and invalidating every credential already in a candidate's
hands. Deriving the dimension from fields that were already inside the seal cost nothing
and broke no shared link. This generalizes: a new dimension computed *from* an existing
seal is free; a new dimension *inside* the seal costs you the entire back catalogue.

## Integrity stays orthogonal, all the way to the state machine

`resolveSkillProfileCardState` (line 129) takes `stale` as a separate input from `valid`,
`verifiable` and `substantive`, and places it **last** in the priority chain — after
revoked, unverifiable, tampered and incomplete. A stale credential is therefore only ever
reached when every integrity check has already passed, which is precisely the technique's
"resolve freshness after integrity" rule expressed as an ordering rather than a comment.
`skillProfileShowsScoreCard` (line 158) then keeps the numbers visible for `stale`, so
staleness downgrades the *claim of currency* and nothing else.

## Deviations from the standard

- **One global window for every assessment kind.** `PROFILE_FRESHNESS_DAYS` is a single
  constant; the standard asks for a window per instrument, because a structured coding
  exercise and a durable-capability reading do not decay at the same rate. The 730-day
  figure is also unexplained — the standard requires the derivation to be written down.
- **No supersession register.** Staleness by methodology is inferred from a version
  inequality, so the surface can say "superseded" but cannot say *when*, *why*, or whether
  the old result translates into the current instrument. The standard's register would
  turn "no longer current" into an answerable question.
- **Superseded credentials still show their numbers.** Because supersession is folded into
  `stale`, `skillProfileShowsScoreCard` renders the score card for a result graded on a
  scale the product no longer operates. The standard separates these: a stale-by-age
  credential shows its figures with the date stated; a superseded one should not present
  its figure as a current band at all.
