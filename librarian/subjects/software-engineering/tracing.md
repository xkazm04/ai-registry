---
subject: tracing
domain: software-engineering
last_touched: 2026-09-03
touched_by: intake
dry_streak: 0
---

# tracing

Touched by [[2026-09-03-awesome-langchain]]. Gained `vocabulary-source-selection`.

## What the gap actually was

A **missing stage sitting between two bundles**, which is why no slug map could find it
and why the instrument reported a near-empty that read like a hole.

Three observability subjects each explicitly defer builder-side emission to this one.
This one requires the span schema live in "one authority" — which is right — and never
entertains that the authority could be an **external published convention** rather than
a house schema. So the decision was made by default because nobody asked, and the forces
were absent from the corpus entirely: portability of dashboards and backends, bought
against the churn of a pre-stable vocabulary whose attribute names move on someone
else's release schedule.

The discriminator is not builder-versus-receiver, which is the proxy the neighbouring
observability technique used. It is **who controls both ends of the version skew** —
which is why an emitter shipped as a *library* pins neither the clients it wraps nor the
backends it feeds, and needs a receiver's multi-generation machinery despite sitting on
the emitting side.

## What a project then added

A civic tree returned `better` and supplied the case the discriminator cannot reach.
Where an unmatched attribute **leaks a value** rather than breaking a query, name-based
matching is fail-open by construction — an attribute spelled differently this version is
one the matcher has never heard of and passes through untouched — so the right answer is
to depend on neither vocabulary and match on value shape instead. That is now its own
section, and the failure directions are explicitly not comparable: an over-redacted
field costs a debugging session, an under-redacted one is disclosed and cannot be
recalled.

The same tree supplied the second decision rule: assert against the package the
application actually loads. Its one borrowed-spelling instrument is calibrated against a
transitive dependency it does not declare, under a caret range on a different package,
so the version can move without a deliberate act while the assertion still passes.

## Open

Nothing owns the emitter-side redaction surface itself — banked as a lead, with a
well-enumerated instance available when that ground is opened.
