---
name: case-interaction-documentation-upkeep
version: 0.1.0
status: seed
domain: customer_support
path: customer_support/ticket-handling
---

# Case interaction record upkeep

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A case record fails in two directions and both of them look like diligence.
Written up in full, it becomes a transcript nobody reads, so the one sentence that
decides the next step, that the provider will only send the form by fax or that this
office answers before noon, is buried among pleasantries. Written up as a tidy summary,
the commitment made on the call disappears, and the next handler telephones to ask a
question that was already answered, which is paid for in the client's patience rather
than in anyone's time. In both cases there is an entry against every contact and the
case still does not move.

**Input.** What was actually said or done in the interaction and by whom, what the
record already claims about the case, what the case is currently waiting on to progress,
and what each party is expected to do next.

**Core action.** Decide which parts of an interaction change what the next handler will
do, a commitment made, a fact that contradicts what the record says, a constraint on how
or when someone can be reached, a document now expected from a named party, and state
each one so it can be acted on by a person who did not hear the conversation,
deliberately leaving out the rest.

**Output.** A record whose next step is legible cold: what is outstanding and who owes
each item, the commitments made and the dates attached to them, the corrections to what
was previously believed with the old claim visible as superseded, and an explicit note
of what was asked and not answered. An interaction that changed nothing still leaves a
short dated entry saying contact was made and nothing changed, because an absent entry
is read as an absent attempt.

## Activities

1. Read what the record already claims and what the case is waiting on *(observe)*
2. Capture what happened in the interaction and who said each part of it *(observe)*
3. Decide which parts change what the next handler does, and leave the rest out
*(decide)*
4. Reconcile what was heard against what the record and the submitted paperwork already
say *(decide)*
5. Write the entry so it can be acted on by someone who did not hear the conversation
*(act)*
6. Flag what is still missing, which named party owes it and by when *(act)*
7. Leave the case's next step and its owner stated, including when nothing changed
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Another handler can pick the case up without having been there and without contacting
the client or the provider to find out where things stand.**

- Every entry leaves the case's next step and the person who owns it stated, so reading
  the last entry is enough to act.
- Each recorded fact carries where it came from, since what a client reported, what a
  provider confirmed and what a document shows carry different weight, and a record that
  merges the three cannot be relied on by anyone who was not there.
- A commitment carries who made it and by when, because an undated promise is
  indistinguishable from an intention.
- What a party said about a document is recorded as what they said, not as the
  document's contents, and the difference stays visible until the document itself
  arrives.
- A conclusion the handler reached rather than heard is labelled as inferred, so the
  next person can revisit it instead of building on it.

**The record stays short enough that the next handler actually reads it before acting.**

- An interaction that changed nothing produces a short dated entry rather than a
  transcript, and a busy day of such contacts does not bury the one entry that changed
  something.
- Information already in the record is confirmed or corrected with a date rather than
  restated, so the same fact does not appear five times with five wordings and no way to
  tell which is current.
- A correction supersedes the earlier claim rather than sitting beside it, and the
  earlier claim remains visible as superseded instead of being removed, because a fact
  that quietly vanishes cannot be told from one that was never recorded.
- Wording is quoted verbatim only where the exact words are themselves the fact, such as
  a refusal, an authorisation or a disputed instruction.
- Something shared in the conversation that the case does not need is not written down
  at all, since recording more than the case requires is a harm rather than
  thoroughness.

**What the case is blocked on is stated as a named party and a date, not as a state of
affairs.**

- A question asked and not answered is recorded as unanswered rather than omitted,
  because an omitted question is asked again by the next handler.
- A block names who owes the item and when it was requested, so the next action is a
  follow up with somebody rather than a general note that something is awaited.
- An attempt that failed, an unanswered call or a message left, is recorded as an
  attempt, since a case with no entries and a case where nobody could be reached demand
  different next steps.
- A case waiting on nothing and nobody is stated as ready to progress rather than left
  looking like a case that stalled.

## Guidance

Ask one question of everything you heard: does it change what the next person will do. A
commitment, a contradiction, a constraint on reaching someone, a document now expected,
those go in with their source and a date. Sympathy, small talk and detail the case does
not need stay out, and leaving them out is the skill, not a shortcut. Say who owes what
and by when rather than that something is awaited. Write the entry even when nothing
changed, because a silent case reads as a case nobody worked.

## Where this is worth adopting

- A caseload shared across a rota where whoever is on shift takes the call, so every
  entry is written for a stranger even when the writer expects to keep the case.
- A part time or split coverage arrangement, where the person who takes the provider's
  return call is reliably not the one who made the request.
- An application or claim that fails on stale information, where the address or the
  coverage detail in the record was true when it was written and nobody marked when that
  was.
- A team whose notes have grown into transcripts, so handlers have quietly stopped
  reading them and now telephone the client to find out what the record already says.
- A case heading into review or appeal, where what can be shown is limited to what was
  written down at the time and a tidy summary turns out to have dropped the commitment
  that mattered.

## Connector types

`crm`, `support`, `documentation`, `storage`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`event`. The interaction is the occasion, and the material detail is at its most
complete the moment it ends and decays quickly afterwards. Batching the write up to the
end of a shift loses exactly the constraints and the offhand commitments this work
exists to keep, and it leaves a window in which the next handler can reach the case
before the record does. Nothing here is periodic and nothing waits for a convenient
time.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What counts as material in this casework, because which facts decide the next step is
  specific to the process being worked and a general rule produces either transcripts or
  summaries.
- What the record is used for downstream, an application, a review, an audit or an
  appeal, since that decides which facts must be attributable to a source and which may
  be summarised.
- What must not be recorded at all, because some categories of what a person shares are
  sensitive enough that writing them down is itself the harm, and only the adopter knows
  the rules that bind them.
- The case states and vocabulary this team already uses, so an entry lands in the
  language the next handler is scanning for rather than beside it.
- How long a recorded fact stays trustworthy here, since that is what separates relying
  on the record from confirming it again, and it differs by the kind of fact.

## Dependencies

None.
