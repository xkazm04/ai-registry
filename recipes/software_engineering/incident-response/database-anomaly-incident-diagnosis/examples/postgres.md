# PostgreSQL as the `database` connector

What was learned mapping this recipe onto PostgreSQL specifically. Nothing here is part
of the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**What to capture, and in what order, because everything useful is a view of now.**
The activity view is the centre of it, and it has to be captured with the fields that
carry time rather than only the query text: what state each session is in, what it is
waiting on, when its transaction began, when its current statement began, and when its
state last changed. A capture that keeps only the query text records what was running and
loses the thing that decides the diagnosis, which is how long it has been running and
what it is blocked behind.

**The blocking chain is reported one hop at a time.** The function that names what is
blocking a session returns its direct blockers only, so in a cascade it names the middle
of the chain rather than the start. Walk it until it reaches something that is blocked by
nothing, and expect the root frequently to be a session that is idle inside an open
transaction: it is doing no work, consuming no time, and holding everything. A capture
that ranks sessions by cost never shows it.

**Newer versions record when each lock wait began.** Where that is available it orders the
cascade rather than leaving the order to be guessed from arrival, and it is worth
capturing for that alone.

**Two things that read as diagnosis and are not.** Running the suspect statement with
timing on actually executes it, which during a contention incident makes the incident
worse; describe the plan instead, and say so in the escalation. And refreshing statistics
during an incident changes plans across the whole database, which converts an incident
into a different incident and destroys the comparison the diagnosis rests on.

**Reading the lock view is not unconditionally free.** Under the extreme lock counts that
accompany exactly this kind of incident it can allocate heavily. Capture it, but treat it
as a cost, take it early, and do not loop on it.

**Terminating a session is mitigation, and it belongs after the capture.** When it
happens it names one specific session, with a record of who decided and why, rather than
sweeping a class of them.

## What transfers to any database connector

- Ask which of the sources are views of the present instant, because those are the ones a
  restart erases and the ones that have to be captured first.
- A chain-following function that returns direct relationships needs to be walked, and the
  interesting answer is at the end of the walk.
- Anything that runs the suspect work, or that changes how work is planned, is not
  diagnosis; it is an action taken during an incident.
