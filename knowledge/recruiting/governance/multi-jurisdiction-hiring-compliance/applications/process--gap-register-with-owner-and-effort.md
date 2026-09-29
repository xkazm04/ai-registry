---
layer: application
type: application
subject: multi-jurisdiction-hiring-compliance
technique: gap-register-with-owner-and-effort
stack: process
status: forged
verified_on: 2026-09-29
applied: code
ab_verdict: better
---

# Process: the conformity pack, its public projection, and G1–G23

`docs/features/compliance/ai-act-conformity.md` is the internal register;
`app/_lib/trust-posture.ts` is its public projection, rendered at `/trust`. The
pair is the technique's "one register, one projection" rule realized, and the
split is deliberate: the module's header says the pack is "Source of truth" and
this module "carries the PUBLIC projection: the posture and the plain-English
summary, never the internal evidence paths or the gap ids."

Columns are dropped. Rows are not. That is exactly the distinction the technique
draws, and it was an upward lesson — the draft said "publish the register
whole", which is right about rows and needlessly absolutist about evidence
pointers.

## Why the page admits gaps

`trust-posture.ts:6-11`: "Competitors publish 'EU AI Act compliant' as a badge.
A badge is unfalsifiable, and a procurement reviewer knows it. … A page that
admits three gaps is worth more to a serious buyer than one that admits none,
and it is the only version we can defend when they ask for evidence."

Three postures, not two: `type Posture = "enforced" | "partial" | "not_yet"`
(`trust-posture.ts:19`), with `gap?: string` "stated plainly when the posture is
not 'enforced'" (`:29`). The row keys on `article` — "the article, not a
marketing label" (`:22`).

## Classification and the refused derogation

`trust-posture.ts` `CLASSIFICATION` (`:34-56`) puts the hardest facts at the
top, which is the technique's rule about not burying the risk tier:

- `annex`: "Annex III, point 4 (employment, workers management, access to
  self-employment)";
- `conclusion`: "KandiDate is a high-risk AI system.";
- `derogation`: "The Art. 6(3) derogation for narrow procedural or preparatory
  tasks does not apply: the score is designed to shape advance and reject
  outcomes." The comment above it is the reasoning the technique asks for —
  "Art. 6(3)'s 'narrow procedural task' derogation is the standard escape hatch.
  Saying out loud that it does not apply is a stronger signal than any badge."

The derogation is assessed against what the system does to a candidate's
progression, not against how the feature is described. That is the rule in
`provider-versus-deployer-duties`, applied.

## The role split, carried as a column

`CLASSIFICATION.providerRole` (`trust-posture.ts:41`) states all three cases in
one sentence: "The KandiDate vendor is the provider (Art. 16). A customer
running KandiDate on their candidates is a deployer (Art. 26). A self-hosted
install that substantially modifies the system makes that customer a provider
too."

The register's gap table (`ai-act-conformity.md` §3) carries a **By** column
whose values are `Provider`, `Deployer` or `Both` — G6 (log retention) is
`Both`, G9 (candidate explanation of an individual decision) is `Both`, the rest
are `Provider`. This is the technique's two-part owner: the regulatory role that
owes the duty, preserved per row rather than averaged into a single status.

## Effort bands

The same table's legend: "Effort: S ≤ 1 day · M ≤ 1 week · L longer." Twenty-three
rows sort by it (G1–G14 as first written, G15–G23 added as the pack was re-read
against the Act article by article). G14 (registration and declaration of
conformity) is the register used as a plan: on 2026-08-20 it was `L` and
deferred as "Premature before G1/G2"; after the date moved it reads "**Open — and
no longer 'premature'.** … 15 months is exactly the horizon on which one gets
planned, not deferred", and it records why the row got cheaper (internal-control
assessment under Art. 43, no notified body) and what it now depends on (G1, G2,
G17). The row's status was rewritten with its reasoning, not just its date.

Three bands, not five. This was an upward lesson: the draft proposed
days/weeks/quarter bands, and the repo's S/M/L over a single-day and single-week
boundary is coarser and arguably better — nobody negotiates the band instead of
closing the gap.

## Closed rows are kept

