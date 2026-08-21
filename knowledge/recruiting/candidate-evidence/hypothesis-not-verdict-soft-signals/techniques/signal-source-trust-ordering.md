---
layer: technique
type: technique
subject: hypothesis-not-verdict-soft-signals
technique: signal-source-trust-ordering
status: forged
laws: [inference-must-look-like-inference, a-candidates-process-never-stalls-on-your-constraints, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [mixing deterministic detectors with model-emitted flags, ordering a panel of signals for a reader, deciding what a signal's confidence is allowed to be]
---

# Signal-source trust ordering

Two rows on a screening panel: one computed by arithmetic over parsed dates, one
produced by a language model that read the document and formed an impression. They
render identically, they both say "needs confirmation", they both carry a
confidence. A reader with thirty seconds prices them the same, and one of them is
worth several times the other.

Trust ordering is the rule that **a signal's source is a field, the field has a
fixed order, and the order governs rendering, confidence ceilings and what the
signal is allowed to cause.** It is the mechanism by which a mixed panel stays
honest ([inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference)
applied to a list rather than to a sentence).

## The tiers

1. **Behavioural** — what the person actually did under conditions you set: work
   submitted to a sample, conduct inside your own process. This is observation,
   not inference, and it outranks everything below because nobody had to guess.
   Define this tier even before you can populate it — a panel whose top tier is
   declared and never emitted is at least honest about its own ceiling, and the
   declaration is what tells the next contributor where a work-sample result is
   supposed to land.
2. **Document-structural** — arithmetic over parsed career data. Tenure averages,
   claim counts, presence of quantities. Deterministic, model-free, cheap,
   testable, reproducible from the same input.
3. **Document-hypothesis** — a reading of what a document's shape suggests. Still
   rule-driven, but interpretive. The natural home of most soft signals.
4. **Model-emitted** — a language model's own risk or strength impressions. A wide
   net over things no rule anticipated, and the least trustworthy tier available:
   it cannot show its arithmetic, it varies between runs over identical input, and
   it is fluent enough that a guess reads like a finding.

The gap between 2 and 4 is the one that matters in practice, and the tempting
mistake is to collapse it because the model's sentence is better written.

## Procedure

1. **Build tiers 1–3 first and ship them alone if you must.** A deterministic
   panel is a complete product: it produces the checklist, it costs nothing per
   candidate, it can be pinned by tests, and it is the same next year. A panel that
   only works when a model call succeeds is a panel that fails a candidate for an
   outage — the process must continue on the deterministic path with provenance
   downgraded rather than stall
   ([a-candidates-process-never-stalls-on-your-constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
2. **Fold model flags in beneath the deterministic ones, explicitly labelled.**
   Not merged, not interleaved by confidence — appended, under their own heading,
   as the lower-trust tier they are.
3. **Cap confidence by tier, and let only the deterministic tiers earn their way
   up.** A deterministic detector may scale its confidence with the number of
   observations behind it — one unevidenced claim is a shrug, five is a pattern —
   to a ceiling below certainty, because a document can never justify certainty. A
   model-emitted signal gets a flat, low number set by the tier, not by the model:
   if it returns 0.9, clamp it and record that you clamped it. A self-reported
   confidence is evidence about the model, not about the person.
4. **Deduplicate across tiers, keeping the higher.** When the model says "seems to
   move often" and the arithmetic already said "1.4 years across 4 roles", the
   arithmetic wins and the model row disappears. Otherwise one fact renders as two
   and reads as corroboration, when it is a copy.
5. **Never let a lower tier contradict a higher one into silence.** A model
   impression that conflicts with observed behaviour or with the candidate's own
   stated claim **lowers confidence** in the inference; it does not override the
   record. This is the pattern the archetype-routing sibling holds and it
   generalises exactly.
6. **Bind each signal to what produced it** — the document version, the detector
   version, the model version and the rubric. A signal re-rendered after any of
   those change is a different signal
   ([a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
7. **Make the tier visible to the reader, in words.** "Counted from the dates on
   the document" and "suggested by an automated reading" are the two sentences a
   recruiter needs; a coloured badge nobody has a legend for is not trust ordering.

## Decision rules

- **When a model-emitted signal is the only support for a concern, it may produce
  a question and nothing else** — never a hold, never a rank change, never a line
  in an explanation to a candidate.
- **When a deterministic detector can be written for something the model keeps
  flagging, write it.** The model's recurring flags are the best available backlog
  of detectors worth promoting a tier.
- **When the model returns a flag in a category the system forbids — temperament,
  motivation, loyalty, anything read off a protected characteristic — drop it
  before it reaches storage**, not at render time. A forbidden inference that
  exists in a record will eventually be exported by someone.
- **When tiers disagree about direction, show both with their sources and resolve
  nothing.** Disagreement between an observation and an impression is itself
  informative, and forcing a synthesis is where a panel becomes a verdict.
- **When a run is degraded or the model tier is missing, say so on the panel.** A
  panel silently missing its lowest tier is fine; a panel silently missing its
  deterministic tiers is an all-clear nobody computed.

## When not to use it

- **Where all signals genuinely share one source.** A purely deterministic panel
  does not need tier labelling on every row — state the source once at the top.
- **As a ranking device.** Trust ordering orders *display and permission*, not the
  candidate's position. Sorting candidates by how much their flags are trusted is
  the same scoring mistake in a new coat.
- **As a substitute for deleting bad signals.** Demoting a character inference to
  the lowest tier does not make it admissible. The tiers order legitimate signals;
  they do not create a basement where illegitimate ones may live.
