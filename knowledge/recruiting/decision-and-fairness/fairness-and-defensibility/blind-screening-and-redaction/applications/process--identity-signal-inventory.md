---
layer: application
type: application
subject: blind-screening-and-redaction
technique: identity-signal-inventory
stack: process
verified_on: 2026-08-20
---

# The redaction pre-pass as a written inventory (Python pipeline)

`pipeline/jobfit/redact.py` is a pure, deterministic pre-pass that masks identity
from the extracted CV text before any of it reaches the model. Its module
docstring (`:1-14`) *is* the inventory: name, contact details (email / phone /
profile links), gender-coded pronouns and titles, explicit age and birth-year
markers — plus one entry with a non-pattern mechanism, stated explicitly: "the
candidate's PHOTO is removed implicitly: blind mode sends the redacted TEXT to
the model instead of uploading the original file." That is channel substitution
named in the inventory, exactly where it belongs.

The docstring is also honest about the instrument's grade: "Best-effort by
design — it reduces, not eliminates, identity leakage — which is why blind mode
records WHAT it redacted as a sanity-check note the recruiter can see." The
manifest exists because the mask is imperfect, not despite it.

## The categories, as contracts

`redact_pii` (`:127-174`) returns a `RedactResult` carrying `text`, `categories`,
`detected_name` and `name_detected`. `categories` is appended to only when a
pattern actually fired (`:146-155`, `:158-168`), so the list is a per-document
manifest rather than a static policy echo — the recruiter note in
`pipeline/jobfit/pipeline.py:150-152` renders it verbatim.

`pipeline/jobfit/tests/test_redact.py` pins both halves. Removal:
`test_masks_name_email_phone_links` (`:19-31`) and
`test_masks_gendered_terms_and_age` (`:33-43`) assert the categories *and* the
placeholders. Preservation, in the same tests: `payments team` and `5 years`
survive the gendered/age pass (`:37-40`), and `test_keeps_skills_and_substance`
(`:45-48`) pins the skill vocabulary. `test_no_pii_is_a_clean_passthrough`
(`:50-55`) pins the null case — a clean document comes back byte-identical with
an empty manifest, which is what makes an implausible manifest legible later.

## The explicit fail-open flag

`name_detected` (`:118-125`) is documented as deliberately redundant: "Equivalent
to `detected_name is not None` / `'name' in categories`, surfaced as its own flag
so the fail-open case can't be missed." `test_name_detected_flag_tracks_the_name_category`
(`:57-70`) pins both directions, using a single-token name that slips past the
2–4-token heuristic — an undetected name must set `name_detected=False` so the
caller can refuse to claim "identity redacted".

## Where the standard is not met

- **Tier 3 is absent.** Institution names, neighbourhood, nationality, marital
  status and graduation years are not masked at all, and there is no per-role
  masking policy — `blind` is one boolean on `analyze_cv`
  (`pipeline/jobfit/pipeline.py:104`) with no per-requisition owner or setting.
- **No removed-share metric.** The manifest carries category names but no counts
  and no retained-substance ratio, so over-masking has no detector; the internal
  `gendered_hits` counter (`redact.py:159-167`) is used only as a boolean.
- **Language coverage is fixed at two.** The patterns are English and Czech by
  construction (`:29-53`); a document in a third language is masked with the
  wrong vocabulary rather than escalated.
