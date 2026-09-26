---
layer: application
type: application
subject: blind-screening-and-redaction
technique: identity-signal-inventory
stack: process
verified_on: 2026-09-26
---

# The redaction pre-pass as a written inventory (Python pipeline)

`pipeline/jobfit/redact.py` is a pure, deterministic pre-pass that masks identity
from the extracted CV text before any of it reaches the model. Its module
docstring (`:1-15`) *is* the inventory: name, contact details (email / phone /
profile links), gender-coded pronouns and titles, explicit age and birth-year
markers. It also has one entry with a non-pattern mechanism, stated explicitly:
"the candidate's PHOTO is removed implicitly: blind mode sends the redacted TEXT
to the model instead of uploading the original file." That is channel
substitution named in the inventory, exactly where it belongs.

The docstring is also honest about the instrument's grade: "Best-effort by
design — it reduces, not eliminates, identity leakage — which is why blind mode
records WHAT it redacted as a sanity-check note the recruiter can see." The
manifest exists because the mask is imperfect, not despite it.

## The categories, as contracts

`redact_pii` (`:269`) returns a `RedactResult` carrying `text`, `categories`,
`detected_name` and `name_detected`. `categories` is appended to only when a
pattern actually fired (`categories.append("name")` at `:300`, the subn loop and
`gendered_hits` at `:317`). The list is therefore a per-document manifest, not a
static policy echo, and the recruiter note in `pipeline/jobfit/pipeline.py:188-199`
renders it verbatim.

`pipeline/jobfit/tests/test_redact.py` pins both halves. Removal:
`test_masks_name_email_phone_links` and `test_masks_gendered_terms_and_age`
assert the categories *and* the placeholders. Preservation, in the same tests:
`payments team` and `5 years` survive the gendered/age pass, and
`test_keeps_skills_and_substance` pins the skill vocabulary.
`test_no_pii_is_a_clean_passthrough` pins the null case. A clean document comes
back byte-identical with an empty manifest, which is what makes an implausible
manifest legible later.

## The explicit fail-open flag, and the door it did not cover

`name_detected` (`:261-266`) is documented as deliberately redundant: "surfaced
as its own flag so the fail-open case can't be missed."
`test_name_detected_flag_tracks_the_name_category` pins both directions, using a
single-token name that slips past the 2-4-token heuristic.

The flag's limit showed up two days after this application was first written.
Commit `10864715c` (2026-08-22) records the defect. A CV that opens with a
section header ("Osobní údaje", "Personal Details", "Persönliche Daten") had the
*header* returned as `detected_name`, so `name_detected` was true. The pipeline
printed "Blind screening active — identity redacted" while the real name on line
2 reached the model and the header was re-attached as the candidate's name. The
fix is a four-locale `_TITLE_WORDS` stop-list and title stripping (`Ing.`,
`Mgr.`, trailing `MBA`/`Ph.D.`). `test_header_is_skipped_and_the_real_name_below_is_redacted`
and its neighbours pin false detections next to the missed ones.

## Identity twins

The same commit fixed two more defects, and each was a mask that depended on
the candidate: the feminine birth participle, and the given name that is a
month. The suite that pins that class, and its measured A and B, is in the
identity-twin application.

## Where the standard is not met

- **Tier 3 is absent.** Institution names, neighbourhood, nationality, marital
  status and graduation years are not masked at all, and there is no per-role
  masking policy. `blind` is one boolean on `analyze_cv`
  (`pipeline/jobfit/pipeline.py:133`) with no per-requisition owner or setting.
- **No removed-share metric.** The manifest carries category names but no counts
  and no retained-substance ratio, so over-masking has no detector. The internal
  `gendered_hits` counter is used only as a boolean.
- **Language coverage is uneven.** The header stop-list spans English, Czech,
  German and French. The pronoun, honorific and age patterns are English and
  Czech only (`:36-61`), so a German or French document gets its header skipped
  correctly and its gendered terms left in place, without escalation.
