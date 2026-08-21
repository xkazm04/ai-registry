---
layer: golden-path
type: golden-path
subject: requisition-lifecycle-governance
status: forged
use_when: [designing the states a role moves through, deciding who may open or close a role, importing an external advertisement into a hiring system, a filled role is still counted as open, deciding what publishing a role actually does]
techniques:
  - draft-live-and-closed-as-distinct-states
  - headcount-approval-as-a-precondition
  - publish-means-two-different-things
  - ingest-as-draft-never-as-live
  - best-effort-ingest-with-an-explicit-retry
  - closing-withdraws-candidates-in-flight
---

# Requisition lifecycle governance

A requisition is not a document. It is a **permission with a state**: the
organisation's record that this role may be worked on, by whom, from when, and
until what event. Everything else about the role — the brief it carries, the
requirements it demands, the language of its advertisement, the board its
candidates move along — belongs to a sibling. This subject owns the far duller
and far more load-bearing question: *what state is this role in, and who is
entitled to move it out of that state?*

The reason it is load-bearing is that every other artifact in hiring hangs off
the answer. A sourcing query is legitimate because the role is live. A rejection
is defensible because the role existed under a stated brief at the time. A
recruiter's dashboard is honest because the roles it counts are the roles that
are genuinely open. Remove the state layer and none of those statements can be
made — you have a folder of job descriptions and a set of habits.

Teams discover this subject by accident, usually in one of two ways. Either
someone sources, screens and rejects against a role that was never approved and
does not have budget, and the offer cannot be made; or a role gets filled,
nobody closes it, and a year later the open-requisition count is a number
nobody trusts. Both are governance failures, and both are cheap to prevent and
expensive to unwind.

## Three states, and the third is the one people forget

The minimum honest lifecycle is **draft → live → closed**, and each state is a
different set of permissions, not a different label on the same thing.

**Draft** is a role that exists as a record and does not exist to the world. It
may be edited freely, it may be incomplete, and — this is the part teams get
wrong — *nothing may be sourced against it*. No candidate may be attached, no
outreach sent, no application accepted. A draft is a workspace.

**Live** is the only state in which the role consumes attention: it is visible
to the people entitled to see it, candidates may enter it, and its pipeline is
real. Entering this state is the consequential transition, and it is the one
that deserves a gate — the substance of the brief, the approval behind the
headcount, the minimum quality of the advertisement.

**Closed** is the state teams skip, because nothing appears to break when they
do. The role is filled, or cancelled, or frozen; the hiring manager stops
thinking about it; there is no moment that forces anyone to record the fact.
And so the record stays live for ever, and it quietly poisons every metric that
counts open requisitions: the open-role count, the recruiter load, the aging
report that flags nothing because everything is old, the time-to-fill average
whose denominator includes roles that were filled two quarters ago. A metric
contaminated this way does not look broken — it looks like a business with a
lot of open roles — which is why the corruption survives for years. The closed
state exists so that "how many roles are we hiring for" has an answer that is
true. See
[draft-live-and-closed-as-distinct-states](./techniques/draft-live-and-closed-as-distinct-states.md).

Closed is a state, never a deletion. The record of a role that ran, and of the
people judged against it, is exactly the record you need when a decision is
challenged. Deleting a requisition destroys the defence for every rejection
issued under it.

## Every transition names its actor, and most transitions have a precondition

A lifecycle without entitlements is decoration. Each edge in the state machine
carries two questions — *who may traverse it* and *what must be true first* —
and the answers differ by edge, which is why a single "role editor" permission
is always too coarse.

The transition into live is the one that carries real preconditions, and the
first of them is not a data-quality check at all: **headcount approval**. A
role is a spend commitment. Somebody with budget authority agreed to fund this
seat, for this period, at this band, and until that agreement exists the role
may be drafted and may not be opened. The craft here is standard and mostly
absent from hiring software: an approval chain with named approvers rather than
a boolean flag; a distinction between a **backfill** (a seat that already
exists in the plan because someone left it) and a **net-new** requisition (a
seat that expands the organisation, and therefore needs a different, usually
longer, chain); an attached budget or band, so that the offer at the end of the
process is one the organisation can actually make; and an expiry, because an
approval granted for a quarter is not an approval granted for ever. See
[headcount-approval-as-a-precondition](./techniques/headcount-approval-as-a-precondition.md).
The recurring, expensive failure is the role sourced, screened and interviewed
to final stage before anyone discovers there is no funded seat behind it —
which wastes the organisation's time and spends a great deal of several
candidates' time on an outcome that was never available to them.

