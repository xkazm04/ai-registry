---
layer: application
type: application
subject: cv-authenticity-screening
technique: a-screen-is-not-a-verdict
stack: process
status: forged
verified_on: 2026-09-26
---

# The authenticity screen as a trust-ledger contributor (Python pipeline)

`pipeline/jobfit/authenticity.py` is a pure, deterministic, network-free module
(`:13-15`) whose entire output is *findings appended to a shared sanity-check
ledger*. It computes nothing that routes anything. The module docstring states
the posture in the standard's own words: "It is a SCREEN, not a verdict — every
finding is phrased 'verify…', human-confirmed" (`:14-15`).

First read 2026-08-20; re-read 2026-09-26, with line numbers taken after that
day's hidden-character change (recorded in the hidden-text application). What
changed in between is under "Since the first reading".

## The cost-asymmetry rule, stated in the code

The rule that sets every threshold in the module is written into
`prompt_injection_checks`'s docstring (`authenticity.py:217-218`):

> NEVER drops the CV: detection only raises a flag; scoring proceeds on the
> flagged analysis so **a false positive costs a review note, not a lost
> candidate**.

The screen-level comment above it makes the same argument for why detection is
worth doing at all despite being defeatable — "An LLM cannot be made immune to
this. What a deterministic pass CAN do is DETECT the attempt over the raw CV
text and raise a manual-review flag so the result is never silently trusted. A
SCREEN, not a verdict — the CV is never dropped" (`:104-112`). Both halves of the
asymmetry are present: the screen is permitted to be sensitive precisely because
it is forbidden to act.

`pipeline/jobfit/pipeline.py:415-423` is where the non-action is realized:
`authenticity_checks(...)` is `+=`-ed onto `sanity_checks` between the score
sanity checks and the credential gate (`:429`), under a comment that ends
"never an auto-reject". No branch in the pipeline reads its result. The
analysis is assembled and returned regardless — `test_pipeline.py:150-151`
asserts exactly this on an injected maxed payload ("never dropped — a full
analysis still returns").

## Flags name a probe, not a person — and now carry a type

Every flag in the module (`:40-55`) is a review instruction:

- `"Authenticity: heavy generic/buzzword phrasing — verify concrete specifics in interview (manual review)."`
- `"Authenticity: skill list is large relative to the CV's detail — confirm real depth (manual review)."`
- `"Authenticity: stated experience exceeds a plausible career span — re-check the dates (manual review)."`
- `"Authenticity: very few concrete dates or metrics — claims are hard to verify (manual review)."`

None asserts dishonesty; each converts the observation into an interview
question. Each is also a coded `Finding` — a `str` subclass carrying `code`
(`authenticity_buzzwords`, `authenticity_skill_stuffing`,
`authenticity_implausible_years`, `authenticity_few_specifics`), `severity`
(`warn`) and `scope` (`authenticity`) (`pipeline/jobfit/trust.py:40-77`). The
review-flag count and the band read the severity and the scope, not the prose;
the `(manual review)` suffix survives only "so payloads read by the legacy TS
regex classify the same way" (`authenticity.py:37-39`). That is the standard's
typed flag, arrived at from a localization problem: the sentence is display, the
code is meaning.

Injection findings sit on a different scope (`input`) on purpose, so the
authenticity band does not move on an injection attempt — "two ledgers on
purpose" (`authenticity.py:186-187`).

## Clean-run asymmetry between the two families

`authenticity_checks` returns `[_CLEAN]` — "Authenticity checks passed — language
reads specific and concrete", coded `authenticity_clean`, severity `ok` (`:63-66`,
`:101`) — so a positive statement exists for a run where the checks genuinely
ran. `prompt_injection_checks` returns `[]` on clean text (`:227`, asserted at
`test_pipeline.py:104-108`): the security screen says nothing rather than
implying an all-clear it cannot support. The repo arrived at the standard's
distinction independently.

## Since the first reading (2026-08-20 -> 2026-09-26)

- **Resolved: untyped flags.** Recorded here as a deviation on 2026-08-20;
  the flags have been coded at birth since 2026-09-23.
- **Resolved: no denominator on the buzzword count.** The bare `buzz_hits >= 4`
  became a floor plus a rate (`_BUZZWORD_MIN_HITS = 4`, `_BUZZWORD_PER_1K = 1.5`,
  `:56-61`, applied at `:83-85`), with a comment naming the harm it fixed: the
  bare count "fired on any long senior CV … the miss was systematic against the
  most experienced candidates" (`:76-82`). The specificity and skill-stuffing
  checks keep their length gates (`:89`, `:93`).
- **Changed: a flag now gates a favourable human action.** Every open warning,
  authenticity and injection alike, must be acknowledged before a recruiter can
  advance the candidate; the server enforces it. That is the reviewer surface's
  half and is recorded in the react application beside this one.

## Deviations

- **The band is a composite.** `authenticity_band` (`:259-275`) collapses the
  warn count into `high | medium | low`. In Python it has no production caller,
  only tests; the display chip computes its own mirror. It satisfies the
  standard's narrow allowance (a count of visible notes, driving nothing), but
  the guard that it must drive no routing is still a convention, not an enforced
  one — and the same tree has a *different* authenticity band, for take-home
  submissions, that does hold a candidate, which is the one-step path this
  deviation warns about.
- **Authorship framed as risk.** The module header describes its job as flagging
  "fabrication / AI-generation risk" and calls buzzword density "the signature of
  templated / AI-generated padding" (`:3-11`, `:25-26`), the specificity check
  "a hallmark of generated prose" (`:87-88`), and `pipeline.py:415-416` repeats
  it as "fabrication / AI-padding signals". The standard holds that machine
  drafting is not a finding. The flag sentences say nothing about authorship,
  but on 2026-08-20 this file claimed the framing stayed internal. It does not:
  the recruiter-facing tooltip describes the screen as a check "for
  AI-generated / embellished résumés" (see the react application).
- **No evidence span.** The findings are typed but still carry no `value`: a
  reviewer cannot see *which* phrases fired, or which dates, without re-reading
  the document.
