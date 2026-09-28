---
layer: application
type: application
subject: blind-screening-and-redaction
technique: identity-twin-mask-invariance
stack: process
verified_on: 2026-09-26
applied: code
ab_verdict: better
---

# Identity twins against a pattern redactor (Python pipeline)

## The history the suite replaces

`pipeline/jobfit/redact.py` masks a CV's identity before a model scores it.
Commit `10864715c` (2026-08-22) fixed four defects in it. Three of them were a
mask whose output depended on who was being masked, each found and fixed as a
single case:
- **The feminine birth participle.** `Narozená 1990` escaped the age pattern
  that caught `Narozený 1990`. "On two CVs identical except for the writer's
  gender, the man's birth year was redacted and the woman's reached the model."
  It is pinned by `test_every_gender_form_redacts_the_birth_year`.
- **A given name that is a month.** A candidate named Jan lost every
  "Jan 2020" employment date "an identical CV keeps". The fix spares a month
  token followed by a year (`_MONTH_TOKENS`, `_FOLLOWED_BY_YEAR`), and
  `MonthNameOverRedactionTest` pins it, including a Petr twin.
- **Czech academic titles.** A leading `Ing.` blocked name detection
  altogether, and a trailing `MBA` was swallowed into the name and then masked
  as the name everywhere.

## The probe

On 2026-09-26 one CV body was held fixed and nine identities were varied
against a no-collision baseline, "Petr Novak". The body was written for the
twin set. It contains employment dates, "Ruby on Rails", "Julia", "Rust",
"Ford Motor Company", "JPMorgan Chase", "Wells Fargo", "Mark-to-market",
"Dean's List" and "Young Professionals Award".

**8 of 9 twins redacted to different text than the baseline:**
- "Julia Novakova" and "Ruby Chen" lost those languages from the skills line.
- "Grace Ford", "Chase Young" and "May Wells" lost employer tokens ("[NAME]
  Motor Company", "JPMorgan [NAME]", "[NAME] Fargo").
- "Chase Young" and "Dean Black" lost award tokens.
- "Mark Price" lost "Mark-to-market".
- "Rust Cohle" was never name-detected. The line was filed as a role headline
  because it carries one skill term, so the name reached the model under the
  PARTIAL note. "Grace Swift" fails the same way.

Only "Jan Novak" matched, because of the earlier month fix. The collisions were
planted: the probe shows the class is open, and it does not measure how often
a real CV hits it.

## The change

Commit `4433df0c5`:
- `_looks_like_role_headline` now needs the shared taxonomy's vocabulary to
  cover more than half of the line's tokens, not any one of them. "Swift
  Developer" is still a headline, and "Grace Swift" is a name.
- `_lone_token_is_evidence` keeps a lone name-token occurrence that the taxonomy
  reads as a skill, or that sits in a glued-hyphen compound. An occurrence after
  a salutation or honorific (`_PERSON_CUES`) is still masked.

`IdentityTwinInvarianceTest` asserts byte-identical redacted text and the
detected name across a four-twin decidable set: Jan Novak, Mark Price, Grace
Swift and Rust Cohle. It has two non-vacuity tests: "Dear Swift" and
"Ms Swift" are still masked, and "Swift Developer" is still skipped as a
headline. Against the previous redactor the suite fails 2 tests. Here it
passes: 25 passed, 1 expected failure.

## A and B

| | planted nine-twin probe | decidable suite |
| --- | --- | --- |
| A (before `4433df0c5`) | 8 of 9 diverge | 2 tests fail |
| B (after) | 6 of 9 diverge | green |

All six remaining divergences are the stated gap. Four are employer or award
collisions, which cannot be told from a self-named firm by shape. Two are given
names the taxonomy does not know as skills (Ruby, Julia). They sit in
`test_known_gap_employer_and_off_vocabulary_collisions` under
`@unittest.expectedFailure`, so fixing either one turns the suite red until the
decorator is removed.

## Where the standard is not met

- **The twin set covers one language pair's collisions.** The names are
  English and Czech, and so is most of the colliding vocabulary. The header
  stop-list already spans German and French, but no twin does.
- **The masking-policy change did not move the result cache key.** A blind
  verdict cached under the old mask can still be served. See the node
  application.
