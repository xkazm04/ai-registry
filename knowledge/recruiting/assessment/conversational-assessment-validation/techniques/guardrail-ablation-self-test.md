---
layer: technique
type: technique
subject: conversational-assessment-validation
technique: guardrail-ablation-self-test
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [adding a new rule to an automated interviewer, a well-motivated guardrail may be doing more harm than good, deciding whether a rejected wording should be kept in the record]
---

# Guardrail ablation self-test

The instinct after an incident is to add a rule. It is almost always the wrong
first move, because a conversational instrument's compliance is a finite budget:
every rule added competes with every rule already there, and the new one may
cost more elsewhere than it buys where it was aimed. Ablation is the experiment
that measures that trade before it ships — the instrument **with** the rule and
**without** it, across several candidate wordings, on the reliability axis.

The framing that makes this a first-class method rather than an optimisation:
**a rule can be correct, necessary, well-motivated, and still not shippable.**
An author who cannot accept that outcome will keep shipping rules that pass
review and degrade the interview.

## The three arms

Every ablation has at least three arms and the third is the one people forget:

1. **Baseline** — the current instrument, unchanged. The reference.
2. **Rule present** — the instrument plus the candidate wording, one wording per
   arm, several wordings tested. Wordings differ by grammatical form as well as
   content: a constraint on content ("never mirror a candidate's tone") and an
   instruction to perform a move ("acknowledge the tone, then redirect") are
   different experiments, not two phrasings of one.
3. **Rule present, provocation absent** — the rule shipped into ordinary
   conversations that never trigger it. This arm catches the characteristic
   damage: a guardrail that behaves correctly under the provocation it was
   written for, and degrades every conversation that never needed it.

Measure all arms on the reliability axis, per conversation, over the full cast —
not only on the behaviour the rule targets. The point of the experiment is the
collateral, and a run restricted to the targeted behaviour cannot see it.

## The result that recurs

The most common outcome for a rule that asks the interviewer to perform an extra
conversational move — acknowledge, reframe, de-escalate, summarise before
continuing — is that **every wording degrades language consistency**, and the
baseline without the rule already passes. The mechanism is understood: such a
rule forces a turn to *begin* with something other than interview content,
creating a meta turn, and meta turns are where register, person and most
brittly language come apart. The interviewer that was asked to acknowledge
hostility gracefully starts acknowledging it in the wrong language.

The mechanism is worth stating precisely, because knowing it lets an author
predict the failure instead of discovering it. A meta turn opens with a
formulaic politeness slot — an acknowledgement, a softener — and that slot is
where a competing language or register has somewhere to land. Remove the slot
and the attractor has no landing token: a turn that must **begin with the
question itself** cannot start with the wrong-language pleasantry, because there
is no pleasantry. This is why the successful repair of a drifting rule is
usually not a better acknowledgement but the removal of the acknowledgement —
"ask the follow-up plainly and directly, with no preamble" — and why condensing
several separate rules into one governing paragraph often fixes what rewording
them individually could not.

A measured example of both outcomes at once: five wordings of one hostility rule
— including per-language conditionals and explicit bilingual examples — each
drove language drift on hostile conversations in the language the rule was
*not* exemplified in, while the baseline without any hostility rule passed
consistently. The rule did not ship. In the same programme, the adjacent craft
rules did ship, but only after being condensed into a single paragraph and
rewritten so the follow-up turn begins with the question. Same experiment, one
rejection and one acceptance, and neither was predictable from reading the text.

When that is the result, the rule does not ship. And then the part that matters:
**the negative result is written down and kept, with every wording, its
measurement, and the date.** An unrecorded rejection is re-derived by the next
author — the motivation is still valid, the incident is still in memory, the
wording still reads well — and shipped blind. Keeping rejected wordings beside
the brief, explicitly marked as measured-and-not-shipped, is one of the
highest-leverage habits in this practice and one of the rarest.

Keep them *live*, not archived. A rejected rule should sit in the same place the
shipped rules do — defined, carrying a dated warning that says what was measured
and why it is excluded, excluded by being absent from the list the instrument
actually assembles rather than by being deleted. Where the same instrument is
assembled in more than one runtime, keep the rejected wording synchronised
across all of them too, so that re-testing a new phrasing later is one edit
rather than an excavation. A comment in a change history is not this; nobody
reads change histories before adding a rule.

## Procedure

1. **State what the rule is for** as a behaviour in the cast, and confirm the
   cast can actually elicit it. A rule aimed at a behaviour with no test is
   unmeasurable and should not be written.
2. **Write three to five candidate wordings**, spanning both grammatical forms
   and at least two positions in the document. Position is part of the
   experiment, not a detail.
3. **Run every arm over the full cast**, reliability axis first, with equal
   conversation counts, and record the count
   ([a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
4. **Include the no-provocation arm.**
5. **Compare each arm against the baseline, not against each other.** The
   question is whether the rule is worth its cost, and only the baseline answers
   it.
6. **Decide, and record the decision with its evidence** — shipped with its
   measurement, or not shipped with its measurement. Both outcomes are written
   into the record; only one changes the instrument.
7. **Re-open the question when the underlying engine changes**, since the result
   binds to what was tested
   ([a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)),
   and mark the stored result as superseded rather than deleting it.

## Decision rules

- **When the baseline already passes the behaviour the rule targets, do not ship
  the rule.** This is the single most useful thing ablation finds, and it is
  invisible without the baseline arm.
- **When every wording degrades some other invariant, the rule is not a wording
  problem.** Stop rewording. Either the behaviour must be handled outside the
  brief, or it must be accepted.
- **When only the constraint-on-content form survives, ship that form and record
  why the move-performing forms failed** — the next author will otherwise
  prefer the more natural-sounding one.
- **When a rule helps its target and costs a quality metric but no reliability
  invariant, that is a judgment call with a named owner**, not an automatic
  rejection.
- **When an ablation cannot be run because the rule's behaviour is not in the
  cast, add the behaviour first.** Shipping an unmeasurable guardrail is how a
  brief grows past the point where any of it is followed.
- **When a shipped guardrail is later suspected, ablate it again rather than
  removing it on intuition.** Removal is a change and carries the same evidence
  burden as addition.

## When not to use it

Ablation is expensive — several full cast runs per rule — and it is not
warranted for every edit. Reserve it for rules that add a conversational move,
for rules introduced in response to an incident (where urgency is highest and
judgment worst), and for rules touching register, language or the closing
sequence. A pure content constraint that narrows what a turn may contain rarely
needs it; a regression diff is enough. It is also the wrong instrument for
comparing two entirely different briefs — that is a baseline comparison, not an
ablation, and an ablation framing there will attribute a whole-document
difference to one rule.
