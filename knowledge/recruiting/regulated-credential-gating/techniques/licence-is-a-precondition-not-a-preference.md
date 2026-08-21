---
layer: technique
type: technique
subject: regulated-credential-gating
technique: licence-is-a-precondition-not-a-preference
status: forged
laws: [no-adverse-outcome-is-solely-automated, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [classifying a requisition requirement as hard or soft, deciding whether a strong skills match may outweigh a missing credential, writing the requirement schema for a role]
---

# Licence is a precondition, not a preference

A requisition's requirement list is not homogeneous. Most entries are *preferences with
weight*: more of them met is better, a shortfall in one can be offset by strength in
another, and reasonable people disagree about the trade. A small number are
**preconditions**: without them the hire is not lawful, and no amount of strength
elsewhere changes the answer. This technique is the discipline of keeping the second
class out of the first.

## The two classes, and what distinguishes them

A requirement is a precondition when **an external authority, not the employer, makes
the work unlawful without it**. That is the whole test, and it is deliberately narrow:

| | Precondition | Preference |
| --- | --- | --- |
| Who defines it | statute, regulator, licensing body, or a client's contractual mandate that carries the same force | the hiring team |
| Effect if absent | no lawful hire | a weaker candidate |
| Offsettable | never | always, by design |
| Who can waive | nobody inside the company | the hiring manager |
| Fixable by the candidate | only through the issuing authority, on its timeline | often, on the job |

Everything else — a preferred certification, a vendor badge, an internal accreditation,
a "must have" that the hiring manager typed because they wanted it — is a preference,
however emphatically the requisition phrases it. **Emphasis in the requisition text is
not evidence of legal force.** "Must hold" appears in front of both classes constantly;
classification comes from the credential's own nature, which is why it is decided by a
catalog rather than by reading adjectives.

## Procedure

1. **Classify at the requirement, not at the candidate.** When a requisition is
   ingested, resolve each stated credential against the regulated catalog and stamp the
   requirement as precondition or preference *then*. Doing it at match time means every
   consumer re-derives it, and they will diverge.
2. **Carry the class in the data model, as a field.** A requirement that knows it is a
   precondition can be enforced by code that has never read the requisition prose. A
   requirement that stores only its text hands the classification job to whichever
   downstream reader has it last, which is usually a model.
3. **Forbid offset structurally, not by weighting.** A very large weight is still a
   weight, and the next person tuning the scorer will lower it. The precondition must
   sit *outside* the arithmetic: it caps the verdict, it does not subtract from it.
4. **Cap the conclusion, do not zero the score.** The skills assessment stays exactly
   as computed and stays visible — it is the right input to the reciprocity or
   sponsorship conversation that often follows. What the precondition removes is the
   *favourable conclusion*: no strong-fit verdict, no auto-advance.
5. **Show the class in the requisition editor.** The person writing the role should see
   which of their lines the system will treat as a hard gate, and should be able to say
   "that one is aspirational". Silent classification of a preference as a precondition
   is how a cohort gets excluded without anyone choosing to exclude it.

## Decision rules

- **When a requirement resolves to a regulated credential in the catalog, mark it a
  precondition**, regardless of how the requisition phrased it — because the force
  comes from the regime, not the sentence.
- **When a requirement is emphatic but does not resolve to the catalog, mark it a
  preference** and let it score. If a team believes a genuine legal requirement is
  missing from the catalog, the fix is a catalog entry with its regime named, reviewed
  by someone accountable — not an ad-hoc gate in one requisition.
- **When a precondition is unmet, the verdict is capped and a human is named**, never
  a rejection issued by the machine
  ([no adverse outcome is solely automated](../../_laws.md#no-adverse-outcome-is-solely-automated)).
- **When the same credential is a precondition in one jurisdiction and a preference in
  another, the requisition's jurisdiction decides**, and the catalog entry must be able
  to express that. Treating the abbreviation as globally regulated is the
  [meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label)
  failure applied to statute.
- **When a role only sometimes touches the regulated activity** — a generalist who may
  or may not be rostered onto licensed work — the precondition belongs to the activity,
  not the title. Split the requisition or scope the gate; do not gate the whole role on
  a task it may never perform.

## When not to use this

- **Do not use it to make a hiring manager's strong preference enforceable.** The
  technique's value is entirely in its narrowness. A precondition class that anyone can
  put a requirement into is just a very heavy weight with a compliance-sounding name,
  and it will be used to exclude.
- **Do not use it for internal policies with external-sounding names.** A company rule
  that all engineers hold a particular badge is a preference, even if the company is
  serious about it — nobody is breaking the law by hiring without it, and a candidate
  can be granted it after joining.
- **Do not use it for capability signals that happen to be certified.** A qualification
  that demonstrates ability but is not a permission to practise stays in the scoring
  model where offset is the correct behaviour.
