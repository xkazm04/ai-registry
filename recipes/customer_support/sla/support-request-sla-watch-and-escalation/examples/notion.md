# Notion as the `knowledge_base` connector

What was learned mapping this recipe onto Notion specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The log is the deliverable, so a failed write is a lost finding.** Everything downstream
of this recipe reads the escalation log rather than the queue, and a log with holes produces
pattern work that is confidently wrong about which period was bad. Write locally first and
reconcile into Notion, rather than treating the Notion write as the record: a page that was
never created is indistinguishable from a period in which nothing was escalated, and this
recipe explicitly promises those two are distinguishable.

**Near misses have to be logged as near misses, or the log only describes failures.** A
request warned about inside its risk window and then answered in time is the case this
recipe is for, and it is invisible if only breaches are written. Give the row a field for
what the warning led to, because a log of breaches alone can never show that the warning
worked.

**Timestamps in Notion are wall clock, and this recipe does not measure in wall clock.**
A row recording that a request breached after six hours is ambiguous unless it also records
which clock those six hours were counted on and how much of the elapsed time was stopped.
Store the promised clock and the stopped duration as their own properties rather than
folding them into the elapsed figure, since folding them in is exactly how the attainment
number stops matching the customer's experience.

**Reading the log back is paged and rate limited, which shapes how patterns are found.**
Pattern work over a wide window will not complete in one read. Keep the fields a pattern
pass needs (requester, cause, clock, outcome) as properties it can filter on rather than as
prose in the page body, because filtering server-side is the difference between a pass that
finishes and one that is abandoned.

## What transfers to any knowledge base used as a log

- The log is written locally first and reconciled outward, or a failed write reads as a
  quiet period.
- Log the near misses, not just the breaches, or nothing can show the early warning worked.
- Store the qualifiers as their own fields; an elapsed number with its clock folded in is
  the thing this recipe exists to stop.
