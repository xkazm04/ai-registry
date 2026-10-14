---
layer: application
type: application
subject: local-visibility-and-reputation
technique: attention-score-for-many-locations
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: experiment
ab_verdict: better
---

# Attention score for many locations - the roster sort and the status import in a Czech-market workspace

The workspace realizes the technique as a pure module that scores and stably sorts a
location roster, fed by a tolerant listing-status import. The score weights match the
technique exactly (disconnected 100, attention 50, flagged x20, unanswered x6, off first
page 15, tasks x4), the sort is stable with roster-order ties, the fleet rating is
review-weighted, and a rank of 0 means unknown and never trips the off-first-page penalty.
The structural fact the tree proves: the weights and ordering were already here, so the
open question was the one input the whole ordering depends on.

## The seam chosen to falsify

The technique says an unrecognised status must fail toward attention. The import did that
for unknown wording, and a code comment said it mapped "pending verification" to attention.
The healthy-stem test ran before any negation, though, so any wording that *contains* a
healthy stem was read as healthy.

- **A:** 15 negated or pending wordings (English and Czech) through the live import:
  14 parsed as connected. Only the one without a healthy stem failed toward attention.
- **B:** a negation-and-pending test placed before the healthy stems: 0 of 15 parsed as
  connected.
- **Floor:** explicit affirmatives still connected, disconnect wordings still
  disconnected, 48 status, roster and score tests green, type check and lint clean. An
  empty status cell stays connected, as the existing test pins.

A caught outcome here would have been "the rule holds"; it did not, and the result
changed the technique (a decision rule on negation order). Shipped to the project's
default branch with the paired test.

## Where the tree still falls short

A blank status cell inside a present status column parses as connected. The technique
treats an *absent* column as not reported, neither healthy nor a problem; the type has
no not-reported state, so a blank cell sorts as clean. Not changed: it needs a fourth
status value across the roster, the table and the score. Not measured: how often real
exports carry blank cells or negated wordings.
