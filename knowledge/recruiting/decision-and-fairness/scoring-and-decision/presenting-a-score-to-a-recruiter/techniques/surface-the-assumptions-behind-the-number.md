---
layer: technique
type: technique
subject: presenting-a-score-to-a-recruiter
technique: surface-the-assumptions-behind-the-number
status: forged
laws: [absence-of-evidence-is-not-evidence, inference-must-look-like-inference, say-only-what-the-record-holds]
shared_with: []
use_when: [a scorer filled a gap in candidate evidence to produce a number, designing a score card a recruiter must be able to challenge, wording what the system could not observe]
---

# Surface the assumptions behind the number

Any scorer reading real candidate evidence **imputes**. It has to: résumés are
incomplete, dates are ambiguous, titles do not mean the same thing at two
employers, and half of what a role asks for is never stated anywhere the
system can see. Seniority gets inferred from elapsed years. A qualification is
treated as equivalent to the one asked for. A skill is credited from an
adjacent one. A gap between roles is read as continuous employment, or as a
break.

These imputations are the difference between a 60 and an 80. They are also
precisely the material a recruiter is qualified to overrule — a hiring manager
knows that the unnamed employer is a two-person startup where the title means
something different, and the system never will. **A recruiter can only
overrule an assumption they can see.**

So the technique is: capture every imputation at the moment it is made, type
it, and put it in the recruiter's line of sight beside the number it moved.

## The procedure

**1. Emit assumptions from the scorer, not from a later reader.** The only
place that knows an inference was made is the step that made it. A downstream
pass trying to reconstruct "what did it assume?" from the finished score or
from generated prose is guessing about a guess.

**2. Type each one.** An assumption record carries: the **dimension** it
affected, **what was missing** in the evidence, **what was assumed in its
place**, and the **direction** — did this raise or lower the figure, and
roughly by how much. Free-text-only assumptions cannot be counted, filtered,
or checked for a pattern across a cohort, and a pattern across a cohort is how
you discover the imputation rule that is quietly disadvantaging a group.

**3. Render them adjacent to the score, not in an appendix.** The obligation
is discharged at the moment of the decision. An assumptions section three
navigations away from the advance button satisfies a policy and changes no
outcome.

**4. Phrase every one as absence of evidence, not as a deficiency.** This is
the sentence-level craft and it is the whole difference between a fair card
and an unfair one:

- Not "no evidence of team leadership" — that is a claim about the candidate.
- But "the documents we read do not describe team size or reporting lines;
  this dimension rests on titles alone."

The first invites rejection. The second invites a question at interview. Only
the second is true, because
[absence-of-evidence-is-not-evidence](../../../../_laws.md#absence-of-evidence-is-not-evidence)
and the record holds nothing either way —
[say-only-what-the-record-holds](../../../../_laws.md#say-only-what-the-record-holds).

**5. Carry the assumptions that cut upward too.** A skill observed live rather
than self-reported, a gate skipped rather than failed, a credential verified
against a source — these belong in the same channel. A list containing only
deficits trains the reader to see it as a strike sheet and to skim it; a list
that also says what the number rests on *favourably* is read as what it is,
the basis of the score. It also stops the channel from being quietly gamed by
producers that only report bad news.

**6. Emit each assumption as a stable code plus parameters, not a frozen
sentence.** The producer records the identifier ("education level unknown")
and the values that fill it; the reader's surface composes the sentence at
render time, in the reader's language. Prose frozen in the producing run's
language is unreadable to the next reader, indefensible in the next
jurisdiction, and impossible to count across a cohort. Keep a parallel plain
string as a fallback so an older record still renders, and keep the two in the
same order so they can be zipped without a join.

**7. Attach a probe where one exists.** The most useful assumption line ends
with what would resolve it: "ask what the deployment cadence was". This turns
an uncertainty into interview structure instead of into a silent penalty.

**8. Where thin evidence widens the reading, show the width.** Some
assumptions do not shift the score up or down so much as make it *less
certain* — a profile with three skills on file, a single short document, one
undated role. The honest render of such a score is an interval, and the
assumption line is what names the reason the interval is wide. An uncertainty
the recruiter can see is handled correctly; a bare point estimate cannot be.

**9. Keep the inference grammar distinct.** Assumptions render in the visual
and linguistic register reserved for inference, never the register of
measurement — [inference-must-look-like-inference](../../../../_laws.md#inference-must-look-like-inference).
The grammar itself (what counts as hypothesis versus evidence versus proof,
and how each is marked) is owned by inference labelling and refusal; this
technique consumes that grammar and is responsible only for making sure the
assumptions reach the score card at all.

## Decision rules

- **When an imputation is load-bearing — it alone moves the score across a
  band boundary — it is promoted to the headline area**, not left in a list.
  A candidate who is *strong* only because a degree was assumed equivalent is
  a different card from one who is strong on evidence.
- **When there are too many assumptions to show, that is the finding.** A
  score built on eight imputations is not a score; the honest render is a
  low-confidence marker or a refusal, not a tidy list. Truncating the list to
  the top three hides the very fact that matters.
- **Never let an assumption become an evidence item.** Once "assumed
  equivalent" is stored beside real findings without its type, the next
  consumer reads it as something the candidate demonstrated.
- **An assumption is not a confidence score.** A self-reported confidence
  number is evidence about the model, not about the person, and it does not
  substitute for saying what was assumed. Both may be shown; only one is
  actionable.
- **Watch the units at the boundary.** Confidences and shares live on
  different domains (a fraction versus a percentage), and a value emitted on
  the wrong one renders as a wildly wrong figure on a hiring screen with
  nothing to signal it is wrong. The formatter guards its domain and refuses
  rather than guesses.

## When not to use this

- **When the scorer genuinely did not impute.** Manufacturing assumption lines
  for completeness trains recruiters to skip the section, which destroys it
  for the cases that matter.
- **On candidate-facing surfaces, unedited.** Internal assumption records are
  written for a reviewer and often read as accusations out of context. What a
  candidate is told about why they were not advanced is governed by rejection
  craft, not by this technique.
