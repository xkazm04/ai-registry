---
layer: golden-path
type: golden-path
subject: decision-audit-and-traceability
status: forged
use_when: [designing the record a hiring decision leaves behind, answering "why did this person get this outcome" months later, deciding what a hiring audit trail must seal, defending an automated or assisted hiring decision to a regulator or a claimant]
techniques:
  - seal-actor-policy-version-and-decisive-inputs
  - capture-the-machine-verdict-before-a-human-overwrites-it
  - structured-facts-plus-a-locale-invariant-audit-string
  - hash-chained-append-only-records
  - integrity-evident-is-not-tamper-resistant
  - reason-codes-over-prose
---

# Decision audit and traceability

The deliverable of this subject is not a log. It is a **reconstruction**: given only what
was sealed, a reader who was not there — and who assumes you are shading the truth — can
re-derive why *this specific person* got *this specific outcome*, on a date months or
years gone, against a rulebook that has since changed, from a system that has since been
rewritten. And the second half of the deliverable, which is the half teams skip: the
record must state honestly what it does and does not prove.

Those two halves are one discipline. A record that over-claims is worse than a thin one,
because a thin record loses an argument while an over-claiming record loses your
credibility on everything else in the file. The moment a system says "verified" about a
chain that is merely internally consistent, or "approved by a recruiter" about a row
whose actor was inferred from whoever happened to be holding the session, the reader
stops believing the parts that were true.

## The hostile reader is the design spec

Write for three readers who arrive later, in ascending order of difficulty.

- **The future operator.** Six months on, a colleague asks why a candidate was held.
  Cheap to satisfy — most systems clear this bar and mistake it for the whole job.
- **The regulator.** Asks a *class* question: show me every automated decision of this
  kind in this period, the rule version each ran under, and who was answerable. This bar
  is cleared by *structure*, not by narrative. A million rows of free text cannot answer
  it; a hundred thousand typed rows with a policy version can.
- **The claimant's counsel.** Asks the adversarial question: prove this record was not
  written after you received my letter, prove the human you named actually looked, and
  show me the *other* candidate whose file says something different. This reader is the
  spec, because a record that survives them satisfies the other two automatically.

The hostile reader also gives you the discipline's sharpest test: **the replay test.**
Hand the sealed record to someone with no access to your live database and no access to
your current code. Can they re-derive the outcome? If any step requires reading a row
that is still mutable, or re-running a rule whose source has since changed, the record
did not reconstruct anything — it merely pointed at things that used to reconstruct it.

## Reference decays; snapshot does not

This is the load-bearing distinction of the whole subject, and almost every audit failure
reduces to it.

A record that *references* — candidate identifier, score identifier, rubric identifier —
is a record whose meaning is stored somewhere else, under someone else's control, with
its own edit history. The score was recomputed when the model was upgraded. The rubric
gained an axis. The requisition's threshold was tuned. Each of those changes is
legitimate; each of them silently rewrites the past of every decision that pointed at it.
A year later the record says the candidate scored below the bar, and both the score and
the bar are different numbers than the ones that actually decided anything.

A record that *snapshots* seals the values that were decisive, at the moment they were
decisive, in the record itself. It costs storage and it duplicates data, and both of those
objections are real and both are wrong: the duplication is the point. An audit record is a
deliberate denormalization whose entire purpose is to be immune to the drift of its
sources.

Snapshot **decisive** inputs, not all inputs. The test is counterfactual and it is
mechanical: an input is decisive if changing it changes the outcome. The threshold that
was compared against, the score that was compared, the flags that gated the route, the
rule version in force — decisive. The candidate's full document, their whole profile, the
raw payload of every upstream call — not decisive, and sealing them converts your audit
store into an unbounded, undeletable copy of your most sensitive data, which is a
liability in its own right and collides with the retention rules the consent-and-retention
seam owns. Precision here is not fastidiousness; over-sealing is the most common way an
audit system becomes the thing that gets you fined.

## Five questions, and a record that answers fewer is not a record

1. **Who** — a named natural person, or the automated process, or an explicit third state
   meaning *not identified*. Never a default, never a service account standing in for a
   person, never the session that happened to run a batch.
2. **Under what rule** — the version of the policy, rubric, threshold or prompt in force.
   Not the rule's name: its version. Names are stable while their contents change, which
   is the worst possible property for an audit field.
