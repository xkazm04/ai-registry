---
layer: golden-path
type: golden-path
subject: hiring-need-as-structured-brief
status: forged
use_when: [designing the record a role intake must produce, a requisition arrives as prose and has to become data, deciding whether a role is defined enough to open, auditing where a requirement came from]
techniques:
  - graded-requirements-two-axes
  - per-field-provenance-stated-inferred-default
  - minimal-spine-with-open-facets
  - source-turn-traceability
  - merge-that-never-regresses-a-stated-value
  - promote-readiness-gate
---

# The hiring need as a structured brief

A role intake produces two things, and only one of them is durable. The
conversation is the instrument; the **brief** is the artifact. This subject is
about the artifact: what a hiring need has to capture beyond an advertisement,
and how each value in it earns the trust that a downstream decision will place
on it.

That second clause is the whole subject. A brief is not a document people read
once. It is the input to a search query, a screening rubric, an interview
loop's axes, a comparison of finalists, a pay band, and — when a rejection is
challenged months later — the account of what the job actually required. Every
one of those consumers treats the brief as *given*. So a value in the brief is
never merely present or absent; it is present **at some grade of trust**, and
the grade has to travel with it. A brief that stores what was decided but not
how firmly, or by whom, hands every downstream stage a set of confident
assertions of unknown origin, and every one of those stages will act on them
at full strength.

The sibling subject **role intake conversation** owns the elicitation craft —
laddering a hard requirement, reflections that expand rather than confirm,
what to do when the requestor contradicts themselves, how many turns the
session gets. It ends where the transcript ends. This subject begins there: it
governs the shape of the record, the trust model over its fields, how records
merge across turns and sessions, and the gate that decides when the need is
defined enough to act on. The two are designed against each other — a good
question that lands in a field with no room for its answer has been wasted,
and a field the conversation never reaches must render as *unreached*, not as
a value.

## An advertisement is a rendering of the brief, never the brief

The default artifact of intake in most organisations is a job description, and
it is the wrong record for three structural reasons.

It is **lossy exactly where decisions are made.** An advertisement states
requirements as a flat list under two headings. It cannot say that one item is
a licence without which the person cannot legally start, and the next is a
tool the team would happily teach in a fortnight, though both sit under
"required". It cannot say that the eight-year figure was a guess the requestor
volunteered and then softened, while the on-site day is contractual. The
decisions downstream — who to surface, what to probe, who to advance — turn
precisely on those distinctions, and the advertisement has thrown them away
before the first candidate arrives.

It is **additive in the other direction.** Copy adds inviting language,
aspirational scope, and requirements imported from a template nobody defended.
An advertisement is a persuasion artifact and it is right to be one; but a
persuasion artifact must not be the evidentiary one, because you cannot later
distinguish what the hiring manager needed from what the copywriter added.

And it is **unqueryable and unauditable.** Prose cannot be diffed across
versions, cannot carry per-item provenance, and cannot answer "who asked for
the degree requirement, and in which sentence".

The correct relationship is one-way: the brief is the record, the
advertisement is one rendering of it, and so is the search query, and so is
the scorecard. Renderings may drop things. The record may not.

## Each value states what it is, how much it matters, and who says so

A field in a hiring brief is not a scalar. Treat every entry as carrying three
things, and the failure modes of the naive reading fall out immediately:

- **The content** — the requirement, the constraint, the outcome.
- **The grade** — whether its absence disqualifies, whether the person must
  arrive holding it, and how heavily it weighs against its peers. Flat
  must/nice is one bit where two independent axes exist; see
  [graded-requirements-two-axes](techniques/graded-requirements-two-axes.md).
- **The basis** — whether the requestor stated it, whether the system inferred
  it and with what confidence, or whether it is a schema default that nobody
  has yet touched; see
  [per-field-provenance-stated-inferred-default](techniques/per-field-provenance-stated-inferred-default.md),
  and its companion, the pointer back to the exact moment it entered the
  record ([source-turn-traceability](techniques/source-turn-traceability.md)).

