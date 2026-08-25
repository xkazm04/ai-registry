---
layer: application
type: application
subject: czech
technique: de-anglicization-constructions
stack: process
status: forged
verified_on: 2026-08-24
---

# Process · The anchored construction set in a live review loop (kp)

How one real product runs the CS-* construction anchors inside a three-pass
translation workflow, and what the mechanism produced. Verified against the
working tree on 2026-08-24.

## The artifacts

- `C:\Users\kazda\kiro\kp\docs\i18n\constructions-cs.md` — the origin of this
  subject's construction rule set: ~25 rules with IDs, each in
  trigger/rule/source/exception shape, provenance cited per rule to the
  Microsoft Czech Style Guide (`ces-cze-StyleGuide.pdf`, section numbers per
  row). Every ✗/✓ pair there is a real string from kp's `messages/cs.json`
  with kp's own rewrite — e.g. CS-NOM demonstrated on
  `decisions.summary.summaryNote`, CS-CALQUE on `landing.features.heading`
  ("trychtýř" → "nábor").
- `C:\Users\kazda\kiro\kp\docs\i18n\style-cs.md` — the voice guide the rules
  interlock with (register, percent spacing, progress-label voice).
- `C:\Users\kazda\kiro\kp\docs\i18n\review-cs.md` — the native-review queue
  where findings that need a house/native decision wait, each citing the key,
  MQM severity, and the rule at issue.

## The loop the anchors serve

kp's `/i18n-translate` workflow: Pass A (draft) walks the trigger column
after writing each string; Pass B (typed audit) may only report findings
that cite an anchor — the error record shape is
`landing.features.heading · "trychtýř" · style · major · CS-CALQUE · → "nábor"`;
Pass C (gated refine) rewrites only what a finding flagged, findings citing
a construction ID defaulting to major. The design consequence: before this
file existed, grammatical-but-English-shaped strings audited *clean*,
because no anchor covered them.

## The compounding mechanism, observed working

The 2026-08 full-catalog sweep (4 846 keys, 455 fixed) had audit agents
propose a new row whenever a real defect had no ID to cite. Eleven rules were
minted that way in one wave — CS-GENDER through CS-HADDONE — each accepted
because it named a failure the existing rules provably missed (CS-PREP's
justification in the file explicitly walks why CS-CALQUE, CS-NOM, and the
glossary all fail to catch "v nástěnce"). One review session paid for the
other ~5 800 strings.

## Incidents worth stealing

- **The dash count** (CS-DASH): kp's Czech landing carried 42 em dashes
  against English's 39 — found not by review but by *comparing dash counts
  across locales*; the same defect surfaced in German and French the same
  day. Character-level calques need frequency diffs, not readers.
- **The house overrule** (CS-FORMAL): Microsoft's guide prefers *moct*; kp
  recorded a 2026-08 house decision that *moci/mohou* stands catalog-wide
  (B2B register, ToS and decline letters, and the catalog already at 10×
  *mohou* / 0× *můžou*). The ruling lives as a REJECTED row inside the rule
  itself, so no later run re-litigates it — the general mechanism this
  bundle teaches; the specific ruling stays kp's.
- **The counted correction** (CS-FORMAL table): the guide-derived
  replacement *nepovedlo se* occurred 0 times in the catalog against
  *nepodařilo* 165; the row was corrected to the catalog's form before
  enforcement — the authority-is-a-hypothesis law executed in miniature.
- **The settled contradiction** (CS-PROG): the rule banned *Probíhá…*, the
  style guide endorsed it, and an auditor could cite neither; resolved as a
  three-row situation table now generalized into this subject's
  ui-conventions technique.
- **The deferred coordinated rewrite** (CS-HADDONE): ~13 `pipeline.events.*`
  keys share the *mít*+participle shape and are marked deferred in the rule
  itself pending one coordinated rewrite plus a check of how
  `comms-dispatch`-side code concatenates `{name}` — a rule can carry its
  own backlog honestly instead of pretending the sweep finished.