3. **On what evidence** — the decisive inputs, snapshotted.
4. **When** — sealed at the moment of the decision, from a clock the actor does not
   control, ordered relative to its neighbours.
5. **What the machine said before the human touched it** — the pre-override verdict,
   which is the single field most systems lose and the one that decides whether your
   human-oversight claim is provable or merely asserted.

Miss (1) and you cannot answer who is answerable, which is the one failure an audit
surface may never have. Miss (2) and you will defend a decision using today's rulebook,
which is not the rulebook that made it. Miss (3) and every explanation you offer is a
reconstruction from memory dressed as a record. Miss (4) and your record has no
credibility against the accusation that it was written last week. Miss (5) and you have
destroyed your own best evidence — the evidence that a person actually intervened.

## The naive readings, and why each fails

**"We log everything."** Volume is not reconstruction. A system that emits a line for
every state change and none for the *reason* has recorded the outcome and lost the
decision. Worse, undifferentiated volume is actively harmful under adversarial reading:
counsel will find the one line that reads badly out of context, and you will have ten
million lines with which to fail to contextualize it.

**"The audit trail is the screen."** A rendered surface is a view, not a record. If the
sentence a reader sees is composed at read time from live rows, it changes when the rows
change, and the "audit trail" is a report on the present tense. Conversely, if the
sentence was frozen at write time as prose, it is frozen in one language, in one product's
phrasing, and it cannot be filtered, counted, or translated — which the
structured-facts technique exists to resolve. Structured facts persist; sentences render.

**"The record is written after the action, best effort."** An audit write that can fail
silently while the decision commits is a system that produces unrecorded adverse outcomes
under exactly the conditions — load, incidents, retries — where you will most need the
record. For a consequential decision the record is a *precondition*, in the same
transaction as the state change: if the record cannot be sealed, the decision does not
happen. This is deliberately the opposite posture from the candidate-facing rule that a
person's own action must never stall on your constraints; the asymmetry is correct,
because an unrecorded adverse action is a harm to the candidate while a refused adverse
action is only an inconvenience to you.

**"Audit rows are rows like any other."** They are not. They are append-only. A
corrections mechanism is a *new* record that supersedes, never an edit and never a delete,
because the value of the store is precisely that nobody can revise it — including you,
including for good reasons, including to fix a typo.

**"The actor is whoever's credentials were on the request."** The actor of an audit record
is server-derived from the authenticated session and never accepted from the caller.
Anything the client can assert, the client can assert falsely, and an actor field is the
one field where a forged value converts your audit trail into a weapon against an innocent
employee.

## What the record proves — and what it does not

State the limits in the system, not just in the documentation, because a reader who
discovers an unstated limit assumes you were hiding it.

A well-built hiring audit record proves: that a record with this content existed in this
sequence at this position; that the sequence has not been altered since, to the extent the
chain verifies; that a specific policy version was in force; that a specific actor
identity was resolved by the server at write time.

It does not prove: that the facts recorded are *true* — the record is only as honest as
the process that fed it; that the named person actually exercised judgment rather than
clicking through; that no event was omitted *before* sealing, since a chain constrains
what happened to records after they were written, not which records were written; that
the operator could not have rewritten the entire chain, if the chain is keyless. That last
one is the whole of the integrity-evident-is-not-tamper-resistant technique, and stating
it plainly is a credibility asset: a team that publishes its own threat model is read as
candid, and a team that says "tamper-proof" about a keyless hash chain is read as either
naive or dishonest, both fatal.

## Coverage: an event vocabulary, closed and versioned

An audit trail can only record the kinds of things it has words for. Enumerate every
consequential thing that can happen to a candidate — created, screened, scored, advanced,
held, rejected, reversed, contacted, scheduled, no-showed, withdrawn, offered, hired,
anonymised, erased — as a closed, versioned vocabulary, and make it a review gate that a
new consequential action cannot ship without a kind. What has no kind is invisible, and
invisibility in an audit trail is not neutral: it correlates with the newest, least
reviewed, most automated parts of the system.

Two vocabularies, not one, and this is a distinction teams collapse at their cost. The
**event kind** says what happened. The **reason code** says why, and it belongs to a
smaller, stabler, deliberately closed list — see reason-codes-over-prose. Free text may
accompany a reason code; it may never substitute for one.