Losing the grade produces a rubric that treats a legal prerequisite and a
pleasant-to-have as the same gate. Losing the basis produces something worse:
a brief in which the model's plausible guess and the manager's explicit demand
are typographically identical, so a reviewer skimming for errors cannot tell
which lines are theirs to defend. The moment those two are indistinguishable,
the review that was supposed to catch invented requirements catches nothing —
because everything looks equally stated.

Three states are the minimum, and the third is the one teams try to drop.
*Stated* and *inferred* feel sufficient until you notice that an untouched
schema default — a seniority the form initialised to its middle value, a work
mode nobody raised — is neither. Collapsing defaults into either of the other
two is the domain's most common quiet lie: a default filed as stated invents a
requirement the requestor never uttered; a default filed as inferred claims a
reading of evidence that never happened. An unfilled field must render as
unfilled, which is the general form of
[absence of evidence is not evidence](../_laws.md#absence-of-evidence-is-not-evidence).

## A minimal spine, because needs vary too much for a fixed form

The instinct after seeing a few bad briefs is to build a comprehensive form.
It fails on contact with the second role. A field-service technician, a
clinical lead, a first commercial hire in a new market, and a backfill on a
platform team have almost nothing in common in *what makes them hard*; the
form that fits one carries twenty empty boxes for the next, and empty boxes
are not neutral — they train the requestor to fill them with noise and they
tempt the extractor to fill them with inference.

The stable answer is a **small spine plus open facets**: a handful of fields
that exist for every role in the world (a title, a seniority reading, a
location and work mode, graded requirements, success criteria) and an open
key–value space for everything that matters about *this* need — why now, what
the urgency is, the budget band, what the first ninety days must produce, the
story behind a dealbreaker, the working environment. Facets carry their own
importance grade rather than a fixed schema position, and their key vocabulary
is a *suggestion* that shapes extraction without closing the set. The design
and its decision rules are in
[minimal-spine-with-open-facets](techniques/minimal-spine-with-open-facets.md).

The open half is what makes the routing rule necessary, and the routing rule
is the single most expensive lesson in this subject.

## Conditions are rows; facets carry only the story around them

When an intake system has both a requirements list and a free-form facet
space, prose flows to the facet space. It is easier to write, it reads well,
and the requestor's own words fit there without transformation. The result,
observed in live sessions and not in theory, is a brief whose facets are rich,
articulate and complete — and whose requirements list is **empty**. The
downstream rubric derived nothing. The panel had no axes. The reviewer opened
the brief, saw paragraphs, and approved it. And a promotion gate that checks
for structured content refused to open the role while the requestor could see,
plainly, that they had answered everything.

The rule that prevents it is mechanical and admits no judgement call:

> The moment a condition is named, it becomes its own row in the structured
> list — one row per condition, at the instant it is said. A stated outcome
> for the first ninety days becomes a success-criteria entry. Facets carry the
> *story around* a condition — why it exists, what it cost last time, how
> negotiable it feels — never the condition itself.

"They must have the licence, because the last hire couldn't sign off and we
lost a quarter" is two writes, not one: a requirement row for the licence, and
a facet holding the reason. Storing it once, as prose, in the place where
prose is welcome, is how a brief becomes eloquent and useless.

## A non-answer is never data

Intake conversations are full of turns that produce no value: a question
skipped, a question declined, "I don't know yet", "ask the team lead". Each of
these must leave the field in its unfilled state. Writing "no" for a declined
question, or a neutral middle value for a skipped one, manufactures a
requirement out of a silence — and the manufactured value is indistinguishable
from a real one three weeks later, when it is being defended in a debrief.

The same discipline governs answers that do not fit the schema. When a
requestor answers a seniority question with an internal pay-grade band name,
the honest record stores that answer **verbatim**, as a stated grade label,
and leaves the enum unset. Force-mapping it onto the nearest enum value
fabricates a stated seniority the requestor never expressed, and it does so
with the enum's full authority downstream —
[meaning does not live in a label](../_laws.md#meaning-does-not-live-in-a-label).
The verbatim capture keeps the information; the unset enum keeps the honesty.

## A brief accretes, and trust only moves one way

Briefs are not written once. They grow turn by turn during a session, they are
edited by hand afterwards, they are re-opened when the need changes, and
sometimes a second extraction pass runs over the same transcript. Every one of
those is a merge, and the merge rule is the brief's integrity condition:
union the content, and **never let a stated value regress to an inferred or
default one**. A later pass that is less certain does not get to overwrite an
earlier certainty; a re-extraction that missed what a human confirmed does not
get to erase it. Manual edits flow the other way and flip only what actually
changed to *stated* — editing one requirement does not launder the six
untouched ones into confirmed status. The mechanics are in
[merge-that-never-regresses-a-stated-value](techniques/merge-that-never-regresses-a-stated-value.md).

Eventually the brief stops moving: once it has been promoted into an open
role, the record that decisions were made against is frozen, and further
change is a new version rather than an edit in place. A brief that keeps
mutating after candidates have been screened against it destroys the only
defence the organisation has — that this is what the job required *at the time
the decision was made*.

## The gate: defined enough to act on

The last thing a brief owes is an honest answer to "is this ready?". Readiness
is not completeness — most fields will legitimately stay unfilled — but there
is a floor below which the artifact cannot support any downstream decision. A
practical floor: an identified role, plus at least one hard condition or one
concrete outcome for the first months. A title alone is a wish. See
[promote-readiness-gate](techniques/promote-readiness-gate.md).

Note the interlock: the gate reads structure, so the routing rule above is what
makes the gate satisfiable at all, and the non-answer rule is what stops it
being satisfied by silence. Three rules, one mechanism — and because the
routing fix is probabilistic while a false refusal lands on a requestor who did
answer everything, the gate is also taught to find its substance in the second
home, by key and never by prose.

## Where this subject stops

Storage, access control, who may see a budget band, versioning infrastructure
and the durability of the record belong to general engineering practice, not
to hiring craft; this subject asserts only that the record must be versioned,
attributable and freezable, not how. The behaviour of the extraction model
itself — routing, cost, latency, degraded runs, evaluating one model against
another — belongs to general practice for language-model systems. What stays
here is the hiring judgment wearing those clothes: which values are
consequential enough to need a basis, why an unfilled field may not be filled
by a model's confidence, and what a brief must hold before a person's
application may be judged against it.

## Failure modes this standard exists to prevent

- **The eloquent empty brief** — rich facet prose, zero structured
  requirements, nothing for a rubric or a panel to inherit.
- **The laundered default** — a schema default read downstream as a stated
  requirement, defended by people who assume a human chose it.
- **Flat must/nice** — a legal prerequisite and a teachable tool weighted
  identically, producing a screen that rejects on the wrong axis.
- **The forced enum** — an out-of-vocabulary answer snapped to the nearest
  allowed value, inventing a stated fact with full downstream authority.
- **Silence as an answer** — skipped and declined questions written as
  negatives or neutral values.
- **The regressing merge** — a second pass overwriting confirmed content with
  a less certain reading.
- **The orphan requirement** — a condition nobody can trace to a moment, which
  therefore cannot be defended or removed.
- **The living brief** — a record still being edited after candidates were
  measured against it.

## The techniques

- [graded-requirements-two-axes](techniques/graded-requirements-two-axes.md) —
  what a requirement does to a decision, and how much it weighs; why lifting a
  flat list into that grid is a default and not a judgement.
- [per-field-provenance-stated-inferred-default](techniques/per-field-provenance-stated-inferred-default.md)
  — the three-valued basis on every field, confidence on inference only, and
  what each value licenses downstream.
- [minimal-spine-with-open-facets](techniques/minimal-spine-with-open-facets.md)
  — the fixed handful, the open key–value space with its own importance grade,
  the suggested-not-closed key vocabulary, and the routing rule between them.
- [source-turn-traceability](techniques/source-turn-traceability.md) — every
  entry carries the numbered moment it came from, on both the conversational
  and the manual path, and what that buys in review.
- [merge-that-never-regresses-a-stated-value](techniques/merge-that-never-regresses-a-stated-value.md)
  — union semantics, monotone trust, edit provenance, and the freeze.
- [promote-readiness-gate](techniques/promote-readiness-gate.md) — the floor
  that decides a need is defined enough to open, and why it must read
  structure rather than volume.
