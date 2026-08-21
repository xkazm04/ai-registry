---
layer: technique
type: technique
subject: candidate-ai-disclosure-and-explanation
technique: decisive-facts-not-the-rationale
status: forged
laws: [say-only-what-the-record-holds, a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference]
use_when: [explaining an automated or assisted decision to the person it affected, deciding what of a sealed rationale may be shown, answering a request for the reasons behind a decline]
shared_with: []
---

# Decisive facts, not the rationale

The operator record holds a **rationale**: prose written for the defence of the
decision, naming the approving operator, referencing internal policy, quoting
thresholds and sometimes comparing candidates. It is the right artifact for a
tribunal. It is the wrong artifact for the candidate, and not only because of
what it leaks.

What the candidate is owed is the **decisive facts**: the small set of recorded
values that, had they differed, would have produced a different outcome. For an
automated screen that is characteristically a pair — the score the person's
application received and the threshold it had to clear — plus the categories of
their data that fed it.

## Why the pair beats the prose

The pair is *contestable*. A person who sees "your application scored 58 against
a required 65 for this role, computed from the skills and experience in your
submitted history" can do something: identify data that was wrong, ask whether a
qualification was missed, request review, decide whether to reapply. That is the
operative standard for a meaningful explanation — not that the person
understands the mechanism, but that they can act on the account.

The prose is not contestable, because it is argument rather than fact. It also
carries three specific hazards: it names a second person, it is written in the
register of self-justification, and it frequently reconstructs reasoning after
the fact. A rationale composed to defend a decision is exactly the artifact most
likely to contain a plausible reason that was never the reason.

## Procedure

1. **Locate the decisive inputs in the sealed record.** They were captured at
   decision time for the audit trail; the explanation reads them, it does not
   recompute them. Recomputation at read time yields a number that was never the
   basis of the decision — a different, subtly false claim.
2. **Emit the comparison, not the derivation.** Value against threshold, verdict
   against rubric, requirement met or unmet. Do not emit feature weights,
   sub-scores, or the model's confidence in itself; a self-reported confidence
   is evidence about the model, not about the person.
3. **Name the data categories used**, drawn from what the record actually holds
   for this person, not from a catalogue of what the system can process.
4. **Say what happens next** — the review route, and the fact that a human made
   or can make the call.
5. **Say nothing further.** Where no decisive fact was recorded, the honest
   output is the decision and its attribution with no reason attached. An empty
   reason is a better artifact than a manufactured one.

## Decision rules

- **A score shown to a candidate always appears with its threshold.** A bare
  number is uninterpretable and reads as a grade on the person. The pair is the
  unit; never ship half of it.
- **Never surface a rank or a comparison to other applicants.** "Stronger
  candidates applied" explains the outcome by disclosing others. If the true
  reason is comparative, say the structural fact at the level you can say it —
  the role was filled — and stop.
- **Never surface the approving operator's identity.** The candidate is owed
  *whether a human decided*, which is a different fact from *which human*.
- **Never surface chain hashes, payload snapshots or policy version
  identifiers.** They are integrity machinery. They explain nothing and they
  describe your internals.
- **Trade secrecy narrows the mechanism, never the facts.** Confidentiality can
  keep the formula private; it cannot withhold which of the person's own data
  was used and what was decisive. Wholesale refusal on secrecy grounds is not a
  defensible position.
- **An inference is labelled as one.** If a decisive input was itself a model's
  reading of a document rather than a recorded fact, the explanation must say so
  in the grammar of a hypothesis, not of a measurement.

## When not to use this

- **Not where the decision was fully human and discretionary.** A hiring
  manager's judgment after an interview has no score-threshold pair; the
  decisive fact there is the recorded scorecard dimension, and if none was
  recorded there is nothing to show. Do not manufacture a pair to fill the
  shape.
- **Not for decisions with no adverse effect.** An advance needs no defence and
  does not warrant a scoring disclosure.
- **Not in place of the decline letter's craft.** The wording of an adverse
  message is governed by the rejection practice; this technique governs which
  facts that message and the explanation surface are permitted to draw on.
