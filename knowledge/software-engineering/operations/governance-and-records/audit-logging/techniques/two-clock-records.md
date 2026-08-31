---
layer: technique
type: technique
subject: audit-logging
technique: two-clock-records
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value]
shared_with: []
use_when: [a fact is learned after it happened, designing the time columns of a ledger, a report over a past window must be reproducible later]
---

# Two-clock records

A ledger entry carries a time. Almost every ledger carries exactly one, and the
single column silently conflates two different facts that routinely disagree:
**when the thing happened**, and **when this system learned it happened**. They
are equal only when every fact arrives instantly and correctly, which is the
case the design is usually built for and the case that stops holding the first
time a correction, a backfill, a late-arriving event or an offline client shows
up.

## The two clocks

- **Effective time** — when the fact was true in the world. The transaction
  occurred on the 13th; the employee's role changed on the 1st; the reading was
  taken at 04:00.
- **Recorded time** — when this ledger learned it. The transaction was reported
  on the 15th; the role change was entered on the 9th; the reading arrived after
  the device reconnected.

A ledger that stores one of these has made the other **unrecoverable**, and
which one it lost determines which class of question it can no longer answer:

| stored clock | can answer | cannot answer |
| --- | --- | --- |
| recorded only | "what did we believe on the 13th?" | "what was actually true on the 13th?" |
| effective only | "what was true on the 13th?" | "what did we believe on the 13th, and when did we find out we were wrong?" |
| both | either, and the difference between them | — |

The second question in the bottom-left cell is the one that matters under
scrutiny. A reviewer asking why a decision was made needs the state of belief
at the moment of the decision, not the corrected state as understood today; an
investigator asking what really happened needs the opposite. **Both are correct
answers to the same query, and they differ.** A ledger with one column forces
every reader into whichever question it kept and offers no signal that the other
existed.

## This is not the same as correcting by appending

[append-only-design](./append-only-design.md) already settles the mutation
question: a wrong record is corrected by writing a new record that references
it, never by editing in place, and the correction carries who corrected it,
when, and why. That discipline is necessary here and it is not sufficient,
because everything it records about the correction is on the **recorded**
clock. The trail then holds the error, the correction, and the time the
correction was made — and still cannot say *when the corrected fact was
actually true*.

The consequence is concrete. A ledger of this shape can reconstruct its own
history of belief perfectly and cannot reproduce any report about the world.
Re-running last quarter's report gives today's numbers, because the corrections
entered since have no effective date to be excluded by, and the original report
becomes unreproducible — which is the property audit trails exist to provide.

The rule follows directly: **record the fact as soon as you learn it, with both
times.** Never delay a write to make the two agree, and never adjust a stored
effective time to the moment of writing.

## The query obligation

Once both clocks exist, a time window is no longer a well-formed filter. "All
entries between the 1st and the 30th" has two different correct answers, so
**every query, report and export states which clock it ranges over, and carries
that statement into its output.** A number that travels without its clock is a
number without its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)), and
this is the failure's usual form: two reports over "the same period" disagree,
both are right, and the disagreement is discovered in the meeting rather than in
the query.

Three practical requirements follow:

- **Name the clock in the interface**, not in a convention. A window parameter
  that does not say which time it filters will be used against whichever column
  the implementer reached for.
- **Make as-of reproducibility explicit.** The strongest form is a query that
  takes both — the effective range *and* the recorded instant to view it from —
  which reproduces any historical report exactly, including its errors.
- **Label the output.** An exported report states the clock and the as-of
  instant, because the person reading it six months later cannot recover either.

## Record first, interpret later

The two-clock shape only pays if the ledger stays a record of facts rather than
of conclusions. The discipline is to split the layers:

- The **recording layer** stores what was learned and when, with both clocks,
  and applies only the rules that are true everywhere — the ones that would be
  wrong to violate regardless of jurisdiction, product or policy.
- The **reporting layer** interprets. Which corrections count for a given
  period, how a backdated entry affects a closed month, which of the two clocks
  a given audience should see — these vary by regulation, by business and over
  time, and every one of them baked into the record is a decision that cannot be
  revisited without rewriting history.

The test for whether a rule belongs downstairs: *if this rule changed next year,
would we want the old records to reflect the old rule or the new one?* If the
old records should follow the new rule, the rule is interpretation and belongs
in the reporting layer.

## Failure modes

- **Ingestion time used as if it were event time.** The most common single-clock
  design, and it silently misattributes every late arrival to the moment of
  arrival. It looks correct for as long as nothing is ever late.
- **Backdating by mutation.** Discovering the missing clock and fixing it by
  editing the stored time — which trades a modelling defect for a trust defect,
  and violates the mutation rule at the same time.
- **A null effective time defaulted to the recorded time.** This renders
  *unknown* as a specific, confident, wrong value
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)),
  and it is unrecoverable afterwards because nothing distinguishes the defaulted
  rows from the genuine ones. Where the effective time is genuinely unknown,
  store it as unknown and let queries see that.
- **A third clock, unnamed.** Systems accumulate more times — received, valid
  from, approved, posted. Two is the minimum, not the maximum; the failure is
  leaving the extras unnamed rather than having them.

## When not to use it

- **When facts cannot be learned late.** If the ledger is the origin of the
  fact — it records an action it performed itself, at the moment it performed
  it — the clocks are equal by construction, and the second column is storage
  and query complexity buying nothing. Most action-audit trails are in this
  case, which is exactly why the single-clock habit forms and then gets applied
  where it does not hold.
- **When the record is not consulted about the past**, only about the present
  state. Then the history has no readers and this is over-engineering.
- **Where a regulator or standard specifies the time semantics**, follow that
  rather than this. The obligation to state which clock a report uses survives
  regardless.
