---
layer: application
type: application
subject: cv-authenticity-screening
technique: a-screen-is-not-a-verdict
stack: process
status: forged
verified_on: 2026-08-20
---

# The authenticity screen as a trust-ledger contributor (Python pipeline)

`pipeline/jobfit/authenticity.py` is a pure, deterministic, network-free module
(`:13-15`) whose entire output is *sentences appended to a shared sanity-check
ledger*. It computes nothing that routes anything. The module docstring states
the posture in the standard's own words: "It is a SCREEN, not a verdict — every
finding is phrased 'verify…', human-confirmed" (`:14-15`).

## The cost-asymmetry rule, stated in the code

The rule that sets every threshold in the module is written into
`prompt_injection_checks`'s docstring (`authenticity.py:143-144`):

> NEVER drops the CV: detection only raises a flag; scoring proceeds on the
> flagged analysis so **a false positive costs a review note, not a lost
> candidate**.

The screen-level comment above it makes the same argument for why detection is
worth doing at all despite being defeatable — "An LLM cannot be made immune to
this. What a deterministic pass CAN do is DETECT the attempt over the raw CV
text and raise a manual-review flag so the result is never silently trusted. A
SCREEN, not a verdict — the CV is never dropped" (`:70-78`). Both halves of the
asymmetry are present: the screen is permitted to be sensitive precisely because
it is forbidden to act.

`pipeline/jobfit/pipeline.py:307-313` is where the non-action is realized:
`authenticity_checks(...)` is `+=`-ed onto `sanity_checks` between the score
sanity checks and the credential gate. No branch reads its result. The analysis
is assembled and returned regardless — `test_pipeline.py:126` asserts exactly
this on an injected maxed payload ("never dropped — a full analysis still
returns").

## Flags name a probe, not a person

Every constant in the module (`:35-38`) is a review instruction:

- `"Authenticity: heavy generic/buzzword phrasing — verify concrete specifics in interview (manual review)."`
- `"Authenticity: skill list is large relative to the CV's detail — confirm real depth (manual review)."`
- `"Authenticity: stated experience exceeds a plausible career span — re-check the dates (manual review)."`
- `"Authenticity: very few concrete dates or metrics — claims are hard to verify (manual review)."`

None asserts dishonesty; each converts the observation into an interview
question. The `(manual review)` suffix is load-bearing — it is the convention the
downstream classifier keys on to route the line into `review_flags` (`:33-34`),
which is the only thing a flag is allowed to do.

## Clean-run asymmetry between the two families

`authenticity_checks` returns `[_CLEAN]` — "Authenticity checks passed — language
reads specific and concrete" — when nothing fires (`:39`, `:67`), so a positive
statement exists for a run where the checks genuinely ran.
`prompt_injection_checks` returns `[]` on clean text (`:142`, asserted at
`test_pipeline.py:84-89`): the security screen says nothing rather than implying
an all-clear it cannot support. The repo arrived at the standard's distinction
independently.

## Deviations

- **The band is a composite.** `authenticity_band` (`:185-192`) collapses the
  warn count into `high | medium | low`. It is display-only and derived purely by
  counting `(manual review)` lines whose text remains visible beneath it, which
  satisfies the standard's narrow allowance — but it is one product decision away
  from becoming a sortable authenticity score, which the standard forbids. The
  guard that it must drive no routing is a convention here, not an enforced one.
- **Authorship framed as risk.** The module header describes its job as flagging
  "fabrication / AI-generation risk" and calls buzzword density "the signature of
  templated / AI-generated padding" (`:3-11`, `:23-24`); `pipeline.py:308-310`
  repeats it as "fabrication / AI-padding signals". The standard holds that
  machine drafting is not a finding. The *measurements* are sound and the *user-
  facing strings* say nothing about authorship — only the internal framing
  deviates, which is exactly how this failure spreads.
- **Untyped flags.** Findings are free-text sentences discriminated by a string
  prefix (`AUTHENTICITY_PREFIX`, `INJECTION_PREFIX`, `:134`, `:182`) and by the
  substring `"manual review"`. Meaning lives in a display string, so a rewording
  for clarity silently changes routing. The standard's typed flag with an
  enumerated trigger and a quoted fragment is not realized here — and the flags
  carry no evidence span, so a reviewer cannot see *which* phrases fired without
  re-reading the document.
- **No denominator on the buzzword count.** `buzz_hits >= 4` (`:49-50`) is
  absolute; a long, legitimately effusive document trips it as easily as a short
  padded one. The neighbouring checks do carry denominators — the specificity
  check gates on `len(text) >= 1500` (`:55`) and the skill-stuffing check on
  `skills_count >= 25 and len(text) < 1500` (`:59`) — so the sample-floor
  discipline exists in the module and is simply missing from one check.
