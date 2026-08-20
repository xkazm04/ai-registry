---
layer: application
type: application
subject: regulated-credential-gating
technique: credential-cue-catalog-per-role-family
stack: process
---

# The regulated-licence spec table

`_LICENCE_SPECS` (`pipeline/jobfit/credentials.py:34-49`) is the catalog. Nine entries,
each a triple of *(requisition cue, human label, candidate-name cues)*, spanning several
professions: clinical registration, two securities-registration series, a site-safety
card, professional engineering, accountancy, bar admission, commercial driving, and
medical board certification. The header states the selection rule the standard asks for:
"Regulated hard-gate licences … **Conservative — only licences that are genuine
blockers.**"

## Two cue sets, deliberately different

Each entry carries a requisition-side pattern and a *separate* tuple of candidate-side
patterns, because the two sides are written differently. The requisition says
"RN license required" or "registered nurse"; the candidate writes `RN` after their
name or "Registered Nurse license". Bar admission needs three candidate phrasings
("bar admission", "member of the bar", "admitted to the bar") against one requisition
cue. Professional engineering matches `\bP\.?E\.?\b` on the candidate side — punctuation
optional — but requires the spelled-out form or "PE license" on the requisition side,
because two bare letters in a job ad are not a licence demand.

Both sides compile case-insensitively at import, and both use word boundaries: an entry
matched as a substring would fire the securities gate on any string containing "cpa".

The dual-cue design has a consequence the code handles explicitly — one licence can
match a candidate credential under two of its own name cues, so `credential_checks`
de-duplicates findings while preserving order (`credentials.py:132-139`) rather than
showing a recruiter the same gap twice.

## The regulated flag is membership, not a field

The catalog does not carry a boolean; **membership in `_LICENCE_SPECS` is the regulated
flag**. Ordinary certifications are captured by the extraction schema
(`models.py:16-24`, `kind: license | certification`) and simply never appear in the
table, which is why `test_non_regulated_cert_with_past_date_is_not_flagged`
(`tests/test_credentials.py:31-36`) passes: a cloud certification dated 2021 on a cloud
engineering role produces no finding at all, with the test comment stating the reason —
"bounding the expiry check to regulated licences keeps this from being noise."

## Where the repo falls short of the standard

- **No jurisdiction on any entry.** Every spec is a name pattern. A clinical
  registration granted anywhere satisfies a requisition anywhere; a candidate licensed
  in a neighbouring jurisdiction is matched as held rather than raised as a reciprocity
  question. The securities and engineering entries are jurisdiction-bound regimes
  modelled as bare abbreviations, which is the standard's meaning-does-not-live-in-a-
  label failure in the catalog itself.
- **No issuing body and no verification route.** Nothing in an entry says which register
  answers the question, so a recruiter handed "verify before advancing" is not told where
  to verify. The standard treats an entry with no verification route as not yet ready to
  be marked regulated.
- **No renewal cycle and no expires flag**, so a regulated credential captured with an
  empty date is indistinguishable from one that genuinely never expires:
  `test_required_licence_held_is_not_flagged` passes a clinical registration with
  `"expiry": ""` and expects silence.
- **Corroboration is not required for short abbreviations.** `\bCDL\b`, `\bCPA\b` and
  `\bRN\b` match on the token alone, with no requirement that a nearby date, issuer,
  identifier or role family agree. On a multilingual corpus — the pipeline explicitly
  handles Czech and English CVs (`gemini.py`) — short Latin-letter tokens collide
  readily, and a false positive here fabricates a credential the candidate never claimed.
- **The catalog is code, not reviewed configuration.** Comparable taxonomies in the same
  pipeline live in data (`matching.py:284-286` points language aliases at
  `data/taxonomy.json` — "config, not code") specifically so they can be extended without
  a code change. The regulated set — the one list in the system that decides who gets
  blocked — is the one that did not get that treatment, and it carries no ownership or
  regime citation per entry.

## What generalizes

The two-cue-sets-per-entry shape is the transportable idea, and it is easy to get wrong
by symmetry: requisition prose and candidate prose describe the same credential with
different vocabularies and different risk profiles, so a single pattern list either
over-matches ads or under-matches profiles. Splitting them lets the requisition side stay
strict — where a false positive invents a legal requirement — while the candidate side
stays generous, where a false negative invents a gap.
