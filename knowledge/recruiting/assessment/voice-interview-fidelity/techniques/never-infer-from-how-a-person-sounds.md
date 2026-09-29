---
layer: technique
type: technique
subject: voice-interview-fidelity
technique: never-infer-from-how-a-person-sounds
status: forged
laws: [inference-must-look-like-inference, meaning-does-not-live-in-a-label, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [writing a prompt that reads an interview transcript, a rating mentions confidence fluency or hesitation, evaluating a vendor claim about voice-based trait prediction]
---

# Never infer anything from how a person sounds

Nothing about *how* a candidate spoke may enter an assessment. Only *what* they
said may. Fluency, accent, grammar, pace, pitch, volume, hesitation, filled
pauses, silence and vocabulary range are excluded from every rating, every summary
and every recommendation, and the exclusion is written into the instructions
rather than assumed.

## The concern

A spoken channel makes manner-of-speech available to every model downstream, and
manner-of-speech correlates with almost everything a hiring process is forbidden
to use: first language, national origin, region, class, age, neurotype,
disability, hearing, a stammer, a cold, a bad connection, and how frightened the
person is. It correlates with job performance far more weakly than with any of
those.

The empirical record is unambiguous for anyone who goes looking. Voice- and
video-based trait prediction has the weakest validity evidence of any major
automated hiring application. External stability audits perturb the input in ways
the underlying trait cannot have changed and watch the predicted traits move. The
one prominent vendor whose withdrawal is documented removed its visual-analysis
component and gave as its reason that non-verbal data added little predictive
power beyond the language of the answers; that is a statement about predictive
value, not an admission of invalidity, and it said nothing about audio. Prosodic
features are confounded by accent, language proficiency and anxiety by
construction, so a construct-validity argument for them has to clear a bar nobody
has cleared. Treat the family as unvalidated. Treat a validation claim as
requiring evidence of stability across accent, first language and disability
before it is worth reading at all.

There is also a plainer argument that needs little literature. Interview anxiety
depresses performance: a meta-analysis of 30 samples found a correlation of about
-.19 with interview performance, -.13 in real interviews (Powell and colleagues,
2018). Whether it hits hardest the candidates with least practice was not
established, because interview experience could not be tested as a moderator, so
that step is reasoning and not a finding. Even so, a system that reads nervousness
as a trait is measuring the state of the candidate on the day and calling it
character.

The rule also has a legal edge in one place. The EU AI Act bans systems that infer
emotions in the workplace, and the Commission's guidelines apply that to candidates
in recruitment (paragraph 254); they exempt the mere detection of a readily
apparent voice characteristic unless it is used to infer emotion (paragraph 249).
The ban covers emotions and intentions inferred from the voice, so it is narrower
than this rule, which also excludes inferring competence and "presence" from
delivery.

## The rule, and how to write it

The prohibition goes into the instruction text that reads the transcript, in
affirmative form, near the constraints that cannot afford a violation:

- No penalty for grammatical error, non-standard usage, limited vocabulary, or a
  heavy accent.
- No credit for polish, fluency, articulacy or "communication presence" unless
  communication is a scored competency of the role.
- No inference of confidence, nervousness, honesty, enthusiasm, engagement,
  leadership or cultural fit from pace, pitch, pauses, filler or volume.
- No reading of silence as ignorance, and no reading of speed as competence.
- Where the interview is conducted in a language that is not the candidate's
  first, language performance is explicitly out of scope.

And the affirmative half, which changes more ratings than all the bans combined:
**"I don't know" is a good answer.** A candidate who declines to bluff has at least
marked the edge of what they know. No study was found linking that to hiring
outcomes, so this is a fairness position, not a validated signal. A rubric that
rewards a confident wrong answer over an honest gap rewards projection, and it
will do so systematically in favour of candidates trained to project certainty.

## The line that is actually hard

The workable distinction is **content versus delivery**, and it holds up under
pressure better than any list of banned words.

- Transcribing a specific claim is content: *the candidate said they led a team of
  eight*. Legitimate, quotable, scoreable.
- Interpreting the delivery of that claim is not: *they said it hesitantly, which
  suggests exaggeration*. This is an inference from manner, it has no evidential
  basis, and it will be applied unevenly.
- Substance of an answer that happens to be short is content: *the candidate could
  not describe how the system handled failures*. Legitimate.
- Length or pausing as a proxy for substance is delivery: *answers were brief and
  halting, suggesting shallow experience*. Forbidden.

Where communication genuinely is a bona fide requirement — a role that presents,
negotiates or teaches — it is assessed as its own competency with behavioural
anchors about being **understood**: whether the explanation landed, whether the
audience's question was answered, whether the technical point survived
simplification. It is never a global impression of how the person sounded, and it
is never applied to roles that do not require it because the transcript made it
available. The competency's own label carries none of this;
[meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label),
so an axis called "communication" with no anchors is exactly the place manner
re-enters.

## Decision rules

- **When a drafted rating mentions manner, reject the rating, not just the
  sentence.** The manner language is usually a trace of the judgment, not an
  ornament on it; deleting the phrase leaves the inference in the number.
- **When a hesitation genuinely matters — a claim the candidate visibly retreats
  from — record what they said, not how they said it.** "Initially said eight,
  later said three or four" is content. "Seemed unsure" is not.
- **When a model must summarise, require the summary to be traceable to words the
  candidate spoke**, and where it is not, mark it as inference rather than
  observation
  ([inference must look like inference](../../../_laws.md#inference-must-look-like-inference)).
- **When the audio was poor, resolve toward the candidate**
  ([uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
  Garbled speech is a channel fault. It is never evidence about the speaker.
- **When a vendor offers voice-derived traits, require the stability audit before
  the pilot**, not after. A pilot generates decisions about real people that
  cannot be recalled.

## When not to use it

- **Assessments where the vocal performance is the work itself** — voice acting,
  broadcast, interpreting, some language teaching. There the manner is the
  content, and it is assessed openly against a stated standard, with the same
  anchor discipline as any other competency.
- **Clinical or accessibility contexts** outside hiring, which have their own
  consent and purpose framework and are not governed by this rule.
- It is never suspended because the interview was for a "client-facing" or
  "senior" role. That phrase is the most common route by which prestige-dialect
  preference re-enters a process that had banned it.