The second precondition is substance: the brief must be defined enough to act
on, and the advertisement must clear a minimum quality floor before it can be
shown to anyone. Both belong to siblings — one owns the readiness of the
structured brief, another owns the language and inclusiveness of the
advertisement and the lint that enforces a minimum body of real content. This
subject's contribution is only that these gates are attached to the *transition
into live*, and not to every save. A draft that is being written must be
allowed to be bad.

Whatever the preconditions, every traversal is a decision with an owner —
[every decision names its actor](../../_laws.md#every-decision-names-its-actor).
Who opened this role, who closed it, and when, are facts the record must hold,
because "the system closed it" is not an answer anyone can act on when a
candidate asks why their process stopped.

## "Publish" is two verbs wearing one word

Nothing in this subject causes more wrong actions than the word *publish*. It
means, in different rooms of the same organisation, two genuinely different
operations:

1. **Make the role visible** — flip it out of draft so that colleagues,
   internal applicants and the recruiting team can see and work it.
2. **Distribute the advertisement** — push it outward to job boards,
   aggregators, an external careers surface, a syndication feed.

These have different audiences, different reversibility, different costs and
different approvers. Internal visibility is instant and revocable. External
distribution costs money, propagates to systems you do not control, may be
cached and re-scraped after you withdraw it, and is often the point at which
the organisation is publicly committed to a compensation range. A single
control that does both performs the wrong one roughly half the time — someone
who wanted to let the team review a draft has just paid to advertise it, or
someone who thought they had advertised the role finds that no external
candidate ever saw it. Split the verb; name each action by what it does to the
outside world; and make the external one explicitly the second step. See
[publish-means-two-different-things](./techniques/publish-means-two-different-things.md).

## Importing an advertisement produces a draft, never an open role

Roles arrive from outside constantly: a manager pastes an advertisement from
another company as a starting point, a client sends a description, a team
migrates from another system, someone bulk-loads a page of postings. Parsing
that text into a structured requisition is a genuinely useful capability, and
it is also the most reliable way to fill a hiring system with roles nobody
approved.

The rule is unconditional: **an ingested role lands as a draft.** Not because
the parse might be wrong — though it will be — but because nothing in the
imported text is an approval. A third party's advertisement is evidence of what
someone else wanted to hire for; it is not a headcount decision by your
organisation, not a budget, not an owner. Landing it live skips every
precondition in one step, and does so at bulk-import scale. The corollary is
that the parse must be *shown before it is trusted*: a field-by-field
extraction preview, where the reviewer sees what was extracted into which
field and can correct it, rather than a summary and an "import" button. Split
bulk pastes into candidate records deliberately, guard against fragments too
short to be a real description, and treat a low-confidence extraction as an
unfilled field rather than a guess —
[absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence).
See [ingest-as-draft-never-as-live](./techniques/ingest-as-draft-never-as-live.md).

## Ingest is best-effort; publishing is not

There is a second, subtler split around ingest that only appears once a role's
description and its matchable index are separate stores. Saving a description
is the user's action and must always succeed. Indexing that description into
something the matching and search machinery can act on — call it ingest — is a
derived, failure-prone step: it may call a model, it may touch a service that
is down, it may hit a rate limit.

Wiring them together as one atomic operation makes a transient service failure
eat the user's work. Wiring them apart, naively, makes an unindexed role look
identical to an indexed one until the day someone tries to match against it.
The resolution is a discipline in three parts. Saving succeeds independently
and produces a durable draft. Ingest is attempted, allowed to fail, and its
failure is *visible as a state on the record* rather than a log line. And the
transition that actually depends on it — going live, being matched, being
advertised — refuses politely while the index is missing, naming the retry
rather than failing opaquely.

The retry is where the entitlement rule bites again. A scoped retry may
re-attempt ingest for a draft that exists; it may **never** mint a requisition
that has no backing draft. A retry path that can create is not a retry, it is
an undocumented second create path, and it will be used as one — by a
bulk-repair job, by an operator, eventually by a loop. See
[best-effort-ingest-with-an-explicit-retry](./techniques/best-effort-ingest-with-an-explicit-retry.md).

The same honesty applies to how the state is reported. "This role was never
indexed" and "this role is indexed and nobody has applied" are different facts
about the world, and rendering both as a zero tells the recruiter a role is
unattractive when it is in fact invisible. A null is not a zero; a missing
pipeline is not an empty one.

## Closing is an event that happens to people

The most common candidate-experience failure in this whole area is a close that
does something to the requisition and nothing to the humans attached to it.
When a role closes, there are people in its pipeline — screened, scheduled,
mid-interview, waiting on a decision — and the role closing means their process
has ended whether or not anyone tells them. If closing only flips a status on
the requisition, those people stay in an active stage on a dead role: they are
not rejected, so no decline is ever sent; they are not advanced, because
nothing is advancing; they simply wait, and then conclude they were ghosted.
They were.

So closing a requisition is a **cascade**, and it must be designed as one:
every candidate still in flight reaches a terminal outcome as part of the close,
attributed to the close rather than to a judgement about them, and the
communication that terminal outcome implies is queued rather than assumed. A
sibling owns what that reads like to the candidate — the settled answer is that
a closed requisition reads as *not selected* without implying anything about
their merit, because nothing about their merit was decided. This subject's
obligation is upstream of the wording: it is that the transition exists at all,
that it is atomic with the close, and that nobody is silently stranded —
[a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints).
See [closing-withdraws-candidates-in-flight](./techniques/closing-withdraws-candidates-in-flight.md).

A close must not be a one-way trap either. Roles are closed by mistake, and
freezes are lifted. Reopening therefore needs to be a **first-class inverse
transition** — deterministic, attributed, and complete — rather than a side
effect of opening the role again and letting the sourcing pass incidentally
revive whoever it happens to re-select. That incidental version is the worst of
both: the candidates the matcher no longer returns stay stranded in a terminal
state with a timeline that lies about why, and nothing records that a reopen
happened at all. What makes a clean inverse possible is the cascade writing a
**distinct** terminal outcome — one that only the close ever writes — so the
reopen can select exactly the people the close withdrew and nobody else. A
candidate a human rejected on the merits before the close carries a different
outcome and must stay closed; a reopen that undoes a human's judgement is a
worse bug than the one it fixes.

## Where this subject stops

The brief the requisition carries — its structure, its per-field provenance,
its readiness floor — belongs to the structured-brief sibling; this subject
only consumes that floor as a precondition. What the role is allowed to demand
belongs to the requirement-inflation sibling. The language of the advertisement
and the substance lint that gates it belong to the inclusive-advertising
sibling; this subject owns the fact that the lint is attached to the
go-live edge, not the lint's rules. Whether the role will fill at all belongs to
the fillability-forecast sibling. The stages inside a live requisition belong to
the pipeline-stage sibling. What a candidate sees when their role closes belongs
to the status-transparency sibling.

State machines, transactions, permission models, queues and delivery retries are
general engineering practice and are not re-derived here. What stays in this
subject is the hiring judgment inside those mechanics: that a role is a spend
commitment before it is a document, that visibility and distribution are
different acts, that an imported advertisement carries no authority, and that
closing a requisition is something that happens to people.

## Failure modes this standard exists to prevent

- **The immortal requisition** — filled months ago, still live, still counted,
  quietly wrong in every open-role metric.
- **The unapproved role** — sourced, screened and interviewed to final stage
  before anyone discovers there is no funded seat.
- **The one-button publish** — a control that means visibility to one user and
  paid external distribution to the next.
- **The live import** — a bulk paste of third-party advertisements that lands
  as open roles, bypassing every precondition at once.
- **The blind parse** — an extraction accepted without a field-by-field
  preview, so an invented requirement enters the record with the authority of
  a stated one.
- **The silent index failure** — a saved description that was never indexed,
  indistinguishable from one that was until a match returns nothing.
- **The creating retry** — a repair path that mints requisitions with no
  backing draft.
- **The zero that means nothing** — never-ingested and nobody-applied rendered
  as the same number.
- **The stranded pipeline** — a role closed, its candidates left in an active
  stage, no decline ever sent.
- **The unattributed close** — a role that ended with no record of who ended it
  or why, so nobody can answer the candidate who asks.

## The techniques

- [draft-live-and-closed-as-distinct-states](./techniques/draft-live-and-closed-as-distinct-states.md)
  — the three-state minimum, what each state permits, and why the closed state
  is what makes open-requisition metrics honest.
- [headcount-approval-as-a-precondition](./techniques/headcount-approval-as-a-precondition.md)
  — the approval chain, backfill versus net-new, the attached band, and the
  expiry.
- [publish-means-two-different-things](./techniques/publish-means-two-different-things.md)
  — internal visibility versus external distribution, and how to split one verb
  into two irreversible-by-different-amounts actions.
- [ingest-as-draft-never-as-live](./techniques/ingest-as-draft-never-as-live.md)
  — parsing a third-party advertisement, the extraction preview, bulk splitting,
  the minimum-length guard, and why the landing state is fixed.
- [best-effort-ingest-with-an-explicit-retry](./techniques/best-effort-ingest-with-an-explicit-retry.md)
  — the save/index split, the visible failure state, the polite refusal
  downstream, and the retry that may never create.
- [closing-withdraws-candidates-in-flight](./techniques/closing-withdraws-candidates-in-flight.md)
  — the close as a cascade, atomicity, attribution, and the honest-null rule for
  a pipeline that never existed.
