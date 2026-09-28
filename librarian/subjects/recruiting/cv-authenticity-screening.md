---
domain: recruiting
subject: cv-authenticity-screening
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
depth: L3
---

# cv-authenticity-screening

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-26 - `/deepen`, first pass (dp-cvas-0926)

Dispatched by the Curator lane on "single stack (process)". Four lanes: a re-read
of every citation in the one joined tree at its HEAD, a survey of that tree's
TypeScript reviewer surface, web counter-evidence (seven claims), and a blind
training-data lane.

**Counter-evidence: nothing refuted, four claims conditioned.**
- Origin detectors: the best 2025-26 detectors are accurate on unedited human
  prose, so the golden path's argument now rests on the input (lightly polished
  human text is flagged heavily, and no evaluation on career documents exists)
  and on off-target, which survives a perfect detector.
- Zero-width prevalence: "a large fraction" is unmeasured and became "whole
  classes of honest documents". The bidi marks called "mandatory" became
  "routine": markup and isolates are preferred.
- Anachronism check (tenure against a technology's age): practitioner lore with
  no evaluation. It was landed with its three conditions.
- "Cannot be made immune": holds. It is sharpened, because design-level
  guarantees constrain consequences, not judgment, and adaptive attacks break
  near-zero defences.

**Convergence.** The blind lane reached 11 of 12 rules independently, including
"flag a hidden run of content, never a code point". It also reached the
anachronism check, which the web lane corroborated with conditions. That is
the only new check earned.

**Landed** (b891e20f): a react application (second stack; the decision gate and
its one-way friction), a process application for hidden-text (code-applied,
before/after), golden-path and technique conditions (above), a field fact (the
measured hidden-content attack is mostly hidden keywords), and all three process
applications re-verified to 2026-09-26. The resolved deviations: typed flags, the
buzzword denominator, and a fence that can no longer be closed from inside. One
correction to the old text: "authorship framing stays internal" was wrong, since
the recruiter tooltip names it.

**Applied** (5 rows in [[applied]]): code better (hidden-character screen, kp
6bb2bfed0), experiment better (render-aware hidden text, n=5 constructed PDFs),
simulation better (fence every channel/mode, a prompt-described schema is only
an instruction), 2 unapplied (the origin-detector condition moves no decision;
the anachronism check has no seam).

## Impact

Map regenerated at registry b891e20f (kp 4c18f6be2). kp: 2 contexts join this
subject (`cv-analysis-api`, `cv-extraction`), both `unknown`, **0 stale
verdicts**. No other project joins it.

## Open leads

- **Acknowledgement gates must be symmetric.** In the joined tree an advance
  needs every open flag ticked (server-enforced), while a pass below the strong
  line needs nothing and a strong pass's reason is client-only, so the gate makes
  rejection the cheaper click for a flagged candidate. Single lane (one tree plus
  reasoning). Return: a second tree with a flag gate on a decision, or
  automation-bias literature on friction asymmetry, to earn a rule in
  a-screen-is-not-a-verdict.
- **Cross-application duplication** (the same document content or contact
  details under different applicant names) is named by a 2025 law-enforcement
  advisory as a document-level fraud indicator. It is an identity question: a
  proposal for candidate-identity-and-staleness, not this subject. Single lane
  (web). Return: when that subject is next deepened.
- **Neutralise-then-screen in the joined tree.** The CV path flags invisible
  content but passes it unchanged to the model. Return: when the CV extraction
  step is next touched (with the render-aware hidden-text check).

## Declines

- Stuffing-without-context as the replacement for density (blind lane): the
  density technique already localises repetition and uses the posting as the
  denominator; nothing new survived.
- Span-verification of every model claim (blind lane): owned by the
  career-reading neighbour's per-claim provenance, per this subject's Neighbours
  section.
- A number for how often honest documents carry format characters: none
  exists, and the subject states the mechanism instead.
