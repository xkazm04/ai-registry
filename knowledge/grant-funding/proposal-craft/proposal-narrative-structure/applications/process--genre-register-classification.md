---
layer: application
type: application
subject: proposal-narrative-structure
technique: genre-register-classification
stack: process
status: forged
verified_on: 2026-08-19
---

# Process: genre-register classification in a prompt-pipeline drafting assistant

How a grant-drafting product (repo `grant-writing-nonprofits`, Gemini-backed)
realizes genre classification and per-genre narrative registers as a pure
prompt pipeline.

## The classifier

`src/features/ai-gemini/genre.ts:26-64` is a pure, conservative regex
classifier over signals already on the draft input — funder name, RFP text,
org mission keywords — returning one of `foundation | federal | advocacy |
arts`. The design decisions match the technique's discipline exactly:

- **Conservative default.** The header comment (genre.ts:6-9) states the
  bias: default `foundation`, switch "only when the signal is distinctive,
  so a plain youth/education foundation grant is unaffected". The rationale
  is a UAT finding (P1-1): a single foundation template misfit federal,
  advocacy and arts personas.
- **Guarded tokens.** genre.ts:19-25 documents the guards: `\b` on short
  tokens so "smart" doesn't match arts' `art` and "copyrights" doesn't
  match `rights`; the organizing marker requires verb morphology
  `/\borganiz(e|ing|er)\b/` so foundation-boilerplate "community
  organization(s)" cannot misroute a service grant into the advocacy
  register.
- **Cost-ordered precedence** (genre.ts:59-63): federal → advocacy → arts →
  foundation — compliance-bearing first, eligibility-sensitive framing
  second.
- **The legal-category exception.** The FEDERAL signal list (genre.ts:26-33)
  deliberately excludes the national arts/library endowments (NEA/IMLS):
  "an arts org applying to the NEA is better served by the arts narrative
  shape than a rigid rubric" (genre.ts:23-25). Classification by how the
  panel reads, not by the funder's legal category.

## The per-genre registers

`src/features/ai-gemini/prompts.ts:44-75` (`NARRATIVE_GUIDANCE`) carries the
four registers verbatim as prompt guidance:

- **foundation** — ~400-600 words, "problem and population served" opening,
  specific model "not generic 'we provide programming'", evidence base,
  close on "what this funder's dollars unlock specifically".
- **federal** — ~700-1000 words "organized to a FEDERAL reviewer's scoring
  rubric" with labeled NEED / APPROACH / CAPACITY / EVALUATION parts,
  mirroring the NOFO's criteria and "the funder's own terminology".
- **advocacy** — ~400-600 words "framed as a THEORY OF CHANGE, not service
  delivery… advocacy funders fund power and change, not headcount", with a
  lobbying-claims guard.
- **arts** — ~400-600 words foregrounding "ARTISTIC VISION… arts reviewers
  reject boilerplate".

Every variant string-concatenates the shared `ANTI_FAB` clause
(prompts.ts:36-39). Genre also reshapes the logic model: advocacy swaps
INPUTS/ACTIVITIES/OUTPUTS/OUTCOMES for INPUTS/STRATEGIES/MILESTONES/CHANGE
(prompts.ts:92-100), and appends a one-line genre orientation to the opening
instruction (`GENRE_FRAMING`, prompts.ts:103-111).

## The orthogonal voice axis

`src/features/ai-gemini/segment.ts:65-85` implements applicant-segment voice
independently of funder genre: `SEGMENT_PERSONA` picks the persona clause
("a university or school's application", "a government or municipal
applicant's proposal"…), and `SEGMENT_VOICE` supplies the fallback register
per segment. The fallback is conditional exactly as the technique requires:
prompts.ts:138-148 uses the org's own mission statement as the voice
instruction only when one exists — "with none, exhorting it to match absent
materials is an empty instruction that yields generic prose".

## Assembly

`buildDraftSectionPrompt` (prompts.ts:123-198) assembles in a fixed order:
persona + voice + genre framing → ORG block → GRANT block → delimited
untrusted RFP text → funder-DNA / verified-facts / requirements / exemplar
blocks → capped prior-section context (1,500 chars each, prompts.ts:20-27) →
the genre-resolved TASK guidance → output-hygiene rules. The RFP enters as
delimited untrusted data (`<<<RFP_TEXT>>>`, sanitized against forged
delimiters, prompts.ts:15-19) — informing the register, never rewriting the
task.
