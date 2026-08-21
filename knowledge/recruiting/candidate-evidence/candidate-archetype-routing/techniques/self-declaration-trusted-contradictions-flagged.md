---
layer: technique
type: technique
subject: candidate-archetype-routing
technique: self-declaration-trusted-contradictions-flagged
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference, uncertainty-resolves-toward-the-candidate]
use_when: [a candidate states their own career type, an inferred classification disagrees with what the candidate said, designing the intake question that sets an archetype]
shared_with: []
---

# Self-declaration trusted, contradictions flagged

## The concern

When a candidate tells you what kind of career they are having, you have a better signal
than anything a parser can extract — and you also have the one signal you are not
entitled to overwrite. Systems get this backwards with striking regularity: they ask the
question, then let a heuristic "correct" the answer, and the record ends up asserting
something about a person that the person did not say.

The technique is a single asymmetric rule:

> **A self-declaration sets the archetype and raises confidence. A contradicting signal
> lowers confidence — capped, bounded, flagged for a human — and never changes the
> class.**

Scepticism is real and belongs in the system. It belongs there as *data* — an explicit
contradiction rule with a stated confidence ceiling — not as a silent override.

## The procedure

1. **Ask the question at intake, in the candidate's own terms.** Offer the archetypes as
   plain descriptions of career situations, not as internal vocabulary, and make the
   options mutually intelligible to someone who has never seen your taxonomy.
2. **On an answer, set the class and lift the confidence to the declaration tier.** The
   jump should be large — the difference between "this is a document inference" and
   "this person told us" is the largest single confidence step the system makes. Leave a
   margin below certainty: a declaration is authoritative about intent, not infallible
   about your category boundaries.
3. **Keep running the signal model anyway.** Its job changes from deciding to checking.
   You want to know when the evidence disagrees; you just do not want the evidence to
   win.
4. **Write a contradiction rule for every archetype, including the unprotected default.**
   The reflex is to encode scepticism only where a declaration claims a protected class —
   the self-declared student with four years of work. The reverse case matters more: a
   self-declared experienced professional whose record shows current enrolment or under a
   year of relevant work is exactly as contradicted, and leaving that one uncapped sends a
   candidate who may belong to a shielded population down the unprotected path at full
   confidence. Contradiction rules are symmetric or they are a one-sided suspicion
   mechanism.
5. **Enumerate the contradiction rules explicitly, each with a confidence ceiling.**
   Each rule names the declared class, the contradicting condition, and the maximum
   confidence the result may carry. Substantial professional experience under a
   self-declared student status caps at a value below the review threshold's comfortable
   zone. A declared career change with no prior professional history at all caps lower
   still, because the archetype's own definition presumes something the record does not
   show.
6. **Apply the cap as a ceiling, not a subtraction.** `min(confidence, ceiling)` — so a
   second contradiction cannot compound into an implausibly low number, and so the rule
   reads as "this is the most we can claim" rather than "we docked them".
7. **Record the contradiction as a fact, not as a suspicion.** Name the rule that fired
   and the observation behind it. Never render it as a judgment about honesty; the copy
   a recruiter sees should read like "declared X; the record also shows Y — worth
   confirming".
8. **Route it to a person via the ordinary low-confidence path.** A contradiction needs
   no special escalation mechanism; it needs to fall below the review threshold that
   already exists.

## Decision rules

- **When a declaration and an inference disagree, the declaration wins the class and the
  disagreement wins the confidence.** Both facts survive. This is the whole technique in
  one line.
- **When you are tempted to override "for accuracy", ask what the record will say
  afterwards.** After an override, the record no longer holds what the candidate stated;
  it holds a machine's opinion wearing the candidate's voice.
  [Say only what the record holds](../../../_laws.md#say-only-what-the-record-holds) — and
  an overwritten declaration is the record asserting a claim about a person that nobody
  made.
- **When a contradiction has innocent explanations, and it always does, the cap is the
  correct response.** Mature students, working students, restarts, non-linear paths,
  unfamiliar education systems and imperfect parsing all produce the same disagreement
  as deception does, and they are collectively far more common. The system cannot
  distinguish them, so it must not try.
- **When a declaration cannot be given — no intake answer yet, a degraded form, a
  document-only pipeline — the inference stands alone at the lower confidence tier.**
  It does not get promoted to declaration confidence because it was the only input.
- **When both a declaration and a derived class are persisted, persist them as separate
  fields.** They will diverge later when the signal table is retuned, and you will need
  to know which one came from the person.
- **When the contradiction cap and the review threshold have drifted apart, fix the
  numbers together.** A cap set above the review threshold is a rule that fires and does
  nothing — the most common way this technique is implemented and then quietly disabled.

## Why the cap rather than the override

An override is a lossy, unrecoverable, unexplainable operation, and it fails all three
tests you would apply to any decision about a person:

- **It is lossy.** The candidate's own statement is gone from the record, or survives
  only as a field nobody downstream reads.
- **It is unrecoverable.** Every consumer — the intake form, the rubric, the shield, the
  analytics, the audit log — inherits the substituted class, and no later reviewer can
  see that a substitution happened unless somebody thought to log it.
- **It is unexplainable to the person it is about.** "We decided you were not what you
  said you were, on the basis of a document parse" is not a sentence any hiring process
  should have to defend, and under a right of explanation it is the sentence you would
  have to produce.

The cap has none of these properties. It loses nothing, changes no downstream class, and
resolves the uncertainty toward a human look rather than toward an automated
consequence — [uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate).
And it renders honestly: a flagged contradiction is visibly an inference about the
evidence, not a finding about the person
([inference must look like inference](../../../_laws.md#inference-must-look-like-inference)).

## When NOT to use it

- **Not for verifiable facts with a documentary answer.** Work authorization, a required
  licence, a formal qualification: these are verified, not believed-and-flagged. This
  technique governs self-descriptive categories, where the candidate is the best
  authority in principle, not administrative facts where a document is.
- **Not where the declaration selects a materially advantaged path.** If declaring an
  archetype unlocks a reserved programme, a quota or a benefit, the declaration needs
  its own verification design, and it is a different problem from routing a rubric.
- **Not as cover for an unanswerable question.** If contradictions fire on a large share
  of declarations, the question is wrong, not the candidates. Rewrite the options; a
  taxonomy people cannot place themselves in is a taxonomy problem.
- **Not for a "declaration" the candidate never actually made.** A default-selected
  option, a value copied from a previous application, or a single-option question is not
  a statement by a person and must not receive the declaration confidence tier.
