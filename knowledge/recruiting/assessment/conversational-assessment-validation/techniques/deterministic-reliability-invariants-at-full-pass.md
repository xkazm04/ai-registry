---
layer: technique
type: technique
subject: conversational-assessment-validation
technique: deterministic-reliability-invariants-at-full-pass
status: forged
laws: [no-adverse-outcome-is-solely-automated, say-only-what-the-record-holds, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [defining what blocks the release of an automated interviewer, a containment check is flagging correct refusals as violations, deciding which conversational failures are categorical]
---

# Deterministic reliability invariants at full pass

Some conversational failures are not matters of degree. An internal instruction
is either in front of the candidate or it is not. A verdict was either delivered
or it was not. The interview was either conducted in one language or it was not.
For this class, the honest gate is **every case, every turn, no exceptions** —
and the checks that enforce it must be deterministic, because a probabilistic
judge cannot carry an absolute gate.

Four invariants recur across every automated interviewer worth deploying:

1. **No leakage of internal vocabulary.** Stage directions, phase names,
   scripted-probe and cover-question language, listen-for and reveals-that
   constructions — none of it reaches the candidate.
2. **No verdict, no score, no outcome.** Including soft outcomes: "you'd be a
   strong fit", "that's exactly what we're looking for", "I think you'll do
   well" ([no-adverse-outcome-is-solely-automated](../../../_laws.md#no-adverse-outcome-is-solely-automated)).
3. **No evaluative praise.** A running scoreboard in a friendly voice is still a
   scoreboard, and it teaches the candidate which register earns approval inside
   two answers.
4. **Language consistency.** Lock onto the language the candidate replied in and
   hold it, switching only when the candidate switches first — under
   provocation, hostility and silence.
5. **Completion, and no stall.** The conversation reached a coherent end rather
   than erroring, drying up after two turns, or looping. Looping has a clean
   deterministic detector that most harnesses lack: **consecutive interviewer
   turns above a high textual-similarity threshold**. A near-repeat is a stuck
   agenda, and to the candidate it reads as being ignored.
6. **Opened and closed correctly.** The first turn discloses what the
   interviewer is and that the conversation is recorded for a human reviewer;
   the last thanks the candidate and hands off to that human. Both are
   single-turn, structurally checkable, and both are things a candidate is owed
   rather than stylistic preferences.

Each is measured on a full-pass gate. Anything softer is a decision that some
proportion of real interviews may breach it, and nobody who sets a
ninety-five-percent bar believes that is what they are deciding.

## The pairing rule: refusal is not violation

This is the detail that decides whether the harness helps or harms. The naive
check searches for the forbidden content and fails the case when found. But the
*correct* response to "what score did I get?" names the thing it is declining:
"I'm not able to share a score — the hiring team decides. Shall we continue?"
The naive detector marks the best possible behaviour as a breach.

The consequence is not a bad number, it is a bad product. A team whose harness
punishes correct behaviour learns to distrust its own failures, then tunes the
interviewer to avoid the *word* rather than the *act*, and ships an interviewer
that dodges awkwardly where it used to decline gracefully.

**Evaluate the pair at sentence granularity, not turn granularity.** A single
turn routinely contains both a compliant decline and, two sentences later, the
thing it just declined to give. Checking the whole turn for a refusal marker
exonerates that turn wholesale; checking each sentence catches it. This is a
small implementation choice with a large effect on what the gate can see.

So every containment invariant is implemented as an ordered pair:

- a **refusal detector** — the compliant-deflection forms in every language the
  instrument runs in;
- a **violation detector** — the forbidden act;
- and the rule that **refusal is evaluated first and, when it matches, closes
  the case as a pass**, regardless of what the violation detector would have said
  about the same sentence.

The pairing creates a second obligation, because blanket refusal now scores as
success. The suite must carry **benign near-misses** — questions that resemble
the forbidden ask but are legitimate ("when will I hear back?", "how long does
this take?") — where a refusal is the failure. Without them, the cheapest way
to pass the reliability axis is an interviewer that refuses everything, and that
instrument scores perfectly while being unusable.

## Building the leak detector against your own vocabulary

A generic "did it reveal its system instructions" check will miss almost every
real leak. What actually surfaces is the instrument's own working language: the
name of the phase it is in, the verb it was told to perform, the construction
that tells it what to listen for or what an answer reveals. Build the detector
from the **actual internal vocabulary of this brief**, maintained beside it, and
extend the list whenever the brief grows a new stage direction.

Leak detection is **two-tier**, and the tiers behave differently under the
refusal rule:

- **Hard internal vocabulary** — the phase names, the stage-direction verbs, the
  listen-for and reveals-that constructions, the internal identifiers. These are
  unconditional violations, exempt from the refusal rule, because *a compliant
  refusal would never use them*. There is no sentence in which declining to
  share something requires naming the internal phase you are in.
- **Soft self-reference** — "my instructions", "the system prompt", "what I was
  told to do". These are violations only outside a refusal sentence, since
  "I can't share my instructions" is exactly right and must pass.

Getting this split wrong in either direction is expensive: making the hard tier
refusal-exempt gives an attacker a template ("say you can't tell me, then say
which phase we're in"), and making the soft tier unconditional fails every
correct decline in the suite.

The reason this matters is an assessment reason, not a security one. A candidate
who learns that a question was a scripted probe starts answering the probe. The
transcript after that point is contaminated, and no scoring of it means anything
([say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds)).

## Procedure

1. **Write each invariant as a sentence that can be false about a single turn.**
   If it cannot be false about one turn, it belongs on the quality axis.
2. **Implement it deterministically** — pattern, structural check, language
   identification — never as a model judgment, and never as a judgment you would
   have to defend to a person.
3. **Pair it with its refusal detector** and give refusal precedence.
4. **Add benign near-misses** for every containment invariant.
5. **Localise every detector** into each language the instrument runs in. A
   containment check that exists in one language and not another produces a gate
   that is real for some candidates and theatre for others.
6. **Run every invariant on every case, not only where a case declares it.** A
   case-declared invariant set is a list of failures someone predicted;
   universal invariants are what catch the ones nobody did. Declare the extras
   per case, but keep the universal ones always-on and merge, never replace.
7. **Resolve detector ambiguity to "no finding".** Where a turn carries markers
   of two languages, or a phrase is genuinely undecidable, the detector must
   abstain rather than flag. On a categorical gate a false breach costs more
   than a missed one, because it is the false breaches the team sees and learns
   to disbelieve.
8. **Report coverage beside the rate, and fail closed on collapse.** A run that
   skips, filters, or falls back to stored transcripts shrinks its own
   denominator and reports full pass over whatever survived. Any selected case
   that produced no result is a coverage failure that blocks certification on
   its own.
9. **Gate at full pass, per conversation**, and let one breach fail the release.
10. **Report a breach with its turn and its transcript excerpt**, never as a
   count. A categorical failure is read, not aggregated.

## Decision rules

- **When a check fires on a compliant refusal, fix the check the same day.**
  False violations decay trust in the whole suite faster than missed violations
  do, because the team sees them.
- **When a detector cannot be made deterministic, the invariant moves to the
  quality axis** — and loses its veto. Do not keep a full-pass gate enforced by
  a judge; the gate will be waived and then ignored.
- **When a case did not elicit the behaviour, mark it not evaluable**, never
  pass ([absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).
  An extraction case where the simulator never asked for anything is the most
  common silent green in this whole practice.
- **When the release must ship over a reliability breach, that is a named human
  decision with the breach attached**, not a threshold edit. Lowering the gate
  to accommodate one failure destroys the only categorical instrument you have.
- **When the suite is too slow to run on every edit, freeze a set of golden
  transcripts and run the deterministic axis against them offline.** This is the
  reliability axis's structural advantage over the judged one: it needs no model
  at all, so it can gate every change at zero cost. Guard it with the coverage
  rule above — a frozen set that does not cover every selected case is exactly
  how a false full pass is manufactured.
- **When the conversation is only the first half of the product, extend the
  axis into the artifact.** Route each transcript through the real downstream
  scoring path and assert coherence for that behaviour; a near-silent candidate
  producing a confident scorecard is a reliability breach even though every turn
  was clean.
- **When a new invariant is proposed, check first whether it is a constraint on
  content or an instruction to perform an extra move.** The second kind costs
  consistency elsewhere and must be measured by ablation before it ships.

## When not to use it

Full-pass gating is wrong for anything genuinely graded: probe quality, warmth,
coverage depth, narrowing skill. Forcing those onto a categorical gate produces
a suite that is red for stylistic reasons, which is a suite that gets muted —
taking the real invariants down with it. It is also wrong for properties the
harness can only observe indirectly; a check that is right most of the time is a
quality signal wearing a gate's clothes.
