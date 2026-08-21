---
layer: technique
type: technique
subject: grant-taxonomy-design
technique: false-positive-suppressors
status: forged
laws: [honest-null-over-forced-guess]
shared_with: []
use_when: [an audit finds a keyword rule systematically mis-tagging a slice, a polysemous word pulls one domain's grants into another, deciding between narrowing a rule and adding a negative rule]
---

# False-positive suppressors

The concern: every useful keyword over-fires somewhere, because funding
prose is polysemous. "Health" describes forests and watersheds as readily as
patients; "sustainable" modifies governance and competitiveness as readily
as ecosystems; "economic" prefixes research about a disease as readily as
workforce development; "rural communities" names who a grant serves, not
what it does. A suppressor is a *named negative rule* that removes a code
after the positive rules assigned it — but only under conditions an audit
has shown to indicate a systematic mis-tag.

## The anatomy of a suppressor

A well-formed suppressor has three parts, and the discipline is in the
middle one:

1. **Trigger** — the suspect code is present in the matched set.
2. **Innocence check** — if any *genuine* signal for the code is present
   (a curated pattern of unambiguous domain terms), keep the code and stop.
   This guard is what makes suppressors safe: a grant about clinic services
   in a forest region keeps its health tag no matter how much ecosystem
   prose surrounds it.
3. **Guilt check** — if the *competing sense* is affirmatively present (an
   ecological-"health" phrase pattern; a bare "sustainable" with no
   environmental noun; "economic" co-occurring with a research tag but no
   workforce phrase), remove the code. If neither check fires, leave the
   set unchanged — a suppressor never acts on absence of evidence alone.

The output is a smaller code set, possibly empty. Empty is the intended
outcome for genuinely ambiguous rows: an uncategorized grant flags a real
gap; a mis-categorized one hides it.

## Procedure

1. **Find suppressors by slice audit, not by intuition.** Sample each
   (source × code) cell; when a cell's mis-tag rate is material, read the
   false positives and name the sense collision. Production examples that
   earned suppressors: ecological "health" accounting for 66% of one
   regional source's health slice; beneficiary-geography "rural" phrasing
   accounting for ~19% of an agriculture slice (cross-validated by two
   independent analyses before the rule shipped).
2. **Prefer the cheapest fix first.** The escalation ladder: (a) narrow the
   positive stem itself (a lookahead excluding the comparative forms that
   only occur in the foreign sense); (b) delete the offending sub-pattern
   from the positive rule when a fallback layer covers the recall it
   provided; (c) only when the collision is inherent to a word you must
   keep, write a full suppressor with innocence and guilt checks.
   Suppressors are the most powerful and most expensive rung — each one is
   extra state a maintainer must hold.
3. **Encode the measurement in the comment.** Every suppressor's comment
   carries the audit finding, the rate, and the date. Suppressors look like
   paranoia to anyone who has not seen the data; the number is what protects
   the rule from being "simplified" away.
4. **Re-run the corpus and diff after each suppressor.** Confirm the target
   slice improved and — the step usually skipped — that no *other* slice
   lost genuine tags. The innocence-check pattern is the knob if it did.

## Decision rules

- **Suppress only what you have measured.** A suppressor without an audit
  number behind it is speculative narrowing that silently costs recall.
- **The innocence check is curated, not derived.** It is a hand-picked list
  of terms unambiguous for the code — deliberately broader than the
  positive rule, because its job is protecting true positives, not finding
  new ones.
- **Scope-based suppression is a separate concept from sense-based.**
  Removing whole rows from a product surface (out-of-scope opportunity
  classes an audience will never apply to) is a visibility flag — store and
  categorize the row, mark it suppressed — not a taxonomy operation. Keep
  the two mechanisms distinct: sense suppressors edit the code set;
  scope suppressors edit the audience. And keep scope suppressors surgical:
  target the unambiguous core of the unwanted class, and let adjacent
  legitimate rows (the same issuer's grants in a wanted domain) through.
- **When a suppressor and a fallback disagree, the more specific evidence
  wins.** A structured-metadata signal (issuer, programme code) asserting
  the code is stronger than a text-sense suppressor removing it; order the
  pipeline so fallbacks apply after suppression.

## When NOT to use it

- To patch a modelling error. If a "false positive" is really a concept
  with no home (beneficiary-geography, a missing sector), the fix is a
  vocabulary change; a suppressor would just hide the gap.
- Against noise rather than pattern. One-off oddball rows are what the
  honest-null posture and human review are for; suppressors are for
  *systematic* sense collisions worth permanent code.
- When the positive rule can simply be made precise. A negative rule
  layered on a sloppy positive rule is two rules doing one rule's job.
