---
layer: application
type: application
subject: nonprofit-verification
technique: determinate-vs-inconclusive-outcomes
stack: node
status: forged
verified_on: 2026-08-19
---

# Node: the three-valued outcome model across five registry adapters

The grant-writing-nonprofits repo (`src/features/org-verification/`) realizes
the pass/fail/inconclusive model as a shared type plus one per-adapter
classification, exactly as the technique prescribes: the outcome enum lives
in `types.ts:42` with the polarity doctrine written into the comment block at
`types.ts:32-41` — fail is reserved for a *determinate* disqualifier, and
inconclusive explicitly covers both "couldn't decide" and "the negative is
not a disqualifier (a foundation-only org isn't SAM-registered; a brand-new
charity hasn't filed a 990 yet)". `makeVerificationResult()`
(`types.ts:61-82`) is the single construction site that derives
`ok = outcome === "pass"`, so the convenience boolean can never drift from
the enum across adapters.

## Each adapter's polarity, in code

- **National business register (ARES, CZ)** — `ares.ts:214-221`: `active`
  → pass; `historical`/`nonexistent` → determinate fail; bad-checksum or
  network → inconclusive. Absence here *is* a disqualifier: every real CZ
  entity has an IČO record.
- **Tax authority exempt-org list (irs.ts:96-104)** — active 501(c)(3) →
  pass; found-but-wrong-subsection (`not_charity`) and `nonexistent` →
  determinate fails; bad format / network → inconclusive.
- **Annual-filing index (irs-bmf.ts:83-91)** — the young-charity case:
  `filed` → pass, `nonexistent` → fail, but `no_filings` → **inconclusive**,
  with the comment stating the rule: "a missing 990 is NOT a disqualifier".
- **Federal-contractor registration (sam.ts:116-130)** — the positive-only
  signal: `active` → pass, *everything else* → inconclusive. The comment
  names the applicant class the mapping protects: "'not_registered' must
  NOT fail a foundation-only applicant". The registry comment at
  `registry.ts:24-27` records that this adapter only became safe to ship
  once the outcome model existed — before it, the source's absence-negative
  had no non-blocking place to land.
- **Sanctions screen (ofac.ts:114-122)** — inverted polarity: `clear` →
  pass, `potential_match` → determinate fail whose detail routes to
  "manual review required before funding" (`ofac.ts:110`), unconfigured /
  no-name / network → inconclusive.

## The aggregate reads determinate outcomes only

`passport.ts:84-113` derives the verdict from the model:
`grantEligible = passes > 0 && fails === 0 && nameMatch !== "mismatch"`
(`passport.ts:110`), and `trustScore` divides passes by `passes + fails` —
decided checks only — with the comment "so 'couldn't run' doesn't dilute the
score" (`passport.ts:111-113`). A transient network error or an env-gated,
unbuilt source (`registry.ts:43-49` returns an explicit `not_implemented`
inconclusive rather than dropping the source) neither helps nor harms the
applicant.

## The don't-cache-a-guess corner

`ares.ts:154-160` is the hardest classification in the repo: a 200 response
with neither a name nor any registration state is returned as a retryable
`error` (→ inconclusive), *not* cached as `historical` (→ fail) — the
comment calls out that the wrong choice "would persist a false negative for
the full 1h TTL". The companion rule at `ares.ts:201-210` degrades an
empty-status record to `historical` rather than promoting it to `active`
("don't promote unknown-status to 'active' — that … surfaces a false
verified badge"), with `collectRegistrationStates()` (`ares.ts:189-195`)
walking nested payloads so upstream structure drift widens what is found,
never what is assumed.
