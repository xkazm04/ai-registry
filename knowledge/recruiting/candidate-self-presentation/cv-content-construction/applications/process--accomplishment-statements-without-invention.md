---
layer: application
type: application
subject: cv-content-construction
technique: accomplishment-statements-without-invention
stack: process
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# The CV polish screen: where "no estimated outcome" had no rule

Pinned at `kp@a73922bac`, changed at `kp@bab569307`. The job-seeker module had already
adopted the technique's ladder on the deterministic side and the fidelity contract on the
model side, so the seam was chosen to falsify "the tree holds the whole technique". A
CAUGHT outcome would have been a rewrite the screen accepts that the technique forbids;
that is what the read found.

Anchors are root-relative to that tree.

## What conforms

- **The outcome ladder is code.** app/features/jobseeker/cv/cvContent.ts:155
  "export function missingMetric" separates a rung-4 line (what changed?) from a change
  stated without its size (how much?), and both become owner questions that are shown in the
  designer and never printed.
- **Self-descriptors are flagged in the seeker's words and dropped from generated text**
  (the same file, `SELF_DESCRIPTORS`; pipeline/jobfit/jobseeker.py `_BANNED_OUTPUT`).
- **A number the record does not hold, a borrowed skill, a title or leading verb the line
  does not state** each turn a model rewrite into a question that carries no wording
  (pipeline/jobfit/jobseeker.py:1193 `screen_rewrite`).

## What the screen let through

Five constructed rewrites, each a case the technique names, were passed `ok` by the
screen as it stood:

| Record line | Rewrite | Technique rule broken |
| --- | --- | --- |
| "Reduced regression effort by about 30%." | "Cut regression effort by 30%+." | never round a figure upward |
| "Reduced manual regression effort." | "Significantly reduced manual regression effort." | no estimate, not even "significant" |
| "Assisted with the billing migration." | "Drove the billing migration." | a verb may not raise the claim |
| "Helped migrate billing to the new platform." | "Managed the billing migration ..." | participation into leadership |
| "We built the reporting pipeline." | "I built the reporting pipeline." | "we" into "I" is the owner's choice |

The cause is one design choice, not five oversights: the screen compares **digits** and a
**closed list of title and leadership words**. A number compared as digits cannot see a
bound ("+", "over") glued to it, and a magnitude carried by an adverb has no digits at all.
The leadership list held "led" and "owned" but not the everyday verbs the technique's own
example uses ("responsible for" may become "ran", not "drove").

## What changed

pipeline/jobfit/jobseeker.py:1217 now returns the number question for a magnitude word or
an upward bound the replaced line did not carry, and the raise question for a first-person
pronoun where the line said "we" (unless the seeker said it in the dialog); the leadership
list gained `drove`, `launched`, `managed`, `initiated`. Every addition is relative to the
replaced line and the dialog, so a size or verb the record already holds passes untouched.

## A/B

- **A**: the screen at `a73922bac`. Five of five constructed rewrites `ok`. Two new tests
  red.
- **B**: the screen at `bab569307`. Five of five become questions; a line that already
  states the bound, or a seeker who said "I built it alone", still passes. Floor: the 81
  jobseeker and authenticity tests green, linter clean.
- **Not measured**: how often a live model proposes these rewrites, and the localized
  forms (Czech, German and French magnitude words and first-person forms are not covered).
  Return: replay stored `cv_polish` transcripts for accepted rewrites carrying a magnitude
  word.
