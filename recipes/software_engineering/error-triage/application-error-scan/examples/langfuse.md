# Langfuse as the `monitoring` connector

What was learned mapping this recipe onto Langfuse specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**It resolves to the type and it is usually the wrong binding, which is worth saying at
adoption rather than discovering on the first run.** Langfuse carries the monitoring
category, so an adopter picking a monitoring connector will be offered it, but its series
are model call traces rather than application exceptions. A scan bound here reports a
clean window while the application is on fire, because the application never emitted
anything into it.

**Where it is the right binding, the failure vocabulary is different and the recipe's
words have to be remapped.** There is no unresolved state and no human triage transition
to read. The failures worth surfacing are traces with an error status, refusals, schema
validation failures on structured output, and cost or latency outliers. "New, escalating
or regressed" still applies; "unresolved" does not, and a scan that looks for it finds
nothing every time and reports that as clean.

**Grouping has to be constructed rather than read.** There is no fingerprint here. The
unit this recipe treats as a signature has to be built from the trace name plus the model
plus the error kind, and it has to be decided once at adoption. Grouping by the model
output text produces one group per call and nothing ever crosses a floor.

**Reach means something else.** Distinct users may not be recorded at all, and where they
are it is because the caller chose to attach a user id. Rank on the share of calls to one
trace name that failed rather than on people affected, and say which denominator was
used, because a trace called twice that failed once is not a fifty percent failure rate
worth reporting.

## What transfers to any monitoring connector

- A connector resolving a type is not evidence it carries the data the recipe needs;
  check that the series is the one being reasoned about.
- Where the provider has no grouping of its own, the signature is a choice made once at
  adoption, and choosing it badly is silent.
- A rate needs its denominator stated, and a denominator of two is not a rate.
