---
layer: technique
type: technique
subject: quality-gates
technique: shared-substrate-check-partition
status: forged
laws: [one-authority-per-vocabulary, count-carries-predicate]
shared_with: []
use_when: [two checks run on the same judgment engine over the same artifact, a judgment gate withholds approval on nearly everything, splitting an automated reviewer into a correctness check and an eligibility check, an automated check keeps reporting findings another check already owns, writing the brief for a check whose scope cannot be set by configuration]
---

# Partitioning two checks that share one substrate

[instrument-answers-only-its-own-question](./instrument-answers-only-its-own-question.md)
covers the partition a reader has to *discover*: two tools read one file, the
overlap was switched off in one of them years ago by a configuration nobody
reads, and the cheap green means less than it looks. This is the same partition
seen from the author's chair, in the case where **there is no configuration to
switch anything off with** — because both checks are the same engine reading the
same artifact, and their scopes exist only as the words each was given.

That case is now ordinary. A judgment engine is asked *is this change correct?*
and, separately, *may this change merge without a person?* Same diff, same model,
two runs. Nothing structural separates them, so if the partition is not written
into each brief, both drift onto the same ground: the eligibility check
re-litigates correctness, finds the same things the correctness check found,
and reports them as reasons to escalate.

## An unbounded judgment question has a trivial answer

The failure has a specific shape, and it is not noise. Ask an open question —
*could a person add value by reviewing this?* — and the honest answer is always
yes, for every change, forever. A check built on that question does not
occasionally over-escalate; it escalates everything, correctly, and the
escalation carries no information. The gate then dies of the ordinary cause
([false-positive-economics](./false-positive-economics.md)): a signal that fires
on all inputs is read as firing on none.

The construction that fixes it is to invert the question and bound it:

> Not *could a reviewer add value here* — a reviewer always could. **Is the risk
> of this specific category high enough that this must not merge without a person
> deciding?**

Paired with an enumeration, so the check has a finite thing to answer against
rather than a mood to consult. Both halves are needed: the inverted question with
no list is still unbounded, and a list under the un-inverted question is read as
examples rather than as the whole domain.

## Three clauses each brief needs

**A stated negative scope, naming the owner.** Not "focus on eligibility" but
*correctness is out of scope here, the correctness check owns it, do not withhold
for a correctness reason*. A positive scope alone does not partition — it says
what to look for and leaves everything else admissible, and the shared substrate
will find everything else. Name the sibling check, so the exclusion reads as a
handoff rather than as an instruction to care less
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

**The sibling's verdict inherited as a premise, with the dependency ordered.**
The eligibility check runs *after* the correctness check and is told to treat its
pass as settled: if correctness passed, the code is correct for the purposes of
this decision. Without the premise the exclusion is unusable — a check told not
to consider correctness, with no ruling on correctness in hand, has to either
ignore a real risk or smuggle the concern back in under another name. The
ordering must be real in the pipeline, not merely asserted in the brief; an
inherited premise from a check that did not run is
[unknown read as a value](../../../../_laws.md#unknown-is-not-a-value).

**An explicit not-reasons list.** The counterpart to the withhold enumeration,
and the clause most often skipped: the cases that look like they belong and do
not — a large diff, a broad mechanical refactor, a change that merely *feels*
important, new behaviour that is not a contract change. A judgment engine
generalises from the withhold list toward anything resembling it, and the
not-reasons list is the only available boundary. It is the prose analogue of
narrowing a detector: each entry is a false-positive class, named once, in the
one place the instrument reads.

## The precision control is prose, and it is graded like a detector

A numeric detector is tuned by threshold; a judgment check has no threshold, so
its precision is set entirely by what its brief says to flag and what it says to
leave alone. Written as one instruction covering several concerns, the severities
collapse into each other and the whole check reports at the loudest one. Written
as one file per concern, each carries its own model of the defect, its own flag
list, its own **do-not-flag** list, and its own severity — and severity can then
be calibrated to the concern's actual blast radius rather than to the reviewer's
tone.

Two properties make such a brief gradeable rather than merely well-written:

- **The do-not-flag list is the tuning surface.** Every recurring false positive
  becomes a clause in it. This is `narrow the detector` from
  [false-positive-economics](./false-positive-economics.md) with prose as the
  configuration language, and it is the reason a per-concern split is worth the
  duplication: a single brief has one do-not-flag list serving several concerns
  and each addition blunts all of them.
- **The brief states which side of the error to prefer, and why.** *When unsure
  whether a charge is redundant, prefer silence: a missed nit costs nothing, a
  false alarm trains the team to ignore the check.* An error preference stated
  inside the instrument is what makes the instrument's misses readable as design
  rather than as failure, and it belongs in the brief because there is nowhere
  else to put it.

## Scope the brief to what its evidence can reach

Two checks may share a concern and differ in what they can *observe* — one reads
a diff, the other can run the system. Where that is so, say it in both briefs and
name the boundary: *this is diff-level review only; the executable check is the
other one; do not claim a finding you cannot see in the change.* Without that
line the weaker check reports the stronger one's findings on inference, which is
a fabricated finding wearing the right vocabulary
([count-carries-predicate](../../../../_laws.md#count-carries-predicate) — the
finding carries the evidence class it was reached by). This is the same partition
again, cut along evidence rather than along subject matter.

## Decision rules

- Two checks on one engine over one artifact are partitioned by their briefs or
  not at all. Write the exclusion, not just the focus.
- Every judgment gate states the question it answers in bounded, inverted form,
  plus the enumeration it answers against.
- Name the sibling that owns each excluded concern, order the dependency in the
  pipeline, and let the downstream check inherit the upstream verdict as a
  premise.
- Ship a not-reasons list with every withhold list, and treat each new entry the
  way a detector treats a narrowed pattern.
- One brief per concern, each with its own severity; a brief covering several
  concerns reports all of them at its loudest severity.
- Where two checks differ in reachable evidence, state the evidence boundary in
  both, and forbid the weaker one from claiming what only the stronger can see.
