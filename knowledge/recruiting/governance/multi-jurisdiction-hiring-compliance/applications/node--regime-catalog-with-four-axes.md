---
layer: application
type: application
subject: multi-jurisdiction-hiring-compliance
technique: regime-catalog-with-four-axes
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: code
ab_verdict: better
---

# Node: the seven-regime catalog in KandiDate

`app/_lib/compliance-regimes.ts` is the catalog, and it is a near-textbook
realization of the technique. Re-read against the tree on 2026-09-29, one of the
two deviations recorded here on 2026-08-20 had been fixed by the project, one
stands, and the pass found three cells whose *content* had gone stale while the
structure stayed right.

## The four axes are the type

`ComplianceRegime` (`compliance-regimes.ts:19-34`) declares exactly the four
axes, each with a doc comment stating what it is for:

- `dataLaw` — "the data-protection law candidate PII is processed under";
- `oversightBasis` — "the legal hook for the human-in-the-loop /
  no-solely-automated-decision guarantee the app already enforces (screen-wave
  approval, human decisions)";
- `antiDiscrimination` — "the equal-opportunity / anti-discrimination framework
  the jurisdiction assesses hiring against";
- `adverseImpactStandard: string | null` — "the named statutory adverse-impact
  test, where the jurisdiction has a fixed one".

Seven rows fill it (`compliance-regimes.ts:16`, `:39-89`): `eu`, `uk`, `us`,
`sg`, `in`, `ae`, `global`. The row set is keyed by a `RegimeId` union derived
from a `REGIME_IDS` tuple, so nothing keys off a display string — the stable
identifier discipline is enforced by the type system rather than by convention.

## The null column, confirmed

`adverseImpactStandard` is non-null in exactly one of seven rows: `us`
(`compliance-regimes.ts:59`). Every other row is `null`, and the field's own
comment says why — "null where there is no single codified ratio — the
`computeAdverseImpact` primitive still applies, but no jurisdiction-specific
threshold is asserted." A test pins it: `compliance-regimes.test.ts` fails if
any second row acquires a standard, with the message "must not invent a
statutory ratio". The measurement stays available (`app/_lib/adverse-impact.ts`
holds the four-fifths primitive with a small-cohort floor); only the *assertion*
is withheld from a jurisdiction that has not set one.

## Purity of the module, confirmed

The file has zero imports, and its header says why: the module "imports nothing
and is safe in the browser bundle, on the server, and under `node --test`." That
is what lets one set of rows feed a client-rendered candidate disclosure
(`app/_components/AiDisclosure.tsx`), a server resolver
(`app/_lib/compliance-disclosure.ts`), a gated route
(`app/api/compliance/route.ts`) and the recruiter Decisions card without any of
them growing a private copy. Proper nouns stay untranslated for the same reason
(`compliance-regimes.ts:12-14`): a candidate can look up "GDPR Art. 22" and
cannot look up a translated approximation of it.

## The `global` row

`compliance-regimes.ts:82-88` is the neutral row: "applicable local
data-protection law", "human-in-the-loop review (no solely-automated adverse
decision)", "applicable equal-opportunity law". It exists and is correct. It is
still not the fallback; see the deviation below.

## Deviation that stands: the coercion target

`normalizeRegimeId` (`:113`) coerces any unknown, stale or hand-edited value to
`DEFAULT_REGIME_ID`, and that constant is still `"eu"` (`:93`). A unit test
pins it ("defaults everything else to the EU regime"), and the gated route's
comment says a stale row "must land on the EU default". What changed since
2026-08-20 is the *reach*, not the rule: the candidate surfaces no longer depend
on the fallback, because the regime is resolved server-side from the caller's own
tenant and handed down as props (commit `7a6e09e2c`, 2026-09-08; see the tenant
application). `AiDisclosure.tsx:44` now says of the EU default that "on a
candidate surface it should now be unreachable". The one remaining way to reach
it is the server resolver's own failure path, which logs the workspace and the
fallback it chose (`compliance-disclosure.ts:40-45`).

