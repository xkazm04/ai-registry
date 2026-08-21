---
layer: application
type: application
subject: multi-jurisdiction-hiring-compliance
technique: gap-register-with-owner-and-effort
stack: process
status: forged
verified_on: 2026-08-20
---

# Process: the conformity pack, its public projection, and G1–G14

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

`trust-posture.ts:5-11`: "Competitors publish 'EU AI Act compliant' as a badge.
A badge is unfalsifiable, and a procurement reviewer knows it. … A page that
admits three gaps is worth more to a serious buyer than one that admits none,
and it is the only version we can defend when they ask for evidence."

Three postures, not two: `type Posture = "enforced" | "partial" | "not_yet"`
(`trust-posture.ts:19`), with `gap?: string` "stated plainly when the posture is
not 'enforced'" (`:28-29`). The row keys on `article` — "the article, not a
marketing label" (`:22`).

## Classification and the refused derogation

`trust-posture.ts` `CLASSIFICATION` (`:32-42`) puts the hardest facts at the
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

`CLASSIFICATION.providerRole` (`trust-posture.ts:40`) states all three cases in
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

The same table's legend: "Effort: S ≤ 1 day · M ≤ 1 week · L longer." Fourteen
rows sort by it. G14 (registration and declaration-of-conformity scaffolding) is
`L` and explicitly deferred — "Premature before G1/G2; keep on the E-track" —
which is the register being used as a plan rather than as an inventory. The
verdict section then does the sorting out loud: "With the 2026-08-02
applicability date now days away, **G1 and G2 are the sequencing priority**."

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

`trust-posture.ts:138-141`: "The disclaimer is not boilerplate — the internal
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

## Currency deviation

Both artifacts pin the high-risk applicability date at 2 August 2026
(`trust-posture.ts` `CLASSIFICATION.appliesFrom`; `ai-act-conformity.md` "Clock"
section). As of mid-2026 the 2026 digital-omnibus package defers the Annex III
high-risk obligations to 2 December 2027. Neither the sequencing conclusion nor
any gap changes — the duties are identical and G1/G2 remain the priority — but
the stated urgency is wrong, and it is stated to buyers. The register needs the
as-of date and review cadence the catalog technique requires; a compliance
artifact re-verified once, three days before a deadline that has since moved,
is precisely the artifact that goes stale unnoticed.
