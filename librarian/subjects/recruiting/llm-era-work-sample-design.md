---
domain: recruiting
subject: llm-era-work-sample-design
last_touched: 2026-08-27
touched_by: intake
dry_streak: 0
---

# llm-era-work-sample-design

Subject note. Part of [[index]]; graded against [[standard]].

Created 2026-08-27 to record one thing only: this subject holds the **opposite**
rule to a technique that landed in another bundle the same day. Nothing in this
subject was edited.

## Touch log

### 2026-08-27 - `/intake`, boundary recorded from the other side

Source: [[2026-08-27-evaluate-llms-before-production]].

`software-engineering/.../eval-harness/scenario-design` gained a sixth
ugly-case region, **distractors**, and made covering it mandatory: a scenario
set that has been tidied until every input holds exactly one plausible target
measures a task production will never hand the system.

This subject forbids the same thing outright. Its golden path is headed
"Decision space, not right answer plus distractors", and
`covert-probe-with-a-decision-space` says "never one right answer surrounded by
distractors" - because a decoy gives a judgment probe an answer key, and a probe
with a key measures retrieval rather than judgment.

**Both are correct. Cross-bundle links are forbidden and this is not a
contradiction to resolve - it is a boundary, and the discriminator is one
question:**

> Is the distractor **captured** or **planted**?

- Captured: it is a property of an input the system will really receive.
  Excluding it makes the instrument easier than reality. -> mandatory coverage.
- Planted: it is a property the designer invented. Including it makes the
  instrument measure something other than what it claims. -> disqualifying.

The deeper reason the sides differ is what is under measurement. An eval
scenario legitimately has a designated correct target, so decoys are part of
the input under test. A work-sample probe must have no key at all, so a decoy
manufactures one.

Stated in prose on the software-engineering side; recorded here so a later run
recognises the shape instead of re-litigating it.

## Open leads

None.

## Declines

None.
