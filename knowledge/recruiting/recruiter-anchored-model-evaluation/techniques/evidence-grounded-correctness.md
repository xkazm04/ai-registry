---
layer: technique
type: technique
subject: recruiter-anchored-model-evaluation
technique: evidence-grounded-correctness
status: forged
laws: [say-only-what-the-record-holds, a-claim-carries-its-sample-and-its-basis, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [scoring whether generated hiring text is supported by the evidence it was given, a judge is grading truth instead of support, designing the specificity dimension of an artifact rubric]
---

# Evidence-grounded correctness

Correctness in this domain is **support**, not truth. The question the judge
answers is not "is this claim accurate about the world" — it has no way to know
— but "is this claim carried by the evidence that was supplied with the
request".

That reframing is what makes the dimension mechanical. It also forces a
discipline that pays for itself elsewhere: the evidence excerpt handed to the
judge must be exactly the evidence handed to the generator. If the judge sees
more, it will grade claims the generator could not have made; if it sees less,
it will condemn claims that were properly supported.

## Three questions, kept separate

Grounding is one dimension of three, and the three must be scored against
distinct questions and never averaged into a headline. Averaging is what turns
an actionable result into the word "six".

- **Specificity.** *Is this about this candidate, or could it be pasted onto any
  candidate?* Generic praise with a name substituted is the single most common
  failure of generated hiring text. It is fluent, inoffensive, and carries no
  information — worse than an empty field, because an empty field does not look
  like evidence to the recruiter skimming it.
- **Grounding.** *Is every claim supported by the provided evidence?*
- **Completeness.** *Is every part of the asked deliverable present, in the
  asked shape?* Against the task definition, not against a general sense of
  thoroughness.

Kept apart, the result names the repair: specific-but-ungrounded is a prompt
that invites embellishment; grounded-but-generic is a retrieval problem — the
model was handed nothing distinctive to say; complete-but-generic is usually a
template masquerading as generation.

## Procedure

1. **Give the judge the same evidence the generator had**, verbatim, and say so
   in the prompt: this excerpt is the whole basis.
2. **Ask for claim-level extraction before scoring.** The judge lists the
   assertions the artifact makes about the person or the role, then labels each
   *supported*, *contradicted*, or *unverifiable*. Scoring after enumeration is
   markedly more stable than scoring by impression, and the enumeration is the
   artifact a human reviewer can check.
3. **Require a verbatim quote for every contradiction.** A judge that cannot
   point at the line it objects to has produced an opinion, and an opinion
   cannot be argued with or shown to be wrong.
4. **Score the dimension from the labelled claims**, with only contradictions
   carrying a penalty — see the companion technique on why unverifiable is a
   separate state.
5. **Carry the sample.** A grounding rate is a rate; report how many claims and
   how many artifacts it came from
   ([a-claim-carries-its-sample-and-its-basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## Specificity without an arms race

Specificity is the dimension most vulnerable to being gamed by the generator,
because the cheap way to look specific is to restate the input. A summary that
recites the job titles from the résumé is maximally specific and adds nothing.

Two defences. First, ask the specificity question in the pasteable form — *could
this sentence be moved to another candidate's file unchanged* — which restated
facts fail and pure recitation passes, so pair it with the second. Second,
require that specificity be earned by **inference from evidence**, not by
copying it: a sentence naming what the candidate's history implies about the
role, tied to the fragment it rests on. Inference must still read as inference
when it reaches a person, which the neighbouring labelling practice governs;
here it simply must not be scored as fact.

## Decision rules

- **When a claim is supported by the excerpt but the excerpt itself is wrong,
  the artifact is still grounded.** Bad input is an intake defect, and routing
  it to the generation score hides it. Log it against the evidence source.
- **When the artifact contains no checkable claims at all, that is a
  specificity failure, not a grounding pass.** A perfectly vacuous text has a
  perfect grounding score, and a rubric that reports it as a strength is
  actively misleading. Report grounding beside a claim count and treat a near-
  zero count as its own finding.
- **When the judge's evidence excerpt is truncated differently from the
  generator's, discard the run.** The verdict is bound to what it judged
  ([a-verdict-is-bound-to-what-it-judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged));
  a mismatched excerpt makes the number meaningless in an undetectable
  direction.
- **When a claim concerns a protected or sensitive attribute, it is a
  categorical failure regardless of support.** An inference about age, health,
  origin or family status does not become acceptable by being derivable from the
  document. That gate lives outside the graded scale.
- **When grounding scores are uniformly high across every model, check that the
  evidence excerpt is actually reaching the generator.** A model handed nothing
  writes generically, and generic text contradicts nothing.

## When not to use it

Do not apply this dimension to artifacts that are not supposed to be evidence-
bearing — an outreach message whose job is to describe the role, not the person,
is graded on the role facts it was given, and asking a candidate-grounding
question of it produces a meaningless zero.

Do not use a judged grounding score where a deterministic check exists. If the
artifact must not contain a compensation figure absent from the supplied facts,
that is a rule, and rules do not belong on a graded scale where fluent prose
elsewhere can pay for a violation
([say-only-what-the-record-holds](../../_laws.md#say-only-what-the-record-holds)).