The standard is unchanged: a fallback that is reachable at all should be the
neutral row, and pointing `DEFAULT_REGIME_ID` at `global` is still a one-line
change plus one test constant. The disclosure component records the reason for
the choice ("the shipped behavior and the majority tenant", `AiDisclosure.tsx:44`),
which is exactly the reasonable-sounding disguise the technique warns about, now
with a smaller blast radius.

## Deviation closed: the moved date

On 2026-08-20 the register pinned the EU high-risk date at 2 August 2026 and the
project's urgency reasoning ran from it. It is fixed. `trust-posture.ts:51-54`
now carries `appliesFrom: "2 December 2027"`, names the amending act in
`deferredBy` (Regulation (EU) 2026/1744, in force 27 July 2026), and adds an
`inForceNow` field for the parts that did not move (Art. 5, Art. 50, Art. 4). The
comment above it records how it was checked: "against the Commission's own page,
not against a summary", and admits the page "said the old date for six weeks
after it moved". That is the technique's step 7 done with a stated method. This
pass re-verified the same facts against the Regulation's own text
(Art. 113(3)(c): Annex III on 2 December 2027, Annex I on 2 August 2028).

**Still open on the same axis:** the catalog module itself carries no as-of date
or review cadence. The dated claims live in `trust-posture.ts`; the rows in
`compliance-regimes.ts` have nothing that tells a reader when they were last
checked, which is how the three cells below aged without anything flagging them.

## Found and fixed in this pass: cells that were structurally right and factually stale

The structure held; the content of four strings had moved under it. Each is the
same defect the golden path warns about from a different angle: a hook cell
naming something that is no longer the hook.

- `uk.oversightBasis` read "UK GDPR Art. 22". The Data (Use and Access) Act 2025
  replaced it with Arts. 22A-22D from 5 February 2026 (SI 2026/82, reg. 2). The
  hook also changed character: from a general restriction to safeguards for
  significant decisions, tightened only where special-category data is involved.
- `us.oversightBasis` read "EEOC guidance on automated employment-decision
  tools". The agency withdrew that material in January 2025. It was guidance,
  never a hook; the duty is the employer's under Title VII and the ADA. This is
  the golden path's rule (withdrawn guidance changes the guidance column, never
  the framework column) violated in the other direction: guidance standing in for
  the framework. `us.antiDiscrimination` also named OFCCP for federal
  contractors without qualification; its Executive Order 11246 authority was
  revoked in January 2025 and what remains is Section 503 and VEVRAA.
- `eu.oversightBasis` cited Art. 14, which is the *provider's* design duty. The
  recruiter reading the Decisions card is a deployer, whose oversight duty is
  Art. 26(2). This is the provider-versus-deployer split applied to a one-word
  cell.
- `us.adverseImpactStandard` said "Four-fifths (80%) rule". The instrument
  (29 CFR 1607.4(D)) calls it a benchmark agencies "generally" regard as evidence
  of adverse impact, and in 2026 the federal government moved to rescind the
  guideline's interpretive parts while the text stayed in the CFR.

All four are corrected (kp `b5e92b033`, 2026-09-29), and `compliance-regimes.test.ts`
passes 4/4 unchanged, because it pins the null pattern and a
`/four-fifths|80%/i` match rather than the prose.

**Owed, not done:** the Decisions card sentence `ceiling1` still says
"Statutory protected-class adverse-impact monitoring ({standard})" in every
locale. With the standard now worded as a benchmark, "statutory" over-reads it,
and the fix is copy across the message files rather than a catalog edit. Two
rows were left alone because this pass could not verify them from a primary
source: `in` ("DPDP Act (notice + consent)"), whose main duties are reported to
phase in from about May 2027, and `ae`, whose executive regulations were
unconfirmed.
