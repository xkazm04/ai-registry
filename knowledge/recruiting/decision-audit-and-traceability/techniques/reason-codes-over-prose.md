---
layer: technique
type: technique
subject: decision-audit-and-traceability
technique: reason-codes-over-prose
status: forged
laws: [say-only-what-the-record-holds, meaning-does-not-live-in-a-label, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [designing the why field of a decision record, making decisions countable across a cohort, replacing free-text rejection notes]
---

# Reason codes over prose

## The concern

Ask a hiring system why a person was rejected and a mature one answers with a code from a
short, closed list plus optional detail. An immature one answers with a text box, and that
text box is where defensibility goes to die — three ways at once.

- **It cannot be counted.** The class question — "show me every rejection for this reason
  this quarter, by cohort" — is a query over codes and an unreliable text-mining project
  over prose. Since disparate-impact analysis *is* a class question, a system whose reasons
  are prose cannot audit itself, which means it will learn about its own pattern from
  someone else's analysis of it.
- **It is unbounded, so it will eventually say something inadmissible.** A free field will,
  across ten thousand uses, contain a comment about an accent, a pregnancy, a photograph, a
  neighbourhood. Not because recruiters are malicious — because the field invited a
  sentence and a sentence carries whatever was in the writer's head. A closed vocabulary
  cannot express those things.
- **It is not stable.** The same reason gets written forty ways, so an unfavourable pattern
  is invisible to you and visible to whoever aggregates your data later with more patience.

The rule: **the reason is a code; prose may accompany it and may never substitute for it.**

## What makes a good code set

- **Small.** Twelve to thirty codes for a hiring pipeline. Beyond that, users pick by
  position in the list rather than by meaning, and the data quality drops below prose.
- **Closed and versioned.** Codes are added, never repurposed. A retired code stays
  readable so old records keep meaning what they meant — a verdict stays bound to the
  vocabulary it was scored under. New codes carry a version so you can tell when the
  vocabulary changed rather than when behaviour did.
- **Specific enough to be actionable, and honest about it.** The regulatory standard used
  for consequential adverse decisions in adjacent regimes is instructive and worth
  borrowing wholesale: the stated reason must be the *principal, specific* reason actually
  relied on; a code that says "did not meet our internal standards" or "did not achieve a
  qualifying score" is explicitly insufficient, because it describes the mechanism rather
  than the factor. Codes must name the factor: *required certification absent*, *below
  experience floor for the level*, *work-authorization requirement unmet*, *stronger
  candidates advanced at this stage*. Aim for one to four principal reasons, ordered by
  contribution; more than four is not helpful to anyone and reads as padding.
- **Free of protected-attribute proxies.** Vet the vocabulary itself as a discrimination
  surface. A code set is a policy document, and it deserves the same review as one.
- **Structured to distinguish a reason from an absence.** Per
  [absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence),
  "we never assessed this" needs its own code and must never share one with "we assessed it
  and it was insufficient." Those two are different facts about a person, and collapsing
  them flatters the process.
- **Derived from the record, never from a hunch.** Per
  [say only what the record holds](../../_laws.md#say-only-what-the-record-holds), a code
  is only selectable if the decisive input that supports it is present. A system that lets
  a recruiter pick *below experience floor* for a candidate whose sealed inputs show no
  experience assessment has manufactured a reason.

## Procedure

1. **Derive the vocabulary from actual decisions, not from imagination.** Sample a few
   hundred real free-text reasons, cluster them, and let the clusters name the codes. A
   set designed in a meeting will miss the reasons people actually have and will contain
   reasons nobody ever uses.
2. **Attach each code to the input that must exist for it to be valid.** This makes the
   code checkable and turns an unsupported selection into a validation error instead of a
   liability.
3. **Rank when there are several.** Seal an ordered list of principal reasons; the first is
   the decisive one. Where a machine produced them, order by actual contribution, not by
   the order the fields happen to appear in.
4. **Keep an optional detail field, deliberately narrow.** Its purpose is the particular —
   *which* certification, *which* requirement — not a second, competing narrative. Cap its
   length, label it as detail, and make clear in the interface that it is not the reason.
5. **Never let the code be the candidate-facing sentence.** The code is the record; the
   message to the person is composed from it at the boundary, in their language and their
   register, subject to whatever the disclosure seam permits them to be told. The two are
   related but not identical, and the difference between them is itself a policy decision
   that must be visible rather than accidental.
6. **Distinguish the machine's code from the human's.** When a person overrides, they pick
   their own reason; it does not inherit the model's. Two codes, two actors, both sealed.

## Decision rules

- **When no code fits, that is a finding, not a use for "other".** Route it: log the
  attempted decision, let the user proceed with detail text, and put the gap in a queue
  that reviews the vocabulary monthly. An "other" rate above a few percent means the set is
  wrong; a set with no escape hatch at all means users will pick the nearest wrong code,
  which is worse than an honest gap.
- **When the reason is comparative — "stronger candidates advanced" — say so plainly and
  seal the comparison basis.** It is a legitimate and extremely common reason; what makes
  it defensible is that the record names the stage, the cohort, and the criterion, rather
  than implying a deficiency in the person that nobody found.
- **When the decision is favourable, still code it.** Advancement reasons matter for the
  same class questions, and a system that only codes rejections cannot compute a selection
  rate without inferring the numerator.
- **When a code's meaning drifts in practice, retire it and mint a replacement.** Never
  redefine one in place; every historical record silently changes meaning if you do, per
  [meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label).

## When not to use this

- **On observations, as opposed to decisions.** An interviewer's evidence note, a
  candidate's own words, a hiring manager's written argument for a hire — these are content
  and must stay verbatim. Coding them destroys the very specificity that makes a scorecard
  defensible.
- **Where a small code set would force a false claim.** If the honest answer is "the panel
  did not reach agreement", and no code says that, the fix is a new code, not the nearest
  fit. A record that codes a nuanced decision into a crisp wrong reason is more dangerous
  than one that admits the nuance, because it will be counted.
- **As the whole explanation owed to a person.** A code is a record artifact. What a
  candidate is entitled to hear — and how much of the machinery is disclosed to them — is
  the disclosure-and-explanation seam's question, and the answer there is frequently more
  than a code and never less than the truth of one.
