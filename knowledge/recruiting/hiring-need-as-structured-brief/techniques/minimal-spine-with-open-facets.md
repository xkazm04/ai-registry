---
layer: technique
type: technique
subject: hiring-need-as-structured-brief
technique: minimal-spine-with-open-facets
status: forged
laws: [meaning-does-not-live-in-a-label, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [designing the schema a role intake writes into, a fixed intake form fits no role well, facet prose is rich but the requirements list is empty]
---

# A minimal spine with open facets

Hiring needs vary too much for a fixed form. The field-service technician, the
clinical lead, the first commercial hire in a new market and the platform
backfill share a title field and almost nothing else about *what makes each one
hard*. A comprehensive form built for one of them carries twenty dead boxes for
the next — and dead boxes are not neutral: they teach the requestor to produce
filler, and they invite an extractor to fill them with inference nobody asked
for.

The shape that survives contact with real intake is a **small spine plus an
open facet space**.

## The spine

Four or five fields that exist for every role anywhere: an identifying title, a
seniority reading, a location and work mode, the graded requirements list, and
the success criteria for the first months. That is close to the whole
defensible universal set. Everything else people want to standardise — team
size, reporting line, tooling, shift pattern, travel — is universal only within
one organisation's habits, and putting it in the spine exports those habits as
if they were the domain.

The spine's scalars are the most dangerous fields in the record, because a
schema must initialise them to *something*. Each one starts at `default` and
must render as not-established until someone says otherwise; a seniority enum
sitting at its middle value is not a reading of the role, it is the form's
resting position.

## Facets

Everything else is a key–value entry with three parts: a key, the content, and
an **importance grade** — a small closed vocabulary along the lines of *core*
(a facet that shapes whether this hire succeeds), *valuable* (materially
useful for search, pitch or interview design), and *context* (worth knowing,
drives nothing). The grade is what stops the facet space becoming an
undifferentiated notes field: a downstream consumer can take the core facets
and ignore the rest without reading all of them.

Facet keys come from a **suggested vocabulary, never a closed one**. A handful
of recurring keys — why the role exists now, urgency, budget band, what the
first ninety days must produce, the story behind a dealbreaker, the working
environment — earns its keep twice: it shapes an extractor toward the questions
that matter, and it makes facets from different briefs comparable when they do
happen to align. But an intake that surfaces something the vocabulary does not
name must be able to write it under a new key. A closed facet set is just a
fixed form with extra ceremony, and it fails the same way.

Keys are a convenience, not a meaning: two briefs using the same key may mean
different things by it, and analytics built on facet keys across roles will
find that out expensively —
[meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label).
Facets are for the brief they belong to.

## The routing rule between the two halves

This is the technique's load-bearing rule, and it exists because of a
repeatedly observed failure rather than a theory. When both halves exist,
prose flows to the facet half — it is easier to write, it preserves the
requestor's own words, and it reads beautifully. Live sessions produce briefs
whose facets are articulate and complete and whose requirements list is
**empty**: nothing for a screening rubric to inherit, no axes for a panel, and
a readiness gate that refuses to open a role the requestor is certain they
fully described.

The rule:

> A named condition becomes **its own row in the structured list, at the moment
> it is said** — one row per condition, never two conditions in one row, never
> deferred to the end of the session. A stated outcome for the first ninety
> days becomes a success-criteria entry. Facets carry only the **story around**
> a condition — why it exists, what its absence cost last time, how negotiable
> it feels, who imposed it — never the condition itself.

So "they have to be on site Tuesdays, because that's when the floor walk
happens and the last hire never met the crew" is two writes: a requirement row
for the Tuesday presence, and a facet holding the reason. One write into the
facet space is the failure. One write into the requirements list loses the
reason that makes the requirement negotiable later.

The rule is mechanical on purpose. Any version of it that asks "is this
important enough to be a row?" reintroduces the judgement call the failure
exploits, and prose wins that call every time.

## Decision rules

- **When a condition and its rationale arrive in one sentence, split them.**
  The condition is a row; the rationale is a facet. Both, always.
- **When an answer does not fit a spine scalar's vocabulary, write a stated
  facet with the verbatim answer** and leave the scalar unset. The
  organisation's internal grade names, unusual contract shapes, and locally
  meaningful role labels all land here intact rather than being flattened into
  an enum that will be read literally downstream.
- **When a facet would be `core` and is also a condition, it is a row.** Core
  importance in the facet space is not a substitute for being a requirement;
  the two spaces feed different consumers.
- **When no facet applies, write none.** An empty facet space is a truthful
  brief about a simple need;
  [absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)
  cuts against filling it to look thorough as much as against inventing
  scalars.
- **When the same key recurs with different content across turns**, keep both
  entries rather than overwriting — the requestor elaborating is not the
  requestor correcting, and the merge technique decides which is which.

## When not to use this

- **When every role in scope genuinely is the same role.** High-volume hiring
  for one standardised position is the one case where a fixed form beats a
  spine plus facets — the variation the open half exists to absorb is not
  there, and the extra structure only adds ways to be inconsistent.
- **When the facet space is being used to avoid designing the spine.** If
  three-quarters of briefs carry the same facet key at *core*, that is not an
  argument for open facets; it is the spine telling you it is missing a field.
  Promote it, and accept the migration.
