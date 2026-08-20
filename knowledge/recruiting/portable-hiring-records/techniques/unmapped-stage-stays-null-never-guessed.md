---
layer: technique
type: technique
subject: portable-hiring-records
technique: unmapped-stage-stays-null-never-guessed
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate, a-candidates-process-never-stalls-on-your-constraints]
use_when: [an imported stage has no configured mapping, choosing a default for an unresolvable pipeline state, deciding what a board shows for a record whose stage is unknown]
shared_with: []
---

# Unmapped stage stays null, never guessed

## The concern

An external stage arrives that the organisation's mapping does not cover — a
column added last week, a renamed step, a workflow nobody configured. The
importer must put *something* in the pipeline-state field, and every available
shortcut is a lie about a real person:

- **Nearest match** claims a stage role on the strength of a string
  resemblance.
- **Head of the funnel** puts a candidate who is mid-interview back at the top
  of the board, where they read as a new applicant nobody has looked at.
- **Terminal** — the rarest and worst — concludes someone's process.
- **Carry the previous value** asserts that nothing changed upstream, which is
  the one thing you know is false, because the stage you could not map is
  evidence something did.

Each of those produces a confident value. None of them is a measurement. The
correct output is an explicit *unmapped* state: a distinct value, not a role,
that no rule may act on and that renders to humans as unknown. This is
[absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)
applied at an integration boundary, where the pressure to produce a value is
strongest because a field is waiting for one.

## The procedure

**1. Make unmapped representable.** The pipeline-state field must have a state
that is not a role — null, or a sentinel typed distinctly from every role.
A schema that cannot express "unknown" forces the guess, and no amount of
discipline downstream recovers from a type that has no room for the truth.

**2. Keep the raw label.** Store the external stage string verbatim alongside
the unmapped marker. Without it, the operator who must fix the mapping cannot
see what needs mapping, and the record is unrecoverable rather than merely
unresolved.

**3. Import the rest of the record.** An unmappable stage does not make a
candidate unimportable. The person, their documents and their history are
still true; only their position is unknown. Refusing the whole record because
one field is unresolved loses data that was fine.

**4. Exclude from anything that acts.** No automated advance, no automated
rejection, no stage-triggered message, no aging clock, no inclusion in a
funnel denominator. An unmapped record is outside the coordinate system, and
every consumer must treat it as such rather than defaulting it into one.

**5. Surface it as configuration work, prominently and with a count.** "Eleven
candidates are in stages this connection does not map" with the list of
unmapped labels and one action to map them. Not a log line. Not a silent
filter that hides them from the board — a candidate invisible to their own
recruiter because of a configuration gap is exactly the stall
[a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)
forbids, and hiding is how a two-minute configuration fix becomes a three-week
silence for a person waiting on an answer.

**6. Resolve forward on the next sync.** Once the mapping gains the row, the
next synchronisation resolves those records normally. Do not require a manual
per-record repair for something that was a per-connection configuration gap.

## The decision rules

- **When the mapping misses, write unmapped. Always.** There is no traffic
  volume, no import size and no customer deadline at which guessing becomes
  correct — the guess is not faster, it is just wrong later and by someone
  else's hand.
- **When a rule needs a role and finds unmapped, the rule does not fire.** Not
  "fires with a default"; does not fire. Where the rule's outcome would be
  adverse, this is
  [uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)
  directly: an unresolvable pipeline state must never be the basis of an
  automated rejection.
- **When a metric's population would include unmapped records, exclude them
  and report the exclusion count.** Silently dropping them shrinks a
  denominator and inflates every rate computed over it; silently including
  them as zero does the reverse. Either way the number is unattributable
  unless the count of unknowns is shown beside it.
- **When a display must render an unmapped record, say "stage not mapped" and
  show the raw label.** Never render it as the first column, never render it
  blank, and never render a plausible role name in grey.
- **When an unmapped record is the majority of a sync**, halt the run and ask.
  A single unmapped stage is configuration drift; four hundred is a
  counterparty who reconfigured their whole funnel, and continuing produces a
  board that describes nobody's process.

## The one defensible-looking exception, and why it is not one

The argument for folding unmapped records into the head of the funnel is that
*visible and slightly wrong beats invisible*. That argument has real force
when the alternative is hiding people. It fails here for two reasons. First,
the head of the funnel is not a neutral position — it is the position that
means "nobody has assessed this person yet", which is a claim, and usually a
false one about someone mid-process. Second, it is indistinguishable from a
mass reset: a dozen candidates reappearing at the top of a board with nothing
on screen explaining why is an incident that consumes a day of trust.

The correct resolution keeps the visibility and drops the false claim: render
them in a distinct, explicitly-unknown lane with the raw labels showing. You
lose nothing an operator needs and you assert nothing you cannot support.

## When not to use it

- **Where the field genuinely has a defined default in the counterparty's own
  model** — a documented state every new record starts in — that is a mapping
  row like any other, not a guess. Configure it; do not special-case it.
- **Where the record is not about a person** — a job's publication status, a
  requisition's workflow step — the asymmetry that makes guessing dangerous is
  weaker, and a documented fallback with a warning is defensible. The rule
  hardens exactly where a human's process is what the field describes.
- **For a one-shot manual migration under human review**, a person may assign
  the unresolved records by hand. That is not a guess; it is a decision with
  an actor, which is the thing an automated default is missing.