`~~G3~~`, `~~G11~~` and G12 remain in the table, struck through, each carrying
the evidence that closed it — G3 by
`pipeline/jobfit/tests/test_name_neutrality.py`, which "asserts byte-identity of
the deterministic scorer's output across Czech male/female(-ová)/Vietnamese/
Ukrainian/Arabic/Roma-associated name perturbations." G9 is the technique's
partial-close done properly: "**Partially closed** — `app/_lib/status-
decisions.ts` + `/status/[token]` now render a redacted per-decision explanation
(kind, attribution, reason, decisive facts for auto-rejects). Full sealed
dossier remains operator-only by design, not by gap." Which half is done, and
why the other half is not a gap.

## The disclaimer, single-sourced

`trust-posture.ts:443-446`: "The disclaimer is not boilerplate — the internal
pack carries the same sentence" — `DISCLAIMER = "This is an engineering
artifact, not legal advice, and not a claim of certified conformance. It
describes mechanisms that exist in the product today, and states plainly where
they do not yet exist."`

All three of the technique's required moves in one sentence: what it is, what it
is not (both denials), and what it actually describes. `ai-act-conformity.md`
carries the identical wording in its own header, and `compliance-regimes.ts:11`
carries the shorter form next to the catalog data — the disclaimer living at the
source, so no new consumer can render the instrument names without it.

## Recruiting residue from the readiness backlog

`docs/product/enterprise-readiness.md` §7 supplies four register rows this
subject specifically owns, all deployer-side and none discharged by a vendor
assurance:

- **E-GDPR-2** — a DPIA, described there as "mandatory for AI-assisted candidate
  evaluation", leaning on the AI-Act pack; human oversight at every gate is the
  stated mitigation.
- **E-GDPR-1** — DPA template plus a sub-processor register *and a change-
  notification process*. The notification half is the part products omit.
- **E-GDPR-3** — "Complete data-subject rights: access + **portability** export
  + rectification, alongside the existing erasure." The pattern the technique
  predicts: erasure ships, the other four do not.
- A 72-hour breach runbook and EU-pinned residency, both open.

## The moved date, handled

On 2026-08-20 both artifacts pinned the high-risk applicability date at
2 August 2026 and the pack's urgency ran from it ("now days away"). The date then
moved (Regulation (EU) 2026/1744, in force 27 July 2026: Annex III on
2 December 2027, Annex I on 2 August 2028), and the pack caught up on
2026-09-08. The way it did so is the part worth copying, and it is the technique's
step 10:

- The "Clock" paragraph names the amending act, says what moved, and follows with
  a table headed "What did not move, and therefore binds today": Art. 5
  prohibitions, Art. 50 transparency (the marking grace period for pre-existing
  systems ends 2 December 2026), and Art. 4 literacy. The public projection
  carries the same split as `inForceNow` (`trust-posture.ts:53`).
- It admits its own lag: "This pack asserted 2 August 2026 until 2026-09-08 and
  reasoned from its imminence; every such passage has been re-baselined." The
  verdict, the G14 row and the sequencing prose all changed, not only the date.
- The sequencing conclusion survived and is said to: G1 and G2 remain the inputs
  to everything else, so "the sequence is unchanged; what changed is that G14
  now has a date to work back from."

## Verification debt is marked where it occurs

The pack does not present carried claims as read ones. Where the Omnibus's exact
wording on SME conformity relief and QMS relief came from the project's
regulatory backlog and not from the Regulation, the Art. 43 row carries "⚠️ … has
**not** been read in primary form here", and the pack's closing section lists the
four claims it could not verify from the tree (that wording, a harmonised
standard's text and OJ status, a standardisation mandate's expiry, and a code of
practice's date and signatory count) with the rule that none reaches a customer
document "before a human opens the primary source". (This pass read the Regulation's text and found the
core of the pack right: dates, Art. 4, the untouched Art. 26 and Art. 86. It did
not resolve the four flagged items, which stay flagged.) Absence claims carry
their method the same way: the Art. 4 row says "verified 2026-09-08 by a full-text
search for 'AI literacy' across `app/`, `docs/` and `messages/` — six hits,
all of them either this pack, the backlog, or those two lines", and then draws the
line the technique draws: "Naming an obligation is not discharging it." The row
stays open (G23).

## What this pass could not confirm

The pack's "By" column marks Art. 86 explanation (G9) as `Both`. The Regulation
text shows Art. 86 was not amended, but it sits in Chapter IX, outside the
Chapter III sections whose date moved, so which date governs it is an inference,
not a reading. The register does not state a date for that row, and should not
until someone reads the applicability clause for Chapter IX.
