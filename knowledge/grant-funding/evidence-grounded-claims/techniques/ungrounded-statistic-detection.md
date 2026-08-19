---
layer: technique
type: technique
subject: evidence-grounded-claims
technique: ungrounded-statistic-detection
status: forged
laws: [never-fabricate-a-figure]
shared_with: []
use_when: [reviewing a generated funding narrative before a human sees it, building automated quality gates for drafting output, deciding which numbers in a draft need sourcing]
---

# Ungrounded statistic detection

An invented statistic asserted as fact is the cardinal sin of funding
narratives — the error class that costs an applicant a rejection at best
and a funder relationship at worst. The technique is a deterministic
**grounding-echo check**: every statistic the draft states as fact must
appear somewhere in the grounding the generator was given — the verified
fact ledger, the funder's call text, the funder profile, the org profile.
A statistic in the draft that echoes nothing in the grounding was invented
by the generator, and the check flags it as a critical finding without a
model in the loop.

## Why detection survives grounding

The check exists *because of* a measured finding that would otherwise
retire it: handing the generator richer real data re-introduces
fabrication. A model given an organization's genuine outcomes does not
stop inventing — it invents *adjacent* supporting statistics: a
need-framing percentage to set up the real outcome, a comparison rate to
flatter it. The real facts raise the narrative's statistical density, and
the model matches the register with company. The corollary is structural:
grounding and detection are permanent complements. Any pipeline that
treats detection as scaffolding to remove once grounding is wired has
misread the mechanism — the better the grounding, the more confident and
plausible the adjacent fabrications become.

## Scope to percentages, and why

The naive detector checks every numeral against the grounding and drowns
in false positives: counts, dates, and dollar amounts legitimately recur,
recombine, and get derived in prose (a total split across years, a date
written three ways). A flooded check gets ignored, then disabled — the
worst outcome, because it takes the true positives with it.

The high-precision scope is **percentages stated as fact**. The reasoning:
a percentage in a funding narrative is almost always either a real
organizational or funder figure — in which case it is in the grounding and
echoes cleanly — or a fabrication. Percentages are rarely derived
spontaneously in prose the way sums and dates are, so the echo test's
false-positive rate collapses while its target — the sector-sounding
invented rate, the model's favorite fabrication shape — sits squarely in
scope. Precision is what keeps a critical-severity gate credible; a gate
that cries wolf gets overridden by habit.

## The exclusions that make it fair

- **Bracketed placeholders are stripped before matching.** The honest
  anti-fabrication form must never trip the fabrication alarm; a check
  that flags `[insert percent of students at grade level]` teaches
  generators and writers to avoid the honest form.
- **The rhetorical extremes are exempt.** Zero and one hundred percent
  function as figures of speech ("100% of our board gives personally")
  far more often than as statistics; flagging them is noise.
- **Matching is by numeric value, not by string.** The draft's "78%"
  must match the grounding's 78 whether the grounding wrote "78%", or
  "78 percent" — value-level matching, tolerant of formatting, strict
  about the number.
- **Each offending value is reported once**, with the check failing
  closed as a critical finding listing exactly which percentages have no
  grounding — actionable output, not a boolean.

## Decision rules

- When the check flags a percentage, the resolutions are: trace it to a
  real source and add that source to the grounding; replace it with a
  bracketed placeholder; or delete the claim. "It sounds right" is not a
  resolution.
- When a flagged percentage is a legitimate derivation (two grounded
  numbers divided), prefer restating the grounded numbers over defending
  the derived rate — or ground the derivation explicitly.
- When tempted to widen scope to all numerals, measure the false-positive
  rate first on real drafts. Widen only where precision survives; a
  second scoped check (for example, dollar amounts above a threshold)
  beats one diluted catch-all.
- Run the check on every generated draft and every regeneration — not
  once per application. Each generation is a fresh opportunity to invent.

## When not to use

The echo check verifies *consistency with grounding*, not truth: a wrong
figure in the grounding echoes cleanly and passes. Upstream extraction
honesty and provenance are what defend the grounding itself — this check
assumes them. It is also the wrong tool for prose claims without numbers
("the leading cause", "most families") — those need a different review
posture, and stretching the deterministic check to rhetoric costs the
precision that justifies its severity.