Three coverage disciplines separate a real vocabulary from an aspirational one:

- **Pin set-equality mechanically, from both directions.** The vocabulary the writers use
  and the vocabulary the audit surface understands must be provably the same set, checked
  both ways. Check it one way only and a kind can reach the feed while having no
  attribution — it renders as unknown, sits in no filter, and counts in no aggregate.
  Adding a kind on either side should fail until both sides know about it.
- **A structural change that moves a person needs its own kind.** When a board is
  reconfigured and everyone standing on a removed stage is relocated, that is not an
  advance and not a move: nobody chose anything about *this* candidate. Borrowing a
  decision kind for a structural event puts a decision in the trail that nobody made.
- **Sparing someone is also a decision about them.** A machine that declines to act — an
  excluded holdout, a suppressed outreach, a refused automated rejection — has made a
  machine decision about that person, and it belongs in the operator's trail with an
  attribution, even where it is deliberately invisible on the candidate's side.

## Retention and the seams

Hold decision records to the longest of: the statutory floor for employment records in
each jurisdiction you hire in (commonly a year or more from the decision or the position
being filled), the floor emerging in automated-decision regimes (commonly six months of
system logs, often longer in practice because the decision record is not the same artifact
as the system log), and the limitation period for the claims those records defend. When a
claim is filed or reasonably anticipated, deletion stops entirely for the affected
records, including automated expiry — a scheduled sweep that quietly destroys evidence
during a live dispute is the worst possible fact pattern, and the sweep's own suppression
must itself be recorded.

Three seams bound this subject, and naming them is part of the craft:

- **What the candidate is shown** is a different artifact with different rules. The
  operator dossier holds rationale text, snapshotted payloads and chain hashes; none of
  that crosses to the candidate. The candidate gets an explanation calibrated to what the
  record actually holds — the disclosure-and-explanation seam owns that side, and the
  boundary is enforced in code, not in convention, because the one-line convenience of
  reusing the internal rationale string as the candidate-facing message is how internal
  scoring language ends up in a claimant's exhibit.
- **What survives an erasure request** belongs to the consent-and-retention seam, whose
  legal-claims carve-out is what keeps these very records alive through a scrub. Your job
  is to make the surviving record *minimal enough to justify keeping* — which is another
  argument for decisive inputs over full payloads.
- **Provider telemetry, cost metering and request tracing** belong to the general
  model-observability practice, not here. A trace identifier may ride inside a sealed
  record as a pointer for engineers; it is not the audit record, it is retained on a
  different clock, and it must never be the only place a decision's basis exists.

## A field nobody reads back is not traceability

The most deflating audit finding is the one that looks like success: fields dutifully
sealed for a year, and no surface anywhere that renders them. Nobody noticed, because
sealing is where the effort feels spent. But an audit artifact is only as good as its
read path — a reader who cannot see a field cannot rely on it, and a field never read is
a field never validated, which means it is quietly wrong. Ship the read-back with the
seal, always, and treat a sealed field with no production reader as a defect of the same
severity as a missing field.

Reading back forces a second discipline: **scope the honest absence.** "Not recorded"
must render only where the field could legitimately have been recorded. A record kind
that never carried a rule version should say nothing rather than announce a gap — a
"not recorded" banner on a decision the field never applied to manufactures a compliance
hole that does not exist, and a reader cannot tell your invented gap from your real ones.
Distinguish the states explicitly: *recorded*, *not recorded although it should have
been*, *does not apply here*, and — for records predating the field — *written before
this was captured, for one of these named reasons*. An empty shell that collapses those
into one blank is worse than any of them.

## The measurement that tells you the record is real

Two numbers, checked periodically, distinguish a working audit surface from a decorative
one. First, **attribution completeness**: the share of consequential decisions whose actor
resolves to a named person or an explicit automated process rather than *not identified*.
A rising unidentified share is a code path that learned to write without attributing.
Second, **override visibility**: the share of machine recommendations that were changed by
a human. This number is only computable if the machine's verdict was sealed before the
human's action — and it is the number every regulator asks for, because an oversight step
with an override rate indistinguishable from zero is a signature block, not oversight.
A system that cannot compute it has, in effect, no evidence of human oversight at all.
