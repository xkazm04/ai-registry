---
layer: technique
type: technique
subject: cv-authenticity-screening
technique: a-screen-is-not-a-verdict
status: forged
laws: [uncertainty-resolves-toward-the-candidate, no-adverse-outcome-is-solely-automated, inference-must-look-like-inference]
shared_with: []
use_when: [setting thresholds for any authenticity heuristic, deciding what a positive screen is allowed to do, writing the record a flag leaves behind]
---

# A screen is not a verdict

Every authenticity heuristic is a *screen*: a cheap, sensitive test whose job is
to raise attention, not to conclude. This technique is the contract that all the
others in the subject are written under, and it is worth stating first because
once a screen is permitted to act, no amount of care in the heuristics can
repair the damage.

## The asymmetry, as arithmetic

Set every threshold from this table, not from an F-score:

| Outcome | What it costs |
| --- | --- |
| False positive (flag fires on an honest document) | a reviewer reads one note and dismisses it — seconds |
| False negative (a distorted document passes) | nothing beyond the status quo; the document is still read and assessed on its evidence |
| **Positive screen allowed to act** (document dropped, candidate rejected, score reduced) | a candidate loses the role over an unproven inference, silently, with no appeal surface and no record naming who decided |

The first two rows are cheap and roughly symmetric. The third is catastrophic
and irreversible. So the design is: **be generous about firing, absolute about
not acting.** A screen tuned for precision is a screen tuned for the wrong error.

This is the domain's rule that
[uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)
in its most literal form — the uncertain reading produces a note for a human,
never an adverse route.

## Decision rules

- **The document is never dropped on a positive screen.** Whatever fires, the
  document continues through extraction, scoring and review unchanged. Screening
  annotates a pipeline; it does not gate one.
- **No flag reduces a score.** Suspicion and fit are separate axes and stay
  separate. Where a claim is genuinely unsupported, the honest instrument is a
  cross-check that withholds unearned credit and names the unproven claims — not
  a penalty applied to a headline number.
- **No flag, alone or combined, routes a rejection.** The machine-actionable
  routes remain advance and hold; anything adverse parks at a human gate, per
  [no adverse outcome is solely automated](../../../_laws.md#no-adverse-outcome-is-solely-automated).
- **A flag names its trigger and quotes its evidence.** "Suspicious document" is
  useless and unappealable. "The term appears 34 times in 900 words, 22 of them
  in one list" is reviewable — the reviewer can look and disagree in five
  seconds.
- **A flag is worded as an observation carrying a probe, never as an
  allegation.** The strongest phrasing found in practice is imperative toward the
  *reviewer*, not descriptive of the candidate: "verify concrete specifics in
  interview", "re-check the dates", "confirm real depth". A flag that names the
  next action converts suspicion into an interview question, which is where a
  hiring process can actually resolve it. A flag that names a conclusion converts
  it into a permanent note about a person. Rendering a heuristic in the grammar
  reserved for measurement violates
  [inference must look like inference](../../../_laws.md#inference-must-look-like-inference).
- **Flags do not accumulate into a verdict.** Three weak signals are three weak
  signals. A composite "authenticity score" recreates exactly the decisive
  instrument this technique forbids, and hides which signal drove it. Where a
  summary band is displayed at all, it must be nothing more than a count of the
  notes beneath it, expand to those notes in one interaction, and drive no
  routing, ordering or threshold anywhere in the system.
- **The screen's own version is recorded.** A flag belongs to the document
  version and the rule version that produced it; a later rule change re-screens
  forward, and never retroactively re-means an old flag.

## The clean result: when silence is right and when a positive line is right

The two families of screen differ on what a clean run should emit, and the
difference is not cosmetic.

- A **quality screen** — density, specificity, arithmetic — may emit an explicit
  positive when it ran and found nothing: *checks ran, the language reads
  specific and concrete*. This is honest because the checks were computed, and it
  is useful because it distinguishes "screened and clear" from "never screened".
- A **security screen** — injection, hidden text — emits **nothing** on a clean
  run. "No manipulation found" reads to a recruiter as an assurance the screen
  cannot give: it detects known shapes, and absence of a known shape is not
  absence of an attack. Silence is the honest output.

Both are the same rule from the other side: a check that did not run, or could
not run, never renders as a pass — and a check whose negative result would be
over-read should not render at all.

## The one case that is different

Content aimed at the analyzer — instructions addressed to the automated reader,
text hidden from the human — is not a heuristic inference. The artifact is the
evidence, and it can be recorded as fact: *this document contained content
addressed to the automated reviewer*. Even here the rules above hold — the
document is still not dropped, the score is still not penalised, a human still
decides — but the record may state plainly what was found, because for once
nothing is being inferred about intent. It is the only place in the subject
where the system knows rather than suspects.

## The review note

A good flag renders as three lines a reviewer can act on in seconds: **what was
measured**, **the exact fragment**, and **what it is not** ("this is a density
observation, not a finding about the candidate; the term is genuinely present").
The third line is not padding. Without it, a reviewer under time pressure reads
a flag as an accusation, and the technique's whole discipline evaporates at the
point of use.

## When not to use this

- **Do not apply this posture to a hard eligibility fact.** A missing mandatory
  credential, a stated unwillingness to relocate, an explicit right-to-work
  answer — these are recorded facts with their own gating rules, not screens.
  Treating a fact as a mere flag is the mirror error, and it makes the pipeline
  dishonest in the other direction.
- **Do not use screens as a substitute for verification.** When a claim actually
  matters and can be checked — a licence register, a named reference, a
  demonstrable artifact — check it. A screen exists precisely because
  verification is unavailable at that moment; it is not an alternative to a
  verification that is.
- **Do not run screens whose output nobody reads.** A flag that no reviewer
  surface displays is a liability with no benefit: it creates an implicit record
  about a person that never informed a decision. Either surface it or do not
  compute it.
